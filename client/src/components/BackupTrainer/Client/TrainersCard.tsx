"use client"

import type React from "react"
import { useState } from "react"
import { Phone, Mail, User, Calendar, X, CalendarCheck } from "lucide-react"
import { useSubmitTrainerChangeRequest } from "@/hooks/backuptrainer/useSubmitTrainerChangeRequest"
import { SubmitTrainerChangeRequestPayload } from "@/types/backuptrainer"
import { useToaster } from "@/hooks/ui/useToaster"
import { useNavigate } from "react-router-dom"

interface Trainer {
  id: string
  firstName: string
  lastName: string
  specialization: string[]
  profileImage: string
  phoneNumber: string
  email: string
  experience: number
  gender: string
}

interface TrainerSelectionData {
  selectedTrainer: Trainer
  backupTrainer: Trainer
}

interface TrainerCardsProps {
  data: TrainerSelectionData
}

const TrainerCards: React.FC<TrainerCardsProps> = ({ data }) => {
    const navigate = useNavigate()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [concernType, setConcernType] = useState("")
  const [reason, setReason] = useState("")
  const { successToast, errorToast } = useToaster()
  const { mutate: submitRequest, isPending } = useSubmitTrainerChangeRequest()

  const handleSubmit = () => {
    if (!concernType || !reason.trim()) return

    const payload: SubmitTrainerChangeRequestPayload = {
      backupTrainerId: data.backupTrainer.id,
      requestType: concernType === "Change" ? "CHANGE" : "REVOKE",
      reason: reason.trim(),
    }

    submitRequest(payload, {
      onSuccess: (response) => {
        successToast(response.message || "Concern submitted successfully!")
        setIsModalOpen(false)
        setConcernType("")
        setReason("")
      },
      onError: (error: any) => {
        const errorMessage = error?.response?.data?.message || "Failed to submit concern. Please try again."
        errorToast(errorMessage)
      },
    })
  }

  const handleCancel = () => {
    setIsModalOpen(false)
    setConcernType("")
    setReason("")
  }

  const handleBookSlots = () => {
    console.log("Book Slots clicked for selected trainer")
    navigate('/booking', { state: { trainer: data.selectedTrainer } })
  }

  const TrainerCard = ({ trainer, isBackup = false }: { trainer: Trainer; isBackup?: boolean }) => (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 h-full flex flex-col">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="relative inline-block">
          {trainer.profileImage ? (
            <img
              src={trainer.profileImage}
              alt={`${trainer.firstName} ${trainer.lastName}`}
              className="w-24 h-24 rounded-full object-cover border-4 border-gradient-to-r from-purple-400 to-pink-400 shadow-lg"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 border-4 border-gradient-to-r from-purple-400 to-pink-400 shadow-lg flex items-center justify-center">
              <User size={40} className="text-purple-500" />
            </div>
          )}
          <div className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-400 via-yellow-500 to-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md">
            {isBackup ? "Backup" : "Selected"}
          </div>
        </div>
        <h3 className="text-xl font-bold mt-4 bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 bg-clip-text text-transparent">
          {trainer.firstName} {trainer.lastName}
        </h3>
      </div>

      {/* Specializations */}
      <div className="mb-4">
        <p className="text-sm text-gray-600 font-medium mb-2">Specializations:</p>
        <div className="flex flex-wrap gap-2">
          {trainer.specialization.map((spec, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 text-xs font-medium rounded-full border border-purple-200"
            >
              {spec}
            </span>
          ))}
        </div>
      </div>

      {/* Contact Information */}
      <div className="space-y-3 mb-6 flex-grow">
        <div className="flex items-center gap-3 text-gray-600">
          <Phone size={16} className="text-purple-500" />
          <span className="text-sm">{trainer.phoneNumber}</span>
        </div>
        <div className="flex items-center gap-3 text-gray-600">
          <Mail size={16} className="text-purple-500" />
          <span className="text-sm">{trainer.email}</span>
        </div>
        <div className="flex items-center gap-3 text-gray-600">
          <User size={16} className="text-purple-500" />
          <span className="text-sm">{trainer.gender}</span>
        </div>
        <div className="flex items-center gap-3 text-gray-600">
          <Calendar size={16} className="text-purple-500" />
          <span className="text-sm">{trainer.experience} years experience</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-auto">
        {!isBackup ? (
          <button
            onClick={handleBookSlots}
            className="w-full px-6 py-3 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:from-green-600 hover:via-emerald-600 hover:to-teal-600 transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
          >
            <CalendarCheck size={18} />
            Book Slots
          </button>
        ) : (
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full px-6 py-3 bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:from-orange-600 hover:via-red-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
            disabled={isPending}
          >
            <X size={18} />
            {isPending ? "Submitting..." : "Raise Concern"}
          </button>
        )}
      </div>
    </div>
  )

  return (
    <div className="py-8 px-4 relative overflow-hidden">
      {/* Trainer Cards Container */}
      <div className="flex flex-col md:flex-row gap-8 justify-center items-stretch max-w-6xl mx-auto">
        <div className="flex-1 max-w-md">
          <TrainerCard trainer={data.selectedTrainer} />
        </div>
        <div className="flex-1 max-w-md">
          <TrainerCard trainer={data.backupTrainer} isBackup={true} />
        </div>
      </div>

      {/* Modal with Fixed Background */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 flex items-center justify-center p-4 z-50"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.3)',
            backdropFilter: 'blur(4px)'
          }}
        >
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-8 w-full max-w-md transform transition-all duration-200 scale-100">
            {/* Modal Header */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 bg-clip-text text-transparent">
                Raise Concern
              </h2>
              <button
                onClick={handleCancel}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Close modal"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="space-y-6">
              {/* Dropdown */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type of Concern</label>
                <select
                  value={concernType}
                  onChange={(e) => setConcernType(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  required
                  disabled={isPending}
                >
                  <option value="">Select an option</option>
                  <option value="Change">Change Trainer</option>
                  <option value="Revoke">Revoke Assignment</option>
                </select>
              </div>

              {/* Textarea */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Reason</label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Please provide a detailed reason for your concern..."
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
                  required
                  disabled={isPending}
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-4 pt-4">
                <button
                  onClick={handleCancel}
                  className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-all duration-200"
                  disabled={isPending}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!concernType || !reason.trim() || isPending}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 text-white font-medium rounded-xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {isPending ? "Submitting..." : "Submit"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TrainerCards
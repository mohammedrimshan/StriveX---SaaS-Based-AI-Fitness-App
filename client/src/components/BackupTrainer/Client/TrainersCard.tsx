"use client";

import type React from "react";
import { useState } from "react";
import { Phone, Mail, User, Calendar, X, CalendarCheck, Lock } from "lucide-react";
import { useSubmitTrainerChangeRequest } from "@/hooks/backuptrainer/useSubmitTrainerChangeRequest";
import { useAssignBackupTrainer } from "@/hooks/backuptrainer/useAssignBackupTrainer";
import { SubmitTrainerChangeRequestPayload } from "@/types/backuptrainer";
import { useToaster } from "@/hooks/ui/useToaster";
import { useNavigate } from "react-router-dom";

interface Trainer {
  id: string;
  firstName: string;
  lastName: string;
  specialization: string[];
  profileImage: string;
  phoneNumber: string;
  email: string;
  experience: number;
  gender: string;
}

interface TrainerSelectionData {
  selectedTrainer: Trainer;
  backupTrainer: Trainer;
}

interface TrainerCardsProps {
  data: TrainerSelectionData;
  isPremium: boolean;
  isBackupAssigned: boolean;
}

const TrainerCards: React.FC<TrainerCardsProps> = ({ data, isPremium, isBackupAssigned }) => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [concernType, setConcernType] = useState("");
  const [reason, setReason] = useState("");
  const { successToast, errorToast } = useToaster();
  const { mutate: submitRequest, isPending } = useSubmitTrainerChangeRequest();
  const { mutate: mutateAssignBackupTrainer, isPending: isAssigning } = useAssignBackupTrainer();

  const handleSubmit = () => {
    if (!concernType || !reason.trim()) return;

    const payload: SubmitTrainerChangeRequestPayload = {
      backupTrainerId: data.backupTrainer.id,
      requestType: concernType === "Change" ? "CHANGE" : "REVOKE",
      reason: reason.trim(),
    };

    submitRequest(payload, {
      onSuccess: (response) => {
        successToast(response.message || "Concern submitted successfully!");
        setIsModalOpen(false);
        setConcernType("");
        setReason("");
      },
      onError: (error: any) => {
        const errorMessage = error?.response?.data?.message || "Failed to submit concern. Please try again.";
        errorToast(errorMessage);
      },
    });
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setConcernType("");
    setReason("");
  };

  const handleBookSlots = () => {
    console.log("Book Slots clicked for selected trainer");
    navigate("/booking", { state: { trainer: data.selectedTrainer } });
  };

  const handleUpgradeToPremium = () => {
    navigate("/premium");
  };

  const handleRequestBackupTrainer = () => {
    if (!isPremium) {
      errorToast("Please upgrade to a premium account to request a backup trainer.");
      return;
    }

    mutateAssignBackupTrainer(undefined, {
      onSuccess: () => {
        // Optionally navigate or refresh the page after success
        // navigate("/trainer-selection"); // Uncomment to navigate to a confirmation page
      },
    });
  };

  // Check if backup trainer exists and has valid data
  const hasBackupTrainer = data.backupTrainer && data.backupTrainer.id && data.backupTrainer.id !== "";

  const TrainerCard = ({ trainer, isBackup = false }: { trainer: Trainer; isBackup?: boolean }) => {
    // For backup trainer card when no backup is assigned
    if (isBackup && (!hasBackupTrainer || !isBackupAssigned)) {
      return (
        <div className="relative bg-white rounded-2xl shadow-xl border border-gray-200 p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 h-full flex flex-col">
          {/* Blurred background content */}
          <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl blur-sm opacity-80"></div>
          
          {/* Placeholder content for visual effect */}
          <div className="blur-sm opacity-40 pointer-events-none">
            <div className="text-center mb-6">
              <div className="relative inline-block">
                <div className="w-24 h-24 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 border-4 border-gradient-to-r from-purple-400 to-pink-400 shadow-lg flex items-center justify-center">
                  <User size={40} className="text-purple-500" />
                </div>
                <div className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-400 via-yellow-500 to-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md">
                  Backup
                </div>
              </div>
              <h3 className="text-xl font-bold mt-4 bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 bg-clip-text text-transparent">
                Your Backup Trainer
              </h3>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-600 font-medium mb-2">Specializations:</p>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 text-xs font-medium rounded-full border border-purple-200">
                  Fitness Training
                </span>
                <span className="px-3 py-1 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 text-xs font-medium rounded-full border border-purple-200">
                  Nutrition
                </span>
              </div>
            </div>

            <div className="space-y-3 mb-6 flex-grow">
              <div className="flex items-center gap-3 text-gray-600">
                <Phone size={16} className="text-purple-500" />
                <span className="text-sm">+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <Mail size={16} className="text-purple-500" />
                <span className="text-sm">trainer@example.com</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <User size={16} className="text-purple-500" />
                <span className="text-sm">Professional</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <Calendar size={16} className="text-purple-500" />
                <span className="text-sm">5 years experience</span>
              </div>
            </div>
          </div>

          {/* Centered Request Backup Trainer Button */}
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <button
              onClick={handleRequestBackupTrainer}
              disabled={!isPremium || isAssigning}
              className="px-8 py-4 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:from-blue-600 hover:via-indigo-600 hover:to-purple-600 transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-3 disabled:opacity-50 text-lg"
            >
              <User size={20} />
              {isAssigning ? "Requesting..." : "Request Backup Trainer"}
            </button>
          </div>

          {/* Lock Overlay for Non-Premium Users */}
          {!isPremium && (
            <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-20 rounded-2xl z-20">
              <Lock size={40} className="text-yellow-400" />
            </div>
          )}
        </div>
      );
    }

    // Regular trainer card (selected trainer or assigned backup trainer)
    return (
      <div
        className={`relative bg-white rounded-2xl shadow-xl border border-gray-200 p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 h-full flex flex-col ${
          !isPremium ? "blur-sm" : ""
        }`}
      >
        {/* Lock Overlay for Non-Premium Users Only */}
        {!isPremium && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-20 rounded-2xl z-10">
            <Lock size={40} className="text-yellow-400" />
          </div>
        )}
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
              disabled={!isPremium}
              className="w-full px-6 py-3 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:from-green-600 hover:via-emerald-600 hover:to-teal-600 transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <CalendarCheck size={18} />
              Book Slots
            </button>
          ) : (
            <button
              onClick={() => setIsModalOpen(true)}
              disabled={!isPremium}
              className="w-full px-6 py-3 bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:from-orange-600 hover:via-red-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <X size={18} />
              {isPending ? "Submitting..." : "Raise Concern"}
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="py-8 px-4 relative overflow-hidden">
      {/* Trainer Cards Container */}
      <div className="flex flex-col md:flex-row gap-8 justify-center items-stretch max-w-6xl mx-auto">
        <div className="flex-1 max-w-md">
          <TrainerCard trainer={data.selectedTrainer} />
        </div>
        {/* Always show backup trainer card slot */}
        <div className="flex-1 max-w-md">
          <TrainerCard trainer={data.backupTrainer} isBackup={true} />
        </div>
      </div>

      {/* Upgrade to Premium Button for Non-Premium Users */}
      {!isPremium && (
        <div className="mt-8 text-center">
          <button
            onClick={handleUpgradeToPremium}
            className="px-8 py-4 bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            Upgrade to Premium
          </button>
        </div>
      )}

      {/* Modal with Fixed Background */}
      {isModalOpen && (
        <div
          className="fixed inset-0 flex items-center justify-center p-4 z-50"
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.3)",
            backdropFilter: "blur(4px)",
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
  );
};

export default TrainerCards;
"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Award, GraduationCap, MessageCircle, Star } from 'lucide-react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

interface ITrainer {
  id: string
  firstName: string
  lastName: string
  profileImage?: string
  specialization?: string[]
  experience?: number
  qualifications?: string[]
  certifications?: string[]
  skills?: string[]
  rating?: number
}

interface TrainerCardProps {
  trainer: ITrainer
}

export default function TrainerCard({ trainer }: TrainerCardProps) {
  const navigate = useNavigate()

  // Calculate rating stars
  const rating = trainer.rating || 4.5

  // Handle navigation to trainer profile
  const handleViewProfile = () => {
    navigate(`/trainerprofile/${trainer.id}`)
  }
  
  return (
    <motion.div
      whileHover={{
        scale: 1.02,
        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
      }}
      transition={{ duration: 0.3 }}
      className="h-full"
    >
      <div className="h-full bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-100 flex flex-col relative">
        {/* Top colored bar */}
        <div className="h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>

        {/* Header with image */}
        <div className="px-6 pt-6 pb-4 flex items-center relative">
          <div className="h-20 w-20 rounded-xl overflow-hidden bg-gradient-to-br from-indigo-600 to-purple-700 mr-4 shadow-md">
            {trainer.profileImage ? (
              <img
                src={trainer.profileImage || "/placeholder.svg"}
                alt={`${trainer.firstName} ${trainer.lastName}`}
                className="object-cover w-full h-full"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-white text-2xl font-bold">
                  {trainer.firstName?.[0]}
                  {trainer.lastName?.[0]}
                </span>
              </div>
            )}
          </div>

          <div>
            <h3 className="text-xl font-bold text-gray-900 tracking-tight">
              {trainer.firstName} {trainer.lastName}
            </h3>

            {/* Experience label as pill */}
            {trainer.experience !== undefined && (
              <span className="inline-block bg-indigo-100 text-indigo-800 text-xs py-1 px-2 rounded-full font-semibold mt-1">
                {trainer.experience} years experience
              </span>
            )}
          </div>

          {/* Rating badge positioned absolutely */}
          <div className="absolute top-6 right-6 bg-white shadow-md rounded-full px-2 py-1 flex items-center border border-gray-100">
            <Star className="h-4 w-4 text-amber-400 fill-amber-400 mr-1" />
            <span className="text-gray-700 font-medium text-sm">{rating.toFixed(1)}</span>
          </div>
        </div>

        {/* Specializations */}
        <div className="px-6 pb-4">
          <div className="flex flex-wrap gap-1.5">
            {trainer.specialization && trainer.specialization.length > 0 ? (
              trainer.specialization.slice(0, 3).map((spec, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-800 hover:from-indigo-200 hover:to-purple-200 font-medium border-none"
                >
                  {spec}
                </Badge>
              ))
            ) : (
              <span className="text-sm text-gray-500">No specializations</span>
            )}
            {trainer.specialization && trainer.specialization.length > 3 && (
              <Badge variant="outline" className="font-medium text-indigo-600 border-indigo-200 hover:bg-indigo-50">
                +{trainer.specialization.length - 3}
              </Badge>
            )}
          </div>
        </div>

        {/* Skills */}
        <div className="px-6 pb-3 mt-1">
          <h4 className="text-sm font-medium mb-2 text-gray-900 flex items-center">
            <div className="h-1 w-1 rounded-full bg-indigo-500 mr-2"></div>
            Expertise
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {trainer.skills && trainer.skills.length > 0 ? (
              trainer.skills.slice(0, 4).map((skill, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                >
                  {skill}
                </Badge>
              ))
            ) : (
              <span className="text-sm text-gray-500">No skills listed</span>
            )}
            {trainer.skills && trainer.skills.length > 4 && (
              <Badge variant="outline" className="text-gray-600 border-gray-200">
                +{trainer.skills.length - 4}
              </Badge>
            )}
          </div>
        </div>

        {/* Quick Info */}
        <div className="px-6 pb-4 grid grid-cols-3 gap-3 mt-1">
          <div className="bg-gray-50 rounded-lg p-3 flex flex-col items-center justify-center">
            <GraduationCap className="h-5 w-5 text-indigo-600 mb-1" />
            <span className="text-xs text-gray-600 text-center">
              {trainer.qualifications && trainer.qualifications.length > 0
                ? `${trainer.qualifications.length} Quals`
                : "No Quals"}
            </span>
          </div>

          <div className="bg-gray-50 rounded-lg p-3 flex flex-col items-center justify-center">
            <Award className="h-5 w-5 text-indigo-600 mb-1" />
            <span className="text-xs text-gray-600 text-center">
              {trainer.certifications && trainer.certifications.length > 0
                ? `${trainer.certifications.length} Certs`
                : "No Certs"}
            </span>
          </div>

          <div className="bg-gray-50 rounded-lg p-3 flex flex-col items-center justify-center">
            <MessageCircle className="h-5 w-5 text-indigo-600 mb-1" />
            <span className="text-xs text-gray-600 text-center">Message</span>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-auto px-6 pb-6 grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            className="border-indigo-200 text-indigo-700 hover:bg-indigo-50 hover:text-indigo-800 transition-all"
          >
            Save
          </Button>
          <Button
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-md hover:shadow-lg transition-all"
            onClick={handleViewProfile}
          >
            View Profile
          </Button>
        </div>
      </div>
    </motion.div>
  )
}


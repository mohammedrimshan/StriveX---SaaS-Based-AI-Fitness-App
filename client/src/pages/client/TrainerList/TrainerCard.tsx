"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Award, Briefcase, GraduationCap, Star } from 'lucide-react'
import { motion } from 'framer-motion'

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
  // Calculate rating stars
  const rating = trainer.rating || 4.5
  const fullStars = Math.floor(rating)
  const hasHalfStar = rating % 1 >= 0.5
  
  return (
    <motion.div
      whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)" }}
      transition={{ duration: 0.2 }}
      className="h-full"
    >
      <Card className="overflow-hidden h-[450px] flex flex-col border-slate-200 shadow-sm hover:shadow-md transition-shadow">
        <div className="relative h-52 overflow-hidden">
          {/* Gradient overlay for better text visibility */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-10" />
          
          {/* Trainer image with standard img tag */}
          {trainer.profileImage ? (
            <div className="relative w-full h-full">
              <img 
                src={trainer.profileImage || "/placeholder.svg"}
                alt={`${trainer.firstName} ${trainer.lastName}`}
                className="object-cover w-full h-full"
              />
            </div>
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-rose-500 via-fuchsia-500 to-indigo-600 flex items-center justify-center">
              <span className="text-white text-4xl font-bold opacity-30">
                {trainer.firstName?.[0]}{trainer.lastName?.[0]}
              </span>
            </div>
          )}
          
          {/* Trainer name and specialization */}
          <div className="absolute bottom-0 left-0 p-4 z-20 w-full">
            <h3 className="text-xl font-bold text-white tracking-tight">
              {trainer.firstName} {trainer.lastName}
            </h3>
            
            {/* Rating stars */}
            <div className="flex items-center mt-1">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  className={`w-4 h-4 ${
                    i < fullStars 
                      ? 'text-yellow-400 fill-yellow-400' 
                      : i === fullStars && hasHalfStar 
                        ? 'text-yellow-400 fill-yellow-400/50' 
                        : 'text-gray-400'
                  }`}
                />
              ))}
              <span className="ml-1 text-white text-sm font-medium">{rating.toFixed(1)}</span>
            </div>
          </div>
        </div>
        
        <CardContent className="pt-5 pb-2 flex-grow">
          {/* Specializations */}
          <div className="flex flex-wrap gap-1 mb-4 min-h-[28px]">
            {trainer.specialization && trainer.specialization.length > 0 ? (
              trainer.specialization.slice(0, 3).map((spec, index) => (
                <Badge key={index} variant="secondary" className="bg-rose-100 text-rose-800 hover:bg-rose-200 font-medium">
                  {spec}
                </Badge>
              ))
            ) : (
              <span className="text-sm text-gray-500">No specializations</span>
            )}
            {trainer.specialization && trainer.specialization.length > 3 && (
              <Badge variant="outline" className="font-medium">+{trainer.specialization.length - 3}</Badge>
            )}
          </div>
          
          {/* Experience, Qualifications, Certifications */}
          <div className="space-y-3 mt-3">
            <div className="flex items-center text-sm min-h-[20px] group">
              <div className="bg-rose-50 p-1.5 rounded-full mr-3">
                <Briefcase className="w-3.5 h-3.5 text-rose-600 shrink-0" />
              </div>
              <span className="text-slate-700 group-hover:text-slate-900 transition-colors">
                {trainer.experience !== undefined ? `${trainer.experience} years experience` : "Experience not specified"}
              </span>
            </div>
            
            <div className="flex items-center text-sm min-h-[20px] group">
              <div className="bg-rose-50 p-1.5 rounded-full mr-3">
                <GraduationCap className="w-3.5 h-3.5 text-rose-600 shrink-0" />
              </div>
              {trainer.qualifications && trainer.qualifications.length > 0 ? (
                <span className="truncate text-slate-700 group-hover:text-slate-900 transition-colors">
                  {trainer.qualifications[0]}
                  {trainer.qualifications.length > 1 && ` +${trainer.qualifications.length - 1}`}
                </span>
              ) : (
                <span className="text-gray-500">No qualifications listed</span>
              )}
            </div>
            
            <div className="flex items-center text-sm min-h-[20px] group">
              <div className="bg-rose-50 p-1.5 rounded-full mr-3">
                <Award className="w-3.5 h-3.5 text-rose-600 shrink-0" />
              </div>
              {trainer.certifications && trainer.certifications.length > 0 ? (
                <span className="truncate text-slate-700 group-hover:text-slate-900 transition-colors">
                CERTIFIED
                </span>
              ) : (
                <span className="text-gray-500">No certifications listed</span>
              )}
            </div>
          </div>
          
          {/* Skills */}
          <div className="mt-4 min-h-[40px]">
            <h4 className="text-sm font-medium mb-2 text-slate-900">Skills & Expertise</h4>
            <div className="flex flex-wrap gap-1">
              {trainer.skills && trainer.skills.length > 0 ? (
                trainer.skills.slice(0, 3).map((skill, index) => (
                  <Badge key={index} variant="outline" className="bg-slate-50 text-slate-700 hover:bg-slate-100 transition-colors">
                    {skill}
                  </Badge>
                ))
              ) : (
                <span className="text-sm text-gray-500">No skills listed</span>
              )}
              {trainer.skills && trainer.skills.length > 3 && (
                <Badge variant="outline" className="text-slate-600">+{trainer.skills.length - 3}</Badge>
              )}
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="mt-auto pt-2">
          <Button className="w-full bg-rose-600 hover:bg-rose-700 transition-colors shadow-sm hover:shadow">
            View Profile
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  )
}
import { TrainerProfile } from "@/types/trainer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  User,
  Mail,
  Phone,
  Ruler,
  Weight,
  Award,
  Briefcase,
  Star,
  Dumbbell,
} from "lucide-react";
import { motion } from "framer-motion";

interface OverviewTabProps {
  trainer: TrainerProfile;
}

export const OverviewTab = ({ trainer }: OverviewTabProps) => {
  const generateDescription = (trainer: TrainerProfile) => {
    // Add null checks and default values
    const specializations =
      trainer.specialization?.join(", ") || "various fitness areas";
    const experienceText = trainer.experience === 1 ? "year" : "years";
    const skills =
      trainer.skills?.slice(0, 3)?.join(", ") || "fitness training";

    return `Meet ${
      trainer.firstName || "your trainer"
    }, a certified fitness professional with ${
      trainer.experience || 0
    } ${experienceText} of experience specializing in ${specializations}. With a strong background in ${skills}, ${
      trainer.firstName || "they"
    } provides personalized training programs designed to help you reach your fitness goals efficiently and safely.`;
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
      },
    }),
  };

  const iconVariants = {
    initial: { scale: 1 },
    hover: {
      scale: 1.2,
      rotate: 5,
      transition: { duration: 0.3 },
    },
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Row 1: Personal Information Card */}
      <motion.div
        custom={0}
        variants={cardVariants}
        initial="hidden"
        animate="visible"
      >
        <Card className="overflow-hidden border-none shadow-md hover:shadow-lg transition-shadow h-full">
          <div className="bg-blue-700 p-4 text-white relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
              <div className="absolute w-16 h-16 rounded-full bg-blue-400 -top-4 -left-4 animate-blob" />
              <div className="absolute w-16 h-16 rounded-full bg-sky-400 top-8 left-10 animate-blob animation-delay-2000" />
            </div>
            <h2 className="text-lg font-semibold flex items-center relative z-10">
              <motion.div
                whileHover="hover"
                variants={iconVariants}
                initial="initial"
                className="text-blue-200"
              >
                <User className="h-5 w-5 mr-2" />
              </motion.div>
              Personal Information
            </h2>
          </div>
          <CardContent className="pt-6 h-full">
            <div className="space-y-4">
              <div className="flex items-center">
                <motion.div
                  whileHover="hover"
                  variants={iconVariants}
                  initial="initial"
                >
                  <Mail className="h-5 w-5 text-blue-500 mr-3 flex-shrink-0" />
                </motion.div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="text-gray-900 dark:text-gray-100">
                    {trainer.email || "Not available"}
                  </p>
                </div>
              </div>
              <div className="flex items-center">
                <motion.div
                  whileHover="hover"
                  variants={iconVariants}
                  initial="initial"
                >
                  <Phone className="h-5 w-5 text-blue-500 mr-3 flex-shrink-0" />
                </motion.div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="text-gray-900 dark:text-gray-100">
                    {trainer.phoneNumber || "Not available"}
                  </p>
                </div>
              </div>
              <Separator />
              {trainer && (
                <>
                  {trainer.height && (
                    <div className="flex items-center">
                      <motion.div
                        whileHover="hover"
                        variants={iconVariants}
                        initial="initial"
                      >
                        <Ruler className="h-5 w-5 text-blue-500 mr-3 flex-shrink-0" />
                      </motion.div>
                      <div>
                        <p className="text-sm text-muted-foreground">Height</p>
                        <p className="text-gray-900 dark:text-gray-100">
                          {trainer.height} cm
                        </p>
                      </div>
                    </div>
                  )}
                  {trainer.weight && (
                    <div className="flex items-center">
                      <motion.div
                        whileHover="hover"
                        variants={iconVariants}
                        initial="initial"
                      >
                        <Weight className="h-5 w-5 text-blue-500 mr-3 flex-shrink-0" />
                      </motion.div>
                      <div>
                        <p className="text-sm text-muted-foreground">Weight</p>
                        <p className="text-gray-900 dark:text-gray-100">
                          {trainer.weight} kg
                        </p>
                      </div>
                    </div>
                  )}
                  {trainer.gender && (
                    <div className="flex items-center">
                      <motion.div
                        whileHover="hover"
                        variants={iconVariants}
                        initial="initial"
                      >
                        <User className="h-5 w-5 text-blue-500 mr-3 flex-shrink-0" />
                      </motion.div>
                      <div>
                        <p className="text-sm text-muted-foreground">Gender</p>
                        <p className="capitalize text-gray-900 dark:text-gray-100">
                          {trainer.gender}
                        </p>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Row 1: Experience & Expertise Card */}
      <motion.div
        custom={1}
        variants={cardVariants}
        initial="hidden"
        animate="visible"
      >
        <Card className="overflow-hidden border-none shadow-md hover:shadow-lg transition-shadow h-full">
          <div className="bg-violet-700 p-4 text-white relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
              <div className="absolute w-24 h-24 rounded-full bg-violet-400 -top-6 -left-6 animate-blob" />
              <div className="absolute w-24 h-24 rounded-full bg-indigo-400 top-10 left-16 animate-blob animation-delay-2000" />
              <div className="absolute w-24 h-24 rounded-full bg-blue-400 bottom-0 right-10 animate-blob animation-delay-4000" />
            </div>
            <h2 className="text-lg font-semibold flex items-center relative z-10">
              <motion.div
                whileHover="hover"
                variants={iconVariants}
                initial="initial"
                className="text-violet-200"
              >
                <Briefcase className="h-5 w-5 mr-2" />
              </motion.div>
              Experience & Expertise
            </h2>
          </div>
          <CardContent className="pt-6 h-full">
            <div className="mb-6">
              <p className="text-lg mb-4 handwritten">
                {generateDescription(trainer)}
              </p>

              <div className="bg-indigo-600 rounded-lg p-6 flex items-center justify-center text-white relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                  <div className="absolute w-28 h-28 rounded-full bg-indigo-400 -top-4 -left-4 animate-blob" />
                  <div className="absolute w-28 h-28 rounded-full bg-purple-400 bottom-4 right-4 animate-blob animation-delay-2000" />
                </div>
                <div className="text-center relative z-10">
                  <motion.span
                    className="text-5xl font-bold block mb-2"
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                  >
                    {trainer.experience || 0}
                  </motion.span>
                  <span className="text-xl">
                    {trainer.experience === 1 ? "Year" : "Years"} of
                    Professional Experience
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Row 2: Certifications Card */}
      <motion.div
        custom={2}
        variants={cardVariants}
        initial="hidden"
        animate="visible"
      >
        <Card className="overflow-hidden border-none shadow-md hover:shadow-lg transition-shadow h-full">
          <div className="bg-amber-700 p-4 text-white relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
              <div className="absolute w-24 h-24 rounded-full bg-amber-400 -top-6 -left-6 animate-blob" />
              <div className="absolute w-24 h-24 rounded-full bg-yellow-400 top-10 left-16 animate-blob animation-delay-2000" />
              <div className="absolute w-24 h-24 rounded-full bg-orange-400 bottom-0 right-10 animate-blob animation-delay-4000" />
            </div>
            <h2 className="text-lg font-semibold flex items-center relative z-10">
              <motion.div
                whileHover="hover"
                variants={iconVariants}
                initial="initial"
                className="text-amber-200"
              >
                <Award className="h-5 w-5 mr-2" />
              </motion.div>
              Certifications
            </h2>
          </div>
          <CardContent className="pt-6 h-full">
            {trainer.certifications && trainer.certifications.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {trainer.certifications.map((certification, index) => (
                  <motion.div
                    key={index}
                    className="flex items-start p-3 border border-amber-300 bg-amber-50 rounded-lg group"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    whileHover={{ scale: 1.03, y: -3 }}
                  >
                    <motion.div
                      animate={{ rotate: [0, 10, 0] }}
                      transition={{
                        repeat: Infinity,
                        repeatType: "loop",
                        duration: 2,
                        repeatDelay: 1,
                      }}
                      className="group-hover:text-amber-600 transition-colors"
                    >
                      <Star className="h-5 w-5 text-amber-500 mr-3 mt-0.5 flex-shrink-0" />
                    </motion.div>
                    <span className="text-amber-800">
                      {certification ? "Certified Trainer" : ""}
                    </span>
                  </motion.div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No certifications listed</p>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Row 2: Skills & Expertise Card */}
      <motion.div
        custom={3}
        variants={cardVariants}
        initial="hidden"
        animate="visible"
      >
        <Card className="overflow-hidden border-none shadow-md hover:shadow-lg transition-shadow h-full">
          <div className="bg-green-700 p-4 text-white relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
              <div className="absolute w-24 h-24 rounded-full bg-green-400 -top-6 -left-6 animate-blob" />
              <div className="absolute w-24 h-24 rounded-full bg-emerald-400 top-10 left-16 animate-blob animation-delay-2000" />
              <div className="absolute w-24 h-24 rounded-full bg-teal-400 bottom-0 right-10 animate-blob animation-delay-4000" />
            </div>
            <h2 className="text-lg font-semibold flex items-center relative z-10">
              <motion.div
                whileHover="hover"
                variants={iconVariants}
                initial="initial"
                className="text-green-200"
              >
                <Dumbbell className="h-5 w-5 mr-2" />
              </motion.div>
              Skills & Expertise
            </h2>
          </div>
          <CardContent className="pt-6 h-full">
            <div className="grid gap-4 md:grid-cols-2">
              {trainer.skills && trainer.skills.length > 0 ? (
                trainer.skills.map((skill, index) => (
                  <motion.div
                    key={index}
                    className="space-y-1"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    whileHover={{ x: 5 }}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{skill}</span>
                      <span className="text-sm text-muted-foreground">
                        {85 + Math.floor(Math.random() * 16)}%
                      </span>
                    </div>
                    <Progress
                      value={85 + Math.floor(Math.random() * 16)}
                      className="h-2 bg-green-100"
                    />
                  </motion.div>
                ))
              ) : (
                <p className="text-muted-foreground col-span-2">
                  No skills listed
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

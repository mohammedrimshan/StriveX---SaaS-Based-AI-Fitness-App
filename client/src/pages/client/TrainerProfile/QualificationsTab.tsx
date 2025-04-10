import { TrainerProfile } from "@/types/trainer";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, Award, Trophy, Star } from "lucide-react";
import { motion } from "framer-motion";

interface QualificationsTabProps {
  trainer: TrainerProfile;
}

export const QualificationsTab = ({ trainer }: QualificationsTabProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="overflow-hidden border-none shadow-md hover:shadow-lg transition-shadow h-full">
          <div className="bg-gradient-to-r from-fitness-primary to-violet-700 p-4 text-white">
            <h2 className="text-lg font-semibold flex items-center">
              <BookOpen className="h-5 w-5 mr-2" />
              Educational Qualifications
            </h2>
          </div>
          <CardContent className="pt-6">
            {trainer.qualifications.length > 0 ? (
              <div className="space-y-4">
                {trainer.qualifications.map((qualification, index) => (
                  <motion.div
                    key={index}
                    className="flex items-start bg-violet-50 p-4 rounded-lg"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <div className="mr-3 mt-1 bg-fitness-primary p-1.5 rounded-full">
                      <Trophy className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <h3 className="font-medium text-violet-800">{qualification}</h3>
                      <p className="text-sm text-violet-600">
                        {["University of Fitness", "Sports Academy", "Health Institute", "Wellness College"][index % 4]}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No qualifications listed</p>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card className="overflow-hidden border-none shadow-md hover:shadow-lg transition-shadow h-full">
          <div className="bg-gradient-to-r from-fitness-accent to-amber-600 p-4 text-white">
            <h2 className="text-lg font-semibold flex items-center">
              <Award className="h-5 w-5 mr-2" />
              Professional Certifications
            </h2>
          </div>
          <CardContent className="pt-6">
            {trainer.certifications.length > 0 ? (
              <div className="space-y-4">
                {trainer.certifications.map((certification, index) => (
                  <motion.div
                    key={index}
                    className="flex items-start p-4 border border-amber-300 bg-amber-50 rounded-lg"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <Star className="h-5 w-5 text-amber-500 mr-3 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-medium text-amber-800">{certification?"CERTIFIED":"NOT CERTIFIED"}</h3>
                      <p className="text-sm text-amber-600">
                        Issued: {2020 - index} • Expires: {2025 - index}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No certifications listed</p>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

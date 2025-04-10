import { TrainerProfile } from "@/types/trainer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, CalendarCheck } from "lucide-react";
import { motion } from "framer-motion";

interface ScheduleTabProps {
  trainer: TrainerProfile;
}

export const ScheduleTab = ({ trainer }: ScheduleTabProps) => {
  return (
    <div className="space-y-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="overflow-hidden border-none shadow-md hover:shadow-lg transition-shadow mb-6">
          <div className="bg-gradient-to-r from-fitness-secondary to-green-700 p-4 text-white">
            <h2 className="text-lg font-semibold flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Weekly Schedule
            </h2>
          </div>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
              {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day, index) => (
                <motion.div 
                  key={day}
                  className={`p-4 rounded-lg border ${index === 6 ? 'bg-gray-100 dark:bg-gray-800' : 'bg-white dark:bg-gray-900'}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <h3 className="font-medium text-center mb-2">{day}</h3>
                  {index === 6 ? (
                    <div className="text-center text-muted-foreground">
                      <p>Closed</p>
                      <p className="text-xs mt-2">Rest Day</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="text-center text-sm p-1 bg-green-50 dark:bg-green-900/30 rounded border border-green-200 dark:border-green-800">
                        6:00 AM - 10:00 AM
                      </div>
                      <div className="text-center text-sm p-1 bg-blue-50 dark:bg-blue-900/30 rounded border border-blue-200 dark:border-blue-800">
                        4:00 PM - 8:00 PM
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
      
      <div className="flex justify-center">
        <Button size="lg" className="bg-fitness-secondary hover:bg-fitness-secondary/90">
          <CalendarCheck className="mr-2 h-5 w-5" />
          Book a Session Now
        </Button>
      </div>
    </div>
  );
};

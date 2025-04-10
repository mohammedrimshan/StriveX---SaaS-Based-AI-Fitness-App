
import { TrainerProfile } from "@/types/trainer";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Mail, Phone, MapPin, MessageSquare, Facebook, Instagram, Twitter, Linkedin } from "lucide-react";
import { motion } from "framer-motion";

interface ContactTabProps {
  trainer: TrainerProfile;
}

export const ContactTab = ({ trainer }: ContactTabProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="overflow-hidden border-none shadow-md hover:shadow-lg transition-shadow h-full">
          <div className="bg-gradient-to-r from-fitness-primary to-blue-700 p-4 text-white">
            <h2 className="text-lg font-semibold flex items-center">
              <Mail className="h-5 w-5 mr-2" />
              Contact Information
            </h2>
          </div>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center">
                <Mail className="h-5 w-5 text-fitness-primary mr-3 flex-shrink-0" />
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="text-gray-900 dark:text-gray-100">{trainer.email}</p>
                </div>
              </div>
              <div className="flex items-center">
                <Phone className="h-5 w-5 text-green-600 mr-3 flex-shrink-0" />
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="text-gray-900 dark:text-gray-100">{trainer.phoneNumber}</p>
                </div>
              </div>
              <div className="flex items-center">
                <MapPin className="h-5 w-5 text-rose-600 mr-3 flex-shrink-0" />
                <div>
                  <p className="text-sm text-muted-foreground">Location</p>
                  <p className="text-gray-900 dark:text-gray-100">{trainer.location?trainer.location:"Not Provided"}</p>
                </div>
              </div>
              <Separator />
              <div className="pt-2">
                <h3 className="font-medium mb-3">Connect on Social Media</h3>
                <div className="flex gap-3">
                  <a href="#" aria-label="Facebook" className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors">
                    <Facebook className="h-5 w-5" />
                  </a>
                  <a href="#" aria-label="Instagram" className="bg-pink-600 text-white p-2 rounded-full hover:bg-pink-700 transition-colors">
                    <Instagram className="h-5 w-5" />
                  </a>
                  <a href="#" aria-label="Twitter" className="bg-blue-400 text-white p-2 rounded-full hover:bg-blue-500 transition-colors">
                    <Twitter className="h-5 w-5" />
                  </a>
                  <a href="#" aria-label="LinkedIn" className="bg-blue-700 text-white p-2 rounded-full hover:bg-blue-800 transition-colors">
                    <Linkedin className="h-5 w-5" />
                  </a>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card className="overflow-hidden border-none shadow-md hover:shadow-lg transition-shadow h-full">
          <div className="bg-gradient-to-r from-fitness-primary to-violet-700 p-4 text-white">
            <h2 className="text-lg font-semibold flex items-center">
              <MessageSquare className="h-5 w-5 mr-2" />
              Send a Message
            </h2>
          </div>
          <CardContent className="pt-6">
            <form className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium">
                    Your Name
                  </label>
                  <input
                    id="name"
                    className="w-full p-2 border rounded-md"
                    placeholder="Enter your name"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">
                    Your Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    className="w-full p-2 border rounded-md"
                    placeholder="Enter your email"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="subject" className="text-sm font-medium">
                  Subject
                </label>
                <input
                  id="subject"
                  className="w-full p-2 border rounded-md"
                  placeholder="Enter subject"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="message" className="text-sm font-medium">
                  Message
                </label>
                <textarea
                  id="message"
                  className="w-full p-2 border rounded-md min-h-[120px]"
                  placeholder="Enter your message"
                ></textarea>
              </div>
              <Button className="w-full bg-fitness-primary hover:bg-fitness-primary/90">
                Send Message
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

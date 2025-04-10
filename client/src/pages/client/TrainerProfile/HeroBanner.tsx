import { TrainerProfile } from "@/types/trainer";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  MapPin,
  Briefcase,
  Star,
  MessageSquare,
  Facebook,
  Instagram,
  Twitter,
} from "lucide-react";
import { motion } from "framer-motion";

interface HeroBannerProps {
  trainer: TrainerProfile;
}

export const HeroBanner = ({ trainer }: HeroBannerProps) => {
    console.log(trainer,"traaaaa")
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-[#6d28d9] to-[#a21caf] text-white mb-8">
      {/* Animated background blobs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20 pointer-events-none">
        <div className="absolute w-40 h-40 rounded-full bg-[var(--violet)] -top-10 -left-10 animate-blob" />
        <div className="absolute w-40 h-40 rounded-full bg-[#c026d3] top-40 left-40 animate-blob animation-delay-2000" />
        <div className="absolute w-40 h-40 rounded-full bg-[var(--violet)] bottom-10 right-10 animate-blob animation-delay-4000" />
      </div>

      <div className="container mx-auto px-4 py-12 md:py-16 relative z-10">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="flex flex-col md:flex-row items-center gap-8"
        >
          <motion.div variants={item} className="flex-shrink-0">
            <Avatar className="h-36 w-36 md:h-48 md:w-48 border-4 border-white/80 shadow-xl">
              <AvatarImage
                src={trainer.profileImage}
                alt={`${trainer.firstName} ${trainer.lastName}`}
                className="object-cover"
              />
              <AvatarFallback className="text-4xl bg-blue-600 text-white">
                {trainer.firstName.charAt(0)}
                {trainer.lastName.charAt(0)}
              </AvatarFallback>
            </Avatar>
          </motion.div>

          <motion.div
            variants={item}
            className="flex-1 text-center md:text-left"
          >
            <div className="flex flex-col md:flex-row md:items-center gap-2 mb-3">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold">
                {trainer.firstName} {trainer.lastName}
              </h1>
              {trainer.approvedByAdmin && (
                <Badge className="self-center md:self-start bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-2 py-0.5 text-xs">
                  <CheckCircle2 className="h-3 w-3 mr-1 inline" />
                  Verified Pro
                </Badge>
              )}
            </div>

            <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-4">
              {(trainer.specialization || []).map((spec, index) => (
                <Badge
                  key={index}
                  className="bg-white/20 hover:bg-white/30 text-white"
                >
                  {spec}
                </Badge>
              ))}
            </div>

            <p className="text-white/90 mb-4 max-w-2xl">{trainer.bio}</p>

            <div className="flex items-center justify-center md:justify-start gap-4 mb-6 text-white/80 text-sm flex-wrap">
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-1" />
                <span>{trainer.location? trainer.location : "Not given"}</span>
              </div>
              <div className="flex items-center">
                <Briefcase className="h-4 w-4 mr-1" />
                <span>{trainer.experience} years experience</span>
              </div>
              <div className="flex items-center">
                <Star className="h-4 w-4 mr-1 fill-yellow-300 text-yellow-300" />
                <span>{trainer.rating? trainer.rating : 5} rating</span>
              </div>
            </div>

            <div className="flex flex-wrap justify-center md:justify-start gap-3">
              <Button className="bg-white text-[#6d28d9] hover:bg-white/90 shadow-lg relative overflow-hidden group">
                <span className="absolute inset-0 w-full h-full bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></span>
                Book a Session
              </Button>
              <Button
                variant="outline"
                className="bg-text-white hover:bg-white/20 relative overflow-hidden group"
              >
                <span className="absolute inset-0 w-full h-full bg-white/10 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></span>
                <MessageSquare className="h-4 w-4 mr-2" />
                Contact Me
              </Button>
              <div className="flex items-center gap-2 ml-0 md:ml-4">
                <a
                  href="#"
                  aria-label="Instagram"
                  className="bg-white/20 hover:bg-white/30 p-2 rounded-full transition-all"
                >
                  <Instagram className="h-5 w-5" />
                </a>
                <a
                  href="#"
                  aria-label="Facebook"
                  className="bg-white/20 hover:bg-white/30 p-2 rounded-full transition-all"
                >
                  <Facebook className="h-5 w-5" />
                </a>
                <a
                  href="#"
                  aria-label="Twitter"
                  className="bg-white/20 hover:bg-white/30 p-2 rounded-full transition-all"
                >
                  <Twitter className="h-5 w-5" />
                </a>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Stats bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white/10 backdrop-blur-md py-4 px-4 border-t border-white/20"
      >
        <div className="container mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold">{trainer.experience}</div>
              <div className="text-sm text-white/80">Years Experience</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">{trainer.clientCount?trainer.clientCount:"200"}+</div>
              <div className="text-sm text-white/80">Happy Clients</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">{trainer.sessionCount?trainer.sessionCount:"23"}+</div>
              <div className="text-sm text-white/80">Sessions Completed</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center">
                <div className="text-3xl font-bold mr-1">{trainer.rating}</div>
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < Math.floor(trainer.rating??4)
                          ? "fill-yellow-300 text-yellow-300"
                          : "text-white/30"
                      }`}
                    />
                  ))}
                </div>
              </div>
              <div className="text-sm text-white/80">Average Rating</div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

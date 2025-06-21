
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import YouTube from "react-youtube";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

const services = [
  {
    title: "Personal Training",
    description: "One-on-one expert coaching tailored to your specific goals and fitness level.",
    image: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b",
    videoId: "E3g0DNtw5-U", // Athlean-X: Personal Training Tips
  },
  {
    title: "Group Fitness Classes",
    description: "Dynamic group sessions for cardio, strength, yoga, and more.",
    image: "https://images.unsplash.com/photo-1518310383802-640c2de311b2",
    videoId: "QbQ3W3Y5K1o", // Les Mills: BODYCOMBAT Group Fitness
  },
  {
    title: "Nutrition Coaching",
    description: "Personalized meal plans and guidance from certified nutritionists.",
    image: "https://images.unsplash.com/photo-1490645935967-10de6ba17061",
    videoId: "1a_19q43cpI", // Thomas DeLauer: Nutrition Basics
  },
  {
    title: "Mind & Body",
    description: "Holistic wellness programs focusing on mental and physical balance.",
    image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b",
    videoId: "inpok4MKVLM", // Yoga with Adriene: Yoga for Beginners
  },
  {
    title: "HIIT Training",
    description: "High-intensity interval training for maximum calorie burn.",
    image: "https://images.unsplash.com/photo-1549576490-b0b4831ef60a",
    videoId: "ml6cT4AZdqI", // POPSUGAR Fitness: 30-Minute HIIT
  },
  {
    title: "Strength Training",
    description: "Build muscle and increase strength with expert guidance.",
    image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48",
    videoId: "2pLT-olgUJs", // Fitness Blender: Strength Training Workout
  },
];

export default function Services() {
  const [selectedService, setSelectedService] = useState<(typeof services)[0] | null>(null);

  const handleOpenModal = (service: (typeof services)[0]) => {
    setSelectedService(service);
  };

  const handleCloseModal = () => {
    setSelectedService(null);
  };

  const youtubeOpts = {
    height: "100%",
    width: "100%",
    playerVars: {
      autoplay: 1,
      modestbranding: 1,
      rel: 0,
    },
  };

  return (
    <>
      <section className="bg-gray-50 py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
              Premium Fitness Services
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Comprehensive Programs Designed to Transform Your Life
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service, index) => (
              <div
                key={index}
                className="group overflow-hidden rounded-lg bg-white shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="relative h-48 w-full overflow-hidden">
                  <img
                    src={service.image}
                    alt={service.title}
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                </div>
                <div className="p-6">
                  <h3 className="mb-2 text-xl font-semibold">{service.title}</h3>
                  <p className="mb-4 text-sm text-muted-foreground">{service.description}</p>
                  <Button
                    className="w-full bg-purple-600 hover:bg-purple-700"
                    onClick={() => handleOpenModal(service)}
                  >
                    Learn More
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Video Modal */}
      <AnimatePresence>
        {selectedService && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={handleCloseModal}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
            >
              <button
                className="absolute top-4 right-4 text-gray-600 hover:text-gray-800"
                onClick={handleCloseModal}
              >
                <X className="h-6 w-6" />
              </button>
              <div className="aspect-video bg-black">
                <YouTube
                  videoId={selectedService.videoId}
                  opts={youtubeOpts}
                  className="h-full w-full"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">{selectedService.title}</h3>
                <p className="text-sm text-muted-foreground">{selectedService.description}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

"use client"

import { useRef } from "react"
import { motion, useInView } from "framer-motion"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Heart, Zap, Feather } from "lucide-react"

interface Service {
  title: string;
  description: string;
  image: string;
  color: string;
  textColor: string;
  icon: JSX.Element;
  category: string;
}

const services: Service[] = [
  {
    title: "CARDIO",
    description: "Boost your energy with high-intensity cardio workouts tailored to your fitness level.",
    image:"https://res.cloudinary.com/daee3szbl/image/upload/v1750763791/cardio_j0cie8.png",
    color: "from-blue-50 to-blue-200",
    textColor: "text-blue-700",
    icon: <Zap className="h-6 w-6" />,
    category: "Fitness"
  },
  {
    title: "MEDITATION",
    description: "Find your inner peace with guided meditation sessions for all levels.",
    image:"https://res.cloudinary.com/daee3szbl/image/upload/v1750763794/med_mtaqi8.png",
    color: "from-emerald-50 to-emerald-200",
    textColor: "text-emerald-700",
    icon: <Feather className="h-6 w-6" />,
    category: "Mind"
  },
  {
    title: "YOGA",
    description: "Improve flexibility and strength with our range of yoga classes for all abilities.",
    image: "https://res.cloudinary.com/daee3szbl/image/upload/v1750763793/yoga_titqhf.png",
    color: "from-rose-50 to-rose-200",
    textColor: "text-rose-700",
    icon: <Heart className="h-6 w-6" />,
    category: "Balance"
  },
]

export function ServicesSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.2 })

  return (
    <section ref={ref} className="py-24 relative overflow-hidden bg-gradient-to-b from-white to-slate-50">
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: -20 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-center mb-16"
        >
          <Badge variant="outline" className="mb-4 px-4 py-1 border-primary/20 text-primary">
            Discover Our Offerings
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
            OUR SERVICES
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-primary to-secondary mx-auto rounded-full" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.7 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {services.map((service) => (
            <motion.div
              key={service.title}
              whileHover={{ y: -10, transition: { duration: 0.3 } }}
            >
              <Card className="overflow-hidden h-full border border-slate-200 shadow-lg shadow-slate-200/20 group flex flex-col">
                {/* Card Header with Icon on the Left */}
                <div className={`h-48 bg-gradient-to-br ${service.color} relative overflow-hidden flex items-center px-6`}>
                  <motion.div 
                    className={`w-14 h-14 flex items-center justify-center rounded-full bg-white shadow-lg ${service.textColor}`}
                    whileHover={{ scale: 1.1 }}
                  >
                    {service.icon}
                  </motion.div>

                  <motion.div
                    className="absolute left-6 top-6 bg-white/20 backdrop-blur-md rounded-lg px-3 py-1"
                    initial={{ x: -20, opacity: 0 }}
                    animate={isInView ? { x: 0, opacity: 1 } : { x: -20, opacity: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <span className="text-xs font-semibold">{service.category}</span>
                  </motion.div>

                  <motion.div
                    className="absolute bottom-0 right-0 w-40 h-40"
                    initial={{ scale: 1.1 }}
                    whileHover={{ scale: 1.15, rotate: 5, transition: { duration: 0.5 } }}
                  >
                    <img
                      src={service.image}
                      alt={service.title}
                      className="object-contain w-full h-full"
                    />
                  </motion.div>
                </div>

                {/* Card Content */}
                <CardContent className="p-6">
                  <h3 className={`text-xl font-bold mb-2 ${service.textColor}`}>{service.title}</h3>
                  <p className="text-slate-600 text-sm">{service.description}</p>
                </CardContent>

                {/* Card Footer */}
                <CardFooter className="p-6 pt-0">
                  <Button 
                    variant="ghost" 
                    className={`group-hover:bg-gradient-to-r group-hover:from-primary group-hover:to-secondary group-hover:text-white transition-all duration-300 px-6 ${service.textColor}`}
                  >
                    Learn More
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.7, delay: 1 }}
          className="mt-16 text-center"
        >
          <Button className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white px-8 py-6 rounded-full text-lg">
            Explore All Services
          </Button>
        </motion.div>
      </div>
    </section>
  )
}

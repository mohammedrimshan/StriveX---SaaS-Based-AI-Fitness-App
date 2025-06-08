import { Button } from "@/components/ui/button"
import { Play } from "lucide-react"

export default function Hero() {
  return (
    <section className="relative h-screen w-full overflow-hidden">
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 h-full w-full object-cover"
      >
        <source src="https://res.cloudinary.com/strivex/video/upload/v1744658808/we3zwxepnar2lwgzmd9y.mp4" type="video/mp4" />
      </video>

      <div className="absolute inset-0 bg-black/60"></div>

      <div className="relative z-10 mx-auto flex h-full max-w-6xl flex-col justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-xl animate-fade-in">
          <h1 className="mb-4 font-sans text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl">
            ELEVATE YOUR FITNESS JOURNEY
          </h1>
          <p className="mb-8 text-lg text-white/90">
            Experience the Future of Fitness with Our State-of-the-Art Facilities, Expert Trainers, and Personalized Programs.
          </p>
          <div className="flex flex-wrap gap-4">
            <Button size="lg" className="bg-purple-600 hover:bg-purple-700">
              Start Free Trial
            </Button>
            <Button size="lg" variant="outline" className="border-white text-black hover:bg-white/10">
              <Play className="mr-2 h-4 w-4" /> Watch Video
            </Button>
          </div>
          
          <div className="mt-12 flex items-center gap-8">
            <div className="text-white">
              <p className="text-3xl font-bold">1000+</p>
              <p className="text-sm opacity-80">Active Members</p>
            </div>
            <div className="text-white">
              <p className="text-3xl font-bold">50+</p>
              <p className="text-sm opacity-80">Expert Trainers</p>
            </div>
            <div className="text-white">
              <p className="text-3xl font-bold">100%</p>
              <p className="text-sm opacity-80">Satisfaction Rate</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

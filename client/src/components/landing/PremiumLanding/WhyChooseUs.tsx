import { Button } from "@/components/ui/button"
import { CheckCircle } from "lucide-react"

const benefits = [
  {
    title: "Elite Training Experience",
    description: "World-class certified trainers providing personalized guidance for optimal results."
  },
  {
    title: "Cutting-Edge Facilities",
    description: "Premium equipment and modern amenities designed for the ultimate workout experience."
  },
  {
    title: "Holistic Wellness Approach",
    description: "Comprehensive programs combining fitness, nutrition, and mental well-being."
  },
  {
    title: "Flexible Membership Options",
    description: "Tailored plans to fit your schedule and budget with no long-term commitments."
  }
];

export default function WhyChooseUs() {
  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 md:grid-cols-2 md:items-center">
          <div className="relative h-[500px] overflow-hidden rounded-xl transform hover:scale-105 transition-transform duration-300">
            <img
              src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48"
              alt="People working out at StriveX Studio"
              className="h-full w-full object-cover"
              style={{ objectPosition: "center" }}
            />
          </div>

          <div className="animate-fade-in">
            <h2 className="mb-6 text-3xl font-bold tracking-tight bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
              Why Choose StriveX Studio?
            </h2>
            <p className="mb-8 text-muted-foreground text-lg">
              Join a Community That Empowers You to Reach New Heights in Your Fitness Journey.
            </p>

            <div className="space-y-6">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex gap-4 hover:transform hover:translate-x-2 transition-transform duration-300">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-purple-100">
                    <CheckCircle className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{benefit.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <Button className="mt-8 bg-purple-600 hover:bg-purple-700">
              Explore More
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
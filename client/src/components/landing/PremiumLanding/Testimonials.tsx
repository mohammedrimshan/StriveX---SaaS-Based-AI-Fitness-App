import { Star } from "lucide-react"

const testimonials = [
  {
    name: "Emily Thompson",
    role: "Marketing Director",
    content: "The trainers at StriveX are incredible! I've lost 30 pounds and gained so much confidence. The supportive community keeps me motivated every day.",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330",
    rating: 5
  },
  {
    name: "Michael Chen",
    role: "Software Engineer",
    content: "Best gym I've ever been to! The personalized programs and nutrition guidance have helped me achieve results I never thought possible.",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d",
    rating: 5
  },
  {
    name: "Sarah Williams",
    role: "Photographer",
    content: "The variety of classes and expert instruction make every workout exciting. I've found a fitness home here and made amazing friends along the way.",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80",
    rating: 5
  },
]

export default function Testimonials() {
  return (
    <section className="py-16 md:py-24 bg-gray-50">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
            Success Stories
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Real Results from Real Members
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="group rounded-lg border p-6 shadow-sm hover:shadow-lg transition-all duration-300 bg-white">
              <div className="mb-4 flex">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>

              <p className="mb-6 text-sm italic">{testimonial.content}</p>

              <div className="flex items-center gap-3">
                <div className="relative h-12 w-12 overflow-hidden rounded-full">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                </div>
                <div>
                  <p className="font-semibold">{testimonial.name}</p>
                  <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

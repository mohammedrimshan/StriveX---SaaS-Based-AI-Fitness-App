import { Button } from "@/components/ui/button"

const services = [
  {
    title: "Personal Training",
    description: "One-on-one expert coaching tailored to your specific goals and fitness level.",
    image: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b",
  },
  {
    title: "Group Fitness Classes",
    description: "Dynamic group sessions for cardio, strength, yoga, and more.",
    image: "https://images.unsplash.com/photo-1518310383802-640c2de311b2",
  },
  {
    title: "Nutrition Coaching",
    description: "Personalized meal plans and guidance from certified nutritionists.",
    image: "https://images.unsplash.com/photo-1490645935967-10de6ba17061",
  },
  {
    title: "Mind & Body",
    description: "Holistic wellness programs focusing on mental and physical balance.",
    image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b",
  },
  {
    title: "HIIT Training",
    description: "High-intensity interval training for maximum calorie burn.",
    image: "https://images.unsplash.com/photo-1549576490-b0b4831ef60a",
  },
  {
    title: "Strength Training",
    description: "Build muscle and increase strength with expert guidance.",
    image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48",
  },
]

export default function Services() {
  return (
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
            <div key={index} 
                 className="group overflow-hidden rounded-lg bg-white shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
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
                <Button className="w-full bg-purple-600 hover:bg-purple-700">Learn More</Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
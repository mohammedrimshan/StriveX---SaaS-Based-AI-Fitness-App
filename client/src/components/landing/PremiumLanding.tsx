import Hero from "./PremiumLanding/Hero"
import WhyChooseUs from "./PremiumLanding/WhyChooseUs"
import Services from "./PremiumLanding/Services"
import PricingPlans from "./PremiumLanding/PricingPlans"
import Testimonials from "./PremiumLanding/Testimonials"
import CallToAction from "./PremiumLanding/CallToAction"
import Footer from "./PremiumLanding/Footer"

export default function PremiumLanding() {
  return (
    <main className="min-h-screen">
      <Hero />
      <WhyChooseUs />
      <Services />
      <PricingPlans />
      <Testimonials />
      <CallToAction />
      <Footer />
    </main>
  )
}

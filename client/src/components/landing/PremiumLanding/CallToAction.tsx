import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function CallToAction() {
  return (
    <section className="relative py-16 md:py-24">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48')",
          backgroundPosition: "center 25%",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/90 to-blue-900/90"></div>
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-white sm:text-4xl animate-fade-in">
            Start Your Fitness Journey Today
          </h2>
          <p className="mb-8 text-lg text-white/90">
            Join StriveX Studio and Get Your First Week Free! Transform Your Life with Expert Guidance and a Supportive Community.
          </p>

          <div className="mx-auto flex max-w-md flex-col gap-4 sm:flex-row">
            <Input
              type="email"
              placeholder="Enter your email"
              className="h-12 border-white/20 bg-white/10 text-white placeholder:text-white/60 focus-visible:ring-purple-500"
            />
            <Button className="h-12 whitespace-nowrap bg-purple-600 hover:bg-purple-700">
              Claim Free Trial
            </Button>
          </div>

          <p className="mt-4 text-xs text-white/60">
            No credit card required. 7-day free trial.
          </p>
        </div>
      </div>
    </section>
  )
}

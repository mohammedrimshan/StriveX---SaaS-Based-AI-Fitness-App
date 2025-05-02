"use client";

import { Check, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef } from "react";
import { getAllMembershipPlans } from "@/services/client/clientService";
import { MembershipPaymentFlow } from "@/components/modals/RefundPolicyModal";
import { toast } from "react-hot-toast";

// Define types for your plan data
interface MembershipPlan {
  id: string;
  name: string;
  durationMonths: number;
  price: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Extended plan with UI properties
interface UIEnhancedPlan extends MembershipPlan {
  popular: boolean;
  cta: string;
  color: string;
  shadow: string;
  features: string[];
}

export default function PricingPlans() {
  const [isYearly, setIsYearly] = useState<boolean>(false);
  const [hoveredPlan, setHoveredPlan] = useState<number | null>(null);
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [plans, setPlans] = useState<UIEnhancedPlan[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedPlan, setSelectedPlan] = useState<UIEnhancedPlan | null>(null);

  useEffect(() => {
    // Trigger entrance animation
    setIsVisible(true);

    // Fetch plans from API
    const fetchPlans = async () => {
      try {
        setLoading(true);
        const response = await getAllMembershipPlans({ page: 1, limit: 10, search: "" });

        if (response.success && response.plans) {
          const mappedPlans = response.plans.map((plan, index) => {
            const colorSchemes = [
              { color: "from-blue-400 to-cyan-500", shadow: "shadow-blue-300/20" },
              { color: "from-purple-500 to-indigo-600", shadow: "shadow-purple-300/30" },
              { color: "from-pink-500 to-rose-600", shadow: "shadow-pink-300/20" },
            ];

            const colorIndex = index % colorSchemes.length;

            return {
              ...plan,
              popular: index === 1,
              cta: "Get Started",
              ...colorSchemes[colorIndex],
              features: [
                `${plan.durationMonths} Month Membership`,
                "Access to Gym Equipment",
                "Group Classes",
                "Locker Room Access",
              ],
            } as UIEnhancedPlan;
          });

          setPlans(mappedPlans);
        } else {
          setError("Failed to load plans");
        }
      } catch (err) {
        setError("Error loading plans");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  const formatPrice = (price: number): string => {
    return `$${price}`;
  };

  const getPrice = (plan: UIEnhancedPlan, isYearly: boolean): string => {
    if (isYearly) {
      return formatPrice(plan.price * plan.durationMonths);
    }
    return formatPrice(plan.price);
  };

  const nextSlide = () => {
    setActiveIndex((prevIndex) => (prevIndex + 1) % plans.length);
  };

  const prevSlide = () => {
    setActiveIndex((prevIndex) => (prevIndex - 1 + plans.length) % plans.length);
  };

  const getCardPositionClass = (index: number) => {
    const position = (index - activeIndex + plans.length) % plans.length;

    if (position === 0) return "z-20 scale-100 opacity-100 translate-x-0";
    if (position === 1 || position === plans.length - 1) {
      return position === 1
        ? "z-10 scale-90 opacity-70 translate-x-[85%] pointer-events-none"
        : "z-10 scale-90 opacity-70 -translate-x-[85%] pointer-events-none";
    }
    return "scale-75 opacity-0 pointer-events-none";
  };

  const handleGetStarted = (plan: UIEnhancedPlan) => {
    setSelectedPlan(plan);
    setIsModalOpen(true);
  };

  const handleAgreementConfirmed = () => {
    if (selectedPlan) {
      toast.success(`Your ${selectedPlan.name} plan has been successfully activated.`, {
        duration: 5000,
      });

      setIsModalOpen(false);
      setSelectedPlan(null);
    }
  };

  if (loading) {
    return <div className="py-16 text-center">Loading plans...</div>;
  }

  if (error) {
    return <div className="py-16 text-center text-red-500">{error}</div>;
  }

  return (
    <section className="py-16 md:py-24 overflow-hidden">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div
          className={`mb-12 text-center transform transition-all duration-700 ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
          }`}
        >
          <h2 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-violet-600 to-blue-500 bg-clip-text text-transparent">
            Choose Your Perfect Plan
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Flexible Membership Options to Fit Your Goals and Lifestyle
          </p>
          <div className="mt-8 flex justify-center gap-2 relative">
            <div className="bg-slate-100 p-1 rounded-lg flex">
              <Button
                variant={isYearly ? "ghost" : "default"}
                onClick={() => setIsYearly(false)}
                className={`relative z-10 ${
                  !isYearly ? "bg-gradient-to-r from-violet-600 to-blue-500 text-white" : "bg-transparent text-slate-700"
                }`}
              >
                Monthly
              </Button>
              <Button
                variant={!isYearly ? "ghost" : "default"}
                onClick={() => setIsYearly(true)}
                className={`relative z-10 ${
                  isYearly ? "bg-gradient-to-r from-violet-600 to-blue-500 text-white" : "bg-transparent text-slate-700"
                }`}
              >
                Full Duration
              </Button>
            </div>
          </div>
        </div>

        <div className="relative px-4 py-8">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 z-30">
            <Button
              onClick={prevSlide}
              variant="outline"
              size="icon"
              className="rounded-full shadow-md hover:bg-gradient-to-r from-violet-600 to-blue-500 hover:text-white transition-all duration-300"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </div>

          <div className="absolute right-0 top-1/2 -translate-y-1/2 z-30">
            <Button
              onClick={nextSlide}
              variant="outline"
              size="icon"
              className="rounded-full shadow-md hover:bg-gradient-to-r from-violet-600 to-blue-500 hover:text-white transition-all duration-300"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>

          <div ref={carouselRef} className="flex justify-center items-center h-[500px] overflow-visible">
            {plans.map((plan, index) => (
              <div
                key={index}
                className={`absolute w-full max-w-sm transition-all duration-500 ${getCardPositionClass(index)} ${
                  plan.popular ? "border-purple-400 ring-1 ring-purple-400" : "border-slate-200"
                } ${
                  hoveredPlan === index && index === activeIndex ? "shadow-xl" : "shadow-md"
                } rounded-xl border bg-white p-6`}
                onMouseEnter={() => index === activeIndex && setHoveredPlan(index)}
                onMouseLeave={() => setHoveredPlan(null)}
              >
                {plan.popular && (
                  <div className="absolute -top-3 right-6 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 px-3 py-1 text-xs font-medium text-white flex items-center gap-1">
                    <Sparkles className="h-3 w-3" />
                    Most Popular
                  </div>
                )}
                <div className="mb-6">
                  <h3 className="text-xl font-bold">{plan.name}</h3>
                  <div className="mt-3 flex items-baseline">
                    <span
                      className={`text-4xl font-bold bg-gradient-to-r ${plan.color} bg-clip-text text-transparent transition-all duration-300`}
                    >
                      {getPrice(plan, isYearly)}
                    </span>
                    <span className="ml-1 text-muted-foreground">{isYearly ? ` total` : "/month"}</span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {plan.durationMonths} month{plan.durationMonths > 1 ? "s" : ""} membership
                  </p>
                </div>

                <ul className="mb-6 space-y-3">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <div className={`rounded-full p-1 bg-gradient-to-r ${plan.color}`}>
                        <Check className="h-3 w-3 text-white" />
                      </div>
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className={`w-full bg-gradient-to-r ${plan.color} text-white hover:shadow-lg transition-all duration-300 ${plan.shadow} relative overflow-hidden group`}
                  onClick={() => handleGetStarted(plan)}
                >
                  <span className="relative z-10">{plan.cta}</span>
                  <span className="absolute top-0 left-0 w-full h-0 bg-white/20 group-hover:h-full transition-all duration-300"></span>
                </Button>
              </div>
            ))}
          </div>

          <div className="flex justify-center gap-2 mt-8">
            {plans.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveIndex(index)}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                  index === activeIndex
                    ? "bg-gradient-to-r from-violet-600 to-blue-500 w-6"
                    : "bg-slate-300 hover:bg-slate-400"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>

      {selectedPlan && (
        <MembershipPaymentFlow
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          planName={selectedPlan.name}
          planPrice={selectedPlan.price}
          planInterval={isYearly ? "total" : "month"}
          planId={selectedPlan.id}
          trainerId={null} 
          onConfirm={handleAgreementConfirmed}
        />
      )}
    </section>
  );
}
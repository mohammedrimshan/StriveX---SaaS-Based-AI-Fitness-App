import React, { useState, useEffect, useRef } from "react";
import { 
  UserPlus, 
  ClipboardCheck, 
  Calendar, 
  Users, 
  CreditCard, 
  TrendingUp 
} from "lucide-react";

const HowItWorks = () => {
  const [activeStep, setActiveStep] = useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);
  
  const steps = [
    {
      icon: <UserPlus className="h-8 w-8" />,
      title: "Create Your Account",
      description: "Sign up on StriveX and complete your professional profile, highlighting your specializations, experience, and training philosophy.",
      image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
    },
    {
      icon: <ClipboardCheck className="h-8 w-8" />,
      title: "Verification Process",
      description: "Submit your credentials for our quick verification process. We ensure all trainers meet industry standards to maintain platform quality.",
      image: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
    },
    {
      icon: <Calendar className="h-8 w-8" />,
      title: "Set Your Schedule",
      description: "Define your availability and let our AI optimize your calendar. Set your rates and package offerings for different client needs.",
      image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: "Connect With Clients",
      description: "Browse potential clients or wait for them to discover you. Our matching algorithm connects you with clients who match your expertise.",
      image: "https://images.unsplash.com/photo-1571019613591-2aacd4639e15?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
    },
    {
      icon: <CreditCard className="h-8 w-8" />,
      title: "Secure Payments",
      description: "Receive payments directly through our secure platform. No more chasing payments or dealing with administrative hassles.",
      image: "https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
    },
    {
      icon: <TrendingUp className="h-8 w-8" />,
      title: "Grow Your Business",
      description: "Utilize our analytics to track performance, client satisfaction, and areas for growth. Scale your business with StriveX's tools.",
      image: "https://images.unsplash.com/photo-1549576490-b0b4831ef60a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
    }
  ];
  
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev === steps.length - 1 ? 0 : prev + 1));
    }, 5000);
    
    return () => clearInterval(interval);
  }, [steps.length]);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in');
          }
        });
      },
      { threshold: 0.1 }
    );
    
    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }
    
    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  return (
    <section id="how-it-works" className="py-24 bg-gray-50" ref={sectionRef}>
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-2xl mx-auto mb-16 opacity-0 animate-fade-in">
          <span className="px-3 py-1 bg-violet-100 rounded-full text-violet-800 text-sm font-medium">
            Simple Process
          </span>
          <h2 className="mt-6 mb-4">How StriveX Works for Trainers</h2>
          <p className="text-foreground/70 text-lg">
            Get started in minutes and transform how you manage your fitness business
            with our streamlined onboarding process.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div className="order-2 lg:order-1">
            <div className="space-y-6">
              {steps.map((step, index) => (
                <div
                  key={index}
                  className={`rounded-xl p-6 transition-all duration-500 cursor-pointer relative ${
                    activeStep === index
                      ? "bg-white shadow-card border-l-4 border-violet-600"
                      : "bg-white/50 hover:bg-white hover:shadow-soft"
                  }`}
                  onClick={() => setActiveStep(index)}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-14 h-14 rounded-lg flex items-center justify-center transition-colors ${
                        activeStep === index ? "bg-violet-100 text-violet-700" : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {step.icon}
                    </div>
                    <div>
                      <h3 className="text-xl font-medium mb-2">{step.title}</h3>
                      <p className="text-foreground/70">{step.description}</p>
                    </div>
                  </div>
                  
                  {activeStep === index && (
                    <div className="absolute -right-3 top-1/2 transform -translate-y-1/2 h-0 w-0 border-y-8 border-y-transparent border-l-8 border-l-white"></div>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          <div className="order-1 lg:order-2 h-[400px] md:h-[500px] relative rounded-2xl overflow-hidden">
            {steps.map((step, index) => (
              <div
                key={index}
                className={`absolute inset-0 transition-opacity duration-1000 ${
                  activeStep === index ? "opacity-100" : "opacity-0"
                }`}
                aria-hidden={activeStep !== index}
              >
                <img
                  src={step.image}
                  alt={step.title}
                  className="w-full h-full object-cover rounded-2xl"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                
                <div className="absolute bottom-6 left-6 right-6 bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-soft">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-violet-100 rounded-lg flex items-center justify-center text-violet-700">
                      {step.icon}
                    </div>
                    <h4 className="font-medium">{step.title}</h4>
                  </div>
                </div>
              </div>
            ))}
            
            <div className="absolute bottom-24 left-0 right-0 flex justify-center gap-2 z-10">
              {steps.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveStep(index)}
                  className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                    activeStep === index ? "bg-white w-8" : "bg-white/50"
                  }`}
                  aria-label={`Go to step ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
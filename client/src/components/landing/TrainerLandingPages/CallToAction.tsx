import React, { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle, ChevronRight } from "lucide-react";

const CallToAction = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  
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

  const benefits = [
    "60-day free trial for trainers",
    "Access to premium client network",
    "Complete business management tools",
    "AI-powered scheduling and matching",
    "Secure payment processing",
    "Dedicated support for trainers"
  ];

  return (
    <section id="contact" className="py-24 bg-gradient-to-br from-violet-600 to-violet-800 text-white" ref={sectionRef}>
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="opacity-0 animate-fade-in">
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-balance">Ready to Elevate Your Training Business?</h2>
              <p className="text-white/90 text-lg mb-8">
                Join thousands of fitness professionals who are growing their businesses, increasing their income, and delivering exceptional client experiences with StriveX.
              </p>
              
              <ul className="space-y-4 mb-10">
                {benefits.map((benefit, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-300 flex-shrink-0" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg" 
                  className="bg-white text-violet-700 hover:bg-white/90 transition-all duration-300 hover:shadow-glow group"
                >
                  Get Started Now
                  <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  className="border-white hover:bg-white/10 hover:text-white"
                >
                  Book a Demo
                </Button>
              </div>
            </div>
            
            <div className="opacity-0 animate-fade-in animate-delay-300 relative">
              <div className="rounded-xl overflow-hidden relative shadow-xl">
                <img
                  src="https://images.unsplash.com/photo-1576678927484-cc907957088c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
                  alt="Fitness trainer with client"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-violet-900/20"></div>
              </div>
              
              <div className="absolute -bottom-8 -left-8 bg-white p-6 rounded-xl shadow-lg max-w-xs transform rotate-2 animate-float">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center text-violet-600">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/>
                      <path d="m9 12 2 2 4-4"/>
                    </svg>
                  </div>
                  <div>
                    <p className="text-gray-900 font-medium">Joined StriveX 2 months ago</p>
                    <p className="text-gray-600 text-sm mt-1">Client base increased by 45%</p>
                  </div>
                </div>
              </div>
              
              <div className="absolute -top-6 -right-6 bg-white p-4 rounded-lg shadow-lg rotate-3 animate-float" style={{ animationDelay: '1s' }}>
                <div className="flex items-center justify-center w-full h-full">
                  <div className="text-center">
                    <div className="text-violet-600 font-bold text-2xl">$2,400</div>
                    <div className="text-gray-600 text-xs">Average Monthly Revenue</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;

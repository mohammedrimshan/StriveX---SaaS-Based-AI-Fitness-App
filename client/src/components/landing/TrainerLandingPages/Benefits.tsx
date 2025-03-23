import React, { useEffect, useRef } from "react";
import { 
  Calendar, 
  DollarSign, 
  LineChart, 
  MessageCircle, 
  Shield, 
  Smartphone 
} from "lucide-react";

const Benefits = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );
    
    const elements = document.querySelectorAll('.benefit-card');
    elements.forEach(element => {
      observer.observe(element);
    });
    
    return () => {
      elements.forEach(element => {
        observer.unobserve(element);
      });
    };
  }, []);

  const benefits = [
    {
      icon: <DollarSign className="h-6 w-6 text-violet-600" />,
      title: "Maximize Your Income",
      description: "Set your own rates and access premium clients willing to pay for quality. Earn more with less administrative overhead.",
      color: "bg-violet-50",
      delay: "0"
    },
    {
      icon: <Calendar className="h-6 w-6 text-blue-500" />,
      title: "Smart Scheduling",
      description: "Our AI-powered calendar optimizes your availability, reducing gaps and maximizing your billable hours.",
      color: "bg-blue-50",
      delay: "100"
    },
    {
      icon: <LineChart className="h-6 w-6 text-green-500" />,
      title: "Client Progress Tracking",
      description: "Detailed analytics and progress tracking for each client, helping you deliver better results and retain clients longer.",
      color: "bg-green-50",
      delay: "200"
    },
    {
      icon: <MessageCircle className="h-6 w-6 text-pink-500" />,
      title: "Seamless Communication",
      description: "Built-in messaging, workout sharing, and feedback tools to maintain strong client relationships.",
      color: "bg-pink-50",
      delay: "300"
    },
    {
      icon: <Smartphone className="h-6 w-6 text-orange-500" />,
      title: "Mobile Accessibility",
      description: "Manage your business from anywhere with our powerful mobile app. Never miss a client opportunity.",
      color: "bg-orange-50",
      delay: "400"
    },
    {
      icon: <Shield className="h-6 w-6 text-indigo-500" />,
      title: "Secure & Professional",
      description: "Industry-standard security protocols and professional interfaces build trust with your client base.",
      color: "bg-indigo-50",
      delay: "500"
    }
  ];

  return (
    <section id="benefits" className="py-24 bg-white" ref={sectionRef}>
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-2xl mx-auto mb-16 opacity-0 animate-fade-in">
          <span className="px-3 py-1 bg-violet-100 rounded-full text-violet-800 text-sm font-medium">
            Why Choose StriveX
          </span>
          <h2 className="mt-6 mb-4">Benefits for Fitness Professionals</h2>
          <p className="text-foreground/70 text-lg">
            Our platform is designed to solve the everyday challenges fitness trainers face,
            letting you focus on what matters most—helping your clients achieve their goals.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <div 
              key={index}
              className={`benefit-card opacity-0 p-8 rounded-xl border border-gray-100 shadow-soft transition-all duration-300 hover:shadow-card hover:-translate-y-1`}
              style={{ animationDelay: `${parseInt(benefit.delay) + 200}ms` }}
            >
              <div className={`w-14 h-14 ${benefit.color} rounded-xl flex items-center justify-center mb-6`}>
                {benefit.icon}
              </div>
              <h3 className="text-xl font-medium mb-3">{benefit.title}</h3>
              <p className="text-foreground/70">{benefit.description}</p>
            </div>
          ))}
        </div>
        
        <div className="mt-20 max-w-4xl mx-auto opacity-0 animate-fade-in animate-delay-700">
          <div className="glass-card rounded-2xl overflow-hidden p-8 md:p-12 relative">
            <div className="relative z-10">
              <h3 className="text-2xl md:text-3xl font-semibold mb-4 text-balance">Ready to transform your fitness business?</h3>
              <p className="text-foreground/80 mb-8">
                Join StriveX today and experience the difference our AI-powered platform can make for your fitness career.
              </p>
              <button className="px-6 py-3 bg-violet-600 text-white rounded-lg font-medium hover:bg-violet-700 transition-colors duration-300 hover:shadow-glow">
                Start Your Free Trial
              </button>
            </div>
            
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-violet-200 rounded-full blur-3xl opacity-50 animate-pulse-soft"></div>
            <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-64 h-64 bg-blue-100 rounded-full blur-3xl opacity-40 animate-pulse-soft" style={{ animationDelay: '1s' }}></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Benefits;
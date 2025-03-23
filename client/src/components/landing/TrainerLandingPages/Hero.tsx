
import React, { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ChevronRight, Zap, Clock, Users } from "lucide-react";

const Hero = () => {
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!heroRef.current) return;
      
      const { clientX, clientY } = e;
      const { left, top, width, height } = heroRef.current.getBoundingClientRect();
      
      const x = (clientX - left) / width;
      const y = (clientY - top) / height;
      
      const moveX = x * 20 - 10;
      const moveY = y * 20 - 10;
      
      const elements = heroRef.current.querySelectorAll('.parallax');
      elements.forEach((el) => {
        const htmlEl = el as HTMLElement;
        const speedX = parseFloat(htmlEl.dataset.speedX || '1');
        const speedY = parseFloat(htmlEl.dataset.speedY || '1');
        
        htmlEl.style.transform = `translate(${moveX * speedX}px, ${moveY * speedY}px)`;
      });
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div className="overflow-hidden">
      <div 
        ref={heroRef}
        className="min-h-screen pt-20 flex flex-col justify-center relative"
      >
        {/* Decorative Elements */}
        <div 
          className="absolute w-64 h-64 bg-violet-200 rounded-full -top-20 -left-20 blur-3xl opacity-50 parallax"
          data-speed-x="0.5"
          data-speed-y="0.5"
        ></div>
        <div 
          className="absolute w-96 h-96 bg-pink-100 rounded-full -bottom-40 -right-40 blur-3xl opacity-40 parallax"
          data-speed-x="0.7"
          data-speed-y="0.7"
        ></div>
        <div 
          className="absolute w-32 h-32 bg-blue-100 rounded-full top-1/4 right-1/4 blur-3xl opacity-60 parallax"
          data-speed-x="1.5"
          data-speed-y="1.5"
        ></div>

        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="max-w-5xl mx-auto">
            <div className="text-center">
              <div className="inline-block mb-6 opacity-0 animate-fade-in">
                <span className="px-3 py-1 bg-violet-100 rounded-full text-violet-800 text-sm font-medium">
                  Trainers Platform
                </span>
              </div>
              
              <h1 className="opacity-0 animate-fade-in animate-delay-100 mb-6 font-bold text-balance">
                <span className="block">Elevate Your Fitness Career with</span>
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-700 to-violet-500">
                  StriveX Trainer Platform
                </span>
              </h1>
              
              <p className="opacity-0 animate-fade-in animate-delay-200 mb-8 text-lg text-foreground/80 max-w-2xl mx-auto text-balance">
                Join the next generation of fitness professionals. Get more clients, streamline your scheduling, and grow your business with our AI-powered platform.
              </p>
              
              <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12 opacity-0 animate-fade-in animate-delay-300">
                <Button 
                  size="lg" 
                  className="bg-violet-600 hover:bg-violet-700 transition-all duration-300 hover:shadow-glow group"
                >
                  Get Started
                  <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  className="border-violet-300 hover:bg-violet-50"
                >
                  Learn More
                </Button>
              </div>
            </div>
            
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="glass-card rounded-xl p-6 text-center opacity-0 animate-fade-in animate-delay-400 hover-lift">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="h-6 w-6 text-blue-400" />
                </div>
                <h3 className="text-xl font-medium mb-2">Grow Your Client Base</h3>
                <p className="text-foreground/70">Access StriveX's premium user network seeking professional trainers</p>
              </div>
              
              <div className="glass-card rounded-xl p-6 text-center opacity-0 animate-fade-in animate-delay-500 hover-lift">
                <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="h-6 w-6 text-pink-400" />
                </div>
                <h3 className="text-xl font-medium mb-2">Smart Scheduling</h3>
                <p className="text-foreground/70">AI-optimized calendar to maximize your availability and revenue</p>
              </div>
              
              <div className="glass-card rounded-xl p-6 text-center opacity-0 animate-fade-in animate-delay-700 hover-lift">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-6 w-6 text-green-400" />
                </div>
                <h3 className="text-xl font-medium mb-2">Client Management</h3>
                <p className="text-foreground/70">Track progress, send workouts, and build stronger relationships</p>
              </div>
            </div>
          </div>
          
          <div className="relative mt-20 max-w-4xl mx-auto h-[350px] sm:h-[400px] md:h-[450px] lg:h-[500px] opacity-0 animate-fade-in animate-delay-1000">
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-transparent to-background/70 rounded-2xl overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1571902943202-507ec2618e8f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80" 
                alt="Trainer with client" 
                className="w-full h-full object-cover rounded-2xl object-center" 
              />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-violet-950/30 rounded-2xl"></div>
              <div className="absolute bottom-8 left-0 right-0 text-center">
                <span className="inline-block bg-white/90 backdrop-blur-sm text-violet-800 px-4 py-2 rounded-full font-medium shadow-sm">
                  Join 1,000+ fitness professionals on StriveX
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
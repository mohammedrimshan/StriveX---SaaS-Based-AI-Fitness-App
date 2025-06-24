import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";

const Hero = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  // Get trainer data from Redux
  const trainer = useSelector((state: RootState) => state.trainer.trainer);
  const clientCount =trainer?.clientCount; 

  // Combine firstName and lastName for full name
  const fullName = trainer ? `${trainer.firstName} ${trainer.lastName}` : "Trainer";

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      if (heroRef.current) {
        const elements = heroRef.current.querySelectorAll('.parallax');
        elements.forEach((el) => {
          const htmlEl = el as HTMLElement;
          const speed = parseFloat(htmlEl.dataset.speed || '0.5');
          htmlEl.style.transform = `translateY(${scrollPosition * speed}px)`;
        });
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="relative bg-white overflow-hidden" ref={heroRef}>
      <div className="pt-24 pb-16 md:pt-32 md:pb-24">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 animate-fade-in">
              <div className="inline-block px-4 py-1.5 bg-violet-100 rounded-full text-violet-800 text-sm font-medium">
                Welcome back, {fullName}!
              </div>
              
              <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                Manage your fitness business <span className="text-violet-600">all in one place</span>
              </h1>
              
              <p className="text-lg text-gray-600 max-w-lg">
                Track clients, schedule sessions, and grow your business with our all-in-one platform designed specifically for fitness professionals.
              </p>
              
              <div className="flex flex-wrap gap-4">
                <Button 
                  className="bg-violet-600 hover:bg-violet-700 text-white px-6 py-2 h-auto" 
                  onClick={() => navigate("/trainer/bookslots")}
                >
                  View Schedule
                </Button>
              </div>
              
              <div className="flex items-center space-x-4 pt-4">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <Avatar key={i} className="h-8 w-8 border-2 border-white">
                      <AvatarImage src={`https://i.pravatar.cc/100?img=${i + 10}`} alt={`Client ${i}`} />
                      <AvatarFallback>C{i}</AvatarFallback>
                    </Avatar>
                  ))}
                </div>
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">Total {clientCount} clients</span> 
                </p>
              </div>
            </div>
            
            <div className="relative animate-fade-in animate-delay-300">
              <div className="relative z-10 rounded-2xl overflow-hidden shadow-2xl border border-gray-100 transform hover:scale-[1.02] transition-transform duration-500">
                <img 
                  src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80" 
                  alt="Trainer dashboard" 
                  className="w-full h-auto object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-violet-900/40 to-transparent"></div>
              </div>
              
              <div className="absolute top-1/4 -right-6 bg-white p-4 rounded-lg shadow-xl animate-float z-20 border border-gray-100">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Session Completed</p>
                    <p className="text-xs text-gray-500">with Sarah Johnson</p>
                  </div>
                </div>
              </div>
              
              <div className="absolute -bottom-4 -left-4 bg-white p-4 rounded-lg shadow-xl animate-float z-20 border border-gray-100" style={{ animationDelay: '1s' }}>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-violet-100 rounded-full flex items-center justify-center text-violet-600">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"></path>
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium">New Client Request</p>
                    <p className="text-xs text-gray-500">Michael Brown</p>
                  </div>
                </div>
              </div>
              
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-violet-100 rounded-full blur-3xl opacity-70 parallax" data-speed="0.2"></div>
              <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-blue-100 rounded-full blur-3xl opacity-50 parallax" data-speed="0.3"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
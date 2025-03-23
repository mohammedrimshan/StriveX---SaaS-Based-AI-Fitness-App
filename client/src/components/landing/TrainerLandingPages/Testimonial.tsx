import React, { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";

const Testimonials = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const testimonialRef = useRef<HTMLDivElement>(null);
  
  const testimonials = [
    {
      id: 1,
      name: "Sarah Johnson",
      role: "Yoga & Pilates Instructor",
      image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      quote: "StriveX completely transformed my business. I've increased my client base by 40% and spend less time on administration. The scheduling features alone saved me hours each week.",
      rating: 5
    },
    {
      id: 2,
      name: "David Chen",
      role: "Strength & Conditioning Coach",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      quote: "As someone who was skeptical about using technology for my training business, I can't believe how seamless the transition to StriveX was. My clients love the progress tracking, and I've seen a significant boost in retention.",
      rating: 5
    },
    {
      id: 3,
      name: "Marcus Williams",
      role: "Cardio & HIIT Specialist",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      quote: "The client matching algorithm is incredible. I'm connecting with people who truly benefit from my expertise, resulting in better outcomes and more referrals. StriveX understands what fitness professionals need.",
      rating: 4
    },
    {
      id: 4,
      name: "Elena Rodriguez",
      role: "Sports Nutritionist & Trainer",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      quote: "What sets StriveX apart is how it integrates all aspects of my business in one place. From nutrition planning to workout scheduling, everything is connected, giving my clients a premium experience.",
      rating: 5
    }
  ];

  const goToNext = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex((prevIndex) => (prevIndex === testimonials.length - 1 ? 0 : prevIndex + 1));
    setTimeout(() => setIsAnimating(false), 500);
  };

  const goToPrev = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? testimonials.length - 1 : prevIndex - 1));
    setTimeout(() => setIsAnimating(false), 500);
  };
  
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
    
    if (testimonialRef.current) {
      observer.observe(testimonialRef.current);
    }
    
    return () => {
      if (testimonialRef.current) {
        observer.unobserve(testimonialRef.current);
      }
    };
  }, []);
  
  useEffect(() => {
    const interval = setInterval(goToNext, 7000);
    return () => clearInterval(interval);
  }, [isAnimating]);

  return (
    <section id="testimonials" className="py-24 bg-white relative overflow-hidden" ref={testimonialRef}>
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-violet-50 rounded-full blur-3xl opacity-70"></div>
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-blue-50 rounded-full blur-3xl opacity-70"></div>
      </div>
      
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-16 opacity-0 animate-fade-in">
          <span className="px-3 py-1 bg-violet-100 rounded-full text-violet-800 text-sm font-medium">
            Success Stories
          </span>
          <h2 className="mt-6 mb-4">What Trainers Say About StriveX</h2>
          <p className="text-foreground/70 text-lg">
            Hear from fitness professionals who have transformed their businesses using our platform.
          </p>
        </div>

        <div className="max-w-5xl mx-auto relative">
          <div className="relative h-full overflow-hidden">
            <div 
              className="flex transition-transform duration-500 ease-in-out h-full"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {testimonials.map((testimonial) => (
                <div key={testimonial.id} className="w-full flex-shrink-0 px-4">
                  <div className="bg-white rounded-2xl shadow-card p-8 md:p-10 border border-gray-100">
                    <div className="flex flex-col md:flex-row md:items-start gap-6 md:gap-10">
                      <div className="flex-shrink-0">
                        <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-white shadow-soft">
                          <img 
                            src={testimonial.image} 
                            alt={testimonial.name} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex mb-4">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-5 w-5 ${
                                i < testimonial.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        
                        <blockquote className="text-lg md:text-xl text-foreground/90 italic mb-6">
                          "{testimonial.quote}"
                        </blockquote>
                        
                        <div>
                          <h4 className="font-semibold text-lg">{testimonial.name}</h4>
                          <p className="text-violet-600">{testimonial.role}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex justify-between mt-10">
            <button
              onClick={goToPrev}
              className="w-12 h-12 rounded-full bg-white shadow-soft flex items-center justify-center text-violet-600 hover:bg-violet-50 transition-colors"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            
            <div className="flex gap-2 items-center">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    if (isAnimating) return;
                    setIsAnimating(true);
                    setCurrentIndex(index);
                    setTimeout(() => setIsAnimating(false), 500);
                  }}
                  className={`w-3 h-3 rounded-full transition-all ${
                    currentIndex === index
                      ? "bg-violet-600 w-6"
                      : "bg-violet-200 hover:bg-violet-300"
                  }`}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>
            
            <button
              onClick={goToNext}
              className="w-12 h-12 rounded-full bg-white shadow-soft flex items-center justify-center text-violet-600 hover:bg-violet-50 transition-colors"
              aria-label="Next testimonial"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </div>
        </div>
        
        <div className="mt-20 text-center">
          <p className="text-foreground/70 mb-6">Trusted by fitness professionals worldwide</p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
            <div className="grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition-all">
              <div className="bg-gray-200 h-10 w-32 rounded"></div>
            </div>
            <div className="grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition-all">
              <div className="bg-gray-200 h-10 w-28 rounded"></div>
            </div>
            <div className="grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition-all">
              <div className="bg-gray-200 h-10 w-36 rounded"></div>
            </div>
            <div className="grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition-all">
              <div className="bg-gray-200 h-10 w-24 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
import { useEffect } from "react";

import Hero from "./TrainerLandingPages/Hero";

const TrainerLanding = () => {
  useEffect(() => {
    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (this: HTMLAnchorElement, e: Event) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href')?.substring(1);
        if (!targetId) return;
        
        const targetElement = document.getElementById(targetId);
        if (!targetElement) return;
        
        window.scrollTo({
          top: targetElement.offsetTop - 80, 
          behavior: 'smooth'
        });
      });
    });
    
    return () => {
      document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.removeEventListener('click', function (this: HTMLAnchorElement) {});
      });
    };
  }, []);

  return (
    <div className="min-h-screen antialiased">
      <main>
        <Hero />
  
      </main>
    </div>
  );
};

export default TrainerLanding;
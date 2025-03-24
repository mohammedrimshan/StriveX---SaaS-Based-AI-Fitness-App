
import React, { useEffect } from "react";

import Hero from "./TrainerLandingPages/Hero";
import Benefits from "./TrainerLandingPages/Benefits";
import CallToAction from "./TrainerLandingPages/CallToAction";
import HowItWorks from "./TrainerLandingPages/HowItWorks";
import Testimonials from "./TrainerLandingPages/Testimonial";
import TrainerStats from "./TrainerLandingPages/TrainerStats";
const TrainerLanding = () => {
  useEffect(() => {
    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href')?.substring(1);
        if (!targetId) return;
        
        const targetElement = document.getElementById(targetId);
        if (!targetElement) return;
        
        window.scrollTo({
          top: targetElement.offsetTop - 80, // Offset for fixed header
          behavior: 'smooth'
        });
      });
    });
    
    return () => {
      document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.removeEventListener('click', function () {});
      });
    };
  }, []);

  return (
    <div className="min-h-screen antialiased">
      <main>
        <Hero />
        <TrainerStats />
        <Benefits />
        <HowItWorks />
     
        <Testimonials />
        <CallToAction />
      </main>
    </div>
  );
};

export default TrainerLanding;

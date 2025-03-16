"use client"

import { useEffect, useRef } from "react"
// Remove this import since we're handling header in ClientLayout
// import { Header } from "../components/common/Header/PublicHeader"
import { Footer } from "@/components/common/Footer"
import { HeroSection } from "@/components/landing/hero-section"
import { ServicesSection } from "@/components/landing/service-section"
import { PremiumSection } from "@/components/landing/premium-section"
import { DataDrivenSection } from "@/components/landing/data-driven-section"
import { SuccessStoriesSection } from "@/components/landing/success-stories-section"
import { TransformSection } from "@/components/landing/transform-section"
import { ChallengesSection } from "@/components/landing/challenges-section"

export default function Home() {
  const smokeRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!smokeRef.current) return

      const x = e.clientX / window.innerWidth
      const y = e.clientY / window.innerHeight

      smokeRef.current.style.setProperty("--mouse-x", x.toString())
      smokeRef.current.style.setProperty("--mouse-y", y.toString())
    }

    window.addEventListener("mousemove", handleMouseMove)

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
    }
  }, [])

  return (
    <div className="relative overflow-hidden">
      <div ref={smokeRef} className="smoke-effect fixed inset-0 pointer-events-none z-0" />
      {/* Remove the Header component from here */}
      <main>
        <HeroSection />
        <ServicesSection />
        <ChallengesSection />
        <PremiumSection />
        <DataDrivenSection />
        <SuccessStoriesSection />
        <TransformSection />
      </main>
      <Footer />
    </div>
  )
}
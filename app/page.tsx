"use client"
import { GlobeTestimonials } from "@/components/ui/GlobeTestimonials"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between">
      <div className="w-full h-screen">
        <GlobeTestimonials />
      </div>
    </main>
  );
}
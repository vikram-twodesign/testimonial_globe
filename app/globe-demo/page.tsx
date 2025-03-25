"use client"

import { GlobeGL } from "@/components/ui/GlobeGL"

export default function GlobeDemoPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="p-4 bg-slate-900 text-white">
        <h1 className="text-2xl font-bold">Globe.gl Demo</h1>
        <p className="text-sm opacity-80">Click markers to view testimonials</p>
      </header>
      
      <main className="flex-1 relative">
        <GlobeGL />
      </main>
    </div>
  )
} 
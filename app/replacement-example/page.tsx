"use client"

import { SimpleGlobe } from "@/components/ui/SimpleGlobe"

// Example of how you can replace the existing Globe component with SimpleGlobe
export default function ReplacementExamplePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="p-4 bg-slate-900 text-white">
        <h1 className="text-2xl font-bold">Globe Replacement Example</h1>
        <p className="text-sm opacity-80">Demonstrates how to replace the existing Globe component</p>
      </header>
      
      <main className="flex-1 relative">
        {/* Make the globe container fill more of the screen */}
        <div className="absolute inset-0 mx-auto w-full max-w-[800px] h-[80vh] my-auto">
          {/* 
            This is how you would replace the existing Globe component:
            
            Before:
            <Globe 
              config={{
                markers: [...custom markers here...],
                markerColor: [r, g, b],
                // other cobe options
              }} 
            />
            
            After:
            <SimpleGlobe 
              config={{
                markers: [...custom markers here...],
                markerColor: [r, g, b],
                // globe.gl specific options
              }}
            />
          */}
          <SimpleGlobe 
            config={{
              markerColor: [0.2, 0.5, 1], // Blue markers
              autoRotateSpeed: 1, // Faster rotation
              backgroundColor: "rgba(10, 20, 50, 1)", // Dark blue background
            }}
          />
        </div>
      </main>
    </div>
  )
} 
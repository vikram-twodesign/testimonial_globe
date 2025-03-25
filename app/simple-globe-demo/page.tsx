"use client"

import { useEffect, useState } from "react"
import { SimpleGlobe } from "@/components/ui/SimpleGlobe"

export default function SimpleGlobeDemoPage() {
  const [error, setError] = useState<string | null>(null);

  // Error handler for globe initialization
  const handleGlobeError = (err: Error) => {
    console.error("Globe initialization error:", err);
    setError(err.message);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="p-4 bg-slate-900 text-white">
        <h1 className="text-2xl font-bold">SimpleGlobe Demo</h1>
        <p className="text-sm opacity-80">A simpler globe visualization with markers</p>
      </header>
      
      <main className="flex-1 relative">
        {error && (
          <div className="absolute inset-0 flex items-center justify-center z-50 bg-red-50">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg text-center">
              <h3 className="text-xl font-bold text-red-600 mb-2">Error Loading Globe</h3>
              <p className="text-gray-700 mb-4">{error}</p>
              <p className="text-gray-500 text-sm">Check the console for more details.</p>
            </div>
          </div>
        )}
        <div className="absolute inset-0 mx-auto w-full max-w-[800px] h-[80vh] my-auto">
          <SimpleGlobe 
            onError={handleGlobeError}
            config={{
              // Larger markers
              markerColor: [251/255, 100/255, 21/255],
              autoRotate: true,
              autoRotateSpeed: 0.5
            }}
          />
        </div>
      </main>
    </div>
  )
} 
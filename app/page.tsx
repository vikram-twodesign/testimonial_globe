"use client"

import { SimpleGlobe } from "@/components/ui/SimpleGlobe"
import { useState } from "react"

export default function Home() {
  const [error, setError] = useState<string | null>(null);

  // Error handler for globe initialization
  const handleGlobeError = (err: Error) => {
    console.error("Globe initialization error:", err);
    setError(err.message);
  };

  return (
    <div className="min-h-screen">
      {error && (
        <div className="absolute inset-0 flex items-center justify-center z-50 bg-red-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg">
            <h3 className="text-xl font-bold text-red-600 mb-2">Error Loading Globe</h3>
            <p className="text-gray-700">{error}</p>
          </div>
        </div>
      )}
      
      <div className="absolute inset-0">
        <SimpleGlobe 
          onError={handleGlobeError}
          config={{
            // Use default marker color that works
            markerColor: [251/255, 100/255, 21/255],
            autoRotate: true,
            autoRotateSpeed: 0.5
          }}
        />
      </div>
    </div>
  )
}
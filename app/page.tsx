"use client"

import { SimpleGlobe } from "@/components/ui/SimpleGlobe"
import { useState, useEffect } from "react"
import { Sun, Moon } from "lucide-react"

export default function Home() {
  const [error, setError] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState(true);

  // Generate random stars
  const starCount = 100;
  const stars = Array.from({ length: starCount }, () => ({
    top: `${Math.random() * 100}%`,
    left: `${Math.random() * 100}%`,
    size: `${Math.random() * 2 + 1}px`,
    opacity: Math.random() * 0.5 + 0.1,
  }));

  // Error handler for globe initialization
  const handleGlobeError = (err: Error) => {
    console.error("Globe initialization error:", err);
    setError(err.message);
  };

  return (
    <div className={`min-h-screen relative ${darkMode ? 'bg-black' : 'bg-white'}`}>
      {/* Stars */}
      {stars.map((star, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            top: star.top,
            left: star.left,
            width: star.size,
            height: star.size,
            opacity: star.opacity,
            backgroundColor: darkMode ? 'white' : 'black',
          }}
        />
      ))}

      {/* Dark/Light mode toggle button */}
      <button
        className={`fixed top-4 right-4 z-50 p-2 rounded-full shadow-lg ${
          darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800 border border-gray-200'
        }`}
        onClick={() => setDarkMode(!darkMode)}
        aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
      >
        {darkMode ? <Sun size={20} /> : <Moon size={20} />}
      </button>

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
            markerColor: [251/255, 100/255, 21/255],
            autoRotate: true,
            autoRotateSpeed: 0.5,
            // Keep globe appearance consistent across modes
            backgroundColor: "rgba(0, 0, 0, 0)",
            globeImageUrl: '//unpkg.com/three-globe/example/img/earth-blue-marble.jpg'
          }}
        />
      </div>
    </div>
  )
}
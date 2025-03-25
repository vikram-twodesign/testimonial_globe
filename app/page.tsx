"use client"

import { SimpleGlobe } from "@/components/ui/SimpleGlobe"
import { useState, useEffect } from "react"
import { Sun, Moon } from "lucide-react"

export default function Home() {
  const [error, setError] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState(true);

  // Apply dark mode class to document
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Error handler for globe initialization
  const handleGlobeError = (err: Error) => {
    console.error("Globe initialization error:", err);
    setError(err.message);
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Dark/Light mode toggle button */}
      <button
        className={`fixed top-4 right-4 z-50 p-2 rounded-full shadow-lg ${
          darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'
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
            // Use default marker color that works
            markerColor: [251/255, 100/255, 21/255],
            autoRotate: true,
            autoRotateSpeed: 0.5,
            backgroundColor: darkMode ? "rgba(10, 15, 30, 0.2)" : "rgba(255, 255, 255, 0.1)",
            // Use appropriate textures for each mode
            globeImageUrl: darkMode 
              ? '//unpkg.com/three-globe/example/img/earth-night.jpg' 
              : '//unpkg.com/three-globe/example/img/earth-blue-marble.jpg',
            // Make sure bump image works properly in both modes
            bumpImageUrl: '//unpkg.com/three-globe/example/img/earth-topology.png'
          }}
        />
      </div>
    </div>
  )
}
"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { cn } from "@/lib/utils"
import { Moon, Sun, X } from "lucide-react"

// Define the testimonial type
type Testimonial = {
  name: string;
  company: string;
  location: string;
  testimonial: string;
  coordinates: [number, number]; // [latitude, longitude]
  size: number;
};

// Define our testimonials with accurate coordinates
const testimonials: Testimonial[] = [
  {
    name: "Rahul Sharma",
    company: "EcoVentures Chile",
    location: "Santiago, Chile",
    testimonial: "TWO Design transformed our brand identity completely. Their sustainable approach matched our values perfectly, and the results have been incredible for our business growth in Santiago.",
    coordinates: [-33.4489, -70.6693], // Santiago, Chile
    size: 0.15
  },
  {
    name: "Sarah Johnson",
    company: "Artisan Collective",
    location: "Sydney, Australia",
    testimonial: "Working with TWO Design was a revelation. They understood our unique vision for our Sydney-based business and translated it into a cohesive brand strategy that resonates with our customers worldwide.",
    coordinates: [-33.8688, 151.2093], // Sydney, Australia
    size: 0.15
  },
  {
    name: "Michael Chang",
    company: "SustainTech Solutions",
    location: "Cape Town, South Africa",
    testimonial: "The team at TWO Design brings a rare combination of creativity and strategic thinking. Their work helped us establish a distinctive presence in Cape Town's competitive market.",
    coordinates: [-33.9249, 18.4241], // Cape Town, South Africa
    size: 0.15
  },
  {
    name: "Aisha Patel",
    company: "Mindful Spaces",
    location: "Toronto, Canada",
    testimonial: "From concept to execution, TWO Design delivered beyond our expectations. Their thoughtful approach to our Toronto-based branding needs resulted in a visual identity that perfectly captures our essence.",
    coordinates: [43.6532, -79.3832], // Toronto, Canada
    size: 0.15
  },
  {
    name: "Lars Eriksson",
    company: "Nordic Sustainability",
    location: "Moscow, Russia",
    testimonial: "TWO Design's ability to blend aesthetic beauty with functional design is outstanding. They've helped us communicate our commitment to sustainability across Moscow in a visually compelling way.",
    coordinates: [55.7558, 37.6173], // Moscow, Russia
    size: 0.15
  },
  {
    name: "Elena Rodriguez",
    company: "Solaris Energy",
    location: "Jakarta, Indonesia",
    testimonial: "The rebranding work done by TWO Design helped us connect with our customers in Jakarta on a deeper level. Our engagement and conversion metrics have improved significantly since the launch.",
    coordinates: [-6.2088, 106.8456], // Jakarta, Indonesia
    size: 0.15
  },
  {
    name: "Kenji Tanaka",
    company: "Green Future Tech",
    location: "Rio de Janeiro, Brazil",
    testimonial: "TWO Design understood our need to balance traditional values with innovation in the Brazilian market. The result was a brand identity for our Rio office that feels both timeless and contemporary.",
    coordinates: [-22.9068, -43.1729], // Rio de Janeiro, Brazil
    size: 0.15
  }
];

// Pre-generate fixed star positions to avoid hydration errors
const STAR_COUNT = 200;
const starPositions = Array.from({ length: STAR_COUNT }, () => ({
  size: 1 + Math.random(),
  top: Math.random() * 100,
  left: Math.random() * 100,
  opacity: 0.2 + Math.random() * 0.8,
}));

export function GlobeGL({
  className = "",
  showTestimonials = true,
}: {
  className?: string;
  showTestimonials?: boolean;
}) {
  // State variables
  const [mounted, setMounted] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [selectedTestimonial, setSelectedTestimonial] = useState<Testimonial | null>(null);
  const [autoRotate, setAutoRotate] = useState(true);
  const [globeReady, setGlobeReady] = useState(false);
  
  // Refs
  const globeEl = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Set mounted state when component mounts to prevent hydration errors
  useEffect(() => {
    setMounted(true);
  }, []);

  // Dynamically import the Globe component on the client side
  useEffect(() => {
    if (mounted) {
      import('globe.gl').then((GlobeModule) => {
        const Globe = GlobeModule.default;
        
        // Create the globe instance
        if (containerRef.current && !globeEl.current) {
          // Create a DOM element for the globe
          const globeContainer = document.createElement('div');
          globeContainer.style.width = '100%';
          globeContainer.style.height = '100%';
          containerRef.current.appendChild(globeContainer);
          
          // Initialize the globe
          globeEl.current = new Globe(globeContainer);
          
          // Mark the globe as ready
          setGlobeReady(true);
        }
      });
    }
    
    // Clean up function
    return () => {
      if (globeEl.current && containerRef.current) {
        // Clean up globe instance
        const container = containerRef.current;
        while (container.firstChild) {
          container.removeChild(container.firstChild);
        }
        globeEl.current = null;
      }
    };
  }, [mounted]);

  // Handle globe initialization and configuration
  useEffect(() => {
    if (!mounted || !globeReady || !globeEl.current) return;
    
    // Configure the globe
    const globe = globeEl.current;
    
    // Configure colors based on dark/light mode
    const globeColor = darkMode 
      ? 'rgba(30, 58, 138, 1)' // Dark blue for dark mode
      : 'rgba(219, 234, 254, 1)'; // Light blue for light mode
    
    const backgroundColor = darkMode 
      ? 'rgba(0, 0, 0, 1)' // Black background for dark mode
      : 'rgba(255, 255, 255, 1)'; // White background for light mode
    
    const markerColor = darkMode
      ? 'rgba(251, 100, 21, 1)' // Orange marker for dark mode
      : 'rgba(251, 100, 21, 0.9)'; // Slightly transparent orange for light mode
    
    // Configure globe
    globe
      .globeImageUrl('//unpkg.com/three-globe/example/img/earth-blue-marble.jpg')
      .bumpImageUrl('//unpkg.com/three-globe/example/img/earth-topology.png')
      .backgroundColor(backgroundColor)
      .pointsData(testimonials)
      .pointLat((d: Testimonial) => d.coordinates[0])
      .pointLng((d: Testimonial) => d.coordinates[1])
      .pointColor(() => markerColor)
      .pointRadius(0.5)
      .pointAltitude(0.01)
      .pointsMerge(true)
      .atmosphereColor(darkMode ? 'rgba(51, 65, 85, 0.8)' : 'rgba(219, 234, 254, 0.8)')
      .atmosphereAltitude(0.15)
      .onPointClick(handlePointClick);
    
    // Configure auto-rotation
    if (autoRotate) {
      // Start a gentle auto-rotation
      globe.controls().autoRotate = true;
      globe.controls().autoRotateSpeed = 0.5;
    } else {
      globe.controls().autoRotate = false;
    }
    
    // Set initial position
    if (showTestimonials && !selectedTestimonial) {
      globe.pointOfView({ altitude: 2.5 }, 1000);
    }
    
    // Update the canvas size
    if (containerRef.current) {
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      globe.width(width);
      globe.height(height);
    }
    
    // Clean up
    return () => {
      if (globe.controls()) {
        globe.controls().autoRotate = false;
      }
    };
  }, [mounted, darkMode, autoRotate, selectedTestimonial, showTestimonials, globeReady]);

  // Handle window resize
  useEffect(() => {
    if (!mounted || !globeReady || !globeEl.current) return;
    
    const handleResize = () => {
      if (containerRef.current && globeEl.current) {
        const width = containerRef.current.clientWidth;
        const height = containerRef.current.clientHeight;
        globeEl.current.width(width);
        globeEl.current.height(height);
      }
    };
    
    window.addEventListener('resize', handleResize);
    
    // Call once to set initial size
    handleResize();
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [mounted, globeReady]);

  // Handle point click
  const handlePointClick = useCallback((point: Testimonial) => {
    if (!showTestimonials) return;
    
    // Focus on the clicked point
    const { coordinates } = point;
    
    if (globeEl.current) {
      // Stop auto-rotation when a point is clicked
      setAutoRotate(false);
      globeEl.current.controls().autoRotate = false;
      
      // Animate to point position
      globeEl.current.pointOfView(
        {
          lat: coordinates[0],
          lng: coordinates[1],
          altitude: 1.5
        },
        1000 // animation duration in ms
      );
      
      // Show the testimonial after a brief delay
      setTimeout(() => {
        setSelectedTestimonial(point);
      }, 1000);
    }
  }, [showTestimonials]);

  // Generate stars for the background with fixed positions
  const renderStars = useCallback(() => {
    if (!mounted || !darkMode) return null; // Only show stars in dark mode
    
    return (
      <>
        {starPositions.map((star, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              width: `${star.size}px`,
              height: `${star.size}px`,
              top: `${star.top}%`,
              left: `${star.left}%`,
              opacity: star.opacity,
            }}
          />
        ))}
      </>
    );
  }, [darkMode, mounted]);

  // If not mounted yet, return a simple placeholder to avoid hydration errors
  if (!mounted) {
    return <div className="relative w-full h-full bg-black" />;
  }

  return (
    <div className={`relative w-full h-full ${darkMode ? 'bg-black' : 'bg-white'}`}>
      {/* Stars background */}
      <div className="absolute inset-0 overflow-hidden">
        {renderStars()}
      </div>
      
      {/* Light/Dark Mode Toggle */}
      <button 
        className={`absolute top-4 right-4 z-20 p-2 rounded-full ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'} shadow-lg`}
        onClick={() => setDarkMode(!darkMode)}
        aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
      >
        {darkMode ? <Sun size={20} /> : <Moon size={20} />}
      </button>
      
      {/* Globe container */}
      <div 
        ref={containerRef}
        className={cn(
          "absolute inset-0 mx-auto w-full h-full",
          className
        )}
      >
        {/* Globe component is dynamically added to this container */}
      </div>
      
      {/* Testimonial Popup */}
      {showTestimonials && selectedTestimonial && (
        <div className="fixed inset-0 flex items-center justify-center z-30 bg-black/10">
          <div 
            className={`
              ${darkMode ? 'bg-gray-900/90' : 'bg-white/90'} 
              p-8 rounded-xl max-w-md 
              ${darkMode ? 'text-white' : 'text-gray-800'} 
              shadow-2xl relative 
              transition-all duration-300 animate-in fade-in zoom-in-95
              border-2 ${darkMode ? 'border-orange-600/20' : 'border-orange-400/20'}
            `}
          >
            <button 
              className={`
                absolute top-3 right-3 p-1.5 
                ${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-black'} 
                hover:bg-opacity-20 hover:bg-gray-500 rounded-full 
                transition-colors
              `}
              onClick={() => {
                setSelectedTestimonial(null);
                // Resume auto-rotation after closing testimonial
                setTimeout(() => {
                  setAutoRotate(true);
                  if (globeEl.current) {
                    globeEl.current.controls().autoRotate = true;
                    globeEl.current.controls().autoRotateSpeed = 0.5;
                    // Reset to a wider view
                    globeEl.current.pointOfView({ altitude: 2.5 }, 1000);
                  }
                }, 300);
              }}
              aria-label="Close testimonial"
            >
              <X size={20} />
            </button>
            <div className="mb-1 pb-0.5 inline-block border-b-2 border-orange-500/30">
              <h3 className="text-2xl font-bold pr-6">{selectedTestimonial.name}</h3>
            </div>
            <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'} italic font-medium`}>{selectedTestimonial.company}</p>
            <p className={`${darkMode ? 'text-orange-400' : 'text-orange-600'} text-sm mb-6`}>{selectedTestimonial.location}</p>
            <p className={`${darkMode ? 'text-gray-100' : 'text-gray-800'} leading-relaxed`}>"{selectedTestimonial.testimonial}"</p>
          </div>
        </div>
      )}
      
      {showTestimonials && (
        <div className={`absolute bottom-5 left-0 right-0 text-center ${darkMode ? 'text-white' : 'text-gray-800'} text-sm opacity-70`}>
          Drag to rotate the globe. Click on markers to view testimonials.
        </div>
      )}
      
      {/* Loading indicator */}
      {mounted && !globeReady && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto animate-spin"></div>
            <p className={`mt-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Loading globe...</p>
          </div>
        </div>
      )}
    </div>
  );
} 
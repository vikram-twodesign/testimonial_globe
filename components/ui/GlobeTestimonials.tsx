"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import createGlobe, { COBEOptions } from "cobe"
import { Moon, Sun, X } from "lucide-react"

// Extend the COBEOptions interface to include focus property
declare module "cobe" {
  interface COBEOptions {
    focus?: [number, number];
    onMarkerClick?: (location: [number, number], index: number) => boolean;
    onMarkerHover?: (location: [number, number] | null, index: number | null) => void;
  }
}

// Define the testimonial type
type Testimonial = {
  name: string;
  company: string;
  location: string;
  testimonial: string;
  coordinates: [number, number];
  size: number;
};

// Define our testimonials with accurate coordinates
const testimonials: Testimonial[] = [
  {
    name: "Rahul Sharma",
    company: "EcoVentures India",
    location: "Goa, India",
    testimonial: "TWO Design transformed our brand identity completely. Their sustainable approach matched our values perfectly, and the results have been incredible for our business growth.",
    coordinates: [15.4989, 73.8278], // Goa, India
    size: 0.12
  },
  {
    name: "Sarah Johnson",
    company: "Artisan Collective",
    location: "London, UK",
    testimonial: "Working with TWO Design was a revelation. They understood our unique vision and translated it into a cohesive brand strategy that resonates with our customers worldwide.",
    coordinates: [51.5074, -0.1278], // London, UK
    size: 0.13
  },
  {
    name: "Michael Chang",
    company: "SustainTech Solutions",
    location: "San Francisco, USA",
    testimonial: "The team at TWO Design brings a rare combination of creativity and strategic thinking. Their work helped us establish a distinctive presence in a crowded market.",
    coordinates: [37.7749, -122.4194], // San Francisco, USA
    size: 0.14
  },
  {
    name: "Aisha Patel",
    company: "Mindful Spaces",
    location: "Mumbai, India",
    testimonial: "From concept to execution, TWO Design delivered beyond our expectations. Their thoughtful approach to our branding needs resulted in a visual identity that perfectly captures our essence.",
    coordinates: [19.0760, 72.8777], // Mumbai, India
    size: 0.13
  },
  {
    name: "Lars Eriksson",
    company: "Nordic Sustainability",
    location: "Stockholm, Sweden",
    testimonial: "TWO Design's ability to blend aesthetic beauty with functional design is outstanding. They've helped us communicate our commitment to sustainability in a visually compelling way.",
    coordinates: [59.3293, 18.0686], // Stockholm, Sweden
    size: 0.12
  },
  {
    name: "Elena Rodriguez",
    company: "Solaris Energy",
    location: "Madrid, Spain",
    testimonial: "The rebranding work done by TWO Design helped us connect with our customers on a deeper level. Our engagement and conversion metrics have improved significantly since the launch.",
    coordinates: [40.4168, -3.7038], // Madrid, Spain
    size: 0.13
  },
  {
    name: "Kenji Tanaka",
    company: "Green Future Tech",
    location: "Tokyo, Japan",
    testimonial: "TWO Design understood our need to balance traditional values with innovation. The result was a brand identity that feels both timeless and contemporary.",
    coordinates: [35.6762, 139.6503], // Tokyo, Japan
    size: 0.14
  }
];

// Define light mode globe config
const LIGHT_MODE_CONFIG: COBEOptions = {
  width: 800,
  height: 800,
  onRender: () => {},
  devicePixelRatio: 2,
  phi: 0,
  theta: 0.3,
  dark: 0,
  diffuse: 0.4,
  mapSamples: 16000,
  mapBrightness: 1.2,
  baseColor: [1, 1, 1], // White for oceans in light mode
  markerColor: [0.1, 0.5, 1], // A nice blue for markers
  glowColor: [0.8, 0.8, 0.8], // Light gray glow for light mode
  markers: [], // Will be set dynamically
};

// Define dark mode globe config
const DARK_MODE_CONFIG: COBEOptions = {
  width: 800,
  height: 800,
  onRender: () => {},
  devicePixelRatio: 2,
  phi: 0,
  theta: 0.3,
  dark: 1, // Make it dark for space background
  diffuse: 0.4,
  mapSamples: 16000,
  mapBrightness: 1.2,
  baseColor: [0.3, 0.3, 1], // Slightly blue base for oceans
  markerColor: [251/255, 100/255, 21/255], // Orange marker color (same as testimonial accent)
  glowColor: [0.2, 0.4, 1],
  markers: [], // Will be set dynamically
};

// Pre-generate fixed star positions to avoid hydration errors
const STAR_COUNT = 200;
const starPositions = Array.from({ length: STAR_COUNT }, () => ({
  size: 1 + Math.random(),
  top: Math.random() * 100,
  left: Math.random() * 100,
  opacity: 0.2 + Math.random() * 0.8,
}));

// Marker position type
type MarkerPosition = {
  x: number;
  y: number;
  visible: boolean;
  testimonial: Testimonial;
  distance: number; // Add distance for z-index calculation
};

export function GlobeTestimonials({
  className = "",
  initialConfig,
}: {
  className?: string;
  initialConfig?: COBEOptions;
}) {
  const [mounted, setMounted] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const config = darkMode ? DARK_MODE_CONFIG : LIGHT_MODE_CONFIG;
  
  // Store globe instance for interaction
  const globeRef = useRef<any>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Value references
  const phiRef = useRef(0);
  const widthRef = useRef(0);
  const pointerInteracting = useRef<number | null>(null);
  const pointerInteractionMovement = useRef(0);
  const rRef = useRef(0);
  
  const [selectedTestimonial, setSelectedTestimonial] = useState<Testimonial | null>(null);
  const [activeLocation, setActiveLocation] = useState<[number, number] | null>(null);
  const [autoRotate, setAutoRotate] = useState(true);
  const isHoveringMarkerRef = useRef(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [showCustomCursor, setShowCustomCursor] = useState(false);

  // Set mounted state when component mounts to prevent hydration errors
  useEffect(() => {
    setMounted(true);
  }, []);

  const updatePointerInteraction = (value: number | null) => {
    pointerInteracting.current = value;
    if (canvasRef.current) {
      canvasRef.current.style.cursor = value ? "grabbing" : "grab";
    }
    
    // When interaction starts, temporarily disable auto-rotation
    if (value !== null) {
      setAutoRotate(false);
    } else {
      // When interaction ends, re-enable auto-rotation if no testimonial is selected
      if (!selectedTestimonial) {
        setTimeout(() => {
          setAutoRotate(true);
        }, 100);
      }
    }
  };

  const updateMovement = (clientX: number) => {
    if (pointerInteracting.current !== null) {
      const delta = clientX - pointerInteracting.current;
      pointerInteractionMovement.current = delta;
      rRef.current = delta / 200;
    }
  };

  // Handle marker click
  const handleMarkerClick = useCallback((location: [number, number], index: number) => {
    // First animate to the location and pause rotation
    setActiveLocation(location);
    setAutoRotate(false);
    
    // Find the testimonial for this location
    const matchingTestimonial = testimonials.find(t => 
      t.coordinates[0] === location[0] && t.coordinates[1] === location[1]
    );
    
    // Brief delay before showing testimonial to allow animation to complete
    setTimeout(() => {
      if (matchingTestimonial) {
        setSelectedTestimonial(matchingTestimonial);
      }
    }, 800);
  }, []);

  // Render loop for globe
  const onRender = useCallback(
    (state: Record<string, any>) => {
      // Pause rotation if testimonial is selected, but still update state
      if (selectedTestimonial) {
        state.phi = phiRef.current + rRef.current;
        state.width = widthRef.current * 2;
        state.height = widthRef.current * 2;
        
        // Keep the focus on the selected location
        if (activeLocation) {
          state.focus = activeLocation;
        }
        return;
      }
      
      // Regular rotation when auto-rotate is enabled
      if (!pointerInteracting.current && autoRotate) {
        phiRef.current += 0.002;
      }
      
      // Update globe state with current values from refs
      state.phi = phiRef.current + rRef.current;
      state.width = widthRef.current * 2;
      state.height = widthRef.current * 2;
      
      // If we have an active location and it's not already set as the focus
      if (activeLocation && (!state.focus || state.focus[0] !== activeLocation[0] || state.focus[1] !== activeLocation[1])) {
        state.focus = activeLocation;
      }
    },
    [selectedTestimonial, autoRotate, activeLocation]
  );

  const onResize = useCallback(() => {
    if (canvasRef.current) {
      widthRef.current = canvasRef.current.offsetWidth;
    }
  }, []);
  
  // Initialize the globe and handle cleanup
  useEffect(() => {
    if (!mounted) return;
    
    window.addEventListener("resize", onResize);
    onResize();

    const mergedConfig = initialConfig ? { ...config, ...initialConfig } : config;
    let globeConfig: COBEOptions & { focus?: [number, number] } = {...mergedConfig};
    
    // Use testimonial markers from our testimonial data
    globeConfig.markers = testimonials.map(testimonial => ({
      location: testimonial.coordinates,
      size: testimonial.size * 1.2 // Slightly larger for better visibility with glow
    }));
    
    // Debug log to verify marker locations match testimonials
    console.log('Testimonial locations loaded:', testimonials.map(t => ({
      location: t.location,
      coordinates: t.coordinates
    })));

    // Add activeLocation to center of view if available
    if (activeLocation) {
      globeConfig.focus = activeLocation;
    }

    // Create the globe with NO marker click handler (we're using our own)
    const globe = createGlobe(canvasRef.current!, {
      ...globeConfig,
      width: widthRef.current * 2,
      height: widthRef.current * 2,
      onRender,
      // We'll handle clicks ourselves, so we don't need onMarkerClick
      onMarkerHover: (markerLocation, markerIndex) => {
        isHoveringMarkerRef.current = !!markerLocation;
        setShowCustomCursor(!!markerLocation);
        
        if (canvasRef.current) {
          // Use a more distinctive cursor for markers - hide the default cursor when showing custom one
          canvasRef.current.style.cursor = markerLocation ? 'none' : 'grab';
          
          // Log which marker is being hovered for debugging
          if (markerLocation && markerIndex !== null && markerIndex >= 0 && markerIndex < testimonials.length) {
            console.log(`Hovering over: ${testimonials[markerIndex].location}`);
          }
        }
      }
    });
    
    // Store the globe instance in ref for access outside this effect
    globeRef.current = globe;

    setTimeout(() => {
      if (canvasRef.current) {
        canvasRef.current.style.opacity = "1";
      }
    }, 100);

    return () => {
      globe.destroy();
      window.removeEventListener("resize", onResize);
    };
  }, [activeLocation, config, initialConfig, onRender, mounted, onResize]);

  // Generate stars for the background with fixed positions
  const renderStars = useCallback(() => {
    if (!mounted) return null; // Don't render stars on server
    
    return (
      <>
        {starPositions.map((star, i) => (
          <div
            key={i}
            className={`absolute rounded-full ${darkMode ? 'bg-white' : 'bg-black'}`}
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

  // Simplified and more generous click detection
  const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!globeRef.current || !canvasRef.current) return;
    
    // Get click coordinates relative to the canvas
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Calculate normalized position (0-1)
    const normalizedX = x / rect.width;
    const normalizedY = y / rect.height;
    
    // Center of the globe
    const centerX = 0.5;
    const centerY = 0.5;
    
    // Calculate distance from center (to determine if click is on globe)
    const distFromCenter = Math.sqrt(
      Math.pow(normalizedX - centerX, 2) + 
      Math.pow(normalizedY - centerY, 2)
    );
    
    // Only process clicks reasonably on the globe surface - VERY generous radius
    if (distFromCenter > 0.6) return; // Click is outside globe (increased from 0.5 to 0.6)
    
    // Get current rotation
    const phi = phiRef.current + rRef.current;
    
    // Find the closest visible marker to the click
    let closestDist = 1.0; // Normalized, so 1.0 is the max possible distance
    let closestTestimonial: Testimonial | null = null;
    
    for (let i = 0; i < testimonials.length; i++) {
      const testimonial = testimonials[i];
      // Convert lat/long to 3D coordinates
      const lat = testimonial.coordinates[0] * (Math.PI / 180);
      const long = testimonial.coordinates[1] * (Math.PI / 180) + phi;
      
      // Improved spherical to cartesian conversion
      const x3d = Math.cos(lat) * Math.sin(long);
      const y3d = Math.sin(lat);
      const z3d = Math.cos(lat) * Math.cos(long);
      
      // Skip markers on the back side of the globe
      if (z3d < -0.2) continue;
      
      // Improved projection factor based on distance from center
      // Markers farther from center (closer to edge) need a larger projection factor
      const projectionFactor = 0.45 * (1 + 0.2 * (1 - z3d)); // Adjust projection based on depth
      
      // Project to 2D space with improved projection
      const projectedX = centerX + (x3d * projectionFactor);
      const projectedY = centerY - (y3d * projectionFactor);
      
      // Distance from click to this projected point
      const dist = Math.sqrt(
        Math.pow(normalizedX - projectedX, 2) + 
        Math.pow(normalizedY - projectedY, 2)
      );
      
      // Prioritize markers that are more front-facing (higher z-value)
      // This gives a slight advantage to markers in the center of view
      const zAdjustedDist = dist * (0.8 + 0.2 * (1 - Math.max(0, z3d)));
      
      // Update if this is the closest marker so far
      if (zAdjustedDist < closestDist) {
        closestDist = zAdjustedDist;
        closestTestimonial = testimonial;
      }
    }
    
    // MUCH more generous threshold (increased from 0.2 to 0.35) for easier clicking
    // This will make a much larger area around each marker clickable
    if (closestTestimonial && closestDist < 0.35) {
      // Animate to the selected marker's location
      const coordinates = closestTestimonial.coordinates;
      setActiveLocation(coordinates);
      setAutoRotate(false);
      
      // Show testimonial after a delay to allow for animation
      setTimeout(() => {
        setSelectedTestimonial(closestTestimonial);
      }, 800);
      
      // Log for debugging - can be removed in production
      console.log("Selected testimonial:", closestTestimonial.name, "at distance:", closestDist);
    }
  }, [testimonials]);

  // Add a mouse move handler in the component to track mouse position
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  // Replace the markerHoverCss with simpler styles
  const cursorStyles = {
    position: 'fixed',
    left: `${mousePosition.x}px`,
    top: `${mousePosition.y}px`,
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    backgroundColor: 'rgba(251, 100, 21, 0.3)',
    border: '2px solid rgba(251, 100, 21, 0.8)',
    transform: 'translate(-50%, -50%)',
    pointerEvents: 'none',
    zIndex: 1000,
    transition: 'opacity 0.2s ease',
    boxShadow: '0 0 10px rgba(251, 100, 21, 0.5)',
    opacity: showCustomCursor ? 1 : 0,
  } as React.CSSProperties;

  // If not mounted yet, return a simple placeholder to avoid hydration errors
  if (!mounted) {
    return <div className="relative w-full h-full bg-black" />;
  }

  return (
    <div className={`relative w-full h-full ${darkMode ? 'bg-black' : 'bg-white'}`}>
      {/* Custom cursor */}
      <div style={cursorStyles} />
      
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
        className="absolute inset-0 mx-auto aspect-[1/1] w-full max-w-[800px]"
        onPointerDown={(e) => { if (!isHoveringMarkerRef.current) { updatePointerInteraction(e.clientX - pointerInteractionMovement.current); } }}
        onPointerUp={() => updatePointerInteraction(null)}
        onPointerOut={() => updatePointerInteraction(null)}
        onMouseMove={(e) => updateMovement(e.clientX)}
        onTouchMove={(e) => e.touches[0] && updateMovement(e.touches[0].clientX)}
      >
        {/* Canvas for globe */}
        <canvas
          className="size-full opacity-0 transition-opacity duration-500 [contain:layout_paint_size]"
          ref={canvasRef}
          style={{ cursor: 'grab', zIndex: 5 }}
          onClick={handleCanvasClick}
          onPointerDown={(e) => {
            // Only begin dragging if we're not hovering a marker
            if (!isHoveringMarkerRef.current) {
              updatePointerInteraction(e.clientX - pointerInteractionMovement.current);
            }
          }}
          onPointerUp={() => updatePointerInteraction(null)}
          onPointerOut={() => updatePointerInteraction(null)}
          onMouseMove={(e) => updateMovement(e.clientX)}
          onTouchMove={(e) => {
            if (e.touches[0]) {
              updateMovement(e.touches[0].clientX);
            }
          }}
        />
      </div>
      
      {/* Testimonial Popup */}
      {selectedTestimonial && (
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
                // Wait a moment before resetting the active location
                setTimeout(() => {
                  setActiveLocation(null);
                  setAutoRotate(true); // Resume auto-rotation
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
      
      <div className={`absolute bottom-5 left-0 right-0 text-center ${darkMode ? 'text-white' : 'text-gray-800'} text-sm opacity-70`}>
        Click and drag to rotate the globe. Click on markers to view testimonials.
      </div>
    </div>
  );
}
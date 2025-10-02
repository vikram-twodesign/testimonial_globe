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
    name: "Hannah Mowrey",
    company: "Studio Partner",
    location: "Chicago",
    testimonial: "Nicolette is strategic and creative and a process-driven professional who is also kind and considerate of others, which makes her the kind of brain and heart combination anyone would be lucky to have on their team.",
    coordinates: [41.8781, -87.6298], // Chicago
    size: 0.15
  },
  {
    name: "Raphael Cala",
    company: "Graphic Designer",
    location: "New York",
    testimonial: "Nicolette is able to balance big-picture and fine detail. While she gets into the weeds of managing individual deliverables, it always stems from a broader vision or strategy.",
    coordinates: [40.7128, -74.0060], // New York
    size: 0.15
  },
  {
    name: "Kabira Ferrell",
    company: "Communications Executive",
    location: "Colorado",
    testimonial: "It's a rare combination to find someone who is a strategic thinker and marketer, an intuitive designer, and effectively executes while building a team around a mission-driven culture. This is Nicolette. She is curious, kind, empathetic and driven. Not satisfied with good, Nicolette aims for--and delivers--greatness.",
    coordinates: [39.5501, -105.7821], // Colorado (Denver area)
    size: 0.15
  },
  {
    name: "Priya Premchandran",
    company: "Built Environment Expert",
    location: "San Francisco",
    testimonial: "Nicolette is an incredibly inclusive leader who respects and welcomes diverse perspectives. She believes in providing agency to others and empowering them to do their best work while providing necessary support. A great collaborator who is always focused on achieving the best outcome.",
    coordinates: [37.7749, -122.4194], // San Francisco
    size: 0.15
  },
  {
    name: "Aaron Grossbard",
    company: "Digital Marketer",
    location: "Seattle",
    testimonial: "Nicolette is easily one of the best points of contact I've worked with in my professional career.",
    coordinates: [47.6062, -122.3321], // Seattle
    size: 0.15
  },
  {
    name: "Tamara Nameroff",
    company: "Energy Transition Expert",
    location: "Amsterdam, Netherlands",
    testimonial: "Nicolette is a dream to work with. She is creative and always on the hunt for improvement opportunities that can be delivered in the time available. She is highly organized and follows through on her commitments. You will love to have her on your team!",
    coordinates: [52.3676, 4.9041], // Amsterdam, Netherlands
    size: 0.15
  },
  {
    name: "Vikram Bhalla",
    company: "Studio Owner",
    location: "Goa, India",
    testimonial: "Nicolette leads by example. She is personally invested in the team's efficiency and productivity and manages to balance being the boss and being the friend. Our entire team had immense respect for her. It was a privilege working with--and learning from--Nicolette.",
    coordinates: [15.2993, 74.1240], // Goa, India
    size: 0.15
  },
  {
    name: "Georgie Davis",
    company: "Impact Communications Executive",
    location: "Outside London, UK",
    testimonial: "Nicolette is a standout leader with a rare blend of sharp analytical insight, big-picture thinking and abundant creativity. She is inclusive then decisive, delivering clarity and driving change. I've seen her navigate politically challenging leadership dynamics with diplomacy and grace.",
    coordinates: [51.5074, -0.1278], // London, UK
    size: 0.15
  },
  {
    name: "Chris Markel",
    company: "Digital Marketer",
    location: "Oaxaca, Mexico",
    testimonial: "Nicolette is organized, pragmatic, has a strong bias for action, listens critically, and processes information quickly and effectively. She has a unique ability to break down complex concepts into digestible chunks for anyone on the team to quickly get up to speed and make impactful contributions.",
    coordinates: [17.0732, -96.7266], // Oaxaca, Mexico
    size: 0.15
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

  // Add this near the top of the component with other refs
  const lastFrameTime = useRef(Date.now());

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
      // Calculate delta time for smoother animation
      const now = Date.now();
      const dt = Math.min(60, now - lastFrameTime.current) / 16.67; // Cap at 60fps equivalent
      lastFrameTime.current = now;

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
        // Slow down rotation when hovering over markers
        const rotationSpeed = isHoveringMarkerRef.current ? 0.0005 * dt : 0.002 * dt;
        phiRef.current += rotationSpeed;
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
    
    // IMPORTANT: Make sure we're completely overriding any other markers
    // This ensures only ONE set of markers is shown
    globeConfig.markers = [];
    
    // Use testimonial markers from our testimonial data
    globeConfig.markers = testimonials.map(testimonial => ({
      location: testimonial.coordinates,
      size: testimonial.size * 1.1  // Slightly larger markers for better visibility
    }));
    
    // Debug log to verify marker locations match testimonials
    console.log('======== DEBUGGING MARKER LOCATIONS ========');
    console.log('Testimonial locations loaded:', testimonials.map(t => ({
      name: t.name,
      location: t.location,
      coordinates: t.coordinates
    })));
    
    console.log('Globe config markers:', globeConfig.markers);
    
    // Make sure no other markers could be conflicting
    if (initialConfig) {
      initialConfig.markers = [];
    }
    
    // Debug global config
    console.log('Final merged config markers:', globeConfig.markers);
    console.log('=======================================');

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
      // Explicitly ensure markers are set correctly
      markers: globeConfig.markers,
      // We'll handle clicks ourselves, so we don't need onMarkerClick
      onMarkerHover: (markerLocation, markerIndex) => {
        // Set the hovering state
        const isHovering = !!markerLocation;
        isHoveringMarkerRef.current = isHovering;
        setShowCustomCursor(isHovering);
        
        if (canvasRef.current) {
          // Make sure cursor change is visible by forcing the cursor style
          canvasRef.current.style.cursor = isHovering ? 'pointer' : 'grab';
          
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
    
    // Only process clicks reasonably on the globe surface
    if (distFromCenter > 0.5) return; // Click is outside globe
    
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
      const projectionFactor = 0.45 * (1 + 0.2 * (1 - z3d)); 
      
      // Project to 2D space with improved projection
      const projectedX = centerX + (x3d * projectionFactor);
      const projectedY = centerY - (y3d * projectionFactor);
      
      // Distance from click to this projected point
      const dist = Math.sqrt(
        Math.pow(normalizedX - projectedX, 2) + 
        Math.pow(normalizedY - projectedY, 2)
      );
      
      // Prioritize markers that are more front-facing (higher z-value)
      const zAdjustedDist = dist * (0.8 + 0.2 * (1 - Math.max(0, z3d)));
      
      // Update if this is the closest marker so far
      if (zAdjustedDist < closestDist) {
        closestDist = zAdjustedDist;
        closestTestimonial = testimonial;
      }
    }
    
    // Two requirements for selection:
    // 1. Need to be within threshold distance of a marker
    // 2. Need to be close enough to the exact marker position
    if (closestTestimonial && closestDist < 0.20) {
      // Log for debugging
      console.log("Selected testimonial:", closestTestimonial.name, "at distance:", closestDist);
      
      // Animate to the selected marker's location
      const coordinates = closestTestimonial.coordinates;
      setActiveLocation(coordinates);
      setAutoRotate(false);
      
      // Show testimonial after a delay to allow for animation
      setTimeout(() => {
        setSelectedTestimonial(closestTestimonial);
      }, 800);
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

  // Replace the cursorStyles definition with this:
  const cursorStyles = {
    position: 'fixed',
    left: `${mousePosition.x}px`,
    top: `${mousePosition.y}px`,
    width: '30px',
    height: '30px',
    borderRadius: '50%',
    backgroundColor: 'rgba(251, 100, 21, 0.4)',
    border: '2px solid rgba(251, 100, 21, 1)',
    transform: 'translate(-50%, -50%)',
    pointerEvents: 'none',
    zIndex: 1000,
    transition: 'all 0.1s ease-out',
    boxShadow: '0 0 10px rgba(251, 100, 21, 0.8)',
    opacity: showCustomCursor ? 1 : 0,
  } as React.CSSProperties;

  // If not mounted yet, return a simple placeholder to avoid hydration errors
  if (!mounted) {
    return <div className="relative w-full h-full bg-white" />;
  }

  return (
    <div className={`relative w-full h-full flex items-center justify-center ${darkMode ? 'bg-black' : 'bg-white'}`}>
      {/* Custom cursor */}
      <div style={cursorStyles} />
      
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
        className="relative aspect-[1/1] w-full max-w-[800px]"
        onPointerDown={(e) => { 
          if (!isHoveringMarkerRef.current) { 
            updatePointerInteraction(e.clientX - pointerInteractionMovement.current); 
          } 
        }}
        onPointerUp={() => updatePointerInteraction(null)}
        onPointerOut={() => updatePointerInteraction(null)}
        onMouseMove={(e) => {
          if (pointerInteracting.current !== null) {
            updateMovement(e.clientX);
          }
        }}
        onTouchMove={(e) => {
          if (e.touches[0] && pointerInteracting.current !== null) {
            updateMovement(e.touches[0].clientX);
          }
        }}
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
          onMouseMove={(e) => {
            if (pointerInteracting.current !== null) {
              updateMovement(e.clientX);
            }
          }}
          onTouchMove={(e) => {
            if (e.touches[0] && pointerInteracting.current !== null) {
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
              p-8 max-w-md 
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
            <div className="mb-1 pb-0.5 inline-block border-b-2 border-red-800">
              <h3 className="text-2xl pr-6 font-bold" style={{ fontFamily: 'var(--font-instrument-serif)' }}>{selectedTestimonial.name}</h3>
            </div>
            <p className={`${darkMode ? 'text-white' : 'text-black'} font-medium`} style={{ fontFamily: 'var(--font-instrument-sans)' }}>{selectedTestimonial.company}</p>
            <p className={`${darkMode ? 'text-red-400' : 'text-red-800'} text-sm mb-6`} style={{ fontFamily: 'var(--font-instrument-sans)' }}>{selectedTestimonial.location}</p>
            <p className={`${darkMode ? 'text-white' : 'text-black'} leading-relaxed`} style={{ fontFamily: 'var(--font-instrument-sans)' }}>"{selectedTestimonial.testimonial}"</p>
          </div>
        </div>
      )}
      
      <div className={`absolute bottom-5 left-0 right-0 text-center ${darkMode ? 'text-white' : 'text-black'} text-sm opacity-70`}>
        Click and drag to rotate the globe. Click on markers to view testimonials.
      </div>
    </div>
  );
}
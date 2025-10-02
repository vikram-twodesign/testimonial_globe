"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { cn } from "@/lib/utils"
import { X, Moon, Sun } from "lucide-react"
import * as THREE from "three"

// Type for the Globe instance
type GlobeInstance = any;

// Define interface for markers that matches the existing component
interface GlobeMarker {
  location: [number, number];
  size: number;
}

// Interface for configuration options
interface GlobeConfig {
  width?: number;
  height?: number;
  markers?: GlobeMarker[];
  markerColor?: [number, number, number];
  backgroundColor?: string;
  globeImageUrl?: string;
  bumpImageUrl?: string;
  autoRotate?: boolean;
  autoRotateSpeed?: number;
}

// Define the testimonial type
type Testimonial = {
  name: string;
  company: string;
  location: string;
  testimonial: string;
  coordinates: [number, number]; // [latitude, longitude]
};

// Define our testimonials with accurate coordinates
const testimonials: Testimonial[] = [
  {
    name: "Hannah Mowrey",
    company: "Studio Partner",
    location: "Chicago",
    testimonial: "Nicolette is strategic and creative and a process-driven professional who is also kind and considerate of others, which makes her the kind of brain and heart combination anyone would be lucky to have on their team.",
    coordinates: [41.8781, -87.6298], // Chicago
  },
  {
    name: "Mary Foyder",
    company: "Design Leader",
    location: "Chicago",
    testimonial: "Nicolette is a powerhouse of brains and can-do. She tells things like they are! She is empathetic and passionate and makes things happen. I will do a happy dance if I get the chance to work with Nicolette again.",
    coordinates: [41.8781, -87.6298], // Chicago
  },
  {
    name: "Lyndon Valicenti",
    company: "Systems Designer",
    location: "Chicago",
    testimonial: "Nicolette is a magnetic leader with poise and confidence that I admire and want to be around. She is a real one!",
    coordinates: [41.8781, -87.6298], // Chicago
  },
  {
    name: "Judy Brennan",
    company: "PR Executive",
    location: "Chicago",
    testimonial: "Nicolette is smart and kind and fun! From strategy to design, project management to copy, the thread running through it all is her creativity. She pulls off miracles on a shoestring budget. I'd work with Nicolette every chance I could.",
    coordinates: [41.8781, -87.6298], // Chicago
  },
  {
    name: "Anthena Gore",
    company: "Environmental Justice Executive",
    location: "Chicago",
    testimonial: "Nicolette has a distinct and effective approach for seeding important strategic, yet reflective, conversations. It's a good balance of 'we need to be intentional' and 'we need to do something impactful.'",
    coordinates: [41.8781, -87.6298], // Chicago
  },
  {
    name: "Raphael Cala",
    company: "Graphic Designer",
    location: "New York",
    testimonial: "Nicolette is able to balance big-picture and fine detail. While she gets into the weeds of managing individual deliverables, it always stems from a broader vision or strategy.",
    coordinates: [40.7128, -74.0060], // New York
  },
  {
    name: "Kabira Ferrell",
    company: "Communications Executive",
    location: "Colorado",
    testimonial: "It's a rare combination to find someone who is a strategic thinker and marketer, an intuitive designer, and effectively executes while building a team around a mission-driven culture. This is Nicolette. She is curious, kind, empathetic and driven. Not satisfied with good, Nicolette aims for--and delivers--greatness. Her independent thinking and the calibre of her intellect pushed our work, and me, to be better. I'd hire her again in a heartbeat!",
    coordinates: [39.5501, -105.7821], // Colorado (Denver area)
  },
  {
    name: "Dylan Wells",
    company: "Graphic Designer",
    location: "Nashville",
    testimonial: "Nicolette excels at forming a complete project vision from the start and is able to succinctly and confidently execute from development to launch with an inimitable ease.",
    coordinates: [36.1627, -86.7816], // Nashville
  },
  {
    name: "Rebecca Stamm",
    company: "Materials Researcher",
    location: "Indiana",
    testimonial: "Nicolette brings great energy and enthusiasm to our work. She is not only great at her job but also fun to work with. She clearly cares about the work and about the team as people.",
    coordinates: [39.7910, -86.1480], // Indiana (Indianapolis area)
  },
  {
    name: "Priya Premchandran",
    company: "Built Environment Expert",
    location: "San Francisco",
    testimonial: "Nicolette is an incredibly inclusive leader who respects and welcomes diverse perspectives. She believes in providing agency to others and empowering them to do their best work while providing necessary support. A great collaborator who is always focused on achieving the best outcome.",
    coordinates: [37.7749, -122.4194], // San Francisco
  },
  {
    name: "Aaron Grossbard",
    company: "Digital Marketer",
    location: "Seattle",
    testimonial: "Nicolette is easily one of the best points of contact I've worked with in my professional career.",
    coordinates: [47.6062, -122.3321], // Seattle
  },
  {
    name: "Sagar Pujara",
    company: "Entrepreneur",
    location: "Los Angeles",
    testimonial: "Nicolette is a natural leader with an impressive combination of organizational skills, emotional intelligence, and a knack for demystifying complex problems.",
    coordinates: [34.0522, -118.2437], // Los Angeles
  },
  {
    name: "Nathalie Bouche",
    company: "Sales Leader",
    location: "France",
    testimonial: "On top of being a marketing and communications expert, Nicolette is a fantastic team player and her communication and organisational skills allowed her to lead our senior leadership meetings with high efficiency and results. I highly recommend Nicolette--her future teams will be very lucky!",
    coordinates: [46.2276, 2.2137], // France (central)
  },
  {
    name: "Tamara Nameroff",
    company: "Energy Transition Expert",
    location: "Amsterdam, Netherlands",
    testimonial: "Nicolette is a dream to work with. She is creative and always on the hunt for improvement opportunities that can be delivered in the time available. She is highly organized and follows through on her commitments. You will love to have her on your team!",
    coordinates: [52.3676, 4.9041], // Amsterdam, Netherlands
  },
  {
    name: "Vikram Bhalla",
    company: "Studio Owner",
    location: "Goa, India",
    testimonial: "Nicolette leads by example. She is personally invested in the team's efficiency and productivity and manages to balance being the boss and being the friend. Our entire team had immense respect for her. It was a privilege working with—and learning from—Nicolette. I'd jump at the chance again.",
    coordinates: [15.2993, 74.1240], // Goa, India
  },
  {
    name: "Georgie Davis",
    company: "Impact Communications Executive",
    location: "Outside London, UK",
    testimonial: "Nicolette is a standout leader with a rare blend of sharp analytical insight, big-picture thinking and abundant creativity. She is inclusive then decisive, delivering clarity and driving change. I've seen her navigate politically challenging leadership dynamics with diplomacy and grace.",
    coordinates: [51.5074, -0.1278], // London, UK
  },
  {
    name: "Chris Markel",
    company: "Digital Marketer",
    location: "Oaxaca, Mexico",
    testimonial: "Nicolette is organized, pragmatic, has a strong bias for action, listens critically, and processes information quickly and effectively. She has a unique ability to break down complex concepts into digestible chunks for anyone on the team to quickly get up to speed and make impactful contributions.",
    coordinates: [17.0732, -96.7266], // Oaxaca, Mexico
  }
];

// Helper function to count testimonials at each unique location
const getTestimonialCountByLocation = () => {
  const locationCounts = new Map<string, number>();
  testimonials.forEach(testimonial => {
    const key = `${testimonial.coordinates[0]},${testimonial.coordinates[1]}`;
    locationCounts.set(key, (locationCounts.get(key) || 0) + 1);
  });
  return locationCounts;
};

// Convert testimonials to markers with enhanced visual cues for multiple testimonials
const createMarkersFromTestimonials = () => {
  const locationCounts = getTestimonialCountByLocation();
  const processedLocations = new Set<string>();
  
  return testimonials.reduce((markers: GlobeMarker[], testimonial) => {
    const locationKey = `${testimonial.coordinates[0]},${testimonial.coordinates[1]}`;
    
    // Only add one marker per unique location
    if (!processedLocations.has(locationKey)) {
      processedLocations.add(locationKey);
      const count = locationCounts.get(locationKey) || 1;
      
      markers.push({
        location: testimonial.coordinates,
        size: count > 1 ? 0.20 : 0.15 // Larger size for multiple testimonials
      });
    }
    
    return markers;
  }, []);
};

const DEFAULT_MARKERS: GlobeMarker[] = createMarkersFromTestimonials();

// Default configuration
const DEFAULT_CONFIG: GlobeConfig = {
  markers: DEFAULT_MARKERS,
  markerColor: [139/255, 0, 0], // Deep red color (#8B0000)
  backgroundColor: "rgba(0, 0, 0, 0)",
  autoRotate: true,
  autoRotateSpeed: 0.5,
};

// Initialize marker color based on config - this should be run every time config changes
const getMarkerColorString = (markerColor: [number, number, number]) => {
  return `rgba(${markerColor[0] * 255}, ${markerColor[1] * 255}, ${markerColor[2] * 255}, 1)`;
};

export function SimpleGlobe({
  className,
  config = DEFAULT_CONFIG,
  onError,
}: {
  className?: string;
  config?: GlobeConfig;
  onError?: (error: Error) => void;
}) {
  const [mounted, setMounted] = useState(false);
  const [globeReady, setGlobeReady] = useState(false);
  const [selectedTestimonials, setSelectedTestimonials] = useState<Testimonial[]>([]);
  const [currentTestimonialIndex, setCurrentTestimonialIndex] = useState(0);
  const [darkMode, setDarkMode] = useState(false);
  const globeEl = useRef<GlobeInstance | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Toggle dark mode function - define before any useEffect
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };
  
  // Set mounted state to prevent hydration errors
  useEffect(() => {
    setMounted(true);
  }, []);

  // Dynamically import the Globe component on the client side
  useEffect(() => {
    if (mounted) {
      // Use dynamic import with error handling
      import('globe.gl')
        .then((mod) => {
          try {
            // Get the Globe constructor
            const GlobeConstructor = mod.default;
            
            if (containerRef.current && !globeEl.current) {
              // Create a DOM element for the globe
              const globeContainer = document.createElement('div');
              globeContainer.style.width = '100%';
              globeContainer.style.height = '100%';
              containerRef.current.appendChild(globeContainer);
              
              // Initialize the globe
              // This pattern works for globe.gl - it's a factory function
              // @ts-ignore - TypeScript doesn't understand this pattern but it's correct for globe.gl
              globeEl.current = GlobeConstructor()(globeContainer);
              
              // Mark the globe as ready
              setGlobeReady(true);
              
              // Debug log
              console.log("Globe initialized successfully");
            }
          } catch (err) {
            console.error("Error initializing globe:", err);
            if (onError && err instanceof Error) {
              onError(err);
            }
          }
        })
        .catch(err => {
          console.error("Error loading globe.gl:", err);
          if (onError) {
            onError(err);
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
  }, [mounted, onError]);

  // Find all testimonials by coordinates
  const findTestimonialsByCoordinates = useCallback((lat: number, lng: number): Testimonial[] => {
    return testimonials.filter(t => 
      Math.abs(t.coordinates[0] - lat) < 0.001 && 
      Math.abs(t.coordinates[1] - lng) < 0.001
    );
  }, []);

  // Handle point click
  const handlePointClick = useCallback((point: GlobeMarker) => {
    if (!globeEl.current) return;
    
    // Find all testimonials for this point
    const testimonialsAtLocation = findTestimonialsByCoordinates(point.location[0], point.location[1]);
    if (testimonialsAtLocation.length === 0) return;
    
    // Stop auto-rotation when a point is clicked
    if (globeEl.current.controls()) {
      globeEl.current.controls().autoRotate = false;
    }
    
    // Animate to point position - using a higher altitude to prevent cropping
    globeEl.current.pointOfView(
      {
        lat: testimonialsAtLocation[0].coordinates[0],
        lng: testimonialsAtLocation[0].coordinates[1],
        altitude: 2.0 // Higher altitude to prevent cropping
      },
      1000 // animation duration in ms
    );
    
    // Show the testimonials after a brief delay
    setTimeout(() => {
      setSelectedTestimonials(testimonialsAtLocation);
      setCurrentTestimonialIndex(0); // Start with the first testimonial
    }, 1000);
  }, [findTestimonialsByCoordinates]);

  // Navigation functions for multiple testimonials
  const goToNextTestimonial = useCallback(() => {
    if (selectedTestimonials.length > 1) {
      setCurrentTestimonialIndex((prev) => 
        prev < selectedTestimonials.length - 1 ? prev + 1 : 0
      );
    }
  }, [selectedTestimonials.length]);

  const goToPreviousTestimonial = useCallback(() => {
    if (selectedTestimonials.length > 1) {
      setCurrentTestimonialIndex((prev) => 
        prev > 0 ? prev - 1 : selectedTestimonials.length - 1
      );
    }
  }, [selectedTestimonials.length]);

  // Add a zoom limit to prevent zooming too close
  useEffect(() => {
    if (!mounted || !globeReady || !globeEl.current) return;
    
    try {
      // Set zoom limits to prevent getting too close to the globe
      if (globeEl.current.controls()) {
        globeEl.current.controls().minDistance = 200; // Minimum zoom distance
        globeEl.current.controls().maxDistance = 800; // Maximum zoom distance
      }
    } catch (err) {
      console.error("Error setting zoom limits:", err);
    }
  }, [mounted, globeReady]);

  // Effect to update globe background color when dark mode changes
  useEffect(() => {
    if (!mounted || !globeReady || !globeEl.current) return;
    
    try {
      // Update the globe background based on dark mode state
      // This ensures the globe itself maintains transparency in dark mode
      globeEl.current.backgroundColor("rgba(0, 0, 0, 0)");
    } catch (err) {
      console.error("Error updating globe background for dark mode:", err);
    }
  }, [darkMode, mounted, globeReady]);

  // Initialize and configure globe
  useEffect(() => {
    if (!mounted || !globeReady || !globeEl.current) return;
    
    try {
      console.log("Configuring globe with data");
      
      const globe = globeEl.current;
      // IMPORTANT: Always use our DEFAULT_MARKERS to ensure all testimonials are shown
      const markers = DEFAULT_MARKERS;
      const markerColor = config.markerColor || [251/255, 100/255, 21/255];
      const backgroundColor = config.backgroundColor || "rgba(0, 0, 0, 0)";
      const autoRotate = config.autoRotate !== undefined ? config.autoRotate : true;
      const autoRotateSpeed = config.autoRotateSpeed !== undefined ? config.autoRotateSpeed : 0.5;
      
      // Debug info
      console.log(`Setting up ${markers.length} markers on globe`);
      console.log("First marker:", markers[0]);
      
      // Convert RGB array to CSS color string
      const markerColorString = getMarkerColorString(markerColor);
      
      // Configure globe with custom SVG pins via HTML elements
      globe
        .globeImageUrl('//unpkg.com/three-globe/example/img/earth-blue-marble.jpg')
        .bumpImageUrl('//unpkg.com/three-globe/example/img/earth-topology.png')
        .backgroundColor(backgroundColor)
        .htmlElementsData(markers)
        .htmlLat((d: GlobeMarker) => d.location[0])
        .htmlLng((d: GlobeMarker) => d.location[1])
        .htmlAltitude(0.005)
        .htmlElement((d: GlobeMarker) => {
          const el = document.createElement('div');
          const isMultiple = d.size > 0.15;
          
          // Create an img element for the SVG
          const img = document.createElement('img');
          img.src = '/location_pin.svg';
          img.style.width = isMultiple ? '32px' : '24px';
          img.style.height = isMultiple ? '32px' : '24px';
          img.style.display = 'block';
          
          el.appendChild(img);
          el.style.transform = 'translate(-50%, -100%)'; // bottom tip at lat/lng
          el.style.filter = 'drop-shadow(0 2px 4px rgba(0,0,0,0.4))';
          el.style.cursor = 'pointer';
          el.style.userSelect = 'none';
          el.style.pointerEvents = 'auto';

          // Hover: slow rotation and show pointer
          el.addEventListener('mouseenter', () => {
            const controls = globeEl.current?.controls?.();
            if (controls) controls.autoRotateSpeed = 0.1;
          });
          el.addEventListener('mouseleave', () => {
            const controls = globeEl.current?.controls?.();
            if (controls) controls.autoRotateSpeed = autoRotateSpeed;
          });

          // Click: open testimonials using existing handler
          el.addEventListener('click', (e) => {
            e.stopPropagation();
            handlePointClick(d);
          });

          return el;
        })
        // Invisible points layer to capture precise raycast clicks/hover
        .pointsData(markers)
        .pointLat((d: GlobeMarker) => d.location[0])
        .pointLng((d: GlobeMarker) => d.location[1])
        .pointColor(() => 'rgba(0,0,0,0)')
        .pointRadius(1.1)
        .pointAltitude(0.005)
        .onPointHover((p: GlobeMarker | null) => {
          const controls = globeEl.current?.controls?.();
          if (controls) controls.autoRotateSpeed = p ? 0.1 : autoRotateSpeed;
          if (containerRef.current) containerRef.current.style.cursor = p ? 'pointer' : 'grab';
        })
        .onPointClick(handlePointClick);
      
      // Set auto-rotation
      if (globe.controls()) {
        globe.controls().autoRotate = autoRotate;
        globe.controls().autoRotateSpeed = autoRotateSpeed;
      }
      
      // Set initial position
      globe.pointOfView({ altitude: 2.0 }, 1000);
      
      // Make the globe 3x larger by adjusting the camera distance
      if (containerRef.current) {
        // Update the canvas size
        const width = containerRef.current.clientWidth;
        const height = containerRef.current.clientHeight;
        globe.width(width);
        globe.height(height);
        
        // Set a closer view to make the globe appear larger
        globe.pointOfView({ altitude: 1.8 }, 0);
      }
      
      console.log("Globe configuration complete");
    } catch (err) {
      console.error("Error configuring globe:", err);
      if (onError && err instanceof Error) {
        onError(err);
      }
    }
    
    // Clean up
    return () => {
      if (globeEl.current && globeEl.current.controls) {
        try {
          globeEl.current.controls().autoRotate = false;
        } catch (err) {
          console.error("Error cleaning up globe:", err);
        }
      }
    };
  }, [mounted, config.markerColor, config.backgroundColor, config.autoRotate, config.autoRotateSpeed, globeReady, handlePointClick, onError]);

  // Update the resize handler to maintain the full globe view
  // Handle window resize
  useEffect(() => {
    if (!mounted || !globeReady || !globeEl.current) return;
    
    const handleResize = () => {
      if (containerRef.current && globeEl.current) {
        try {
          // Get the smallest dimension to ensure the globe fits completely
          const width = containerRef.current.clientWidth;
          const height = containerRef.current.clientHeight;
          const size = Math.min(width, height);
          
          // Update globe size
          globeEl.current.width(size);
          globeEl.current.height(size);
          
          // Center the globe in the container
          if (globeEl.current._renderer && globeEl.current._renderer.domElement) {
            const canvas = globeEl.current._renderer.domElement;
            canvas.style.position = 'absolute';
            canvas.style.left = '50%';
            canvas.style.top = '50%';
            canvas.style.transform = 'translate(-50%, -50%)';
          }
        } catch (err) {
          console.error("Error resizing globe:", err);
        }
      }
    };
    
    window.addEventListener('resize', handleResize);
    
    // Call once to set initial size
    handleResize();
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [mounted, globeReady]);

  // Early return while not mounted
  if (!mounted) {
    return <div className={cn("relative w-full h-full", className)} />;
  }

  return (
    <div className={cn(
      "relative w-full h-full flex items-center justify-center", 
      darkMode ? "bg-black" : "bg-white",
      className
    )}>
      <div 
        ref={containerRef}
        className="relative w-full h-full mx-auto max-w-[800px]"
      >
        {/* Globe element will be dynamically added to this container */}
      </div>
      
      {/* Mode toggle button */}
      <button
        onClick={toggleDarkMode}
        className="absolute top-4 right-4 z-10 p-2.5 rounded-full transition-colors"
        style={{
          backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)'
        }}
        aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
      >
        {darkMode ? (
          <Sun size={20} className="text-white" />
        ) : (
          <Moon size={20} className="text-black" />
        )}
      </button>
      
      {/* Loading indicator */}
      {mounted && !globeReady && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto animate-spin"></div>
            <p className={cn("mt-2", darkMode ? "text-white" : "text-black")}>Loading globe...</p>
          </div>
        </div>
      )}
      
      {/* Testimonial Popup */}
      {selectedTestimonials.length > 0 && (
        <div className="fixed inset-0 flex items-center justify-center z-30 bg-black/40">
          <div className="bg-white/95 p-8 max-w-md text-black shadow-2xl relative 
                         transition-all duration-500 animate-in fade-in zoom-in-95
                         border border-gray-200 backdrop-blur-sm">
            <button 
              className="absolute top-3 right-3 p-1.5 text-black/50 hover:text-black
                        hover:bg-gray-200/50 rounded-full 
                        transition-colors"
              onClick={() => {
                setSelectedTestimonials([]);
                setCurrentTestimonialIndex(0);
                // Resume auto-rotation after closing testimonial
                setTimeout(() => {
                  if (globeEl.current && globeEl.current.controls()) {
                    globeEl.current.controls().autoRotate = true;
                    // Reset to a wider view
                    globeEl.current.pointOfView({ altitude: 2.2 }, 1000);
                  }
                }, 300);
              }}
              aria-label="Close testimonial"
            >
              <X size={18} />
            </button>
            
            {/* Show testimonial count and navigation if multiple testimonials */}
            {selectedTestimonials.length > 1 && (
              <div className="mb-3 flex items-center justify-between">
                <button
                  onClick={goToPreviousTestimonial}
                  className="p-1.5 text-black/50 hover:text-black hover:bg-gray-200/50 rounded-full transition-colors"
                  aria-label="Previous testimonial"
                >
                  ←
                </button>
                <span className="text-xs text-black/60 font-medium">
                  {currentTestimonialIndex + 1} of {selectedTestimonials.length}
                </span>
                <button
                  onClick={goToNextTestimonial}
                  className="p-1.5 text-black/50 hover:text-black hover:bg-gray-200/50 rounded-full transition-colors"
                  aria-label="Next testimonial"
                >
                  →
                </button>
              </div>
            )}
            
            <div className="mb-2 pb-1 inline-block border-b-2 border-red-800">
              <h3 className="text-xl pr-6 font-bold" style={{ fontFamily: 'var(--font-instrument-serif)' }}>{selectedTestimonials[currentTestimonialIndex].name}</h3>
            </div>
            <p className="text-black font-medium text-sm" style={{ fontFamily: 'var(--font-instrument-sans)' }}>{selectedTestimonials[currentTestimonialIndex].company}</p>
            <p className="text-red-800 text-xs mb-4" style={{ fontFamily: 'var(--font-instrument-sans)' }}>{selectedTestimonials[currentTestimonialIndex].location}</p>
            <p className="text-black leading-relaxed text-sm" style={{ fontFamily: 'var(--font-instrument-sans)' }}>"{selectedTestimonials[currentTestimonialIndex].testimonial}"</p>
          </div>
        </div>
      )}
      
      {/* Instruction text */}
      <div className={cn(
        "absolute bottom-5 left-0 right-0 text-center text-sm opacity-70",
        darkMode ? "text-white" : "text-black"
      )}>
        Drag to rotate the globe. Click on markers to view testimonials.<br />
        <span className="text-xs opacity-60">Larger, brighter markers have multiple testimonials.</span>
      </div>
    </div>
  );
} 
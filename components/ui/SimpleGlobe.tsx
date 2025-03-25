"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { cn } from "@/lib/utils"
import { X } from "lucide-react"

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
    name: "Rahul Sharma",
    company: "EcoVentures Chile",
    location: "Santiago, Chile",
    testimonial: "Do It Better Design transformed our brand identity completely. Their sustainable approach matched our values perfectly, and the results have been incredible for our business growth in Santiago.",
    coordinates: [-33.4489, -70.6693], // Santiago, Chile
  },
  {
    name: "Sarah Johnson",
    company: "Artisan Collective",
    location: "Sydney, Australia",
    testimonial: "Working with Do It Better Design was a revelation. They understood our unique vision for our Sydney-based business and translated it into a cohesive brand strategy that resonates with our customers worldwide.",
    coordinates: [-33.8688, 151.2093], // Sydney, Australia
  },
  {
    name: "Michael Chang",
    company: "SustainTech Solutions",
    location: "Cape Town, South Africa",
    testimonial: "The team at Do It Better Design brings a rare combination of creativity and strategic thinking. Their work helped us establish a distinctive presence in Cape Town's competitive market.",
    coordinates: [-33.9249, 18.4241], // Cape Town, South Africa
  },
  {
    name: "Aisha Patel",
    company: "Mindful Spaces",
    location: "Toronto, Canada",
    testimonial: "From concept to execution, Do It Better Design delivered beyond our expectations. Their thoughtful approach to our Toronto-based branding needs resulted in a visual identity that perfectly captures our essence.",
    coordinates: [43.6532, -79.3832], // Toronto, Canada
  },
  {
    name: "Lars Eriksson",
    company: "Nordic Sustainability",
    location: "Moscow, Russia",
    testimonial: "Do It Better Design's ability to blend aesthetic beauty with functional design is outstanding. They've helped us communicate our commitment to sustainability across Moscow in a visually compelling way.",
    coordinates: [55.7558, 37.6173], // Moscow, Russia
  },
  {
    name: "Elena Rodriguez",
    company: "Solaris Energy",
    location: "Jakarta, Indonesia",
    testimonial: "The rebranding work done by Do It Better Design helped us connect with our customers in Jakarta on a deeper level. Our engagement and conversion metrics have improved significantly since the launch.",
    coordinates: [-6.2088, 106.8456], // Jakarta, Indonesia
  },
  {
    name: "Kenji Tanaka",
    company: "Green Future Tech",
    location: "Rio de Janeiro, Brazil",
    testimonial: "Do It Better Design understood our need to balance traditional values with innovation in the Brazilian market. The result was a brand identity for our Rio office that feels both timeless and contemporary.",
    coordinates: [-22.9068, -43.1729], // Rio de Janeiro, Brazil
  }
];

// Convert testimonials to markers
const DEFAULT_MARKERS: GlobeMarker[] = testimonials.map(testimonial => ({
  location: testimonial.coordinates,
  size: 0.15
}));

// Default configuration
const DEFAULT_CONFIG: GlobeConfig = {
  markers: DEFAULT_MARKERS,
  markerColor: [251/255, 100/255, 21/255], // Orange color
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
  const [selectedTestimonial, setSelectedTestimonial] = useState<Testimonial | null>(null);
  const globeEl = useRef<GlobeInstance | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
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

  // Find testimonial by coordinates
  const findTestimonialByCoordinates = useCallback((lat: number, lng: number): Testimonial | null => {
    return testimonials.find(t => 
      Math.abs(t.coordinates[0] - lat) < 0.001 && 
      Math.abs(t.coordinates[1] - lng) < 0.001
    ) || null;
  }, []);

  // Handle point click
  const handlePointClick = useCallback((point: GlobeMarker) => {
    if (!globeEl.current) return;
    
    // Find the testimonial for this point
    const testimonial = findTestimonialByCoordinates(point.location[0], point.location[1]);
    if (!testimonial) return;
    
    // Stop auto-rotation when a point is clicked
    if (globeEl.current.controls()) {
      globeEl.current.controls().autoRotate = false;
    }
    
    // Animate to point position - using a higher altitude to prevent cropping
    globeEl.current.pointOfView(
      {
        lat: testimonial.coordinates[0],
        lng: testimonial.coordinates[1],
        altitude: 2.0 // Higher altitude to prevent cropping
      },
      1000 // animation duration in ms
    );
    
    // Show the testimonial after a brief delay
    setTimeout(() => {
      setSelectedTestimonial(testimonial);
    }, 1000);
  }, [findTestimonialByCoordinates]);

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
      
      // Configure globe with less detail
      globe
        // Use brighter images for better visibility
        .globeImageUrl('//unpkg.com/three-globe/example/img/earth-blue-marble.jpg') // Brighter, more detailed texture
        .bumpImageUrl('//unpkg.com/three-globe/example/img/earth-topology.png') // Add subtle bump mapping for better terrain
        .backgroundColor(backgroundColor)
        .pointsData(markers)
        .pointLat((d: GlobeMarker) => d.location[0])
        .pointLng((d: GlobeMarker) => d.location[1])
        .pointColor(() => markerColorString)
        .pointRadius(1.2) // Larger radius for better clickability
        .pointAltitude(0.06) // Higher altitude to be more visible
        .onPointHover((point: GlobeMarker | null) => {
          if (globeEl.current && globeEl.current.controls) {
            // Slow down rotation when hovering over a point
            const controls = globeEl.current.controls();
            if (controls) {
              controls.autoRotateSpeed = point ? 0.1 : autoRotateSpeed;
            }
          }
        })
        .onPointClick(handlePointClick); // Add click handler
      
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
    <div className="relative w-full h-full">
      <div 
        ref={containerRef}
        className={cn(
          "relative mx-auto w-full h-full",
          className
        )}
      >
        {/* Globe element will be dynamically added to this container */}
      </div>
      
      {/* Loading indicator */}
      {mounted && !globeReady && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto animate-spin"></div>
            <p className="mt-2 text-gray-800">Loading globe...</p>
          </div>
        </div>
      )}
      
      {/* Testimonial Popup */}
      {selectedTestimonial && (
        <div className="fixed inset-0 flex items-center justify-center z-30 bg-black/40">
          <div className="bg-white/95 p-8 rounded-xl max-w-md text-gray-800 shadow-2xl relative 
                         transition-all duration-500 animate-in fade-in zoom-in-95
                         border border-gray-200 backdrop-blur-sm">
            <button 
              className="absolute top-3 right-3 p-1.5 text-gray-500 hover:text-gray-800
                        hover:bg-gray-200/50 rounded-full 
                        transition-colors"
              onClick={() => {
                setSelectedTestimonial(null);
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
            <div className="mb-2 pb-1 inline-block border-b-2 border-blue-500/50">
              <h3 className="text-xl font-bold pr-6">{selectedTestimonial.name}</h3>
            </div>
            <p className="text-gray-600 italic font-medium text-sm">{selectedTestimonial.company}</p>
            <p className="text-blue-600 text-xs mb-4">{selectedTestimonial.location}</p>
            <p className="text-gray-700 leading-relaxed text-sm">"{selectedTestimonial.testimonial}"</p>
          </div>
        </div>
      )}
      
      {/* Instruction text */}
      <div className="absolute bottom-5 left-0 right-0 text-center text-gray-800 text-sm opacity-70">
        Drag to rotate the globe. Click on markers to view testimonials.
      </div>
    </div>
  );
} 
import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { mockSchools, type School } from '@/data/schools';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Users, GraduationCap, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Mock implementation for demo - in real app, you'd use actual Mapbox token
const MAPBOX_TOKEN = null; // Will use mock map

interface MapComponentProps {
  selectedSchool?: string;
  onSchoolSelect?: (school: School) => void;
}

const MapComponent = ({ selectedSchool, onSchoolSelect }: MapComponentProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [selectedPopup, setSelectedPopup] = useState<School | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!mapContainer.current) return;

    // Note: In a real implementation, you'd need a valid Mapbox token
    // For this demo, we'll use a mock implementation
    if (!MAPBOX_TOKEN || MAPBOX_TOKEN.includes('example')) {
      // Mock map implementation for demo
      return;
    }

    mapboxgl.accessToken = MAPBOX_TOKEN;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [-38.5014, -12.9777], // Salvador center
      zoom: 11,
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Add markers for schools
    mockSchools.forEach((school) => {
      const marker = new mapboxgl.Marker({
        color: '#FFC700', // Primary yellow
      })
        .setLngLat(school.coordinates)
        .addTo(map.current!);

      marker.getElement().addEventListener('click', () => {
        setSelectedPopup(school);
        onSchoolSelect?.(school);
      });
    });

    return () => {
      map.current?.remove();
    };
  }, [onSchoolSelect]);

  // Mock map for demo purposes
  const handleSchoolClick = (school: School) => {
    setSelectedPopup(school);
    onSchoolSelect?.(school);
  };

  const handleViewDetails = (schoolId: string) => {
    navigate(`/escola/${schoolId}`);
  };

  return (
    <div className="relative w-full h-full">
      {/* Mock Map Container */}
      <div 
        ref={mapContainer} 
        className="w-full h-full bg-gradient-to-br from-blue-50 to-green-50 relative overflow-hidden"
      >
        {/* Mock map background */}
        <div className="absolute inset-0 opacity-20">
          <div className="w-full h-full bg-gradient-to-br from-blue-100 to-green-100"></div>
        </div>

        {/* Mock School Pins positioned over Salvador neighborhoods */}
        {mockSchools.map((school, index) => {
          // Better positioning to simulate Salvador map
          const positions = [
            { left: '35%', top: '40%' }, // Paralela
            { left: '45%', top: '45%' }, // Brotas
            { left: '25%', top: '60%' }, // Barra
            { left: '70%', top: '35%' }, // Itapuã
            { left: '40%', top: '55%' }, // Liberdade
            { left: '30%', top: '65%' }  // Ondina
          ];
          const position = positions[index] || { left: '50%', top: '50%' };
          
          return (
            <div
              key={school.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer hover:scale-110 transition-transform"
              style={position}
              onClick={() => handleSchoolClick(school)}
            >
              <div className="relative">
                <MapPin className="w-8 h-8 text-pin-primary drop-shadow-lg" fill="currentColor" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-pin-secondary rounded-full border-2 border-white"></div>
              </div>
            </div>
          );
        })}

        {/* Map Search Bar */}
        <div className="absolute top-4 left-4 right-4 z-10">
          <div className="max-w-md">
            <input
              type="text"
              placeholder="Buscar escolas..."
              className="w-full px-3 py-2 rounded-lg border bg-background/95 backdrop-blur-sm shadow-sm font-montserrat text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        {/* Map Controls */}
        <div className="absolute top-4 right-4 space-y-2 z-10">
          <Button variant="map" size="map">
            Zoom +
          </Button>
          <Button variant="map" size="map">
            Zoom -
          </Button>
        </div>
      </div>

      {/* School Popup */}
      {selectedPopup && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 w-full max-w-[90vw] sm:max-w-80">
          <Card className="shadow-popup mx-4 sm:mx-0">
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-poppins font-bold text-lg text-foreground">
                  {selectedPopup.name}
                </h3>
                <button
                  onClick={() => setSelectedPopup(null)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  ×
                </button>
              </div>
              
              <p className="text-muted-foreground font-montserrat text-sm mb-2">
                <MapPin className="w-4 h-4 inline mr-1" />
                {selectedPopup.neighborhood}
              </p>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm font-montserrat">
                  <GraduationCap className="w-4 h-4 mr-2 text-primary" />
                  <span>{selectedPopup.periods.slice(0, 2).join(', ')}</span>
                </div>
                
                <div className="text-sm font-montserrat">
                  <div className="flex items-center mb-2">
                    <Users className="w-4 h-4 mr-2 text-secondary" />
                    <span className="font-semibold">Professores Instrutores:</span>
                  </div>
                  <div className="max-h-16 overflow-y-auto space-y-1 ml-6">
                    {selectedPopup.instructors.map((instructor, idx) => (
                      <div key={idx} className="text-xs">
                        {instructor.name} - {instructor.subject}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <Button 
                onClick={() => handleViewDetails(selectedPopup.id)}
                className="w-full"
                variant="hero"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Ver Detalhes
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default MapComponent;
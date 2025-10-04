import { useState, useEffect } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BottomNav from '@/components/BottomNav';
import MapComponent from '@/components/MapComponent';
import { type School } from '@/data/schools';
import { useSchools } from '@/hooks/useSchools';

const MapPage = () => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { data: schools = [] } = useSchools();
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);

  useEffect(() => {
    // Pegar escola do state (quando vem do botão "Ver no Mapa")
    if (location.state?.selectedSchool) {
      setSelectedSchool(location.state.selectedSchool);
    } 
    // Ou pegar pelo ID da URL
    else {
      const schoolId = searchParams.get('school');
      if (schoolId && schools.length > 0) {
        const school = schools.find(s => s.id === schoolId);
        if (school) {
          setSelectedSchool(school);
        }
      }
    }
  }, [location.state, searchParams, schools]);

  return (
    <div className="min-h-screen flex flex-col pb-16 md:pb-0">
      <Header />
      
      <main className="flex-1">
        <div className="h-[calc(100vh-4rem)]">
          <MapComponent 
            selectedSchool={selectedSchool?.id}
            onSchoolSelect={setSelectedSchool}
          />
        </div>
      </main>
      
      <Footer />
      <BottomNav />
    </div>
  );
};

export default MapPage;
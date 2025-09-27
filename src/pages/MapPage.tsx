import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import MapComponent from '@/components/MapComponent';
import { type School } from '@/data/schools';

const MapPage = () => {
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);

  return (
    <div className="min-h-screen flex flex-col">
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
    </div>
  );
};

export default MapPage;
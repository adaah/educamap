import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BottomNav from '@/components/BottomNav';
import MapComponent from '@/components/MapComponent';
import { type School } from '@/data/schools';

const MapPage = () => {
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);

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
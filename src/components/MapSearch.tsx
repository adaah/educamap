import { useState } from 'react';
import { Search, X } from 'lucide-react';
import { type School } from '@/data/schools';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

interface MapSearchProps {
  schools: School[];
  onSchoolSelect: (school: School) => void;
}

export const MapSearch = ({ schools, onSchoolSelect }: MapSearchProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showResults, setShowResults] = useState(false);

  const filteredSchools = schools.filter(school => {
    if (!searchQuery) return false;
    const query = searchQuery.toLowerCase();
    return (
      school.name.toLowerCase().includes(query) ||
      school.neighborhood.toLowerCase().includes(query) ||
      school.fullAddress.toLowerCase().includes(query)
    );
  });

  const handleSelectSchool = (school: School) => {
    onSchoolSelect(school);
    setSearchQuery('');
    setShowResults(false);
  };

  const handleClear = () => {
    setSearchQuery('');
    setShowResults(false);
  };

  return (
    <div className="relative w-full max-w-md">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Buscar por nome, bairro ou endereço..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setShowResults(true);
          }}
          onFocus={() => setShowResults(true)}
          className="pl-10 pr-10 bg-white/95 backdrop-blur-sm shadow-lg border-primary/20"
        />
        {searchQuery && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {showResults && searchQuery && (
        <Card className="absolute top-full mt-2 w-full max-h-96 overflow-y-auto bg-white shadow-xl z-50">
          {filteredSchools.length > 0 ? (
            <div className="divide-y">
              {filteredSchools.map((school) => (
                <button
                  key={school.id}
                  onClick={() => handleSelectSchool(school)}
                  className="w-full text-left p-3 hover:bg-accent transition-colors"
                >
                  <div className="font-poppins font-semibold text-sm text-foreground">
                    {school.name}
                  </div>
                  <div className="text-xs text-muted-foreground font-montserrat mt-1">
                    {school.neighborhood} - {school.fullAddress}
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center">
              <p className="text-sm text-muted-foreground font-montserrat">
                Nenhuma escola encontrada
              </p>
            </div>
          )}
        </Card>
      )}
    </div>
  );
};

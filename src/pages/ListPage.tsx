import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import FilterPanel, { type FilterState } from '@/components/FilterPanel';
import SchoolCard from '@/components/SchoolCard';
import { mockSchools } from '@/data/schools';
import { Search } from 'lucide-react';

const ListPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterState>({
    neighborhoods: [],
    periods: [],
    subjects: [],
    natures: [],
    shifts: []
  });

  const filteredSchools = useMemo(() => {
    return mockSchools.filter(school => {
      // Search query filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch = 
          school.name.toLowerCase().includes(query) ||
          school.neighborhood.toLowerCase().includes(query) ||
          school.fullAddress.toLowerCase().includes(query);
        
        if (!matchesSearch) return false;
      }

      // Apply filters
      if (filters.neighborhoods.length > 0 && !filters.neighborhoods.includes(school.neighborhood)) {
        return false;
      }

      if (filters.periods.length > 0 && !filters.periods.some(period => school.periods.includes(period))) {
        return false;
      }

      if (filters.subjects.length > 0 && !filters.subjects.some(subject => school.subjects.includes(subject))) {
        return false;
      }

      if (filters.natures.length > 0 && !filters.natures.includes(school.nature)) {
        return false;
      }

      if (filters.shifts.length > 0 && !filters.shifts.some(shift => school.shift.includes(shift))) {
        return false;
      }

      return true;
    });
  }, [searchQuery, filters]);

  const handleClearFilters = () => {
    setFilters({
      neighborhoods: [],
      periods: [],
      subjects: [],
      natures: [],
      shifts: []
    });
    setSearchQuery('');
  };

  const handleViewOnMap = (schoolId: string) => {
    // This would typically update URL params to highlight the school on the map
    navigate(`/?school=${schoolId}`);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full">
          {/* Filter Panel - Left Column */}
          <div className="lg:col-span-1">
            <div className="sticky top-20">
              <FilterPanel 
                filters={filters}
                onFiltersChange={setFilters}
                onClear={handleClearFilters}
              />
            </div>
          </div>

          {/* Results Column */}
          <div className="lg:col-span-3">
            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <input
                  type="text"
                  placeholder="Buscar escolas por nome, bairro ou endereço..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border rounded-lg bg-background font-montserrat text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            {/* Results Header */}
            <div className="flex justify-between items-center mb-6">
              <h1 className="font-poppins font-bold text-2xl text-foreground">
                Escolas Disponíveis
              </h1>
              <p className="text-muted-foreground font-montserrat text-sm">
                {filteredSchools.length} {filteredSchools.length === 1 ? 'escola encontrada' : 'escolas encontradas'}
              </p>
            </div>

            {/* Results List */}
            <div className="space-y-4">
              {filteredSchools.length > 0 ? (
                filteredSchools.map((school) => (
                  <SchoolCard 
                    key={school.id} 
                    school={school} 
                    onViewOnMap={handleViewOnMap}
                  />
                ))
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="font-poppins font-semibold text-lg text-foreground mb-2">
                    Nenhuma escola encontrada
                  </h3>
                  <p className="text-muted-foreground font-montserrat mb-4">
                    Tente ajustar seus filtros ou termo de busca
                  </p>
                  <button
                    onClick={handleClearFilters}
                    className="text-primary font-montserrat text-sm hover:underline"
                  >
                    Limpar todos os filtros
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ListPage;
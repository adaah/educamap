import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import FilterPanel, { type FilterState } from '@/components/FilterPanel';
import SchoolCard from '@/components/SchoolCard';
import { useSchools } from '@/hooks/useSchools';
import { Search, GraduationCap } from 'lucide-react';

const ListPage = () => {
  const navigate = useNavigate();
  const { data: schools = [], isLoading } = useSchools();
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterState>({
    neighborhoods: [],
    periods: [],
    subjects: [],
    natures: [],
    shifts: []
  });

  const filteredSchools = useMemo(() => {
    return schools.filter(school => {
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
  }, [schools, searchQuery, filters]);

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
    navigate(`/?school=${schoolId}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background via-background to-primary/5">
      <Header />
      
      <main className="flex-1 container py-8 px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary mb-4 shadow-elegant">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <h1 className="font-poppins font-bold text-3xl sm:text-4xl text-foreground mb-2">
            Encontre sua Escola de Estágio
          </h1>
          <p className="text-muted-foreground font-montserrat text-base sm:text-lg max-w-2xl mx-auto">
            Descubra as melhores oportunidades de estágio supervisionado em Salvador
          </p>
        </div>

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
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <input
                  type="text"
                  placeholder="Buscar escolas por nome, bairro ou endereço..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 border-2 border-primary/20 rounded-xl bg-background font-montserrat text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary shadow-sm transition-all"
                />
              </div>
            </div>

            {/* Results Header */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-2 bg-gradient-to-r from-primary/10 to-secondary/10 p-4 rounded-xl">
              <h2 className="font-poppins font-bold text-xl sm:text-2xl text-foreground">
                Escolas Disponíveis
              </h2>
              <div className="flex items-center gap-2">
                <div className="bg-primary/20 px-4 py-2 rounded-lg">
                  <p className="font-poppins font-semibold text-foreground">
                    {filteredSchools.length} {filteredSchools.length === 1 ? 'escola' : 'escolas'}
                  </p>
                </div>
              </div>
            </div>

            {/* Results List */}
            <div className="space-y-4">
              {isLoading ? (
                <div className="text-center py-16">
                  <div className="animate-pulse space-y-4">
                    <div className="w-16 h-16 bg-primary/20 rounded-full mx-auto" />
                    <p className="font-montserrat text-muted-foreground">Carregando escolas...</p>
                  </div>
                </div>
              ) : filteredSchools.length > 0 ? (
                filteredSchools.map((school) => (
                  <SchoolCard 
                    key={school.id} 
                    school={school} 
                    onViewOnMap={handleViewOnMap}
                  />
                ))
              ) : (
                <div className="text-center py-16 bg-gradient-to-br from-background to-muted/30 rounded-xl border-2 border-dashed border-muted">
                  <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-elegant">
                    <Search className="w-10 h-10 text-primary" />
                  </div>
                  <h3 className="font-poppins font-bold text-xl text-foreground mb-3">
                    Nenhuma escola encontrada
                  </h3>
                  <p className="text-muted-foreground font-montserrat mb-6 max-w-md mx-auto">
                    Não encontramos escolas com os filtros selecionados. Tente ajustar sua busca.
                  </p>
                  <button
                    onClick={handleClearFilters}
                    className="px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white font-poppins font-semibold rounded-lg hover:shadow-lg transition-all transform hover:scale-105"
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

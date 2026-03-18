import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';

import BottomNav from '@/components/BottomNav';
import FilterPanel, { type FilterState } from '@/components/FilterPanel';
import SchoolCard from '@/components/SchoolCard';
import { useSchools } from '@/hooks/useSchools';
import { Search, GraduationCap, SlidersHorizontal } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const ListPage = () => {
  const navigate = useNavigate();
  const { data: schools = [], isLoading } = useSchools();
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
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

  const handleViewOnMap = (school: any) => {
    navigate(`/?school=${school.id}`, { state: { selectedSchool: school } });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background pb-16 md:pb-0">
      <Header />
      
      <main className="flex-1 container py-4 sm:py-8 px-3 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="mb-6 sm:mb-8 text-center">
          <div className="inline-block p-2 sm:p-3 bg-primary/20 rounded-full mb-3 sm:mb-4">
            <GraduationCap className="w-8 h-8 sm:w-12 sm:h-12 text-primary" />
          </div>
          <h1 className="font-poppins font-bold text-2xl sm:text-4xl md:text-5xl text-foreground mb-2 sm:mb-6 text-secondary px-4">
            Encontre sua Escola de Estágio
          </h1>
          <p className="font-montserrat text-sm sm:text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed px-4">
            Descubra as melhores oportunidades de estágio supervisionado em Salvador
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6 h-full">
          {/* Filter Panel - Desktop Only */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="lg:sticky lg:top-20">
              <FilterPanel 
                filters={filters}
                onFiltersChange={setFilters}
                onClear={handleClearFilters}
                isExpanded={true}
                onToggle={() => {}}
              />
            </div>
          </div>

          {/* Results Column */}
          <div className="lg:col-span-3">
            {/* Search Bar with Filter Icon */}
            <div className="mb-4 sm:mb-6 flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4 sm:w-5 sm:h-5" />
                <input
                  type="text"
                  placeholder="Buscar escolas por nome, bairro ou endereço..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-4 border-2 border-primary/20 rounded-xl bg-background font-montserrat text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary shadow-sm transition-all"
                />
              </div>
              
              {/* Filter Icon Button - Only on Mobile */}
              <Button
                variant="outline"
                size="icon"
                onClick={() => setShowFilters(true)}
                className="lg:hidden h-[52px] w-[52px] flex-shrink-0 border-2 border-primary/20 relative"
              >
                <SlidersHorizontal className="w-5 h-5 text-primary" />
                {(filters.neighborhoods.length + filters.periods.length + filters.subjects.length + filters.natures.length + filters.shifts.length) > 0 && (
                  <Badge variant="secondary" className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-[10px]">
                    {filters.neighborhoods.length + filters.periods.length + filters.subjects.length + filters.natures.length + filters.shifts.length}
                  </Badge>
                )}
              </Button>
            </div>

            {/* Mobile Filter Modal */}
            <Dialog open={showFilters} onOpenChange={setShowFilters}>
              <DialogContent className="max-w-[95vw] sm:max-w-md max-h-[85vh] p-0">
                <DialogHeader className="px-6 pt-6 pb-4 border-b">
                  <DialogTitle className="font-poppins font-bold text-xl flex items-center gap-2">
                    <SlidersHorizontal className="w-5 h-5 text-primary" />
                    Filtros
                  </DialogTitle>
                </DialogHeader>
                <div className="overflow-y-auto px-6 pb-6">
                  <FilterPanel 
                    filters={filters}
                    onFiltersChange={setFilters}
                    onClear={handleClearFilters}
                    isExpanded={true}
                    onToggle={() => {}}
                    isMobileModal={true}
                  />
                </div>
              </DialogContent>
            </Dialog>

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
                <div className="text-center py-16 bg-muted/30 rounded-xl border-2 border-dashed border-muted">
                  <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
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
                    className="px-6 py-3 bg-secondary text-white font-poppins font-semibold rounded-lg hover:bg-secondary/90 transition-all"
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
      <BottomNav />
    </div>
  );
};

export default ListPage;

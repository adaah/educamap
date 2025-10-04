import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { RotateCcw, Filter } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface FilterState {
  neighborhoods: string[];
  periods: string[];
  subjects: string[];
  natures: string[];
  shifts: string[];
}

interface FilterPanelProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  onClear: () => void;
}

const FilterPanel = ({ filters, onFiltersChange, onClear }: FilterPanelProps) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [availableFilters, setAvailableFilters] = useState({
    neighborhoods: [] as string[],
    periods: [] as string[],
    subjects: [] as string[],
    natures: [] as string[],
    shifts: [] as string[],
  });

  useEffect(() => {
    const fetchAvailableFilters = async () => {
      // Buscar bairros únicos
      const { data: neighborhoodsData } = await supabase
        .from('schools')
        .select('neighborhood')
        .order('neighborhood');
      
      const uniqueNeighborhoods = [...new Set(
        neighborhoodsData?.map(s => s.neighborhood).filter(Boolean) || []
      )].sort();

      // Buscar períodos únicos
      const { data: periodsData } = await supabase
        .from('school_periods')
        .select('period')
        .order('period');
      
      const uniquePeriods = [...new Set(
        periodsData?.map(p => p.period).filter(Boolean) || []
      )].sort();

      // Buscar disciplinas únicas
      const { data: subjectsData } = await supabase
        .from('school_subjects')
        .select('subject')
        .order('subject');
      
      const uniqueSubjects = [...new Set(
        subjectsData?.map(s => s.subject).filter(Boolean) || []
      )].sort();

      // Buscar turnos únicos
      const { data: shiftsData } = await supabase
        .from('school_shifts')
        .select('shift')
        .order('shift');
      
      const uniqueShifts = [...new Set(
        shiftsData?.map(s => s.shift).filter(Boolean) || []
      )].sort();

      // Buscar naturezas únicas
      const { data: naturesData } = await supabase
        .from('schools')
        .select('nature');
      
      const uniqueNatures = [...new Set(
        naturesData?.map(n => n.nature).filter(Boolean) || []
      )].sort();

      setAvailableFilters({
        neighborhoods: uniqueNeighborhoods,
        periods: uniquePeriods,
        subjects: uniqueSubjects,
        natures: uniqueNatures,
        shifts: uniqueShifts,
      });
    };

    fetchAvailableFilters();
  }, []);

  const handleFilterChange = (category: keyof FilterState, value: string, checked: boolean) => {
    const currentValues = filters[category];
    const newValues = checked 
      ? [...currentValues, value]
      : currentValues.filter(v => v !== value);
    
    onFiltersChange({
      ...filters,
      [category]: newValues
    });
  };

  const getTotalActiveFilters = () => {
    return Object.values(filters).flat().length;
  };

  const FilterGroup = ({ 
    title, 
    options, 
    category 
  }: { 
    title: string; 
    options: string[]; 
    category: keyof FilterState;
  }) => (
    <div className="space-y-2 sm:space-y-3">
      <h3 className="font-poppins font-semibold text-xs sm:text-sm text-foreground">{title}</h3>
      <div className="space-y-1.5 sm:space-y-2 max-h-40 sm:max-h-48 overflow-y-auto">
        {options.map((option) => (
          <div key={option} className="flex items-center space-x-2">
            <Checkbox
              id={`${category}-${option}`}
              checked={filters[category].includes(option)}
              onCheckedChange={(checked) => 
                handleFilterChange(category, option, checked as boolean)
              }
              className="h-4 w-4"
            />
            <label 
              htmlFor={`${category}-${option}`}
              className="text-xs sm:text-sm font-montserrat cursor-pointer flex-1 leading-tight"
            >
              {option}
            </label>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="w-full h-fit">
      <Card className="max-h-[calc(100vh-8rem)] flex flex-col shadow-card">
        <CardHeader className="pb-3 sm:pb-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <CardTitle className="font-poppins font-bold text-base sm:text-lg flex items-center gap-2">
              <Filter className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              Filtros
              {getTotalActiveFilters() > 0 && (
                <Badge variant="secondary" className="text-[10px] sm:text-xs">
                  {getTotalActiveFilters()}
                </Badge>
              )}
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClear}
              className="text-muted-foreground hover:text-foreground text-xs h-8"
            >
              <RotateCcw className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
              <span className="hidden sm:inline">Limpar</span>
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="overflow-y-auto flex-1 space-y-4 sm:space-y-6 pb-4 sm:pb-6">
          <FilterGroup 
            title="Bairro" 
            options={availableFilters.neighborhoods} 
            category="neighborhoods" 
          />
          
          <FilterGroup 
            title="Período de Ensino" 
            options={availableFilters.periods} 
            category="periods" 
          />
          
          <FilterGroup 
            title="Matérias/Áreas" 
            options={availableFilters.subjects} 
            category="subjects" 
          />
          
          <FilterGroup 
            title="Natureza" 
            options={availableFilters.natures} 
            category="natures" 
          />
          
          <FilterGroup 
            title="Turno" 
            options={availableFilters.shifts} 
            category="shifts" 
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default FilterPanel;
export type { FilterState };
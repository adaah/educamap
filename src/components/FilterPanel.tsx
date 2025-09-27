import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { RotateCcw, Filter } from 'lucide-react';
import { neighborhoods, subjects, periods, shifts, natures } from '@/data/schools';

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
    <div className="space-y-3">
      <h3 className="font-poppins font-semibold text-sm text-foreground">{title}</h3>
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {options.map((option) => (
          <div key={option} className="flex items-center space-x-2">
            <Checkbox
              id={`${category}-${option}`}
              checked={filters[category].includes(option)}
              onCheckedChange={(checked) => 
                handleFilterChange(category, option, checked as boolean)
              }
            />
            <label 
              htmlFor={`${category}-${option}`}
              className="text-sm font-montserrat cursor-pointer flex-1"
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
        <CardHeader className="pb-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <CardTitle className="font-poppins font-bold text-lg flex items-center gap-2">
              <Filter className="w-5 h-5 text-primary" />
              Filtros
              {getTotalActiveFilters() > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {getTotalActiveFilters()}
                </Badge>
              )}
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClear}
              className="text-muted-foreground hover:text-foreground"
            >
              <RotateCcw className="w-4 h-4 mr-1" />
              Limpar
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="overflow-y-auto flex-1 space-y-6 pb-6">
          <FilterGroup 
            title="Bairro" 
            options={neighborhoods} 
            category="neighborhoods" 
          />
          
          <FilterGroup 
            title="Período de Ensino" 
            options={periods} 
            category="periods" 
          />
          
          <FilterGroup 
            title="Matérias/Áreas" 
            options={subjects} 
            category="subjects" 
          />
          
          <FilterGroup 
            title="Natureza" 
            options={natures} 
            category="natures" 
          />
          
          <FilterGroup 
            title="Turno" 
            options={shifts} 
            category="shifts" 
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default FilterPanel;
export type { FilterState };
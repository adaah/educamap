import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, ExternalLink, Eye, GraduationCap, Building2 } from 'lucide-react';
import { type School } from '@/data/schools';
import { useNavigate } from 'react-router-dom';

interface SchoolCardProps {
  school: School;
  onViewOnMap: (school: School) => void;
}

const SchoolCard = ({ school, onViewOnMap }: SchoolCardProps) => {
  const navigate = useNavigate();

  const handleViewDetails = () => {
    navigate(`/escola/${school.id}`);
  };

  const handleViewOnMap = () => {
    navigate('/', { state: { selectedSchool: school } });
  };

  return (
    <Card className="shadow-card hover:shadow-lg transition-shadow">
      <CardContent className="p-4 sm:p-6">
        {/* Header */}
        <div className="flex flex-col gap-3 mb-4">
          <h3 className="font-poppins font-bold text-base sm:text-lg text-foreground break-words">
            {school.name}
          </h3>
          
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-start text-muted-foreground text-xs sm:text-sm font-montserrat flex-1">
              <MapPin className="w-3 h-3 sm:w-4 sm:h-4 mr-1 mt-0.5 flex-shrink-0" />
              <span className="break-words line-clamp-2">{school.neighborhood} - {school.fullAddress.split(' - ')[0]}</span>
            </div>
            
            <Badge 
              variant={school.nature === 'Pública' ? 'default' : 'secondary'} 
              className={`flex-shrink-0 px-2.5 py-1 text-[10px] sm:text-xs font-semibold shadow-sm ${
                school.nature === 'Pública' 
                  ? 'bg-primary text-primary-foreground border-0' 
                  : 'bg-secondary text-secondary-foreground border-0'
              }`}
            >
              <Building2 className="w-3 h-3 mr-1" />
              {school.nature}
            </Badge>
          </div>
        </div>

        {/* Períodos */}
        <div className="mb-4">
          <h4 className="font-poppins font-semibold text-xs sm:text-sm text-foreground mb-2 flex items-center">
            <GraduationCap className="w-3 h-3 sm:w-4 sm:h-4 mr-1 text-primary" />
            Períodos
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {school.periods.slice(0, 3).map((period) => (
              <Badge key={period} variant="outline" className="text-[10px] sm:text-xs font-montserrat">
                {period}
              </Badge>
            ))}
            {school.periods.length > 3 && (
              <Badge variant="outline" className="text-[10px] sm:text-xs font-montserrat">
                +{school.periods.length - 3} mais
              </Badge>
            )}
          </div>
        </div>

        {/* Subjects */}
        <div className="mb-4">
          <p className="text-xs sm:text-sm text-muted-foreground font-montserrat mb-2 break-words">
            <strong>Matérias:</strong> {school.subjects.slice(0, 4).join(', ')}
            {school.subjects.length > 4 && ` (+${school.subjects.length - 4} mais)`}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <button 
            className="w-full px-6 py-3 bg-secondary text-white font-poppins font-semibold text-xs sm:text-sm rounded-lg hover:bg-secondary/90 transition-all flex items-center justify-center border border-white/20 shadow-sm"
            onClick={handleViewDetails}
          >
            Detalhes
          </button>
          
          <Button 
            onClick={handleViewOnMap}
            variant="outline"
            size="default"
            className="sm:w-auto text-xs sm:text-sm h-9 sm:h-10 border border-gray-300 hover:border-gray-400 shadow-sm"
          >
            <Eye className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
            Ver no Mapa
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SchoolCard;
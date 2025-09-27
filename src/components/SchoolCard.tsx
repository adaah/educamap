import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, ExternalLink, Eye, GraduationCap, Building2 } from 'lucide-react';
import { type School } from '@/data/schools';
import { useNavigate } from 'react-router-dom';

interface SchoolCardProps {
  school: School;
  onViewOnMap: (schoolId: string) => void;
}

const SchoolCard = ({ school, onViewOnMap }: SchoolCardProps) => {
  const navigate = useNavigate();

  const handleViewDetails = () => {
    navigate(`/escola/${school.id}`);
  };

  const handleViewOnMap = () => {
    onViewOnMap(school.id);
    navigate('/');
  };

  return (
    <Card className="shadow-card hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="font-poppins font-bold text-lg text-foreground mb-2">
              {school.name}
            </h3>
            <div className="flex items-center text-muted-foreground text-sm font-montserrat mb-2">
              <MapPin className="w-4 h-4 mr-1" />
              <span>{school.neighborhood} - {school.fullAddress.split(' - ')[0]}</span>
            </div>
          </div>
          
          <Badge variant={school.nature === 'Pública' ? 'secondary' : 'outline'} className="font-montserrat">
            <Building2 className="w-3 h-3 mr-1" />
            {school.nature}
          </Badge>
        </div>

        {/* Main Opportunities */}
        <div className="mb-4">
          <h4 className="font-poppins font-semibold text-sm text-foreground mb-2 flex items-center">
            <GraduationCap className="w-4 h-4 mr-1 text-primary" />
            Principais Oportunidades
          </h4>
          <div className="flex flex-wrap gap-1">
            {school.periods.slice(0, 3).map((period) => (
              <Badge key={period} variant="outline" className="text-xs font-montserrat">
                {period}
              </Badge>
            ))}
            {school.periods.length > 3 && (
              <Badge variant="outline" className="text-xs font-montserrat">
                +{school.periods.length - 3} mais
              </Badge>
            )}
          </div>
        </div>

        {/* Subjects */}
        <div className="mb-4">
          <p className="text-sm text-muted-foreground font-montserrat mb-2">
            <strong>Matérias:</strong> {school.subjects.slice(0, 4).join(', ')}
            {school.subjects.length > 4 && ` (+${school.subjects.length - 4} mais)`}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button 
            onClick={handleViewDetails}
            variant="hero"
            className="flex-1"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Ver Detalhes
          </Button>
          
          <Button 
            onClick={handleViewOnMap}
            variant="outline"
            size="default"
          >
            <Eye className="w-4 h-4 mr-2" />
            Ver no Mapa
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SchoolCard;
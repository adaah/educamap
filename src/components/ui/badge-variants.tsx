import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface SchoolBadgeProps {
  nature: 'Pública' | 'Particular';
  className?: string;
  children?: React.ReactNode;
}

export const SchoolBadge = ({ nature, className, children }: SchoolBadgeProps) => {
  const badgeClass = nature === 'Pública' 
    ? 'bg-badge-public border-badge-public text-foreground' 
    : 'bg-badge-private border-badge-private text-foreground';
    
  return (
    <Badge 
      variant="outline" 
      className={cn(badgeClass, className)}
    >
      {children || nature}
    </Badge>
  );
};
import { Link, useLocation } from 'react-router-dom';
import { Map, List, UserPlus } from 'lucide-react';

const BottomNav = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', icon: Map, label: 'Mapa' },
    { path: '/lista', icon: List, label: 'Lista' },
    { path: '/colabore', icon: UserPlus, label: 'Colabore' },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-t shadow-lg">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                isActive ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <div className={`p-2 rounded-lg mb-1 transition-all ${
                isActive 
                  ? 'bg-gradient-to-br from-primary/20 to-secondary/20 scale-110' 
                  : 'hover:bg-accent'
              }`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-xs font-montserrat font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;

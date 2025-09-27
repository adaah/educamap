import { Link, useLocation } from 'react-router-dom';
import { Map, List } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Header = () => {
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        {/* Logo/Brand */}
        <Link 
          to="/" 
          className="flex items-center space-x-2 font-poppins font-bold text-xl"
        >
          <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
            <Map className="w-5 h-5 text-white" />
          </div>
          <span>EduMap Salvador</span>
        </Link>

        {/* Navigation Menu */}
        <nav className="flex items-center space-x-1 ml-8">
          <Button
            variant={location.pathname === '/' ? 'default' : 'ghost'}
            asChild
            className="font-montserrat text-sm sm:text-base"
          >
            <Link to="/" className="flex items-center space-x-2">
              <Map className="w-4 h-4" />
              <span className="hidden sm:inline">Mapa de Escolas</span>
              <span className="sm:hidden">Mapa</span>
            </Link>
          </Button>
          
          <Button
            variant={location.pathname === '/lista' ? 'default' : 'ghost'}
            asChild
            className="font-montserrat text-sm sm:text-base"
          >
            <Link to="/lista" className="flex items-center space-x-2">
              <List className="w-4 h-4" />
              <span className="hidden sm:inline">Lista e Filtros</span>
              <span className="sm:hidden">Lista</span>
            </Link>
          </Button>

          <Button
            variant={location.pathname === '/colabore' ? 'default' : 'ghost'}
            asChild
            className="font-montserrat text-sm sm:text-base"
          >
            <Link to="/colabore" className="flex items-center space-x-2">
              <span>Colabore</span>
            </Link>
          </Button>
        </nav>

        {/* Right side - Optional CTA or additional nav */}
        <div className="ml-auto">
          <span className="text-sm text-muted-foreground font-montserrat hidden md:inline">
            Estágios em Pedagogia
          </span>
        </div>
      </div>
    </header>
  );
};

export default Header;
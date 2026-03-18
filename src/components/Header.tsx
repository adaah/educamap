import { Link, useLocation } from 'react-router-dom';
import { Map, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const Header = () => {
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 sm:h-16 items-center px-3 sm:px-4">
        <Link 
          to="/" 
          className="flex items-center space-x-2 mr-2 sm:mr-0"
        >
          <div className="w-7 h-7 sm:w-8 sm:h-8 bg-secondary rounded-lg flex items-center justify-center flex-shrink-0">
            <Map className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-poppins font-bold text-sm sm:text-xl text-secondary">EduMap Salvador</span>
            <span className="font-montserrat text-[10px] sm:text-xs text-muted-foreground">Estágio em Instituições de Ensino</span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center space-x-1 ml-auto sm:ml-8">
          <Button
            variant={location.pathname === '/' ? 'default' : 'ghost'}
            asChild
            className="font-montserrat text-sm h-10 px-4"
          >
            <Link to="/" className="flex items-center space-x-2">
              <Map className="w-4 h-4" />
              <span>Mapa de Escolas</span>
            </Link>
          </Button>
          
          <Button
            variant={location.pathname === '/lista' ? 'default' : 'ghost'}
            asChild
            className="font-montserrat text-sm h-10 px-4"
          >
            <Link to="/lista" className="flex items-center space-x-2">
              <List className="w-4 h-4" />
              <span>Lista e Filtros</span>
            </Link>
          </Button>

          <Button
            variant={location.pathname === '/colabore' ? 'default' : 'ghost'}
            asChild
            className="font-montserrat text-sm h-10 px-4"
          >
            <Link to="/colabore" className="flex items-center space-x-2">
              <span>Colabore</span>
            </Link>
          </Button>
        </nav>

        <div className="ml-auto md:ml-4 flex items-center gap-2">
          <Badge variant="secondary" className="bg-secondary text-white border-0 font-poppins font-semibold">
            BETA
          </Badge>
        </div>
      </div>
    </header>
  );
};

export default Header;

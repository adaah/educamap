import { Link, useLocation } from 'react-router-dom';
import { Map, List } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Header = () => {
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 sm:h-16 items-center px-3 sm:px-4">
        {/* Logo/Brand */}
        <Link 
          to="/" 
          className="flex items-center space-x-2 mr-2 sm:mr-0"
        >
          <div className="w-7 h-7 sm:w-8 sm:h-8 bg-secondary rounded-lg flex items-center justify-center flex-shrink-0">
            <Map className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-poppins font-bold text-sm sm:text-xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">EduMap Salvador</span>
            <span className="font-montserrat text-[10px] sm:text-xs text-muted-foreground hidden sm:block">Estágio em instituições de ensino</span>
          </div>
        </Link>

        {/* Navigation Menu */}
        <nav className="flex items-center space-x-1 ml-auto sm:ml-8">
          <Button
            variant={location.pathname === '/' ? 'default' : 'ghost'}
            asChild
            className="font-montserrat text-xs sm:text-sm h-8 sm:h-10 px-2 sm:px-4"
          >
            <Link to="/" className="flex items-center space-x-1 sm:space-x-2">
              <Map className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">Mapa</span>
            </Link>
          </Button>
          
          <Button
            variant={location.pathname === '/lista' ? 'default' : 'ghost'}
            asChild
            className="font-montserrat text-xs sm:text-sm h-8 sm:h-10 px-2 sm:px-4"
          >
            <Link to="/lista" className="flex items-center space-x-1 sm:space-x-2">
              <List className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">Lista</span>
            </Link>
          </Button>

          <Button
            variant={location.pathname === '/colabore' ? 'default' : 'ghost'}
            asChild
            className="font-montserrat text-xs sm:text-sm h-8 sm:h-10 px-2 sm:px-4"
          >
            <Link to="/colabore" className="flex items-center space-x-1 sm:space-x-2">
              <span>Colabore</span>
            </Link>
          </Button>
        </nav>
      </div>
    </header>
  );
};

export default Header;
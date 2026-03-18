import { ExternalLink } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="border-t bg-background">
      <div className="container py-8 sm:py-12 px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
          {/* Brand */}
          <div>
            <h3 className="font-poppins font-semibold text-base sm:text-lg mb-3 sm:mb-4">EduMap Salvador</h3>
            <p className="text-xs sm:text-sm text-muted-foreground font-montserrat leading-relaxed">
              Sistema de mapeamento de escolas que realizam estágio para estudantes de pedagogia e licenciatura em Salvador - BA.
            </p>
          </div>

          {/* About */}
          <div>
            <h3 className="font-poppins font-semibold text-base sm:text-lg mb-3 sm:mb-4">Sobre</h3>
            <div className="space-y-2 text-xs sm:text-sm text-muted-foreground font-montserrat">
              <p>Iniciativa Estudantil</p>
              <p>Projeto do IdeaLab.ic</p>
              <p>Instituto de Computação da UFBA</p>
            </div>
          </div>

          {/* Projeto */}
          <div>
            <h3 className="font-poppins font-semibold text-base sm:text-lg mb-3 sm:mb-4">Projeto Independente</h3>
            <p className="text-xs sm:text-sm text-muted-foreground font-montserrat leading-relaxed">
              Este é um projeto independente desenvolvido por estudantes na Universidade Federal da Bahia (UFBA), sem vínculo institucional oficial.
            </p>
          </div>
        </div>

        <div className="border-t mt-6 sm:mt-8 pt-6 sm:pt-8 text-center">
          <p className="text-xs sm:text-sm text-muted-foreground font-montserrat">
            © 2025 EduMap Salvador. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

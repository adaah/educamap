import { ExternalLink } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="border-t bg-background">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <h3 className="font-poppins font-semibold text-lg mb-4">EduMap Salvador</h3>
            <p className="text-sm text-muted-foreground font-montserrat leading-relaxed">
              Sistema de mapeamento de escolas que realizam estágio para estudantes de pedagogia e licenciatura em Salvador - BA.
            </p>
          </div>

          {/* About */}
          <div>
            <h3 className="font-poppins font-semibold text-lg mb-4">Sobre</h3>
            <div className="space-y-2 text-sm text-muted-foreground font-montserrat">
              <p>Iniciativa Estudantil</p>
              <p>Projeto do IdeaLab.ic</p>
              <p>Instituto de Computação da UFBA</p>
            </div>
          </div>

          {/* Useful Links */}
          <div>
            <h3 className="font-poppins font-semibold text-lg mb-4">Links Úteis</h3>
            <div className="space-y-3 text-sm font-montserrat">
              <a 
                href="https://www.instagram.com/idealab.ic/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
              >
                <span>Idealab.ic</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <a 
                href="https://github.com/ic-ufba/edu-map" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
              >
                <span>Código Fonte</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <a 
                href="https://docs.google.com/forms/d/e/1FAIpQLSeJmzlN7bj6AOlwBqZbcQcw7NRcnsXs2Hay4q4rlzS-yOdijQ/viewform" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
              >
                <span>Contato</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 text-center">
          <p className="text-sm text-muted-foreground font-montserrat">
            © 2025 EduMap Salvador. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

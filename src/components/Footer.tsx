const Footer = () => {
  return (
    <footer className="border-t bg-background">
      <div className="container py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <h3 className="font-poppins font-semibold text-lg mb-4">EduMap Salvador</h3>
            <p className="text-sm text-muted-foreground font-montserrat">
              Sistema de mapeamento de escolas para estudantes de pedagogia em Salvador - BA.
            </p>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-poppins font-semibold text-lg mb-4">Contato</h3>
            <div className="space-y-2 text-sm text-muted-foreground font-montserrat">
              <p>edumap@salvador.ba.gov.br</p>
              <p>(71) 3000-0000</p>
              <p>Salvador - Bahia</p>
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-poppins font-semibold text-lg mb-4">Links Úteis</h3>
            <div className="space-y-2 text-sm text-muted-foreground font-montserrat">
              <p>Secretaria de Educação</p>
              <p>Portal do Estudante</p>
              <p>Universidades Parceiras</p>
            </div>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 text-center">
          <p className="text-sm text-muted-foreground font-montserrat">
            © 2024 EduMap Salvador. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
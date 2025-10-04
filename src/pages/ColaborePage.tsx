import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BottomNav from '@/components/BottomNav';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ShareExperienceForm } from '@/components/forms/ShareExperienceForm';
import { RegisterSchoolForm } from '@/components/forms/RegisterSchoolForm';
import { InstitutionalDataForm } from '@/components/forms/InstitutionalDataForm';

const ColaborePage = () => {
  const [openDialog, setOpenDialog] = useState<string | null>(null);

  const collaborationOptions = [
    {
      id: 'share-experience',
      title: "Recomendar um Instrutor ou Compartilhar Experiência",
      description: "Para estudantes que concluíram estágio e querem listar seus professores instrutores ou dar feedback sobre a escola.",
      buttonText: "Compartilhar Minha Experiência",
      form: ShareExperienceForm,
    },
    {
      id: 'register-school',
      title: "Nova Escola para o Mapa",
      description: "Para alunos ou membros da comunidade que notaram uma escola importante que ainda não está listada no sistema.",
      buttonText: "Cadastrar Nova Instituição",
      form: RegisterSchoolForm,
    },
    {
      id: 'institutional-data',
      title: "Atualizar/Enviar Dados Institucionais",
      description: "Para gestores escolares ou secretarias que desejam fornecer informações oficiais de contato, turmas e oportunidades.",
      buttonText: "Atualizar Dados da Escola",
      form: InstitutionalDataForm,
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-subtle pb-16 md:pb-0">
      <Header />
      
      <main className="flex-1 container py-6 sm:py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-8 sm:mb-12">
            <div className="inline-block p-2 sm:p-3 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full mb-3 sm:mb-4">
              <svg className="w-8 h-8 sm:w-12 sm:h-12 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h1 className="font-poppins font-bold text-2xl sm:text-4xl md:text-5xl text-foreground mb-2 sm:mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent px-4">
              Contribua com a Comunidade
            </h1>
            <p className="font-montserrat text-sm sm:text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed px-4">
              Sua colaboração é essencial para manter o EduMap Salvador atualizado e útil para toda a comunidade educacional. 
              Escolha abaixo como você pode ajudar:
            </p>
          </div>

          {/* Collaboration Options */}
          <div className="grid gap-4 sm:gap-8">
            {collaborationOptions.map((option, index) => {
              const FormComponent = option.form;
              const icons = [
                <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>,
                <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>,
                <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              ];
              
              return (
                <Card key={option.id} className="group hover:shadow-popup transition-all duration-300 overflow-hidden border-2 hover:border-primary/20">
                  <div className="p-4 sm:p-8">
                    <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-6">
                      {/* Icon */}
                      <div className="flex-shrink-0 self-start">
                        <div className="p-3 sm:p-4 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl text-primary group-hover:scale-110 transition-transform duration-300">
                          {icons[index]}
                        </div>
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 space-y-3">
                        <h3 className="font-poppins font-bold text-lg sm:text-2xl text-foreground group-hover:text-primary transition-colors">
                          {option.title}
                        </h3>
                        <p className="font-montserrat text-muted-foreground text-sm sm:text-base leading-relaxed">
                          {option.description}
                        </p>
                        
                        <Dialog 
                          open={openDialog === option.id} 
                          onOpenChange={(open) => setOpenDialog(open ? option.id : null)}
                        >
                          <DialogTrigger asChild>
                            <button className="mt-3 sm:mt-4 w-full sm:w-auto px-5 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-primary to-secondary text-white font-poppins font-semibold text-sm sm:text-base rounded-lg hover:shadow-lg transition-all transform hover:scale-105">
                              {option.buttonText}
                            </button>
                          </DialogTrigger>
                          <DialogContent className="max-w-[95vw] sm:max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-subtle border-2 mx-2">
                            <DialogHeader className="space-y-3 pb-4 sm:pb-6 border-b">
                              <div className="inline-flex p-2 sm:p-3 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl text-primary w-fit">
                                {icons[index]}
                              </div>
                              <DialogTitle className="font-poppins text-xl sm:text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                                {option.title}
                              </DialogTitle>
                              <DialogDescription className="font-montserrat text-sm sm:text-base text-muted-foreground">
                                {option.description}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="pt-4 sm:pt-6">
                              <FormComponent onSuccess={() => setOpenDialog(null)} />
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Additional Info */}
          <div className="mt-12 sm:mt-16">
            <Card className="p-6 sm:p-8 bg-gradient-to-br from-primary/5 to-secondary/5 border-2 border-primary/10">
              <div className="text-center">
                <h3 className="font-poppins font-bold text-xl sm:text-2xl text-foreground mb-3">
                  Dúvidas ou Sugestões?
                </h3>
                <p className="font-montserrat text-base sm:text-lg text-muted-foreground mb-4">
                  Nossa equipe está pronta para ajudar!
                </p>
                <a 
                  href="mailto:idealab.ic.ufba@gmail.com" 
                  className="inline-flex items-center gap-2 font-montserrat font-semibold text-sm sm:text-base text-primary hover:text-secondary transition-colors break-all"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  idealab.ic.ufba@gmail.com
                </a>
              </div>
            </Card>
          </div>
        </div>
      </main>
      
      <Footer />
      <BottomNav />
    </div>
  );
};

export default ColaborePage;
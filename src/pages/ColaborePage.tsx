import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
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
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-8">
            <h1 className="font-poppins font-bold text-3xl sm:text-4xl text-foreground mb-4">
              Sua Contribuição é Fundamental
            </h1>
            <p className="font-montserrat text-lg text-muted-foreground max-w-2xl mx-auto">
              Ajude a manter nosso mapa atualizado! Utilize os links abaixo para adicionar uma nova escola, 
              compartilhar sua experiência de estágio, ou atualizar dados de uma instituição já cadastrada.
            </p>
          </div>

          {/* Collaboration Options */}
          <div className="grid gap-6 md:gap-8">
            {collaborationOptions.map((option) => {
              const FormComponent = option.form;
              return (
                <Card key={option.id} className="p-6 sm:p-8">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="font-poppins font-semibold text-xl sm:text-2xl text-foreground mb-3">
                        {option.title}
                      </h3>
                      <p className="font-montserrat text-muted-foreground text-base leading-relaxed">
                        {option.description}
                      </p>
                    </div>
                    
                    <div className="flex-shrink-0">
                      <Dialog 
                        open={openDialog === option.id} 
                        onOpenChange={(open) => setOpenDialog(open ? option.id : null)}
                      >
                        <DialogTrigger asChild>
                          <Button
                            variant="secondary"
                            className="w-full sm:w-auto font-montserrat text-base px-6 py-3"
                          >
                            {option.buttonText}
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle className="font-poppins text-2xl">
                              {option.title}
                            </DialogTitle>
                            <DialogDescription className="font-montserrat">
                              {option.description}
                            </DialogDescription>
                          </DialogHeader>
                          <FormComponent onSuccess={() => setOpenDialog(null)} />
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Additional Info */}
          <div className="mt-12 text-center">
            <Card className="p-6 bg-filter-bg">
              <h3 className="font-poppins font-semibold text-lg text-foreground mb-2">
                Dúvidas ou Sugestões?
              </h3>
              <p className="font-montserrat text-muted-foreground">
                Entre em contato conosco através do e-mail: 
                <span className="text-primary font-medium"> contato@edumapsalvador.com</span>
              </p>
            </Card>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ColaborePage;
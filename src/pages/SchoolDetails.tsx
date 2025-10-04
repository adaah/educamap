import { useParams, useNavigate } from 'react-router-dom';
import { useSchool } from '@/hooks/useSchools';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  MapPin, 
  Phone, 
  Mail, 
  ExternalLink, 
  GraduationCap, 
  Users, 
  UserCheck,
  Building2,
  Clock,
  MessageCircle,
  Instagram,
  Linkedin
} from 'lucide-react';

const SchoolDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: school, isLoading } = useSchool(id || '');

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container py-8">
          <div className="text-center">
            <p className="font-montserrat text-muted-foreground">Carregando...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!school) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container py-8">
          <div className="text-center">
            <h1 className="font-poppins font-bold text-2xl mb-4">Escola não encontrada</h1>
            <Button onClick={() => navigate('/')} variant="secondary" className="font-poppins font-semibold">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar ao Mapa
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container py-8">
        {/* Breadcrumb/Back Button */}
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          
          <nav className="text-sm font-montserrat text-muted-foreground">
            <span>Início</span> / <span>Escolas</span> / <span className="text-foreground">{school.name}</span>
          </nav>
        </div>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="font-poppins font-bold text-3xl text-foreground mb-2">
                {school.name}
              </h1>
              <div className="flex items-center text-muted-foreground font-montserrat">
                <MapPin className="w-4 h-4 mr-2" />
                <span>{school.fullAddress}</span>
              </div>
            </div>
            
            <Badge 
              variant="outline" 
              className={`text-sm ${
                school.nature === 'Pública' 
                  ? 'bg-badge-public border-badge-public text-foreground' 
                  : 'bg-badge-private border-badge-private text-foreground'
              }`}
            >
              <Building2 className="w-4 h-4 mr-1" />
              {school.nature}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contact Information */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="font-poppins font-bold text-xl flex items-center">
                  <Phone className="w-5 h-5 mr-2 text-secondary" />
                  Informações de Contato
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {school.email && (
                  <div className="flex items-center font-montserrat">
                    <Mail className="w-4 h-4 mr-3 text-muted-foreground" />
                    <a href={`mailto:${school.email}`} className="text-primary hover:underline">
                      {school.email}
                    </a>
                  </div>
                )}
                
                {school.phone && (
                  <div className="flex items-center font-montserrat">
                    <Phone className="w-4 h-4 mr-3 text-muted-foreground" />
                    <a href={`tel:${school.phone}`} className="text-primary hover:underline">
                      {school.phone}
                    </a>
                  </div>
                )}
                
                {school.website && (
                  <div className="flex items-center font-montserrat">
                    <ExternalLink className="w-4 h-4 mr-3 text-muted-foreground" />
                    <a 
                      href={school.website.startsWith('http') ? school.website : `https://${school.website}`}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {school.website}
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Additional Info */}
            {school.additionalInfo && (
              <Card className="shadow-card bg-gradient-to-br from-primary/5 to-secondary/5">
                <CardHeader>
                  <CardTitle className="font-poppins font-bold text-xl flex items-center">
                    <MessageCircle className="w-5 h-5 mr-2 text-secondary" />
                    Informações sobre Estágio
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="font-montserrat text-foreground leading-relaxed whitespace-pre-line">
                    {school.additionalInfo}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Teaching Opportunities */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="font-poppins font-bold text-xl flex items-center">
                  <GraduationCap className="w-5 h-5 mr-2 text-primary" />
                  Oportunidades de Estágio
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-poppins font-semibold text-sm mb-2">Períodos de Ensino</h3>
                  <div className="flex flex-wrap gap-2">
                    {school.periods.map((period) => (
                      <Badge key={period} variant="outline" className="font-montserrat">
                        {period}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="font-poppins font-semibold text-sm mb-2">Matérias/Disciplinas</h3>
                  <div className="flex flex-wrap gap-2">
                    {school.subjects.map((subject) => (
                      <Badge key={subject} variant="secondary" className="font-montserrat">
                        {subject}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="font-poppins font-semibold text-sm mb-2 flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    Turnos Disponíveis
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {school.shift.map((shift) => (
                      <Badge key={shift} variant="outline" className="font-montserrat">
                        {shift}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Instructors */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="font-poppins font-bold text-xl flex items-center">
                  <Users className="w-5 h-5 mr-2 text-primary" />
                  Professores Instrutores
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {school.instructors.map((instructor, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-filter-bg rounded-lg">
                      <div>
                        <h4 className="font-poppins font-semibold text-sm">{instructor.name}</h4>
                        <p className="text-muted-foreground font-montserrat text-sm">{instructor.subject}</p>
                      </div>
                      <div className="flex gap-2">
                        {instructor.email && (
                          <Button variant="outline" size="sm" asChild>
                            <a href={`mailto:${instructor.email}`} title="E-mail">
                              <Mail className="w-3 h-3" />
                            </a>
                          </Button>
                        )}
                        {instructor.linkedin && (
                          <Button variant="outline" size="sm" asChild>
                            <a href={instructor.linkedin} target="_blank" rel="noopener noreferrer" title="LinkedIn">
                              <Linkedin className="w-3 h-3" />
                            </a>
                          </Button>
                        )}
                        {instructor.whatsapp && (
                          <Button variant="outline" size="sm" asChild>
                            <a href={`https://wa.me/${instructor.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" title="WhatsApp">
                              <MessageCircle className="w-3 h-3" />
                            </a>
                          </Button>
                        )}
                        {instructor.instagram && (
                          <Button variant="outline" size="sm" asChild>
                            <a href={instructor.instagram} target="_blank" rel="noopener noreferrer" title="Instagram">
                              <Instagram className="w-3 h-3" />
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="font-poppins font-bold text-lg">Ações Rápidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="secondary" className="w-full font-poppins font-semibold" onClick={() => navigate('/')}>
                  <MapPin className="w-4 h-4 mr-2" />
                  Ver no Mapa
                </Button>
                <Button variant="outline" className="w-full" onClick={() => navigate('/lista')}>
                  Ver Outras Escolas
                </Button>
              </CardContent>
            </Card>

            {/* Former Students */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="font-poppins font-bold text-lg flex items-center">
                  <UserCheck className="w-5 h-5 mr-2 text-secondary" />
                  Ex-Alunos Estagiários
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {school.formerStudents.map((student, index) => (
                    <div key={index} className="p-3 bg-filter-bg rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-poppins font-semibold text-sm">{student.name}</h4>
                          <p className="text-muted-foreground font-montserrat text-xs">
                            {student.university} - {student.course}
                          </p>
                        </div>
                        <div className="flex gap-1 ml-2">
                          {student.email && (
                            <Button variant="outline" size="sm" asChild>
                              <a href={`mailto:${student.email}`} title="E-mail">
                                <Mail className="w-3 h-3" />
                              </a>
                            </Button>
                          )}
                          {student.linkedin && (
                            <Button variant="outline" size="sm" asChild>
                              <a href={student.linkedin} target="_blank" rel="noopener noreferrer" title="LinkedIn">
                                <Linkedin className="w-3 h-3" />
                              </a>
                            </Button>
                          )}
                          {student.whatsapp && (
                            <Button variant="outline" size="sm" asChild>
                              <a href={`https://wa.me/${student.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" title="WhatsApp">
                                <MessageCircle className="w-3 h-3" />
                              </a>
                            </Button>
                          )}
                          {student.instagram && (
                            <Button variant="outline" size="sm" asChild>
                              <a href={student.instagram} target="_blank" rel="noopener noreferrer" title="Instagram">
                                <Instagram className="w-3 h-3" />
                              </a>
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Location Map */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="font-poppins font-bold text-lg">Localização</CardTitle>
              </CardHeader>
              <CardContent>
                <div 
                  className="w-full h-48 bg-gradient-to-br from-blue-50 to-green-50 rounded-lg flex items-center justify-center relative overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => {
                    const encodedAddress = encodeURIComponent(school.fullAddress);
                    window.open(`https://maps.google.com/?q=${encodedAddress}`, '_blank');
                  }}
                >
                  <div className="absolute inset-0 opacity-20">
                    <div className="w-full h-full bg-gradient-to-br from-blue-100 to-green-100"></div>
                  </div>
                  <div className="relative text-center">
                    <MapPin className="w-12 h-12 text-pin-primary mx-auto mb-2" fill="currentColor" />
                    <p className="font-montserrat text-sm text-muted-foreground">
                      Clique para abrir no mapa<br />
                      {school.neighborhood}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default SchoolDetails;
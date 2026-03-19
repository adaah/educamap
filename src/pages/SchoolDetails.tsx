import { useParams, useNavigate } from 'react-router-dom';
import { useSchool } from '@/hooks/useSchools';
import Header from '@/components/Header';

import BottomNav from '@/components/BottomNav';
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
  MessageCircle
} from 'lucide-react';

const SchoolDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: school, isLoading } = useSchool(id || '');

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col pb-16 md:pb-0">
        <Header />
        <main className="flex-1 container py-8">
          <div className="text-center">
            <p className="font-montserrat text-muted-foreground">Carregando...</p>
          </div>
        </main>
        <BottomNav />
      </div>
    );
  }

  if (!school) {
    return (
      <div className="min-h-screen flex flex-col pb-16 md:pb-0">
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
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col pb-16 md:pb-0">
      <Header />
      
      <main className="flex-1 container py-4 sm:py-8 px-3 sm:px-6">
        <div className="mb-4 sm:mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)}
            className="mb-3 sm:mb-4 text-xs sm:text-sm"
          >
            <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
            Voltar
          </Button>
          
          <nav className="text-xs sm:text-sm font-montserrat text-muted-foreground px-1">
            <span>Início</span> / <span>Escolas</span> / <span className="text-foreground">{school.name}</span>
          </nav>
        </div>

        <div className="mb-6 sm:mb-8 px-1">
          <div className="flex flex-col gap-3 mb-3 sm:mb-4">
            <div className="flex items-start justify-between gap-3">
              <h1 className="font-poppins font-bold text-xl sm:text-3xl text-foreground">
                {school.name}
              </h1>
              
              <Badge 
                variant={school.nature === 'Pública' ? 'default' : 'secondary'} 
                className={`flex-shrink-0 px-3 py-1.5 text-xs sm:text-sm font-semibold shadow-md ${
                  school.nature === 'Pública' 
                    ? 'bg-primary text-primary-foreground border-0' 
                    : 'bg-secondary text-secondary-foreground border-0'
                }`}
              >
                <Building2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5" />
                {school.nature}
              </Badge>
            </div>
            
            <div className="flex items-start text-muted-foreground font-montserrat text-xs sm:text-sm">
              <MapPin className="w-3 h-3 sm:w-4 sm:h-4 mr-2 mt-0.5 flex-shrink-0" />
              <span className="break-words">{school.fullAddress}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Contact Information */}
            <Card className="shadow-card border-2 hover:border-primary/20 transition-all">
              <CardHeader>
                <CardTitle className="font-poppins font-bold text-base sm:text-xl flex items-center">
                  <div className="p-2 bg-primary/10 rounded-xl text-primary mr-2">
                    <Phone className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  Informações de Contato
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {school.email ? (
                  <div className="flex items-center font-montserrat text-xs sm:text-sm">
                    <Mail className="w-3 h-3 sm:w-4 sm:h-4 mr-3 text-muted-foreground flex-shrink-0" />
                    <a href={`mailto:${school.email}`} className="text-primary hover:underline break-all">
                      {school.email}
                    </a>
                  </div>
                ) : (
                  <div className="flex items-center font-montserrat text-xs sm:text-sm text-muted-foreground">
                    <Mail className="w-3 h-3 sm:w-4 sm:h-4 mr-3 flex-shrink-0" />
                    <span>Sem informação</span>
                  </div>
                )}
                
                {school.phone ? (
                  <div className="flex items-center font-montserrat text-xs sm:text-sm">
                    <Phone className="w-3 h-3 sm:w-4 sm:h-4 mr-3 text-muted-foreground flex-shrink-0" />
                    <a href={`tel:${school.phone}`} className="text-primary hover:underline">
                      {school.phone}
                    </a>
                  </div>
                ) : (
                  <div className="flex items-center font-montserrat text-xs sm:text-sm text-muted-foreground">
                    <Phone className="w-3 h-3 sm:w-4 sm:h-4 mr-3 flex-shrink-0" />
                    <span>Sem informação</span>
                  </div>
                )}
                
                {school.website ? (
                  <div className="flex items-start font-montserrat text-xs sm:text-sm">
                    <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4 mr-3 mt-0.5 text-muted-foreground flex-shrink-0" />
                    <a 
                      href={school.website.startsWith('http') ? school.website : `https://${school.website}`}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline break-all"
                    >
                      {school.website}
                    </a>
                  </div>
                ) : (
                  <div className="flex items-center font-montserrat text-xs sm:text-sm text-muted-foreground">
                    <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4 mr-3 flex-shrink-0" />
                    <span>Sem informação</span>
                  </div>
                )}
              </CardContent>
            </Card>

            
            {/* Teaching Opportunities */}
            <Card className="shadow-card border-2 hover:border-primary/20 transition-all">
              <CardHeader>
                <CardTitle className="font-poppins font-bold text-base sm:text-xl flex items-center">
                  <div className="p-2 bg-primary/10 rounded-xl text-primary mr-2">
                    <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  Oportunidades de Estágio
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-poppins font-semibold text-xs sm:text-sm mb-2">Períodos de Ensino</h3>
                  {school.periods.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {school.periods.map((period) => (
                        <Badge key={period} variant="outline" className="font-montserrat text-xs">
                          {period}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground font-montserrat text-xs italic">Sem informação</p>
                  )}
                </div>
                
                <div>
                  <h3 className="font-poppins font-semibold text-xs sm:text-sm mb-2">Matérias/Disciplinas</h3>
                  {school.subjects.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {school.subjects.map((subject) => (
                        <Badge key={subject} variant="secondary" className="font-montserrat text-xs">
                          {subject}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground font-montserrat text-xs italic">Sem informação</p>
                  )}
                </div>
                
                <div>
                  <h3 className="font-poppins font-semibold text-xs sm:text-sm mb-2 flex items-center">
                    <Clock className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                    Turnos Disponíveis
                  </h3>
                  {school.shift.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {school.shift.map((shift) => (
                        <Badge key={shift} variant="outline" className="font-montserrat text-xs">
                          {shift}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground font-montserrat text-xs italic">Sem informação</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Instructors */}
            <Card className="shadow-card border-2 hover:border-primary/20 transition-all">
              <CardHeader>
                <CardTitle className="font-poppins font-bold text-base sm:text-xl flex items-center">
                  <div className="p-2 bg-primary/10 rounded-xl text-primary mr-2">
                    <Users className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  Professores Instrutores
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 sm:space-y-4">
                  {school.instructors.map((instructor, index) => (
                    <div key={index} className="p-3 bg-filter-bg rounded-lg">
                      <h4 className="font-poppins font-semibold text-xs sm:text-sm">{instructor.name}</h4>
                      <p className="text-muted-foreground font-montserrat text-xs sm:text-sm">{instructor.subject || 'Sem informação'}</p>
                      
                      {(instructor.shifts?.length > 0 || instructor.periods?.length > 0) && (
                        <div className="mt-2 space-y-2">
                          {instructor.shifts?.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {instructor.shifts.map((shift) => (
                                <Badge key={shift} variant="outline" className="font-montserrat text-xs">
                                  {shift}
                                </Badge>
                              ))}
                            </div>
                          )}
                          {instructor.periods?.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {instructor.periods.map((period) => (
                                <Badge key={period} variant="secondary" className="font-montserrat text-xs">
                                  {period}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                      
                      {instructor.additionalInfo ? (
                        <div className="mt-3 space-y-2">
                          <div className="text-xs font-poppins font-semibold text-primary flex items-center">
                            <MessageCircle className="w-3 h-3 mr-1" />
                            Relatos de Estagiários:
                          </div>
                          {instructor.additionalInfo.split('\n\n---\n').map((entry, entryIndex) => (
                            <div key={entryIndex} className={`text-xs sm:text-sm font-montserrat text-foreground whitespace-pre-line bg-white/50 p-2 rounded border border-primary/10 ${entryIndex > 0 ? 'mt-2' : ''}`}>
                              {entry}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="mt-2 text-xs sm:text-sm font-montserrat text-muted-foreground italic">
                          Sem informação
                        </div>
                      )}
                    </div>
                  ))}
                  {school.instructors.length === 0 && (
                    <p className="text-muted-foreground text-sm text-center py-4">Sem informação</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {school.additionalInfo && (
              <Card className="shadow-card bg-primary/5 border-2 border-primary/20">
                <CardHeader>
                  <CardTitle className="font-poppins font-bold text-base sm:text-xl flex items-center">
                    <div className="p-2 bg-primary/10 rounded-xl text-primary mr-2">
                      <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    Relatos e Experiências
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="font-montserrat text-xs sm:text-sm text-foreground leading-relaxed whitespace-pre-line bg-white/50 p-3 sm:p-4 rounded-lg">
                    {school.additionalInfo.split('\n\n---\n').map((entry, index) => (
                      <div key={index} className={index > 0 ? 'mt-4 pt-4 border-t border-primary/20' : ''}>
                        {entry}
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center text-xs sm:text-sm text-muted-foreground italic border-t pt-3">
                    <Users className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 flex-shrink-0" />
                      <span className="break-words">Contribuições da comunidade EduMap</span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4 sm:space-y-6">
            <Card className="shadow-card border-2 hover:border-primary/20 transition-all bg-primary/5">
              <CardHeader>
                <CardTitle className="font-poppins font-bold text-base sm:text-lg">Ações Rápidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <button 
                  className="w-full px-6 py-3 bg-secondary text-white font-poppins font-semibold text-xs sm:text-sm rounded-lg hover:bg-secondary/90 transition-all flex items-center justify-center border border-white/20 shadow-sm"
                  onClick={() => navigate('/', { state: { selectedSchool: school } })}
                >
                  <MapPin className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                  Ver no Mapa
                </button>
                <Button variant="outline" className="w-full text-xs sm:text-sm" onClick={() => navigate('/lista')}>
                  Ver Outras Escolas
                </Button>
              </CardContent>
            </Card>

            {/* Former Students */}
            <Card className="shadow-card border-2 hover:border-primary/20 transition-all">
              <CardHeader>
                <CardTitle className="font-poppins font-bold text-base sm:text-lg flex items-center">
                  <div className="p-2 bg-secondary/10 rounded-xl text-secondary mr-2">
                    <UserCheck className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  Alunos Estagiários/Ex-estagiários
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {school.formerStudents.map((student, index) => (
                    <div key={index} className="p-3 bg-filter-bg rounded-lg">
                      <h4 className="font-poppins font-semibold text-xs sm:text-sm">{student.name}</h4>
                      <p className="text-muted-foreground font-montserrat text-xs">
                        {student.university} - {student.course}
                      </p>
                      {student.additionalInfo ? (
                        <div className="mt-2 text-xs sm:text-sm font-montserrat text-foreground whitespace-pre-line">
                          {student.additionalInfo}
                        </div>
                      ) : (
                        <div className="mt-2 text-xs sm:text-sm font-montserrat text-muted-foreground italic">
                          Sem informação
                        </div>
                      )}
                      {student.additionalInfo && (
                        <div className="mt-2 text-[11px] sm:text-xs text-muted-foreground italic flex items-center">
                          <Users className="w-3 h-3 mr-1" />
                          Enviado por: {student.contributorName || 'Contribuidor'}
                        </div>
                      )}
                    </div>
                  ))}
                  {school.formerStudents.length === 0 && (
                    <p className="text-muted-foreground text-sm text-center py-4">Sem informação</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Location Map */}
            <Card className="shadow-card border-2 hover:border-primary/20 transition-all">
              <CardHeader>
                <CardTitle className="font-poppins font-bold text-base sm:text-lg">Localização</CardTitle>
              </CardHeader>
              <CardContent>
                <div 
                  className="w-full h-40 sm:h-48 bg-muted rounded-lg flex items-center justify-center relative overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => {
                    const encodedAddress = encodeURIComponent(school.fullAddress);
                    window.open(`https://maps.google.com/?q=${encodedAddress}`, '_blank');
                  }}
                >
                  <div className="absolute inset-0 opacity-20">
                    <div className="w-full h-full bg-muted"></div>
                  </div>
                  <div className="relative text-center px-4">
                    <MapPin className="w-10 h-10 sm:w-12 sm:h-12 text-pin-primary mx-auto mb-2" fill="currentColor" />
                    <p className="font-montserrat text-xs sm:text-sm text-muted-foreground">
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
      
      
      <BottomNav />
    </div>
  );
};

export default SchoolDetails;

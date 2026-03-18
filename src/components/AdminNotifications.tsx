import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bell, CheckCircle, XCircle, Clock, Users, School, UserCheck } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Notification {
  id: string;
  type: 'school' | 'school_update' | 'instructor' | 'student' | 'contact_request';
  title: string;
  description: string;
  status: 'pending' | 'approved' | 'denied';
  createdAt: string;
  count: number;
}

export const AdminNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        // Buscar dados pendentes
        const [schoolsResult, schoolUpdatesResult, instructorsResult, studentsResult, requestsResult] = await Promise.all([
          supabase.from('pending_schools').select('*').eq('status', 'pending'),
          supabase.from('pending_school_updates').select('*').eq('status', 'pending'),
          supabase.from('pending_instructors').select('*').eq('status', 'pending'),
          supabase.from('pending_former_students').select('*').eq('status', 'pending'),
          supabase.from('contact_requests').select('*').eq('status', 'pending')
        ]);

        const notifications: Notification[] = [];

        // Escolas pendentes
        if (schoolsResult.data && schoolsResult.data.length > 0) {
          notifications.push({
            id: 'schools',
            type: 'school',
            title: 'Escolas Pendentes',
            description: `${schoolsResult.data.length} escola(s) aguardando aprovação`,
            status: 'pending',
            createdAt: schoolsResult.data[0]?.submitted_at || new Date().toISOString(),
            count: schoolsResult.data.length
          });
        }

        // Atualizações institucionais pendentes
        if (schoolUpdatesResult.data && schoolUpdatesResult.data.length > 0) {
          notifications.push({
            id: 'school_updates',
            type: 'school_update',
            title: 'Atualizações Institucionais',
            description: `${schoolUpdatesResult.data.length} atualização(ões) aguardando aprovação`,
            status: 'pending',
            createdAt: schoolUpdatesResult.data[0]?.submitted_at || new Date().toISOString(),
            count: schoolUpdatesResult.data.length
          });
        }

        // Instrutores pendentes
        if (instructorsResult.data && instructorsResult.data.length > 0) {
          notifications.push({
            id: 'instructors',
            type: 'instructor',
            title: 'Instrutores Pendentes',
            description: `${instructorsResult.data.length} instrutor(es) aguardando aprovação`,
            status: 'pending',
            createdAt: instructorsResult.data[0]?.submitted_at || new Date().toISOString(),
            count: instructorsResult.data.length
          });
        }

        // Estudantes pendentes
        if (studentsResult.data && studentsResult.data.length > 0) {
          notifications.push({
            id: 'students',
            type: 'student',
            title: 'Experiências Pendentes',
            description: `${studentsResult.data.length} experiência(s) aguardando aprovação`,
            status: 'pending',
            createdAt: studentsResult.data[0]?.submitted_at || new Date().toISOString(),
            count: studentsResult.data.length
          });
        }

        // Solicitações de contato pendentes
        if (requestsResult.data && requestsResult.data.length > 0) {
          notifications.push({
            id: 'requests',
            type: 'contact_request',
            title: 'Solicitações de Contato',
            description: `${requestsResult.data.length} solicitação(ões) aguardando aprovação`,
            status: 'pending',
            createdAt: requestsResult.data[0]?.created_at || new Date().toISOString(),
            count: requestsResult.data.length
          });
        }

        setNotifications(notifications);
      } catch (error) {
        console.error('Erro ao buscar notificações:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotifications();

    // Atualizar a cada 30 segundos
    const interval = setInterval(fetchNotifications, 30000);

    return () => clearInterval(interval);
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case 'school': return <School className="h-4 w-4" />;
      case 'school_update': return <School className="h-4 w-4" />;
      case 'instructor': return <Users className="h-4 w-4" />;
      case 'student': return <UserCheck className="h-4 w-4" />;
      case 'contact_request': return <Bell className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'denied': return <XCircle className="h-4 w-4 text-red-600" />;
      default: return <Clock className="h-4 w-4 text-yellow-600" />;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notificações
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Carregando...</p>
        </CardContent>
      </Card>
    );
  }

  if (notifications.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notificações
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm">Tudo em dia! Nenhuma pendência.</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notificações
          <Badge variant="destructive" className="ml-2">
            {notifications.reduce((total, notif) => total + notif.count, 0)}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              {getIcon(notification.type)}
              <div>
                <p className="font-medium text-sm">{notification.title}</p>
                <p className="text-xs text-muted-foreground">
                  {notification.description}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(notification.createdAt), {
                    addSuffix: true,
                    locale: ptBR
                  })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {getStatusIcon(notification.status)}
              <Badge variant="outline" className="text-xs">
                {notification.count}
              </Badge>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

type RealtimeUpdatesOptions = {
  showToasts?: boolean;
};

export const useRealtimeUpdates = (options: RealtimeUpdatesOptions = {}) => {
  const queryClient = useQueryClient();
  const showToasts = options.showToasts ?? false;

  useEffect(() => {
    // Escutar mudanças nas tabelas principais
    const schoolChannel = supabase
      .channel('schools-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'schools'
        },
        (payload) => {
          console.log('Schools updated:', payload);
          queryClient.invalidateQueries({ queryKey: ['schools'] });
          queryClient.invalidateQueries({ queryKey: ['school'] });
          
          if (!showToasts) return;

          if (payload.eventType === 'INSERT') {
            toast.success('Nova escola adicionada ao mapa!');
          } else if (payload.eventType === 'UPDATE') {
            toast.success('Informações da escola atualizadas!');
          }
        }
      )
      .subscribe();

    const schoolPeriodsChannel = supabase
      .channel('school-periods-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'school_periods'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['schools'] });
          queryClient.invalidateQueries({ queryKey: ['school'] });
        }
      )
      .subscribe();

    const schoolSubjectsChannel = supabase
      .channel('school-subjects-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'school_subjects'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['schools'] });
          queryClient.invalidateQueries({ queryKey: ['school'] });
        }
      )
      .subscribe();

    const schoolShiftsChannel = supabase
      .channel('school-shifts-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'school_shifts'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['schools'] });
          queryClient.invalidateQueries({ queryKey: ['school'] });
        }
      )
      .subscribe();

    const instructorChannel = supabase
      .channel('instructors-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'instructors'
        },
        (payload) => {
          console.log('Instructors updated:', payload);
          queryClient.invalidateQueries({ queryKey: ['schools'] });
          queryClient.invalidateQueries({ queryKey: ['school'] });
          
          if (!showToasts) return;

          if (payload.eventType === 'INSERT') {
            toast.success('Novo instrutor adicionado!');
          }
        }
      )
      .subscribe();

    const studentChannel = supabase
      .channel('students-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'former_students'
        },
        (payload) => {
          console.log('Students updated:', payload);
          queryClient.invalidateQueries({ queryKey: ['schools'] });
          queryClient.invalidateQueries({ queryKey: ['school'] });
          
          if (!showToasts) return;

          if (payload.eventType === 'INSERT') {
            toast.success('Nova experiência de estudante adicionada!');
          }
        }
      )
      .subscribe();

    const contactRequestChannel = supabase
      .channel('contact-requests-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'contact_requests'
        },
        (payload) => {
          console.log('Contact requests updated:', payload);
          queryClient.invalidateQueries({ queryKey: ['contact-requests'] });
          queryClient.invalidateQueries({ queryKey: ['contact-request'] });
          
          if (!showToasts) return;

          if (payload.eventType === 'INSERT') {
            toast.success('Nova solicitação de contato recebida!');
          } else if (payload.eventType === 'UPDATE') {
            const newStatus = payload.new?.status;
            if (newStatus === 'approved') {
              toast.success('Solicitação de contato aprovada!');
            } else if (newStatus === 'denied') {
              toast.error('Solicitação de contato negada.');
            }
          }
        }
      )
      .subscribe();

    // Cleanup
    return () => {
      schoolChannel.unsubscribe();
      schoolPeriodsChannel.unsubscribe();
      schoolSubjectsChannel.unsubscribe();
      schoolShiftsChannel.unsubscribe();
      instructorChannel.unsubscribe();
      studentChannel.unsubscribe();
      contactRequestChannel.unsubscribe();
    };
  }, [queryClient, showToasts]);
};

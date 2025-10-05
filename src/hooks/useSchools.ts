import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { School } from '@/data/schools';
import { useEffect } from 'react';

export const useSchools = () => {
  const queryClient = useQueryClient();
  
  const query = useQuery({
    queryKey: ['schools'],
    queryFn: async () => {
      const { data: schoolsData, error: schoolsError } = await supabase
        .from('schools')
        .select('*')
        .order('name');

      if (schoolsError) throw schoolsError;

      const schools: School[] = await Promise.all(
        schoolsData.map(async (school) => {
          const [periods, subjects, shifts, instructors, formerStudents] = await Promise.all([
            supabase.from('school_periods').select('period').eq('school_id', school.id),
            supabase.from('school_subjects').select('subject').eq('school_id', school.id),
            supabase.from('school_shifts').select('shift').eq('school_id', school.id),
            supabase.from('instructors').select('*').eq('school_id', school.id),
            supabase.from('former_students').select('*').eq('school_id', school.id),
          ]);

          return {
            id: school.id,
            name: school.name,
            neighborhood: school.neighborhood,
            fullAddress: school.full_address,
            coordinates: [school.longitude, school.latitude] as [number, number],
            email: school.email || undefined,
            phone: school.phone || undefined,
            website: school.website || undefined,
            nature: school.nature as 'Pública' | 'Particular',
            additionalInfo: school.additional_info || undefined,
            contributor_name: school.contributor_name || undefined,
            periods: periods.data?.map(p => p.period) || [],
            subjects: subjects.data?.map(s => s.subject) || [],
            shift: shifts.data?.map(s => s.shift) || [],
            instructors: instructors.data?.map(i => ({
              name: i.name,
              subject: i.subject,
              email: i.email || undefined,
              linkedin: i.linkedin || undefined,
              whatsapp: i.whatsapp || undefined,
              instagram: i.instagram || undefined,
              contributor_name: i.contributor_name || undefined,
            })) || [],
            formerStudents: formerStudents.data?.map(f => ({
              name: f.name,
              university: f.university,
              course: f.course,
              email: f.email || undefined,
              linkedin: f.linkedin || undefined,
              instagram: f.instagram || undefined,
              whatsapp: f.whatsapp || undefined,
              contributor_name: f.contributor_name || undefined,
            })) || [],
          };
        })
      );

      return schools;
    },
  });

  // Real-time subscription for new schools
  useEffect(() => {
    const channel = supabase
      .channel('schools-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'schools'
        },
        () => {
          // Refetch schools when any change happens
          queryClient.invalidateQueries({ queryKey: ['schools'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return query;
};

export const useSchool = (id: string) => {
  return useQuery({
    queryKey: ['school', id],
    queryFn: async () => {
      const { data: school, error: schoolError } = await supabase
        .from('schools')
        .select('*')
        .eq('id', id)
        .single();

      if (schoolError) throw schoolError;

      const [periods, subjects, shifts, instructors, formerStudents] = await Promise.all([
        supabase.from('school_periods').select('period').eq('school_id', school.id),
        supabase.from('school_subjects').select('subject').eq('school_id', school.id),
        supabase.from('school_shifts').select('shift').eq('school_id', school.id),
        supabase.from('instructors').select('*').eq('school_id', school.id),
        supabase.from('former_students').select('*').eq('school_id', school.id),
      ]);

      return {
        id: school.id,
        name: school.name,
        neighborhood: school.neighborhood,
        fullAddress: school.full_address,
        coordinates: [school.longitude, school.latitude] as [number, number],
        email: school.email || undefined,
        phone: school.phone || undefined,
        website: school.website || undefined,
        nature: school.nature as 'Pública' | 'Particular',
        additionalInfo: school.additional_info || undefined,
        contributor_name: school.contributor_name || undefined,
        periods: periods.data?.map(p => p.period) || [],
        subjects: subjects.data?.map(s => s.subject) || [],
        shift: shifts.data?.map(s => s.shift) || [],
        instructors: instructors.data?.map(i => ({
          name: i.name,
          subject: i.subject,
          email: i.email || undefined,
          linkedin: i.linkedin || undefined,
          whatsapp: i.whatsapp || undefined,
          instagram: i.instagram || undefined,
          contributor_name: i.contributor_name || undefined,
        })) || [],
        formerStudents: formerStudents.data?.map(f => ({
          name: f.name,
          university: f.university,
          course: f.course,
          email: f.email || undefined,
          linkedin: f.linkedin || undefined,
          instagram: f.instagram || undefined,
          whatsapp: f.whatsapp || undefined,
          contributor_name: f.contributor_name || undefined,
        })) || [],
      } as School;
    },
    enabled: !!id,
  });
};

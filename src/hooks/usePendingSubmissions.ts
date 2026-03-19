import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const usePendingSubmissions = () => {
  const queryClient = useQueryClient();

  const { data: pendingSchools = [], isLoading: loadingSchools } = useQuery({
    queryKey: ["pendingSchools"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pending_schools")
        .select("*")
        .eq("status", "pending")
        .order("submitted_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const { data: pendingSchoolUpdates = [], isLoading: loadingSchoolUpdates } = useQuery({
    queryKey: ["pendingSchoolUpdates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pending_school_updates")
        .select("*")
        .eq("status", "pending")
        .order("submitted_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const { data: pendingInstructors = [], isLoading: loadingInstructors } = useQuery({
    queryKey: ["pendingInstructors"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pending_instructors")
        .select("*")
        .eq("status", "pending")
        .order("submitted_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const { data: pendingStudents = [], isLoading: loadingStudents } = useQuery({
    queryKey: ["pendingStudents"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pending_former_students")
        .select("*")
        .eq("status", "pending")
        .order("submitted_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const approveSchool = useMutation({
    mutationFn: async (pendingSchool: any) => {
      const { data: user } = await supabase.auth.getUser();
      
      // Insert into main schools table
      const { data: school, error: schoolError } = await supabase
        .from("schools")
        .insert({
          name: pendingSchool.name,
          full_address: pendingSchool.full_address,
          neighborhood: pendingSchool.neighborhood,
          latitude: pendingSchool.latitude,
          longitude: pendingSchool.longitude,
          nature: pendingSchool.nature,
          email: pendingSchool.email,
          phone: pendingSchool.phone,
          website: pendingSchool.website,
          additional_info: pendingSchool.additional_info ? 
            `📝 ${pendingSchool.contributor_name || 'Anônimo'}:\n${pendingSchool.additional_info}` : 
            null,
          contributor_name: pendingSchool.contributor_name,
        })
        .select()
        .single();

      if (schoolError) throw schoolError;

      // Insert periods, subjects, shifts
      if (pendingSchool.periods?.length) {
        await supabase.from("school_periods").insert(
          pendingSchool.periods.map((period: string) => ({
            school_id: school.id,
            period,
          }))
        );
      }

      if (pendingSchool.subjects?.length) {
        await supabase.from("school_subjects").insert(
          pendingSchool.subjects.map((subject: string) => ({
            school_id: school.id,
            subject,
          }))
        );
      }

      if (pendingSchool.shifts?.length) {
        await supabase.from("school_shifts").insert(
          pendingSchool.shifts.map((shift: string) => ({
            school_id: school.id,
            shift,
          }))
        );
      }

      // Insert instructors
      if (pendingSchool.instructors?.length) {
        const { data: insertedInstructors, error: insInstructorsError } = await supabase.from("instructors").insert(
          pendingSchool.instructors.map((instructor: any) => ({
            school_id: school.id,
            name: instructor.name,
            subject: Array.isArray(instructor.subjects) ? (instructor.subjects.includes('Outros') && instructor.customSubject ? [...instructor.subjects.filter((s: string) => s !== 'Outros'), instructor.customSubject].join(', ') : instructor.subjects.join(', ')) : instructor.subject,
            email: instructor.email,
            linkedin: instructor.linkedin,
            whatsapp: instructor.whatsapp,
            instagram: instructor.instagram,
            contributor_name: pendingSchool.contributor_name,
            additional_info: instructor.additional_info,
            shifts: instructor.shifts,
            periods: instructor.periods,
          }))
        ).select("id");

        if (insInstructorsError) throw insInstructorsError;

        const shiftRows: { instructor_id: string; shift: string }[] = [];
        const periodRows: { instructor_id: string; period: string }[] = [];
        const source = pendingSchool.instructors as any[];
        insertedInstructors?.forEach((row, idx) => {
          const instructor = source[idx];
          if (row?.id && Array.isArray(instructor?.shifts)) {
            for (const shift of instructor.shifts) shiftRows.push({ instructor_id: row.id, shift });
          }
          if (row?.id && Array.isArray(instructor?.periods)) {
            for (const period of instructor.periods) periodRows.push({ instructor_id: row.id, period });
          }
        });

        if (shiftRows.length) {
          const { error } = await supabase.from("instructor_shifts" as any).insert(shiftRows as any);
          if (error) throw error;
        }
        if (periodRows.length) {
          const { error } = await supabase.from("instructor_periods" as any).insert(periodRows as any);
          if (error) throw error;
        }
      }

      // Update pending status
      await supabase
        .from("pending_schools")
        .update({
          status: "approved",
          reviewed_at: new Date().toISOString(),
          reviewed_by: user.user?.id,
        })
        .eq("id", pendingSchool.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pendingSchools"] });
      queryClient.invalidateQueries({ queryKey: ["schools"] });
      toast.success("Escola aprovada com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao aprovar escola: " + error.message);
    },
  });

  const approveSchoolUpdate = useMutation({
    mutationFn: async (pendingUpdate: any) => {
      const { data: user } = await supabase.auth.getUser();

      // Update main school fields (only provided ones)
      const updateData: Record<string, any> = {};
      if (pendingUpdate.email !== null && pendingUpdate.email !== undefined) updateData.email = pendingUpdate.email;
      if (pendingUpdate.phone !== null && pendingUpdate.phone !== undefined) updateData.phone = pendingUpdate.phone;
      if (pendingUpdate.website !== null && pendingUpdate.website !== undefined) updateData.website = pendingUpdate.website;
      
      // Acumular informações adicionais em vez de sobrescrever
      if (pendingUpdate.additional_info !== null && pendingUpdate.additional_info !== undefined) {
        // Buscar informações atuais da escola
        const { data: currentSchool } = await supabase
          .from('schools')
          .select('additional_info')
          .eq('id', pendingUpdate.school_id)
          .single();
        
        const existingInfo = currentSchool?.additional_info || '';
        const contributorName = pendingUpdate.contributor_name || 'Anônimo';
        const newEntry = existingInfo ? 
          `\n\n---\n📝 ${contributorName}:\n${pendingUpdate.additional_info}` :
          `📝 ${contributorName}:\n${pendingUpdate.additional_info}`;
        
        updateData.additional_info = existingInfo + newEntry;
      }

      if (Object.keys(updateData).length > 0) {
        const { error: updateError } = await supabase
          .from("schools")
          .update(updateData)
          .eq("id", pendingUpdate.school_id);
        if (updateError) throw updateError;
      }

      // Replace related lists if provided
      if (Array.isArray(pendingUpdate.periods)) {
        const { error: delError } = await supabase.from("school_periods").delete().eq("school_id", pendingUpdate.school_id);
        if (delError) throw delError;
        if (pendingUpdate.periods.length > 0) {
          const { error: insError } = await supabase.from("school_periods").insert(
            pendingUpdate.periods.map((period: string) => ({ school_id: pendingUpdate.school_id, period }))
          );
          if (insError) throw insError;
        }
      }

      if (Array.isArray(pendingUpdate.subjects)) {
        const { error: delError } = await supabase.from("school_subjects").delete().eq("school_id", pendingUpdate.school_id);
        if (delError) throw delError;
        if (pendingUpdate.subjects.length > 0) {
          const { error: insError } = await supabase.from("school_subjects").insert(
            pendingUpdate.subjects.map((subject: string) => ({ school_id: pendingUpdate.school_id, subject }))
          );
          if (insError) throw insError;
        }
      }

      if (Array.isArray(pendingUpdate.shifts)) {
        const { error: delError } = await supabase.from("school_shifts").delete().eq("school_id", pendingUpdate.school_id);
        if (delError) throw delError;
        if (pendingUpdate.shifts.length > 0) {
          const { error: insError } = await supabase.from("school_shifts").insert(
            pendingUpdate.shifts.map((shift: string) => ({ school_id: pendingUpdate.school_id, shift }))
          );
          if (insError) throw insError;
        }
      }

      if (pendingUpdate.instructors?.length) {
        const { error: insError } = await supabase.from("instructors").insert(
          pendingUpdate.instructors.map((instructor: any) => ({
            school_id: pendingUpdate.school_id,
            name: instructor.name,
            subject: Array.isArray(instructor.subjects) ? (instructor.subjects.includes('Outros') && instructor.customSubject ? [...instructor.subjects.filter((s: string) => s !== 'Outros'), instructor.customSubject].join(', ') : instructor.subjects.join(', ')) : instructor.subject,
            email: instructor.email,
            linkedin: instructor.linkedin,
            whatsapp: instructor.whatsapp,
            instagram: instructor.instagram,
            contributor_name: pendingUpdate.contributor_name ? `${pendingUpdate.contributor_name} - ${pendingUpdate.contributor_position || ""}`.trim() : null,
            additional_info: instructor.additional_info,
            shifts: instructor.shifts,
            periods: instructor.periods,
          }))
        );
        if (insError) throw insError;
      }

      await supabase
        .from("pending_school_updates")
        .update({
          status: "approved",
          reviewed_at: new Date().toISOString(),
          reviewed_by: user.user?.id,
        })
        .eq("id", pendingUpdate.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pendingSchoolUpdates"] });
      queryClient.invalidateQueries({ queryKey: ["schools"] });
      queryClient.invalidateQueries({ queryKey: ["school"] });
      toast.success("Atualização institucional aprovada!");
    },
    onError: (error) => {
      toast.error("Erro ao aprovar atualização: " + error.message);
    },
  });

  const approveInstructor = useMutation({
    mutationFn: async (pendingInstructor: any) => {
      const { data: user } = await supabase.auth.getUser();

      // Verificar se já existe um instrutor com mesmo nome na mesma escola
      let existingInstructor = null;
      if (pendingInstructor.school_id) {
        const { data } = await supabase
          .from("instructors")
          .select("id, additional_info")
          .eq("school_id", pendingInstructor.school_id)
          .ilike("name", pendingInstructor.name)
          .maybeSingle();
        existingInstructor = data;
      }

      if (existingInstructor) {
        // Acumular additional_info em vez de criar duplicata
        const updateData: Record<string, any> = {};
        if (pendingInstructor.additional_info) {
          const existing = existingInstructor.additional_info || '';
          const contributorName = pendingInstructor.contributor_name || 'Anônimo';
          const newEntry = existing
            ? `\n\n---\n📝 ${contributorName}:\n${pendingInstructor.additional_info}`
            : `📝 ${contributorName}:\n${pendingInstructor.additional_info}`;
          updateData.additional_info = existing + newEntry;
        }
        if (pendingInstructor.email) updateData.email = pendingInstructor.email;
        if (pendingInstructor.linkedin) updateData.linkedin = pendingInstructor.linkedin;
        if (pendingInstructor.whatsapp) updateData.whatsapp = pendingInstructor.whatsapp;
        if (pendingInstructor.instagram) updateData.instagram = pendingInstructor.instagram;

        if (Object.keys(updateData).length > 0) {
          const { error } = await supabase
            .from("instructors")
            .update(updateData)
            .eq("id", existingInstructor.id);
          if (error) throw error;
        }
      } else {
        // Formatar additional_info com nome do contribuidor
        let formattedInfo = pendingInstructor.additional_info;
        if (formattedInfo && pendingInstructor.contributor_name) {
          formattedInfo = `📝 ${pendingInstructor.contributor_name}:\n${formattedInfo}`;
        }

        const { data: inserted, error: insertError } = await supabase.from("instructors").insert({
          name: pendingInstructor.name,
          subject: pendingInstructor.subject,
          email: pendingInstructor.email,
          linkedin: pendingInstructor.linkedin,
          whatsapp: pendingInstructor.whatsapp,
          instagram: pendingInstructor.instagram,
          contributor_name: pendingInstructor.contributor_name,
          additional_info: formattedInfo,
          school_id: pendingInstructor.school_id || null,
        }).select("id").single();

        if (insertError) throw insertError;

        if (inserted?.id && Array.isArray(pendingInstructor.shifts) && pendingInstructor.shifts.length > 0) {
          const { error } = await supabase.from("instructor_shifts" as any).insert(
            pendingInstructor.shifts.map((shift: string) => ({ instructor_id: inserted.id, shift })) as any
          );
          if (error) throw error;
        }
        if (inserted?.id && Array.isArray(pendingInstructor.periods) && pendingInstructor.periods.length > 0) {
          const { error } = await supabase.from("instructor_periods" as any).insert(
            pendingInstructor.periods.map((period: string) => ({ instructor_id: inserted.id, period })) as any
          );
          if (error) throw error;
        }
      }

      await supabase
        .from("pending_instructors")
        .update({
          status: "approved",
          reviewed_at: new Date().toISOString(),
          reviewed_by: user.user?.id,
        })
        .eq("id", pendingInstructor.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pendingInstructors"] });
      queryClient.invalidateQueries({ queryKey: ["schools"] });
      toast.success("Professor aprovado com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao aprovar professor: " + error.message);
    },
  });

  const approveStudent = useMutation({
    mutationFn: async (pendingStudent: any) => {
      const { data: user } = await supabase.auth.getUser();

      // Se há dados de escola na experiência, atualizar a escola
      if (pendingStudent.school_id) {
        // Buscar dados da escola atual
        const { data: schoolData, error: schoolError } = await supabase
          .from('schools')
          .select('*')
          .eq('id', pendingStudent.school_id)
          .single();

        if (!schoolError && schoolData) {
          // Atualizar dados da escola com informações da experiência
          const updateData: any = {};
          
          // Atualizar email se não existir ou se for diferente
          if (pendingStudent.email && !schoolData.email) {
            updateData.email = pendingStudent.email;
          }
          
          // Atualizar telefone se não existir ou se for diferente
          if (pendingStudent.whatsapp && !schoolData.phone) {
            updateData.phone = pendingStudent.whatsapp;
          }
          
          // Acumular informações adicionais em vez de sobrescrever
          if (pendingStudent.additional_info) {
            const existingInfo = schoolData.additional_info || '';
            const contributorName = pendingStudent.contributor_name || 'Anônimo';
            const newEntry = `\n\n---\n📝 ${contributorName}:\n${pendingStudent.additional_info}`;
            
            updateData.additional_info = existingInfo + newEntry;
          }

          // Aplicar atualizações se houver
          if (Object.keys(updateData).length > 0) {
            await supabase
              .from('schools')
              .update(updateData)
              .eq('id', pendingStudent.school_id);
          }
        }
      }

      // Formatar additional_info com nome do contribuidor
      let formattedInfo = pendingStudent.additional_info;
      if (formattedInfo && pendingStudent.contributor_name) {
        formattedInfo = `📝 ${pendingStudent.contributor_name}:\n${formattedInfo}`;
      }

      const { error: insertError } = await supabase.from("former_students").insert({
        name: pendingStudent.name,
        course: pendingStudent.course,
        university: pendingStudent.university,
        email: pendingStudent.email,
        whatsapp: pendingStudent.whatsapp,
        linkedin: pendingStudent.linkedin,
        instagram: pendingStudent.instagram,
        contributor_name: pendingStudent.contributor_name,
        additional_info: formattedInfo,
        school_id: pendingStudent.school_id || null,
        user_id: pendingStudent.user_id || null,
      });

      if (insertError) throw insertError;

      await supabase
        .from("pending_former_students")
        .update({
          status: "approved",
          reviewed_at: new Date().toISOString(),
          reviewed_by: user.user?.id,
        })
        .eq("id", pendingStudent.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pendingStudents"] });
      queryClient.invalidateQueries({ queryKey: ["schools"] });
      toast.success("Estagiário aprovado com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao aprovar estagiário: " + error.message);
    },
  });

  const rejectSubmission = useMutation({
    mutationFn: async ({
      table,
      id,
    }: {
      table: "pending_schools" | "pending_school_updates" | "pending_instructors" | "pending_former_students";
      id: string;
    }) => {
      const { data: user } = await supabase.auth.getUser();

      await supabase
        .from(table)
        .update({
          status: "rejected",
          reviewed_at: new Date().toISOString(),
          reviewed_by: user.user?.id,
        })
        .eq("id", id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pendingSchools"] });
      queryClient.invalidateQueries({ queryKey: ["pendingSchoolUpdates"] });
      queryClient.invalidateQueries({ queryKey: ["pendingInstructors"] });
      queryClient.invalidateQueries({ queryKey: ["pendingStudents"] });
      toast.success("Submissão rejeitada!");
    },
    onError: (error) => {
      toast.error("Erro ao rejeitar: " + error.message);
    },
  });

  return {
    pendingSchools,
    pendingSchoolUpdates,
    pendingInstructors,
    pendingStudents,
    loading: loadingSchools || loadingSchoolUpdates || loadingInstructors || loadingStudents,
    approveSchool,
    approveSchoolUpdate,
    approveInstructor,
    approveStudent,
    rejectSubmission,
  };
};

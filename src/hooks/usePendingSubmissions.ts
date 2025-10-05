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
          additional_info: pendingSchool.additional_info,
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
        await supabase.from("instructors").insert(
          pendingSchool.instructors.map((instructor: any) => ({
            school_id: school.id,
            name: instructor.name,
            subject: instructor.subject,
            email: instructor.email,
            linkedin: instructor.linkedin,
            whatsapp: instructor.whatsapp,
            instagram: instructor.instagram,
            contributor_name: pendingSchool.contributor_name,
          }))
        );
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

  const approveInstructor = useMutation({
    mutationFn: async (pendingInstructor: any) => {
      const { data: user } = await supabase.auth.getUser();

      await supabase.from("instructors").insert({
        name: pendingInstructor.name,
        subject: pendingInstructor.subject,
        email: pendingInstructor.email,
        linkedin: pendingInstructor.linkedin,
        whatsapp: pendingInstructor.whatsapp,
        instagram: pendingInstructor.instagram,
        contributor_name: pendingInstructor.contributor_name,
        school_id: pendingInstructor.school_id,
      });

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

      await supabase.from("former_students").insert({
        name: pendingStudent.name,
        course: pendingStudent.course,
        university: pendingStudent.university,
        email: pendingStudent.email,
        whatsapp: pendingStudent.whatsapp,
        linkedin: pendingStudent.linkedin,
        instagram: pendingStudent.instagram,
        contributor_name: pendingStudent.contributor_name,
        school_id: null, // This would need to be linked if applicable
      });

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
      toast.success("Ex-estagiário aprovado com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao aprovar ex-estagiário: " + error.message);
    },
  });

  const rejectSubmission = useMutation({
    mutationFn: async ({ table, id }: { table: "pending_schools" | "pending_instructors" | "pending_former_students"; id: string }) => {
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
    pendingInstructors,
    pendingStudents,
    loading: loadingSchools || loadingInstructors || loadingStudents,
    approveSchool,
    approveInstructor,
    approveStudent,
    rejectSubmission,
  };
};

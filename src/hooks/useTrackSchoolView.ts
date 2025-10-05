import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export const useTrackSchoolView = (schoolId: string | undefined) => {
  const { user } = useAuth();

  useEffect(() => {
    const trackView = async () => {
      if (!user || !schoolId) return;

      try {
        // Insert or update school view
        await supabase
          .from("school_views")
          .upsert(
            {
              user_id: user.id,
              school_id: schoolId,
              viewed_at: new Date().toISOString(),
            },
            {
              onConflict: "user_id,school_id",
            }
          );
      } catch (error) {
        console.error("Error tracking school view:", error);
      }
    };

    trackView();
  }, [user, schoolId]);
};

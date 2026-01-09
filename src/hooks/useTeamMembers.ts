/**
 * useTeamMembers Hook
 * 
 * Gestisce il caricamento dei membri del team disponibili per le proposte progettuali.
 * Mantiene ESATTAMENTE la logica originale dal file page.tsx
 */

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { logger } from "@/lib/logger";
import { TeamMember } from "@/types/common.types";

export interface UseTeamMembersReturn {
  teamMembers: TeamMember[];
  loading: boolean;
  reload: () => Promise<void>;
}

export function useTeamMembers(): UseTeamMembersReturn {
  const supabase = createClient();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  /**
   * Carica team members disponibili
   * MANTIENE ESATTAMENTE LA LOGICA ORIGINALE
   */
  const loadTeamMembers = useCallback(async () => {
    try {
      const { data } = await supabase
        .from("profiles")
        .select("id, nome, cognome, professione, foto_profilo")
        .order("nome", { ascending: true });

      if (data) {
        setTeamMembers(data);
      }
    } catch (error) {
      logger.error("Errore caricamento team members:", error);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  // Carica al mount
  useEffect(() => {
    loadTeamMembers();
  }, [loadTeamMembers]);

  return {
    teamMembers,
    loading,
    reload: loadTeamMembers,
  };
}


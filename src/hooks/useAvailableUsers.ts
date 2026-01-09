/**
 * useAvailableUsers Hook
 * 
 * Gestisce il caricamento degli utenti disponibili per assegnazione responsabilità servizi.
 * Mantiene ESATTAMENTE la logica originale dal file page.tsx
 */

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { logger } from "@/lib/logger";
import { AvailableUser } from "@/types/common.types";

export interface UseAvailableUsersReturn {
  availableUsers: AvailableUser[];
  loading: boolean;
  reload: () => Promise<void>;
}

export function useAvailableUsers(): UseAvailableUsersReturn {
  const supabase = createClient();
  const [availableUsers, setAvailableUsers] = useState<AvailableUser[]>([]);
  const [loading, setLoading] = useState(true);

  /**
   * Carica utenti disponibili con email
   * MANTIENE ESATTAMENTE LA LOGICA ORIGINALE
   */
  const loadAvailableUsers = useCallback(async () => {
    try {
      const { data } = await supabase
        .from("profiles_with_email")
        .select("id, nome, cognome, email, professione")
        .order("nome", { ascending: true, nullsFirst: false });

      if (data) {
        setAvailableUsers(data);
      }
    } catch (error) {
      logger.error("Errore caricamento utenti:", error);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  // Carica al mount
  useEffect(() => {
    loadAvailableUsers();
  }, [loadAvailableUsers]);

  return {
    availableUsers,
    loading,
    reload: loadAvailableUsers,
  };
}


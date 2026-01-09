/**
 * usePricingConfig Hook
 * 
 * Gestisce il caricamento della configurazione pricing attiva.
 * Mantiene ESATTAMENTE la logica originale dal file page.tsx
 */

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { logger } from "@/lib/logger";
import { PricingConfiguration } from "@/types/database.types";

export interface UsePricingConfigReturn {
  pricingConfig: PricingConfiguration | null;
  loading: boolean;
  reload: () => Promise<void>;
}

export function usePricingConfig(): UsePricingConfigReturn {
  const supabase = createClient();
  const [pricingConfig, setPricingConfig] = useState<PricingConfiguration | null>(null);
  const [loading, setLoading] = useState(true);

  /**
   * Carica configurazione pricing attiva
   * MANTIENE ESATTAMENTE LA LOGICA ORIGINALE
   */
  const loadPricingConfig = useCallback(async () => {
    try {
      const { data } = await supabase
        .from("pricing_configuration")
        .select("*")
        .eq("is_active", true)
        .limit(1)
        .single();

      if (data) {
        setPricingConfig(data);
      }
    } catch (error) {
      logger.error("Errore caricamento configurazione pricing:", error);
      // Continua con configurazione di default (null)
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  // Carica al mount
  useEffect(() => {
    loadPricingConfig();
  }, [loadPricingConfig]);

  return {
    pricingConfig,
    loading,
    reload: loadPricingConfig,
  };
}


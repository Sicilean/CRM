/**
 * useQuoteData Hook
 * 
 * Gestisce il caricamento completo dei dati del preventivo:
 * - Generazione numero preventivo per nuovi preventivi
 * - Caricamento preventivo esistente con tutti i dati
 * - Caricamento progetti disponibili per offerte integrative
 * 
 * IMPORTANTE: Mantiene ESATTAMENTE la logica originale dal file page.tsx
 */

import { useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { logger } from "@/lib/logger";
import { ProjectSummary } from "@/types/common.types";
import {
  Quote,
  QuoteService,
  Service,
  calculateRecurringDuration,
  formatDuration,
} from "@/types/database.types";

export interface QuoteFormData {
  quote_number: string;
  client_type: "persona_fisica" | "persona_giuridica";
  persona_fisica_id: string | null;
  persona_giuridica_id: string | null;
  project_id: string | null;
  client_name: string;
  client_email: string;
  client_company: string;
  client_phone: string;
  client_vat_number: string;
  client_fiscal_code: string;
  client_address: string;
  client_sdi_code: string;
  referente_name: string;
  referente_role: string;
  status: string;
  services: QuoteService[];
  discount_percentage: number;
  tax_percentage: number;
  payment_terms: string;
  validity_days: number;
  notes: string;
  internal_notes: string;
  cliente_abituale: boolean;
  prosperita_economica: "alta" | "media" | "bassa";
  project_name: string;
  vision_summary: string;
  objectives: string;
  timeline: Array<{
    id: number;
    phase: string;
    description: string;
    duration: string;
    startWeek?: number;
    endWeek?: number;
  }>;
  team_members: string[];
}

export interface UseQuoteDataReturn {
  loading: boolean;
  formData: QuoteFormData | null;
  availableProjects: ProjectSummary[];
  isProjectProposalOpen: boolean;
  setIsProjectProposalOpen: (open: boolean) => void;
  setFormData: React.Dispatch<React.SetStateAction<QuoteFormData>>;
  refreshProjects: () => Promise<void>;
}

const DEFAULT_PRICING_PARAMS = {
  cliente_abituale: false,
  prosperita_economica: "media" as const,
};

export function useQuoteData(
  quoteId: string | undefined,
  isNew: boolean
): UseQuoteDataReturn {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<QuoteFormData>({
    quote_number: "",
    client_type: "persona_giuridica",
    persona_fisica_id: null,
    persona_giuridica_id: null,
    project_id: null,
    client_name: "",
    client_email: "",
    client_company: "",
    client_phone: "",
    client_vat_number: "",
    client_fiscal_code: "",
    client_address: "",
    client_sdi_code: "",
    referente_name: "",
    referente_role: "",
    status: "draft",
    services: [],
    discount_percentage: 0,
    tax_percentage: 22,
    payment_terms: "",
    validity_days: 30,
    notes: "",
    internal_notes: "",
    cliente_abituale: DEFAULT_PRICING_PARAMS.cliente_abituale,
    prosperita_economica: DEFAULT_PRICING_PARAMS.prosperita_economica,
    project_name: "",
    vision_summary: "",
    objectives: "",
    timeline: [],
    team_members: [],
  });
  const [availableProjects, setAvailableProjects] = useState<ProjectSummary[]>([]);
  const [isProjectProposalOpen, setIsProjectProposalOpen] = useState(false);

  /**
   * Genera numero preventivo progressivo giornaliero: SL20250102-0001
   * MANTIENE ESATTAMENTE LA LOGICA ORIGINALE con timeout e fallback
   */
  const generateQuoteNumber = useCallback(async (): Promise<string> => {
    try {
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, "0");
      const day = String(today.getDate()).padStart(2, "0");
      const dateStr = `${year}${month}${day}`;
      const prefix = `SL${dateStr}-`;

      logger.log("🔢 Inizio generazione numero preventivo con prefix:", prefix);

      let nextNumber = 1;

      // Timeout per la query (max 2 secondi)
      const queryPromise = supabase
        .from("quotes")
        .select<"quote_number", Pick<Quote, "quote_number">>("quote_number")
        .ilike("quote_number", `${prefix}%`)
        .order("quote_number", { ascending: false })
        .limit(1);

      const timeoutPromise = new Promise<null>((resolve) => {
        setTimeout(() => resolve(null), 2000);
      });

      const result = await Promise.race([queryPromise, timeoutPromise]);

      if (result && "data" in result) {
        const { data, error } = result;

        if (error) {
          logger.warn("⚠️ Errore query quote_number (uso fallback):", error.message);
        } else if (data && data.length > 0) {
          const lastNumber = data[0].quote_number;
          logger.log("✅ Ultimo numero trovato:", lastNumber);
          const match = lastNumber.match(/-(\d+)$/);
          if (match) {
            nextNumber = parseInt(match[1]) + 1;
            logger.log("➡️ Prossimo numero calcolato:", nextNumber);
          }
        } else {
          logger.log("ℹ️ Nessun preventivo esistente, parto da 1");
        }
      } else {
        logger.warn("⏱️ Query timeout, uso numero progressivo 1");
      }

      const quoteNumber = `${prefix}${String(nextNumber).padStart(4, "0")}`;
      logger.log("✨ Numero preventivo generato:", quoteNumber);

      setFormData((prev) => ({ ...prev, quote_number: quoteNumber }));
      return quoteNumber;
    } catch (error) {
      logger.error("❌ Errore critico generazione numero:", error);
      // Genera un numero di fallback con timestamp per garantire unicità
      const now = new Date();
      const timestamp = now.getTime().toString().slice(-8);
      const fallbackNumber = `SL${timestamp}`;
      logger.log("🆘 Usando numero fallback:", fallbackNumber);
      setFormData((prev) => ({ ...prev, quote_number: fallbackNumber }));
      return fallbackNumber;
    }
  }, [supabase]);

  /**
   * Carica progetti disponibili per offerte integrative
   * MANTIENE ESATTAMENTE LA LOGICA ORIGINALE
   */
  const loadAvailableProjects = useCallback(
    async (clientId: string) => {
      try {
        const { data } = await supabase
          .from("projects")
          .select(
            "id, project_number, nome, descrizione, stato, persona_giuridica_id, persona_fisica_id, valore_preventivato, project_types, data_creazione"
          )
          .eq("persona_giuridica_id", clientId)
          .order("data_creazione", { ascending: false });

        if (data) {
          setAvailableProjects(data as ProjectSummary[]);
        }
      } catch (error) {
        logger.error("Errore caricamento progetti:", error);
      }
    },
    [supabase]
  );

  /**
   * Carica preventivo esistente con tutti i dati
   * MANTIENE ESATTAMENTE LA LOGICA ORIGINALE
   */
  const loadPreventivo = useCallback(async () => {
    if (!quoteId) return;

    const { data, error } = await supabase
      .from("quotes")
      .select("*")
      .eq("id", quoteId)
      .single();

    if (data) {
      const quoteData = data as any;
      const config = quoteData.configuration || {};
      const services = (quoteData.services as unknown as QuoteService[]) || [];

      // Load service names
      if (services.length > 0) {
        const serviceIds = services.map((s) => s.service_id);
        const { data: servicesData } = await supabase
          .from("services")
          .select<"*", Service>("*")
          .in("notion_id", serviceIds);

        services.forEach((s) => {
          const service = servicesData?.find(
            (sd) => sd.notion_id === s.service_id
          );
          if (service) {
            s.service_name = service.name;
          }
        });
      }

      const loadedData: QuoteFormData = {
        quote_number: quoteData.quote_number || "",
        client_type:
          (quoteData.client_type as "persona_fisica" | "persona_giuridica") ||
          "persona_giuridica",
        persona_fisica_id: quoteData.persona_fisica_id,
        persona_giuridica_id: quoteData.persona_giuridica_id,
        project_id: quoteData.project_id || null,
        client_name: quoteData.client_name || "",
        client_email: quoteData.client_email || "",
        client_company: quoteData.client_company || "",
        client_phone: quoteData.client_phone || "",
        client_vat_number: quoteData.client_vat_number || "",
        client_fiscal_code: quoteData.client_fiscal_code || "",
        client_address: quoteData.client_address || "",
        client_sdi_code: quoteData.client_sdi_code || "",
        referente_name: quoteData.referente_name || "",
        referente_role: quoteData.referente_role || "",
        status: quoteData.status || "draft",
        services: services,
        discount_percentage:
          typeof quoteData.discount_percentage === "number"
            ? quoteData.discount_percentage
            : parseFloat(String(quoteData.discount_percentage || 0)),
        tax_percentage:
          typeof quoteData.tax_percentage === "number"
            ? quoteData.tax_percentage
            : parseFloat(String(quoteData.tax_percentage || 22)),
        payment_terms: config.payment_terms || "",
        validity_days: config.validity_days || 30,
        notes: quoteData.notes || "",
        internal_notes: quoteData.internal_notes || "",
        cliente_abituale:
          config.cliente_abituale ?? DEFAULT_PRICING_PARAMS.cliente_abituale,
        prosperita_economica:
          config.prosperita_economica ??
          DEFAULT_PRICING_PARAMS.prosperita_economica,
        project_name: quoteData.project_name || "",
        vision_summary: quoteData.vision_summary || "",
        objectives: quoteData.objectives || "",
        timeline: (quoteData.timeline as any[]) || [],
        team_members: (quoteData.team_members as string[]) || [],
      };

      setFormData(loadedData);

      // Apri sezione proposta progettuale se ci sono dati
      if (
        quoteData.project_name ||
        quoteData.vision_summary ||
        quoteData.objectives ||
        (quoteData.timeline && (quoteData.timeline as any[]).length > 0) ||
        (quoteData.team_members && (quoteData.team_members as any[]).length > 0)
      ) {
        setIsProjectProposalOpen(true);
      }

      // Carica progetti disponibili se c'è un cliente
      if (quoteData.persona_giuridica_id) {
        await loadAvailableProjects(quoteData.persona_giuridica_id);
      }
    }

    setLoading(false);
  }, [quoteId, supabase, loadAvailableProjects]);

  /**
   * Funzione pubblica per ricaricare i progetti (usata quando cambia cliente)
   */
  const refreshProjects = useCallback(async () => {
    if (formData.persona_giuridica_id) {
      await loadAvailableProjects(formData.persona_giuridica_id);
    } else {
      setAvailableProjects([]);
    }
  }, [formData.persona_giuridica_id, loadAvailableProjects]);

  /**
   * Inizializzazione hook - eseguita al mount
   */
  const initialize = useCallback(async () => {
    setLoading(true);
    
    if (isNew) {
      logger.log("✨ Nuovo preventivo - generazione numero");
      await generateQuoteNumber();
      setLoading(false);
    } else {
      logger.log("📄 Caricamento preventivo esistente:", quoteId);
      await loadPreventivo();
    }
  }, [isNew, quoteId, generateQuoteNumber, loadPreventivo]);

  // Esegui inizializzazione (sarà chiamato dal componente)
  return {
    loading,
    formData,
    availableProjects,
    isProjectProposalOpen,
    setIsProjectProposalOpen,
    setFormData,
    refreshProjects,
  };
}

/**
 * Helper: Calcola duration string per servizi ricorrenti
 * Mantiene esattamente la logica originale
 */
export function calculateDurationString(
  periodMonths: number | undefined,
  quantity: number
): string {
  if (!periodMonths) return "";

  const { years, months } = calculateRecurringDuration(periodMonths, quantity);
  return formatDuration(years, months);
}


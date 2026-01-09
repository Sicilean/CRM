import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Package,
  FileText,
  Users,
  Target,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AgentSalesDashboard } from "@/components/features/agent-sales-dashboard";

// ====== UTILITY FUNCTIONS ======

function getQuarterDateRange(): { start: Date; end: Date } {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  let startMonth: number;
  let endMonth: number;

  if (month < 3) {
    startMonth = 0;
    endMonth = 2;
  } else if (month < 6) {
    startMonth = 3;
    endMonth = 5;
  } else if (month < 9) {
    startMonth = 6;
    endMonth = 8;
  } else {
    startMonth = 9;
    endMonth = 11;
  }

  return {
    start: new Date(year, startMonth, 1),
    end: new Date(year, endMonth + 1, 0, 23, 59, 59, 999),
  };
}

function getMonthDateRange(): { start: Date; end: Date } {
  const now = new Date();
  return {
    start: new Date(now.getFullYear(), now.getMonth(), 1),
    end: new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999),
  };
}

export default async function CommercialeDashboardPage() {
  const supabase = await createClient();

  // Verifica autenticazione
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  // Date ranges
  const monthRange = getMonthDateRange();
  const quarterRange = getQuarterDateRange();

  // Query parallele per le statistiche
  const [
    profileResult,
    serviziResult,
    preventiviResult,
    opportunitiesResult,
    // Vendite mensili (preventivi accettati nel mese corrente, IVA esclusa)
    monthlySalesResult,
    // Vendite trimestrali (preventivi accettati nel trimestre corrente, IVA esclusa)
    quarterlySalesResult,
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("nome, cognome")
      .eq("id", user.id)
      .single(),
    supabase
      .from("services")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true),
    supabase
      .from("quotes")
      .select("*", { count: "exact", head: true })
      .eq("created_by", user.id),
    // Opportunità attive (esclude chiuso_vinto e chiuso_perso)
    supabase
      .from("crm_opportunities")
      .select("*", { count: "exact", head: true })
      .or(`assigned_to.eq.${user.id},created_by.eq.${user.id}`)
      .in("stage", ["scoperta", "proposta", "negoziazione"]),
    // Vendite mensili - somma subtotal_one_time (IVA esclusa) dei preventivi accettati
    supabase
      .from("quotes")
      .select("subtotal_one_time, accepted_at")
      .eq("status", "accepted")
      .eq("created_by", user.id)
      .gte("accepted_at", monthRange.start.toISOString())
      .lte("accepted_at", monthRange.end.toISOString()),
    // Vendite trimestrali
    supabase
      .from("quotes")
      .select("subtotal_one_time, accepted_at")
      .eq("status", "accepted")
      .eq("created_by", user.id)
      .gte("accepted_at", quarterRange.start.toISOString())
      .lte("accepted_at", quarterRange.end.toISOString()),
  ]);

  // Calcola totali
  interface QuoteData {
    subtotal_one_time: number | string | null;
    accepted_at: string | null;
  }

  const monthlySales =
    (monthlySalesResult.data as QuoteData[] | null)?.reduce(
      (sum, q) => sum + (Number(q.subtotal_one_time) || 0),
      0
    ) || 0;

  const quarterlySales =
    (quarterlySalesResult.data as QuoteData[] | null)?.reduce(
      (sum, q) => sum + (Number(q.subtotal_one_time) || 0),
      0
    ) || 0;

  const monthlyDeals = monthlySalesResult.data?.length || 0;
  const quarterlyDeals = quarterlySalesResult.data?.length || 0;

  const serviziCount = serviziResult.count || 0;
  const preventiviCount = preventiviResult.count || 0;
  const opportunitiesCount = opportunitiesResult.count || 0;

  // Nome utente per saluto
  const profile = profileResult.data;
  const displayName = profile?.nome 
    ? profile.nome 
    : user.email?.split('@')[0] || 'Agente';

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">
            Ciao, {displayName}!
          </h1>
          <p className="text-muted-foreground mt-0.5 text-xs sm:text-sm md:text-base">
            I tuoi obiettivi, commissioni e performance
          </p>
        </div>
        <Link href="/preventivi/new" className="w-full sm:w-auto">
          <Button size="sm" className="w-full sm:w-auto text-sm">
            <FileText className="h-4 w-4 mr-1.5" />
            Nuovo Preventivo
          </Button>
        </Link>
      </div>

      {/* Agent Sales Dashboard - Gamification Component */}
      <AgentSalesDashboard
        userId={user.id}
        initialMonthlySales={monthlySales}
        initialQuarterlySales={quarterlySales}
        initialMonthlyDeals={monthlyDeals}
        initialQuarterlyDeals={quarterlyDeals}
      />

      {/* Quick Access Cards */}
      <div className="grid gap-2 md:gap-4 grid-cols-2 lg:grid-cols-4">
        <Link href="/commerciale/crm?tab=pipeline">
          <Card className="hover:shadow-md transition-all cursor-pointer h-full">
            <CardHeader className="flex flex-row items-center justify-between p-3 md:p-4 pb-1 md:pb-2">
              <CardTitle className="text-[10px] sm:text-xs md:text-sm font-medium text-muted-foreground">
                Pipeline
              </CardTitle>
              <div className="p-1.5 md:p-2 rounded-md md:rounded-lg bg-muted">
                <Target className="h-3.5 w-3.5 md:h-5 md:w-5 text-foreground" />
              </div>
            </CardHeader>
            <CardContent className="p-3 md:p-4 pt-0 md:pt-0">
              <div className="text-xl sm:text-2xl md:text-3xl font-bold">
                {opportunitiesCount}
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/commerciale/crm?tab=clienti">
          <Card className="hover:shadow-md transition-all cursor-pointer h-full">
            <CardHeader className="flex flex-row items-center justify-between p-3 md:p-4 pb-1 md:pb-2">
              <CardTitle className="text-[10px] sm:text-xs md:text-sm font-medium text-muted-foreground">
                Clienti
              </CardTitle>
              <div className="p-1.5 md:p-2 rounded-md md:rounded-lg bg-muted">
                <Users className="h-3.5 w-3.5 md:h-5 md:w-5 text-foreground" />
              </div>
            </CardHeader>
            <CardContent className="p-3 md:p-4 pt-0 md:pt-0">
              <div className="text-xl sm:text-2xl md:text-3xl font-bold">
                -
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/preventivi">
          <Card className="hover:shadow-md transition-all cursor-pointer h-full">
            <CardHeader className="flex flex-row items-center justify-between p-3 md:p-4 pb-1 md:pb-2">
              <CardTitle className="text-[10px] sm:text-xs md:text-sm font-medium text-muted-foreground">
                Preventivi
              </CardTitle>
              <div className="p-1.5 md:p-2 rounded-md md:rounded-lg bg-muted">
                <FileText className="h-3.5 w-3.5 md:h-5 md:w-5 text-foreground" />
              </div>
            </CardHeader>
            <CardContent className="p-3 md:p-4 pt-0 md:pt-0">
              <div className="text-xl sm:text-2xl md:text-3xl font-bold">
                {preventiviCount}
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/servizi">
          <Card className="hover:shadow-md transition-all cursor-pointer h-full">
            <CardHeader className="flex flex-row items-center justify-between p-3 md:p-4 pb-1 md:pb-2">
              <CardTitle className="text-[10px] sm:text-xs md:text-sm font-medium text-muted-foreground">
                Catalogo Servizi
              </CardTitle>
              <div className="p-1.5 md:p-2 rounded-md md:rounded-lg bg-muted">
                <Package className="h-3.5 w-3.5 md:h-5 md:w-5 text-foreground" />
              </div>
            </CardHeader>
            <CardContent className="p-3 md:p-4 pt-0 md:pt-0">
              <div className="text-xl sm:text-2xl md:text-3xl font-bold">
                {serviziCount}
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}

import { createClient } from "@/lib/supabase/server";
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
  TrendingUp,
  DollarSign,
  Eye,
  CheckCircle,
  Clock,
  Users,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function CommercialeDashboardPage() {
  const supabase = await createClient();

  const [
    serviziResult,
    preventiviResult,
    preventiviApprovedResult,
    preventiviPendingResult,
  ] = await Promise.all([
    supabase.from("services").select("*", { count: "exact", head: true }),
    supabase.from("quotes").select("*", { count: "exact", head: true }),
    supabase
      .from("quotes")
      .select("*", { count: "exact", head: true })
      .eq("status", "accepted"),
    supabase
      .from("quotes")
      .select("*", { count: "exact", head: true })
      .eq("status", "sent"),
  ]);

  // Calcola totale valore preventivi (richiede una query più complessa)
  const { data: preventiviData } = await supabase
    .from("quotes")
    .select("total_amount")
    .eq("status", "accepted");

  interface QuoteTotal { total_amount: number | null }
  const totalValue =
    (preventiviData as QuoteTotal[] | null)?.reduce(
      (sum, p) => sum + (p.total_amount || 0),
      0
    ) || 0;

  const serviziCount = serviziResult.count || 0;
  const preventiviCount = preventiviResult.count || 0;
  const preventiviApprovedCount = preventiviApprovedResult.count || 0;
  const preventiviPendingCount = preventiviPendingResult.count || 0;

  const stats = [
    {
      name: "Servizi Attivi",
      value: serviziCount,
      icon: Package,
      color: "text-blue-600",
      href: "/servizi",
    },
    {
      name: "Preventivi Totali",
      value: preventiviCount,
      icon: FileText,
      color: "text-purple-600",
      href: "/preventivi",
    },
    {
      name: "Preventivi Approvati",
      value: preventiviApprovedCount,
      icon: CheckCircle,
      color: "text-green-600",
      href: "/preventivi",
    },
    {
      name: "In Attesa",
      value: preventiviPendingCount,
      icon: Clock,
      color: "text-orange-600",
      href: "/preventivi",
    },
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("it-IT", {
      style: "currency",
      currency: "EUR",
    }).format(value);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Commerciale Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Panoramica completa di servizi, preventivi e attività commerciali
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.name} className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.name}
              </CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stat.value}</div>
              {stat.href !== "#" && (
                <Link href={stat.href}>
                  <Button variant="link" className="px-0 mt-2">
                    Visualizza dettagli →
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-600" />npm
            Valore Commerciale
          </CardTitle>
          <CardDescription>
            Riepilogo del valore dei preventivi approvati
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <div className="text-4xl font-bold text-green-600">
              {formatCurrency(totalValue)}
            </div>
            <div className="text-sm text-muted-foreground mt-2">
              Valore totale preventivi approvati
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-cyan-600" />
            CRM - Customer Relationship Management
          </CardTitle>
          <CardDescription>
            Gestione completa di leads, opportunità e clienti
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              <p>Sistema CRM integrato per gestire:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Leads e contatti commerciali</li>
                <li>Opportunità e pipeline di vendita</li>
                <li>Clienti e Customer Lifetime Value</li>
                <li>Tracking attività e follow-up</li>
              </ul>
            </div>
            <Link href="/commerciale/crm">
              <Button variant="default" className="w-full">
                <Eye className="mr-2 h-4 w-4" />
                Apri CRM
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-blue-600" />
              Servizi
            </CardTitle>
            <CardDescription>
              Catalogo servizi e prodotti offerti
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                <p>Gestione completa del catalogo servizi con:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Descrizione dettagliata dei servizi</li>
                  <li>Configurazione prezzi e tariffe</li>
                  <li>Categorizzazione e organizzazione</li>
                  <li>Gestione disponibilità e stato</li>
                </ul>
              </div>
              <div className="flex gap-2">
                <Link href="/servizi" className="flex-1">
                  <Button variant="default" className="w-full">
                    <Eye className="mr-2 h-4 w-4" />
                    Visualizza Catalogo
                  </Button>
                </Link>
                <Link href="/servizi/new" className="flex-1">
                  <Button variant="outline" className="w-full">
                    Aggiungi Servizio
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-purple-600" />
              Preventivi
            </CardTitle>
            <CardDescription>
              Gestione preventivi e proposte commerciali
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                <p>Sistema completo per la gestione preventivi:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Creazione rapida con calcolo automatico</li>
                  <li>Stati avanzamento (bozza, inviato, approvato)</li>
                  <li>Associazione a clienti e servizi</li>
                  <li>Storico e versioning</li>
                </ul>
              </div>
              <div className="flex gap-2">
                <Link href="/preventivi" className="flex-1">
                  <Button variant="default" className="w-full">
                    <Eye className="mr-2 h-4 w-4" />
                    Visualizza Preventivi
                  </Button>
                </Link>
                <Link href="/preventivi/new" className="flex-1">
                  <Button variant="outline" className="w-full">
                    Crea Preventivo
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-orange-600" />
            Performance e Metriche
          </CardTitle>
          <CardDescription>
            Indicatori chiave di performance commerciale
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-purple-50 dark:bg-purple-950 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {preventiviCount}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                Preventivi Emessi
              </div>
            </div>
            <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {preventiviApprovedCount}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                Preventivi Chiusi
              </div>
            </div>
            <div className="text-center p-4 bg-orange-50 dark:bg-orange-950 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {preventiviCount > 0
                  ? Math.round(
                      (preventiviApprovedCount / preventiviCount) * 100
                    )
                  : 0}
                %
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                Tasso di Conversione
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

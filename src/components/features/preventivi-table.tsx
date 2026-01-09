"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Quote,
  QUOTE_STATUS_LABELS,
  QUOTE_STATUS_COLORS,
} from "@/types/quotes.types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  X,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  Calendar,
} from "lucide-react";
import { useRouter } from "next/navigation";

type SortField =
  | "quote_number"
  | "client_name"
  | "status"
  | "grand_total"
  | "created_at";
type SortOrder = "asc" | "desc";

interface FilterState {
  status?: string;
  has_recurring?: string;
}

export default function PreventiviTable() {
  const router = useRouter();
  const [preventivi, setPreventivi] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<FilterState>({});
  const [totalCount, setTotalCount] = useState(0);
  const [sortField, setSortField] = useState<SortField>("created_at");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const supabase = createClient();

  const loadPreventivi = useCallback(async () => {
    setLoading(true);

    try {
      let query = (supabase as any)
        .from("quotes")
        .select("*", { count: "exact" })
        .order(sortField, { ascending: sortOrder === "asc" });

      // Applicare filtri
      if (filters.status && filters.status !== "__all__") {
        query = query.eq("status", filters.status);
      }
      if (filters.has_recurring && filters.has_recurring !== "__all__") {
        if (filters.has_recurring === "true") {
          query = query.gt("subtotal_recurring_monthly", 0);
        } else {
          query = query.eq("subtotal_recurring_monthly", 0);
        }
      }

      // Ricerca full-text
      if (searchQuery) {
        query = query.or(
          `quote_number.ilike.%${searchQuery}%,client_name.ilike.%${searchQuery}%,client_email.ilike.%${searchQuery}%,client_company.ilike.%${searchQuery}%`
        );
      }

      const { data, error, count } = await query;

      if (error) throw error;

      setPreventivi((data || []) as Quote[]);
      setTotalCount(count || 0);
    } catch (error) {
      console.error("Errore caricamento preventivi:", error);
    } finally {
      setLoading(false);
    }
  }, [filters, searchQuery, sortField, sortOrder, supabase]);

  useEffect(() => {
    loadPreventivi();
  }, [loadPreventivi]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="ml-2 h-3 w-3 opacity-50" />;
    }
    return sortOrder === "asc" ? (
      <ArrowUp className="ml-2 h-3 w-3" />
    ) : (
      <ArrowDown className="ml-2 h-3 w-3" />
    );
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Sei sicuro di voler eliminare questo preventivo?")) return;

    try {
      // Prima elimina gli items correlati
      await (supabase as any)
        .from("quote_item_addons")
        .delete()
        .in(
          "quote_item_id",
          (
            await (supabase as any)
              .from("quote_items")
              .select("id")
              .eq("quote_id", id)
          ).data?.map((i: any) => i.id) || []
        );
      await (supabase as any).from("quote_items").delete().eq("quote_id", id);
      await (supabase as any)
        .from("quote_modifiers_applied")
        .delete()
        .eq("quote_id", id);
      await (supabase as any)
        .from("quote_bundles_applied")
        .delete()
        .eq("quote_id", id);

      // Poi elimina il preventivo
      const { error } = await (supabase as any)
        .from("quotes")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setPreventivi((prev) => prev.filter((p) => p.id !== id));
      setTotalCount((prev) => prev - 1);
    } catch (error) {
      console.error("Errore eliminazione:", error);
      alert("Errore durante l'eliminazione");
    }
  };

  const clearFilters = () => {
    setFilters({});
    setSearchQuery("");
  };

  const activeFiltersCount =
    Object.values(filters).filter((v) => v && v !== "__all__").length +
    (searchQuery ? 1 : 0);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("it-IT", {
      style: "currency",
      currency: "EUR",
    }).format(value);
  };

  const isExpired = (validUntil: string | null) => {
    if (!validUntil) return false;
    return new Date(validUntil) < new Date();
  };

  return (
    <div className="space-y-4">
      {/* Header con ricerca e filtri */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Cerca preventivi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="relative">
              <Filter className="mr-2 h-4 w-4" />
              Filtri
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="ml-2 px-1.5 py-0 text-xs">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="end">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-sm">Filtri</h4>
                {activeFiltersCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    <X className="h-4 w-4 mr-1" />
                    Pulisci
                  </Button>
                )}
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium mb-1 block">
                    Stato
                  </label>
                  <Select
                    value={filters.status || "__all__"}
                    onValueChange={(value) =>
                      setFilters((prev) => ({
                        ...prev,
                        status: value === "__all__" ? undefined : value,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Tutti" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__all__">Tutti</SelectItem>
                      <SelectItem value="draft">Bozza</SelectItem>
                      <SelectItem value="review">In Revisione</SelectItem>
                      <SelectItem value="sent">Inviato</SelectItem>
                      <SelectItem value="negotiating">
                        In Negoziazione
                      </SelectItem>
                      <SelectItem value="accepted">Accettato</SelectItem>
                      <SelectItem value="rejected">Rifiutato</SelectItem>
                      <SelectItem value="expired">Scaduto</SelectItem>
                      <SelectItem value="converted">Convertito</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-xs font-medium mb-1 block">
                    Include Ricorrenti
                  </label>
                  <Select
                    value={filters.has_recurring || "__all__"}
                    onValueChange={(value) =>
                      setFilters((prev) => ({
                        ...prev,
                        has_recurring: value === "__all__" ? undefined : value,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Tutti" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__all__">Tutti</SelectItem>
                      <SelectItem value="true">Con Ricorrenti</SelectItem>
                      <SelectItem value="false">Solo One-Time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Conteggio risultati */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          {totalCount} preventiv{totalCount !== 1 ? "i" : "o"} totali
        </span>
        {activeFiltersCount > 0 && (
          <span className="text-xs">
            {activeFiltersCount} filtro/i attivo/i
          </span>
        )}
      </div>

      {/* Tabella */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <Button
                  variant="ghost"
                  className="h-auto p-0 hover:bg-transparent font-medium"
                  onClick={() => toggleSort("quote_number")}
                >
                  Numero
                  {getSortIcon("quote_number")}
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  className="h-auto p-0 hover:bg-transparent font-medium"
                  onClick={() => toggleSort("client_name")}
                >
                  Cliente
                  {getSortIcon("client_name")}
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  className="h-auto p-0 hover:bg-transparent font-medium"
                  onClick={() => toggleSort("status")}
                >
                  Stato
                  {getSortIcon("status")}
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  className="h-auto p-0 hover:bg-transparent font-medium"
                  onClick={() => toggleSort("grand_total")}
                >
                  Totale
                  {getSortIcon("grand_total")}
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  className="h-auto p-0 hover:bg-transparent font-medium"
                  onClick={() => toggleSort("created_at")}
                >
                  Data
                  {getSortIcon("created_at")}
                </Button>
              </TableHead>
              <TableHead className="text-right w-[120px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && preventivi.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <div className="flex items-center justify-center gap-2 text-muted-foreground">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                    <span>Caricamento...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : preventivi.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-8 text-muted-foreground"
                >
                  Nessun preventivo trovato
                </TableCell>
              </TableRow>
            ) : (
              preventivi.map((preventivo) => (
                <TableRow key={preventivo.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <code className="text-xs bg-muted px-2 py-1 rounded font-medium">
                        {preventivo.quote_number}
                      </code>
                      {preventivo.version > 1 && (
                        <Badge variant="outline" className="text-xs">
                          v{preventivo.version}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{preventivo.client_name}</p>
                      {preventivo.client_company && (
                        <p className="text-xs text-muted-foreground">
                          {preventivo.client_company}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {preventivo.client_email}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <Badge className={QUOTE_STATUS_COLORS[preventivo.status]}>
                        {QUOTE_STATUS_LABELS[preventivo.status]}
                      </Badge>
                      {preventivo.valid_until &&
                        isExpired(preventivo.valid_until) &&
                        preventivo.status === "sent" && (
                          <Badge variant="destructive" className="text-xs">
                            Scaduto
                          </Badge>
                        )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <p className="font-mono font-bold">
                        {formatCurrency(preventivo.total_one_time)}
                      </p>
                      {preventivo.subtotal_recurring_monthly > 0 && (
                        <div className="flex items-center gap-1 text-xs text-blue-600">
                          <RefreshCw className="h-3 w-3" />
                          <span>
                            +
                            {formatCurrency(
                              preventivo.subtotal_recurring_monthly
                            )}
                            /mese
                          </span>
                        </div>
                      )}
                      {preventivo.subtotal_recurring_yearly > 0 && (
                        <div className="flex items-center gap-1 text-xs text-purple-600">
                          <Calendar className="h-3 w-3" />
                          <span>
                            +
                            {formatCurrency(
                              preventivo.subtotal_recurring_yearly
                            )}
                            /anno
                          </span>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <p className="text-sm">
                        {new Date(preventivo.created_at).toLocaleDateString(
                          "it-IT"
                        )}
                      </p>
                      {preventivo.valid_until && (
                        <p className="text-xs text-muted-foreground">
                          Valido fino:{" "}
                          {new Date(preventivo.valid_until).toLocaleDateString(
                            "it-IT"
                          )}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          router.push(`/preventivi/${preventivo.id}`)
                        }
                        title="Visualizza"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          router.push(`/preventivi/${preventivo.id}/edit`)
                        }
                        title="Modifica"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(preventivo.id)}
                        title="Elimina"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

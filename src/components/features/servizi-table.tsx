"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Service, MacroArea, PRICING_TYPE_LABELS } from "@/types/quotes.types";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  ChevronDown,
  Star,
  RefreshCw,
} from "lucide-react";
import { useRouter } from "next/navigation";

type SortField =
  | "name"
  | "pricing_type"
  | "base_price"
  | "is_active"
  | "macro_area_id";
type SortOrder = "asc" | "desc";

interface FilterState {
  macro_area_id?: string;
  pricing_type?: string;
  is_active?: string;
  is_recurring?: string;
  is_featured?: string;
}

export default function ServiziTable() {
  const router = useRouter();
  const [servizi, setServizi] = useState<
    (Service & { macro_area: MacroArea | null })[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<FilterState>({});
  const [totalCount, setTotalCount] = useState(0);
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const supabase = createClient();

  // State per macro areas
  const [macroAreas, setMacroAreas] = useState<MacroArea[]>([]);

  // Carica macro areas per i filtri
  useEffect(() => {
    const loadMacroAreas = async () => {
      const { data } = await supabase
        .from("macro_areas")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });

      if (data) {
        setMacroAreas(data);
      }
    };
    loadMacroAreas();
  }, [supabase]);

  const loadServizi = useCallback(async () => {
    setLoading(true);

    try {
      let query = supabase
        .from("services")
        .select("*, macro_area:macro_areas(*)", { count: "exact" })
        .order(sortField, { ascending: sortOrder === "asc" });

      // Applicare filtri
      if (filters.macro_area_id && filters.macro_area_id !== "__all__") {
        query = query.eq("macro_area_id", filters.macro_area_id);
      }
      if (filters.pricing_type && filters.pricing_type !== "__all__") {
        query = query.eq("pricing_type", filters.pricing_type);
      }
      if (filters.is_active && filters.is_active !== "__all__") {
        query = query.eq("is_active", filters.is_active === "true");
      }
      if (filters.is_recurring && filters.is_recurring !== "__all__") {
        query = query.eq("is_recurring", filters.is_recurring === "true");
      }
      if (filters.is_featured && filters.is_featured !== "__all__") {
        query = query.eq("is_featured", filters.is_featured === "true");
      }

      // Ricerca full-text
      if (searchQuery) {
        query = query.or(
          `name.ilike.%${searchQuery}%,slug.ilike.%${searchQuery}%,short_description.ilike.%${searchQuery}%`
        );
      }

      const { data, error, count } = await query;

      if (error) throw error;

      setServizi(data || []);
      setTotalCount(count || 0);
    } catch (error) {
      console.error("Errore caricamento servizi:", error);
    } finally {
      setLoading(false);
    }
  }, [filters, searchQuery, sortField, sortOrder, supabase]);

  useEffect(() => {
    loadServizi();
  }, [loadServizi]);

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
    if (!confirm("Sei sicuro di voler eliminare questo servizio?")) return;

    try {
      const { error } = await supabase.from("services").delete().eq("id", id);

      if (error) throw error;

      setServizi((prev) => prev.filter((s) => s.id !== id));
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

  const formatPrice = (service: Service) => {
    switch (service.pricing_type) {
      case "fixed":
        return `€ ${service.base_price.toFixed(2)}`;
      case "range":
        return `€ ${service.base_price.toFixed(0)} - € ${
          service.max_price?.toFixed(0) || "?"
        }`;
      case "recurring":
        return `€ ${service.base_price.toFixed(2)}/${
          service.recurring_interval === "month"
            ? "mese"
            : service.recurring_interval === "year"
            ? "anno"
            : "trim"
        }`;
      case "time_based":
        return `€ ${service.base_price.toFixed(2)}/${
          service.time_unit === "hour"
            ? "ora"
            : service.time_unit === "day"
            ? "giorno"
            : "sett"
        }`;
      case "tiered":
        return `Da € ${service.base_price.toFixed(2)}`;
      case "composite":
        return `Da € ${service.base_price.toFixed(2)}`;
      default:
        return `€ ${service.base_price.toFixed(2)}`;
    }
  };

  return (
    <div className="space-y-4">
      {/* Header con ricerca e filtri */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Cerca servizi..."
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
                    Macro-Area
                  </label>
                  <Select
                    value={filters.macro_area_id || "__all__"}
                    onValueChange={(value) =>
                      setFilters((prev) => ({
                        ...prev,
                        macro_area_id: value === "__all__" ? undefined : value,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Tutte" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__all__">
                        Tutte le macro-aree
                      </SelectItem>
                      {macroAreas.map((area) => (
                        <SelectItem key={area.id} value={area.id}>
                          <div className="flex items-center gap-2">
                            {area.icon && <span>{area.icon}</span>}
                            {area.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-xs font-medium mb-1 block">
                    Tipo Pricing
                  </label>
                  <Select
                    value={filters.pricing_type || "__all__"}
                    onValueChange={(value) =>
                      setFilters((prev) => ({
                        ...prev,
                        pricing_type: value === "__all__" ? undefined : value,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Tutti" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__all__">Tutti i tipi</SelectItem>
                      <SelectItem value="fixed">Prezzo Fisso</SelectItem>
                      <SelectItem value="range">Range</SelectItem>
                      <SelectItem value="tiered">A Scaglioni</SelectItem>
                      <SelectItem value="recurring">Ricorrente</SelectItem>
                      <SelectItem value="time_based">A Tempo</SelectItem>
                      <SelectItem value="composite">Composito</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-xs font-medium mb-1 block">
                    Stato
                  </label>
                  <Select
                    value={filters.is_active || "__all__"}
                    onValueChange={(value) =>
                      setFilters((prev) => ({
                        ...prev,
                        is_active: value === "__all__" ? undefined : value,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Tutti" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__all__">Tutti</SelectItem>
                      <SelectItem value="true">Attivi</SelectItem>
                      <SelectItem value="false">Disattivati</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-xs font-medium mb-1 block">
                    Ricorrente
                  </label>
                  <Select
                    value={filters.is_recurring || "__all__"}
                    onValueChange={(value) =>
                      setFilters((prev) => ({
                        ...prev,
                        is_recurring: value === "__all__" ? undefined : value,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Tutti" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__all__">Tutti</SelectItem>
                      <SelectItem value="true">Sì</SelectItem>
                      <SelectItem value="false">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-xs font-medium mb-1 block">
                    In Evidenza
                  </label>
                  <Select
                    value={filters.is_featured || "__all__"}
                    onValueChange={(value) =>
                      setFilters((prev) => ({
                        ...prev,
                        is_featured: value === "__all__" ? undefined : value,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Tutti" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__all__">Tutti</SelectItem>
                      <SelectItem value="true">In evidenza</SelectItem>
                      <SelectItem value="false">Non in evidenza</SelectItem>
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
          {totalCount} serviz{totalCount !== 1 ? "i" : "io"} totali
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
                  onClick={() => toggleSort("name")}
                >
                  Nome
                  {getSortIcon("name")}
                </Button>
              </TableHead>
              <TableHead>
                <div className="flex items-center gap-1">
                  <span className="font-medium">Macro-Area</span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-6 w-6">
                        <ChevronDown className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="start"
                      className="max-h-80 overflow-y-auto"
                    >
                      <DropdownMenuItem
                        onClick={() =>
                          setFilters((prev) => ({
                            ...prev,
                            macro_area_id: undefined,
                          }))
                        }
                      >
                        <span className="text-muted-foreground">Tutte</span>
                      </DropdownMenuItem>
                      {macroAreas.map((area) => (
                        <DropdownMenuItem
                          key={area.id}
                          onClick={() =>
                            setFilters((prev) => ({
                              ...prev,
                              macro_area_id: area.id,
                            }))
                          }
                        >
                          <span
                            className="w-3 h-3 rounded-full mr-2"
                            style={{ backgroundColor: area.color || "#ccc" }}
                          />
                          {area.name}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  className="h-auto p-0 hover:bg-transparent font-medium"
                  onClick={() => toggleSort("pricing_type")}
                >
                  Tipo Prezzo
                  {getSortIcon("pricing_type")}
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  className="h-auto p-0 hover:bg-transparent font-medium"
                  onClick={() => toggleSort("base_price")}
                >
                  Prezzo
                  {getSortIcon("base_price")}
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  className="h-auto p-0 hover:bg-transparent font-medium"
                  onClick={() => toggleSort("is_active")}
                >
                  Stato
                  {getSortIcon("is_active")}
                </Button>
              </TableHead>
              <TableHead className="text-right w-[120px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && servizi.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <div className="flex items-center justify-center gap-2 text-muted-foreground">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                    <span>Caricamento...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : servizi.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-8 text-muted-foreground"
                >
                  Nessun servizio trovato
                </TableCell>
              </TableRow>
            ) : (
              servizi.map((servizio) => (
                <TableRow
                  key={servizio.id}
                  className={!servizio.is_active ? "opacity-50" : ""}
                >
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {servizio.is_featured && (
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                      )}
                      <div>
                        <span className="font-medium">{servizio.name}</span>
                        {servizio.short_description && (
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {servizio.short_description}
                          </p>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {servizio.macro_area ? (
                      <Badge
                        variant="outline"
                        className="text-xs"
                        style={{
                          borderColor: servizio.macro_area.color || "#ccc",
                          color: servizio.macro_area.color || "#666",
                        }}
                      >
                        {servizio.macro_area.name}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground text-xs">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Badge
                        variant={
                          servizio.pricing_type === "recurring"
                            ? "secondary"
                            : servizio.pricing_type === "range"
                            ? "outline"
                            : "default"
                        }
                      >
                        {PRICING_TYPE_LABELS[servizio.pricing_type]}
                      </Badge>
                      {servizio.is_recurring && (
                        <RefreshCw className="h-3 w-3 text-blue-500" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-mono text-sm">
                      {formatPrice(servizio)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={servizio.is_active ? "default" : "outline"}>
                      {servizio.is_active ? "Attivo" : "Disattivato"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.push(`/servizi/${servizio.id}`)}
                        title="Visualizza"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          router.push(`/servizi/${servizio.id}/edit`)
                        }
                        title="Modifica"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(servizio.id)}
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

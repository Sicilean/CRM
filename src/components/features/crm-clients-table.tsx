"use client";

import { useState, useEffect } from "react";
import { ClientCLV } from "@/types/database.types";
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
import { Search, Eye, TrendingUp } from "lucide-react";
import { formatDateItalian, formatCurrency } from "@/lib/crm-utils";

export default function CrmClientsTable() {
  const [clients, setClients] = useState<ClientCLV[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredClients, setFilteredClients] = useState<ClientCLV[]>([]);

  useEffect(() => {
    loadClients();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = clients.filter((c) =>
        (c.customerName || "").toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredClients(filtered);
    } else {
      setFilteredClients(clients);
    }
  }, [searchQuery, clients]);

  const loadClients = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/crm/clients");
      const result = await response.json();

      if (result.data) {
        setClients(result.data);
        setFilteredClients(result.data);
      }
    } catch (error) {
      console.error("Error loading clients:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3 md:space-y-4">
      {/* Toolbar */}
      <div className="flex gap-2 md:gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Cerca clienti..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 md:pl-10 h-9 md:h-10 text-sm"
          />
        </div>
      </div>

      {/* Conteggio */}
      <div className="text-xs md:text-sm text-muted-foreground px-1 md:px-0">
        {filteredClients.length} clienti
      </div>

      {/* Card View Mobile */}
      <div className="md:hidden space-y-2">
        {loading && filteredClients.length === 0 ? (
          <div className="text-center py-8">
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
              <span className="text-sm">Caricamento...</span>
            </div>
          </div>
        ) : filteredClients.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            Nessun cliente trovato
          </div>
        ) : (
          filteredClients.map((client) => (
            <div key={client.customerId} className="bg-card border rounded-lg p-3 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm truncate">{client.customerName}</p>
                  <p className="text-xs text-muted-foreground">
                    {client.customerType === "persona_fisica" ? "Persona Fisica" : "Azienda"}
                  </p>
                </div>
                <div className="flex items-center gap-1 text-primary shrink-0">
                  <TrendingUp className="h-3 w-3" />
                  <span className="font-bold text-xs">
                    {formatCurrency(client.customerLifetimeValue || 0)}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{client.acceptedQuotes}/{client.totalQuotes} preventivi</span>
                <Badge variant={(client.activeProjects || 0) > 0 ? "default" : "outline"} className="text-[10px] px-1.5 py-0">
                  {client.activeProjects || 0} attivi
                </Badge>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Tabella Desktop */}
      <div className="hidden md:block border rounded-lg overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cliente</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Customer Lifetime Value</TableHead>
              <TableHead>Preventivi</TableHead>
              <TableHead>Tasso Conversione</TableHead>
              <TableHead>Primo Acquisto</TableHead>
              <TableHead>Ultimo Acquisto</TableHead>
              <TableHead>Progetti Attivi</TableHead>
              <TableHead className="text-right">Azioni</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && filteredClients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8">
                  <div className="flex items-center justify-center gap-2 text-muted-foreground">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                    <span>Caricamento...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredClients.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={9}
                  className="text-center py-8 text-muted-foreground"
                >
                  Nessun cliente trovato
                </TableCell>
              </TableRow>
            ) : (
              filteredClients.map((client) => (
                <TableRow key={client.customerId}>
                  <TableCell className="font-medium">
                    {client.customerName}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {client.customerType === "persona_fisica"
                        ? "Persona Fisica"
                        : "Azienda"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-primary" />
                      <span className="font-bold text-primary">
                        {formatCurrency(
                          client.customerLifetimeValue || 0
                        )}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {client.acceptedQuotes}
                      </span>
                      <span className="text-muted-foreground text-xs">
                        / {client.totalQuotes}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-foreground transition-all"
                          style={{ width: `${client.conversionRate}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {client.conversionRate}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs">
                    {client.firstPurchaseDate
                      ? formatDateItalian(client.firstPurchaseDate)
                      : "-"}
                  </TableCell>
                  <TableCell className="text-xs">
                    {client.lastPurchaseDate
                      ? formatDateItalian(client.lastPurchaseDate)
                      : "-"}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        (client.activeProjects || 0) > 0 ? "default" : "outline"
                      }
                    >
                      {client.activeProjects || 0}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" title="Visualizza">
                      <Eye className="h-4 w-4" />
                    </Button>
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

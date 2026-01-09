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
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Cerca clienti..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Conteggio */}
      <div className="text-sm text-muted-foreground">
        {filteredClients.length} clienti totali
      </div>

      {/* Tabella */}
      <div className="border rounded-lg">
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
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      <span className="font-bold text-green-600">
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
                      <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 transition-all"
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

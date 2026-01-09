"use client";

import ServiziTable from "@/components/features/servizi-table";
import { Package } from "lucide-react";

export default function ServiziPage() {
  return (
    <div className="space-y-3 md:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold flex items-center gap-2">
            <Package className="h-5 w-5 md:h-7 md:w-7 text-foreground" />
            Catalogo Servizi
          </h1>
          <p className="text-muted-foreground mt-0.5 text-xs sm:text-sm md:text-base">
            Consulta il catalogo dei servizi Sicilean con prezzi e dettagli
          </p>
        </div>
      </div>

      {/* readOnly=false: la logica interna a ServiziTable gestisce i permessi (admin può modificare, agente no) */}
      <ServiziTable readOnly={false} />
    </div>
  );
}

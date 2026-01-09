"use client";

import ServiziTable from "@/components/features/servizi-table";
import { Button } from "@/components/ui/button";
import { Plus, Palette } from "lucide-react";
import Link from "next/link";

export default function ServiziPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Catalogo Servizi</h1>
          <p className="text-muted-foreground mt-1">
            Gestisci il catalogo dei servizi offerti, con prezzi, varianti e
            dipendenze
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/servizi/macro-aree">
            <Button variant="outline">
              <Palette className="mr-2 h-4 w-4" />
              Macro-Aree
            </Button>
          </Link>
          <Link href="/servizi/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nuovo Servizio
            </Button>
          </Link>
        </div>
      </div>

      <ServiziTable />
    </div>
  );
}

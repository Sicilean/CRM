import PreventiviTable from '@/components/features/preventivi-table'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'

export default function PreventiviPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Preventivi</h1>
          <p className="text-muted-foreground mt-1">
            Crea e gestisci preventivi personalizzati per i clienti
          </p>
        </div>
        <Link href="/preventivi/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nuovo Preventivo
          </Button>
        </Link>
      </div>

      <PreventiviTable />
    </div>
  )
}


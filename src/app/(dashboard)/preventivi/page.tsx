import PreventiviTable from '@/components/features/preventivi-table'
import { Button } from '@/components/ui/button'
import { Plus, FileText } from 'lucide-react'
import Link from 'next/link'

export default function PreventiviPage() {
  return (
    <div className="space-y-3 md:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold flex items-center gap-2">
            <FileText className="h-5 w-5 md:h-7 md:w-7 text-foreground" />
            I Miei Preventivi
          </h1>
          <p className="text-muted-foreground mt-0.5 text-xs sm:text-sm md:text-base">
            Gestisci i preventivi creati da te
          </p>
        </div>
        <Link href="/preventivi/new" className="w-full sm:w-auto">
          <Button size="sm" className="w-full sm:w-auto text-sm">
            <Plus className="mr-1.5 h-4 w-4" />
            Nuovo Preventivo
          </Button>
        </Link>
      </div>

      <PreventiviTable />
    </div>
  )
}


import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, TrendingUp, Archive, LayoutList } from 'lucide-react'
import CrmPipelineTable from '@/components/features/crm-pipeline-table'
import CrmClientsWonTable from '@/components/features/crm-clients-won-table'
import CrmArchivedTable from '@/components/features/crm-archived-table'

interface CrmPageProps {
  searchParams: Promise<{ tab?: string }>
}

export default async function CrmPage({ searchParams }: CrmPageProps) {
  const params = await searchParams
  const validTabs = ['pipeline', 'clienti', 'archivio']
  const activeTab = validTabs.includes(params.tab || '') ? params.tab! : 'pipeline'

  return (
    <div className="space-y-3 md:space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold flex items-center gap-2">
          <TrendingUp className="h-5 w-5 md:h-7 md:w-7 text-foreground" />
          CRM
        </h1>
        <p className="text-muted-foreground mt-0.5 text-xs sm:text-sm md:text-base">
          Gestisci prospect, opportunità e clienti
        </p>
      </div>

      <Tabs defaultValue={activeTab} className="space-y-3 md:space-y-6">
        <TabsList className="grid w-full grid-cols-3 h-auto p-0.5 md:p-1">
          <TabsTrigger value="pipeline" className="flex items-center gap-1 sm:gap-2 py-1.5 md:py-2 px-1.5 sm:px-4 text-[10px] sm:text-xs md:text-sm">
            <LayoutList className="h-3.5 w-3.5 md:h-4 md:w-4" />
            <span>Pipeline</span>
          </TabsTrigger>
          <TabsTrigger value="clienti" className="flex items-center gap-1 sm:gap-2 py-1.5 md:py-2 px-1.5 sm:px-4 text-[10px] sm:text-xs md:text-sm">
            <Users className="h-3.5 w-3.5 md:h-4 md:w-4" />
            <span>Clienti</span>
          </TabsTrigger>
          <TabsTrigger value="archivio" className="flex items-center gap-1 sm:gap-2 py-1.5 md:py-2 px-1.5 sm:px-4 text-[10px] sm:text-xs md:text-sm">
            <Archive className="h-3.5 w-3.5 md:h-4 md:w-4" />
            <span>Archivio</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pipeline" className="space-y-3 md:space-y-4">
          <Card>
            <CardHeader className="p-3 md:p-6 pb-2 md:pb-3">
              <CardTitle className="text-sm md:text-lg">Pipeline Commerciale</CardTitle>
              <CardDescription className="text-xs md:text-sm">
                Opportunità attive in lavorazione
              </CardDescription>
            </CardHeader>
            <CardContent className="p-2 md:px-6 md:pb-6 pt-0">
              <CrmPipelineTable />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="clienti" className="space-y-3 md:space-y-4">
          <Card>
            <CardHeader className="p-3 md:p-6 pb-2 md:pb-3">
              <CardTitle className="text-sm md:text-lg">I Miei Clienti</CardTitle>
              <CardDescription className="text-xs md:text-sm">
                Clienti acquisiti (opportunità chiuse vinte)
              </CardDescription>
            </CardHeader>
            <CardContent className="p-2 md:px-6 md:pb-6 pt-0">
              <CrmClientsWonTable />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="archivio" className="space-y-3 md:space-y-4">
          <Card>
            <CardHeader className="p-3 md:p-6 pb-2 md:pb-3">
              <CardTitle className="text-sm md:text-lg">Archivio</CardTitle>
              <CardDescription className="text-xs md:text-sm">
                Opportunità chiuse perse - riattivabili in futuro
              </CardDescription>
            </CardHeader>
            <CardContent className="p-2 md:px-6 md:pb-6 pt-0">
              <CrmArchivedTable />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Target, TrendingUp } from 'lucide-react'
import CrmLeadsTable from '@/components/features/crm-leads-table'
import CrmOpportunitiesTable from '@/components/features/crm-opportunities-table'
import CrmClientsTable from '@/components/features/crm-clients-table'

export default function CrmPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">CRM</h1>
        <p className="text-muted-foreground mt-1">
          Gestisci leads, opportunità e clienti
        </p>
      </div>

      <Tabs defaultValue="leads" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:w-[600px]">
          <TabsTrigger value="leads" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>Leads</span>
          </TabsTrigger>
          <TabsTrigger value="opportunita" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            <span>Opportunità</span>
          </TabsTrigger>
          <TabsTrigger value="clienti" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            <span>Clienti</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="leads" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Leads</CardTitle>
              <CardDescription>
                Gestisci i contatti commerciali e traccia le interazioni
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CrmLeadsTable />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="opportunita" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Opportunità</CardTitle>
              <CardDescription>
                Traccia le opportunità commerciali e gestisci i preventivi
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CrmOpportunitiesTable />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="clienti" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Clienti</CardTitle>
              <CardDescription>
                Visualizza tutti i clienti e il Customer Lifetime Value
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CrmClientsTable />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}


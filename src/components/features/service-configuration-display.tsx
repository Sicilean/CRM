'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Badge } from '@/components/ui/badge'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { ChevronDown, Package, Settings, Star } from 'lucide-react'
import { QuoteServiceConfiguration } from '@/types/service-configuration.types'

interface ServiceConfigurationDisplayProps {
  configuration?: QuoteServiceConfiguration
  serviceId: string
  compact?: boolean
}

export default function ServiceConfigurationDisplay({
  configuration,
  serviceId,
  compact = false
}: ServiceConfigurationDisplayProps) {
  const supabase = createClient()
  const [modules, setModules] = useState<any[]>([])
  const [preset, setPreset] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(!compact)

  const loadConfigurationDetails = useCallback(async () => {
    if (!configuration) {
      setLoading(false)
      return
    }

    try {
      // Carica preset se presente
      if (configuration.preset_id) {
        const { data: presetData } = await supabase
          .from('service_presets')
          .select('*')
          .eq('id', configuration.preset_id)
          .single()
        
        if (presetData) setPreset(presetData)
      }

      // Carica moduli selezionati
      if (configuration.selected_modules && configuration.selected_modules.length > 0) {
        const { data: modulesData } = await supabase
          .from('service_modules')
          .select('*')
          .in('id', configuration.selected_modules)
        
        if (modulesData) setModules(modulesData)
      }
    } catch (error) {
      console.error('Errore caricamento dettagli configurazione:', error)
    } finally {
      setLoading(false)
    }
  }, [configuration, supabase])

  useEffect(() => {
    loadConfigurationDetails()
  }, [loadConfigurationDetails])

  // Se non c'è configurazione, non mostrare nulla
  if (!configuration || loading) {
    return null
  }

  const hasModules = modules.length > 0
  const hasParameters = configuration.parameters && Object.keys(configuration.parameters).length > 0
  const hasPreset = !!preset

  // Se non c'è nulla da mostrare
  if (!hasModules && !hasParameters && !hasPreset) {
    return null
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="mt-3">
      <CollapsibleTrigger className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        <span className="font-medium">Configurazione Avanzata</span>
        {(hasModules || hasParameters || hasPreset) && (
          <Badge variant="secondary" className="text-xs">
            {hasPreset ? 'Preset' : `${modules.length} moduli`}
          </Badge>
        )}
      </CollapsibleTrigger>
      
      <CollapsibleContent className="mt-3 space-y-3 pl-6 border-l-2 border-muted">
        {/* Preset Applicato */}
        {hasPreset && preset && (
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-yellow-500" />
              <span className="text-sm font-medium">Preset: {preset.name}</span>
              {preset.badge_text && (
                <Badge variant="outline" className="text-xs">
                  {preset.badge_text}
                </Badge>
              )}
            </div>
            {preset.description && (
              <p className="text-xs text-muted-foreground pl-6">{preset.description}</p>
            )}
          </div>
        )}

        {/* Moduli Selezionati */}
        {hasModules && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">Moduli Aggiunti ({modules.length})</span>
            </div>
            <div className="flex flex-wrap gap-1.5 pl-6">
              {modules.map((module) => (
                <Badge 
                  key={module.id} 
                  variant="outline" 
                  className="text-xs bg-blue-50 text-blue-700 border-blue-200"
                >
                  {module.name}
                  {configuration.module_prices && configuration.module_prices[module.id] && (
                    <span className="ml-1 font-mono">
                      +€{configuration.module_prices[module.id].toFixed(2)}
                    </span>
                  )}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Parametri Configurati */}
        {hasParameters && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Settings className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium">Parametri Personalizzati</span>
            </div>
            <div className="space-y-1 pl-6">
              {Object.entries(configuration.parameters).map(([key, value]) => (
                <div key={key} className="flex items-center gap-2 text-xs">
                  <span className="text-muted-foreground capitalize">
                    {key.replace(/_/g, ' ')}:
                  </span>
                  <span className="font-medium">
                    {typeof value === 'boolean' 
                      ? (value ? 'Sì' : 'No')
                      : typeof value === 'object'
                      ? JSON.stringify(value)
                      : String(value)
                    }
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Prezzo Totale Configurazione */}
        {configuration.calculated_price && configuration.calculated_price !== configuration.base_price && (
          <div className="pt-2 border-t">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Prezzo base:</span>
              <span className="font-mono">€{configuration.base_price?.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between text-sm font-medium mt-1">
              <span>Prezzo configurato:</span>
              <span className="font-mono text-primary">
                €{configuration.calculated_price.toFixed(2)}
              </span>
            </div>
          </div>
        )}
      </CollapsibleContent>
    </Collapsible>
  )
}


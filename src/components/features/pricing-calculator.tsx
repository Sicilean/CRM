'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Info, Calculator } from 'lucide-react'
import { PricingParams, PricingConfiguration } from '@/types/database.types'
import { calculateFullPricing, DEFAULT_PRICING_PARAMS } from '@/lib/pricing-calculator'

interface PricingCalculatorProps {
  basePrice: number
  serviceLevelParams: {
    urgenza?: number
    complessita?: number
    volume_lavoro?: number
    importanza?: number
    altri_costi?: number
  }
  quoteLevelParams: {
    cliente_abituale?: number
    prosperita_economica?: number
  }
  pricingConfig?: PricingConfiguration
  onChange: (params: PricingParams) => void
  readOnly?: boolean
}

export default function PricingCalculator({
  basePrice,
  serviceLevelParams,
  quoteLevelParams,
  pricingConfig,
  onChange,
  readOnly = false
}: PricingCalculatorProps) {
  const isFirstRender = useRef(true)
  
  const [params, setParams] = useState({
    urgenza: serviceLevelParams.urgenza ?? DEFAULT_PRICING_PARAMS.urgenza,
    complessita: serviceLevelParams.complessita ?? DEFAULT_PRICING_PARAMS.complessita,
    volume_lavoro: serviceLevelParams.volume_lavoro ?? DEFAULT_PRICING_PARAMS.volume_lavoro,
    importanza: serviceLevelParams.importanza ?? DEFAULT_PRICING_PARAMS.importanza,
    altri_costi: serviceLevelParams.altri_costi ?? DEFAULT_PRICING_PARAMS.altri_costi,
  })

  // Calcola risultati usando useMemo per evitare ricalcoli inutili
  const fullPricing = useMemo(() => {
    return calculateFullPricing(
      basePrice,
      params,
      quoteLevelParams,
      pricingConfig
    )
  }, [
    basePrice, 
    params,
    quoteLevelParams,
    pricingConfig
  ])

  // Notifica il padre quando i parametri cambiano (inclusi quelli globali)
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      // Chiama onChange al mount per inizializzare
      onChange(fullPricing)
      return
    }
    onChange(fullPricing)
  }, [
    fullPricing,
    onChange
  ])

  const handleParamChange = (key: keyof typeof params, value: number) => {
    // Valida range (0-5 per sliders, positivo per altri_costi)
    let validValue = value
    if (key !== 'altri_costi') {
      validValue = Math.max(0, Math.min(5, value))
    } else {
      validValue = Math.max(0, value)
    }
    
    setParams(prev => ({ ...prev, [key]: validValue }))
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm font-medium">
        <Calculator className="h-4 w-4" />
        <span>Parametri di Pricing</span>
      </div>

      {/* Parametri a livello di servizio */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Urgenza */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="urgenza" className="text-xs">Urgenza</Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent side="right" className="max-w-xs">
                  <p className="text-xs">Quanto urgente è la consegna del servizio? (0=non urgente, 5=urgentissimo)</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="range"
              id="urgenza"
              min="0"
              max="5"
              step="0.5"
              value={params.urgenza}
              onChange={(e) => handleParamChange('urgenza', parseFloat(e.target.value))}
              disabled={readOnly}
              className="flex-1"
            />
            <Input
              type="number"
              min="0"
              max="5"
              step="0.1"
              value={params.urgenza}
              onChange={(e) => handleParamChange('urgenza', parseFloat(e.target.value) || 0)}
              disabled={readOnly}
              className="w-16 h-8 text-xs"
            />
          </div>
        </div>

        {/* Complessità */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="complessita" className="text-xs">Complessità</Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent side="right" className="max-w-xs">
                  <p className="text-xs">Quanto complesso è questo servizio? (0=semplice, 5=molto complesso)</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="range"
              id="complessita"
              min="0"
              max="5"
              step="0.5"
              value={params.complessita}
              onChange={(e) => handleParamChange('complessita', parseFloat(e.target.value))}
              disabled={readOnly}
              className="flex-1"
            />
            <Input
              type="number"
              min="0"
              max="5"
              step="0.1"
              value={params.complessita}
              onChange={(e) => handleParamChange('complessita', parseFloat(e.target.value) || 0)}
              disabled={readOnly}
              className="w-16 h-8 text-xs"
            />
          </div>
        </div>

        {/* Volume di Lavoro */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="volume_lavoro" className="text-xs">Volume di Lavoro</Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent side="right" className="max-w-xs">
                  <p className="text-xs">Quanto lavoro richiede? (0=minimo, 5=molto lavoro)</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="range"
              id="volume_lavoro"
              min="0"
              max="5"
              step="0.5"
              value={params.volume_lavoro}
              onChange={(e) => handleParamChange('volume_lavoro', parseFloat(e.target.value))}
              disabled={readOnly}
              className="flex-1"
            />
            <Input
              type="number"
              min="0"
              max="5"
              step="0.1"
              value={params.volume_lavoro}
              onChange={(e) => handleParamChange('volume_lavoro', parseFloat(e.target.value) || 0)}
              disabled={readOnly}
              className="w-16 h-8 text-xs"
            />
          </div>
        </div>

        {/* Importanza */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="importanza" className="text-xs">Importanza</Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent side="right" className="max-w-xs">
                  <p className="text-xs">Quanto importante è per il cliente? (0=poco, 5=strategico)</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="range"
              id="importanza"
              min="0"
              max="5"
              step="0.5"
              value={params.importanza}
              onChange={(e) => handleParamChange('importanza', parseFloat(e.target.value))}
              disabled={readOnly}
              className="flex-1"
            />
            <Input
              type="number"
              min="0"
              max="5"
              step="0.1"
              value={params.importanza}
              onChange={(e) => handleParamChange('importanza', parseFloat(e.target.value) || 0)}
              disabled={readOnly}
              className="w-16 h-8 text-xs"
            />
          </div>
        </div>
      </div>

      {/* Altri Costi */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Label htmlFor="altri_costi" className="text-xs">Altri Costi da Sostenere (€)</Label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-3 w-3 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent side="right" className="max-w-xs">
                <p className="text-xs">Eventuali costi extra da aggiungere (es. licenze, materiali, subappalti)</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <Input
          type="number"
          id="altri_costi"
          min="0"
          step="0.01"
          value={params.altri_costi}
          onChange={(e) => handleParamChange('altri_costi', parseFloat(e.target.value) || 0)}
          disabled={readOnly}
          placeholder="0.00"
          className="text-sm"
        />
      </div>

      {/* Risultati Calcolo */}
      <div className="pt-4 border-t space-y-3">
        <div className="flex justify-between items-center text-sm">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Prezzo Base:</span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p className="text-xs">Prezzo base dal servizio</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <span className="font-mono font-medium">€ {basePrice.toFixed(2)}</span>
        </div>

        <div className="flex justify-between items-center text-sm">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Budget Interno:</span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent side="right" className="max-w-xs">
                  <p className="text-xs">Prezzo calcolato considerando urgenza, complessità, cliente abituale e volume</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <span className="font-mono font-semibold text-blue-600">€ {fullPricing.budget_interno.toFixed(2)}</span>
        </div>

        <div className="flex justify-between items-center text-sm pt-2 border-t">
          <div className="flex items-center gap-2">
            <span className="font-medium">Budget Effettivo:</span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent side="right" className="max-w-xs">
                  <p className="text-xs">Prezzo finale per il cliente (include prosperità economica e importanza)</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <span className="font-mono font-bold text-green-600 text-lg">€ {fullPricing.budget_effettivo.toFixed(2)}</span>
        </div>
      </div>
    </div>
  )
}


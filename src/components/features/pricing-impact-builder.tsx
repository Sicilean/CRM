'use client'

import { useState, useEffect } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, X } from 'lucide-react'

interface PricingImpactBuilderProps {
  value: string // JSON string
  onChange: (value: string) => void
}

export default function PricingImpactBuilder({ value, onChange }: PricingImpactBuilderProps) {
  const [pricingType, setPricingType] = useState<string>('fixed')
  const [fixedAmount, setFixedAmount] = useState<string>('')
  const [baseValue, setBaseValue] = useState<string>('')
  const [pricePerAdditional, setPricePerAdditional] = useState<string>('')
  const [percentage, setPercentage] = useState<string>('')
  const [tiers, setTiers] = useState<any[]>([])
  const [mapping, setMapping] = useState<Record<string, number>>({})

  useEffect(() => {
    try {
      if (!value) return
      const parsed = JSON.parse(value)
      if (!parsed || typeof parsed !== 'object') return

      setPricingType(parsed.type || 'fixed')

      if (parsed.type === 'fixed') {
        setFixedAmount(parsed.amount?.toString() || '')
      } else if (parsed.type === 'per_unit') {
        setBaseValue(parsed.base_value?.toString() || '')
        setPricePerAdditional(parsed.price_per_additional?.toString() || '')
      } else if (parsed.type === 'percentage') {
        setPercentage(parsed.percentage?.toString() || '')
      } else if (parsed.type === 'tiered') {
        setTiers(parsed.tiers || [])
      } else if (parsed.type === 'mapping') {
        setMapping(parsed.mapping || {})
      }
    } catch (e) {
      // Invalid JSON, reset
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const buildJSON = () => {
    let result: any = { type: pricingType }

    switch (pricingType) {
      case 'fixed':
        result.amount = parseFloat(fixedAmount) || 0
        break
      case 'per_unit':
        result.base_value = parseFloat(baseValue) || 0
        result.price_per_additional = parseFloat(pricePerAdditional) || 0
        break
      case 'percentage':
        result.percentage = parseFloat(percentage) || 0
        break
      case 'tiered':
        result.tiers = tiers
        break
      case 'mapping':
        result.mapping = mapping
        break
    }

    onChange(JSON.stringify(result, null, 2))
  }

  useEffect(() => {
    buildJSON()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pricingType, fixedAmount, baseValue, pricePerAdditional, percentage, tiers, mapping])

  const addTier = () => {
    setTiers([...tiers, { from: 0, to: 0, price_per_unit: 0 }])
  }

  const removeTier = (index: number) => {
    setTiers(tiers.filter((_, i) => i !== index))
  }

  const updateTier = (index: number, field: string, value: any) => {
    const newTiers = [...tiers]
    newTiers[index][field] = parseFloat(value) || 0
    setTiers(newTiers)
  }

  const addMappingEntry = () => {
    const key = prompt('Inserisci chiave (es. "basic", "standard", "premium")')
    if (key) {
      setMapping({ ...mapping, [key]: 0 })
    }
  }

  const removeMappingEntry = (key: string) => {
    const newMapping = { ...mapping }
    delete newMapping[key]
    setMapping(newMapping)
  }

  const updateMappingValue = (key: string, value: string) => {
    setMapping({ ...mapping, [key]: parseFloat(value) || 0 })
  }

  return (
    <div className="space-y-4 border rounded-lg p-4 bg-muted/30">
      <div>
        <Label>Tipo Impatto Pricing</Label>
        <Select value={pricingType} onValueChange={setPricingType}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="fixed">Fixed (importo fisso)</SelectItem>
            <SelectItem value="per_unit">Per Unit (prezzo per unità aggiuntiva)</SelectItem>
            <SelectItem value="percentage">Percentage (percentuale sul prezzo base)</SelectItem>
            <SelectItem value="tiered">Tiered (a scaglioni)</SelectItem>
            <SelectItem value="mapping">Mapping (mappa valore → prezzo)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {pricingType === 'fixed' && (
        <div>
          <Label>Importo Fisso (€)</Label>
          <Input
            type="number"
            step="0.01"
            value={fixedAmount}
            onChange={(e) => setFixedAmount(e.target.value)}
            placeholder="es. 100"
          />
        </div>
      )}

      {pricingType === 'per_unit' && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Valore Base (incluso)</Label>
            <Input
              type="number"
              value={baseValue}
              onChange={(e) => setBaseValue(e.target.value)}
              placeholder="es. 10"
            />
          </div>
          <div>
            <Label>Prezzo per Unità Aggiuntiva (€)</Label>
            <Input
              type="number"
              step="0.01"
              value={pricePerAdditional}
              onChange={(e) => setPricePerAdditional(e.target.value)}
              placeholder="es. 50"
            />
          </div>
        </div>
      )}

      {pricingType === 'percentage' && (
        <div>
          <Label>Percentuale (%)</Label>
          <Input
            type="number"
            step="0.1"
            value={percentage}
            onChange={(e) => setPercentage(e.target.value)}
            placeholder="es. 15"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Percentuale da aggiungere/sottrarre al prezzo base
          </p>
        </div>
      )}

      {pricingType === 'tiered' && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Scaglioni</Label>
            <Button type="button" size="sm" variant="outline" onClick={addTier}>
              <Plus className="h-3 w-3 mr-1" />
              Aggiungi
            </Button>
          </div>
          {tiers.map((tier, index) => (
            <div key={index} className="flex gap-2 items-center bg-white p-2 rounded border">
              <Input
                type="number"
                placeholder="Da"
                value={tier.from}
                onChange={(e) => updateTier(index, 'from', e.target.value)}
                className="w-20"
              />
              <span className="text-sm">-</span>
              <Input
                type="number"
                placeholder="A"
                value={tier.to}
                onChange={(e) => updateTier(index, 'to', e.target.value)}
                className="w-20"
              />
              <span className="text-sm">=</span>
              <Input
                type="number"
                step="0.01"
                placeholder="€ per unità"
                value={tier.price_per_unit}
                onChange={(e) => updateTier(index, 'price_per_unit', e.target.value)}
                className="flex-1"
              />
              <Button
                type="button"
                size="icon"
                variant="ghost"
                onClick={() => removeTier(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {pricingType === 'mapping' && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Mappatura Valori</Label>
            <Button type="button" size="sm" variant="outline" onClick={addMappingEntry}>
              <Plus className="h-3 w-3 mr-1" />
              Aggiungi
            </Button>
          </div>
          {Object.entries(mapping).map(([key, val]) => (
            <div key={key} className="flex gap-2 items-center bg-white p-2 rounded border">
              <Badge variant="outline" className="min-w-24">
                {key}
              </Badge>
              <span className="text-sm">=</span>
              <Input
                type="number"
                step="0.01"
                placeholder="€"
                value={val}
                onChange={(e) => updateMappingValue(key, e.target.value)}
                className="flex-1"
              />
              <Button
                type="button"
                size="icon"
                variant="ghost"
                onClick={() => removeMappingEntry(key)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}




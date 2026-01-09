// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'

/**
 * POST /api/quotes/[id]/create-project
 * 
 * Sistema Avanzato: Crea automaticamente progetti completi con auto-generazione
 * da preventivi accettati, con supporto per offerte integrative.
 * 
 * Features:
 * - ✅ Creazione progetto unificato + sotto-progetti
 * - ✅ Auto-generazione requisiti funzionali (da mapping)
 * - ✅ Auto-generazione materiali brand (da mapping)
 * - ✅ Auto-creazione servizi gestiti (da mapping)
 * - ✅ Supporto offerte integrative su progetti esistenti
 * 
 * @version 2.0 - Advanced Quote to Project System
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const quoteId = params.id

    // 1. Recupera quote
    const { data: quote, error: quoteError } = await supabase
      .from('quotes')
      .select('*')
      .eq('id', quoteId)
      .single()

    if (quoteError || !quote) {
      return NextResponse.json(
        { success: false, error: 'Quote non trovato' },
        { status: 404 }
      )
    }

    // Verifica stato accepted
    if (quote.status !== 'accepted') {
      return NextResponse.json(
        { 
          success: false, 
          error: `Il preventivo deve essere nello stato 'accepted' (stato attuale: '${quote.status}')` 
        },
        { status: 400 }
      )
    }

    // 2. CONTROLLA SE È OFFERTA INTEGRATIVA
    if (quote.project_id) {
      logger.log('🔁 Offerta Integrativa rilevata:', quote.project_id)
      return await handleIntegrativeQuote(supabase, quote)
    } else {
      logger.log('✨ Offerta Iniziale rilevata')
      return await handleInitialQuote(supabase, quote)
    }

  } catch (error: any) {
    logger.error('❌ Errore creazione progetto da quote:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Errore sconosciuto durante la creazione del progetto'
      },
      { status: 500 }
    )
  }
}

// ========================================
// SCENARIO 1: Offerta Iniziale
// ========================================
async function handleInitialQuote(supabase: any, quote: any) {
  logger.log('📦 Inizio creazione progetto iniziale...')

    // Verifica che non esista già un progetto collegato
    const { data: existingProject } = await supabase
      .from('projects')
      .select('id, project_number, nome')
    .eq('quote_id', quote.id)
      .single()

    if (existingProject) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Esiste già un progetto collegato a questo preventivo: ${existingProject.project_number} - ${existingProject.nome}`,
          existing_project: existingProject
        },
        { status: 400 }
      )
    }

  // 1. Crea progetto principale
  const projectNumber = await generateProjectNumber(supabase)
    const projectData = {
      project_number: projectNumber,
      nome: quote.client_name || `Progetto da Quote ${quote.quote_number}`,
      descrizione: quote.notes || null,
      persona_giuridica_id: quote.persona_giuridica_id || null,
      persona_fisica_id: quote.persona_fisica_id || null,
    quote_id: quote.id,
      stato: 'contratto_firmato',
      data_creazione: new Date().toISOString().split('T')[0],
      data_firma_contratto: new Date().toISOString().split('T')[0],
      valore_preventivato: quote.total_amount || null,
      referente_sicilean_user_id: quote.created_by || null,
    project_types: [] as string[],
      created_by: quote.created_by || null
    }

    const { data: project, error: projectError } = await supabase
      .from('projects')
      .insert(projectData)
      .select()
      .single()

    if (projectError || !project) {
      throw new Error(`Errore creazione progetto: ${projectError?.message}`)
    }

  logger.log('✅ Progetto creato:', project.project_number)

  // 2. Analizza servizi e crea sotto-progetti
    const services = (quote.services as any[]) || []
    const projectTypes = new Set<string>()
    const createdSubProjects: any[] = []
  const summary = {
    software_projects: 0,
    brand_kits: 0,
    managed_services: 0,
    requirements: 0,
    brand_assets: 0
  }

    for (const service of services) {
    // Recupera service completo dal DB per metadata
    const { data: serviceData } = await supabase
      .from('services')
      .select('*')
      .eq('notion_id', service.service_id)
      .single()

    if (!serviceData) {
      logger.warn(`⚠️ Servizio non trovato: ${service.service_id}`)
      continue
    }

    // === SOFTWARE PROJECT ===
    if (serviceData.output_type === 'software' || serviceData.output_type === 'mixed') {
      logger.log(`🖥️ Creazione software project per servizio: ${serviceData.name}`)
        projectTypes.add('software')
        
        const softwareData = {
        nome: service.service_name || serviceData.name,
        descrizione: serviceData.configuration?.description || null,
          persona_giuridica_id: quote.persona_giuridica_id || null,
          project_id: project.id,
        quote_id: quote.id,
        tipo_progetto: serviceData.default_project_type || 'sito_web',
          stato: 'concept',
          priorita: 'media',
          metadata: service,
          created_by: quote.created_by || null
        }

        const { data: softwareProject, error: spError } = await supabase
          .from('software_projects')
          .insert(softwareData)
          .select()
          .single()

        if (!spError && softwareProject) {
        createdSubProjects.push({ type: 'software_project', data: softwareProject })
        summary.software_projects++

        // AUTO-GENERA REQUISITI FUNZIONALI
        if (serviceData.auto_generate_requirements) {
          logger.log(`📋 Auto-generazione requisiti per servizio: ${serviceData.name}`)
          const reqCount = await generateRequirementsForService(
            supabase,
            serviceData.id,
            softwareProject.id,
            service.quantity || 1
          )
          summary.requirements += reqCount
        }
      }
    }

    // === BRAND KIT ===
    if (serviceData.output_type === 'brand' || serviceData.output_type === 'mixed') {
      logger.log(`🎨 Creazione brand kit per servizio: ${serviceData.name}`)
        projectTypes.add('branding')
        
        const brandKitData = {
        nome: `${quote.client_company || quote.client_name || 'Cliente'} - Brand Kit`,
        descrizione: serviceData.configuration?.description || null,
          persona_giuridica_id: quote.persona_giuridica_id || null,
          project_id: project.id,
          stato: 'draft',
          tipo_gestione: 'completo_sicilean',
          metadata: service,
          created_by: quote.created_by || null
        }

        const { data: brandKit, error: bkError } = await supabase
          .from('brand_kits')
          .insert(brandKitData)
          .select()
          .single()

        if (!bkError && brandKit) {
        createdSubProjects.push({ type: 'brand_kit', data: brandKit })
        summary.brand_kits++

        // AUTO-GENERA MATERIALI BRAND
        if (serviceData.auto_generate_brand_assets) {
          logger.log(`🖼️ Auto-generazione materiali brand per servizio: ${serviceData.name}`)
          const assetCount = await generateBrandAssetsForService(
            supabase,
            serviceData.id,
            brandKit.id,
            service.quantity || 1
          )
          summary.brand_assets += assetCount
        }
      }
    }

    // === SERVIZIO GESTITO ===
    if (serviceData.output_type === 'managed_service') {
      logger.log(`⚙️ Creazione servizi gestiti per servizio: ${serviceData.name}`)
      projectTypes.add('managed_services')
      
      // AUTO-CREA SERVIZI GESTITI
      if (serviceData.auto_generate_managed_services) {
        const msCount = await generateManagedServicesForService(
          supabase,
          serviceData.id,
          project.id,
          quote.persona_giuridica_id || null,
          project.data_firma_contratto,
          service.quantity || 1,
          service
        )
        summary.managed_services += msCount
      }
    }

    // === CONSULTING / STRATEGY ===
    if (serviceData.output_type === 'consulting' || serviceData.output_type === 'strategy') {
        projectTypes.add('consulting')
      }
    }

  // 3. Aggiorna project_types
    await supabase
      .from('projects')
      .update({ project_types: Array.from(projectTypes) })
      .eq('id', project.id)

  // 4. Crea audit log
    await supabase
      .from('audit_log')
      .insert({
        user_id: quote.created_by || null,
        action: 'INSERT',
        entity_type: 'project',
        entity_id: project.id,
        new_values: {
        created_from_quote: quote.id,
          quote_number: quote.quote_number,
          project_number: projectNumber,
        summary: summary
        }
      })

  logger.log('✅ Progetto iniziale completato:', summary)

    return NextResponse.json({
      success: true,
      data: {
        project: {
          id: project.id,
          project_number: project.project_number,
          nome: project.nome,
          stato: project.stato,
          project_types: Array.from(projectTypes)
        },
        sub_projects: createdSubProjects,
      summary: summary,
        quote: {
          id: quote.id,
          quote_number: quote.quote_number
        }
      },
      message: `Progetto ${projectNumber} creato con successo da preventivo ${quote.quote_number}`
    })
}

// ========================================
// SCENARIO 2: Offerta Integrativa
// ========================================
async function handleIntegrativeQuote(supabase: any, quote: any) {
  const projectId = quote.project_id

  logger.log('🔄 Inizio aggiornamento progetto integrativo...')

  // Verifica progetto esistente
  const { data: project, error: projectError } = await supabase
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .single()

  if (projectError || !project) {
    return NextResponse.json(
      { error: 'Progetto non trovato' },
      { status: 404 }
    )
  }

  // Analizza servizi e aggiorna sotto-progetti esistenti
  const services = (quote.services as any[]) || []
  const updates: any[] = []
  const summary = {
    requirements_added: 0,
    brand_assets_added: 0,
    managed_services_added: 0
  }

  for (const service of services) {
    const { data: serviceData } = await supabase
      .from('services')
      .select('*')
      .eq('notion_id', service.service_id)
      .single()

    if (!serviceData) continue

    // === SOFTWARE: Aggiungi Requisiti ===
    if (serviceData.output_type === 'software' && serviceData.auto_generate_requirements) {
      logger.log(`📋 Aggiunta requisiti per servizio: ${serviceData.name}`)
      
      // Trova software_project collegato al progetto
      const { data: softwareProjects } = await supabase
        .from('software_projects')
        .select('id')
        .eq('project_id', projectId)
        .limit(1)

      if (softwareProjects && softwareProjects[0]) {
        const reqCount = await generateRequirementsForService(
          supabase,
          serviceData.id,
          softwareProjects[0].id,
          service.quantity || 1
        )
        summary.requirements_added += reqCount
        updates.push({ type: 'requirements_added', service: serviceData.name, count: reqCount })
      }
    }

    // === BRAND: Aggiungi Materiali ===
    if (serviceData.output_type === 'brand' && serviceData.auto_generate_brand_assets) {
      logger.log(`🖼️ Aggiunta materiali brand per servizio: ${serviceData.name}`)
      
      const { data: brandKits } = await supabase
        .from('brand_kits')
        .select('id')
        .eq('project_id', projectId)
        .limit(1)

      if (brandKits && brandKits[0]) {
        const assetCount = await generateBrandAssetsForService(
          supabase,
          serviceData.id,
          brandKits[0].id,
          service.quantity || 1
        )
        summary.brand_assets_added += assetCount
        updates.push({ type: 'brand_assets_added', service: serviceData.name, count: assetCount })
      }
    }

    // === MANAGED SERVICES: Aggiungi Servizi ===
    if (serviceData.output_type === 'managed_service' && serviceData.auto_generate_managed_services) {
      logger.log(`⚙️ Aggiunta servizi gestiti per servizio: ${serviceData.name}`)
      
      const msCount = await generateManagedServicesForService(
        supabase,
        serviceData.id,
        projectId,
        project.persona_giuridica_id || null,
        new Date().toISOString().split('T')[0],
        service.quantity || 1,
        service
      )
      summary.managed_services_added += msCount
      updates.push({ type: 'managed_services_added', service: serviceData.name, count: msCount })
    }
  }

  // Aggiorna valore preventivato progetto (somma offerte)
  const newValue = parseFloat(project.valore_preventivato || '0') + parseFloat(quote.total_amount || '0')
  await supabase
    .from('projects')
    .update({ valore_preventivato: newValue })
    .eq('id', projectId)

  // Crea milestone integrativa
  await supabase
    .from('project_milestones')
    .insert({
      project_id: projectId,
      nome: `Integrazione da Quote ${quote.quote_number}`,
      descrizione: quote.notes,
      data_target: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // +30gg
      stato: 'pending',
      importo: quote.total_amount
    })

  // Audit log
  await supabase
    .from('audit_log')
    .insert({
      user_id: quote.created_by || null,
      action: 'UPDATE',
      entity_type: 'project',
      entity_id: projectId,
      new_values: {
        integrative_quote: quote.id,
        quote_number: quote.quote_number,
        summary: summary
      }
    })

  logger.log('✅ Progetto integrativo completato:', summary)

  return NextResponse.json({
    success: true,
    data: {
      project: {
        id: project.id,
        project_number: project.project_number,
        nome: project.nome,
        valore_preventivato: newValue
      },
      updates: updates,
      summary: summary
    },
    message: `Progetto ${project.project_number} aggiornato con successo da preventivo integrativo ${quote.quote_number}`
  })
}

// ========================================
// FUNZIONE: Auto-Genera Requisiti
// ========================================
async function generateRequirementsForService(
  supabase: any,
  serviceId: string,
  softwareProjectId: string,
  quantity: number
): Promise<number> {
  // Recupera mapping requisiti per questo servizio
  const { data: mappings, error } = await supabase
    .from('service_to_requirements_mapping')
    .select('*')
    .eq('service_id', serviceId)
    .order('display_order', { ascending: true })

  if (error || !mappings || mappings.length === 0) {
    logger.log(`ℹ️ Nessun mapping requisiti trovato per service ${serviceId}`)
    return 0
  }

  // Crea requisiti funzionali
  const requirements = mappings.map((mapping: any) => ({
    software_project_id: softwareProjectId,
    nome: mapping.requirement_name,
    descrizione: mapping.requirement_description,
    tipo_feature: 'requirement',
    categoria: mapping.requirement_category,
    stato: 'todo',
    priorita: mapping.requirement_priority,
    moscow_priority: mapping.moscow_priority,
    stima_ore: mapping.stima_ore,
    dipendenze: mapping.dipendenze,
    display_order: mapping.display_order,
    note: `Auto-generato da servizio (qty: ${quantity})`
  }))

  const { error: insertError } = await supabase
    .from('software_project_features')
    .insert(requirements)

  if (insertError) {
    logger.error('❌ Errore inserimento requisiti:', insertError)
    return 0
  }

  logger.log(`✅ Generati ${requirements.length} requisiti per software_project ${softwareProjectId}`)
  return requirements.length
}

// ========================================
// FUNZIONE: Auto-Genera Brand Assets
// ========================================
async function generateBrandAssetsForService(
  supabase: any,
  serviceId: string,
  brandKitId: string,
  quantity: number
): Promise<number> {
  // Recupera mapping brand assets per questo servizio
  const { data: mappings, error } = await supabase
    .from('service_to_brand_assets_mapping')
    .select('*')
    .eq('service_id', serviceId)
    .order('display_order', { ascending: true })

  if (error || !mappings || mappings.length === 0) {
    logger.log(`ℹ️ Nessun mapping brand assets trovato per service ${serviceId}`)
    return 0
  }

  // Crea placeholder per materiali brand
  const assets = []
  for (const mapping of mappings) {
    const assetQuantity = mapping.quantity * quantity
    
    // Crea N placeholder (uno per ogni quantità)
    for (let i = 1; i <= assetQuantity; i++) {
      assets.push({
        brand_kit_id: brandKitId,
        categoria: mapping.asset_category,
        sottocategoria: mapping.asset_subcategory,
        nome_file: `${mapping.asset_name}${i > 1 ? ` (${i})` : ''}`,
        descrizione: mapping.asset_description,
        variante: mapping.varianti?.[i - 1] || null,
        formato: mapping.formati_richiesti?.[0] || null,
        dimensioni: mapping.technical_specs,
        usage_notes: mapping.usage_notes,
        display_order: mapping.display_order,
        tags: ['auto-generated', 'placeholder']
        // file_path: null → da caricare successivamente
      })
    }
  }

  const { error: insertError } = await supabase
    .from('brand_kit_files')
    .insert(assets)

  if (insertError) {
    logger.error('❌ Errore inserimento brand assets:', insertError)
    return 0
  }

  logger.log(`✅ Generati ${assets.length} placeholder assets per brand_kit ${brandKitId}`)
  return assets.length
}

// ========================================
// FUNZIONE: Auto-Crea Servizi Gestiti
// ========================================
async function generateManagedServicesForService(
  supabase: any,
  serviceId: string,
  projectId: string,
  clientId: string | null,
  contractDate: string,
  quantity: number,
  serviceDetails: any
): Promise<number> {
  // 1. Recupera dati del servizio originale per ricorrenza
  const { data: serviceData } = await supabase
    .from('services')
    .select('*')
    .eq('id', serviceId)
    .single()

  // 2. Recupera mapping servizi gestiti per questo servizio
  const { data: mappings, error } = await supabase
    .from('service_to_managed_services_mapping')
    .select('*')
    .eq('service_id', serviceId)
    .order('display_order', { ascending: true })

  if (error || !mappings || mappings.length === 0) {
    logger.log(`ℹ️ Nessun mapping servizi gestiti trovato per service ${serviceId}`)
    return 0
  }

  // Calcola date base
  const contractDateObj = new Date(contractDate)

  // 3. Crea servizi gestiti
  const managedServices = []
  
  for (const mapping of mappings) {
    // NUOVA LOGICA: Se servizio ricorrente, quantity = slot temporali
    const isRecurring = serviceData?.is_recurring || false
    const recurrencePeriod = serviceData?.recurrence_period || mapping.rinnovo_periodicita || 'mensile'
    const recurrencePeriodMonths = serviceData?.recurrence_period_months || getMonthsFromPeriod(recurrencePeriod)
    
    // Responsabile: usa override da preventivo se presente, altrimenti default servizio
    const responsabileUserId = serviceDetails.responsabile_user_id || serviceData?.responsabile_user_id || null

    if (isRecurring) {
      // ===== SERVIZIO RICORRENTE: 1 servizio gestito con slot temporali =====
      logger.log(`🔄 Creazione servizio ricorrente con ${quantity} slot ${recurrencePeriod}`)
      
      const inizioServizio = new Date(contractDateObj)
      inizioServizio.setDate(inizioServizio.getDate() + (mapping.inizio_servizio_offset_days || 0))

      // Calcola data fine contratto (inizio + quantity * period_months)
      const dataFineContratto = new Date(inizioServizio)
      dataFineContratto.setMonth(dataFineContratto.getMonth() + (recurrencePeriodMonths * quantity))

      // Calcola prossimo rinnovo (inizio + 1 * period_months)
      const nextRenewalDate = new Date(inizioServizio)
      nextRenewalDate.setMonth(nextRenewalDate.getMonth() + recurrencePeriodMonths)

      // Determina billing_type basato su ricorrenza
      const billingType = getBillingTypeFromRecurrence(recurrencePeriod)
      
      // Calcola prezzi
      const unitPrice = serviceDetails.unit_price || serviceDetails.base_price || 0
      const totalValue = unitPrice * quantity

      // Sostituisci variabili in link_template
      let link = mapping.link_template
      if (link && serviceDetails.customizations) {
        const replacements = {
          dominio: serviceDetails.customizations.dominio || '',
          cliente: serviceDetails.customizations.cliente_slug || '',
          provider: serviceDetails.customizations.provider || 'default'
        }
        for (const [key, value] of Object.entries(replacements)) {
          link = link.replace(new RegExp(`\\{${key}\\}`, 'g'), value)
        }
      }

      managedServices.push({
        notion_id: `auto-${Date.now()}-recurring`,
        nome: mapping.managed_service_name,
        tipo: mapping.managed_service_type,
        descrizione: mapping.managed_service_description,
        stato: mapping.stato_iniziale,
        link: link || null,
        project_id: projectId,
        persona_giuridica_id: clientId,
        responsabile_user_id: responsabileUserId,
        responsabile_email: mapping.responsabile_email_default || null,
        
        // Date
        inizio_servizio: inizioServizio.toISOString().split('T')[0],
        data_rinnovo: dataFineContratto.toISOString().split('T')[0], // Data fine contratto
        next_renewal_date: nextRenewalDate.toISOString().split('T')[0],
        
        // Ricorrenza
        is_recurring: true,
        recurrence_period: recurrencePeriod,
        recurrence_period_months: recurrencePeriodMonths,
        rinnovo_automatico: mapping.rinnovo_automatico,
        rinnovo_periodicita: recurrencePeriod,
        
        // Slot temporali
        total_slots: quantity,
        current_slot: 1,
        slots_paid: 1, // Primo slot pagato (anticipato)
        
        // Fatturazione
        billing_type: billingType,
        unit_price: unitPrice,
        total_value: totalValue,
        
        raw_notion_data: {
          auto_generated: true,
          recurring_service: true,
          from_service_id: serviceId,
          from_mapping_id: mapping.id,
          service_details: serviceDetails,
          quote_quantity: quantity
        }
      })
      
    } else {
      // ===== SERVIZIO NON RICORRENTE: N servizi gestiti (logica originale) =====
      const serviceQuantity = (mapping.quantity || 1) * quantity

      for (let i = 1; i <= serviceQuantity; i++) {
        const inizioServizio = new Date(contractDateObj)
        inizioServizio.setDate(inizioServizio.getDate() + (mapping.inizio_servizio_offset_days || 0))

        const dataRinnovo = new Date(inizioServizio)
        dataRinnovo.setDate(dataRinnovo.getDate() + (mapping.data_rinnovo_offset_days || 365))

        // Sostituisci variabili in link_template
        let link = mapping.link_template
        if (link && serviceDetails.customizations) {
          const replacements = {
            dominio: serviceDetails.customizations.dominio || '',
            cliente: serviceDetails.customizations.cliente_slug || '',
            provider: serviceDetails.customizations.provider || 'default'
          }
          for (const [key, value] of Object.entries(replacements)) {
            link = link.replace(new RegExp(`\\{${key}\\}`, 'g'), value)
          }
        }

        managedServices.push({
          notion_id: `auto-${Date.now()}-${i}`,
          nome: `${mapping.managed_service_name}${serviceQuantity > 1 ? ` (${i})` : ''}`,
          tipo: mapping.managed_service_type,
          descrizione: mapping.managed_service_description,
          stato: mapping.stato_iniziale,
          link: link || null,
          project_id: projectId,
          persona_giuridica_id: clientId,
          responsabile_user_id: responsabileUserId,
          responsabile_email: mapping.responsabile_email_default || null,
          inizio_servizio: inizioServizio.toISOString().split('T')[0],
          data_rinnovo: dataRinnovo.toISOString().split('T')[0],
          rinnovo_automatico: mapping.rinnovo_automatico,
          rinnovo_periodicita: mapping.rinnovo_periodicita || 'mensile',
          is_recurring: false,
          billing_type: 'one_time',
          raw_notion_data: {
            auto_generated: true,
            from_service_id: serviceId,
            from_mapping_id: mapping.id,
            service_details: serviceDetails
          }
        })
      }
    }
  }

  const { error: insertError } = await supabase
    .from('servizi_gestiti')
    .insert(managedServices)

  if (insertError) {
    logger.error('❌ Errore inserimento servizi gestiti:', insertError)
    logger.error('Dettagli:', insertError)
    return 0
  }

  logger.log(`✅ Generati ${managedServices.length} servizi gestiti per project ${projectId}`)
  return managedServices.length
}

// Helper: Converti periodo ricorrenza in mesi
function getMonthsFromPeriod(period: string): number {
  const mapping: Record<string, number> = {
    'mensile': 1,
    'bimensile': 2,
    'trimestrale': 3,
    'semestrale': 6,
    'annuale': 12
  }
  return mapping[period] || 1
}

// Helper: Determina billing_type da recurrence_period
function getBillingTypeFromRecurrence(recurrencePeriod: string): string {
  const mapping: Record<string, string> = {
    'mensile': 'anticipata_mensile',
    'bimensile': 'anticipata_mensile', // Fattura comunque mensile
    'trimestrale': 'anticipata_trimestrale',
    'semestrale': 'anticipata_semestrale',
    'annuale': 'anticipata_annuale'
  }
  return mapping[recurrencePeriod] || 'one_time'
}

// ========================================
// HELPER: Genera Project Number
// ========================================
async function generateProjectNumber(supabase: any): Promise<string> {
  const year = new Date().getFullYear()
  const { count } = await supabase
    .from('projects')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', `${year}-01-01`)

  const nextNumber = (count || 0) + 1
  return `PRJ-${year}-${String(nextNumber).padStart(4, '0')}`
}

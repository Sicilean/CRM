// @ts-nocheck
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { LeadIntakeData } from '@/types/database.types'

/**
 * ===========================================================================
 * POST /api/lead/intake
 * ===========================================================================
 * Endpoint PUBBLICO per ricevere lead da qualsiasi fonte esterna:
 * - Form website
 * - Landing pages
 * - Webhook da piattaforme esterne
 * - API integrations (Meta Ads, Google Ads, etc.)
 * 
 * Funzionalità:
 * 1. Validazione email
 * 2. Deduplica lead (se esiste aggiorna e logga attività invece di duplicare)
 * 3. Attribuzione automatica a fonte/campagna
 * 4. Creazione record marketing_attribution
 * 5. Auto-assegnazione a commerciale (se configurato nella fonte)
 * 
 * Sicurezza:
 * - Endpoint pubblico (no auth required)
 * - Validazione email semplice ma robusta
 * - Rate limiting futuro (da implementare a livello middleware)
 * ===========================================================================
 */

// Helper: validazione email
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Helper: slugify string
function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body: LeadIntakeData = await request.json()

    // ===== VALIDAZIONE =====
    if (!body.nome_completo || !body.email) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Nome completo e email sono obbligatori' 
        },
        { status: 400 }
      )
    }

    if (!isValidEmail(body.email)) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Email non valida' 
        },
        { status: 400 }
      )
    }

    // ===== RISOLUZIONE FONTE E CAMPAGNA =====
    let sourceId: string | null = null
    let campaignId: string | null = null
    let autoAssignTo: string | null = null

    // Cerca fonte (per slug o ID)
    if (body.marketing_source) {
      const { data: source } = await supabase
        .from('marketing_sources')
        .select('id, auto_assign_to')
        .or(`slug.eq.${body.marketing_source},id.eq.${body.marketing_source}`)
        .eq('status', 'active')
        .single()

      if (source) {
        sourceId = source.id
        autoAssignTo = source.auto_assign_to
      }
    }

    // Se non specificata una fonte, cerca di dedurre da UTM o usa "Altro"
    if (!sourceId) {
      if (body.utm_source) {
        const utmSourceSlug = slugify(body.utm_source)
        const { data: source } = await supabase
          .from('marketing_sources')
          .select('id, auto_assign_to')
          .eq('slug', utmSourceSlug)
          .eq('status', 'active')
          .single()

        if (source) {
          sourceId = source.id
          autoAssignTo = source.auto_assign_to
        }
      }

      // Fallback: fonte "Altro"
      if (!sourceId) {
        const { data: otherSource } = await supabase
          .from('marketing_sources')
          .select('id, auto_assign_to')
          .eq('slug', 'altro')
          .single()

        if (otherSource) {
          sourceId = otherSource.id
          autoAssignTo = otherSource.auto_assign_to
        }
      }
    }

    // Cerca campagna (per slug o ID)
    if (body.marketing_campaign && sourceId) {
      const { data: campaign } = await supabase
        .from('marketing_campaigns')
        .select('id, assigned_to')
        .or(`slug.eq.${body.marketing_campaign},id.eq.${body.marketing_campaign}`)
        .eq('source_id', sourceId)
        .in('status', ['active', 'scheduled'])
        .single()

      if (campaign) {
        campaignId = campaign.id
        // Campaign assigned_to ha priorità su source auto_assign_to
        if (campaign.assigned_to) {
          autoAssignTo = campaign.assigned_to
        }
      }
    }

    // ===== CHECK DEDUPLICA =====
    // Cerca lead esistente per email
    const { data: existingLead } = await supabase
      .from('crm_leads')
      .select('id')
      .eq('email', body.email)
      .single()

    if (existingLead) {
      // Lead già esistente: aggiorna info e logga attività
      const updateData: any = {
        telefono: body.telefono || undefined,
        azienda: body.azienda || undefined,
        ruolo: body.ruolo || undefined,
        servizi_interesse: body.servizi_interesse || undefined,
        descrizione: body.descrizione || undefined,
        note_interne: body.note_interne || undefined,
        // Aggiorna attribuzione solo se non già presente
        marketing_source_id: sourceId || undefined,
        marketing_campaign_id: campaignId || undefined,
        attribution_metadata: {
          utm_source: body.utm_source,
          utm_medium: body.utm_medium,
          utm_campaign: body.utm_campaign,
          utm_content: body.utm_content,
          utm_term: body.utm_term,
          referrer: body.referrer,
          landing_page: body.landing_page,
          updated_at: new Date().toISOString()
        }
      }

      // Rimuovi undefined
      Object.keys(updateData).forEach(key => {
        if (updateData[key] === undefined) delete updateData[key]
      })

      await supabase
        .from('crm_leads')
        .update(updateData)
        .eq('id', existingLead.id)

      // Logga attività
      await supabase.from('crm_activities').insert({
        lead_id: existingLead.id,
        activity_type: 'nota',
        subject: 'Lead resubmitted da intake API',
        description: `Lead ha ricompilato form/intake. Dati aggiornati. Fonte: ${body.marketing_source || 'non specificata'}, Campagna: ${body.marketing_campaign || 'non specificata'}`,
        metadata: {
          source: 'lead_intake_api',
          utm: {
            source: body.utm_source,
            medium: body.utm_medium,
            campaign: body.utm_campaign,
            content: body.utm_content,
            term: body.utm_term
          },
          referrer: body.referrer,
          landing_page: body.landing_page,
          user_agent: body.user_agent,
          ip_address: body.ip_address
        }
      })

      return NextResponse.json({
        success: true,
        message: 'Lead già esistente: informazioni aggiornate',
        lead_id: existingLead.id,
        is_new: false
      }, { status: 200 })
    }

    // ===== CREAZIONE NUOVO LEAD =====
    const leadData: any = {
      nome_completo: body.nome_completo,
      email: body.email,
      telefono: body.telefono || null,
      azienda: body.azienda || null,
      ruolo: body.ruolo || null,
      budget: body.budget || null,
      servizi_interesse: body.servizi_interesse || [],
      descrizione: body.descrizione || null,
      note_interne: body.note_interne || null,
      status: 'nuovo',
      fonte: body.marketing_source || 'altro',
      marketing_source_id: sourceId,
      marketing_campaign_id: campaignId,
      assigned_to: body.assigned_to || autoAssignTo || null,
      attribution_metadata: {
        utm_source: body.utm_source,
        utm_medium: body.utm_medium,
        utm_campaign: body.utm_campaign,
        utm_content: body.utm_content,
        utm_term: body.utm_term,
        referrer: body.referrer,
        landing_page: body.landing_page,
        user_agent: body.user_agent,
        ip_address: body.ip_address,
        device_type: body.device_type,
        browser: body.browser,
        os: body.os,
        created_at: new Date().toISOString()
      }
    }

    const { data: newLead, error: leadError } = await supabase
      .from('crm_leads')
      .insert(leadData)
      .select('id')
      .single()

    if (leadError) throw leadError

    // ===== CREAZIONE ATTRIBUZIONE =====
    const attributionData = {
      lead_id: newLead.id,
      source_id: sourceId,
      campaign_id: campaignId,
      utm_source: body.utm_source || null,
      utm_medium: body.utm_medium || null,
      utm_campaign: body.utm_campaign || null,
      utm_content: body.utm_content || null,
      utm_term: body.utm_term || null,
      referrer: body.referrer || null,
      landing_page: body.landing_page || null,
      user_agent: body.user_agent || null,
      ip_address: body.ip_address || null,
      device_type: body.device_type || null,
      browser: body.browser || null,
      os: body.os || null,
      first_touch_date: new Date().toISOString()
    }

    await supabase
      .from('marketing_attribution')
      .insert(attributionData)

    // ===== LOGGA ATTIVITÀ INIZIALE =====
    await supabase.from('crm_activities').insert({
      lead_id: newLead.id,
      activity_type: 'nota',
      subject: 'Nuovo lead creato da intake API',
      description: `Lead ricevuto tramite intake API. Fonte: ${body.marketing_source || 'non specificata'}, Campagna: ${body.marketing_campaign || 'non specificata'}`,
      metadata: {
        source: 'lead_intake_api',
        utm: {
          source: body.utm_source,
          medium: body.utm_medium,
          campaign: body.utm_campaign,
          content: body.utm_content,
          term: body.utm_term
        },
        referrer: body.referrer,
        landing_page: body.landing_page
      }
    })

    // ===== RESPONSE SUCCESS =====
    return NextResponse.json({
      success: true,
      message: 'Lead creato con successo',
      lead_id: newLead.id,
      is_new: true,
      attribution: {
        source_id: sourceId,
        campaign_id: campaignId
      }
    }, { status: 201 })

  } catch (error: any) {
    console.error('❌ Error in lead intake API:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Errore nella ricezione del lead',
        details: error.message 
      },
      { status: 500 }
    )
  }
}

// OPTIONS handler per CORS (se necessario per chiamate da domini esterni)
export async function OPTIONS(request: NextRequest) {
  return NextResponse.json(
    {},
    {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    }
  )
}


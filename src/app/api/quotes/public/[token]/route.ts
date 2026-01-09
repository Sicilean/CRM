// @ts-nocheck
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { createHash } from 'crypto'

// Hash semplice per verifica password
function hashPassword(password: string): string {
  return createHash('sha256').update(password).digest('hex')
}

// GET - Valida token e ottieni dati preventivo (versione pubblica)
export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const supabase = await createClient()
    
    // Cerca il token
    const { data: tokenData, error: tokenError } = await supabase
      .from('quote_public_tokens')
      .select('*')
      .eq('token', params.token)
      .single()
    
    if (tokenError || !tokenData) {
      return NextResponse.json(
        { valid: false, error: 'Link non valido' },
        { status: 404 }
      )
    }
    
    // Verifica se attivo
    if (!tokenData.is_active) {
      return NextResponse.json(
        { valid: false, error: 'Link disabilitato' },
        { status: 403 }
      )
    }
    
    // Verifica scadenza
    if (tokenData.expires_at && new Date(tokenData.expires_at) < new Date()) {
      return NextResponse.json(
        { valid: false, error: 'Link scaduto' },
        { status: 403 }
      )
    }
    
    // Se richiede password, restituisci solo lo stato
    if (tokenData.requires_password) {
      return NextResponse.json({
        valid: true,
        requires_password: true,
        quote_id: tokenData.quote_id
      })
    }
    
    // Altrimenti carica i dati del preventivo
    const quoteData = await loadQuotePublicData(supabase, tokenData.quote_id)
    
    if (!quoteData) {
      return NextResponse.json(
        { valid: false, error: 'Preventivo non trovato' },
        { status: 404 }
      )
    }
    
    // Aggiorna statistiche utilizzo
    await supabase
      .from('quote_public_tokens')
      .update({
        usage_count: tokenData.usage_count + 1,
        last_used_at: new Date().toISOString()
      })
      .eq('id', tokenData.id)
    
    return NextResponse.json({
      valid: true,
      requires_password: false,
      quote: quoteData
    })
  } catch (error: any) {
    console.error('Errore GET public quote:', error)
    return NextResponse.json(
      { valid: false, error: 'Errore interno del server' },
      { status: 500 }
    )
  }
}

// POST - Verifica password e ottieni dati preventivo
export async function POST(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const { password } = body
    
    if (!password) {
      return NextResponse.json(
        { valid: false, error: 'Password richiesta' },
        { status: 400 }
      )
    }
    
    // Cerca il token
    const { data: tokenData, error: tokenError } = await supabase
      .from('quote_public_tokens')
      .select('*')
      .eq('token', params.token)
      .single()
    
    if (tokenError || !tokenData) {
      return NextResponse.json(
        { valid: false, error: 'Link non valido' },
        { status: 404 }
      )
    }
    
    // Verifica se attivo
    if (!tokenData.is_active) {
      return NextResponse.json(
        { valid: false, error: 'Link disabilitato' },
        { status: 403 }
      )
    }
    
    // Verifica scadenza
    if (tokenData.expires_at && new Date(tokenData.expires_at) < new Date()) {
      return NextResponse.json(
        { valid: false, error: 'Link scaduto' },
        { status: 403 }
      )
    }
    
    // Verifica password
    if (tokenData.requires_password && tokenData.password_hash) {
      const passwordHash = hashPassword(password.trim())
      if (passwordHash !== tokenData.password_hash) {
        return NextResponse.json(
          { valid: false, error: 'Password non corretta' },
          { status: 401 }
        )
      }
    }
    
    // Carica dati preventivo
    const quoteData = await loadQuotePublicData(supabase, tokenData.quote_id)
    
    if (!quoteData) {
      return NextResponse.json(
        { valid: false, error: 'Preventivo non trovato' },
        { status: 404 }
      )
    }
    
    // Aggiorna statistiche utilizzo
    await supabase
      .from('quote_public_tokens')
      .update({
        usage_count: tokenData.usage_count + 1,
        last_used_at: new Date().toISOString()
      })
      .eq('id', tokenData.id)
    
    return NextResponse.json({
      valid: true,
      quote: quoteData
    })
  } catch (error: any) {
    console.error('Errore POST public quote:', error)
    return NextResponse.json(
      { valid: false, error: 'Errore interno del server' },
      { status: 500 }
    )
  }
}

// Helper per caricare i dati pubblici del preventivo
async function loadQuotePublicData(supabase: any, quoteId: string) {
  // Carica preventivo con tutti i dati cliente
  const { data: quote, error: quoteError } = await supabase
    .from('quotes')
    .select(`
      id,
      quote_number,
      version,
      client_name,
      client_company,
      client_email,
      client_phone,
      client_address,
      client_vat,
      client_fiscal_code,
      client_sdi_code,
      referente_name,
      referente_role,
      subtotal_one_time,
      subtotal_recurring_monthly,
      subtotal_recurring_yearly,
      discount_amount,
      discount_percentage,
      tax_percentage,
      tax_amount,
      total_one_time,
      total_recurring_monthly,
      total_recurring_yearly,
      grand_total,
      status,
      valid_until,
      client_notes,
      terms_and_conditions,
      payment_terms,
      estimated_delivery,
      project_name,
      vision_summary,
      objectives,
      timeline,
      created_at,
      updated_at
    `)
    .eq('id', quoteId)
    .single()
  
  if (quoteError || !quote) return null
  
  // Carica items
  const { data: items } = await supabase
    .from('quote_items')
    .select(`
      id,
      service_name,
      service_description,
      quantity,
      unit_price,
      line_total,
      is_recurring,
      recurring_interval,
      recurring_count,
      setup_fee,
      discount_percentage,
      discount_amount,
      custom_name,
      custom_description,
      configuration
    `)
    .eq('quote_id', quoteId)
    .order('sort_order', { ascending: true })
  
  // Carica addons per ogni item
  const itemsWithAddons = []
  for (const item of items || []) {
    const { data: addons } = await supabase
      .from('quote_item_addons')
      .select(`
        id,
        addon_name,
        quantity,
        unit_price,
        line_total,
        is_recurring,
        recurring_interval,
        recurring_count
      `)
      .eq('quote_item_id', item.id)
    
    itemsWithAddons.push({
      ...item,
      addons: addons || []
    })
  }
  
  // Carica bundle applicati
  const { data: bundles } = await supabase
    .from('quote_bundles_applied')
    .select('id, bundle_name, discount_amount')
    .eq('quote_id', quoteId)
  
  return {
    ...quote,
    items: itemsWithAddons,
    bundles_applied: bundles || []
  }
}

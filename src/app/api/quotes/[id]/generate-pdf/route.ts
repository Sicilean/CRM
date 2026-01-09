// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'
import { 
  QuoteGenerator, 
  ProjectProposalGenerator,
  QuoteData, 
  CompanyInfo, 
  QuoteTerm,
  TeamMember,
  TimelinePhase
} from '@/lib/pdf'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    logger.log('🚀 Inizio generazione PDF per quote:', params.id)
    const supabase = await createClient()

    // Verifica autenticazione
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 })
    }

    // Carica preventivo
    const { data: quote, error: quoteError } = await supabase
      .from('quotes')
      .select('*')
      .eq('id', params.id)
      .single()

    if (quoteError || !quote) {
      return NextResponse.json({ error: 'Preventivo non trovato' }, { status: 404 })
    }

    // Carica nomi servizi
    const services = (quote.services as any[]) || []
    const serviceIds = services.map((s: any) => s.service_id).filter(Boolean)
    
    let servicesWithNames = services
    if (serviceIds.length > 0) {
      const { data: servicesData } = await supabase
        .from('services')
        .select('notion_id, name, description')
        .in('notion_id', serviceIds)
      
      servicesWithNames = services.map((s: any) => {
        const service = servicesData?.find(sd => sd.notion_id === s.service_id)
        return {
          service_id: s.service_id,
          service_name: service?.name || s.service_id,
          description: service?.description,
          quantity: parseFloat(s.quantity || 1),
          duration: s.duration || s.durata || null, // Supporta sia 'duration' che 'durata'
          unit_price: parseFloat(s.unit_price || 0),
          notes: s.notes,
        }
      })
    }

    // Carica informazioni aziendali
    const { data: companyInfo, error: companyError } = await supabase
      .from('company_info')
      .select('*')
      .eq('is_active', true)
      .limit(1)
      .single()

    if (companyError || !companyInfo) {
      return NextResponse.json(
        { error: 'Informazioni aziendali non configurate' },
        { status: 500 }
      )
    }

    // Carica account bancario se configurato
    let bankAccount = null
    if (companyInfo.default_bank_account_id) {
      const { data: accountData } = await supabase
        .from('bank_accounts')
        .select('account_name, iban, bic_swift, currency')
        .eq('id', companyInfo.default_bank_account_id)
        .single()
      
      if (accountData) {
        bankAccount = accountData
      }
    }

    // Carica termini e condizioni
    const { data: termsData } = await supabase
      .from('quote_terms')
      .select('name, content, display_order')
      .eq('is_active', true)
      .order('display_order', { ascending: true })

    const terms: QuoteTerm[] = (termsData || []).map((t: any) => ({
      name: t.name,
      content: t.content,
      order: t.display_order,
    }))

    // Carica team members se presenti
    let teamMembersData: TeamMember[] = []
    if (quote.team_members && (quote.team_members as any[]).length > 0) {
      const { data: teamProfiles } = await supabase
        .from('profiles')
        .select('id, nome, cognome, professione, foto_profilo, bio')
        .in('id', quote.team_members as any[])
      
      if (teamProfiles) {
        teamMembersData = teamProfiles.map((p: any) => ({
          id: p.id,
          nome: p.nome,
          cognome: p.cognome,
          professione: p.professione,
          foto_profilo: p.foto_profilo,
          bio: p.bio,
        }))
      }
    }

    // Prepara dati per PDF nel formato del nuovo sistema
    const quoteData: QuoteData = {
      quote_number: quote.quote_number || 'DRAFT',
      created_at: quote.created_at,
      valid_until: quote.valid_until,
      validity_days: (quote.configuration as any)?.validity_days || 30,
      
      client: {
        client_name: quote.client_name || '',
        client_email: quote.client_email,
        client_company: quote.client_company,
        client_phone: quote.client_phone,
        client_vat_number: quote.client_vat_number,
        client_fiscal_code: quote.client_fiscal_code,
        client_address: quote.client_address,
        client_sdi_code: quote.client_sdi_code,
        referente_name: quote.referente_name,
        referente_role: quote.referente_role,
      },
      
      services: servicesWithNames,
      
      subtotal: parseFloat(quote.subtotal || 0),
      discount_percentage: parseFloat(quote.discount_percentage || 0),
      discount_amount: parseFloat(quote.discount_amount || 0),
      tax_percentage: parseFloat(quote.tax_percentage || 22),
      tax_amount: parseFloat(quote.tax_amount || 0),
      total_amount: parseFloat(quote.total_amount || 0),
      
      notes: quote.notes,
      payment_terms: (quote.configuration as any)?.payment_terms,
      status: quote.status,
      
      // Campi proposta progettuale
      project_name: quote.project_name,
      vision_summary: quote.vision_summary,
      objectives: quote.objectives,
      timeline: quote.timeline as TimelinePhase[] || [],
      team_members: quote.team_members as string[] || [],
    }

    const companyData: CompanyInfo = {
      company_name: companyInfo.company_name,
      legal_name: companyInfo.legal_name,
      vat_number: companyInfo.vat_number,
      fiscal_code: companyInfo.fiscal_code,
      sdi_code: companyInfo.sdi_code,
      address: companyInfo.address,
      city: companyInfo.city,
      postal_code: companyInfo.postal_code,
      province: companyInfo.province,
      phone: companyInfo.phone,
      email: companyInfo.email,
      pec: companyInfo.pec,
      website: companyInfo.website,
      footer_text: companyInfo.footer_text,
      bank_account: bankAccount || null,
    }

    // Determina tipo di documento in base ai campi presenti
    const isProjectProposal = !!(
      quote.project_name ||
      quote.vision_summary ||
      quote.objectives ||
      (quote.timeline && (quote.timeline as any[]).length > 0) ||
      teamMembersData.length > 0
    )

    // Genera PDF con il sistema appropriato
    logger.log(`📄 Inizializzazione generatore PDF (${isProjectProposal ? 'Proposta Progettuale' : 'Preventivo Standard'})...`)
    
    // Path al logo
    const logoPath = process.cwd() + '/public/Logo.svg'
    
    let generator: QuoteGenerator | ProjectProposalGenerator
    let fileName: string
    
    if (isProjectProposal) {
      // Usa generatore proposta progettuale
      generator = new ProjectProposalGenerator({
        quote: quoteData,
        companyInfo: companyData,
        terms,
        logoPath,
        teamMembers: teamMembersData,
        documentType: 'project_proposal',
        includeSignatures: true,
        includeGDPR: true,
      })
      fileName = `proposta-progettuale-${quote.quote_number || params.id}.pdf`
    } else {
      // Usa generatore preventivo standard
      generator = new QuoteGenerator({
        quote: quoteData,
        companyInfo: companyData,
        terms,
        logoPath,
        documentType: 'quote',
        includeSignatures: true,
        includeGDPR: true,
      })
      fileName = `preventivo-${quote.quote_number || params.id}.pdf`
    }

    logger.log('🔄 Generazione PDF in corso...')
    const pdfBuffer = await generator.generate()
    logger.log('✅ PDF generato con successo, dimensione:', pdfBuffer.length, 'bytes')
    
    // Ritorna PDF come download
    return new NextResponse(pdfBuffer as unknown as BodyInit, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Cache-Control': 'no-cache',
      },
    })
  } catch (error) {
    logger.error('❌ Errore generazione PDF:', error)
    logger.error('Stack trace:', error instanceof Error ? error.stack : 'No stack trace')
    return NextResponse.json(
      { 
        error: 'Errore durante la generazione del PDF',
        details: error instanceof Error ? error.message : 'Errore sconosciuto'
      },
      { status: 500 }
    )
  }
}


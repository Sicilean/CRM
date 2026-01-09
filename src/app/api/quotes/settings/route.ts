import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET - Ottieni impostazioni preventivi (info azienda, termini, banca)
export async function GET() {
  try {
    const supabase = await createClient()

    // Carica info azienda
    const { data: companyInfo } = await supabase
      .from('company_info')
      .select('*')
      .eq('is_active', true)
      .limit(1)
      .single()

    // Carica termini attivi
    const { data: terms } = await supabase
      .from('quote_terms')
      .select('id, name, content, display_order')
      .eq('is_active', true)
      .order('display_order', { ascending: true })

    // Carica account bancario predefinito
    let bankAccount = null
    if (companyInfo?.default_bank_account_id) {
      const { data: bankData } = await supabase
        .from('bank_accounts')
        .select('id, account_name, iban, swift, bank_name, currency')
        .eq('id', companyInfo.default_bank_account_id)
        .single()
      
      bankAccount = bankData
    }

    return NextResponse.json({
      company: companyInfo,
      terms: terms || [],
      bankAccount
    })
  } catch (error: any) {
    console.error('Errore caricamento impostazioni:', error)
    return NextResponse.json(
      { error: 'Errore caricamento impostazioni' },
      { status: 500 }
    )
  }
}

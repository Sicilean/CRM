// @ts-nocheck
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { randomBytes, createHash } from 'crypto'

// Genera un token sicuro
function generateToken(): string {
  return randomBytes(32).toString('base64url')
}

// Hash semplice per password (in produzione usare bcrypt)
function hashPassword(password: string): string {
  return createHash('sha256').update(password).digest('hex')
}

// GET - Ottieni tutti i token per un preventivo
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    
    const { data: tokens, error } = await supabase
      .from('quote_public_tokens')
      .select('*')
      .eq('quote_id', params.id)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    
    // Non restituire password_hash
    const safeTokens = tokens?.map(t => ({
      ...t,
      password_hash: undefined,
      has_password: !!t.password_hash
    }))
    
    return NextResponse.json({ tokens: safeTokens || [] })
  } catch (error: any) {
    console.error('Errore GET tokens:', error)
    return NextResponse.json(
      { error: error.message || 'Errore interno' },
      { status: 500 }
    )
  }
}

// POST - Crea un nuovo token pubblico
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    
    const {
      expires_in_days,
      password,
      notes
    } = body
    
    // Verifica che il preventivo esista
    const { data: quote, error: quoteError } = await supabase
      .from('quotes')
      .select('id, quote_number')
      .eq('id', params.id)
      .single()
    
    if (quoteError || !quote) {
      return NextResponse.json(
        { error: 'Preventivo non trovato' },
        { status: 404 }
      )
    }
    
    // Calcola data di scadenza
    let expires_at: string | null = null
    if (expires_in_days && expires_in_days > 0) {
      const expDate = new Date()
      expDate.setDate(expDate.getDate() + expires_in_days)
      expires_at = expDate.toISOString()
    }
    
    // Hash password se fornita
    let password_hash: string | null = null
    let requires_password = false
    if (password && password.trim()) {
      password_hash = hashPassword(password.trim())
      requires_password = true
    }
    
    // Genera token
    const token = generateToken()
    
    // Ottieni utente corrente
    const { data: { user } } = await supabase.auth.getUser()
    
    // Inserisci token
    const { data: newToken, error: insertError } = await supabase
      .from('quote_public_tokens')
      .insert({
        quote_id: params.id,
        token,
        expires_at,
        password_hash,
        requires_password,
        notes: notes || null,
        created_by: user?.id || null
      })
      .select()
      .single()
    
    if (insertError) throw insertError
    
    // Costruisci URL pubblico
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const publicUrl = `${baseUrl}/preventivo/${token}`
    
    return NextResponse.json({
      success: true,
      token: {
        ...newToken,
        password_hash: undefined,
        has_password: requires_password
      },
      public_url: publicUrl
    })
  } catch (error: any) {
    console.error('Errore POST token:', error)
    return NextResponse.json(
      { error: error.message || 'Errore interno' },
      { status: 500 }
    )
  }
}

// DELETE - Disattiva/elimina un token
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const tokenId = searchParams.get('tokenId')
    
    if (!tokenId) {
      return NextResponse.json(
        { error: 'tokenId richiesto' },
        { status: 400 }
      )
    }
    
    // Disattiva il token invece di eliminarlo (per audit)
    const { error } = await supabase
      .from('quote_public_tokens')
      .update({ is_active: false })
      .eq('id', tokenId)
      .eq('quote_id', params.id)
    
    if (error) throw error
    
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Errore DELETE token:', error)
    return NextResponse.json(
      { error: error.message || 'Errore interno' },
      { status: 500 }
    )
  }
}

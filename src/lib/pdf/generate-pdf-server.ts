import { pdf } from '@react-pdf/renderer'
import { BrandStrategyPDF } from './brand-strategy-pdf'
import { createClient } from '@/lib/supabase/client'
import React from 'react'

interface GeneratePDFOptions {
  strategy: any
  brandName: string
  clientName: string
}

export async function generateBrandStrategyPDFServer(options: GeneratePDFOptions) {
  const { strategy, brandName, clientName } = options
  
  try {
    // Recupera informazioni aziendali Sicilean
    const supabase = createClient()
    const { data: companyInfo, error } = await supabase
      .from('company_info')
      .select('*')
      .single()

    if (error) {
      console.error('Errore recupero info aziendali:', error)
      throw new Error('Impossibile recuperare le informazioni aziendali')
    }

    // Genera PDF usando React.createElement
    const pdfDoc = pdf(
      React.createElement(BrandStrategyPDF, {
        strategy,
        brandName,
        clientName,
        companyInfo
      }) as any
    )

    // Converti in buffer per uso server-side
    const pdfBuffer = await pdfDoc.toBuffer()
    return pdfBuffer
  } catch (error) {
    console.error('Errore generazione PDF:', error)
    throw error
  }
}





















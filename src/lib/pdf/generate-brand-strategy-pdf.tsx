import { pdf } from '@react-pdf/renderer'
import { BrandStrategyPDF } from './brand-strategy-pdf'
import { createClient } from '@/lib/supabase/client'
import React from 'react'

interface GeneratePDFOptions {
  strategy: any
  brandName: string
  clientName: string
}

export async function generateBrandStrategyPDF(options: GeneratePDFOptions) {
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

    // Genera PDF usando React.createElement invece di JSX
    const pdfBlob = await pdf(
      React.createElement(BrandStrategyPDF, {
        strategy,
        brandName,
        clientName,
        companyInfo: companyInfo as any
      }) as any
    ).toBlob()

    return pdfBlob
  } catch (error) {
    console.error('Errore generazione PDF:', error)
    throw error
  }
}

export async function downloadBrandStrategyPDF(options: GeneratePDFOptions) {
  try {
    const pdfBlob = await generateBrandStrategyPDF(options)
    
    // Crea URL temporaneo per download
    const url = URL.createObjectURL(pdfBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${options.brandName.replace(/\s+/g, '_')}_BrandStrategy_${new Date().toISOString().split('T')[0]}.pdf`
    
    // Trigger download
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    // Cleanup
    URL.revokeObjectURL(url)
    
    return { success: true }
  } catch (error) {
    console.error('Errore download PDF:', error)
    return { success: false, error }
  }
}
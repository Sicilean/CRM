/**
 * Componente Header per PDF
 * Header aziendale con logo e dati
 */

import PDFDocument from 'pdfkit'
import { CompanyInfo } from '../../types/pdf-types'
import { sicileanTheme } from '../styles/theme'
import { drawHorizontalLine } from '../../utils/pdf-helpers'
import { formatVATNumber, formatFiscalCode, formatIBAN } from '../../utils/italian-formatter'

export interface HeaderOptions {
  companyInfo: CompanyInfo
  documentTitle: string
  documentNumber: string
  logoPath?: string
}

export function drawHeader(
  doc: typeof PDFDocument,
  x: number,
  y: number,
  width: number,
  options: HeaderOptions
): number {
  const { companyInfo, documentTitle, documentNumber, logoPath } = options
  const theme = sicileanTheme
  let currentY = y

  // Layout a due colonne
  const leftColumnWidth = width * 0.6
  const rightColumnWidth = width * 0.4
  const rightColumnX = x + leftColumnWidth

  // === COLONNA SINISTRA: Dati Aziendali ===
  
  // Logo se disponibile
  if (logoPath) {
    try {
      doc.image(logoPath, x, currentY, {
        width: 80,
        height: 40,
        fit: [80, 40],
      })
      currentY += 45
    } catch (error) {
      console.error('Errore caricamento logo:', error)
    }
  }

  // Nome azienda
  doc
    .font(theme.fonts.bold)
    .fontSize(theme.fonts.size.title)
    .fillColor(theme.colors.primary)
    .text(companyInfo.company_name, x, currentY, {
      width: leftColumnWidth,
    })
  currentY += theme.fonts.size.title + 5

  // Ragione sociale se diversa
  if (companyInfo.legal_name && companyInfo.legal_name !== companyInfo.company_name) {
    doc
      .font(theme.fonts.regular)
      .fontSize(theme.fonts.size.small)
      .fillColor(theme.colors.textLight)
      .text(companyInfo.legal_name, x, currentY, {
        width: leftColumnWidth,
      })
    currentY += theme.fonts.size.small + 3
  }

  // Dati fiscali
  const fiscalData: string[] = []
  if (companyInfo.vat_number) {
    fiscalData.push(`P.IVA: ${formatVATNumber(companyInfo.vat_number)}`)
  }
  if (companyInfo.fiscal_code) {
    fiscalData.push(`C.F.: ${formatFiscalCode(companyInfo.fiscal_code)}`)
  }
  if (fiscalData.length > 0) {
    doc
      .font(theme.fonts.regular)
      .fontSize(theme.fonts.size.small)
      .fillColor(theme.colors.text)
      .text(fiscalData.join(' | '), x, currentY, {
        width: leftColumnWidth,
      })
    currentY += theme.fonts.size.small + 3
  }

  // Indirizzo
  if (companyInfo.address) {
    const addressParts = [companyInfo.address]
    if (companyInfo.postal_code && companyInfo.city) {
      addressParts.push(
        `${companyInfo.postal_code} ${companyInfo.city}${
          companyInfo.province ? ` (${companyInfo.province})` : ''
        }`
      )
    }
    doc
      .font(theme.fonts.regular)
      .fontSize(theme.fonts.size.small)
      .fillColor(theme.colors.textLight)
      .text(addressParts.join(', '), x, currentY, {
        width: leftColumnWidth,
      })
    currentY += theme.fonts.size.small + 3
  }

  // Contatti
  const contacts: string[] = []
  if (companyInfo.phone) {
    contacts.push(`Tel: ${companyInfo.phone}`)
  }
  if (companyInfo.email) {
    contacts.push(companyInfo.email)
  }
  if (contacts.length > 0) {
    doc
      .font(theme.fonts.regular)
      .fontSize(theme.fonts.size.small)
      .fillColor(theme.colors.textLight)
      .text(contacts.join(' | '), x, currentY, {
        width: leftColumnWidth,
      })
    currentY += theme.fonts.size.small + 3
  }

  // PEC e SDI
  const electronicData: string[] = []
  if (companyInfo.pec) {
    electronicData.push(`PEC: ${companyInfo.pec}`)
  }
  if (companyInfo.sdi_code) {
    electronicData.push(`SDI: ${companyInfo.sdi_code}`)
  }
  if (electronicData.length > 0) {
    doc
      .font(theme.fonts.regular)
      .fontSize(theme.fonts.size.small)
      .fillColor(theme.colors.textLight)
      .text(electronicData.join(' | '), x, currentY, {
        width: leftColumnWidth,
      })
    currentY += theme.fonts.size.small + 3
  }

  // IBAN se presente
  if (companyInfo.bank_account?.iban) {
    doc
      .font(theme.fonts.regular)
      .fontSize(theme.fonts.size.tiny)
      .fillColor(theme.colors.textLight)
      .text(
        `IBAN: ${formatIBAN(companyInfo.bank_account.iban)} (${companyInfo.bank_account.account_name})`,
        x,
        currentY,
        {
          width: leftColumnWidth,
        }
      )
    currentY += theme.fonts.size.tiny + 3
  }

  // === COLONNA DESTRA: Titolo Documento ===
  const rightStartY = y

  // Titolo documento
  doc
    .font(theme.fonts.bold)
    .fontSize(28)
    .fillColor(theme.colors.secondary)
    .text(documentTitle, rightColumnX, rightStartY, {
      width: rightColumnWidth,
      align: 'right',
    })

  // Numero documento
  doc
    .font(theme.fonts.regular)
    .fontSize(theme.fonts.size.heading)
    .fillColor(theme.colors.textLight)
    .text(`N. ${documentNumber}`, rightColumnX, rightStartY + 35, {
      width: rightColumnWidth,
      align: 'right',
    })

  // Calcola l'altezza massima tra le due colonne
  const maxY = Math.max(currentY, rightStartY + 60)

  // Linea separatrice
  drawHorizontalLine(doc, x, maxY + theme.spacing.section, width, theme.colors.primary, 2)

  return maxY + theme.spacing.section + 10
}


/**
 * Componente Footer per PDF
 * Footer con informazioni legali e numero pagina
 */

import PDFDocument from 'pdfkit'
import { CompanyInfo } from '../../types/pdf-types'
import { sicileanTheme } from '../styles/theme'
import { drawHorizontalLine } from '../../utils/pdf-helpers'
import { generateComplianceFooter, generateGDPRDisclaimer } from '../../utils/legal-compliance'

export interface FooterOptions {
  companyInfo: CompanyInfo
  pageNumber: number
  totalPages: number
  documentType: 'quote' | 'invoice' | 'receipt'
  includeGDPR?: boolean
}

export function drawFooter(
  doc: typeof PDFDocument,
  x: number,
  y: number,
  width: number,
  options: FooterOptions
): void {
  const { companyInfo, pageNumber, totalPages, documentType, includeGDPR = true } = options
  const theme = sicileanTheme

  let currentY = y

  // Linea separatrice
  drawHorizontalLine(doc, x, currentY, width, theme.colors.border, 1)
  currentY += 10

  // Informazioni legali (solo sulla prima pagina o se specificato)
  if (pageNumber === 1 || companyInfo.footer_text) {
    const footerText = companyInfo.footer_text || generateComplianceFooter(companyInfo, documentType)
    
    doc
      .font(theme.fonts.regular)
      .fontSize(theme.fonts.size.tiny)
      .fillColor(theme.colors.textLight)
      .text(footerText, x, currentY, {
        width: width * 0.85,
        align: 'left',
        lineGap: 2,
      })
    
    const textHeight = doc.heightOfString(footerText, {
      width: width * 0.85,
    })
    
    // GDPR disclaimer
    if (includeGDPR && pageNumber === 1) {
      currentY += textHeight + 8
      doc
        .font(theme.fonts.italic)
        .fontSize(theme.fonts.size.tiny)
        .fillColor(theme.colors.textLight)
        .text(generateGDPRDisclaimer(), x, currentY, {
          width: width * 0.85,
          align: 'left',
          lineGap: 2,
        })
    }
  }

  // Numero di pagina (sempre in basso a destra)
  const pageText = `Pagina ${pageNumber} di ${totalPages}`
  const pageY = doc.page.height - theme.spacing.page.bottom + 15
  
  doc
    .font(theme.fonts.regular)
    .fontSize(theme.fonts.size.tiny)
    .fillColor(theme.colors.textLight)
    .text(pageText, x, pageY, {
      width: width,
      align: 'right',
    })

  // Website in basso a sinistra
  if (companyInfo.website) {
    doc
      .font(theme.fonts.regular)
      .fontSize(theme.fonts.size.tiny)
      .fillColor(theme.colors.textLight)
      .text(companyInfo.website, x, pageY, {
        width: width,
        align: 'left',
        link: companyInfo.website,
      })
  }
}


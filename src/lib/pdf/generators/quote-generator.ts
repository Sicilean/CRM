/**
 * Generatore PDF per Preventivi
 * Generazione professionale di preventivi con PDFKit
 */

import { BasePDFGenerator, BaseGeneratorOptions } from './base-generator'
import { QuoteData, QuoteTerm } from '../types/pdf-types'
import { sicileanTheme } from '../templates/styles/theme'
import { drawHeader } from '../templates/components/header'
import { drawClientInfo } from '../templates/components/client-info'
import { drawServicesTable } from '../templates/components/services-table'
import { drawTotals } from '../templates/components/totals'
import { drawBox, drawHorizontalLine } from '../utils/pdf-helpers'
import { formatDate, formatDateLong, splitLines } from '../utils/italian-formatter'
import { validateCompanyInfo, validateClientInfo } from '../utils/legal-compliance'

export interface QuoteGeneratorOptions extends BaseGeneratorOptions {
  quote: QuoteData
  terms?: QuoteTerm[]
  logoPath?: string
  includeSignatures?: boolean
}

export class QuoteGenerator extends BasePDFGenerator {
  private quoteOptions: QuoteGeneratorOptions

  constructor(options: QuoteGeneratorOptions) {
    super({
      companyInfo: options.companyInfo,
      documentType: 'quote',
      includeGDPR: options.includeGDPR,
    })
    this.quoteOptions = options
  }

  /**
   * Valida i dati prima della generazione
   */
  private validate(): void {
    const companyErrors = validateCompanyInfo(this.options.companyInfo)
    const clientErrors = validateClientInfo(this.quoteOptions.quote.client)

    // Log warnings
    const warnings = [...companyErrors, ...clientErrors].filter(e => e.severity === 'warning')
    if (warnings.length > 0) {
      console.warn('⚠️ Validazione PDF - Avvisi:', warnings)
    }

    // Errori bloccanti
    const errors = [...companyErrors, ...clientErrors].filter(e => e.severity === 'error')
    if (errors.length > 0) {
      throw new Error(
        `Errori validazione dati PDF: ${errors.map(e => e.message).join(', ')}`
      )
    }
  }

  /**
   * Render del contenuto del preventivo
   */
  protected async renderContent(): Promise<void> {
    // Valida dati
    this.validate()

    const theme = sicileanTheme
    const contentArea = this.getContentArea()
    const { quote, logoPath, terms = [], includeSignatures = true } = this.quoteOptions

    let currentY = contentArea.y

    // === HEADER ===
    currentY = drawHeader(this.doc, contentArea.x, currentY, contentArea.width, {
      companyInfo: this.options.companyInfo,
      documentTitle: 'PREVENTIVO',
      documentNumber: quote.quote_number,
      logoPath,
    })

    // === METADATA (Data, Validità, etc.) ===
    currentY = this.renderMetadata(currentY, contentArea)

    // === CONDIZIONI DI PAGAMENTO ===
    if (quote.payment_terms) {
      currentY = this.renderPaymentTerms(currentY, contentArea)
    }

    // === INFORMAZIONI CLIENTE ===
    currentY = drawClientInfo(this.doc, contentArea.x, currentY, contentArea.width, {
      client: quote.client,
      title: 'DESTINATARIO',
    })

    // === TABELLA SERVIZI ===
    currentY = drawServicesTable(this.doc, contentArea.x, currentY, contentArea.width, {
      services: quote.services,
      showUnitPrices: true,
      showQuantities: true,
    })

    // === TOTALI ===
    currentY = drawTotals(this.doc, contentArea.x, currentY, contentArea.width, {
      subtotal: quote.subtotal,
      discountPercentage: quote.discount_percentage,
      discountAmount: quote.discount_amount,
      taxPercentage: quote.tax_percentage,
      taxAmount: quote.tax_amount,
      totalAmount: quote.total_amount,
    })

    // === NOTE ===
    if (quote.notes) {
      currentY = this.renderNotes(currentY, contentArea)
    }

    // === TERMINI E CONDIZIONI ===
    if (terms.length > 0) {
      currentY = this.renderTerms(currentY, contentArea, terms)
    }

    // === FIRME ===
    if (includeSignatures) {
      currentY = this.renderSignatures(currentY, contentArea)
    }
  }

  /**
   * Render sezione metadata
   */
  private renderMetadata(currentY: number, contentArea: ReturnType<typeof this.getContentArea>): number {
    const { quote } = this.quoteOptions
    const theme = sicileanTheme

    // Layout a due colonne
    const leftWidth = contentArea.width * 0.5
    const rightWidth = contentArea.width * 0.5
    const rightX = contentArea.x + leftWidth

    this.doc
      .font(theme.fonts.regular)
      .fontSize(theme.fonts.size.small)
      .fillColor(theme.colors.textLight)

    // Colonna sinistra
    this.doc.text(`Data emissione: ${formatDate(quote.created_at)}`, contentArea.x, currentY, {
      width: leftWidth,
      align: 'left',
    })

    // Colonna destra
    if (quote.valid_until) {
      const validityText = `Valido fino al: ${formatDate(quote.valid_until)}${
        quote.validity_days ? ` (${quote.validity_days} giorni)` : ''
      }`
      this.doc.text(validityText, rightX, currentY, {
        width: rightWidth,
        align: 'right',
      })
    }

    return currentY + theme.fonts.size.small + theme.spacing.section
  }

  /**
   * Render condizioni di pagamento
   */
  private renderPaymentTerms(
    currentY: number,
    contentArea: ReturnType<typeof this.getContentArea>
  ): number {
    const { quote } = this.quoteOptions
    const theme = sicileanTheme

    if (!quote.payment_terms) return currentY

    // Verifica spazio
    currentY = this.addPageIfNeeded(60, currentY)

    // Box con sfondo
    const padding = 12
    const textHeight = this.doc.heightOfString(quote.payment_terms, {
      width: contentArea.width - padding * 2,
    })
    const boxHeight = textHeight + padding * 2 + theme.fonts.size.body + 10

    drawBox(this.doc, contentArea.x, currentY, contentArea.width, boxHeight, {
      fillColor: '#f1f5f9',
      strokeColor: theme.colors.primary,
      lineWidth: 2,
    })

    // Titolo
    this.doc
      .font(theme.fonts.bold)
      .fontSize(theme.fonts.size.body)
      .fillColor(theme.colors.text)
      .text('Condizioni di Pagamento', contentArea.x + padding, currentY + padding, {
        width: contentArea.width - padding * 2,
      })

    // Contenuto
    this.doc
      .font(theme.fonts.regular)
      .fontSize(theme.fonts.size.small)
      .fillColor(theme.colors.text)
      .text(
        quote.payment_terms,
        contentArea.x + padding,
        currentY + padding + theme.fonts.size.body + 6,
        {
          width: contentArea.width - padding * 2,
          lineGap: 2,
        }
      )

    return currentY + boxHeight + theme.spacing.section
  }

  /**
   * Render note
   */
  private renderNotes(currentY: number, contentArea: ReturnType<typeof this.getContentArea>): number {
    const { quote } = this.quoteOptions
    const theme = sicileanTheme

    if (!quote.notes) return currentY

    // Verifica spazio
    currentY = this.addPageIfNeeded(60, currentY)

    // Box con sfondo giallo
    const padding = 12
    const textHeight = this.doc.heightOfString(quote.notes, {
      width: contentArea.width - padding * 2,
    })
    const boxHeight = textHeight + padding * 2 + theme.fonts.size.body + 10

    drawBox(this.doc, contentArea.x, currentY, contentArea.width, boxHeight, {
      fillColor: '#fef9c3',
      strokeColor: '#eab308',
      lineWidth: 3,
    })

    // Titolo
    this.doc
      .font(theme.fonts.bold)
      .fontSize(theme.fonts.size.body)
      .fillColor('#854d0e')
      .text('Note', contentArea.x + padding, currentY + padding, {
        width: contentArea.width - padding * 2,
      })

    // Contenuto
    this.doc
      .font(theme.fonts.regular)
      .fontSize(theme.fonts.size.small)
      .fillColor('#713f12')
      .text(quote.notes, contentArea.x + padding, currentY + padding + theme.fonts.size.body + 6, {
        width: contentArea.width - padding * 2,
        lineGap: 2,
      })

    return currentY + boxHeight + theme.spacing.section
  }

  /**
   * Render termini e condizioni
   */
  private renderTerms(
    currentY: number,
    contentArea: ReturnType<typeof this.getContentArea>,
    terms: QuoteTerm[]
  ): number {
    const theme = sicileanTheme

    // Verifica spazio per titolo
    currentY = this.addPageIfNeeded(40, currentY)

    // Linea separatrice
    drawHorizontalLine(this.doc, contentArea.x, currentY, contentArea.width, theme.colors.border, 1)
    currentY += 15

    // Titolo sezione
    this.doc
      .font(theme.fonts.bold)
      .fontSize(theme.fonts.size.heading)
      .fillColor(theme.colors.primary)
      .text('TERMINI E CONDIZIONI', contentArea.x, currentY)
    currentY += theme.fonts.size.heading + theme.spacing.section

    // Ordina termini
    const sortedTerms = [...terms].sort((a, b) => (a.order || 0) - (b.order || 0))

    sortedTerms.forEach((term, index) => {
      // Calcola altezza necessaria
      const titleHeight = theme.fonts.size.body + 5
      const contentHeight = this.doc.heightOfString(term.content, {
        width: contentArea.width,
      })
      const termHeight = titleHeight + contentHeight + 15

      // Aggiungi pagina se necessario
      currentY = this.addPageIfNeeded(termHeight, currentY)

      // Titolo termine
      this.doc
        .font(theme.fonts.bold)
        .fontSize(theme.fonts.size.body)
        .fillColor(theme.colors.text)
        .text(`${index + 1}. ${term.name}`, contentArea.x, currentY)
      currentY += titleHeight

      // Contenuto termine
      this.doc
        .font(theme.fonts.regular)
        .fontSize(theme.fonts.size.small)
        .fillColor(theme.colors.textLight)
        .text(term.content, contentArea.x + 15, currentY, {
          width: contentArea.width - 15,
          lineGap: 2,
        })
      currentY += contentHeight + 15
    })

    return currentY + theme.spacing.section
  }

  /**
   * Render sezione firme
   */
  private renderSignatures(
    currentY: number,
    contentArea: ReturnType<typeof this.getContentArea>
  ): number {
    const theme = sicileanTheme
    const signatureHeight = 100

    // Verifica spazio
    currentY = this.addPageIfNeeded(signatureHeight + 40, currentY)

    // Spazio extra
    currentY += theme.spacing.section

    // Layout a due colonne
    const boxWidth = (contentArea.width - 20) / 2
    const leftX = contentArea.x
    const rightX = contentArea.x + boxWidth + 20

    // Box firma cliente
    drawBox(this.doc, leftX, currentY, boxWidth, signatureHeight, {
      strokeColor: theme.colors.border,
      lineWidth: 1,
      cornerRadius: 4,
    })

    this.doc
      .font(theme.fonts.bold)
      .fontSize(theme.fonts.size.body)
      .fillColor(theme.colors.textLight)
      .text('Per accettazione Cliente', leftX + 10, currentY + 10, {
        width: boxWidth - 20,
        align: 'left',
      })

    // Linea firma
    drawHorizontalLine(
      this.doc,
      leftX + 10,
      currentY + signatureHeight - 25,
      boxWidth - 20,
      theme.colors.textLight,
      1
    )

    this.doc
      .font(theme.fonts.regular)
      .fontSize(theme.fonts.size.tiny)
      .fillColor(theme.colors.textLight)
      .text('Firma e timbro', leftX + 10, currentY + signatureHeight - 18, {
        width: boxWidth - 20,
        align: 'center',
      })

    // Box firma azienda
    drawBox(this.doc, rightX, currentY, boxWidth, signatureHeight, {
      strokeColor: theme.colors.border,
      lineWidth: 1,
      cornerRadius: 4,
    })

    this.doc
      .font(theme.fonts.bold)
      .fontSize(theme.fonts.size.body)
      .fillColor(theme.colors.textLight)
      .text(`Per ${this.options.companyInfo.company_name}`, rightX + 10, currentY + 10, {
        width: boxWidth - 20,
        align: 'left',
      })

    // Linea firma
    drawHorizontalLine(
      this.doc,
      rightX + 10,
      currentY + signatureHeight - 25,
      boxWidth - 20,
      theme.colors.textLight,
      1
    )

    this.doc
      .font(theme.fonts.regular)
      .fontSize(theme.fonts.size.tiny)
      .fillColor(theme.colors.textLight)
      .text('Firma autorizzata', rightX + 10, currentY + signatureHeight - 18, {
        width: boxWidth - 20,
        align: 'center',
      })

    return currentY + signatureHeight + theme.spacing.section
  }
}


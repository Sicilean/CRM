/**
 * Generatore PDF Base
 * Classe base per tutti i generatori PDF
 */

import PDFDocument from 'pdfkit'
import { Readable } from 'stream'
import { sicileanTheme, A4_PAGE } from '../templates/styles/theme'
import { drawFooter } from '../templates/components/footer'
import { CompanyInfo } from '../types/pdf-types'

export interface BaseGeneratorOptions {
  companyInfo: CompanyInfo
  documentType: 'quote' | 'invoice' | 'receipt'
  includeGDPR?: boolean
}

export abstract class BasePDFGenerator {
  protected doc: typeof PDFDocument
  protected options: BaseGeneratorOptions
  protected currentPage: number = 1
  protected totalPages: number = 1

  constructor(options: BaseGeneratorOptions) {
    this.options = options
    this.doc = new PDFDocument({
      size: 'A4',
      margins: {
        top: sicileanTheme.spacing.page.top,
        right: sicileanTheme.spacing.page.right,
        bottom: sicileanTheme.spacing.page.bottom,
        left: sicileanTheme.spacing.page.left,
      },
      bufferPages: true,
      autoFirstPage: true,
    }) as any
  }

  /**
   * Metodo astratto da implementare nelle classi derivate
   */
  protected abstract renderContent(): Promise<void>

  /**
   * Genera il PDF e ritorna un Buffer
   */
  public async generate(): Promise<Buffer> {
    return new Promise<Buffer>(async (resolve, reject) => {
      try {
        const chunks: Buffer[] = []

        this.doc.on('data', (chunk: Buffer) => chunks.push(chunk))
        this.doc.on('end', () => resolve(Buffer.concat(chunks)))
        this.doc.on('error', reject)

        // Render del contenuto
        await this.renderContent()

        // Conta le pagine totali
        const range = this.doc.bufferedPageRange()
        this.totalPages = range.count

        // Aggiungi footer a tutte le pagine
        for (let i = 0; i < this.totalPages; i++) {
          this.doc.switchToPage(i)
          this.addFooter(i + 1)
        }

        // Finalizza il documento
        this.doc.end()
      } catch (error) {
        console.error('Errore generazione PDF:', error)
        reject(error)
      }
    })
  }

  /**
   * Genera il PDF e ritorna uno Stream
   */
  public async generateStream(): Promise<Readable> {
    await this.renderContent()

    // Conta le pagine totali
    const range = this.doc.bufferedPageRange()
    this.totalPages = range.count

    // Aggiungi footer a tutte le pagine
    for (let i = 0; i < this.totalPages; i++) {
      this.doc.switchToPage(i)
      this.addFooter(i + 1)
    }

    // Finalizza
    this.doc.end()

    return this.doc as unknown as Readable
  }

  /**
   * Aggiungi footer alla pagina
   */
  protected addFooter(pageNumber: number): void {
    const theme = sicileanTheme
    const footerY = A4_PAGE.height - theme.spacing.page.bottom - 40

    drawFooter(
      this.doc,
      theme.spacing.page.left,
      footerY,
      A4_PAGE.width - theme.spacing.page.left - theme.spacing.page.right,
      {
        companyInfo: this.options.companyInfo,
        pageNumber,
        totalPages: this.totalPages,
        documentType: this.options.documentType,
        includeGDPR: this.options.includeGDPR,
      }
    )
  }

  /**
   * Helper: ottieni dimensioni area di contenuto
   */
  protected getContentArea(): {
    x: number
    y: number
    width: number
    height: number
  } {
    const theme = sicileanTheme
    return {
      x: theme.spacing.page.left,
      y: theme.spacing.page.top,
      width: A4_PAGE.width - theme.spacing.page.left - theme.spacing.page.right,
      height: A4_PAGE.height - theme.spacing.page.top - theme.spacing.page.bottom - 60, // -60 per footer
    }
  }

  /**
   * Helper: verifica se serve una nuova pagina
   */
  protected needsNewPage(requiredHeight: number, currentY: number): boolean {
    const contentArea = this.getContentArea()
    const maxY = contentArea.y + contentArea.height
    return currentY + requiredHeight > maxY
  }

  /**
   * Helper: aggiungi nuova pagina
   */
  protected addPage(): number {
    this.doc.addPage()
    this.currentPage++
    return this.getContentArea().y
  }

  /**
   * Helper: aggiungi pagina se necessario
   */
  protected addPageIfNeeded(requiredHeight: number, currentY: number): number {
    if (this.needsNewPage(requiredHeight, currentY)) {
      return this.addPage()
    }
    return currentY
  }
}


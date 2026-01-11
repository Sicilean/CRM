/**
 * Generatore PDF per Proposte Progettuali
 * Genera PDF professionali in stile "Proposta Progettuale" con 6 pagine:
 * 1. Copertina
 * 2. Visione d'insieme + Obiettivi
 * 3. Timeline progettuale
 * 4. Attività e Budget
 * 5. Il Team per il successo
 * 6. Accettazione e Termini
 * 
 * ⚠️ TODO URGENTE - FONT CUSTOM:
 * Al momento usa SOLO font standard PDFKit (Helvetica, Helvetica-Bold).
 * 
 * PER IMPLEMENTARE FONT RICHIESTI (Poppins, Work Sans, Roboto Mono):
 * 1. Scarica .ttf da Google Fonts:
 *    - Poppins (Bold, Regular)
 *    - Work Sans (Regular, Bold)
 *    - Roboto Mono (Regular)
 * 
 * 2. Salva in: /public/fonts/
 *    - Poppins-Bold.ttf
 *    - Poppins-Regular.ttf
 *    - WorkSans-Regular.ttf
 *    - WorkSans-Bold.ttf
 *    - RobotoMono-Regular.ttf
 * 
 * 3. Nel constructor(), PRIMA di renderContent():
 *    this.doc.registerFont('Poppins-Bold', process.cwd() + '/public/fonts/Poppins-Bold.ttf')
 *    this.doc.registerFont('Poppins', process.cwd() + '/public/fonts/Poppins-Regular.ttf')
 *    this.doc.registerFont('WorkSans', process.cwd() + '/public/fonts/WorkSans-Regular.ttf')
 *    this.doc.registerFont('WorkSans-Bold', process.cwd() + '/public/fonts/WorkSans-Bold.ttf')
 *    this.doc.registerFont('RobotoMono', process.cwd() + '/public/fonts/RobotoMono-Regular.ttf')
 * 
 * 4. Sostituisci nei metodi render:
 *    - 'Helvetica-Bold' → 'Poppins-Bold' (titoli copertina)
 *    - 'Helvetica' → 'Poppins' (sottotitolo copertina thin)
 *    - 'Helvetica' per numeri → 'RobotoMono' (codici, prezzi)
 *    - 'Helvetica' per testo → 'WorkSans' (paragrafi, descrizioni)
 *    - 'Helvetica-Bold' per headings → 'WorkSans-Bold'
 */

import { BasePDFGenerator, BaseGeneratorOptions } from './base-generator'
import { QuoteData, QuoteTerm, TeamMember, TimelinePhase } from '../types/pdf-types'
import { drawBox, drawHorizontalLine } from '../utils/pdf-helpers'
import { formatCurrency, formatDate } from '../utils/italian-formatter'
import PDFDocument from 'pdfkit'

export interface ProjectProposalGeneratorOptions extends BaseGeneratorOptions {
  quote: QuoteData
  terms?: QuoteTerm[]
  logoPath?: string
  teamMembers?: TeamMember[]
}

export class ProjectProposalGenerator extends BasePDFGenerator {
  protected options: ProjectProposalGeneratorOptions

  constructor(options: ProjectProposalGeneratorOptions) {
    super({
      companyInfo: options.companyInfo,
      documentType: 'project_proposal',
      includeGDPR: options.includeGDPR,
    })
    this.options = options
    
    // Registra font custom se disponibili
    this.registerCustomFonts()
  }
  
  /**
   * Registra font custom (Poppins, Work Sans, Roboto Mono)
   * Se i file non esistono, usa font standard PDFKit come fallback
   */
  private registerCustomFonts(): void {
    const fontsPath = process.cwd() + '/public/fonts'
    
    try {
      // Poppins per titoli
      this.doc.registerFont('Poppins-Bold', fontsPath + '/Poppins-Bold.ttf')
      this.doc.registerFont('Poppins', fontsPath + '/Poppins-Regular.ttf')
      
      // Work Sans per testo corpo
      this.doc.registerFont('WorkSans', fontsPath + '/WorkSans-Regular.ttf')
      this.doc.registerFont('WorkSans-Bold', fontsPath + '/WorkSans-Bold.ttf')
      
      // Roboto Mono per numeri/codici
      this.doc.registerFont('RobotoMono', fontsPath + '/RobotoMono-Regular.ttf')
      
      console.log('✅ Font custom caricati: Poppins, Work Sans, Roboto Mono')
    } catch (error) {
      console.warn('⚠️  Font custom non trovati, uso font standard PDFKit')
      console.warn('   Esegui: node scripts/download-fonts.js')
    }
  }
  
  /**
   * Helper: Ottieni font con fallback a Helvetica se custom non disponibile
   */
  private getFont(type: 'title-bold' | 'title-regular' | 'body' | 'body-bold' | 'mono'): string {
    const fontMap = {
      'title-bold': 'Poppins-Bold',
      'title-regular': 'Poppins',
      'body': 'WorkSans',
      'body-bold': 'WorkSans-Bold',
      'mono': 'RobotoMono'
    }
    
    const fallbackMap = {
      'title-bold': 'Helvetica-Bold',
      'title-regular': 'Helvetica',
      'body': 'Helvetica',
      'body-bold': 'Helvetica-Bold',
      'mono': 'Helvetica'
    }
    
    try {
      // Prova a usare il font custom
      this.doc.font(fontMap[type])
      return fontMap[type]
    } catch {
      // Fallback a Helvetica
      return fallbackMap[type]
    }
  }

  /**
   * Render del contenuto della proposta progettuale
   */
  protected async renderContent(): Promise<void> {
    const { quote, logoPath, terms = [], teamMembers = [] } = this.options

    // Setup header/footer handler (eccetto prima pagina)
    this.doc.on('pageAdded', () => {
      if (this.doc.bufferedPageRange().count > 1) {
        this.renderPageHeaderFooter()
      }
    })

    // Pagina 1: Copertina
    this.renderCoverPage(quote, logoPath)

    // Pagina 2: Visione d'insieme + Obiettivi
    if (quote.vision_summary || quote.objectives) {
      this.doc.addPage()
      this.renderVisionAndObjectives(quote)
    }

    // Pagina 3: Timeline progettuale
    if (quote.timeline && quote.timeline.length > 0) {
      this.doc.addPage()
      this.renderTimeline(quote.timeline)
    }

    // Pagina 4: Attività e Budget
    this.doc.addPage()
    this.renderBudgetPage(quote)

    // Pagina 5: Il Team per il successo
    if (teamMembers && teamMembers.length > 0) {
      this.doc.addPage()
      this.renderTeamPage(teamMembers)
    }

    // Pagina 6: Accettazione e Termini
    this.doc.addPage()
    this.renderTermsAndAcceptance(quote, terms)
  }
  
  /**
   * Header e Footer per tutte le pagine (eccetto copertina)
   */
  private renderPageHeaderFooter(): void {
    const pageWidth = this.doc.page.width
    const pageHeight = this.doc.page.height
    
    // HEADER: Logo piccolo in alto a destra
    const logoPath = this.options.logoPath || process.cwd() + '/public/logo.png'
    try {
      this.doc.image(logoPath, pageWidth - 80, 30, { width: 50 })
    } catch (e) {
      // Logo non disponibile, usa testo
      this.doc
        .font(this.getFont('body-bold'))
        .fontSize(10)
        .fillColor('#000000')
        .text('Sicilean', pageWidth - 80, 35, { width: 50, align: 'right' })
    }
    
    // FOOTER: Info Sicilean + numero pagina
    const footerY = pageHeight - 50
    const { companyInfo } = this.options
    
    this.doc
      .font(this.getFont('body'))
      .fontSize(8)
      .fillColor('#666666')
      .text(
        `${companyInfo.company_name} | ${companyInfo.address || ''}, ${companyInfo.city || ''} (${companyInfo.province || ''}) | P.IVA ${companyInfo.vat_number || ''} | ${companyInfo.pec || ''}`,
        50,
        footerY,
        {
          width: pageWidth - 100,
          align: 'center',
          lineGap: 1
        }
      )
    
    // Numero pagina
    const pageNumber = this.doc.bufferedPageRange().count
    this.doc
      .font(this.getFont('mono'))
      .fontSize(9)
      .fillColor('#999999')
      .text(
        `${pageNumber}`,
        0,
        footerY + 20,
        {
          width: pageWidth,
          align: 'center'
        }
      )
  }

  /**
   * PAGINA 1: Copertina PULITA (sfondo bianco, layout professionale)
   */
  private renderCoverPage(quote: QuoteData, logoPath?: string): void {
    const pageWidth = this.doc.page.width
    const pageHeight = this.doc.page.height

    // LOGO + SCRITTA in alto a sinistra
    const logoImgPath = process.cwd() + '/public/logo.png'
    const logoTextPath = process.cwd() + '/public/logo-text-white.png' // Nota: va convertito in PNG

    try {
      // Logo simbolo
      this.doc.image(logoImgPath, 50, 50, { width: 60 })
      // Scritta Sicilean (se PNG disponibile)
      try {
        this.doc.image(logoTextPath, 120, 55, { width: 120 })
      } catch {
        // Fallback: testo
        this.doc
          .font(this.getFont('title-bold'))
          .fontSize(20)
          .fillColor('#000000')
          .text('Sicilean', 120, 60)
      }
    } catch (e) {
      // Fallback completo: solo testo
      this.doc
        .font(this.getFont('title-bold'))
        .fontSize(24)
        .fillColor('#000000')
        .text('SICILEAN', 50, 60)
    }

    // Linea separatore sotto header
    drawHorizontalLine(this.doc, 50, 120, pageWidth - 100, '#CCCCCC', 1)

    // Titolo "Proposta progettuale" - centro pagina (NERO su bianco, professionale)
    const centerY = pageHeight / 2 - 80

    this.doc
      .font(this.getFont('title-bold'))
      .fontSize(42)
      .fillColor('#000000')
      .text('Proposta Progettuale', 50, centerY, {
        width: pageWidth - 100,
        align: 'center',
      })

    // Codice preventivo (RobotoMono)
    this.doc
      .font(this.getFont('mono'))
      .fontSize(12)
      .fillColor('#666666')
      .text(`N. ${quote.quote_number}`, 50, centerY + 60, {
        width: pageWidth - 100,
        align: 'center',
      })

    // Data
    this.doc
      .font(this.getFont('body'))
      .fontSize(11)
      .fillColor('#666666')
      .text(formatDate(quote.created_at), 50, centerY + 80, {
        width: pageWidth - 100,
        align: 'center',
      })

    // Nome progetto (se presente)
    if (quote.project_name) {
      this.doc
        .font(this.getFont('body-bold'))
        .fontSize(16)
        .fillColor('#000000')
        .text(quote.project_name, 50, centerY + 110, {
          width: pageWidth - 100,
          align: 'center',
        })
    }

    // Cliente info - PULITO (no box)
    const clientY = pageHeight - 280

    this.doc
      .font(this.getFont('body'))
      .fontSize(10)
      .fillColor('#999999')
      .text('PROPOSTA RISERVATA A:', 50, clientY, {
        width: pageWidth - 100,
        align: 'center',
      })

    this.doc
      .font(this.getFont('body-bold'))
      .fontSize(16)
      .fillColor('#000000')
      .text(
        quote.client.client_company || quote.client.client_name,
        50,
        clientY + 25,
        {
          width: pageWidth - 100,
          align: 'center',
        }
      )

    // Indirizzo
    if (quote.client.client_address) {
      this.doc
        .font(this.getFont('body'))
        .fontSize(10)
        .fillColor('#666666')
        .text(quote.client.client_address, 50, clientY + 50, {
          width: pageWidth - 100,
          align: 'center',
        })
    }

    // P.IVA/C.F.
    let fiscalInfo = ''
    if (quote.client.client_vat_number) {
      fiscalInfo += `P.IVA ${quote.client.client_vat_number}`
    } else if (quote.client.client_fiscal_code) {
      fiscalInfo += `C.F. ${quote.client.client_fiscal_code}`
    }

    if (fiscalInfo) {
      this.doc
        .font(this.getFont('mono'))
        .fontSize(9)
        .fillColor('#666666')
        .text(fiscalInfo, 50, clientY + 70, {
          width: pageWidth - 100,
          align: 'center',
        })
    }

    // Linea separatore fondo
    drawHorizontalLine(this.doc, 50, pageHeight - 100, pageWidth - 100, '#CCCCCC', 1)
  }

  /**
   * Footer copertina con info Sicilean
   */
  private renderCoverFooter(pageHeight: number): void {
    const footerY = pageHeight - 40
    const pageWidth = this.doc.page.width
    const { companyInfo } = this.options

    this.doc
      .font(this.getFont('body'))
      .fontSize(8)
      .fillColor('#666666')
      .text(
        `${companyInfo.company_name} | ${companyInfo.address || ''} | ${companyInfo.vat_number || ''} | ${companyInfo.email || ''}`,
        50,
        footerY,
        {
          width: pageWidth - 100,
          align: 'center',
        }
      )
  }

  /**
   * PAGINA 2: Visione d'insieme + Obiettivi
   */
  private renderVisionAndObjectives(quote: QuoteData): void {
    const contentArea = this.getContentArea()
    let currentY = contentArea.y

    // Header pagina con logo piccolo
    currentY = this.renderPageHeader(currentY, '01 Visione d\'insieme')

    // Sezione Visione
    if (quote.vision_summary) {
      // Icona + Titolo
      this.doc
        .font(this.getFont('body-bold'))
        .fontSize(24)
        .fillColor('#0a090f')
        .text('💡 Visione d\'insieme', contentArea.x, currentY)

      currentY += 40

      // Contenuto visione
      this.doc
        .font(this.getFont('body'))
        .fontSize(11)
        .fillColor('#333333')
        .text(quote.vision_summary, contentArea.x, currentY, {
          width: contentArea.width,
          lineGap: 4,
        })

      const textHeight = this.doc.heightOfString(quote.vision_summary, {
        width: contentArea.width,
      })
      currentY += textHeight + 40
    }

    // Sezione Obiettivi
    if (quote.objectives) {
      this.doc
        .font(this.getFont('body-bold'))
        .fontSize(24)
        .fillColor('#0a090f')
        .text('🎯 Obiettivi smart', contentArea.x, currentY)

      currentY += 40

      // Contenuto obiettivi (supporta sia testo libero che lista)
      this.doc
        .font(this.getFont('body'))
        .fontSize(11)
        .fillColor('#333333')
        .text(quote.objectives, contentArea.x + 20, currentY, {
          width: contentArea.width - 20,
          lineGap: 4,
        })
    }
  }

  /**
   * PAGINA 3: Timeline progettuale
   */
  private renderTimeline(timeline: TimelinePhase[]): void {
    const contentArea = this.getContentArea()
    let currentY = contentArea.y

    // Header pagina
    currentY = this.renderPageHeader(currentY, '03 Timeline progettuale')

    // Timeline verticale
    timeline.forEach((phase, index) => {
      // Verifica spazio
      currentY = this.addPageIfNeeded(120, currentY)

      // Box fase
      const boxHeight = 100
      const boxWidth = contentArea.width

      drawBox(this.doc, contentArea.x, currentY, boxWidth, boxHeight, {
        fillColor: index % 2 === 0 ? '#f8f9fa' : '#ffffff',
        strokeColor: '#e0e0e0',
        lineWidth: 1,
      })

      // Numero fase
      this.doc
        .font(this.getFont('body-bold'))
        .fontSize(20)
        .fillColor('#0a090f')
        .text(`0${index + 1}`, contentArea.x + 15, currentY + 15)

      // Titolo fase
      this.doc
        .font(this.getFont('body-bold'))
        .fontSize(14)
        .fillColor('#0a090f')
        .text(phase.phase.toUpperCase(), contentArea.x + 15, currentY + 45, {
          width: boxWidth - 30,
        })

      // Descrizione
      this.doc
        .font(this.getFont('body'))
        .fontSize(10)
        .fillColor('#666666')
        .text(phase.description, contentArea.x + 15, currentY + 65, {
          width: boxWidth - 30,
        })

      // Durata
      this.doc
        .font(this.getFont('body-bold'))
        .fontSize(9)
        .fillColor('#999999')
        .text(`AVVIO - DURATA`, contentArea.x + 15, currentY + boxHeight - 25)

      this.doc
        .font(this.getFont('body'))
        .fontSize(9)
        .fillColor('#666666')
        .text(phase.duration, contentArea.x + 15, currentY + boxHeight - 15)

      currentY += boxHeight + 15
    })
  }

  /**
   * PAGINA 4: Attività e Budget
   */
  private renderBudgetPage(quote: QuoteData): void {
    const contentArea = this.getContentArea()
    let currentY = contentArea.y

    // Header pagina
    currentY = this.renderPageHeader(currentY, '04 Attività iniziali e Budget')

    // Tabella servizi
    currentY = this.renderServicesTable(quote.services, currentY, contentArea)

    // Totale finale in evidenza
    currentY += 20
    const totalBoxHeight = 60
    const totalBoxY = contentArea.y + contentArea.height - totalBoxHeight - 20

    drawBox(
      this.doc,
      contentArea.x,
      totalBoxY,
      contentArea.width,
      totalBoxHeight,
      {
        fillColor: '#0a090f',
      }
    )

    this.doc
      .font(this.getFont('body-bold'))
      .fontSize(14)
      .fillColor('#FFFFFF')
      .text('INVESTIMENTO TOTALE:', contentArea.x + 20, totalBoxY + 15)

    this.doc
      .font(this.getFont('body-bold'))
      .fontSize(24)
      .fillColor('#00CED1')
      .text(
        formatCurrency(quote.total_amount),
        contentArea.x + 20,
        totalBoxY + 35
      )

    this.doc
      .font(this.getFont('body'))
      .fontSize(10)
      .fillColor('#CCCCCC')
      .text('+ IVA', contentArea.x + 20 + 150, totalBoxY + 42)

    // Condizioni di pagamento (se presenti)
    if (quote.payment_terms) {
      this.doc
        .font(this.getFont('body'))
        .fontSize(9)
        .fillColor('#FFFFFF')
        .text(
          `Pagamento: ${quote.payment_terms}`,
          contentArea.x + contentArea.width - 200,
          totalBoxY + 25,
          {
            width: 180,
            align: 'right',
          }
        )
    }
  }

  /**
   * Tabella servizi semplificata
   */
  private renderServicesTable(
    services: any[],
    startY: number,
    contentArea: ReturnType<typeof this.getContentArea>
  ): number {
    let currentY = startY

    // Header tabella
    this.doc
      .font(this.getFont('body-bold'))
      .fontSize(10)
      .fillColor('#666666')
      .text('ATTIVITÀ', contentArea.x, currentY, { width: 250 })
      .text('TEMPISTICHE', contentArea.x + 260, currentY, { width: 100 })
      .text('PREZZO', contentArea.x + 370, currentY, {
        width: 100,
        align: 'right',
      })

    currentY += 25

    // Linea separatrice
    drawHorizontalLine(
      this.doc,
      contentArea.x,
      currentY,
      contentArea.width,
      '#e0e0e0',
      1
    )
    currentY += 10

    // Servizi
    services.forEach((service, index) => {
      currentY = this.addPageIfNeeded(50, currentY)

      // Nome servizio
      this.doc
        .font(this.getFont('body-bold'))
        .fontSize(11)
        .fillColor('#0a090f')
        .text(service.service_name || service.name || 'Servizio', contentArea.x, currentY, {
          width: 250,
        })

      // Durata
      const duration = service.duration || service.durata || '-'
      this.doc
        .font(this.getFont('body'))
        .fontSize(10)
        .fillColor('#666666')
        .text(duration, contentArea.x + 260, currentY, { width: 100 })

      // Prezzo
      const price = service.unit_price * service.quantity
      this.doc
        .font(this.getFont('body-bold'))
        .fontSize(11)
        .fillColor('#0a090f')
        .text(formatCurrency(price), contentArea.x + 370, currentY, {
          width: 100,
          align: 'right',
        })

      currentY += 20

      // Descrizione (se presente)
      if (service.description) {
        this.doc
          .font(this.getFont('body'))
          .fontSize(9)
          .fillColor('#666666')
          .text(service.description, contentArea.x, currentY, {
            width: 350,
          })

        const descHeight = this.doc.heightOfString(service.description, {
          width: 350,
        })
        currentY += descHeight + 15
      } else {
        currentY += 10
      }

      // Linea separatrice
      if (index < services.length - 1) {
        drawHorizontalLine(
          this.doc,
          contentArea.x,
          currentY,
          contentArea.width,
          '#f0f0f0',
          1
        )
        currentY += 10
      }
    })

    return currentY
  }

  /**
   * PAGINA 5: Il Team per il successo
   */
  private renderTeamPage(teamMembers: TeamMember[]): void {
    const contentArea = this.getContentArea()
    let currentY = contentArea.y

    // Header pagina
    currentY = this.renderPageHeader(currentY, '06 Il Team per il successo')

    // Intro
    this.doc
      .font(this.getFont('body'))
      .fontSize(11)
      .fillColor('#666666')
      .text(
        'Il progetto sarà seguito da un Team multidisciplinare con competenze verticali e trasversali nei settori del branding, dello sviluppo digitale e della comunicazione.',
        contentArea.x,
        currentY,
        {
          width: contentArea.width,
          lineGap: 3,
        }
      )

    currentY += 60

    // Griglia 2 colonne
    const colWidth = (contentArea.width - 30) / 2
    const rowHeight = 180
    let col = 0
    let row = 0

    teamMembers.forEach((member, index) => {
      const x = contentArea.x + col * (colWidth + 30)
      const y = currentY + row * (rowHeight + 20)

      // Verifica spazio
      if (y + rowHeight > contentArea.y + contentArea.height - 50) {
        this.doc.addPage()
        currentY = this.getContentArea().y
        row = 0
        col = 0
      }

      this.renderTeamMemberCard(member, x, y, colWidth, rowHeight)

      col++
      if (col >= 2) {
        col = 0
        row++
      }
    })
  }

  /**
   * Card singolo membro del team
   */
  private renderTeamMemberCard(
    member: TeamMember,
    x: number,
    y: number,
    width: number,
    height: number
  ): void {
    // Box card
    drawBox(this.doc, x, y, width, height, {
      fillColor: '#f8f9fa',
      strokeColor: '#e0e0e0',
      lineWidth: 1,
    })

    // Foto profilo (se disponibile - placeholder circolare)
    if (member.foto_profilo) {
      // TODO: Implementare rendering immagine circolare
      // Per ora placeholder
      this.doc.circle(x + 20, y + 30, 25).stroke('#cccccc')
    } else {
      // Placeholder iniziali
      const initials = `${member.nome?.charAt(0) || ''}${member.cognome?.charAt(0) || ''}`
      this.doc
        .circle(x + 20, y + 30, 25)
        .fill('#00CED1')
        .fillColor('#FFFFFF')
        .font(this.getFont('body-bold'))
        .fontSize(14)
        .text(initials, x + 10, y + 23, { width: 20, align: 'center' })
    }

    // Nome e Cognome
    const fullName = `${member.nome || ''} ${member.cognome || ''}`.trim()
    this.doc
      .fillColor('#0a090f')
      .font(this.getFont('body-bold'))
      .fontSize(14)
      .text(fullName, x + 60, y + 20, { width: width - 70 })

    // Ruolo
    if (member.professione) {
      this.doc
        .fillColor('#00CED1')
        .font(this.getFont('body'))
        .fontSize(10)
        .text(member.professione.toUpperCase(), x + 60, y + 40, {
          width: width - 70,
        })
    }

    // Bio
    if (member.bio) {
      this.doc
        .fillColor('#666666')
        .font(this.getFont('body'))
        .fontSize(9)
        .text(member.bio, x + 15, y + 70, {
          width: width - 30,
          lineGap: 2,
        })
    }
  }

  /**
   * PAGINA 6: Accettazione e Termini
   */
  private renderTermsAndAcceptance(quote: QuoteData, terms: QuoteTerm[]): void {
    const contentArea = this.getContentArea()
    let currentY = contentArea.y

    // Header pagina
    currentY = this.renderPageHeader(currentY, '07 Accettazione e termini')

    // Layout 2 colonne per info aziendali
    const colWidth = (contentArea.width - 30) / 2

    // Box Sicilean (sinistra)
    this.renderCompanyBox(contentArea.x, currentY, colWidth, 120)

    // Box Cliente (destra)
    this.renderClientBox(
      contentArea.x + colWidth + 30,
      currentY,
      colWidth,
      120,
      quote.client
    )

    currentY += 140

    // Termini e Condizioni
    if (terms.length > 0) {
      this.doc
        .font(this.getFont('body-bold'))
        .fontSize(14)
        .fillColor('#0a090f')
        .text('TERMINI E CONDIZIONI', contentArea.x, currentY)

      currentY += 25

      terms.forEach((term, index) => {
        currentY = this.addPageIfNeeded(60, currentY)

        this.doc
          .font(this.getFont('body-bold'))
          .fontSize(10)
          .fillColor('#0a090f')
          .text(`${index + 1}. ${term.name}`, contentArea.x, currentY)

        currentY += 15

        this.doc
          .font(this.getFont('body'))
          .fontSize(9)
          .fillColor('#666666')
          .text(term.content, contentArea.x + 15, currentY, {
            width: contentArea.width - 15,
            lineGap: 2,
          })

        const termHeight = this.doc.heightOfString(term.content, {
          width: contentArea.width - 15,
        })
        currentY += termHeight + 15
      })
    }

    // Firme in fondo
    currentY = this.addPageIfNeeded(100, currentY)
    this.renderSignatureBoxes(contentArea.x, currentY, contentArea.width)
  }

  /**
   * Box info Sicilean
   */
  private renderCompanyBox(
    x: number,
    y: number,
    width: number,
    height: number
  ): void {
    const { companyInfo } = this.options

    drawBox(this.doc, x, y, width, height, {
      strokeColor: '#e0e0e0',
      lineWidth: 1,
    })

    this.doc
      .font(this.getFont('body-bold'))
      .fontSize(12)
      .fillColor('#0a090f')
      .text('Sicilean', x + 15, y + 15)

    this.doc
      .font(this.getFont('body'))
      .fontSize(9)
      .fillColor('#666666')
      .text(
        `${companyInfo.address || ''}
${companyInfo.postal_code || ''} ${companyInfo.city || ''} (${companyInfo.province || ''})
C.f. e P.IVA ${companyInfo.vat_number || ''}
PEC ${companyInfo.pec || ''}`,
        x + 15,
        y + 35,
        { lineGap: 2 }
      )
  }

  /**
   * Box info Cliente
   */
  private renderClientBox(
    x: number,
    y: number,
    width: number,
    height: number,
    client: any
  ): void {
    drawBox(this.doc, x, y, width, height, {
      strokeColor: '#e0e0e0',
      lineWidth: 1,
    })

    this.doc
      .font(this.getFont('body-bold'))
      .fontSize(12)
      .fillColor('#0a090f')
      .text('Il Partner', x + 15, y + 15)

    const clientName = client.client_company || client.client_name
    const clientAddress = client.client_address || ''
    const clientVat = client.client_vat_number || client.client_fiscal_code || ''
    const clientEmail = client.client_email || ''

    this.doc
      .font(this.getFont('body'))
      .fontSize(9)
      .fillColor('#666666')
      .text(
        `${clientName}
${clientAddress}
P.IVA/C.F. ${clientVat}
PEC ${clientEmail}`,
        x + 15,
        y + 35,
        { lineGap: 2 }
      )
  }

  /**
   * Box firme
   */
  private renderSignatureBoxes(x: number, y: number, width: number): void {
    const boxWidth = (width - 30) / 2
    const boxHeight = 80

    // Firma Sicilean
    drawBox(this.doc, x, y, boxWidth, boxHeight, {
      strokeColor: '#e0e0e0',
      lineWidth: 1,
    })

    this.doc
      .font(this.getFont('body'))
      .fontSize(9)
      .fillColor('#666666')
      .text('Sicilean', x + 15, y + 15)

    drawHorizontalLine(this.doc, x + 15, y + boxHeight - 25, boxWidth - 30, '#cccccc', 1)

    this.doc
      .fontSize(8)
      .text('FIRMA E TIMBRO O FIRMA DIGITALE', x + 15, y + boxHeight - 15, {
        width: boxWidth - 30,
        align: 'center',
      })

    // Firma Cliente
    drawBox(this.doc, x + boxWidth + 30, y, boxWidth, boxHeight, {
      strokeColor: '#e0e0e0',
      lineWidth: 1,
    })

    this.doc
      .font(this.getFont('body'))
      .fontSize(9)
      .fillColor('#666666')
      .text('Il Partner', x + boxWidth + 45, y + 15)

    drawHorizontalLine(
      this.doc,
      x + boxWidth + 45,
      y + boxHeight - 25,
      boxWidth - 30,
      '#cccccc',
      1
    )

    this.doc
      .fontSize(8)
      .text('NOME, COGNOME E RUOLO', x + boxWidth + 45, y + boxHeight - 15, {
        width: boxWidth - 30,
        align: 'center',
      })
  }

  /**
   * Header pagina con logo piccolo e titolo
   */
  private renderPageHeader(currentY: number, title: string): number {
    const contentArea = this.getContentArea()

    // Logo piccolo (se disponibile)
    // TODO: Aggiungere logo small

    // Titolo sezione
    this.doc
      .font(this.getFont('body-bold'))
      .fontSize(18)
      .fillColor('#0a090f')
      .text(title, contentArea.x, currentY)

    // Linea decorativa
    drawHorizontalLine(
      this.doc,
      contentArea.x,
      currentY + 30,
      100,
      '#00CED1',
      3
    )

    return currentY + 50
  }
}


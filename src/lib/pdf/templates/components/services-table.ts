/**
 * Componente Services Table per PDF
 * Tabella professionale dei servizi/prodotti
 */

import PDFDocument from 'pdfkit'
import { QuoteService } from '../../types/pdf-types'
import { sicileanTheme } from '../styles/theme'
import { drawBox, addPageIfNeeded } from '../../utils/pdf-helpers'
import { formatCurrency, formatNumber } from '../../utils/italian-formatter'

export interface ServicesTableOptions {
  services: QuoteService[]
  showUnitPrices?: boolean
  showQuantities?: boolean
}

const ROW_HEIGHT = 40
const HEADER_HEIGHT = 35
const PADDING = 8

export function drawServicesTable(
  doc: typeof PDFDocument,
  x: number,
  y: number,
  width: number,
  options: ServicesTableOptions
): number {
  const { services, showUnitPrices = true, showQuantities = true } = options
  const theme = sicileanTheme
  let currentY = y

  // Definisci larghezze colonne
  const colWidths = {
    description: showUnitPrices && showQuantities ? width * 0.35 : width * 0.5,
    quantity: showQuantities ? width * 0.08 : 0,
    duration: width * 0.12, // Nuova colonna durata
    unitPrice: showUnitPrices ? width * 0.18 : 0,
    total: width * 0.22,
  }

  // Normalizza larghezze
  const totalWidth = Object.values(colWidths).reduce((sum, w) => sum + w, 0)
  if (totalWidth !== width) {
    const factor = width / totalWidth
    Object.keys(colWidths).forEach(key => {
      colWidths[key as keyof typeof colWidths] *= factor
    })
  }

  // === HEADER ===
  currentY = addPageIfNeeded(
    doc,
    HEADER_HEIGHT,
    currentY,
    theme.spacing.page.bottom,
    theme.spacing.page.top
  )

  // Background header
  drawBox(doc, x, currentY, width, HEADER_HEIGHT, {
    fillColor: theme.colors.primary,
    strokeColor: theme.colors.primary,
  })

  // Testi header
  let colX = x
  doc.font(theme.fonts.bold).fontSize(theme.fonts.size.body).fillColor('#ffffff')

  doc.text('DESCRIZIONE', colX + PADDING, currentY + PADDING, {
    width: colWidths.description - PADDING * 2,
    align: 'left',
  })
  colX += colWidths.description

  if (showQuantities) {
    doc.text('Q.TÀ', colX + PADDING, currentY + PADDING, {
      width: colWidths.quantity - PADDING * 2,
      align: 'center',
    })
    colX += colWidths.quantity
  }

  // Colonna Durata
  doc.text('DURATA', colX + PADDING, currentY + PADDING, {
    width: colWidths.duration - PADDING * 2,
    align: 'center',
  })
  colX += colWidths.duration

  if (showUnitPrices) {
    doc.text('PREZZO UNIT.', colX + PADDING, currentY + PADDING, {
      width: colWidths.unitPrice - PADDING * 2,
      align: 'right',
    })
    colX += colWidths.unitPrice
  }

  doc.text('TOTALE', colX + PADDING, currentY + PADDING, {
    width: colWidths.total - PADDING * 2,
    align: 'right',
  })

  currentY += HEADER_HEIGHT

  // === RIGHE SERVIZI ===
  services.forEach((service, index) => {
    // Calcola altezza necessaria per la riga
    const descriptionHeight = doc.heightOfString(
      service.service_name + (service.description ? `\n${service.description}` : ''),
      { width: colWidths.description - PADDING * 2 }
    )
    const notesHeight = service.notes
      ? doc.heightOfString(service.notes, {
          width: colWidths.description - PADDING * 2,
        })
      : 0
    const rowHeight = Math.max(ROW_HEIGHT, descriptionHeight + notesHeight + PADDING * 3)

    // Aggiungi pagina se necessario
    currentY = addPageIfNeeded(
      doc,
      rowHeight,
      currentY,
      theme.spacing.page.bottom,
      theme.spacing.page.top
    )

    // Background riga alternata
    if (index % 2 === 1) {
      drawBox(doc, x, currentY, width, rowHeight, {
        fillColor: '#f8fafc',
        strokeColor: theme.colors.border,
        lineWidth: 0.5,
      })
    } else {
      drawBox(doc, x, currentY, width, rowHeight, {
        strokeColor: theme.colors.border,
        lineWidth: 0.5,
      })
    }

    // Contenuto cella
    let colX = x
    let textY = currentY + PADDING

    // Descrizione
    doc.font(theme.fonts.bold).fontSize(theme.fonts.size.body).fillColor(theme.colors.text)

    doc.text(service.service_name, colX + PADDING, textY, {
      width: colWidths.description - PADDING * 2,
      align: 'left',
    })
    textY += doc.heightOfString(service.service_name, {
      width: colWidths.description - PADDING * 2,
    })

    // Descrizione dettagliata
    if (service.description) {
      doc.font(theme.fonts.regular).fontSize(theme.fonts.size.small).fillColor(theme.colors.textLight)

      doc.text(service.description, colX + PADDING, textY + 2, {
        width: colWidths.description - PADDING * 2,
        align: 'left',
        lineGap: 1,
      })
      textY += doc.heightOfString(service.description, {
        width: colWidths.description - PADDING * 2,
      })
    }

    // Note (se presenti)
    if (service.notes) {
      doc
        .font(theme.fonts.italic)
        .fontSize(theme.fonts.size.tiny)
        .fillColor(theme.colors.textLight)

      doc.text(`Nota: ${service.notes}`, colX + PADDING, textY + 4, {
        width: colWidths.description - PADDING * 2,
        align: 'left',
      })
    }

    colX += colWidths.description

    // Quantità
    if (showQuantities) {
      doc.font(theme.fonts.regular).fontSize(theme.fonts.size.body).fillColor(theme.colors.text)

      doc.text(formatNumber(service.quantity, 0), colX + PADDING, currentY + PADDING, {
        width: colWidths.quantity - PADDING * 2,
        align: 'center',
      })
      colX += colWidths.quantity
    }

    // Durata
    doc.font(theme.fonts.regular).fontSize(theme.fonts.size.small).fillColor(theme.colors.text)
    doc.text(service.duration || '-', colX + PADDING, currentY + PADDING, {
      width: colWidths.duration - PADDING * 2,
      align: 'center',
    })
    colX += colWidths.duration

    // Prezzo unitario
    if (showUnitPrices) {
      doc.font(theme.fonts.regular).fontSize(theme.fonts.size.body).fillColor(theme.colors.text)

      doc.text(formatCurrency(service.unit_price), colX + PADDING, currentY + PADDING, {
        width: colWidths.unitPrice - PADDING * 2,
        align: 'right',
      })
      colX += colWidths.unitPrice
    }

    // Totale
    const totalAmount = service.quantity * service.unit_price
    doc.font(theme.fonts.bold).fontSize(theme.fonts.size.body).fillColor(theme.colors.text)

    doc.text(formatCurrency(totalAmount), colX + PADDING, currentY + PADDING, {
      width: colWidths.total - PADDING * 2,
      align: 'right',
    })

    currentY += rowHeight
  })

  return currentY + theme.spacing.section
}


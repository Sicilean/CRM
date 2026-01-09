/**
 * Componente Totals per PDF
 * Sezione riepilogo totali con calcoli IVA
 */

import PDFDocument from 'pdfkit'
import { sicileanTheme } from '../styles/theme'
import { drawBox } from '../../utils/pdf-helpers'
import { formatCurrency } from '../../utils/italian-formatter'

export interface TotalsOptions {
  subtotal: number
  discountPercentage?: number
  discountAmount?: number
  taxPercentage: number
  taxAmount: number
  totalAmount: number
}

const ROW_HEIGHT = 25
const PADDING = 10

export function drawTotals(
  doc: typeof PDFDocument,
  x: number,
  y: number,
  width: number,
  options: TotalsOptions
): number {
  const {
    subtotal,
    discountPercentage = 0,
    discountAmount = 0,
    taxPercentage,
    taxAmount,
    totalAmount,
  } = options
  const theme = sicileanTheme

  // Larghezza sezione totali (allineata a destra)
  const totalsWidth = Math.min(width * 0.4, 250)
  const totalsX = x + width - totalsWidth

  let currentY = y

  // === SUBTOTALE ===
  drawTotalRow(
    doc,
    totalsX,
    currentY,
    totalsWidth,
    'Subtotale:',
    formatCurrency(subtotal),
    false
  )
  currentY += ROW_HEIGHT

  // === SCONTO (se presente) ===
  if (discountAmount > 0) {
    const discountLabel = discountPercentage > 0 
      ? `Sconto (${discountPercentage}%):`
      : 'Sconto:'
    
    drawTotalRow(
      doc,
      totalsX,
      currentY,
      totalsWidth,
      discountLabel,
      `- ${formatCurrency(discountAmount)}`,
      false
    )
    currentY += ROW_HEIGHT
  }

  // === IMPONIBILE ===
  const taxableAmount = subtotal - discountAmount
  drawTotalRow(
    doc,
    totalsX,
    currentY,
    totalsWidth,
    'Imponibile:',
    formatCurrency(taxableAmount),
    false
  )
  currentY += ROW_HEIGHT

  // === IVA ===
  drawTotalRow(
    doc,
    totalsX,
    currentY,
    totalsWidth,
    `IVA (${taxPercentage}%):`,
    formatCurrency(taxAmount),
    false
  )
  currentY += ROW_HEIGHT

  // Spazio prima del totale
  currentY += 5

  // === TOTALE FINALE ===
  drawTotalRow(
    doc,
    totalsX,
    currentY,
    totalsWidth,
    'TOTALE:',
    formatCurrency(totalAmount),
    true,
    theme.colors.primary
  )
  currentY += ROW_HEIGHT + 5

  return currentY + theme.spacing.section
}

/**
 * Disegna una riga di totale
 */
function drawTotalRow(
  doc: typeof PDFDocument,
  x: number,
  y: number,
  width: number,
  label: string,
  value: string,
  isFinal: boolean = false,
  backgroundColor?: string
): void {
  const theme = sicileanTheme
  const labelWidth = width * 0.6
  const valueWidth = width * 0.4

  // Background per il totale finale
  if (isFinal) {
    drawBox(doc, x, y, width, ROW_HEIGHT, {
      fillColor: backgroundColor || '#f1f5f9',
      strokeColor: theme.colors.border,
      lineWidth: 1,
    })
  }

  // Label
  doc
    .font(isFinal ? theme.fonts.bold : theme.fonts.regular)
    .fontSize(isFinal ? theme.fonts.size.heading : theme.fonts.size.body)
    .fillColor(theme.colors.text)
    .text(label, x + PADDING, y + (ROW_HEIGHT - theme.fonts.size.body) / 2, {
      width: labelWidth - PADDING,
      align: 'left',
    })

  // Value
  doc
    .font(theme.fonts.bold)
    .fontSize(isFinal ? theme.fonts.size.heading : theme.fonts.size.body)
    .fillColor(theme.colors.text)
    .text(value, x + labelWidth, y + (ROW_HEIGHT - theme.fonts.size.body) / 2, {
      width: valueWidth - PADDING,
      align: 'right',
    })
}


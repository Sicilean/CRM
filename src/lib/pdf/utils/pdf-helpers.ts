/**
 * Helper generici per la generazione di PDF
 */

import PDFDocument from 'pdfkit'

/**
 * Calcola l'altezza di un testo con word wrap
 */
export function calculateTextHeight(
  doc: typeof PDFDocument,
  text: string,
  width: number,
  options?: any
): number {
  return doc.heightOfString(text, { width, ...options })
}

/**
 * Disegna una linea orizzontale
 */
export function drawHorizontalLine(
  doc: typeof PDFDocument,
  x: number,
  y: number,
  width: number,
  color: string = '#e2e8f0',
  lineWidth: number = 1
): void {
  doc
    .strokeColor(color)
    .lineWidth(lineWidth)
    .moveTo(x, y)
    .lineTo(x + width, y)
    .stroke()
}

/**
 * Disegna una linea verticale
 */
export function drawVerticalLine(
  doc: typeof PDFDocument,
  x: number,
  y: number,
  height: number,
  color: string = '#e2e8f0',
  lineWidth: number = 1
): void {
  doc
    .strokeColor(color)
    .lineWidth(lineWidth)
    .moveTo(x, y)
    .lineTo(x, y + height)
    .stroke()
}

/**
 * Disegna un rettangolo con bordo
 */
export function drawBox(
  doc: typeof PDFDocument,
  x: number,
  y: number,
  width: number,
  height: number,
  options: {
    fillColor?: string
    strokeColor?: string
    lineWidth?: number
    cornerRadius?: number
  } = {}
): void {
  const {
    fillColor,
    strokeColor = '#e2e8f0',
    lineWidth = 1,
    cornerRadius = 0,
  } = options

  doc.lineWidth(lineWidth).strokeColor(strokeColor)

  if (fillColor) {
    doc.fillColor(fillColor)
  }

  if (cornerRadius > 0) {
    doc.roundedRect(x, y, width, height, cornerRadius)
  } else {
    doc.rect(x, y, width, height)
  }

  if (fillColor && strokeColor) {
    doc.fillAndStroke()
  } else if (fillColor) {
    doc.fill()
  } else {
    doc.stroke()
  }
}

/**
 * Disegna una cella di tabella
 */
export function drawTableCell(
  doc: typeof PDFDocument,
  text: string,
  x: number,
  y: number,
  width: number,
  height: number,
  options: {
    align?: 'left' | 'center' | 'right'
    valign?: 'top' | 'center' | 'bottom'
    fontSize?: number
    textColor?: string
    backgroundColor?: string
    borderColor?: string
    padding?: number
    bold?: boolean
  } = {}
): void {
  const {
    align = 'left',
    valign = 'center',
    fontSize = 10,
    textColor = '#1e293b',
    backgroundColor,
    borderColor = '#e2e8f0',
    padding = 5,
    bold = false,
  } = options

  // Disegna sfondo se specificato
  if (backgroundColor) {
    drawBox(doc, x, y, width, height, {
      fillColor: backgroundColor,
      strokeColor: borderColor,
    })
  } else {
    drawBox(doc, x, y, width, height, {
      strokeColor: borderColor,
    })
  }

  // Calcola posizione testo
  const textWidth = width - padding * 2
  const textHeight = doc.heightOfString(text, { width: textWidth })

  let textX = x + padding
  let textY = y + padding

  // Allineamento orizzontale
  if (align === 'center') {
    textX = x + width / 2
  } else if (align === 'right') {
    textX = x + width - padding
  }

  // Allineamento verticale
  if (valign === 'center') {
    textY = y + (height - textHeight) / 2
  } else if (valign === 'bottom') {
    textY = y + height - textHeight - padding
  }

  // Disegna testo
  doc
    .font(bold ? 'Helvetica-Bold' : 'Helvetica')
    .fontSize(fontSize)
    .fillColor(textColor)
    .text(text, textX, textY, {
      width: textWidth,
      align,
    })
}

/**
 * Verifica se c'è spazio sufficiente nella pagina
 */
export function hasSpaceInPage(
  doc: typeof PDFDocument,
  requiredHeight: number,
  currentY: number,
  bottomMargin: number
): boolean {
  return currentY + requiredHeight < doc.page.height - bottomMargin
}

/**
 * Aggiunge una nuova pagina se necessario
 */
export function addPageIfNeeded(
  doc: typeof PDFDocument,
  requiredHeight: number,
  currentY: number,
  bottomMargin: number,
  topMargin: number
): number {
  if (!hasSpaceInPage(doc, requiredHeight, currentY, bottomMargin)) {
    doc.addPage()
    return topMargin
  }
  return currentY
}

/**
 * Colore hex to RGB
 */
export function hexToRgb(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
    : [0, 0, 0]
}

/**
 * Aggiunge un watermark
 */
export function addWatermark(
  doc: typeof PDFDocument,
  text: string,
  options: {
    opacity?: number
    fontSize?: number
    color?: string
    rotation?: number
  } = {}
): void {
  const {
    opacity = 0.1,
    fontSize = 60,
    color = '#94a3b8',
    rotation = -45,
  } = options

  const centerX = doc.page.width / 2
  const centerY = doc.page.height / 2

  doc.save()
  doc
    .opacity(opacity)
    .fontSize(fontSize)
    .fillColor(color)
    .rotate(rotation, { origin: [centerX, centerY] })
    .text(text, 0, centerY, {
      align: 'center',
      width: doc.page.width,
    })
  doc.restore()
}

/**
 * Formatta un numero di pagina
 */
export function formatPageNumber(current: number, total: number): string {
  return `Pagina ${current} di ${total}`
}


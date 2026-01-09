/**
 * Tema e stili per i PDF
 * Conforme alle linee guida del brand Sicilean
 */

import { PDFTheme } from '../../types/pdf-types'

export const sicileanTheme: PDFTheme = {
  colors: {
    primary: '#3b82f6',      // Blue principale
    secondary: '#1e293b',    // Slate scuro
    text: '#1e293b',         // Testo principale
    textLight: '#64748b',    // Testo secondario
    background: '#ffffff',   // Sfondo
    border: '#e2e8f0',      // Bordi
    accent: '#eab308',      // Accent giallo
  },
  fonts: {
    regular: 'Helvetica',
    bold: 'Helvetica-Bold',
    italic: 'Helvetica-Oblique',
    size: {
      title: 24,
      heading: 14,
      body: 10,
      small: 9,
      tiny: 8,
    },
  },
  spacing: {
    page: {
      top: 50,
      right: 50,
      bottom: 50,
      left: 50,
    },
    section: 20,
    line: 5,
  },
}

/**
 * Colori per stati e tipologie
 */
export const statusColors = {
  draft: '#94a3b8',
  sent: '#3b82f6',
  accepted: '#22c55e',
  declined: '#ef4444',
  expired: '#f97316',
}

/**
 * Margini standard per A4
 */
export const A4_PAGE = {
  width: 595.28,  // 210mm in punti
  height: 841.89, // 297mm in punti
}

/**
 * Helper per calcolare le posizioni
 */
export const getContentWidth = (theme: PDFTheme): number => {
  return A4_PAGE.width - theme.spacing.page.left - theme.spacing.page.right
}

export const getContentHeight = (theme: PDFTheme): number => {
  return A4_PAGE.height - theme.spacing.page.top - theme.spacing.page.bottom
}


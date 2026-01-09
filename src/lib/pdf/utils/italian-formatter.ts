/**
 * Formattazione dati secondo standard italiani
 */

/**
 * Formatta un importo in Euro
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

/**
 * Formatta una data in formato italiano
 */
export function formatDate(date: string | Date, includeTime = false): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  
  if (includeTime) {
    return new Intl.DateTimeFormat('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(dateObj)
  }
  
  return new Intl.DateTimeFormat('it-IT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(dateObj)
}

/**
 * Formatta una data in formato esteso
 */
export function formatDateLong(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  
  return new Intl.DateTimeFormat('it-IT', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(dateObj)
}

/**
 * Formatta una percentuale
 */
export function formatPercentage(value: number, decimals = 0): string {
  return new Intl.NumberFormat('it-IT', {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value / 100)
}

/**
 * Formatta un numero generico
 */
export function formatNumber(value: number, decimals = 2): string {
  return new Intl.NumberFormat('it-IT', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value)
}

/**
 * Formatta un numero di telefono italiano
 */
export function formatPhoneNumber(phone: string): string {
  // Rimuovi spazi e caratteri non numerici tranne il +
  const cleaned = phone.replace(/[^\d+]/g, '')
  
  // Se inizia con +39 (Italia)
  if (cleaned.startsWith('+39')) {
    const number = cleaned.substring(3)
    if (number.length === 10) {
      return `+39 ${number.substring(0, 3)} ${number.substring(3, 6)} ${number.substring(6)}`
    }
  }
  
  return phone
}

/**
 * Formatta una Partita IVA italiana
 */
export function formatVATNumber(vat: string): string {
  const cleaned = vat.replace(/\s/g, '')
  
  // P.IVA italiana: 11 cifre
  if (/^\d{11}$/.test(cleaned)) {
    return `${cleaned.substring(0, 4)} ${cleaned.substring(4, 8)} ${cleaned.substring(8)}`
  }
  
  return vat
}

/**
 * Formatta un Codice Fiscale italiano
 */
export function formatFiscalCode(code: string): string {
  const cleaned = code.replace(/\s/g, '').toUpperCase()
  
  // CF italiano: 16 caratteri alfanumerici
  if (/^[A-Z0-9]{16}$/.test(cleaned)) {
    return `${cleaned.substring(0, 6)} ${cleaned.substring(6, 11)} ${cleaned.substring(11)}`
  }
  
  return code.toUpperCase()
}

/**
 * Formatta un IBAN
 */
export function formatIBAN(iban: string): string {
  const cleaned = iban.replace(/\s/g, '').toUpperCase()
  
  // Formatta in blocchi di 4 caratteri
  return cleaned.match(/.{1,4}/g)?.join(' ') || iban
}

/**
 * Tronca un testo aggiungendo ellipsis se necessario
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength - 3) + '...'
}

/**
 * Capitalizza la prima lettera di ogni parola
 */
export function capitalizeWords(text: string): string {
  return text
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

/**
 * Converti newline in array di stringhe per PDF
 */
export function splitLines(text: string, maxWidth: number = 80): string[] {
  // Split per newline esistenti
  const paragraphs = text.split('\n')
  const lines: string[] = []
  
  paragraphs.forEach(paragraph => {
    if (paragraph.length <= maxWidth) {
      lines.push(paragraph)
    } else {
      // Spezza la riga se troppo lunga
      const words = paragraph.split(' ')
      let currentLine = ''
      
      words.forEach(word => {
        if ((currentLine + word).length <= maxWidth) {
          currentLine += (currentLine ? ' ' : '') + word
        } else {
          if (currentLine) lines.push(currentLine)
          currentLine = word
        }
      })
      
      if (currentLine) lines.push(currentLine)
    }
  })
  
  return lines
}


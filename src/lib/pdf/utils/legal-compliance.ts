/**
 * Validazione e conformità normativa italiana
 * per documenti fiscali e commerciali
 */

import { CompanyInfo, ClientInfo } from '../types/pdf-types'

/**
 * Errori di validazione
 */
export interface ValidationError {
  field: string
  message: string
  severity: 'error' | 'warning'
}

/**
 * Valida i dati aziendali per conformità italiana
 */
export function validateCompanyInfo(info: CompanyInfo): ValidationError[] {
  const errors: ValidationError[] = []

  // Campi obbligatori
  if (!info.company_name) {
    errors.push({
      field: 'company_name',
      message: 'Ragione sociale obbligatoria',
      severity: 'error',
    })
  }

  if (!info.vat_number && !info.fiscal_code) {
    errors.push({
      field: 'vat_number',
      message: 'P.IVA o Codice Fiscale obbligatorio',
      severity: 'error',
    })
  }

  // Validazione P.IVA
  if (info.vat_number && !validateItalianVAT(info.vat_number)) {
    errors.push({
      field: 'vat_number',
      message: 'Partita IVA non valida (deve essere 11 cifre)',
      severity: 'warning',
    })
  }

  // Validazione Codice Fiscale
  if (info.fiscal_code && !validateItalianFiscalCode(info.fiscal_code)) {
    errors.push({
      field: 'fiscal_code',
      message: 'Codice Fiscale non valido (deve essere 16 caratteri alfanumerici)',
      severity: 'warning',
    })
  }

  // Validazione indirizzo
  if (!info.address || !info.city || !info.postal_code) {
    errors.push({
      field: 'address',
      message: 'Indirizzo completo consigliato (via, CAP, città)',
      severity: 'warning',
    })
  }

  // Validazione contatti
  if (!info.email && !info.pec) {
    errors.push({
      field: 'email',
      message: 'Email o PEC consigliata',
      severity: 'warning',
    })
  }

  return errors
}

/**
 * Valida i dati del cliente
 */
export function validateClientInfo(info: ClientInfo): ValidationError[] {
  const errors: ValidationError[] = []

  // Nome obbligatorio
  if (!info.client_name && !info.client_company) {
    errors.push({
      field: 'client_name',
      message: 'Nome cliente o ragione sociale obbligatorio',
      severity: 'error',
    })
  }

  // Se è un'azienda, validare dati fiscali
  if (info.client_company) {
    if (!info.client_vat_number && !info.client_fiscal_code) {
      errors.push({
        field: 'client_vat_number',
        message: 'P.IVA o CF obbligatorio per aziende',
        severity: 'warning',
      })
    }

    // Validazione P.IVA cliente
    if (info.client_vat_number && !validateItalianVAT(info.client_vat_number)) {
      errors.push({
        field: 'client_vat_number',
        message: 'Partita IVA cliente non valida',
        severity: 'warning',
      })
    }
  }

  // Email consigliata
  if (!info.client_email && !info.referente_email) {
    errors.push({
      field: 'client_email',
      message: 'Email cliente consigliata',
      severity: 'warning',
    })
  }

  return errors
}

/**
 * Valida una Partita IVA italiana
 */
export function validateItalianVAT(vat: string): boolean {
  // Rimuovi spazi e caratteri non numerici
  const cleaned = vat.replace(/[^\d]/g, '')
  
  // P.IVA italiana: 11 cifre
  if (!/^\d{11}$/.test(cleaned)) {
    return false
  }

  // Algoritmo di controllo P.IVA
  let sum = 0
  for (let i = 0; i < 11; i++) {
    let digit = parseInt(cleaned.charAt(i))
    if (i % 2 === 1) {
      digit *= 2
      if (digit > 9) {
        digit -= 9
      }
    }
    sum += digit
  }

  return sum % 10 === 0
}

/**
 * Valida un Codice Fiscale italiano
 */
export function validateItalianFiscalCode(code: string): boolean {
  // Rimuovi spazi
  const cleaned = code.replace(/\s/g, '').toUpperCase()
  
  // CF italiano: 16 caratteri alfanumerici
  if (!/^[A-Z0-9]{16}$/.test(cleaned)) {
    return false
  }

  // Validazione algoritmo CF (semplificata)
  // I primi 6 caratteri sono lettere (cognome + nome)
  if (!/^[A-Z]{6}/.test(cleaned)) {
    return false
  }

  // Caratteri 7-11 sono data di nascita e sesso
  if (!/^\d{2}[A-Z]\d{2}/.test(cleaned.substring(6, 11))) {
    return false
  }

  // Caratteri 12-15 sono comune di nascita
  if (!/^[A-Z]\d{3}/.test(cleaned.substring(11, 15))) {
    return false
  }

  // Ultimo carattere è il check digit (lettera)
  if (!/[A-Z]$/.test(cleaned)) {
    return false
  }

  return true
}

/**
 * Valida un codice SDI
 */
export function validateSDICode(code: string): boolean {
  const cleaned = code.replace(/\s/g, '').toUpperCase()
  
  // SDI può essere:
  // - 7 caratteri alfanumerici
  // - "0000000" per fatturazione elettronica senza SDI
  return /^[A-Z0-9]{7}$/.test(cleaned)
}

/**
 * Valida un IBAN
 */
export function validateIBAN(iban: string): boolean {
  const cleaned = iban.replace(/\s/g, '').toUpperCase()
  
  // IBAN italiano: IT + 2 cifre check + 1 lettera + 10 cifre + 12 alfanumerici
  if (!/^IT\d{2}[A-Z]\d{10}[A-Z0-9]{12}$/.test(cleaned)) {
    return false
  }

  // Validazione algoritmo IBAN (MOD-97)
  const rearranged = cleaned.substring(4) + cleaned.substring(0, 4)
  const numeric = rearranged.replace(/[A-Z]/g, (char) => 
    (char.charCodeAt(0) - 55).toString()
  )
  
  // Calcolo modulo 97
  let remainder = numeric.substring(0, 9)
  for (let i = 9; i < numeric.length; i += 7) {
    remainder = (parseInt(remainder) % 97).toString() + numeric.substring(i, i + 7)
  }
  
  return parseInt(remainder) % 97 === 1
}

/**
 * Genera testo di conformità per il footer
 */
export function generateComplianceFooter(
  companyInfo: CompanyInfo,
  documentType: 'quote' | 'invoice' | 'receipt' | 'project_proposal'
): string {
  const lines: string[] = []

  // Informazioni aziendali base
  if (companyInfo.legal_name && companyInfo.legal_name !== companyInfo.company_name) {
    lines.push(companyInfo.legal_name)
  }

  // Dati fiscali
  const fiscalData: string[] = []
  if (companyInfo.vat_number) {
    fiscalData.push(`P.IVA ${companyInfo.vat_number}`)
  }
  if (companyInfo.fiscal_code) {
    fiscalData.push(`C.F. ${companyInfo.fiscal_code}`)
  }
  if (fiscalData.length > 0) {
    lines.push(fiscalData.join(' - '))
  }

  // Indirizzo
  if (companyInfo.address && companyInfo.city) {
    const address = [
      companyInfo.address,
      companyInfo.postal_code,
      companyInfo.city,
      companyInfo.province ? `(${companyInfo.province})` : '',
    ]
      .filter(Boolean)
      .join(' ')
    lines.push(address)
  }

  // Contatti
  const contacts: string[] = []
  if (companyInfo.phone) {
    contacts.push(`Tel. ${companyInfo.phone}`)
  }
  if (companyInfo.email) {
    contacts.push(companyInfo.email)
  }
  if (companyInfo.pec) {
    contacts.push(`PEC: ${companyInfo.pec}`)
  }
  if (contacts.length > 0) {
    lines.push(contacts.join(' - '))
  }

  // Website
  if (companyInfo.website) {
    lines.push(companyInfo.website)
  }

  // Note legali specifiche per tipo documento
  if (documentType === 'quote') {
    lines.push('')
    lines.push(
      'Preventivo non vincolante soggetto a verifica disponibilità e condizioni al momento dell\'ordine'
    )
  }

  return lines.join('\n')
}

/**
 * Genera disclaimer GDPR
 */
export function generateGDPRDisclaimer(): string {
  return (
    'I dati personali contenuti nel presente documento sono trattati nel rispetto del ' +
    'Regolamento UE 2016/679 (GDPR) e del D.Lgs. 196/2003 e successive modifiche.'
  )
}

/**
 * Verifica la completezza dei dati per fatturazione elettronica
 */
export function validateForElectronicInvoicing(
  companyInfo: CompanyInfo,
  clientInfo: ClientInfo
): ValidationError[] {
  const errors: ValidationError[] = []

  // Azienda
  if (!companyInfo.vat_number) {
    errors.push({
      field: 'company_vat',
      message: 'P.IVA azienda obbligatoria per fatturazione elettronica',
      severity: 'error',
    })
  }

  if (!companyInfo.sdi_code && !companyInfo.pec) {
    errors.push({
      field: 'company_sdi',
      message: 'Codice SDI o PEC obbligatorio per fatturazione elettronica',
      severity: 'error',
    })
  }

  // Cliente
  if (!clientInfo.client_vat_number && !clientInfo.client_fiscal_code) {
    errors.push({
      field: 'client_vat',
      message: 'P.IVA o CF cliente obbligatorio per fatturazione elettronica',
      severity: 'error',
    })
  }

  if (!clientInfo.client_sdi_code && !clientInfo.client_email) {
    errors.push({
      field: 'client_sdi',
      message: 'Codice SDI o PEC cliente obbligatorio per fatturazione elettronica',
      severity: 'error',
    })
  }

  return errors
}


import { Mail, Phone, Calendar, MessageSquare, Activity, FileText, StickyNote, CheckSquare } from 'lucide-react'

// ========== STATI LEADS ==========
export const LEAD_STATUS = {
  NUOVO: 'nuovo',
  CONTATTATO: 'contattato',
  QUALIFICATO: 'qualificato',
  CONVERTITO: 'convertito',
  PERSO: 'perso'
} as const

export const LEAD_STATUS_LABELS: Record<string, string> = {
  nuovo: 'Nuovo',
  contattato: 'Contattato',
  qualificato: 'Qualificato',
  convertito: 'Convertito',
  perso: 'Perso'
}

export const LEAD_STATUS_COLORS: Record<string, string> = {
  nuovo: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  contattato: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  qualificato: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  convertito: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  perso: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
}

// ========== STAGE OPPORTUNITÀ ==========
export const OPPORTUNITY_STAGE = {
  SCOPERTA: 'scoperta',
  PROPOSTA: 'proposta',
  NEGOZIAZIONE: 'negoziazione',
  CHIUSO_VINTO: 'chiuso_vinto',
  CHIUSO_PERSO: 'chiuso_perso'
} as const

export const OPPORTUNITY_STAGE_LABELS: Record<string, string> = {
  scoperta: 'Scoperta',
  proposta: 'Proposta',
  negoziazione: 'Negoziazione',
  chiuso_vinto: 'Chiuso Vinto',
  chiuso_perso: 'Chiuso Perso'
}

export const OPPORTUNITY_STAGE_COLORS: Record<string, string> = {
  scoperta: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  proposta: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  negoziazione: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
  chiuso_vinto: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  chiuso_perso: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
}

// Alias per compatibilità con i componenti
export const CRM_OPPORTUNITY_STAGE_LABELS = OPPORTUNITY_STAGE_LABELS
export const CRM_OPPORTUNITY_STAGE_COLORS = OPPORTUNITY_STAGE_COLORS

// Variants per Badge component
export const CRM_OPPORTUNITY_STAGE_VARIANTS: Record<string, string> = {
  scoperta: 'default',
  proposta: 'secondary',
  negoziazione: 'default',
  chiuso_vinto: 'default',
  chiuso_perso: 'destructive'
}

// ========== METODI CONTATTO ==========
export const CONTACT_METHOD = {
  EMAIL: 'email',
  TELEFONO: 'telefono',
  MEETING: 'meeting',
  WHATSAPP: 'whatsapp',
  ALTRO: 'altro'
} as const

export const CONTACT_METHOD_LABELS: Record<string, string> = {
  email: 'Email',
  telefono: 'Telefono',
  meeting: 'Meeting',
  whatsapp: 'WhatsApp',
  altro: 'Altro'
}

export const CONTACT_METHOD_ICONS: Record<string, any> = {
  email: Mail,
  telefono: Phone,
  meeting: Calendar,
  whatsapp: MessageSquare,
  altro: Activity
}

// ========== TIPI ATTIVITÀ ==========
export const ACTIVITY_TYPE = {
  EMAIL: 'email',
  TELEFONO: 'telefono',
  MEETING: 'meeting',
  NOTA: 'nota',
  TASK: 'task',
  WHATSAPP: 'whatsapp',
  ALTRO: 'altro'
} as const

export const ACTIVITY_TYPE_LABELS: Record<string, string> = {
  email: 'Email',
  telefono: 'Chiamata',
  meeting: 'Meeting',
  nota: 'Nota',
  task: 'Task',
  whatsapp: 'WhatsApp',
  altro: 'Altro'
}

export const ACTIVITY_TYPE_ICONS: Record<string, any> = {
  email: Mail,
  telefono: Phone,
  meeting: Calendar,
  nota: StickyNote,
  task: CheckSquare,
  whatsapp: MessageSquare,
  altro: FileText
}

export const ACTIVITY_TYPE_COLORS: Record<string, string> = {
  email: 'text-blue-600 bg-blue-50 dark:bg-blue-950',
  telefono: 'text-green-600 bg-green-50 dark:bg-green-950',
  meeting: 'text-purple-600 bg-purple-50 dark:bg-purple-950',
  nota: 'text-gray-600 bg-gray-50 dark:bg-gray-950',
  task: 'text-orange-600 bg-orange-50 dark:bg-orange-950',
  whatsapp: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950',
  altro: 'text-slate-600 bg-slate-50 dark:bg-slate-950'
}

// Array per select nel form (con value e label)
export const CRM_ACTIVITY_TYPES = [
  { value: 'email', label: 'Email' },
  { value: 'telefono', label: 'Chiamata' },
  { value: 'meeting', label: 'Meeting' },
  { value: 'nota', label: 'Nota' },
  { value: 'task', label: 'Task' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'altro', label: 'Altro' }
]

// ========== FONTI LEAD ==========
export const LEAD_SOURCE = {
  INSTAGRAM: 'instagram',
  YOUTUBE: 'youtube',
  GOOGLE: 'google',
  FACEBOOK: 'facebook',
  LINKEDIN: 'linkedin',
  PASSAPAROLA: 'passaparola',
  COLD_OUTREACH: 'cold_outreach',
  ALTRO: 'altro'
} as const

export const LEAD_SOURCE_LABELS: Record<string, string> = {
  instagram: 'Instagram',
  youtube: 'YouTube',
  google: 'Google',
  facebook: 'Facebook',
  linkedin: 'LinkedIn',
  passaparola: 'Passaparola',
  cold_outreach: 'Cold Outreach',
  altro: 'Altro'
}

// ========== CONFIGURAZIONI ==========
export const DEFAULT_NEXT_CONTACT_DAYS = 5

export const DEFAULT_OPPORTUNITY_PROBABILITY = 50

export const CSV_LEAD_TEMPLATE_HEADERS = [
  'nome_completo',
  'email',
  'telefono',
  'azienda',
  'ruolo',
  'budget',
  'servizi_interesse',
  'descrizione',
  'fonte',
  'note_interne'
]

export const CSV_LEAD_TEMPLATE_SAMPLE = [
  'Mario Rossi',
  'mario.rossi@example.com',
  '+39 123 456 7890',
  'Azienda SpA',
  'CEO',
  '10000',
  'Sito Web, SEO, Social Media',
  'Interessato a migliorare presenza online',
  'linkedin',
  'Contatto molto caldo, rispondere entro 24h'
]


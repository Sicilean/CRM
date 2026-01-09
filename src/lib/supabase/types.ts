// Tipi Supabase generati per tabelle specifiche
// Generato da: mcp_Supabase_generate_typescript_types

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// Brand Kits Types
export interface BrandKit {
  Row: {
    id: string
    nome: string
    persona_giuridica_id: string | null
    project_id: string | null
    versione_major: number
    versione_minor: number
    versione_patch: number
    versione: string
    versione_precedente_id: string | null
    stato: string
    tipo_gestione: string
    descrizione: string | null
    referente_sicilean_email: string | null
    referente_sicilean_user_id: string | null
    data_creazione: string | null
    data_ultima_modifica: string | null
    metadata: Json | null
    created_at: string | null
    created_by: string | null
    updated_at: string | null
  }
  Insert: {
    id?: string
    nome: string
    persona_giuridica_id?: string | null
    project_id?: string | null
    versione_major?: number
    versione_minor?: number
    versione_patch?: number
    versione?: string
    versione_precedente_id?: string | null
    stato?: string
    tipo_gestione: string
    descrizione?: string | null
    referente_sicilean_email?: string | null
    referente_sicilean_user_id?: string | null
    data_creazione?: string | null
    data_ultima_modifica?: string | null
    metadata?: Json | null
    created_at?: string | null
    created_by?: string | null
    updated_at?: string | null
  }
  Update: {
    id?: string
    nome?: string
    persona_giuridica_id?: string | null
    project_id?: string | null
    versione_major?: number
    versione_minor?: number
    versione_patch?: number
    versione?: string
    versione_precedente_id?: string | null
    stato?: string
    tipo_gestione?: string
    descrizione?: string | null
    referente_sicilean_email?: string | null
    referente_sicilean_user_id?: string | null
    data_creazione?: string | null
    data_ultima_modifica?: string | null
    metadata?: Json | null
    created_at?: string | null
    created_by?: string | null
    updated_at?: string | null
  }
}

// Brand Kit Colors Types
export interface BrandKitColor {
  Row: {
    id: string
    brand_kit_id: string
    nome_colore: string
    hex_value: string
    rgb_value: string | null
    cmyk_value: string | null
    pantone: string | null
    uso: string | null
    display_order: number | null
    created_at: string | null
  }
  Insert: {
    id?: string
    brand_kit_id: string
    nome_colore: string
    hex_value: string
    rgb_value?: string | null
    cmyk_value?: string | null
    pantone?: string | null
    uso?: string | null
    display_order?: number | null
    created_at?: string | null
  }
  Update: {
    id?: string
    brand_kit_id?: string
    nome_colore?: string
    hex_value?: string
    rgb_value?: string | null
    cmyk_value?: string | null
    pantone?: string | null
    uso?: string | null
    display_order?: number | null
    created_at?: string | null
  }
}

// Database type helper
export interface Database {
  public: {
    Tables: {
      brand_kits: BrandKit
      brand_kit_colors: BrandKitColor
    }
  }
}

// Convenience type exports
export type BrandKitRow = BrandKit['Row']
export type BrandKitInsert = BrandKit['Insert']
export type BrandKitUpdate = BrandKit['Update']

export type BrandKitColorRow = BrandKitColor['Row']
export type BrandKitColorInsert = BrandKitColor['Insert']
export type BrandKitColorUpdate = BrandKitColor['Update']


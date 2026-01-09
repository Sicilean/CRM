export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      accounts: {
        Row: {
          balance: number
          created_at: string
          currency: string
          id: string
          name: string
          public: boolean
          raw_data: Json | null
          state: string
          sync_created_at: string | null
          sync_updated_at: string | null
          updated_at: string
        }
        Insert: {
          balance: number
          created_at: string
          currency: string
          id: string
          name: string
          public?: boolean
          raw_data?: Json | null
          state: string
          sync_created_at?: string | null
          sync_updated_at?: string | null
          updated_at: string
        }
        Update: {
          balance?: number
          created_at?: string
          currency?: string
          id?: string
          name?: string
          public?: boolean
          raw_data?: Json | null
          state?: string
          sync_created_at?: string | null
          sync_updated_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      articles: {
        Row: {
          author_id: string | null
          category: string
          content: Json
          cover: Json | null
          created_at: string | null
          description: string | null
          featured: boolean | null
          id: string
          meta_description: string | null
          meta_title: string | null
          published: boolean | null
          slug: string
          tags: string[] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          author_id?: string | null
          category?: string
          content: Json
          cover?: Json | null
          created_at?: string | null
          description?: string | null
          featured?: boolean | null
          id?: string
          meta_description?: string | null
          meta_title?: string | null
          published?: boolean | null
          slug: string
          tags?: string[] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          author_id?: string | null
          category?: string
          content?: Json
          cover?: Json | null
          created_at?: string | null
          description?: string | null
          featured?: boolean | null
          id?: string
          meta_description?: string | null
          meta_title?: string | null
          published?: boolean | null
          slug?: string
          tags?: string[] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "articles_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      aruba_sync_log: {
        Row: {
          completed_at: string | null
          error_message: string | null
          id: string
          records_created: number | null
          records_fetched: number | null
          records_updated: number | null
          response_data: Json | null
          started_at: string | null
          status: string | null
          sync_type: string
        }
        Insert: {
          completed_at?: string | null
          error_message?: string | null
          id?: string
          records_created?: number | null
          records_fetched?: number | null
          records_updated?: number | null
          response_data?: Json | null
          started_at?: string | null
          status?: string | null
          sync_type: string
        }
        Update: {
          completed_at?: string | null
          error_message?: string | null
          id?: string
          records_created?: number | null
          records_fetched?: number | null
          records_updated?: number | null
          response_data?: Json | null
          started_at?: string | null
          status?: string | null
          sync_type?: string
        }
        Relationships: []
      }
      audit_log: {
        Row: {
          action: string
          created_at: string | null
          entity_id: string
          entity_type: string
          id: string
          ip_address: unknown
          new_values: Json | null
          old_values: Json | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          entity_id: string
          entity_type: string
          id?: string
          ip_address?: unknown
          new_values?: Json | null
          old_values?: Json | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          entity_id?: string
          entity_type?: string
          id?: string
          ip_address?: unknown
          new_values?: Json | null
          old_values?: Json | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_log_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      bank_accounts: {
        Row: {
          account_name: string
          account_type: string
          available_balance: number | null
          balance: number | null
          bank_connection_id: string
          created_at: string | null
          credit_line: number | null
          currency: string
          description: string | null
          display_order: number | null
          external_id: string
          iban: string | null
          id: string
          is_active: boolean | null
          raw_data: Json | null
          updated_at: string | null
        }
        Insert: {
          account_name: string
          account_type: string
          available_balance?: number | null
          balance?: number | null
          bank_connection_id: string
          created_at?: string | null
          credit_line?: number | null
          currency?: string
          description?: string | null
          display_order?: number | null
          external_id: string
          iban?: string | null
          id?: string
          is_active?: boolean | null
          raw_data?: Json | null
          updated_at?: string | null
        }
        Update: {
          account_name?: string
          account_type?: string
          available_balance?: number | null
          balance?: number | null
          bank_connection_id?: string
          created_at?: string | null
          credit_line?: number | null
          currency?: string
          description?: string | null
          display_order?: number | null
          external_id?: string
          iban?: string | null
          id?: string
          is_active?: boolean | null
          raw_data?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bank_accounts_bank_connection_id_fkey"
            columns: ["bank_connection_id"]
            isOneToOne: false
            referencedRelation: "bank_connections"
            referencedColumns: ["id"]
          },
        ]
      }
      bank_connections: {
        Row: {
          account_holder: string
          auth_type: string
          bank_name: string
          bank_type: string
          created_at: string | null
          credentials_encrypted: Json | null
          id: string
          is_active: boolean | null
          last_sync_at: string | null
          metadata: Json | null
          sync_error: string | null
          sync_status: string | null
          updated_at: string | null
        }
        Insert: {
          account_holder: string
          auth_type: string
          bank_name: string
          bank_type: string
          created_at?: string | null
          credentials_encrypted?: Json | null
          id?: string
          is_active?: boolean | null
          last_sync_at?: string | null
          metadata?: Json | null
          sync_error?: string | null
          sync_status?: string | null
          updated_at?: string | null
        }
        Update: {
          account_holder?: string
          auth_type?: string
          bank_name?: string
          bank_type?: string
          created_at?: string | null
          credentials_encrypted?: Json | null
          id?: string
          is_active?: boolean | null
          last_sync_at?: string | null
          metadata?: Json | null
          sync_error?: string | null
          sync_status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      brand_kit_colors: {
        Row: {
          brand_kit_id: string
          cmyk_value: string | null
          created_at: string | null
          display_order: number | null
          hex_value: string
          id: string
          nome_colore: string
          pantone: string | null
          rgb_value: string | null
          uso: string | null
        }
        Insert: {
          brand_kit_id: string
          cmyk_value?: string | null
          created_at?: string | null
          display_order?: number | null
          hex_value: string
          id?: string
          nome_colore: string
          pantone?: string | null
          rgb_value?: string | null
          uso?: string | null
        }
        Update: {
          brand_kit_id?: string
          cmyk_value?: string | null
          created_at?: string | null
          display_order?: number | null
          hex_value?: string
          id?: string
          nome_colore?: string
          pantone?: string | null
          rgb_value?: string | null
          uso?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "brand_kit_colors_brand_kit_id_fkey"
            columns: ["brand_kit_id"]
            isOneToOne: false
            referencedRelation: "brand_kits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brand_kit_colors_brand_kit_id_fkey"
            columns: ["brand_kit_id"]
            isOneToOne: false
            referencedRelation: "brand_kits_with_version"
            referencedColumns: ["id"]
          },
        ]
      }
      brand_kit_communication_examples: {
        Row: {
          created_at: string | null
          display_order: number | null
          example_content: string
          example_title: string | null
          id: string
          notes: string | null
          strategy_id: string
          touchpoint_type: string
        }
        Insert: {
          created_at?: string | null
          display_order?: number | null
          example_content: string
          example_title?: string | null
          id?: string
          notes?: string | null
          strategy_id: string
          touchpoint_type: string
        }
        Update: {
          created_at?: string | null
          display_order?: number | null
          example_content?: string
          example_title?: string | null
          id?: string
          notes?: string | null
          strategy_id?: string
          touchpoint_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "brand_kit_communication_examples_strategy_id_fkey"
            columns: ["strategy_id"]
            isOneToOne: false
            referencedRelation: "brand_kit_strategy"
            referencedColumns: ["id"]
          },
        ]
      }
      brand_kit_competitors: {
        Row: {
          created_at: string | null
          display_order: number | null
          id: string
          notes: string | null
          persona_giuridica_id: string | null
          positioning_label_x: string | null
          positioning_label_y: string | null
          positioning_x: number | null
          positioning_y: number | null
          screenshots_paths: string[] | null
          strategy_id: string
          strengths: string | null
          visual_style_tags: string[] | null
          weaknesses: string | null
        }
        Insert: {
          created_at?: string | null
          display_order?: number | null
          id?: string
          notes?: string | null
          persona_giuridica_id?: string | null
          positioning_label_x?: string | null
          positioning_label_y?: string | null
          positioning_x?: number | null
          positioning_y?: number | null
          screenshots_paths?: string[] | null
          strategy_id: string
          strengths?: string | null
          visual_style_tags?: string[] | null
          weaknesses?: string | null
        }
        Update: {
          created_at?: string | null
          display_order?: number | null
          id?: string
          notes?: string | null
          persona_giuridica_id?: string | null
          positioning_label_x?: string | null
          positioning_label_y?: string | null
          positioning_x?: number | null
          positioning_y?: number | null
          screenshots_paths?: string[] | null
          strategy_id?: string
          strengths?: string | null
          visual_style_tags?: string[] | null
          weaknesses?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "brand_kit_competitors_persona_giuridica_id_fkey"
            columns: ["persona_giuridica_id"]
            isOneToOne: false
            referencedRelation: "persone_giuridiche"
            referencedColumns: ["notion_id"]
          },
          {
            foreignKeyName: "brand_kit_competitors_strategy_id_fkey"
            columns: ["strategy_id"]
            isOneToOne: false
            referencedRelation: "brand_kit_strategy"
            referencedColumns: ["id"]
          },
        ]
      }
      brand_kit_content_pillars: {
        Row: {
          content_types: string[] | null
          created_at: string | null
          display_order: number | null
          id: string
          key_messages: string[] | null
          objectives: string[] | null
          pillar_name: string
          strategy_id: string
          theme: string | null
        }
        Insert: {
          content_types?: string[] | null
          created_at?: string | null
          display_order?: number | null
          id?: string
          key_messages?: string[] | null
          objectives?: string[] | null
          pillar_name: string
          strategy_id: string
          theme?: string | null
        }
        Update: {
          content_types?: string[] | null
          created_at?: string | null
          display_order?: number | null
          id?: string
          key_messages?: string[] | null
          objectives?: string[] | null
          pillar_name?: string
          strategy_id?: string
          theme?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "brand_kit_content_pillars_strategy_id_fkey"
            columns: ["strategy_id"]
            isOneToOne: false
            referencedRelation: "brand_kit_strategy"
            referencedColumns: ["id"]
          },
        ]
      }
      brand_kit_core_values: {
        Row: {
          created_at: string | null
          display_order: number | null
          id: string
          practical_example: string | null
          strategy_id: string
          value_description: string | null
          value_name: string
        }
        Insert: {
          created_at?: string | null
          display_order?: number | null
          id?: string
          practical_example?: string | null
          strategy_id: string
          value_description?: string | null
          value_name: string
        }
        Update: {
          created_at?: string | null
          display_order?: number | null
          id?: string
          practical_example?: string | null
          strategy_id?: string
          value_description?: string | null
          value_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "brand_kit_core_values_strategy_id_fkey"
            columns: ["strategy_id"]
            isOneToOne: false
            referencedRelation: "brand_kit_strategy"
            referencedColumns: ["id"]
          },
        ]
      }
      brand_kit_feedback: {
        Row: {
          assegnato_a: string | null
          attachments: string[] | null
          autore: string | null
          brand_kit_id: string
          created_at: string
          data_risoluzione: string | null
          descrizione: string
          fonte: string
          id: string
          priorita: string
          richiedente_email: string | null
          richiedente_nome: string | null
          risposta: string | null
          stato: string
          tipo: string
          titolo: string
          updated_at: string
        }
        Insert: {
          assegnato_a?: string | null
          attachments?: string[] | null
          autore?: string | null
          brand_kit_id: string
          created_at?: string
          data_risoluzione?: string | null
          descrizione: string
          fonte?: string
          id?: string
          priorita?: string
          richiedente_email?: string | null
          richiedente_nome?: string | null
          risposta?: string | null
          stato?: string
          tipo: string
          titolo: string
          updated_at?: string
        }
        Update: {
          assegnato_a?: string | null
          attachments?: string[] | null
          autore?: string | null
          brand_kit_id?: string
          created_at?: string
          data_risoluzione?: string | null
          descrizione?: string
          fonte?: string
          id?: string
          priorita?: string
          richiedente_email?: string | null
          richiedente_nome?: string | null
          risposta?: string | null
          stato?: string
          tipo?: string
          titolo?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "brand_kit_feedback_assegnato_a_fkey"
            columns: ["assegnato_a"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brand_kit_feedback_brand_kit_id_fkey"
            columns: ["brand_kit_id"]
            isOneToOne: false
            referencedRelation: "brand_kits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brand_kit_feedback_brand_kit_id_fkey"
            columns: ["brand_kit_id"]
            isOneToOne: false
            referencedRelation: "brand_kits_with_version"
            referencedColumns: ["id"]
          },
        ]
      }
      brand_kit_feedback_tokens: {
        Row: {
          brand_kit_id: string
          created_at: string
          created_by: string | null
          expires_at: string | null
          id: string
          is_active: boolean
          last_used_at: string | null
          notes: string | null
          token: string
          usage_count: number
        }
        Insert: {
          brand_kit_id: string
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean
          last_used_at?: string | null
          notes?: string | null
          token: string
          usage_count?: number
        }
        Update: {
          brand_kit_id?: string
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean
          last_used_at?: string | null
          notes?: string | null
          token?: string
          usage_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "brand_kit_feedback_tokens_brand_kit_id_fkey"
            columns: ["brand_kit_id"]
            isOneToOne: false
            referencedRelation: "brand_kits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brand_kit_feedback_tokens_brand_kit_id_fkey"
            columns: ["brand_kit_id"]
            isOneToOne: false
            referencedRelation: "brand_kits_with_version"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brand_kit_feedback_tokens_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      brand_kit_files: {
        Row: {
          asset_type: string | null
          brand_kit_id: string
          categoria: string
          descrizione: string | null
          dimensioni: Json | null
          display_order: number | null
          external_url: string | null
          file_path: string | null
          file_size: number | null
          folder_id: string | null
          formato: string | null
          id: string
          mime_type: string | null
          nome_file: string
          provider: string | null
          provider_notes: string | null
          sottocategoria: string | null
          tags: string[] | null
          uploaded_at: string | null
          uploaded_by: string | null
          usage_notes: string | null
          variante: string | null
        }
        Insert: {
          asset_type?: string | null
          brand_kit_id: string
          categoria: string
          descrizione?: string | null
          dimensioni?: Json | null
          display_order?: number | null
          external_url?: string | null
          file_path?: string | null
          file_size?: number | null
          folder_id?: string | null
          formato?: string | null
          id?: string
          mime_type?: string | null
          nome_file: string
          provider?: string | null
          provider_notes?: string | null
          sottocategoria?: string | null
          tags?: string[] | null
          uploaded_at?: string | null
          uploaded_by?: string | null
          usage_notes?: string | null
          variante?: string | null
        }
        Update: {
          asset_type?: string | null
          brand_kit_id?: string
          categoria?: string
          descrizione?: string | null
          dimensioni?: Json | null
          display_order?: number | null
          external_url?: string | null
          file_path?: string | null
          file_size?: number | null
          folder_id?: string | null
          formato?: string | null
          id?: string
          mime_type?: string | null
          nome_file?: string
          provider?: string | null
          provider_notes?: string | null
          sottocategoria?: string | null
          tags?: string[] | null
          uploaded_at?: string | null
          uploaded_by?: string | null
          usage_notes?: string | null
          variante?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "brand_kit_files_brand_kit_id_fkey"
            columns: ["brand_kit_id"]
            isOneToOne: false
            referencedRelation: "brand_kits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brand_kit_files_brand_kit_id_fkey"
            columns: ["brand_kit_id"]
            isOneToOne: false
            referencedRelation: "brand_kits_with_version"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brand_kit_files_folder_id_fkey"
            columns: ["folder_id"]
            isOneToOne: false
            referencedRelation: "brand_kit_folders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brand_kit_files_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      brand_kit_folders: {
        Row: {
          brand_kit_id: string
          created_at: string | null
          created_by: string | null
          id: string
          name: string
          parent_id: string | null
          sub_type: string | null
          type: string
          updated_at: string | null
        }
        Insert: {
          brand_kit_id: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          name: string
          parent_id?: string | null
          sub_type?: string | null
          type: string
          updated_at?: string | null
        }
        Update: {
          brand_kit_id?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          name?: string
          parent_id?: string | null
          sub_type?: string | null
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "brand_kit_folders_brand_kit_id_fkey"
            columns: ["brand_kit_id"]
            isOneToOne: false
            referencedRelation: "brand_kits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brand_kit_folders_brand_kit_id_fkey"
            columns: ["brand_kit_id"]
            isOneToOne: false
            referencedRelation: "brand_kits_with_version"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brand_kit_folders_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brand_kit_folders_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "brand_kit_folders"
            referencedColumns: ["id"]
          },
        ]
      }
      brand_kit_glossary: {
        Row: {
          alternative: string | null
          context: string | null
          created_at: string | null
          display_order: number | null
          example: string | null
          id: string
          strategy_id: string
          term: string
          term_en: string | null
          term_it: string | null
          term_type: string
          why_avoid: string | null
        }
        Insert: {
          alternative?: string | null
          context?: string | null
          created_at?: string | null
          display_order?: number | null
          example?: string | null
          id?: string
          strategy_id: string
          term: string
          term_en?: string | null
          term_it?: string | null
          term_type: string
          why_avoid?: string | null
        }
        Update: {
          alternative?: string | null
          context?: string | null
          created_at?: string | null
          display_order?: number | null
          example?: string | null
          id?: string
          strategy_id?: string
          term?: string
          term_en?: string | null
          term_it?: string | null
          term_type?: string
          why_avoid?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "brand_kit_glossary_strategy_id_fkey"
            columns: ["strategy_id"]
            isOneToOne: false
            referencedRelation: "brand_kit_strategy"
            referencedColumns: ["id"]
          },
        ]
      }
      brand_kit_personas: {
        Row: {
          age_range: string | null
          aspirations: string[] | null
          budget_range: string | null
          created_at: string | null
          decision_process: string | null
          display_order: number | null
          education: string | null
          gender: string | null
          id: string
          income_range: string | null
          interests: string[] | null
          lifestyle: string | null
          location: string | null
          needs: string[] | null
          occupation: string | null
          pain_points: string[] | null
          persona_image_path: string | null
          persona_name: string
          personal_goals: string[] | null
          personality: string | null
          preferred_channels: string[] | null
          professional_goals: string[] | null
          purchase_frequency: string | null
          quote_context: string | null
          representative_quote: string | null
          strategy_id: string
          touchpoints: string[] | null
          values: string[] | null
        }
        Insert: {
          age_range?: string | null
          aspirations?: string[] | null
          budget_range?: string | null
          created_at?: string | null
          decision_process?: string | null
          display_order?: number | null
          education?: string | null
          gender?: string | null
          id?: string
          income_range?: string | null
          interests?: string[] | null
          lifestyle?: string | null
          location?: string | null
          needs?: string[] | null
          occupation?: string | null
          pain_points?: string[] | null
          persona_image_path?: string | null
          persona_name: string
          personal_goals?: string[] | null
          personality?: string | null
          preferred_channels?: string[] | null
          professional_goals?: string[] | null
          purchase_frequency?: string | null
          quote_context?: string | null
          representative_quote?: string | null
          strategy_id: string
          touchpoints?: string[] | null
          values?: string[] | null
        }
        Update: {
          age_range?: string | null
          aspirations?: string[] | null
          budget_range?: string | null
          created_at?: string | null
          decision_process?: string | null
          display_order?: number | null
          education?: string | null
          gender?: string | null
          id?: string
          income_range?: string | null
          interests?: string[] | null
          lifestyle?: string | null
          location?: string | null
          needs?: string[] | null
          occupation?: string | null
          pain_points?: string[] | null
          persona_image_path?: string | null
          persona_name?: string
          personal_goals?: string[] | null
          personality?: string | null
          preferred_channels?: string[] | null
          professional_goals?: string[] | null
          purchase_frequency?: string | null
          quote_context?: string | null
          representative_quote?: string | null
          strategy_id?: string
          touchpoints?: string[] | null
          values?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "brand_kit_personas_strategy_id_fkey"
            columns: ["strategy_id"]
            isOneToOne: false
            referencedRelation: "brand_kit_strategy"
            referencedColumns: ["id"]
          },
        ]
      }
      brand_kit_strategy: {
        Row: {
          archetype_mix_percentage: number | null
          archetype_primary: string | null
          archetype_scores: Json | null
          archetype_secondary: string | null
          archetype_visual_path: string | null
          brand_kit_id: string
          brand_name_meaning: string | null
          brand_name_origin: string | null
          brand_name_pronunciation: string | null
          brand_promise: string | null
          brand_story: string | null
          communication_principles: string[] | null
          created_at: string | null
          created_by: string | null
          differentiation_opportunities: string | null
          elevator_pitch_30s: string | null
          emoji_usage: boolean | null
          extended_pitch: string | null
          grammar_notes: string | null
          id: string
          industry_trends: string[] | null
          key_narrative: string | null
          mission: string | null
          one_liner: string | null
          payoff_main: string | null
          payoff_variants: string[] | null
          personality_adjectives: string[] | null
          personality_axes: Json | null
          positioning_notes: string | null
          preferred_tense: string | null
          pronoun_usage: string | null
          purpose: string | null
          reason_why: string | null
          recurring_messages: string[] | null
          sentence_length: string | null
          tone_characteristics: string[] | null
          tone_enthusiastic_matter_of_fact: number | null
          tone_formal_informal: number | null
          tone_respectful_irreverent: number | null
          tone_serious_playful: number | null
          updated_at: string | null
          uvp: string | null
          vision: string | null
        }
        Insert: {
          archetype_mix_percentage?: number | null
          archetype_primary?: string | null
          archetype_scores?: Json | null
          archetype_secondary?: string | null
          archetype_visual_path?: string | null
          brand_kit_id: string
          brand_name_meaning?: string | null
          brand_name_origin?: string | null
          brand_name_pronunciation?: string | null
          brand_promise?: string | null
          brand_story?: string | null
          communication_principles?: string[] | null
          created_at?: string | null
          created_by?: string | null
          differentiation_opportunities?: string | null
          elevator_pitch_30s?: string | null
          emoji_usage?: boolean | null
          extended_pitch?: string | null
          grammar_notes?: string | null
          id?: string
          industry_trends?: string[] | null
          key_narrative?: string | null
          mission?: string | null
          one_liner?: string | null
          payoff_main?: string | null
          payoff_variants?: string[] | null
          personality_adjectives?: string[] | null
          personality_axes?: Json | null
          positioning_notes?: string | null
          preferred_tense?: string | null
          pronoun_usage?: string | null
          purpose?: string | null
          reason_why?: string | null
          recurring_messages?: string[] | null
          sentence_length?: string | null
          tone_characteristics?: string[] | null
          tone_enthusiastic_matter_of_fact?: number | null
          tone_formal_informal?: number | null
          tone_respectful_irreverent?: number | null
          tone_serious_playful?: number | null
          updated_at?: string | null
          uvp?: string | null
          vision?: string | null
        }
        Update: {
          archetype_mix_percentage?: number | null
          archetype_primary?: string | null
          archetype_scores?: Json | null
          archetype_secondary?: string | null
          archetype_visual_path?: string | null
          brand_kit_id?: string
          brand_name_meaning?: string | null
          brand_name_origin?: string | null
          brand_name_pronunciation?: string | null
          brand_promise?: string | null
          brand_story?: string | null
          communication_principles?: string[] | null
          created_at?: string | null
          created_by?: string | null
          differentiation_opportunities?: string | null
          elevator_pitch_30s?: string | null
          emoji_usage?: boolean | null
          extended_pitch?: string | null
          grammar_notes?: string | null
          id?: string
          industry_trends?: string[] | null
          key_narrative?: string | null
          mission?: string | null
          one_liner?: string | null
          payoff_main?: string | null
          payoff_variants?: string[] | null
          personality_adjectives?: string[] | null
          personality_axes?: Json | null
          positioning_notes?: string | null
          preferred_tense?: string | null
          pronoun_usage?: string | null
          purpose?: string | null
          reason_why?: string | null
          recurring_messages?: string[] | null
          sentence_length?: string | null
          tone_characteristics?: string[] | null
          tone_enthusiastic_matter_of_fact?: number | null
          tone_formal_informal?: number | null
          tone_respectful_irreverent?: number | null
          tone_serious_playful?: number | null
          updated_at?: string | null
          uvp?: string | null
          vision?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "brand_kit_strategy_brand_kit_id_fkey"
            columns: ["brand_kit_id"]
            isOneToOne: true
            referencedRelation: "brand_kits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brand_kit_strategy_brand_kit_id_fkey"
            columns: ["brand_kit_id"]
            isOneToOne: true
            referencedRelation: "brand_kits_with_version"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brand_kit_strategy_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      brand_kit_tone_guidelines: {
        Row: {
          created_at: string | null
          display_order: number | null
          example: string | null
          guideline_text: string
          guideline_type: string
          id: string
          strategy_id: string
        }
        Insert: {
          created_at?: string | null
          display_order?: number | null
          example?: string | null
          guideline_text: string
          guideline_type: string
          id?: string
          strategy_id: string
        }
        Update: {
          created_at?: string | null
          display_order?: number | null
          example?: string | null
          guideline_text?: string
          guideline_type?: string
          id?: string
          strategy_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "brand_kit_tone_guidelines_strategy_id_fkey"
            columns: ["strategy_id"]
            isOneToOne: false
            referencedRelation: "brand_kit_strategy"
            referencedColumns: ["id"]
          },
        ]
      }
      brand_kits: {
        Row: {
          created_at: string | null
          created_by: string | null
          data_creazione: string | null
          data_ultima_modifica: string | null
          descrizione: string | null
          id: string
          metadata: Json | null
          nome: string
          persona_giuridica_id: string | null
          project_id: string | null
          referente_sicilean_email: string | null
          referente_sicilean_user_id: string | null
          stato: string
          tipo_gestione: string
          updated_at: string | null
          versione: string
          versione_major: number
          versione_minor: number
          versione_patch: number
          versione_precedente_id: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          data_creazione?: string | null
          data_ultima_modifica?: string | null
          descrizione?: string | null
          id?: string
          metadata?: Json | null
          nome: string
          persona_giuridica_id?: string | null
          project_id?: string | null
          referente_sicilean_email?: string | null
          referente_sicilean_user_id?: string | null
          stato?: string
          tipo_gestione: string
          updated_at?: string | null
          versione?: string
          versione_major?: number
          versione_minor?: number
          versione_patch?: number
          versione_precedente_id?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          data_creazione?: string | null
          data_ultima_modifica?: string | null
          descrizione?: string | null
          id?: string
          metadata?: Json | null
          nome?: string
          persona_giuridica_id?: string | null
          project_id?: string | null
          referente_sicilean_email?: string | null
          referente_sicilean_user_id?: string | null
          stato?: string
          tipo_gestione?: string
          updated_at?: string | null
          versione?: string
          versione_major?: number
          versione_minor?: number
          versione_patch?: number
          versione_precedente_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "brand_kits_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brand_kits_persona_giuridica_id_fkey"
            columns: ["persona_giuridica_id"]
            isOneToOne: false
            referencedRelation: "persone_giuridiche"
            referencedColumns: ["notion_id"]
          },
          {
            foreignKeyName: "brand_kits_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brand_kits_referente_sicilean_user_id_fkey"
            columns: ["referente_sicilean_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brand_kits_versione_precedente_id_fkey"
            columns: ["versione_precedente_id"]
            isOneToOne: false
            referencedRelation: "brand_kits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brand_kits_versione_precedente_id_fkey"
            columns: ["versione_precedente_id"]
            isOneToOne: false
            referencedRelation: "brand_kits_with_version"
            referencedColumns: ["id"]
          },
        ]
      }
      budget_targets: {
        Row: {
          alert_threshold: number | null
          category_id: string | null
          created_at: string | null
          created_by: string | null
          id: string
          is_active: boolean | null
          notes: string | null
          period_end: string
          period_start: string
          period_type: string
          target_amount: number
          updated_at: string | null
        }
        Insert: {
          alert_threshold?: number | null
          category_id?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          notes?: string | null
          period_end: string
          period_start: string
          period_type: string
          target_amount: number
          updated_at?: string | null
        }
        Update: {
          alert_threshold?: number | null
          category_id?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          notes?: string | null
          period_end?: string
          period_start?: string
          period_type?: string
          target_amount?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "budget_targets_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "transaction_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "budget_targets_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      company_info: {
        Row: {
          address: string | null
          city: string | null
          company_name: string
          country: string | null
          created_at: string | null
          default_bank_account_id: string | null
          email: string | null
          fiscal_code: string | null
          footer_text: string | null
          id: string
          is_active: boolean | null
          legal_name: string | null
          logo_url: string | null
          pec: string | null
          phone: string | null
          postal_code: string | null
          province: string | null
          sdi_code: string | null
          updated_at: string | null
          vat_number: string | null
          website: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          company_name?: string
          country?: string | null
          created_at?: string | null
          default_bank_account_id?: string | null
          email?: string | null
          fiscal_code?: string | null
          footer_text?: string | null
          id?: string
          is_active?: boolean | null
          legal_name?: string | null
          logo_url?: string | null
          pec?: string | null
          phone?: string | null
          postal_code?: string | null
          province?: string | null
          sdi_code?: string | null
          updated_at?: string | null
          vat_number?: string | null
          website?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          company_name?: string
          country?: string | null
          created_at?: string | null
          default_bank_account_id?: string | null
          email?: string | null
          fiscal_code?: string | null
          footer_text?: string | null
          id?: string
          is_active?: boolean | null
          legal_name?: string | null
          logo_url?: string | null
          pec?: string | null
          phone?: string | null
          postal_code?: string | null
          province?: string | null
          sdi_code?: string | null
          updated_at?: string | null
          vat_number?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "company_info_default_bank_account_id_fkey"
            columns: ["default_bank_account_id"]
            isOneToOne: false
            referencedRelation: "bank_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      consulting_services: {
        Row: {
          consulente_user_id: string | null
          created_at: string | null
          data_fine: string | null
          data_inizio: string | null
          deliverables: Json | null
          descrizione: string | null
          documenti_paths: string[] | null
          id: string
          nome: string
          note: string | null
          project_id: string
          stato: string | null
          tipo_consulenza: string
          updated_at: string | null
          valore: number | null
        }
        Insert: {
          consulente_user_id?: string | null
          created_at?: string | null
          data_fine?: string | null
          data_inizio?: string | null
          deliverables?: Json | null
          descrizione?: string | null
          documenti_paths?: string[] | null
          id?: string
          nome: string
          note?: string | null
          project_id: string
          stato?: string | null
          tipo_consulenza: string
          updated_at?: string | null
          valore?: number | null
        }
        Update: {
          consulente_user_id?: string | null
          created_at?: string | null
          data_fine?: string | null
          data_inizio?: string | null
          deliverables?: Json | null
          descrizione?: string | null
          documenti_paths?: string[] | null
          id?: string
          nome?: string
          note?: string | null
          project_id?: string
          stato?: string | null
          tipo_consulenza?: string
          updated_at?: string | null
          valore?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "consulting_services_consulente_user_id_fkey"
            columns: ["consulente_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consulting_services_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      contacts: {
        Row: {
          azienda: string | null
          budget: number | null
          cognome: string | null
          conoscenza: Json | null
          contatto_preferito: Json | null
          created_at: string | null
          email: string
          form_type: string
          id: string
          ip_address: unknown
          messaggio: string | null
          newsletter_consent: boolean | null
          nome: string | null
          nome_completo: string | null
          note: string | null
          privacy_consent: boolean | null
          ruolo: string | null
          servizi: Json | null
          sfida: string | null
          status: string | null
          telefono: string | null
          timeline: string | null
          updated_at: string | null
          user_agent: string | null
        }
        Insert: {
          azienda?: string | null
          budget?: number | null
          cognome?: string | null
          conoscenza?: Json | null
          contatto_preferito?: Json | null
          created_at?: string | null
          email: string
          form_type: string
          id?: string
          ip_address?: unknown
          messaggio?: string | null
          newsletter_consent?: boolean | null
          nome?: string | null
          nome_completo?: string | null
          note?: string | null
          privacy_consent?: boolean | null
          ruolo?: string | null
          servizi?: Json | null
          sfida?: string | null
          status?: string | null
          telefono?: string | null
          timeline?: string | null
          updated_at?: string | null
          user_agent?: string | null
        }
        Update: {
          azienda?: string | null
          budget?: number | null
          cognome?: string | null
          conoscenza?: Json | null
          contatto_preferito?: Json | null
          created_at?: string | null
          email?: string
          form_type?: string
          id?: string
          ip_address?: unknown
          messaggio?: string | null
          newsletter_consent?: boolean | null
          nome?: string | null
          nome_completo?: string | null
          note?: string | null
          privacy_consent?: boolean | null
          ruolo?: string | null
          servizi?: Json | null
          sfida?: string | null
          status?: string | null
          telefono?: string | null
          timeline?: string | null
          updated_at?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      counterparties: {
        Row: {
          auto_match_enabled: boolean | null
          created_at: string
          id: string
          name: string
          persona_fisica_id: string | null
          persona_giuridica_id: string | null
          profile_type: string
          raw_data: Json
          state: string
          sync_created_at: string | null
          sync_updated_at: string | null
          updated_at: string
        }
        Insert: {
          auto_match_enabled?: boolean | null
          created_at: string
          id: string
          name: string
          persona_fisica_id?: string | null
          persona_giuridica_id?: string | null
          profile_type: string
          raw_data: Json
          state: string
          sync_created_at?: string | null
          sync_updated_at?: string | null
          updated_at: string
        }
        Update: {
          auto_match_enabled?: boolean | null
          created_at?: string
          id?: string
          name?: string
          persona_fisica_id?: string | null
          persona_giuridica_id?: string | null
          profile_type?: string
          raw_data?: Json
          state?: string
          sync_created_at?: string | null
          sync_updated_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "counterparties_persona_fisica_id_fkey"
            columns: ["persona_fisica_id"]
            isOneToOne: false
            referencedRelation: "persone_fisiche"
            referencedColumns: ["notion_id"]
          },
          {
            foreignKeyName: "counterparties_persona_giuridica_id_fkey"
            columns: ["persona_giuridica_id"]
            isOneToOne: false
            referencedRelation: "persone_giuridiche"
            referencedColumns: ["notion_id"]
          },
        ]
      }
      counterparty_accounts: {
        Row: {
          bank_country: string | null
          bic: string | null
          counterparty_id: string
          currency: string
          iban: string | null
          id: string
          name: string
          raw_data: Json | null
          recipient_charges: string | null
          sync_created_at: string | null
          type: string
        }
        Insert: {
          bank_country?: string | null
          bic?: string | null
          counterparty_id: string
          currency: string
          iban?: string | null
          id: string
          name: string
          raw_data?: Json | null
          recipient_charges?: string | null
          sync_created_at?: string | null
          type: string
        }
        Update: {
          bank_country?: string | null
          bic?: string | null
          counterparty_id?: string
          currency?: string
          iban?: string | null
          id?: string
          name?: string
          raw_data?: Json | null
          recipient_charges?: string | null
          sync_created_at?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "counterparty_accounts_counterparty_id_fkey"
            columns: ["counterparty_id"]
            isOneToOne: false
            referencedRelation: "counterparties"
            referencedColumns: ["id"]
          },
        ]
      }
      credenziali: {
        Row: {
          backup_codes: string[] | null
          categoria: string[] | null
          created_at: string | null
          criticita: string | null
          custom_fields: Json | null
          id: string
          is_shared: boolean | null
          nome: string
          note: string | null
          notion_created_by: string | null
          notion_created_time: string | null
          notion_id: string | null
          notion_last_edited_by: string | null
          notion_last_edited_time: string | null
          password_encrypted: string | null
          password_hint: string | null
          password_updated_at: string | null
          raw_notion_data: Json | null
          responsabile_email: string | null
          scadenza_password: string | null
          security_questions: Json | null
          tags: string[] | null
          totp_secret: string | null
          updated_at: string | null
          url: string | null
          username: string | null
        }
        Insert: {
          backup_codes?: string[] | null
          categoria?: string[] | null
          created_at?: string | null
          criticita?: string | null
          custom_fields?: Json | null
          id?: string
          is_shared?: boolean | null
          nome: string
          note?: string | null
          notion_created_by?: string | null
          notion_created_time?: string | null
          notion_id?: string | null
          notion_last_edited_by?: string | null
          notion_last_edited_time?: string | null
          password_encrypted?: string | null
          password_hint?: string | null
          password_updated_at?: string | null
          raw_notion_data?: Json | null
          responsabile_email?: string | null
          scadenza_password?: string | null
          security_questions?: Json | null
          tags?: string[] | null
          totp_secret?: string | null
          updated_at?: string | null
          url?: string | null
          username?: string | null
        }
        Update: {
          backup_codes?: string[] | null
          categoria?: string[] | null
          created_at?: string | null
          criticita?: string | null
          custom_fields?: Json | null
          id?: string
          is_shared?: boolean | null
          nome?: string
          note?: string | null
          notion_created_by?: string | null
          notion_created_time?: string | null
          notion_id?: string | null
          notion_last_edited_by?: string | null
          notion_last_edited_time?: string | null
          password_encrypted?: string | null
          password_hint?: string | null
          password_updated_at?: string | null
          raw_notion_data?: Json | null
          responsabile_email?: string | null
          scadenza_password?: string | null
          security_questions?: Json | null
          tags?: string[] | null
          totp_secret?: string | null
          updated_at?: string | null
          url?: string | null
          username?: string | null
        }
        Relationships: []
      }
      credenziali_access: {
        Row: {
          access_level: string | null
          credenziale_id: string | null
          expires_at: string | null
          granted_at: string | null
          granted_by: string | null
          id: string
          role_id: string | null
          user_id: string | null
        }
        Insert: {
          access_level?: string | null
          credenziale_id?: string | null
          expires_at?: string | null
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          role_id?: string | null
          user_id?: string | null
        }
        Update: {
          access_level?: string | null
          credenziale_id?: string | null
          expires_at?: string | null
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          role_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "credenziali_access_credenziale_id_fkey"
            columns: ["credenziale_id"]
            isOneToOne: false
            referencedRelation: "credenziali"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "credenziali_access_granted_by_fkey"
            columns: ["granted_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "credenziali_access_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "credenziali_access_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      credenziali_audit_log: {
        Row: {
          action: string
          changed_fields: Json | null
          credenziale_id: string | null
          id: string
          ip_address: unknown
          timestamp: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          changed_fields?: Json | null
          credenziale_id?: string | null
          id?: string
          ip_address?: unknown
          timestamp?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          changed_fields?: Json | null
          credenziale_id?: string | null
          id?: string
          ip_address?: unknown
          timestamp?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "credenziali_audit_log_credenziale_id_fkey"
            columns: ["credenziale_id"]
            isOneToOne: false
            referencedRelation: "credenziali"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "credenziali_audit_log_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_activities: {
        Row: {
          activity_date: string
          activity_type: string
          completed: boolean | null
          completed_at: string | null
          created_at: string | null
          created_by: string | null
          description: string
          due_date: string | null
          id: string
          lead_id: string | null
          opportunity_id: string | null
          outcome: string | null
          persona_fisica_id: string | null
          persona_giuridica_id: string | null
          quote_id: string | null
          subject: string | null
        }
        Insert: {
          activity_date?: string
          activity_type: string
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          description: string
          due_date?: string | null
          id?: string
          lead_id?: string | null
          opportunity_id?: string | null
          outcome?: string | null
          persona_fisica_id?: string | null
          persona_giuridica_id?: string | null
          quote_id?: string | null
          subject?: string | null
        }
        Update: {
          activity_date?: string
          activity_type?: string
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string
          due_date?: string | null
          id?: string
          lead_id?: string | null
          opportunity_id?: string | null
          outcome?: string | null
          persona_fisica_id?: string | null
          persona_giuridica_id?: string | null
          quote_id?: string | null
          subject?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crm_activities_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_activities_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles_with_email"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_activities_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "crm_leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_activities_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "crm_opportunities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_activities_persona_fisica_id_fkey"
            columns: ["persona_fisica_id"]
            isOneToOne: false
            referencedRelation: "persone_fisiche"
            referencedColumns: ["notion_id"]
          },
          {
            foreignKeyName: "crm_activities_persona_giuridica_id_fkey"
            columns: ["persona_giuridica_id"]
            isOneToOne: false
            referencedRelation: "persone_giuridiche"
            referencedColumns: ["notion_id"]
          },
          {
            foreignKeyName: "crm_activities_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_leads: {
        Row: {
          assigned_to: string | null
          attribution_metadata: Json | null
          azienda: string | null
          budget: number | null
          created_at: string | null
          created_by: string | null
          data_prossimo_contatto: string | null
          data_ultimo_contatto: string | null
          descrizione: string | null
          email: string
          fonte: string | null
          id: string
          marketing_campaign_id: string | null
          marketing_source_id: string | null
          metodo_prossimo_contatto: string | null
          metodo_ultimo_contatto: string | null
          nome_completo: string
          note_interne: string | null
          persona_fisica_id: string | null
          persona_giuridica_id: string | null
          referente_id: string | null
          ruolo: string | null
          servizi_interesse: string[] | null
          status: string
          telefono: string | null
          updated_at: string | null
        }
        Insert: {
          assigned_to?: string | null
          attribution_metadata?: Json | null
          azienda?: string | null
          budget?: number | null
          created_at?: string | null
          created_by?: string | null
          data_prossimo_contatto?: string | null
          data_ultimo_contatto?: string | null
          descrizione?: string | null
          email: string
          fonte?: string | null
          id?: string
          marketing_campaign_id?: string | null
          marketing_source_id?: string | null
          metodo_prossimo_contatto?: string | null
          metodo_ultimo_contatto?: string | null
          nome_completo: string
          note_interne?: string | null
          persona_fisica_id?: string | null
          persona_giuridica_id?: string | null
          referente_id?: string | null
          ruolo?: string | null
          servizi_interesse?: string[] | null
          status?: string
          telefono?: string | null
          updated_at?: string | null
        }
        Update: {
          assigned_to?: string | null
          attribution_metadata?: Json | null
          azienda?: string | null
          budget?: number | null
          created_at?: string | null
          created_by?: string | null
          data_prossimo_contatto?: string | null
          data_ultimo_contatto?: string | null
          descrizione?: string | null
          email?: string
          fonte?: string | null
          id?: string
          marketing_campaign_id?: string | null
          marketing_source_id?: string | null
          metodo_prossimo_contatto?: string | null
          metodo_ultimo_contatto?: string | null
          nome_completo?: string
          note_interne?: string | null
          persona_fisica_id?: string | null
          persona_giuridica_id?: string | null
          referente_id?: string | null
          ruolo?: string | null
          servizi_interesse?: string[] | null
          status?: string
          telefono?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crm_leads_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_leads_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles_with_email"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_leads_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_leads_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles_with_email"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_leads_marketing_campaign_id_fkey"
            columns: ["marketing_campaign_id"]
            isOneToOne: false
            referencedRelation: "marketing_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_leads_marketing_source_id_fkey"
            columns: ["marketing_source_id"]
            isOneToOne: false
            referencedRelation: "marketing_sources"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_leads_persona_fisica_id_fkey"
            columns: ["persona_fisica_id"]
            isOneToOne: false
            referencedRelation: "persone_fisiche"
            referencedColumns: ["notion_id"]
          },
          {
            foreignKeyName: "crm_leads_persona_giuridica_id_fkey"
            columns: ["persona_giuridica_id"]
            isOneToOne: false
            referencedRelation: "persone_giuridiche"
            referencedColumns: ["notion_id"]
          },
          {
            foreignKeyName: "crm_leads_referente_id_fkey"
            columns: ["referente_id"]
            isOneToOne: false
            referencedRelation: "persone_fisiche"
            referencedColumns: ["notion_id"]
          },
        ]
      }
      crm_opportunities: {
        Row: {
          assigned_to: string | null
          closed_at: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          expected_close_date: string | null
          expected_revenue: number | null
          id: string
          lead_id: string
          notes: string | null
          persona_fisica_id: string | null
          persona_giuridica_id: string | null
          probability: number | null
          referente_id: string | null
          stage: string
          updated_at: string | null
        }
        Insert: {
          assigned_to?: string | null
          closed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          expected_close_date?: string | null
          expected_revenue?: number | null
          id?: string
          lead_id: string
          notes?: string | null
          persona_fisica_id?: string | null
          persona_giuridica_id?: string | null
          probability?: number | null
          referente_id?: string | null
          stage?: string
          updated_at?: string | null
        }
        Update: {
          assigned_to?: string | null
          closed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          expected_close_date?: string | null
          expected_revenue?: number | null
          id?: string
          lead_id?: string
          notes?: string | null
          persona_fisica_id?: string | null
          persona_giuridica_id?: string | null
          probability?: number | null
          referente_id?: string | null
          stage?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crm_opportunities_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_opportunities_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles_with_email"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_opportunities_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_opportunities_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles_with_email"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_opportunities_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "crm_leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_opportunities_persona_fisica_id_fkey"
            columns: ["persona_fisica_id"]
            isOneToOne: false
            referencedRelation: "persone_fisiche"
            referencedColumns: ["notion_id"]
          },
          {
            foreignKeyName: "crm_opportunities_persona_giuridica_id_fkey"
            columns: ["persona_giuridica_id"]
            isOneToOne: false
            referencedRelation: "persone_giuridiche"
            referencedColumns: ["notion_id"]
          },
          {
            foreignKeyName: "crm_opportunities_referente_id_fkey"
            columns: ["referente_id"]
            isOneToOne: false
            referencedRelation: "persone_fisiche"
            referencedColumns: ["notion_id"]
          },
        ]
      }
      crm_opportunity_quotes: {
        Row: {
          created_at: string | null
          id: string
          is_primary: boolean | null
          opportunity_id: string
          quote_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_primary?: boolean | null
          opportunity_id: string
          quote_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_primary?: boolean | null
          opportunity_id?: string
          quote_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_opportunity_quotes_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "crm_opportunities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_opportunity_quotes_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
        ]
      }
      intesa_sync_log: {
        Row: {
          bank_account_id: string | null
          completed_at: string | null
          error_message: string | null
          id: string
          records_fetched: number | null
          response_data: Json | null
          started_at: string | null
          status: string | null
          sync_type: string
        }
        Insert: {
          bank_account_id?: string | null
          completed_at?: string | null
          error_message?: string | null
          id?: string
          records_fetched?: number | null
          response_data?: Json | null
          started_at?: string | null
          status?: string | null
          sync_type: string
        }
        Update: {
          bank_account_id?: string | null
          completed_at?: string | null
          error_message?: string | null
          id?: string
          records_fetched?: number | null
          response_data?: Json | null
          started_at?: string | null
          status?: string | null
          sync_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "intesa_sync_log_bank_account_id_fkey"
            columns: ["bank_account_id"]
            isOneToOne: false
            referencedRelation: "bank_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_documents: {
        Row: {
          file_name: string
          file_path: string
          file_size: number | null
          id: string
          invoice_id: string
          metadata: Json | null
          mime_type: string | null
          note: string | null
          numero_documento: string | null
          tipo_documento: string
          uploaded_at: string | null
          uploaded_by: string | null
        }
        Insert: {
          file_name: string
          file_path: string
          file_size?: number | null
          id?: string
          invoice_id: string
          metadata?: Json | null
          mime_type?: string | null
          note?: string | null
          numero_documento?: string | null
          tipo_documento: string
          uploaded_at?: string | null
          uploaded_by?: string | null
        }
        Update: {
          file_name?: string
          file_path?: string
          file_size?: number | null
          id?: string
          invoice_id?: string
          metadata?: Json | null
          mime_type?: string | null
          note?: string | null
          numero_documento?: string | null
          tipo_documento?: string
          uploaded_at?: string | null
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoice_documents_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_documents_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          aruba_id: string | null
          aruba_synced_at: string | null
          aruba_url: string | null
          client_address: string | null
          client_email: string | null
          client_fiscal_code: string | null
          client_name: string
          client_pec: string | null
          client_vat_number: string | null
          created_at: string | null
          created_by: string | null
          due_date: string | null
          id: string
          internal_notes: string | null
          invoice_number: string
          invoice_type: string
          issue_date: string
          items: Json
          notes: string | null
          paid_amount: number | null
          payment_date: string | null
          payment_method: string | null
          payment_status: string | null
          payment_terms: string | null
          pdf_path: string | null
          persona_fisica_id: string | null
          persona_giuridica_id: string | null
          project_id: string | null
          project_milestone_id: string | null
          quote_id: string | null
          status: string | null
          subtotal: number
          tax_amount: number | null
          total_amount: number
          updated_at: string | null
          xml_path: string | null
        }
        Insert: {
          aruba_id?: string | null
          aruba_synced_at?: string | null
          aruba_url?: string | null
          client_address?: string | null
          client_email?: string | null
          client_fiscal_code?: string | null
          client_name: string
          client_pec?: string | null
          client_vat_number?: string | null
          created_at?: string | null
          created_by?: string | null
          due_date?: string | null
          id?: string
          internal_notes?: string | null
          invoice_number: string
          invoice_type: string
          issue_date: string
          items?: Json
          notes?: string | null
          paid_amount?: number | null
          payment_date?: string | null
          payment_method?: string | null
          payment_status?: string | null
          payment_terms?: string | null
          pdf_path?: string | null
          persona_fisica_id?: string | null
          persona_giuridica_id?: string | null
          project_id?: string | null
          project_milestone_id?: string | null
          quote_id?: string | null
          status?: string | null
          subtotal: number
          tax_amount?: number | null
          total_amount: number
          updated_at?: string | null
          xml_path?: string | null
        }
        Update: {
          aruba_id?: string | null
          aruba_synced_at?: string | null
          aruba_url?: string | null
          client_address?: string | null
          client_email?: string | null
          client_fiscal_code?: string | null
          client_name?: string
          client_pec?: string | null
          client_vat_number?: string | null
          created_at?: string | null
          created_by?: string | null
          due_date?: string | null
          id?: string
          internal_notes?: string | null
          invoice_number?: string
          invoice_type?: string
          issue_date?: string
          items?: Json
          notes?: string | null
          paid_amount?: number | null
          payment_date?: string | null
          payment_method?: string | null
          payment_status?: string | null
          payment_terms?: string | null
          pdf_path?: string | null
          persona_fisica_id?: string | null
          persona_giuridica_id?: string | null
          project_id?: string | null
          project_milestone_id?: string | null
          quote_id?: string | null
          status?: string | null
          subtotal?: number
          tax_amount?: number | null
          total_amount?: number
          updated_at?: string | null
          xml_path?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_persona_fisica_id_fkey"
            columns: ["persona_fisica_id"]
            isOneToOne: false
            referencedRelation: "persone_fisiche"
            referencedColumns: ["notion_id"]
          },
          {
            foreignKeyName: "invoices_persona_giuridica_id_fkey"
            columns: ["persona_giuridica_id"]
            isOneToOne: false
            referencedRelation: "persone_giuridiche"
            referencedColumns: ["notion_id"]
          },
          {
            foreignKeyName: "invoices_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_project_milestone_id_fkey"
            columns: ["project_milestone_id"]
            isOneToOne: false
            referencedRelation: "project_milestones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
        ]
      }
      marketing_attribution: {
        Row: {
          browser: string | null
          campaign_id: string | null
          city: string | null
          country: string | null
          created_at: string | null
          device_type: string | null
          first_touch_date: string
          id: string
          ip_address: unknown
          landing_page: string | null
          lead_id: string
          metadata: Json | null
          os: string | null
          referrer: string | null
          source_id: string | null
          user_agent: string | null
          utm_campaign: string | null
          utm_content: string | null
          utm_medium: string | null
          utm_source: string | null
          utm_term: string | null
        }
        Insert: {
          browser?: string | null
          campaign_id?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          device_type?: string | null
          first_touch_date?: string
          id?: string
          ip_address?: unknown
          landing_page?: string | null
          lead_id: string
          metadata?: Json | null
          os?: string | null
          referrer?: string | null
          source_id?: string | null
          user_agent?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
        }
        Update: {
          browser?: string | null
          campaign_id?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          device_type?: string | null
          first_touch_date?: string
          id?: string
          ip_address?: unknown
          landing_page?: string | null
          lead_id?: string
          metadata?: Json | null
          os?: string | null
          referrer?: string | null
          source_id?: string | null
          user_agent?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "marketing_attribution_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "marketing_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketing_attribution_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "crm_leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketing_attribution_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "marketing_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      marketing_campaigns: {
        Row: {
          assigned_to: string | null
          budget_spent: number | null
          budget_total: number | null
          created_at: string | null
          created_by: string | null
          currency: string | null
          description: string | null
          end_date: string | null
          id: string
          landing_page_url: string | null
          metadata: Json | null
          name: string
          objective: string | null
          slug: string
          source_id: string
          start_date: string
          status: string
          target_conversions: number | null
          target_leads: number | null
          target_revenue: number | null
          updated_at: string | null
          utm_campaign: string | null
          utm_content: string | null
          utm_medium: string | null
          utm_source: string | null
          utm_term: string | null
        }
        Insert: {
          assigned_to?: string | null
          budget_spent?: number | null
          budget_total?: number | null
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          landing_page_url?: string | null
          metadata?: Json | null
          name: string
          objective?: string | null
          slug: string
          source_id: string
          start_date: string
          status?: string
          target_conversions?: number | null
          target_leads?: number | null
          target_revenue?: number | null
          updated_at?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
        }
        Update: {
          assigned_to?: string | null
          budget_spent?: number | null
          budget_total?: number | null
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          landing_page_url?: string | null
          metadata?: Json | null
          name?: string
          objective?: string | null
          slug?: string
          source_id?: string
          start_date?: string
          status?: string
          target_conversions?: number | null
          target_leads?: number | null
          target_revenue?: number | null
          updated_at?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "marketing_campaigns_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketing_campaigns_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles_with_email"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketing_campaigns_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketing_campaigns_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles_with_email"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketing_campaigns_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "marketing_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      marketing_feedback: {
        Row: {
          aspettative_soddisfatte: boolean | null
          assegnato_a: string | null
          consiglierebbe_sicilean: boolean | null
          cosa_apprezzato: string | null
          cosa_migliorare: string | null
          created_at: string | null
          email_referente: string | null
          feedback_type: string
          fonte: string | null
          id: string
          interessato_futuri_progetti: boolean | null
          ip_address: unknown
          marketing_consent: boolean | null
          nome_referente: string | null
          note_aggiuntive: string | null
          note_interne: string | null
          nps_reason: string | null
          nps_score: number | null
          persona_giuridica_id: string | null
          privacy_consent: boolean
          project_id: string
          puo_usare_pubblicamente: boolean | null
          rating_commerciale: number | null
          rating_comunicazione: number | null
          rating_costi: number | null
          rating_overall: number | null
          rating_qualita: number | null
          rating_team: number | null
          rating_tempi: number | null
          responses: Json
          ruolo_referente: string | null
          stato: string | null
          updated_at: string | null
          user_agent: string | null
        }
        Insert: {
          aspettative_soddisfatte?: boolean | null
          assegnato_a?: string | null
          consiglierebbe_sicilean?: boolean | null
          cosa_apprezzato?: string | null
          cosa_migliorare?: string | null
          created_at?: string | null
          email_referente?: string | null
          feedback_type: string
          fonte?: string | null
          id?: string
          interessato_futuri_progetti?: boolean | null
          ip_address?: unknown
          marketing_consent?: boolean | null
          nome_referente?: string | null
          note_aggiuntive?: string | null
          note_interne?: string | null
          nps_reason?: string | null
          nps_score?: number | null
          persona_giuridica_id?: string | null
          privacy_consent?: boolean
          project_id: string
          puo_usare_pubblicamente?: boolean | null
          rating_commerciale?: number | null
          rating_comunicazione?: number | null
          rating_costi?: number | null
          rating_overall?: number | null
          rating_qualita?: number | null
          rating_team?: number | null
          rating_tempi?: number | null
          responses?: Json
          ruolo_referente?: string | null
          stato?: string | null
          updated_at?: string | null
          user_agent?: string | null
        }
        Update: {
          aspettative_soddisfatte?: boolean | null
          assegnato_a?: string | null
          consiglierebbe_sicilean?: boolean | null
          cosa_apprezzato?: string | null
          cosa_migliorare?: string | null
          created_at?: string | null
          email_referente?: string | null
          feedback_type?: string
          fonte?: string | null
          id?: string
          interessato_futuri_progetti?: boolean | null
          ip_address?: unknown
          marketing_consent?: boolean | null
          nome_referente?: string | null
          note_aggiuntive?: string | null
          note_interne?: string | null
          nps_reason?: string | null
          nps_score?: number | null
          persona_giuridica_id?: string | null
          privacy_consent?: boolean
          project_id?: string
          puo_usare_pubblicamente?: boolean | null
          rating_commerciale?: number | null
          rating_comunicazione?: number | null
          rating_costi?: number | null
          rating_overall?: number | null
          rating_qualita?: number | null
          rating_team?: number | null
          rating_tempi?: number | null
          responses?: Json
          ruolo_referente?: string | null
          stato?: string | null
          updated_at?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "marketing_feedback_assegnato_a_fkey"
            columns: ["assegnato_a"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketing_feedback_persona_giuridica_id_fkey"
            columns: ["persona_giuridica_id"]
            isOneToOne: false
            referencedRelation: "persone_giuridiche"
            referencedColumns: ["notion_id"]
          },
          {
            foreignKeyName: "marketing_feedback_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      marketing_feedback_tokens: {
        Row: {
          created_at: string | null
          created_by: string | null
          expires_at: string
          feedback_type: string
          id: string
          is_active: boolean | null
          last_used_at: string | null
          max_usage: number | null
          notes: string | null
          persona_giuridica_id: string
          project_id: string
          token: string
          usage_count: number | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          expires_at: string
          feedback_type: string
          id?: string
          is_active?: boolean | null
          last_used_at?: string | null
          max_usage?: number | null
          notes?: string | null
          persona_giuridica_id: string
          project_id: string
          token: string
          usage_count?: number | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          expires_at?: string
          feedback_type?: string
          id?: string
          is_active?: boolean | null
          last_used_at?: string | null
          max_usage?: number | null
          notes?: string | null
          persona_giuridica_id?: string
          project_id?: string
          token?: string
          usage_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "marketing_feedback_tokens_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketing_feedback_tokens_persona_giuridica_id_fkey"
            columns: ["persona_giuridica_id"]
            isOneToOne: false
            referencedRelation: "persone_giuridiche"
            referencedColumns: ["notion_id"]
          },
          {
            foreignKeyName: "marketing_feedback_tokens_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      marketing_sources: {
        Row: {
          auto_assign_to: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          is_paid: boolean
          metadata: Json | null
          name: string
          slug: string
          status: string
          tracking_enabled: boolean
          type: string
          updated_at: string | null
          url: string | null
        }
        Insert: {
          auto_assign_to?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_paid?: boolean
          metadata?: Json | null
          name: string
          slug: string
          status?: string
          tracking_enabled?: boolean
          type: string
          updated_at?: string | null
          url?: string | null
        }
        Update: {
          auto_assign_to?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_paid?: boolean
          metadata?: Json | null
          name?: string
          slug?: string
          status?: string
          tracking_enabled?: boolean
          type?: string
          updated_at?: string | null
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "marketing_sources_auto_assign_to_fkey"
            columns: ["auto_assign_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketing_sources_auto_assign_to_fkey"
            columns: ["auto_assign_to"]
            isOneToOne: false
            referencedRelation: "profiles_with_email"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketing_sources_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketing_sources_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles_with_email"
            referencedColumns: ["id"]
          },
        ]
      }
      oauth_callbacks: {
        Row: {
          client_ip: string | null
          code: string | null
          created_at: string | null
          error: string | null
          expires_at: string | null
          id: string
          provider: string
          state: string | null
        }
        Insert: {
          client_ip?: string | null
          code?: string | null
          created_at?: string | null
          error?: string | null
          expires_at?: string | null
          id?: string
          provider: string
          state?: string | null
        }
        Update: {
          client_ip?: string | null
          code?: string | null
          created_at?: string | null
          error?: string | null
          expires_at?: string | null
          id?: string
          provider?: string
          state?: string | null
        }
        Relationships: []
      }
      permissions: {
        Row: {
          action: string
          created_at: string | null
          id: string
          resource: string
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          resource: string
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          resource?: string
        }
        Relationships: []
      }
      persone_fisiche: {
        Row: {
          archetipo: Json | null
          cariche_non_piu_ricoperte: string | null
          codice_fiscale: string | null
          contatti: Json | null
          created_by: string | null
          created_time: string
          data_nascita: string | null
          documenti: Json | null
          famiglia: Json | null
          indirizzo: string | null
          is_sent_n8n: boolean | null
          last_edited_by: string | null
          last_edited_time: string
          legami_aziende: string | null
          metodo_contatto_preferito: Json | null
          migration_created_at: string | null
          migration_updated_at: string | null
          nome_completo: string
          note: string | null
          notion_id: string
          orari_disponibilita: string | null
          pregiudizievoli: string | null
          presenza_online: Json | null
          protesti: string | null
          raw_notion_data: Json | null
        }
        Insert: {
          archetipo?: Json | null
          cariche_non_piu_ricoperte?: string | null
          codice_fiscale?: string | null
          contatti?: Json | null
          created_by?: string | null
          created_time: string
          data_nascita?: string | null
          documenti?: Json | null
          famiglia?: Json | null
          indirizzo?: string | null
          is_sent_n8n?: boolean | null
          last_edited_by?: string | null
          last_edited_time: string
          legami_aziende?: string | null
          metodo_contatto_preferito?: Json | null
          migration_created_at?: string | null
          migration_updated_at?: string | null
          nome_completo: string
          note?: string | null
          notion_id: string
          orari_disponibilita?: string | null
          pregiudizievoli?: string | null
          presenza_online?: Json | null
          protesti?: string | null
          raw_notion_data?: Json | null
        }
        Update: {
          archetipo?: Json | null
          cariche_non_piu_ricoperte?: string | null
          codice_fiscale?: string | null
          contatti?: Json | null
          created_by?: string | null
          created_time?: string
          data_nascita?: string | null
          documenti?: Json | null
          famiglia?: Json | null
          indirizzo?: string | null
          is_sent_n8n?: boolean | null
          last_edited_by?: string | null
          last_edited_time?: string
          legami_aziende?: string | null
          metodo_contatto_preferito?: Json | null
          migration_created_at?: string | null
          migration_updated_at?: string | null
          nome_completo?: string
          note?: string | null
          notion_id?: string
          orari_disponibilita?: string | null
          pregiudizievoli?: string | null
          presenza_online?: Json | null
          protesti?: string | null
          raw_notion_data?: Json | null
        }
        Relationships: []
      }
      persone_fisiche_relazioni: {
        Row: {
          created_at: string | null
          id: number
          note: string | null
          persona_fisica_id: string | null
          persona_giuridica_id: string | null
          tipo_relazione: string
        }
        Insert: {
          created_at?: string | null
          id?: number
          note?: string | null
          persona_fisica_id?: string | null
          persona_giuridica_id?: string | null
          tipo_relazione: string
        }
        Update: {
          created_at?: string | null
          id?: number
          note?: string | null
          persona_fisica_id?: string | null
          persona_giuridica_id?: string | null
          tipo_relazione?: string
        }
        Relationships: [
          {
            foreignKeyName: "persone_fisiche_relazioni_persona_fisica_id_fkey"
            columns: ["persona_fisica_id"]
            isOneToOne: false
            referencedRelation: "persone_fisiche"
            referencedColumns: ["notion_id"]
          },
          {
            foreignKeyName: "persone_fisiche_relazioni_persona_giuridica_id_fkey"
            columns: ["persona_giuridica_id"]
            isOneToOne: false
            referencedRelation: "persone_giuridiche"
            referencedColumns: ["notion_id"]
          },
        ]
      }
      persone_fisiche_relazioni_interne: {
        Row: {
          created_at: string | null
          id: number
          note: string | null
          persona_fisica_id_1: string | null
          persona_fisica_id_2: string | null
          tipo_relazione: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: number
          note?: string | null
          persona_fisica_id_1?: string | null
          persona_fisica_id_2?: string | null
          tipo_relazione: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: number
          note?: string | null
          persona_fisica_id_1?: string | null
          persona_fisica_id_2?: string | null
          tipo_relazione?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "persone_fisiche_relazioni_interne_persona_fisica_id_1_fkey"
            columns: ["persona_fisica_id_1"]
            isOneToOne: false
            referencedRelation: "persone_fisiche"
            referencedColumns: ["notion_id"]
          },
          {
            foreignKeyName: "persone_fisiche_relazioni_interne_persona_fisica_id_2_fkey"
            columns: ["persona_fisica_id_2"]
            isOneToOne: false
            referencedRelation: "persone_fisiche"
            referencedColumns: ["notion_id"]
          },
        ]
      }
      persone_giuridiche: {
        Row: {
          archetipo: string | null
          area_geografica: string | null
          attivita_operativa: Json | null
          blog: string | null
          brand_assets: string | null
          categoria_interna: string | null
          categoria_prodotti: string | null
          certificazioni: Json | null
          certificazioni_standardizzate: string[] | null
          cliente: boolean | null
          clienti_chiave: string | null
          codice_fiscale: string | null
          codici_ateco: string[] | null
          comune: string | null
          contatti_telefonici: Json | null
          counterparty_id: string | null
          created_by: string | null
          created_time: string
          data_costituzione: string | null
          dati_finanziari: Json | null
          descrizione_core_business: string | null
          documenti: Json | null
          email: Json | null
          facebook: string | null
          fascicolo_aziendale: Json | null
          fatturato_storico: Json | null
          figura_chiave: string | null
          forma_giuridica: string | null
          instagram: string | null
          is_associazione: boolean | null
          is_azienda_privata: boolean | null
          is_competitor: boolean | null
          is_ente_pubblico: boolean | null
          is_sent_n8n: boolean | null
          last_edited_by: string | null
          last_edited_time: string
          linkedin: string | null
          migration_created_at: string | null
          migration_updated_at: string | null
          note: string | null
          notion_id: string
          numero_addetti: number | null
          p_iva: string | null
          provincia: string | null
          ragione_sociale: string
          raw_notion_data: Json | null
          rea: string | null
          relazioni_commerciali: string[] | null
          sdi_code: string | null
          sede_legale: string | null
          segmento: string | null
          settore: string | null
          sito_web: string | null
          target_generale: Json | null
          tier_internal: string | null
          tiktok: string | null
          tipo_organizzazione: string | null
          unita_locali: string | null
          visura: Json | null
          x: string | null
          youtube: string | null
        }
        Insert: {
          archetipo?: string | null
          area_geografica?: string | null
          attivita_operativa?: Json | null
          blog?: string | null
          brand_assets?: string | null
          categoria_interna?: string | null
          categoria_prodotti?: string | null
          certificazioni?: Json | null
          certificazioni_standardizzate?: string[] | null
          cliente?: boolean | null
          clienti_chiave?: string | null
          codice_fiscale?: string | null
          codici_ateco?: string[] | null
          comune?: string | null
          contatti_telefonici?: Json | null
          counterparty_id?: string | null
          created_by?: string | null
          created_time: string
          data_costituzione?: string | null
          dati_finanziari?: Json | null
          descrizione_core_business?: string | null
          documenti?: Json | null
          email?: Json | null
          facebook?: string | null
          fascicolo_aziendale?: Json | null
          fatturato_storico?: Json | null
          figura_chiave?: string | null
          forma_giuridica?: string | null
          instagram?: string | null
          is_associazione?: boolean | null
          is_azienda_privata?: boolean | null
          is_competitor?: boolean | null
          is_ente_pubblico?: boolean | null
          is_sent_n8n?: boolean | null
          last_edited_by?: string | null
          last_edited_time: string
          linkedin?: string | null
          migration_created_at?: string | null
          migration_updated_at?: string | null
          note?: string | null
          notion_id: string
          numero_addetti?: number | null
          p_iva?: string | null
          provincia?: string | null
          ragione_sociale: string
          raw_notion_data?: Json | null
          rea?: string | null
          relazioni_commerciali?: string[] | null
          sdi_code?: string | null
          sede_legale?: string | null
          segmento?: string | null
          settore?: string | null
          sito_web?: string | null
          target_generale?: Json | null
          tier_internal?: string | null
          tiktok?: string | null
          tipo_organizzazione?: string | null
          unita_locali?: string | null
          visura?: Json | null
          x?: string | null
          youtube?: string | null
        }
        Update: {
          archetipo?: string | null
          area_geografica?: string | null
          attivita_operativa?: Json | null
          blog?: string | null
          brand_assets?: string | null
          categoria_interna?: string | null
          categoria_prodotti?: string | null
          certificazioni?: Json | null
          certificazioni_standardizzate?: string[] | null
          cliente?: boolean | null
          clienti_chiave?: string | null
          codice_fiscale?: string | null
          codici_ateco?: string[] | null
          comune?: string | null
          contatti_telefonici?: Json | null
          counterparty_id?: string | null
          created_by?: string | null
          created_time?: string
          data_costituzione?: string | null
          dati_finanziari?: Json | null
          descrizione_core_business?: string | null
          documenti?: Json | null
          email?: Json | null
          facebook?: string | null
          fascicolo_aziendale?: Json | null
          fatturato_storico?: Json | null
          figura_chiave?: string | null
          forma_giuridica?: string | null
          instagram?: string | null
          is_associazione?: boolean | null
          is_azienda_privata?: boolean | null
          is_competitor?: boolean | null
          is_ente_pubblico?: boolean | null
          is_sent_n8n?: boolean | null
          last_edited_by?: string | null
          last_edited_time?: string
          linkedin?: string | null
          migration_created_at?: string | null
          migration_updated_at?: string | null
          note?: string | null
          notion_id?: string
          numero_addetti?: number | null
          p_iva?: string | null
          provincia?: string | null
          ragione_sociale?: string
          raw_notion_data?: Json | null
          rea?: string | null
          relazioni_commerciali?: string[] | null
          sdi_code?: string | null
          sede_legale?: string | null
          segmento?: string | null
          settore?: string | null
          sito_web?: string | null
          target_generale?: Json | null
          tier_internal?: string | null
          tiktok?: string | null
          tipo_organizzazione?: string | null
          unita_locali?: string | null
          visura?: Json | null
          x?: string | null
          youtube?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "persone_giuridiche_counterparty_id_fkey"
            columns: ["counterparty_id"]
            isOneToOne: false
            referencedRelation: "counterparties"
            referencedColumns: ["id"]
          },
        ]
      }
      persone_giuridiche_relazioni: {
        Row: {
          azienda_id_1: string | null
          azienda_id_2: string | null
          created_at: string | null
          id: number
          note: string | null
          tipo_relazione: string
          updated_at: string | null
        }
        Insert: {
          azienda_id_1?: string | null
          azienda_id_2?: string | null
          created_at?: string | null
          id?: number
          note?: string | null
          tipo_relazione: string
          updated_at?: string | null
        }
        Update: {
          azienda_id_1?: string | null
          azienda_id_2?: string | null
          created_at?: string | null
          id?: number
          note?: string | null
          tipo_relazione?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "persone_giuridiche_relazioni_azienda_id_1_fkey"
            columns: ["azienda_id_1"]
            isOneToOne: false
            referencedRelation: "persone_giuridiche"
            referencedColumns: ["notion_id"]
          },
          {
            foreignKeyName: "persone_giuridiche_relazioni_azienda_id_2_fkey"
            columns: ["azienda_id_2"]
            isOneToOne: false
            referencedRelation: "persone_giuridiche"
            referencedColumns: ["notion_id"]
          },
        ]
      }
      pricing_configuration: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean
          moltiplicatore_arrotondamento: number
          moltiplicatore_base: number
          name: string
          peso_cliente_abituale: number
          peso_complessita: number
          peso_importanza: number
          peso_prosperita_economica: number
          peso_urgenza: number
          peso_volume_lavoro: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          moltiplicatore_arrotondamento?: number
          moltiplicatore_base?: number
          name?: string
          peso_cliente_abituale?: number
          peso_complessita?: number
          peso_importanza?: number
          peso_prosperita_economica?: number
          peso_urgenza?: number
          peso_volume_lavoro?: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          moltiplicatore_arrotondamento?: number
          moltiplicatore_base?: number
          name?: string
          peso_cliente_abituale?: number
          peso_complessita?: number
          peso_importanza?: number
          peso_prosperita_economica?: number
          peso_urgenza?: number
          peso_volume_lavoro?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pricing_configuration_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      pricing_rules: {
        Row: {
          action_type: string
          action_value: number
          conditions: Json
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          priority: number
          updated_at: string | null
          valid_from: string | null
          valid_until: string | null
        }
        Insert: {
          action_type: string
          action_value: number
          conditions: Json
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          priority?: number
          updated_at?: string | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Update: {
          action_type?: string
          action_value?: number
          conditions?: Json
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          priority?: number
          updated_at?: string | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pricing_rules_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_documents: {
        Row: {
          descrizione: string | null
          file_path: string
          file_size: number | null
          id: string
          mime_type: string | null
          nome_file: string
          tipo_documento: string
          updated_at: string | null
          uploaded_at: string | null
          user_id: string
        }
        Insert: {
          descrizione?: string | null
          file_path: string
          file_size?: number | null
          id?: string
          mime_type?: string | null
          nome_file: string
          tipo_documento: string
          updated_at?: string | null
          uploaded_at?: string | null
          user_id: string
        }
        Update: {
          descrizione?: string | null
          file_path?: string
          file_size?: number | null
          id?: string
          mime_type?: string | null
          nome_file?: string
          tipo_documento?: string
          updated_at?: string | null
          uploaded_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profile_documents_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_documents_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles_with_email"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          anime_preferito: string | null
          bio: string | null
          cognome: string | null
          colore_preferito: string | null
          created_at: string | null
          data_nascita: string | null
          email_personale: string | null
          film_preferito: string | null
          foto_profilo: string | null
          genere_musicale: string | null
          id: string
          informazioni_aggiuntive: Json | null
          interessi: string[] | null
          is_super_admin: boolean | null
          nome: string | null
          professione: string | null
          telefono: string | null
          updated_at: string | null
        }
        Insert: {
          anime_preferito?: string | null
          bio?: string | null
          cognome?: string | null
          colore_preferito?: string | null
          created_at?: string | null
          data_nascita?: string | null
          email_personale?: string | null
          film_preferito?: string | null
          foto_profilo?: string | null
          genere_musicale?: string | null
          id: string
          informazioni_aggiuntive?: Json | null
          interessi?: string[] | null
          is_super_admin?: boolean | null
          nome?: string | null
          professione?: string | null
          telefono?: string | null
          updated_at?: string | null
        }
        Update: {
          anime_preferito?: string | null
          bio?: string | null
          cognome?: string | null
          colore_preferito?: string | null
          created_at?: string | null
          data_nascita?: string | null
          email_personale?: string | null
          film_preferito?: string | null
          foto_profilo?: string | null
          genere_musicale?: string | null
          id?: string
          informazioni_aggiuntive?: Json | null
          interessi?: string[] | null
          is_super_admin?: boolean | null
          nome?: string | null
          professione?: string | null
          telefono?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      project_feedback: {
        Row: {
          area_progetto: string | null
          assegnato_a: string | null
          attachments: string[] | null
          autore: string | null
          created_at: string
          data_risoluzione: string | null
          descrizione: string
          fonte: string
          id: string
          milestone_id: string | null
          priorita: string
          project_id: string
          richiedente_email: string | null
          richiedente_nome: string | null
          risposta: string | null
          stato: string
          tipo: string
          titolo: string
          updated_at: string
        }
        Insert: {
          area_progetto?: string | null
          assegnato_a?: string | null
          attachments?: string[] | null
          autore?: string | null
          created_at?: string
          data_risoluzione?: string | null
          descrizione: string
          fonte?: string
          id?: string
          milestone_id?: string | null
          priorita?: string
          project_id: string
          richiedente_email?: string | null
          richiedente_nome?: string | null
          risposta?: string | null
          stato?: string
          tipo: string
          titolo: string
          updated_at?: string
        }
        Update: {
          area_progetto?: string | null
          assegnato_a?: string | null
          attachments?: string[] | null
          autore?: string | null
          created_at?: string
          data_risoluzione?: string | null
          descrizione?: string
          fonte?: string
          id?: string
          milestone_id?: string | null
          priorita?: string
          project_id?: string
          richiedente_email?: string | null
          richiedente_nome?: string | null
          risposta?: string | null
          stato?: string
          tipo?: string
          titolo?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_feedback_assegnato_a_fkey"
            columns: ["assegnato_a"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_feedback_milestone_id_fkey"
            columns: ["milestone_id"]
            isOneToOne: false
            referencedRelation: "project_milestones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_feedback_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_feedback_tokens: {
        Row: {
          created_at: string
          created_by: string | null
          expires_at: string | null
          id: string
          is_active: boolean
          last_used_at: string | null
          notes: string | null
          project_id: string
          token: string
          usage_count: number
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean
          last_used_at?: string | null
          notes?: string | null
          project_id: string
          token: string
          usage_count?: number
        }
        Update: {
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean
          last_used_at?: string | null
          notes?: string | null
          project_id?: string
          token?: string
          usage_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "project_feedback_tokens_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_feedback_tokens_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_files: {
        Row: {
          categoria: string
          descrizione: string | null
          display_order: number
          external_url: string | null
          file_path: string | null
          file_size: number | null
          id: string
          mime_type: string | null
          nome_file: string
          project_id: string
          project_milestone_id: string | null
          sottocategoria: string | null
          tags: string[] | null
          uploaded_at: string | null
          uploaded_by: string | null
        }
        Insert: {
          categoria: string
          descrizione?: string | null
          display_order?: number
          external_url?: string | null
          file_path?: string | null
          file_size?: number | null
          id?: string
          mime_type?: string | null
          nome_file: string
          project_id: string
          project_milestone_id?: string | null
          sottocategoria?: string | null
          tags?: string[] | null
          uploaded_at?: string | null
          uploaded_by?: string | null
        }
        Update: {
          categoria?: string
          descrizione?: string | null
          display_order?: number
          external_url?: string | null
          file_path?: string | null
          file_size?: number | null
          id?: string
          mime_type?: string | null
          nome_file?: string
          project_id?: string
          project_milestone_id?: string | null
          sottocategoria?: string | null
          tags?: string[] | null
          uploaded_at?: string | null
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_files_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_files_project_milestone_id_fkey"
            columns: ["project_milestone_id"]
            isOneToOne: false
            referencedRelation: "project_milestones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_files_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      project_milestones: {
        Row: {
          created_at: string | null
          data_completamento: string | null
          data_target: string
          deliverables: string[] | null
          descrizione: string | null
          display_order: number
          id: string
          importo: number | null
          nome: string
          percentuale_completamento: number
          project_id: string
          stato: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          data_completamento?: string | null
          data_target: string
          deliverables?: string[] | null
          descrizione?: string | null
          display_order?: number
          id?: string
          importo?: number | null
          nome: string
          percentuale_completamento?: number
          project_id: string
          stato?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          data_completamento?: string | null
          data_target?: string
          deliverables?: string[] | null
          descrizione?: string | null
          display_order?: number
          id?: string
          importo?: number | null
          nome?: string
          percentuale_completamento?: number
          project_id?: string
          stato?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_milestones_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          created_at: string | null
          created_by: string | null
          data_avvio_lavori: string | null
          data_chiusura: string | null
          data_consegna_effettiva: string | null
          data_consegna_prevista: string | null
          data_creazione: string | null
          data_firma_contratto: string | null
          descrizione: string | null
          id: string
          nome: string
          note_interne: string | null
          persona_fisica_id: string | null
          persona_giuridica_id: string | null
          priorita: string | null
          project_number: string
          project_types: string[] | null
          quote_id: string | null
          referente_sicilean_user_id: string | null
          stato: string
          tags: string[] | null
          team_members: string[] | null
          updated_at: string | null
          valore_effettivo: number | null
          valore_preventivato: number | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          data_avvio_lavori?: string | null
          data_chiusura?: string | null
          data_consegna_effettiva?: string | null
          data_consegna_prevista?: string | null
          data_creazione?: string | null
          data_firma_contratto?: string | null
          descrizione?: string | null
          id?: string
          nome: string
          note_interne?: string | null
          persona_fisica_id?: string | null
          persona_giuridica_id?: string | null
          priorita?: string | null
          project_number: string
          project_types?: string[] | null
          quote_id?: string | null
          referente_sicilean_user_id?: string | null
          stato?: string
          tags?: string[] | null
          team_members?: string[] | null
          updated_at?: string | null
          valore_effettivo?: number | null
          valore_preventivato?: number | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          data_avvio_lavori?: string | null
          data_chiusura?: string | null
          data_consegna_effettiva?: string | null
          data_consegna_prevista?: string | null
          data_creazione?: string | null
          data_firma_contratto?: string | null
          descrizione?: string | null
          id?: string
          nome?: string
          note_interne?: string | null
          persona_fisica_id?: string | null
          persona_giuridica_id?: string | null
          priorita?: string | null
          project_number?: string
          project_types?: string[] | null
          quote_id?: string | null
          referente_sicilean_user_id?: string | null
          stato?: string
          tags?: string[] | null
          team_members?: string[] | null
          updated_at?: string | null
          valore_effettivo?: number | null
          valore_preventivato?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "projects_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_persona_fisica_id_fkey"
            columns: ["persona_fisica_id"]
            isOneToOne: false
            referencedRelation: "persone_fisiche"
            referencedColumns: ["notion_id"]
          },
          {
            foreignKeyName: "projects_persona_giuridica_id_fkey"
            columns: ["persona_giuridica_id"]
            isOneToOne: false
            referencedRelation: "persone_giuridiche"
            referencedColumns: ["notion_id"]
          },
          {
            foreignKeyName: "projects_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_referente_sicilean_user_id_fkey"
            columns: ["referente_sicilean_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      quote_templates: {
        Row: {
          category: string | null
          configuration: Json
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          is_public: boolean | null
          name: string
          services: Json
          updated_at: string | null
          usage_count: number | null
        }
        Insert: {
          category?: string | null
          configuration?: Json
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          name: string
          services?: Json
          updated_at?: string | null
          usage_count?: number | null
        }
        Update: {
          category?: string | null
          configuration?: Json
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          name?: string
          services?: Json
          updated_at?: string | null
          usage_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "quote_templates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      quote_terms: {
        Row: {
          content: string
          created_at: string | null
          display_order: number | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      quotes: {
        Row: {
          accepted_at: string | null
          client_address: string | null
          client_company: string | null
          client_email: string
          client_fiscal_code: string | null
          client_name: string
          client_phone: string | null
          client_sdi_code: string | null
          client_type: string
          client_vat_number: string | null
          configuration: Json
          contact_id: string | null
          created_at: string | null
          created_by: string | null
          declined_at: string | null
          discount_amount: number | null
          discount_percentage: number | null
          expires_at: string | null
          id: string
          internal_notes: string | null
          invoice_id: string | null
          invoiced_at: string | null
          is_template: boolean | null
          notes: string | null
          objectives: string | null
          pdf_generated_at: string | null
          pdf_path: string | null
          persona_fisica_id: string | null
          persona_giuridica_id: string | null
          project_id: string | null
          project_name: string | null
          quote_number: string
          referente_name: string | null
          referente_role: string | null
          sent_at: string | null
          services: Json
          status: string
          subtotal: number | null
          tax_amount: number | null
          tax_percentage: number | null
          team_members: string[] | null
          template_id: string | null
          timeline: Json | null
          total_amount: number | null
          updated_at: string | null
          valid_until: string | null
          vision_summary: string | null
        }
        Insert: {
          accepted_at?: string | null
          client_address?: string | null
          client_company?: string | null
          client_email: string
          client_fiscal_code?: string | null
          client_name: string
          client_phone?: string | null
          client_sdi_code?: string | null
          client_type: string
          client_vat_number?: string | null
          configuration?: Json
          contact_id?: string | null
          created_at?: string | null
          created_by?: string | null
          declined_at?: string | null
          discount_amount?: number | null
          discount_percentage?: number | null
          expires_at?: string | null
          id?: string
          internal_notes?: string | null
          invoice_id?: string | null
          invoiced_at?: string | null
          is_template?: boolean | null
          notes?: string | null
          objectives?: string | null
          pdf_generated_at?: string | null
          pdf_path?: string | null
          persona_fisica_id?: string | null
          persona_giuridica_id?: string | null
          project_id?: string | null
          project_name?: string | null
          quote_number: string
          referente_name?: string | null
          referente_role?: string | null
          sent_at?: string | null
          services?: Json
          status?: string
          subtotal?: number | null
          tax_amount?: number | null
          tax_percentage?: number | null
          team_members?: string[] | null
          template_id?: string | null
          timeline?: Json | null
          total_amount?: number | null
          updated_at?: string | null
          valid_until?: string | null
          vision_summary?: string | null
        }
        Update: {
          accepted_at?: string | null
          client_address?: string | null
          client_company?: string | null
          client_email?: string
          client_fiscal_code?: string | null
          client_name?: string
          client_phone?: string | null
          client_sdi_code?: string | null
          client_type?: string
          client_vat_number?: string | null
          configuration?: Json
          contact_id?: string | null
          created_at?: string | null
          created_by?: string | null
          declined_at?: string | null
          discount_amount?: number | null
          discount_percentage?: number | null
          expires_at?: string | null
          id?: string
          internal_notes?: string | null
          invoice_id?: string | null
          invoiced_at?: string | null
          is_template?: boolean | null
          notes?: string | null
          objectives?: string | null
          pdf_generated_at?: string | null
          pdf_path?: string | null
          persona_fisica_id?: string | null
          persona_giuridica_id?: string | null
          project_id?: string | null
          project_name?: string | null
          quote_number?: string
          referente_name?: string | null
          referente_role?: string | null
          sent_at?: string | null
          services?: Json
          status?: string
          subtotal?: number | null
          tax_amount?: number | null
          tax_percentage?: number | null
          team_members?: string[] | null
          template_id?: string | null
          timeline?: Json | null
          total_amount?: number | null
          updated_at?: string | null
          valid_until?: string | null
          vision_summary?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quotes_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotes_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotes_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotes_persona_fisica_id_fkey"
            columns: ["persona_fisica_id"]
            isOneToOne: false
            referencedRelation: "persone_fisiche"
            referencedColumns: ["notion_id"]
          },
          {
            foreignKeyName: "quotes_persona_giuridica_id_fkey"
            columns: ["persona_giuridica_id"]
            isOneToOne: false
            referencedRelation: "persone_giuridiche"
            referencedColumns: ["notion_id"]
          },
          {
            foreignKeyName: "quotes_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      rbac_audit_log: {
        Row: {
          action_type: string
          created_at: string
          id: string
          ip_address: unknown
          new_values: Json | null
          old_values: Json | null
          performed_by: string | null
          performed_by_email: string | null
          permission_action: string | null
          permission_id: string | null
          permission_resource: string | null
          reason: string | null
          role_id: string | null
          role_name: string | null
          target_user_email: string | null
          target_user_id: string | null
          user_agent: string | null
        }
        Insert: {
          action_type: string
          created_at?: string
          id?: string
          ip_address?: unknown
          new_values?: Json | null
          old_values?: Json | null
          performed_by?: string | null
          performed_by_email?: string | null
          permission_action?: string | null
          permission_id?: string | null
          permission_resource?: string | null
          reason?: string | null
          role_id?: string | null
          role_name?: string | null
          target_user_email?: string | null
          target_user_id?: string | null
          user_agent?: string | null
        }
        Update: {
          action_type?: string
          created_at?: string
          id?: string
          ip_address?: unknown
          new_values?: Json | null
          old_values?: Json | null
          performed_by?: string | null
          performed_by_email?: string | null
          permission_action?: string | null
          permission_id?: string | null
          permission_resource?: string | null
          reason?: string | null
          role_id?: string | null
          role_name?: string | null
          target_user_email?: string | null
          target_user_id?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rbac_audit_log_performed_by_fkey"
            columns: ["performed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      revolut_team_members: {
        Row: {
          created_at: string
          email: string
          first_name: string
          id: string
          last_name: string
          raw_data: Json | null
          role_id: string
          state: string
          sync_created_at: string | null
          sync_updated_at: string | null
          updated_at: string
        }
        Insert: {
          created_at: string
          email: string
          first_name: string
          id: string
          last_name: string
          raw_data?: Json | null
          role_id: string
          state: string
          sync_created_at?: string | null
          sync_updated_at?: string | null
          updated_at: string
        }
        Update: {
          created_at?: string
          email?: string
          first_name?: string
          id?: string
          last_name?: string
          raw_data?: Json | null
          role_id?: string
          state?: string
          sync_created_at?: string | null
          sync_updated_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      role_permissions: {
        Row: {
          created_at: string | null
          id: string
          permission_id: string
          role_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          permission_id: string
          role_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          permission_id?: string
          role_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "role_permissions_permission_id_fkey"
            columns: ["permission_id"]
            isOneToOne: false
            referencedRelation: "permissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "role_permissions_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      roles: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      service_modules: {
        Row: {
          base_price: number
          category: string | null
          created_at: string | null
          description: string | null
          display_order: number | null
          help_text: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          metadata: Json | null
          module_type: string
          name: string
          parameters: Json | null
          pricing_config: Json | null
          pricing_type: string
          slug: string
          updated_at: string | null
        }
        Insert: {
          base_price?: number
          category?: string | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          help_text?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          module_type: string
          name: string
          parameters?: Json | null
          pricing_config?: Json | null
          pricing_type?: string
          slug: string
          updated_at?: string | null
        }
        Update: {
          base_price?: number
          category?: string | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          help_text?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          module_type?: string
          name?: string
          parameters?: Json | null
          pricing_config?: Json | null
          pricing_type?: string
          slug?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      service_parameters: {
        Row: {
          created_at: string | null
          default_value: Json | null
          display_order: number | null
          help_text: string | null
          id: string
          is_required: boolean | null
          metadata: Json | null
          parameter_key: string
          parameter_name: string
          parameter_type: string
          possible_values: Json | null
          pricing_impact: Json | null
          service_id: string
          updated_at: string | null
          validation_rules: Json | null
        }
        Insert: {
          created_at?: string | null
          default_value?: Json | null
          display_order?: number | null
          help_text?: string | null
          id?: string
          is_required?: boolean | null
          metadata?: Json | null
          parameter_key: string
          parameter_name: string
          parameter_type: string
          possible_values?: Json | null
          pricing_impact?: Json | null
          service_id: string
          updated_at?: string | null
          validation_rules?: Json | null
        }
        Update: {
          created_at?: string | null
          default_value?: Json | null
          display_order?: number | null
          help_text?: string | null
          id?: string
          is_required?: boolean | null
          metadata?: Json | null
          parameter_key?: string
          parameter_name?: string
          parameter_type?: string
          possible_values?: Json | null
          pricing_impact?: Json | null
          service_id?: string
          updated_at?: string | null
          validation_rules?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "service_parameters_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "popular_services"
            referencedColumns: ["service_id"]
          },
          {
            foreignKeyName: "service_parameters_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      service_presets: {
        Row: {
          badge_text: string | null
          created_at: string | null
          description: string | null
          discount_percentage: number | null
          display_order: number | null
          icon: string | null
          id: string
          included_modules: string[] | null
          is_featured: boolean | null
          is_recommended: boolean | null
          metadata: Json | null
          name: string
          parameters: Json | null
          service_id: string
          slug: string
          total_price: number | null
          updated_at: string | null
        }
        Insert: {
          badge_text?: string | null
          created_at?: string | null
          description?: string | null
          discount_percentage?: number | null
          display_order?: number | null
          icon?: string | null
          id?: string
          included_modules?: string[] | null
          is_featured?: boolean | null
          is_recommended?: boolean | null
          metadata?: Json | null
          name: string
          parameters?: Json | null
          service_id: string
          slug: string
          total_price?: number | null
          updated_at?: string | null
        }
        Update: {
          badge_text?: string | null
          created_at?: string | null
          description?: string | null
          discount_percentage?: number | null
          display_order?: number | null
          icon?: string | null
          id?: string
          included_modules?: string[] | null
          is_featured?: boolean | null
          is_recommended?: boolean | null
          metadata?: Json | null
          name?: string
          parameters?: Json | null
          service_id?: string
          slug?: string
          total_price?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "service_presets_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "popular_services"
            referencedColumns: ["service_id"]
          },
          {
            foreignKeyName: "service_presets_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      service_relationships: {
        Row: {
          created_at: string | null
          description: string | null
          display_order: number | null
          id: string
          related_service_id: string
          relationship_type: string
          service_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          related_service_id: string
          relationship_type?: string
          service_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          related_service_id?: string
          relationship_type?: string
          service_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "service_relationships_related_service_id_fkey"
            columns: ["related_service_id"]
            isOneToOne: false
            referencedRelation: "popular_services"
            referencedColumns: ["service_id"]
          },
          {
            foreignKeyName: "service_relationships_related_service_id_fkey"
            columns: ["related_service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_relationships_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "popular_services"
            referencedColumns: ["service_id"]
          },
          {
            foreignKeyName: "service_relationships_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      service_to_brand_assets_mapping: {
        Row: {
          asset_category: string
          asset_description: string | null
          asset_name: string
          asset_subcategory: string | null
          created_at: string | null
          display_order: number | null
          formati_richiesti: string[] | null
          id: string
          metadata: Json | null
          quantity: number | null
          service_id: string
          technical_specs: Json | null
          updated_at: string | null
          usage_notes: string | null
          varianti: string[] | null
        }
        Insert: {
          asset_category: string
          asset_description?: string | null
          asset_name: string
          asset_subcategory?: string | null
          created_at?: string | null
          display_order?: number | null
          formati_richiesti?: string[] | null
          id?: string
          metadata?: Json | null
          quantity?: number | null
          service_id: string
          technical_specs?: Json | null
          updated_at?: string | null
          usage_notes?: string | null
          varianti?: string[] | null
        }
        Update: {
          asset_category?: string
          asset_description?: string | null
          asset_name?: string
          asset_subcategory?: string | null
          created_at?: string | null
          display_order?: number | null
          formati_richiesti?: string[] | null
          id?: string
          metadata?: Json | null
          quantity?: number | null
          service_id?: string
          technical_specs?: Json | null
          updated_at?: string | null
          usage_notes?: string | null
          varianti?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "service_to_brand_assets_mapping_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "popular_services"
            referencedColumns: ["service_id"]
          },
          {
            foreignKeyName: "service_to_brand_assets_mapping_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      service_to_managed_services_mapping: {
        Row: {
          created_at: string | null
          data_rinnovo_offset_days: number | null
          display_order: number | null
          id: string
          inizio_servizio_offset_days: number | null
          is_recurring: boolean | null
          link_template: string | null
          managed_service_description: string | null
          managed_service_name: string
          managed_service_type: string
          metadata: Json | null
          quantity: number | null
          responsabile_email_default: string | null
          rinnovo_automatico: boolean | null
          rinnovo_periodicita: string | null
          rinnovo_periodicita_backup: string[] | null
          rinnovo_periodicita_months: number | null
          service_id: string
          setup_notes: string | null
          stato_iniziale: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          data_rinnovo_offset_days?: number | null
          display_order?: number | null
          id?: string
          inizio_servizio_offset_days?: number | null
          is_recurring?: boolean | null
          link_template?: string | null
          managed_service_description?: string | null
          managed_service_name: string
          managed_service_type: string
          metadata?: Json | null
          quantity?: number | null
          responsabile_email_default?: string | null
          rinnovo_automatico?: boolean | null
          rinnovo_periodicita?: string | null
          rinnovo_periodicita_backup?: string[] | null
          rinnovo_periodicita_months?: number | null
          service_id: string
          setup_notes?: string | null
          stato_iniziale?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          data_rinnovo_offset_days?: number | null
          display_order?: number | null
          id?: string
          inizio_servizio_offset_days?: number | null
          is_recurring?: boolean | null
          link_template?: string | null
          managed_service_description?: string | null
          managed_service_name?: string
          managed_service_type?: string
          metadata?: Json | null
          quantity?: number | null
          responsabile_email_default?: string | null
          rinnovo_automatico?: boolean | null
          rinnovo_periodicita?: string | null
          rinnovo_periodicita_backup?: string[] | null
          rinnovo_periodicita_months?: number | null
          service_id?: string
          setup_notes?: string | null
          stato_iniziale?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "service_to_managed_services_mapping_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "popular_services"
            referencedColumns: ["service_id"]
          },
          {
            foreignKeyName: "service_to_managed_services_mapping_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      service_to_modules_mapping: {
        Row: {
          conflicts_with: string[] | null
          created_at: string | null
          discount_percentage: number | null
          display_order: number | null
          id: string
          is_default: boolean | null
          is_recommended: boolean | null
          is_required: boolean | null
          module_id: string
          notes: string | null
          price_override: number | null
          requires: string[] | null
          service_id: string
          updated_at: string | null
        }
        Insert: {
          conflicts_with?: string[] | null
          created_at?: string | null
          discount_percentage?: number | null
          display_order?: number | null
          id?: string
          is_default?: boolean | null
          is_recommended?: boolean | null
          is_required?: boolean | null
          module_id: string
          notes?: string | null
          price_override?: number | null
          requires?: string[] | null
          service_id: string
          updated_at?: string | null
        }
        Update: {
          conflicts_with?: string[] | null
          created_at?: string | null
          discount_percentage?: number | null
          display_order?: number | null
          id?: string
          is_default?: boolean | null
          is_recommended?: boolean | null
          is_required?: boolean | null
          module_id?: string
          notes?: string | null
          price_override?: number | null
          requires?: string[] | null
          service_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "service_to_modules_mapping_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "service_modules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_to_modules_mapping_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "popular_services"
            referencedColumns: ["service_id"]
          },
          {
            foreignKeyName: "service_to_modules_mapping_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      service_to_requirements_mapping: {
        Row: {
          created_at: string | null
          dipendenze: string[] | null
          display_order: number | null
          id: string
          metadata: Json | null
          moscow_priority: string | null
          requirement_category: string | null
          requirement_description: string | null
          requirement_name: string
          requirement_priority: string | null
          service_id: string
          stima_ore: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          dipendenze?: string[] | null
          display_order?: number | null
          id?: string
          metadata?: Json | null
          moscow_priority?: string | null
          requirement_category?: string | null
          requirement_description?: string | null
          requirement_name: string
          requirement_priority?: string | null
          service_id: string
          stima_ore?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          dipendenze?: string[] | null
          display_order?: number | null
          id?: string
          metadata?: Json | null
          moscow_priority?: string | null
          requirement_category?: string | null
          requirement_description?: string | null
          requirement_name?: string
          requirement_priority?: string | null
          service_id?: string
          stima_ore?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "service_to_requirements_mapping_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "popular_services"
            referencedColumns: ["service_id"]
          },
          {
            foreignKeyName: "service_to_requirements_mapping_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          area: string | null
          auto_generate_brand_assets: boolean | null
          auto_generate_managed_services: boolean | null
          auto_generate_requirements: boolean | null
          base_price: number
          billing_options: Json | null
          configuration: Json | null
          created_at: string | null
          default_project_type: string | null
          id: string
          is_recurring: boolean
          metadata: Json | null
          name: string
          notion_created_by: string | null
          notion_created_time: string | null
          notion_id: string | null
          notion_last_edited_by: string | null
          notion_last_edited_time: string | null
          output_type: string | null
          raw_notion_data: Json | null
          recurrence_period: string | null
          recurrence_period_months: number | null
          responsabile_user_id: string | null
          status: string
          type: string
          updated_at: string | null
        }
        Insert: {
          area?: string | null
          auto_generate_brand_assets?: boolean | null
          auto_generate_managed_services?: boolean | null
          auto_generate_requirements?: boolean | null
          base_price: number
          billing_options?: Json | null
          configuration?: Json | null
          created_at?: string | null
          default_project_type?: string | null
          id?: string
          is_recurring?: boolean
          metadata?: Json | null
          name: string
          notion_created_by?: string | null
          notion_created_time?: string | null
          notion_id?: string | null
          notion_last_edited_by?: string | null
          notion_last_edited_time?: string | null
          output_type?: string | null
          raw_notion_data?: Json | null
          recurrence_period?: string | null
          recurrence_period_months?: number | null
          responsabile_user_id?: string | null
          status?: string
          type: string
          updated_at?: string | null
        }
        Update: {
          area?: string | null
          auto_generate_brand_assets?: boolean | null
          auto_generate_managed_services?: boolean | null
          auto_generate_requirements?: boolean | null
          base_price?: number
          billing_options?: Json | null
          configuration?: Json | null
          created_at?: string | null
          default_project_type?: string | null
          id?: string
          is_recurring?: boolean
          metadata?: Json | null
          name?: string
          notion_created_by?: string | null
          notion_created_time?: string | null
          notion_id?: string | null
          notion_last_edited_by?: string | null
          notion_last_edited_time?: string | null
          output_type?: string | null
          raw_notion_data?: Json | null
          recurrence_period?: string | null
          recurrence_period_months?: number | null
          responsabile_user_id?: string | null
          status?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "services_responsabile_user_id_fkey"
            columns: ["responsabile_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      services_backup_20251007_v2: {
        Row: {
          auto_generate_brand_assets: boolean | null
          auto_generate_managed_services: boolean | null
          auto_generate_requirements: boolean | null
          base_price: number | null
          billing_options: Json | null
          configuration: Json | null
          created_at: string | null
          default_project_type: string | null
          id: string | null
          is_recurring: boolean | null
          metadata: Json | null
          name: string | null
          notion_created_by: string | null
          notion_created_time: string | null
          notion_id: string | null
          notion_last_edited_by: string | null
          notion_last_edited_time: string | null
          output_type: string | null
          raw_notion_data: Json | null
          status: string | null
          type: string | null
          updated_at: string | null
        }
        Insert: {
          auto_generate_brand_assets?: boolean | null
          auto_generate_managed_services?: boolean | null
          auto_generate_requirements?: boolean | null
          base_price?: number | null
          billing_options?: Json | null
          configuration?: Json | null
          created_at?: string | null
          default_project_type?: string | null
          id?: string | null
          is_recurring?: boolean | null
          metadata?: Json | null
          name?: string | null
          notion_created_by?: string | null
          notion_created_time?: string | null
          notion_id?: string | null
          notion_last_edited_by?: string | null
          notion_last_edited_time?: string | null
          output_type?: string | null
          raw_notion_data?: Json | null
          status?: string | null
          type?: string | null
          updated_at?: string | null
        }
        Update: {
          auto_generate_brand_assets?: boolean | null
          auto_generate_managed_services?: boolean | null
          auto_generate_requirements?: boolean | null
          base_price?: number | null
          billing_options?: Json | null
          configuration?: Json | null
          created_at?: string | null
          default_project_type?: string | null
          id?: string | null
          is_recurring?: boolean | null
          metadata?: Json | null
          name?: string | null
          notion_created_by?: string | null
          notion_created_time?: string | null
          notion_id?: string | null
          notion_last_edited_by?: string | null
          notion_last_edited_time?: string | null
          output_type?: string | null
          raw_notion_data?: Json | null
          status?: string | null
          type?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      servizi_gestiti: {
        Row: {
          billing_type: string | null
          created_at: string | null
          current_slot: number | null
          data_rinnovo: string | null
          id: string
          inizio_servizio: string | null
          is_recurring: boolean | null
          link: string | null
          next_renewal_date: string | null
          nome: string
          notion_created_by: string | null
          notion_created_time: string | null
          notion_id: string
          notion_last_edited_by: string | null
          notion_last_edited_time: string | null
          persona_fisica_id: string | null
          persona_giuridica_id: string | null
          project_id: string | null
          raw_notion_data: Json | null
          recurrence_period: string | null
          recurrence_period_months: number | null
          responsabile_email: string | null
          responsabile_user_id: string | null
          rinnovo_automatico: boolean | null
          rinnovo_periodicita: string[] | null
          slots_paid: number | null
          stato: string | null
          tipo: string | null
          total_slots: number | null
          total_value: number | null
          unit_price: number | null
          updated_at: string | null
          wiki_tool_id: string | null
        }
        Insert: {
          billing_type?: string | null
          created_at?: string | null
          current_slot?: number | null
          data_rinnovo?: string | null
          id?: string
          inizio_servizio?: string | null
          is_recurring?: boolean | null
          link?: string | null
          next_renewal_date?: string | null
          nome: string
          notion_created_by?: string | null
          notion_created_time?: string | null
          notion_id: string
          notion_last_edited_by?: string | null
          notion_last_edited_time?: string | null
          persona_fisica_id?: string | null
          persona_giuridica_id?: string | null
          project_id?: string | null
          raw_notion_data?: Json | null
          recurrence_period?: string | null
          recurrence_period_months?: number | null
          responsabile_email?: string | null
          responsabile_user_id?: string | null
          rinnovo_automatico?: boolean | null
          rinnovo_periodicita?: string[] | null
          slots_paid?: number | null
          stato?: string | null
          tipo?: string | null
          total_slots?: number | null
          total_value?: number | null
          unit_price?: number | null
          updated_at?: string | null
          wiki_tool_id?: string | null
        }
        Update: {
          billing_type?: string | null
          created_at?: string | null
          current_slot?: number | null
          data_rinnovo?: string | null
          id?: string
          inizio_servizio?: string | null
          is_recurring?: boolean | null
          link?: string | null
          next_renewal_date?: string | null
          nome?: string
          notion_created_by?: string | null
          notion_created_time?: string | null
          notion_id?: string
          notion_last_edited_by?: string | null
          notion_last_edited_time?: string | null
          persona_fisica_id?: string | null
          persona_giuridica_id?: string | null
          project_id?: string | null
          raw_notion_data?: Json | null
          recurrence_period?: string | null
          recurrence_period_months?: number | null
          responsabile_email?: string | null
          responsabile_user_id?: string | null
          rinnovo_automatico?: boolean | null
          rinnovo_periodicita?: string[] | null
          slots_paid?: number | null
          stato?: string | null
          tipo?: string | null
          total_slots?: number | null
          total_value?: number | null
          unit_price?: number | null
          updated_at?: string | null
          wiki_tool_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "servizi_gestiti_persona_fisica_id_fkey"
            columns: ["persona_fisica_id"]
            isOneToOne: false
            referencedRelation: "persone_fisiche"
            referencedColumns: ["notion_id"]
          },
          {
            foreignKeyName: "servizi_gestiti_persona_giuridica_id_fkey"
            columns: ["persona_giuridica_id"]
            isOneToOne: false
            referencedRelation: "persone_giuridiche"
            referencedColumns: ["notion_id"]
          },
          {
            foreignKeyName: "servizi_gestiti_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "servizi_gestiti_responsabile_user_id_fkey"
            columns: ["responsabile_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "servizi_gestiti_wiki_tool_id_fkey"
            columns: ["wiki_tool_id"]
            isOneToOne: false
            referencedRelation: "wiki_tools"
            referencedColumns: ["id"]
          },
        ]
      }
      servizi_gestiti_credenziali: {
        Row: {
          created_at: string | null
          credenziale_id: string
          servizio_gestito_id: string
        }
        Insert: {
          created_at?: string | null
          credenziale_id: string
          servizio_gestito_id: string
        }
        Update: {
          created_at?: string | null
          credenziale_id?: string
          servizio_gestito_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "servizi_gestiti_credenziali_credenziale_id_fkey"
            columns: ["credenziale_id"]
            isOneToOne: false
            referencedRelation: "credenziali"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "servizi_gestiti_credenziali_servizio_gestito_id_fkey"
            columns: ["servizio_gestito_id"]
            isOneToOne: false
            referencedRelation: "servizi_gestiti"
            referencedColumns: ["id"]
          },
        ]
      }
      software_project_changelog: {
        Row: {
          breaking_changes: string[] | null
          bugfix: string[] | null
          created_at: string
          data_rilascio: string
          features_aggiunte: string[] | null
          id: string
          improvements: string[] | null
          miglioramenti: string[] | null
          note: string | null
          novita: string[] | null
          software_project_id: string
          tipo_rilascio: string
          versione: string
        }
        Insert: {
          breaking_changes?: string[] | null
          bugfix?: string[] | null
          created_at?: string
          data_rilascio: string
          features_aggiunte?: string[] | null
          id?: string
          improvements?: string[] | null
          miglioramenti?: string[] | null
          note?: string | null
          novita?: string[] | null
          software_project_id: string
          tipo_rilascio?: string
          versione: string
        }
        Update: {
          breaking_changes?: string[] | null
          bugfix?: string[] | null
          created_at?: string
          data_rilascio?: string
          features_aggiunte?: string[] | null
          id?: string
          improvements?: string[] | null
          miglioramenti?: string[] | null
          note?: string | null
          novita?: string[] | null
          software_project_id?: string
          tipo_rilascio?: string
          versione?: string
        }
        Relationships: [
          {
            foreignKeyName: "software_project_changelog_software_project_id_fkey"
            columns: ["software_project_id"]
            isOneToOne: false
            referencedRelation: "software_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      software_project_environments: {
        Row: {
          api_url: string | null
          created_at: string
          id: string
          nome: string
          note: string | null
          software_project_id: string
          status: string | null
          tipo: string
          ultimo_deploy: string | null
          updated_at: string
          url: string
          versione_corrente: string | null
        }
        Insert: {
          api_url?: string | null
          created_at?: string
          id?: string
          nome: string
          note?: string | null
          software_project_id: string
          status?: string | null
          tipo: string
          ultimo_deploy?: string | null
          updated_at?: string
          url: string
          versione_corrente?: string | null
        }
        Update: {
          api_url?: string | null
          created_at?: string
          id?: string
          nome?: string
          note?: string | null
          software_project_id?: string
          status?: string | null
          tipo?: string
          ultimo_deploy?: string | null
          updated_at?: string
          url?: string
          versione_corrente?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "software_project_environments_software_project_id_fkey"
            columns: ["software_project_id"]
            isOneToOne: false
            referencedRelation: "software_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      software_project_features: {
        Row: {
          assegnato_a: string | null
          categoria: string | null
          created_at: string
          data_completamento: string | null
          data_fine: string | null
          data_inizio: string | null
          descrizione: string | null
          dipendenze: string[] | null
          display_order: number
          id: string
          moscow_priority: string | null
          nome: string
          note: string | null
          ore_effettive: number | null
          priorita: string
          requisito_collegato_id: string | null
          software_project_id: string
          stato: string
          stima_ore: number | null
          tipo_feature: string
          updated_at: string
        }
        Insert: {
          assegnato_a?: string | null
          categoria?: string | null
          created_at?: string
          data_completamento?: string | null
          data_fine?: string | null
          data_inizio?: string | null
          descrizione?: string | null
          dipendenze?: string[] | null
          display_order?: number
          id?: string
          moscow_priority?: string | null
          nome: string
          note?: string | null
          ore_effettive?: number | null
          priorita?: string
          requisito_collegato_id?: string | null
          software_project_id: string
          stato?: string
          stima_ore?: number | null
          tipo_feature?: string
          updated_at?: string
        }
        Update: {
          assegnato_a?: string | null
          categoria?: string | null
          created_at?: string
          data_completamento?: string | null
          data_fine?: string | null
          data_inizio?: string | null
          descrizione?: string | null
          dipendenze?: string[] | null
          display_order?: number
          id?: string
          moscow_priority?: string | null
          nome?: string
          note?: string | null
          ore_effettive?: number | null
          priorita?: string
          requisito_collegato_id?: string | null
          software_project_id?: string
          stato?: string
          stima_ore?: number | null
          tipo_feature?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "software_project_features_assegnato_a_fkey"
            columns: ["assegnato_a"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "software_project_features_requisito_collegato_id_fkey"
            columns: ["requisito_collegato_id"]
            isOneToOne: false
            referencedRelation: "software_project_features"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "software_project_features_software_project_id_fkey"
            columns: ["software_project_id"]
            isOneToOne: false
            referencedRelation: "software_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      software_project_feedback: {
        Row: {
          assegnato_a: string | null
          attachments: string[] | null
          autore: string | null
          created_at: string
          data_risoluzione: string | null
          descrizione: string
          fonte: string
          id: string
          priorita: string
          richiedente_email: string | null
          richiedente_nome: string | null
          risposta: string | null
          software_project_id: string
          stato: string
          tipo: string
          titolo: string
          updated_at: string
        }
        Insert: {
          assegnato_a?: string | null
          attachments?: string[] | null
          autore?: string | null
          created_at?: string
          data_risoluzione?: string | null
          descrizione: string
          fonte?: string
          id?: string
          priorita?: string
          richiedente_email?: string | null
          richiedente_nome?: string | null
          risposta?: string | null
          software_project_id: string
          stato?: string
          tipo: string
          titolo: string
          updated_at?: string
        }
        Update: {
          assegnato_a?: string | null
          attachments?: string[] | null
          autore?: string | null
          created_at?: string
          data_risoluzione?: string | null
          descrizione?: string
          fonte?: string
          id?: string
          priorita?: string
          richiedente_email?: string | null
          richiedente_nome?: string | null
          risposta?: string | null
          software_project_id?: string
          stato?: string
          tipo?: string
          titolo?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "software_project_feedback_assegnato_a_fkey"
            columns: ["assegnato_a"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "software_project_feedback_software_project_id_fkey"
            columns: ["software_project_id"]
            isOneToOne: false
            referencedRelation: "software_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      software_project_feedback_tokens: {
        Row: {
          created_at: string
          created_by: string | null
          expires_at: string | null
          id: string
          is_active: boolean
          last_used_at: string | null
          notes: string | null
          software_project_id: string
          token: string
          usage_count: number
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean
          last_used_at?: string | null
          notes?: string | null
          software_project_id: string
          token: string
          usage_count?: number
        }
        Update: {
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean
          last_used_at?: string | null
          notes?: string | null
          software_project_id?: string
          token?: string
          usage_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "software_project_feedback_tokens_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "software_project_feedback_tokens_software_project_id_fkey"
            columns: ["software_project_id"]
            isOneToOne: false
            referencedRelation: "software_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      software_project_files: {
        Row: {
          asset_type: string
          categoria: string
          descrizione: string | null
          dimensione_kb: number | null
          display_order: number
          external_url: string | null
          file_path: string | null
          file_size: number | null
          id: string
          mime_type: string | null
          nome_file: string
          software_project_id: string
          sottocategoria: string | null
          tags: string[] | null
          uploaded_at: string
          uploaded_by: string | null
          versione: string | null
        }
        Insert: {
          asset_type?: string
          categoria: string
          descrizione?: string | null
          dimensione_kb?: number | null
          display_order?: number
          external_url?: string | null
          file_path?: string | null
          file_size?: number | null
          id?: string
          mime_type?: string | null
          nome_file: string
          software_project_id: string
          sottocategoria?: string | null
          tags?: string[] | null
          uploaded_at?: string
          uploaded_by?: string | null
          versione?: string | null
        }
        Update: {
          asset_type?: string
          categoria?: string
          descrizione?: string | null
          dimensione_kb?: number | null
          display_order?: number
          external_url?: string | null
          file_path?: string | null
          file_size?: number | null
          id?: string
          mime_type?: string | null
          nome_file?: string
          software_project_id?: string
          sottocategoria?: string | null
          tags?: string[] | null
          uploaded_at?: string
          uploaded_by?: string | null
          versione?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "software_project_files_software_project_id_fkey"
            columns: ["software_project_id"]
            isOneToOne: false
            referencedRelation: "software_projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "software_project_files_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      software_project_milestones: {
        Row: {
          created_at: string
          data_completamento: string | null
          data_target: string
          deliverables: string[] | null
          descrizione: string | null
          display_order: number
          id: string
          nome: string
          percentuale_completamento: number
          software_project_id: string
          stato: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          data_completamento?: string | null
          data_target: string
          deliverables?: string[] | null
          descrizione?: string | null
          display_order?: number
          id?: string
          nome: string
          percentuale_completamento?: number
          software_project_id: string
          stato?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          data_completamento?: string | null
          data_target?: string
          deliverables?: string[] | null
          descrizione?: string | null
          display_order?: number
          id?: string
          nome?: string
          percentuale_completamento?: number
          software_project_id?: string
          stato?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "software_project_milestones_software_project_id_fkey"
            columns: ["software_project_id"]
            isOneToOne: false
            referencedRelation: "software_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      software_project_servizi_gestiti: {
        Row: {
          created_at: string
          note: string | null
          servizio_gestito_id: string
          software_project_id: string
        }
        Insert: {
          created_at?: string
          note?: string | null
          servizio_gestito_id: string
          software_project_id: string
        }
        Update: {
          created_at?: string
          note?: string | null
          servizio_gestito_id?: string
          software_project_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "software_project_servizi_gestiti_servizio_gestito_id_fkey"
            columns: ["servizio_gestito_id"]
            isOneToOne: false
            referencedRelation: "servizi_gestiti"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "software_project_servizi_gestiti_software_project_id_fkey"
            columns: ["software_project_id"]
            isOneToOne: false
            referencedRelation: "software_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      software_project_specs: {
        Row: {
          analytics_platform: string | null
          api_utilizzate: Json | null
          architettura_pattern: string | null
          autenticazione: string | null
          conformita_normative: string[] | null
          created_at: string
          database_type: string | null
          deployment_strategy: string | null
          error_tracking: string | null
          hosting_provider: string | null
          id: string
          integrazioni: Json | null
          logging_solution: string | null
          note_architetturali: string | null
          software_project_id: string
          ssl_https: boolean | null
          storage_stimato: string | null
          traffico_mensile_stimato: number | null
          updated_at: string
          utenti_concorrenti_stimati: number | null
        }
        Insert: {
          analytics_platform?: string | null
          api_utilizzate?: Json | null
          architettura_pattern?: string | null
          autenticazione?: string | null
          conformita_normative?: string[] | null
          created_at?: string
          database_type?: string | null
          deployment_strategy?: string | null
          error_tracking?: string | null
          hosting_provider?: string | null
          id?: string
          integrazioni?: Json | null
          logging_solution?: string | null
          note_architetturali?: string | null
          software_project_id: string
          ssl_https?: boolean | null
          storage_stimato?: string | null
          traffico_mensile_stimato?: number | null
          updated_at?: string
          utenti_concorrenti_stimati?: number | null
        }
        Update: {
          analytics_platform?: string | null
          api_utilizzate?: Json | null
          architettura_pattern?: string | null
          autenticazione?: string | null
          conformita_normative?: string[] | null
          created_at?: string
          database_type?: string | null
          deployment_strategy?: string | null
          error_tracking?: string | null
          hosting_provider?: string | null
          id?: string
          integrazioni?: Json | null
          logging_solution?: string | null
          note_architetturali?: string | null
          software_project_id?: string
          ssl_https?: boolean | null
          storage_stimato?: string | null
          traffico_mensile_stimato?: number | null
          updated_at?: string
          utenti_concorrenti_stimati?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "software_project_specs_software_project_id_fkey"
            columns: ["software_project_id"]
            isOneToOne: true
            referencedRelation: "software_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      software_projects: {
        Row: {
          brand_kit_id: string | null
          created_at: string
          created_by: string | null
          data_inizio: string | null
          data_rilascio_effettiva: string | null
          data_rilascio_prevista: string | null
          descrizione: string | null
          id: string
          linguaggi_programmazione: string[] | null
          metadata: Json | null
          nome: string
          persona_giuridica_id: string | null
          priorita: string
          project_id: string | null
          quote_id: string | null
          referente_sicilean_email: string | null
          referente_sicilean_user_id: string | null
          repository_branch_dev: string | null
          repository_branch_main: string | null
          repository_url: string | null
          stato: string
          tech_stack: Json | null
          tipo_progetto: string
          updated_at: string
          url_production: string | null
          url_staging: string | null
          versione_major: number
          versione_minor: number
          versione_patch: number
          versione_precedente_id: string | null
        }
        Insert: {
          brand_kit_id?: string | null
          created_at?: string
          created_by?: string | null
          data_inizio?: string | null
          data_rilascio_effettiva?: string | null
          data_rilascio_prevista?: string | null
          descrizione?: string | null
          id?: string
          linguaggi_programmazione?: string[] | null
          metadata?: Json | null
          nome: string
          persona_giuridica_id?: string | null
          priorita?: string
          project_id?: string | null
          quote_id?: string | null
          referente_sicilean_email?: string | null
          referente_sicilean_user_id?: string | null
          repository_branch_dev?: string | null
          repository_branch_main?: string | null
          repository_url?: string | null
          stato?: string
          tech_stack?: Json | null
          tipo_progetto: string
          updated_at?: string
          url_production?: string | null
          url_staging?: string | null
          versione_major?: number
          versione_minor?: number
          versione_patch?: number
          versione_precedente_id?: string | null
        }
        Update: {
          brand_kit_id?: string | null
          created_at?: string
          created_by?: string | null
          data_inizio?: string | null
          data_rilascio_effettiva?: string | null
          data_rilascio_prevista?: string | null
          descrizione?: string | null
          id?: string
          linguaggi_programmazione?: string[] | null
          metadata?: Json | null
          nome?: string
          persona_giuridica_id?: string | null
          priorita?: string
          project_id?: string | null
          quote_id?: string | null
          referente_sicilean_email?: string | null
          referente_sicilean_user_id?: string | null
          repository_branch_dev?: string | null
          repository_branch_main?: string | null
          repository_url?: string | null
          stato?: string
          tech_stack?: Json | null
          tipo_progetto?: string
          updated_at?: string
          url_production?: string | null
          url_staging?: string | null
          versione_major?: number
          versione_minor?: number
          versione_patch?: number
          versione_precedente_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "software_projects_brand_kit_id_fkey"
            columns: ["brand_kit_id"]
            isOneToOne: false
            referencedRelation: "brand_kits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "software_projects_brand_kit_id_fkey"
            columns: ["brand_kit_id"]
            isOneToOne: false
            referencedRelation: "brand_kits_with_version"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "software_projects_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "software_projects_persona_giuridica_id_fkey"
            columns: ["persona_giuridica_id"]
            isOneToOne: false
            referencedRelation: "persone_giuridiche"
            referencedColumns: ["notion_id"]
          },
          {
            foreignKeyName: "software_projects_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "software_projects_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "software_projects_referente_sicilean_user_id_fkey"
            columns: ["referente_sicilean_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "software_projects_versione_precedente_id_fkey"
            columns: ["versione_precedente_id"]
            isOneToOne: false
            referencedRelation: "software_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      strategy_analytics_services: {
        Row: {
          analyst_user_id: string | null
          created_at: string | null
          dashboard_urls: string[] | null
          data_fine: string | null
          data_inizio: string | null
          datasets: Json | null
          descrizione: string | null
          id: string
          nome: string
          note: string | null
          project_id: string
          report_paths: string[] | null
          stato: string | null
          tipo_servizio: string
          tools_utilizzati: string[] | null
          updated_at: string | null
          valore: number | null
        }
        Insert: {
          analyst_user_id?: string | null
          created_at?: string | null
          dashboard_urls?: string[] | null
          data_fine?: string | null
          data_inizio?: string | null
          datasets?: Json | null
          descrizione?: string | null
          id?: string
          nome: string
          note?: string | null
          project_id: string
          report_paths?: string[] | null
          stato?: string | null
          tipo_servizio: string
          tools_utilizzati?: string[] | null
          updated_at?: string | null
          valore?: number | null
        }
        Update: {
          analyst_user_id?: string | null
          created_at?: string | null
          dashboard_urls?: string[] | null
          data_fine?: string | null
          data_inizio?: string | null
          datasets?: Json | null
          descrizione?: string | null
          id?: string
          nome?: string
          note?: string | null
          project_id?: string
          report_paths?: string[] | null
          stato?: string | null
          tipo_servizio?: string
          tools_utilizzati?: string[] | null
          updated_at?: string | null
          valore?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "strategy_analytics_services_analyst_user_id_fkey"
            columns: ["analyst_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "strategy_analytics_services_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      sync_log: {
        Row: {
          completed_at: string | null
          error_message: string | null
          id: string
          raw_response: Json | null
          records_inserted: number | null
          records_processed: number | null
          records_updated: number | null
          started_at: string
          status: string
          sync_type: string
        }
        Insert: {
          completed_at?: string | null
          error_message?: string | null
          id?: string
          raw_response?: Json | null
          records_inserted?: number | null
          records_processed?: number | null
          records_updated?: number | null
          started_at?: string
          status?: string
          sync_type: string
        }
        Update: {
          completed_at?: string | null
          error_message?: string | null
          id?: string
          raw_response?: Json | null
          records_inserted?: number | null
          records_processed?: number | null
          records_updated?: number | null
          started_at?: string
          status?: string
          sync_type?: string
        }
        Relationships: []
      }
      transaction_categories: {
        Row: {
          colore: string | null
          created_at: string | null
          descrizione: string | null
          display_order: number | null
          icona: string | null
          id: string
          is_active: boolean | null
          nome: string
          parent_category_id: string | null
          tipo: string
          updated_at: string | null
        }
        Insert: {
          colore?: string | null
          created_at?: string | null
          descrizione?: string | null
          display_order?: number | null
          icona?: string | null
          id?: string
          is_active?: boolean | null
          nome: string
          parent_category_id?: string | null
          tipo: string
          updated_at?: string | null
        }
        Update: {
          colore?: string | null
          created_at?: string | null
          descrizione?: string | null
          display_order?: number | null
          icona?: string | null
          id?: string
          is_active?: boolean | null
          nome?: string
          parent_category_id?: string | null
          tipo?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transaction_categories_parent_category_id_fkey"
            columns: ["parent_category_id"]
            isOneToOne: false
            referencedRelation: "transaction_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      transaction_documents: {
        Row: {
          file_name: string
          file_path: string
          file_size: number | null
          id: string
          metadata: Json | null
          mime_type: string | null
          note: string | null
          numero_documento: string | null
          tipo_documento: string
          transaction_id: string
          uploaded_at: string | null
          uploaded_by: string | null
        }
        Insert: {
          file_name: string
          file_path: string
          file_size?: number | null
          id?: string
          metadata?: Json | null
          mime_type?: string | null
          note?: string | null
          numero_documento?: string | null
          tipo_documento: string
          transaction_id: string
          uploaded_at?: string | null
          uploaded_by?: string | null
        }
        Update: {
          file_name?: string
          file_path?: string
          file_size?: number | null
          id?: string
          metadata?: Json | null
          mime_type?: string | null
          note?: string | null
          numero_documento?: string | null
          tipo_documento?: string
          transaction_id?: string
          uploaded_at?: string | null
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transaction_documents_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transaction_documents_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "v_unreconciled_transactions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transaction_documents_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      transaction_invoice_links: {
        Row: {
          id: string
          invoice_id: string
          match_type: string | null
          matched_amount: number
          matched_at: string | null
          matched_by: string | null
          notes: string | null
          transaction_id: string
        }
        Insert: {
          id?: string
          invoice_id: string
          match_type?: string | null
          matched_amount: number
          matched_at?: string | null
          matched_by?: string | null
          notes?: string | null
          transaction_id: string
        }
        Update: {
          id?: string
          invoice_id?: string
          match_type?: string | null
          matched_amount?: number
          matched_at?: string | null
          matched_by?: string | null
          notes?: string | null
          transaction_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transaction_invoice_links_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transaction_invoice_links_matched_by_fkey"
            columns: ["matched_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transaction_invoice_links_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transaction_invoice_links_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "v_unreconciled_transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      transaction_legs: {
        Row: {
          account_id: string
          amount: number
          balance: number | null
          counterparty_account_id: string | null
          counterparty_account_type: string | null
          counterparty_id: string | null
          currency: string
          description: string | null
          leg_id: string
          raw_data: Json | null
          sync_created_at: string | null
          transaction_id: string
        }
        Insert: {
          account_id: string
          amount: number
          balance?: number | null
          counterparty_account_id?: string | null
          counterparty_account_type?: string | null
          counterparty_id?: string | null
          currency: string
          description?: string | null
          leg_id: string
          raw_data?: Json | null
          sync_created_at?: string | null
          transaction_id: string
        }
        Update: {
          account_id?: string
          amount?: number
          balance?: number | null
          counterparty_account_id?: string | null
          counterparty_account_type?: string | null
          counterparty_id?: string | null
          currency?: string
          description?: string | null
          leg_id?: string
          raw_data?: Json | null
          sync_created_at?: string | null
          transaction_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transaction_legs_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transaction_legs_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "v_unreconciled_transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      transaction_tags: {
        Row: {
          category_id: string
          created_at: string | null
          note: string | null
          transaction_id: string
        }
        Insert: {
          category_id: string
          created_at?: string | null
          note?: string | null
          transaction_id: string
        }
        Update: {
          category_id?: string
          created_at?: string | null
          note?: string | null
          transaction_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transaction_tags_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "transaction_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transaction_tags_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transaction_tags_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "v_unreconciled_transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          account_id: string | null
          amount: number | null
          balance_after: number | null
          bank_account_id: string | null
          category_id: string | null
          completed_at: string | null
          counterparty_id: string | null
          created_at: string
          currency: string | null
          description: string | null
          id: string
          internal_note: string | null
          invoice_id: string | null
          is_internal_transfer: boolean | null
          is_reconciled: boolean | null
          persona_fisica_id: string | null
          persona_giuridica_id: string | null
          raw_data: Json
          reconciliation_status: string | null
          reference: string | null
          request_id: string | null
          state: string
          sync_created_at: string | null
          sync_updated_at: string | null
          tags: string[] | null
          transfer_to_account_id: string | null
          type: string
          updated_at: string
        }
        Insert: {
          account_id?: string | null
          amount?: number | null
          balance_after?: number | null
          bank_account_id?: string | null
          category_id?: string | null
          completed_at?: string | null
          counterparty_id?: string | null
          created_at: string
          currency?: string | null
          description?: string | null
          id: string
          internal_note?: string | null
          invoice_id?: string | null
          is_internal_transfer?: boolean | null
          is_reconciled?: boolean | null
          persona_fisica_id?: string | null
          persona_giuridica_id?: string | null
          raw_data: Json
          reconciliation_status?: string | null
          reference?: string | null
          request_id?: string | null
          state: string
          sync_created_at?: string | null
          sync_updated_at?: string | null
          tags?: string[] | null
          transfer_to_account_id?: string | null
          type: string
          updated_at: string
        }
        Update: {
          account_id?: string | null
          amount?: number | null
          balance_after?: number | null
          bank_account_id?: string | null
          category_id?: string | null
          completed_at?: string | null
          counterparty_id?: string | null
          created_at?: string
          currency?: string | null
          description?: string | null
          id?: string
          internal_note?: string | null
          invoice_id?: string | null
          is_internal_transfer?: boolean | null
          is_reconciled?: boolean | null
          persona_fisica_id?: string | null
          persona_giuridica_id?: string | null
          raw_data?: Json
          reconciliation_status?: string | null
          reference?: string | null
          request_id?: string | null
          state?: string
          sync_created_at?: string | null
          sync_updated_at?: string | null
          tags?: string[] | null
          transfer_to_account_id?: string | null
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_bank_account_id_fkey"
            columns: ["bank_account_id"]
            isOneToOne: false
            referencedRelation: "bank_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "transaction_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_persona_fisica_id_fkey"
            columns: ["persona_fisica_id"]
            isOneToOne: false
            referencedRelation: "persone_fisiche"
            referencedColumns: ["notion_id"]
          },
          {
            foreignKeyName: "transactions_persona_giuridica_id_fkey"
            columns: ["persona_giuridica_id"]
            isOneToOne: false
            referencedRelation: "persone_giuridiche"
            referencedColumns: ["notion_id"]
          },
          {
            foreignKeyName: "transactions_transfer_to_account_id_fkey"
            columns: ["transfer_to_account_id"]
            isOneToOne: false
            referencedRelation: "bank_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      user_permissions: {
        Row: {
          created_at: string
          expires_at: string | null
          granted_at: string
          granted_by: string | null
          id: string
          permission_id: string
          reason: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          granted_at?: string
          granted_by?: string | null
          id?: string
          permission_id: string
          reason?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          granted_at?: string
          granted_by?: string | null
          id?: string
          permission_id?: string
          reason?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_permissions_granted_by_fkey"
            columns: ["granted_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_permissions_permission_id_fkey"
            columns: ["permission_id"]
            isOneToOne: false
            referencedRelation: "permissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_permissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      wiki_learning_credenziali: {
        Row: {
          access_notes: string | null
          created_at: string | null
          credenziale_id: string
          learning_resource_id: string
        }
        Insert: {
          access_notes?: string | null
          created_at?: string | null
          credenziale_id: string
          learning_resource_id: string
        }
        Update: {
          access_notes?: string | null
          created_at?: string | null
          credenziale_id?: string
          learning_resource_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wiki_learning_credenziali_credenziale_id_fkey"
            columns: ["credenziale_id"]
            isOneToOne: false
            referencedRelation: "credenziali"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wiki_learning_credenziali_learning_resource_id_fkey"
            columns: ["learning_resource_id"]
            isOneToOne: false
            referencedRelation: "wiki_learning_resources"
            referencedColumns: ["id"]
          },
        ]
      }
      wiki_learning_resources: {
        Row: {
          additional_links: Json | null
          author: string | null
          completion_requirements: string | null
          cost_info: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          difficulty: string | null
          duration_minutes: number | null
          external_url: string | null
          id: string
          internal_rating: number | null
          is_required: boolean | null
          language: string | null
          metadata: Json | null
          priority: string | null
          recommended_by: string | null
          resource_type: string
          slug: string
          status: string | null
          tags: string[] | null
          title: string
          topic: string
          updated_at: string | null
        }
        Insert: {
          additional_links?: Json | null
          author?: string | null
          completion_requirements?: string | null
          cost_info?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          difficulty?: string | null
          duration_minutes?: number | null
          external_url?: string | null
          id?: string
          internal_rating?: number | null
          is_required?: boolean | null
          language?: string | null
          metadata?: Json | null
          priority?: string | null
          recommended_by?: string | null
          resource_type: string
          slug: string
          status?: string | null
          tags?: string[] | null
          title: string
          topic: string
          updated_at?: string | null
        }
        Update: {
          additional_links?: Json | null
          author?: string | null
          completion_requirements?: string | null
          cost_info?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          difficulty?: string | null
          duration_minutes?: number | null
          external_url?: string | null
          id?: string
          internal_rating?: number | null
          is_required?: boolean | null
          language?: string | null
          metadata?: Json | null
          priority?: string | null
          recommended_by?: string | null
          resource_type?: string
          slug?: string
          status?: string | null
          tags?: string[] | null
          title?: string
          topic?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "wiki_learning_resources_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wiki_learning_resources_recommended_by_fkey"
            columns: ["recommended_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      wiki_learning_technologies: {
        Row: {
          created_at: string | null
          learning_resource_id: string
          technology_id: string
        }
        Insert: {
          created_at?: string | null
          learning_resource_id: string
          technology_id: string
        }
        Update: {
          created_at?: string | null
          learning_resource_id?: string
          technology_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wiki_learning_technologies_learning_resource_id_fkey"
            columns: ["learning_resource_id"]
            isOneToOne: false
            referencedRelation: "wiki_learning_resources"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wiki_learning_technologies_technology_id_fkey"
            columns: ["technology_id"]
            isOneToOne: false
            referencedRelation: "wiki_technologies"
            referencedColumns: ["id"]
          },
        ]
      }
      wiki_page_versions: {
        Row: {
          change_summary: string | null
          content: Json
          edited_at: string
          edited_by: string | null
          id: string
          metadata: Json | null
          title: string
          version: number
          wiki_page_id: string
        }
        Insert: {
          change_summary?: string | null
          content: Json
          edited_at?: string
          edited_by?: string | null
          id?: string
          metadata?: Json | null
          title: string
          version: number
          wiki_page_id: string
        }
        Update: {
          change_summary?: string | null
          content?: Json
          edited_at?: string
          edited_by?: string | null
          id?: string
          metadata?: Json | null
          title?: string
          version?: number
          wiki_page_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wiki_page_versions_edited_by_fkey"
            columns: ["edited_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wiki_page_versions_wiki_page_id_fkey"
            columns: ["wiki_page_id"]
            isOneToOne: false
            referencedRelation: "wiki_pages"
            referencedColumns: ["id"]
          },
        ]
      }
      wiki_page_views: {
        Row: {
          id: string
          ip_address: unknown
          user_agent: string | null
          user_id: string | null
          viewed_at: string
          wiki_page_id: string
        }
        Insert: {
          id?: string
          ip_address?: unknown
          user_agent?: string | null
          user_id?: string | null
          viewed_at?: string
          wiki_page_id: string
        }
        Update: {
          id?: string
          ip_address?: unknown
          user_agent?: string | null
          user_id?: string | null
          viewed_at?: string
          wiki_page_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wiki_page_views_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wiki_page_views_wiki_page_id_fkey"
            columns: ["wiki_page_id"]
            isOneToOne: false
            referencedRelation: "wiki_pages"
            referencedColumns: ["id"]
          },
        ]
      }
      wiki_pages: {
        Row: {
          attachments: Json | null
          author_id: string | null
          category: string
          content: Json
          cover_image: string | null
          created_at: string
          description: string | null
          display_order: number
          id: string
          last_edited_by: string | null
          metadata: Json | null
          parent_page_id: string | null
          published_at: string | null
          search_vector: unknown
          slug: string
          status: string
          subcategory: string | null
          tags: string[] | null
          title: string
          updated_at: string
          version: number
          visibility: string
        }
        Insert: {
          attachments?: Json | null
          author_id?: string | null
          category: string
          content?: Json
          cover_image?: string | null
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          last_edited_by?: string | null
          metadata?: Json | null
          parent_page_id?: string | null
          published_at?: string | null
          search_vector?: unknown
          slug: string
          status?: string
          subcategory?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string
          version?: number
          visibility?: string
        }
        Update: {
          attachments?: Json | null
          author_id?: string | null
          category?: string
          content?: Json
          cover_image?: string | null
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          last_edited_by?: string | null
          metadata?: Json | null
          parent_page_id?: string | null
          published_at?: string | null
          search_vector?: unknown
          slug?: string
          status?: string
          subcategory?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string
          version?: number
          visibility?: string
        }
        Relationships: [
          {
            foreignKeyName: "wiki_pages_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wiki_pages_last_edited_by_fkey"
            columns: ["last_edited_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wiki_pages_parent_page_id_fkey"
            columns: ["parent_page_id"]
            isOneToOne: false
            referencedRelation: "wiki_pages"
            referencedColumns: ["id"]
          },
        ]
      }
      wiki_procedure_brand_kits: {
        Row: {
          application_notes: string | null
          brand_kit_id: string
          created_at: string
          procedure_id: string
        }
        Insert: {
          application_notes?: string | null
          brand_kit_id: string
          created_at?: string
          procedure_id: string
        }
        Update: {
          application_notes?: string | null
          brand_kit_id?: string
          created_at?: string
          procedure_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wiki_procedure_brand_kits_brand_kit_id_fkey"
            columns: ["brand_kit_id"]
            isOneToOne: false
            referencedRelation: "brand_kits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wiki_procedure_brand_kits_brand_kit_id_fkey"
            columns: ["brand_kit_id"]
            isOneToOne: false
            referencedRelation: "brand_kits_with_version"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wiki_procedure_brand_kits_procedure_id_fkey"
            columns: ["procedure_id"]
            isOneToOne: false
            referencedRelation: "wiki_procedures"
            referencedColumns: ["id"]
          },
        ]
      }
      wiki_procedure_credenziali: {
        Row: {
          created_at: string
          credenziale_id: string
          procedure_id: string
          usage_notes: string | null
        }
        Insert: {
          created_at?: string
          credenziale_id: string
          procedure_id: string
          usage_notes?: string | null
        }
        Update: {
          created_at?: string
          credenziale_id?: string
          procedure_id?: string
          usage_notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "wiki_procedure_credenziali_credenziale_id_fkey"
            columns: ["credenziale_id"]
            isOneToOne: false
            referencedRelation: "credenziali"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wiki_procedure_credenziali_procedure_id_fkey"
            columns: ["procedure_id"]
            isOneToOne: false
            referencedRelation: "wiki_procedures"
            referencedColumns: ["id"]
          },
        ]
      }
      wiki_procedure_learning: {
        Row: {
          created_at: string
          learning_resource_id: string
          procedure_id: string
          relevance_notes: string | null
        }
        Insert: {
          created_at?: string
          learning_resource_id: string
          procedure_id: string
          relevance_notes?: string | null
        }
        Update: {
          created_at?: string
          learning_resource_id?: string
          procedure_id?: string
          relevance_notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "wiki_procedure_learning_learning_resource_id_fkey"
            columns: ["learning_resource_id"]
            isOneToOne: false
            referencedRelation: "wiki_learning_resources"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wiki_procedure_learning_procedure_id_fkey"
            columns: ["procedure_id"]
            isOneToOne: false
            referencedRelation: "wiki_procedures"
            referencedColumns: ["id"]
          },
        ]
      }
      wiki_procedure_pages: {
        Row: {
          created_at: string
          notes: string | null
          page_id: string
          procedure_id: string
          relationship_type: string | null
        }
        Insert: {
          created_at?: string
          notes?: string | null
          page_id: string
          procedure_id: string
          relationship_type?: string | null
        }
        Update: {
          created_at?: string
          notes?: string | null
          page_id?: string
          procedure_id?: string
          relationship_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "wiki_procedure_pages_page_id_fkey"
            columns: ["page_id"]
            isOneToOne: false
            referencedRelation: "wiki_pages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wiki_procedure_pages_procedure_id_fkey"
            columns: ["procedure_id"]
            isOneToOne: false
            referencedRelation: "wiki_procedures"
            referencedColumns: ["id"]
          },
        ]
      }
      wiki_procedure_projects: {
        Row: {
          application_notes: string | null
          created_at: string
          procedure_id: string
          project_id: string
        }
        Insert: {
          application_notes?: string | null
          created_at?: string
          procedure_id: string
          project_id: string
        }
        Update: {
          application_notes?: string | null
          created_at?: string
          procedure_id?: string
          project_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wiki_procedure_projects_procedure_id_fkey"
            columns: ["procedure_id"]
            isOneToOne: false
            referencedRelation: "wiki_procedures"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wiki_procedure_projects_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      wiki_procedure_software_projects: {
        Row: {
          application_notes: string | null
          created_at: string
          procedure_id: string
          software_project_id: string
        }
        Insert: {
          application_notes?: string | null
          created_at?: string
          procedure_id: string
          software_project_id: string
        }
        Update: {
          application_notes?: string | null
          created_at?: string
          procedure_id?: string
          software_project_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wiki_procedure_software_projects_procedure_id_fkey"
            columns: ["procedure_id"]
            isOneToOne: false
            referencedRelation: "wiki_procedures"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wiki_procedure_software_projects_software_project_id_fkey"
            columns: ["software_project_id"]
            isOneToOne: false
            referencedRelation: "software_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      wiki_procedure_tools: {
        Row: {
          created_at: string
          procedure_id: string
          tool_id: string
          usage_notes: string | null
        }
        Insert: {
          created_at?: string
          procedure_id: string
          tool_id: string
          usage_notes?: string | null
        }
        Update: {
          created_at?: string
          procedure_id?: string
          tool_id?: string
          usage_notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "wiki_procedure_tools_procedure_id_fkey"
            columns: ["procedure_id"]
            isOneToOne: false
            referencedRelation: "wiki_procedures"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wiki_procedure_tools_tool_id_fkey"
            columns: ["tool_id"]
            isOneToOne: false
            referencedRelation: "wiki_tools"
            referencedColumns: ["id"]
          },
        ]
      }
      wiki_procedure_versions: {
        Row: {
          change_summary: string | null
          edited_at: string
          edited_by: string | null
          id: string
          input: Json
          metadata: Json | null
          output: Json
          phases: Json
          title: string
          version: number
          wiki_procedure_id: string
        }
        Insert: {
          change_summary?: string | null
          edited_at?: string
          edited_by?: string | null
          id?: string
          input: Json
          metadata?: Json | null
          output: Json
          phases: Json
          title: string
          version: number
          wiki_procedure_id: string
        }
        Update: {
          change_summary?: string | null
          edited_at?: string
          edited_by?: string | null
          id?: string
          input?: Json
          metadata?: Json | null
          output?: Json
          phases?: Json
          title?: string
          version?: number
          wiki_procedure_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wiki_procedure_versions_edited_by_fkey"
            columns: ["edited_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wiki_procedure_versions_wiki_procedure_id_fkey"
            columns: ["wiki_procedure_id"]
            isOneToOne: false
            referencedRelation: "wiki_procedures"
            referencedColumns: ["id"]
          },
        ]
      }
      wiki_procedure_views: {
        Row: {
          id: string
          ip_address: unknown
          user_agent: string | null
          user_id: string | null
          viewed_at: string
          wiki_procedure_id: string
        }
        Insert: {
          id?: string
          ip_address?: unknown
          user_agent?: string | null
          user_id?: string | null
          viewed_at?: string
          wiki_procedure_id: string
        }
        Update: {
          id?: string
          ip_address?: unknown
          user_agent?: string | null
          user_id?: string | null
          viewed_at?: string
          wiki_procedure_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wiki_procedure_views_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wiki_procedure_views_wiki_procedure_id_fkey"
            columns: ["wiki_procedure_id"]
            isOneToOne: false
            referencedRelation: "wiki_procedures"
            referencedColumns: ["id"]
          },
        ]
      }
      wiki_procedures: {
        Row: {
          author_id: string | null
          category: string | null
          created_at: string
          description: string | null
          id: string
          input: Json
          is_template: boolean | null
          last_edited_by: string | null
          metadata: Json | null
          output: Json
          phases: Json
          published_at: string | null
          responsabile_user_id: string | null
          search_vector: unknown
          slug: string
          status: string
          subcategory: string | null
          tags: string[] | null
          template_source_id: string | null
          title: string
          updated_at: string
          version: number
          visibility: string
        }
        Insert: {
          author_id?: string | null
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          input?: Json
          is_template?: boolean | null
          last_edited_by?: string | null
          metadata?: Json | null
          output?: Json
          phases?: Json
          published_at?: string | null
          responsabile_user_id?: string | null
          search_vector?: unknown
          slug: string
          status?: string
          subcategory?: string | null
          tags?: string[] | null
          template_source_id?: string | null
          title: string
          updated_at?: string
          version?: number
          visibility?: string
        }
        Update: {
          author_id?: string | null
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          input?: Json
          is_template?: boolean | null
          last_edited_by?: string | null
          metadata?: Json | null
          output?: Json
          phases?: Json
          published_at?: string | null
          responsabile_user_id?: string | null
          search_vector?: unknown
          slug?: string
          status?: string
          subcategory?: string | null
          tags?: string[] | null
          template_source_id?: string | null
          title?: string
          updated_at?: string
          version?: number
          visibility?: string
        }
        Relationships: [
          {
            foreignKeyName: "wiki_procedures_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wiki_procedures_last_edited_by_fkey"
            columns: ["last_edited_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wiki_procedures_responsabile_user_id_fkey"
            columns: ["responsabile_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wiki_procedures_template_source_id_fkey"
            columns: ["template_source_id"]
            isOneToOne: false
            referencedRelation: "wiki_procedures"
            referencedColumns: ["id"]
          },
        ]
      }
      wiki_tech_credenziali: {
        Row: {
          access_type: string | null
          created_at: string | null
          credenziale_id: string
          notes: string | null
          technology_id: string
        }
        Insert: {
          access_type?: string | null
          created_at?: string | null
          credenziale_id: string
          notes?: string | null
          technology_id: string
        }
        Update: {
          access_type?: string | null
          created_at?: string | null
          credenziale_id?: string
          notes?: string | null
          technology_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wiki_tech_credenziali_credenziale_id_fkey"
            columns: ["credenziale_id"]
            isOneToOne: false
            referencedRelation: "credenziali"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wiki_tech_credenziali_technology_id_fkey"
            columns: ["technology_id"]
            isOneToOne: false
            referencedRelation: "wiki_technologies"
            referencedColumns: ["id"]
          },
        ]
      }
      wiki_tech_servizi_gestiti: {
        Row: {
          created_at: string | null
          servizio_gestito_id: string
          technology_id: string
          usage_notes: string | null
        }
        Insert: {
          created_at?: string | null
          servizio_gestito_id: string
          technology_id: string
          usage_notes?: string | null
        }
        Update: {
          created_at?: string | null
          servizio_gestito_id?: string
          technology_id?: string
          usage_notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "wiki_tech_servizi_gestiti_servizio_gestito_id_fkey"
            columns: ["servizio_gestito_id"]
            isOneToOne: false
            referencedRelation: "servizi_gestiti"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wiki_tech_servizi_gestiti_technology_id_fkey"
            columns: ["technology_id"]
            isOneToOne: false
            referencedRelation: "wiki_technologies"
            referencedColumns: ["id"]
          },
        ]
      }
      wiki_tech_software_projects: {
        Row: {
          created_at: string | null
          software_project_id: string
          technology_id: string
          usage_notes: string | null
        }
        Insert: {
          created_at?: string | null
          software_project_id: string
          technology_id: string
          usage_notes?: string | null
        }
        Update: {
          created_at?: string | null
          software_project_id?: string
          technology_id?: string
          usage_notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "wiki_tech_software_projects_software_project_id_fkey"
            columns: ["software_project_id"]
            isOneToOne: false
            referencedRelation: "software_projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wiki_tech_software_projects_technology_id_fkey"
            columns: ["technology_id"]
            isOneToOne: false
            referencedRelation: "wiki_technologies"
            referencedColumns: ["id"]
          },
        ]
      }
      wiki_technologies: {
        Row: {
          additional_links: Json | null
          adoption_level: string | null
          category: string
          created_at: string | null
          created_by: string | null
          current_version: string | null
          description: string | null
          documentation_url: string | null
          id: string
          license: string | null
          metadata: Json | null
          name: string
          official_website: string | null
          repository_url: string | null
          setup_notes: string | null
          slug: string
          status: string | null
          subcategory: string | null
          supported_versions: string[] | null
          tags: string[] | null
          updated_at: string | null
          usage_context: string | null
        }
        Insert: {
          additional_links?: Json | null
          adoption_level?: string | null
          category: string
          created_at?: string | null
          created_by?: string | null
          current_version?: string | null
          description?: string | null
          documentation_url?: string | null
          id?: string
          license?: string | null
          metadata?: Json | null
          name: string
          official_website?: string | null
          repository_url?: string | null
          setup_notes?: string | null
          slug: string
          status?: string | null
          subcategory?: string | null
          supported_versions?: string[] | null
          tags?: string[] | null
          updated_at?: string | null
          usage_context?: string | null
        }
        Update: {
          additional_links?: Json | null
          adoption_level?: string | null
          category?: string
          created_at?: string | null
          created_by?: string | null
          current_version?: string | null
          description?: string | null
          documentation_url?: string | null
          id?: string
          license?: string | null
          metadata?: Json | null
          name?: string
          official_website?: string | null
          repository_url?: string | null
          setup_notes?: string | null
          slug?: string
          status?: string | null
          subcategory?: string | null
          supported_versions?: string[] | null
          tags?: string[] | null
          updated_at?: string | null
          usage_context?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "wiki_technologies_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      wiki_tool_credenziali: {
        Row: {
          access_type: string | null
          created_at: string | null
          credenziale_id: string
          notes: string | null
          tool_id: string
        }
        Insert: {
          access_type?: string | null
          created_at?: string | null
          credenziale_id: string
          notes?: string | null
          tool_id: string
        }
        Update: {
          access_type?: string | null
          created_at?: string | null
          credenziale_id?: string
          notes?: string | null
          tool_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wiki_tool_credenziali_credenziale_id_fkey"
            columns: ["credenziale_id"]
            isOneToOne: false
            referencedRelation: "credenziali"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wiki_tool_credenziali_tool_id_fkey"
            columns: ["tool_id"]
            isOneToOne: false
            referencedRelation: "wiki_tools"
            referencedColumns: ["id"]
          },
        ]
      }
      wiki_tool_servizi_gestiti: {
        Row: {
          created_at: string | null
          servizio_gestito_id: string
          tool_id: string
          usage_notes: string | null
        }
        Insert: {
          created_at?: string | null
          servizio_gestito_id: string
          tool_id: string
          usage_notes?: string | null
        }
        Update: {
          created_at?: string | null
          servizio_gestito_id?: string
          tool_id?: string
          usage_notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "wiki_tool_servizi_gestiti_servizio_gestito_id_fkey"
            columns: ["servizio_gestito_id"]
            isOneToOne: false
            referencedRelation: "servizi_gestiti"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wiki_tool_servizi_gestiti_tool_id_fkey"
            columns: ["tool_id"]
            isOneToOne: false
            referencedRelation: "wiki_tools"
            referencedColumns: ["id"]
          },
        ]
      }
      wiki_tool_software_projects: {
        Row: {
          created_at: string | null
          software_project_id: string
          tool_id: string
          usage_notes: string | null
        }
        Insert: {
          created_at?: string | null
          software_project_id: string
          tool_id: string
          usage_notes?: string | null
        }
        Update: {
          created_at?: string | null
          software_project_id?: string
          tool_id?: string
          usage_notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "wiki_tool_software_projects_software_project_id_fkey"
            columns: ["software_project_id"]
            isOneToOne: false
            referencedRelation: "software_projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wiki_tool_software_projects_tool_id_fkey"
            columns: ["tool_id"]
            isOneToOne: false
            referencedRelation: "wiki_tools"
            referencedColumns: ["id"]
          },
        ]
      }
      wiki_tools: {
        Row: {
          additional_links: Json | null
          adoption_level: string | null
          category: string
          created_at: string | null
          created_by: string | null
          current_version: string | null
          description: string | null
          documentation_url: string | null
          id: string
          license: string | null
          metadata: Json | null
          name: string
          official_website: string | null
          repository_url: string | null
          setup_notes: string | null
          slug: string
          status: string | null
          subcategory: string | null
          supported_versions: string[] | null
          tags: string[] | null
          updated_at: string | null
          usage_context: string | null
        }
        Insert: {
          additional_links?: Json | null
          adoption_level?: string | null
          category: string
          created_at?: string | null
          created_by?: string | null
          current_version?: string | null
          description?: string | null
          documentation_url?: string | null
          id?: string
          license?: string | null
          metadata?: Json | null
          name: string
          official_website?: string | null
          repository_url?: string | null
          setup_notes?: string | null
          slug: string
          status?: string | null
          subcategory?: string | null
          supported_versions?: string[] | null
          tags?: string[] | null
          updated_at?: string | null
          usage_context?: string | null
        }
        Update: {
          additional_links?: Json | null
          adoption_level?: string | null
          category?: string
          created_at?: string | null
          created_by?: string | null
          current_version?: string | null
          description?: string | null
          documentation_url?: string | null
          id?: string
          license?: string | null
          metadata?: Json | null
          name?: string
          official_website?: string | null
          repository_url?: string | null
          setup_notes?: string | null
          slug?: string
          status?: string | null
          subcategory?: string | null
          supported_versions?: string[] | null
          tags?: string[] | null
          updated_at?: string | null
          usage_context?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "wiki_tools_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      brand_kits_with_version: {
        Row: {
          created_at: string | null
          created_by: string | null
          data_creazione: string | null
          data_ultima_modifica: string | null
          descrizione: string | null
          id: string | null
          metadata: Json | null
          nome: string | null
          persona_giuridica_id: string | null
          referente_sicilean_email: string | null
          stato: string | null
          tipo_gestione: string | null
          updated_at: string | null
          versione: string | null
          versione_display: string | null
          versione_major: number | null
          versione_minor: number | null
          versione_patch: number | null
          versione_precedente_id: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          data_creazione?: string | null
          data_ultima_modifica?: string | null
          descrizione?: string | null
          id?: string | null
          metadata?: Json | null
          nome?: string | null
          persona_giuridica_id?: string | null
          referente_sicilean_email?: string | null
          stato?: string | null
          tipo_gestione?: string | null
          updated_at?: string | null
          versione?: string | null
          versione_display?: never
          versione_major?: number | null
          versione_minor?: number | null
          versione_patch?: number | null
          versione_precedente_id?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          data_creazione?: string | null
          data_ultima_modifica?: string | null
          descrizione?: string | null
          id?: string | null
          metadata?: Json | null
          nome?: string | null
          persona_giuridica_id?: string | null
          referente_sicilean_email?: string | null
          stato?: string | null
          tipo_gestione?: string | null
          updated_at?: string | null
          versione?: string | null
          versione_display?: never
          versione_major?: number | null
          versione_minor?: number | null
          versione_patch?: number | null
          versione_precedente_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "brand_kits_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brand_kits_persona_giuridica_id_fkey"
            columns: ["persona_giuridica_id"]
            isOneToOne: false
            referencedRelation: "persone_giuridiche"
            referencedColumns: ["notion_id"]
          },
          {
            foreignKeyName: "brand_kits_versione_precedente_id_fkey"
            columns: ["versione_precedente_id"]
            isOneToOne: false
            referencedRelation: "brand_kits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brand_kits_versione_precedente_id_fkey"
            columns: ["versione_precedente_id"]
            isOneToOne: false
            referencedRelation: "brand_kits_with_version"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_dashboard_kpis: {
        Row: {
          lead_qualification_rate: number | null
          leads_contattati: number | null
          leads_convertiti: number | null
          leads_nuovi: number | null
          leads_persi: number | null
          leads_qualificati: number | null
          opp_chiuso_perso: number | null
          opp_chiuso_vinto: number | null
          opp_negoziazione: number | null
          opp_proposta: number | null
          opp_scoperta: number | null
          opportunity_win_rate: number | null
          pipeline_value: number | null
          won_revenue: number | null
        }
        Relationships: []
      }
      dashboard_metrics: {
        Row: {
          active_quotes: number | null
          conversion_rate_3m: number | null
          most_popular_service: string | null
          most_used_template: string | null
          quotes_this_month: number | null
          revenue_this_month: number | null
        }
        Relationships: []
      }
      mv_stats_persone_giuridiche: {
        Row: {
          last_updated: string | null
          total_clienti: number | null
          total_count: number | null
          unique_comuni: number | null
          unique_province: number | null
        }
        Relationships: []
      }
      popular_services: {
        Row: {
          service_id: string | null
          service_name: string | null
          service_type: string | null
          total_revenue: number | null
          usage_count: number | null
        }
        Relationships: []
      }
      profiles_with_email: {
        Row: {
          bio: string | null
          cognome: string | null
          email: string | null
          email_personale: string | null
          foto_profilo: string | null
          id: string | null
          nome: string | null
          professione: string | null
        }
        Insert: {
          bio?: string | null
          cognome?: string | null
          email?: string | null
          email_personale?: string | null
          foto_profilo?: string | null
          id?: string | null
          nome?: string | null
          professione?: string | null
        }
        Update: {
          bio?: string | null
          cognome?: string | null
          email?: string | null
          email_personale?: string | null
          foto_profilo?: string | null
          id?: string | null
          nome?: string | null
          professione?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      quotes_analytics: {
        Row: {
          accepted_count: number | null
          avg_value: number | null
          conversion_rate: number | null
          declined_count: number | null
          month: string | null
          quote_count: number | null
          status: string | null
          total_value: number | null
        }
        Relationships: []
      }
      roles_summary: {
        Row: {
          accessible_tables: string | null
          description: string | null
          name: string | null
          tables_accessible: number | null
          total_permissions: number | null
        }
        Relationships: []
      }
      template_usage: {
        Row: {
          actual_usage: number | null
          avg_quote_value: number | null
          category: string | null
          last_used: string | null
          template_id: string | null
          template_name: string | null
          usage_count: number | null
        }
        Relationships: []
      }
      user_permissions_summary: {
        Row: {
          action: string | null
          action_description: string | null
          resource: string | null
          role_description: string | null
          role_name: string | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          cognome: string | null
          created_at: string | null
          display_name: string | null
          email: string | null
          id: string | null
          last_sign_in_at: string | null
          nome: string | null
          updated_at: string | null
        }
        Insert: {
          cognome?: never
          created_at?: string | null
          display_name?: never
          email?: string | null
          id?: string | null
          last_sign_in_at?: string | null
          nome?: never
          updated_at?: string | null
        }
        Update: {
          cognome?: never
          created_at?: string | null
          display_name?: never
          email?: string | null
          id?: string | null
          last_sign_in_at?: string | null
          nome?: never
          updated_at?: string | null
        }
        Relationships: []
      }
      v_budget_tracking: {
        Row: {
          alert_triggered: boolean | null
          budget_id: string | null
          category_id: string | null
          category_name: string | null
          period_end: string | null
          period_start: string | null
          period_type: string | null
          remaining_amount: number | null
          spent_amount: number | null
          target_amount: number | null
          usage_percentage: number | null
        }
        Relationships: [
          {
            foreignKeyName: "budget_targets_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "transaction_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      v_financial_kpis: {
        Row: {
          burn_rate: number | null
          last_3m_expenses: number | null
          last_3m_income: number | null
          profit_margin_percent: number | null
          runway_months: number | null
          total_balance: number | null
        }
        Relationships: []
      }
      v_unreconciled_transactions: {
        Row: {
          amount: number | null
          counterparty_id: string | null
          counterparty_name: string | null
          created_at: string | null
          currency: string | null
          description: string | null
          id: string | null
          persona_fisica_id: string | null
          persona_giuridica_id: string | null
          reference: string | null
          type: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transactions_persona_fisica_id_fkey"
            columns: ["persona_fisica_id"]
            isOneToOne: false
            referencedRelation: "persone_fisiche"
            referencedColumns: ["notion_id"]
          },
          {
            foreignKeyName: "transactions_persona_giuridica_id_fkey"
            columns: ["persona_giuridica_id"]
            isOneToOne: false
            referencedRelation: "persone_giuridiche"
            referencedColumns: ["notion_id"]
          },
        ]
      }
    }
    Functions: {
      aggiungi_contatto_persona_fisica: {
        Args: { p_notion_id: string; p_tipo: string; p_valore: string }
        Returns: undefined
      }
      aggiungi_file_documento: {
        Args: { p_nome_file: string; p_notion_id: string; p_tipo: string }
        Returns: undefined
      }
      aggiungi_presenza_online_persona_fisica: {
        Args: { p_notion_id: string; p_tipo: string; p_valore: string }
        Returns: undefined
      }
      apply_pricing_rules: { Args: { quote_config: Json }; Returns: Json }
      assign_role_to_user: {
        Args: { role_name: string; user_email: string }
        Returns: boolean
      }
      calcola_eta_persona_fisica: {
        Args: { p_notion_id: string }
        Returns: number
      }
      calculate_age: { Args: { birth_date: string }; Returns: number }
      calculate_contract_end_date: {
        Args: {
          p_inizio_servizio: string
          p_period_months: number
          p_total_slots: number
        }
        Returns: string
      }
      calculate_customer_clv: {
        Args: { client_id: string; client_type: string }
        Returns: {
          accepted_quotes: number
          conversion_rate: number
          customer_lifetime_value: number
          first_purchase_date: string
          last_purchase_date: string
          total_quotes: number
        }[]
      }
      calculate_next_renewal_date: {
        Args: {
          p_current_slot: number
          p_inizio_servizio: string
          p_period_months: number
        }
        Returns: string
      }
      calculate_notifications: { Args: { birth_date: string }; Returns: string }
      calculate_quote_totals: {
        Args: { quote_id: string }
        Returns: {
          discount_amount: number
          discount_percentage: number
          subtotal: number
          tax_amount: number
          tax_percentage: number
          total_amount: number
        }[]
      }
      can_access_user: { Args: { user_id: string }; Returns: boolean }
      can_view_credential: { Args: { credential_id: string }; Returns: boolean }
      can_view_password: { Args: { credenziale_id: string }; Returns: boolean }
      check_contact_rate_limit: {
        Args: { ip_address: unknown }
        Returns: boolean
      }
      check_email_duplicates: { Args: never; Returns: number }
      check_name_duplicates: { Args: never; Returns: number }
      check_piva_duplicates: { Args: never; Returns: number }
      cleanup_expired_callbacks: { Args: never; Returns: undefined }
      conta_cariche_persona_fisica: {
        Args: { p_notion_id: string }
        Returns: number
      }
      create_admin_user: {
        Args: { user_email: string; user_password?: string }
        Returns: string
      }
      create_competitor_relation_if_not_exists: {
        Args: { p_brand_kit_id: string; p_competitor_id: string }
        Returns: undefined
      }
      create_user_with_role: {
        Args: {
          role_name: string
          send_email?: boolean
          user_email: string
          user_password: string
        }
        Returns: Json
      }
      current_user_email: { Args: never; Returns: string }
      decrypt_password_aes: {
        Args: { encrypted_password: string }
        Returns: string
      }
      delete_user_by_id: { Args: { user_id_to_delete: string }; Returns: Json }
      encrypt_password: { Args: { plain_password: string }; Returns: string }
      encrypt_password_aes: { Args: { password_text: string }; Returns: string }
      extract_text_from_content: {
        Args: { content_json: Json }
        Returns: string
      }
      format_brand_kit_version: {
        Args: { major: number; minor: number; patch: number }
        Returns: string
      }
      generate_project_number: { Args: never; Returns: string }
      generate_wiki_slug: {
        Args: { base_text: string; table_name: string }
        Returns: string
      }
      get_all_users_with_roles: {
        Args: never
        Returns: {
          created_at: string
          email: string
          email_confirmed_at: string
          last_sign_in_at: string
          role_names: string
          roles: string[]
          user_id: string
        }[]
      }
      get_ceo_dashboard_stats: { Args: never; Returns: Json }
      get_credential_access_stats: {
        Args: { credential_id: string }
        Returns: {
          last_accessed: string
          last_modified: string
          total_edits: number
          total_views: number
          unique_users: number
        }[]
      }
      get_egress_tips: {
        Args: never
        Returns: {
          tip: string
        }[]
      }
      get_expiring_credentials: {
        Args: { days_threshold?: number }
        Returns: {
          categoria: string
          days_until_expiry: number
          id: string
          nome: string
          responsabile_email: string
          scadenza_password: string
        }[]
      }
      get_files_by_tipo: {
        Args: { p_notion_id: string; p_tipo: string }
        Returns: string[]
      }
      get_permissions_grouped: {
        Args: never
        Returns: {
          permissions: Json
          resource: string
        }[]
      }
      get_roles_summary: {
        Args: never
        Returns: {
          created_at: string
          permissions_count: number
          role_description: string
          role_id: string
          role_name: string
          updated_at: string
          users_count: number
        }[]
      }
      get_sicilean_users: {
        Args: never
        Returns: {
          email: string
          id: string
          nome: string
        }[]
      }
      get_unique_comuni_optimized: { Args: never; Returns: string[] }
      get_unique_organization_types_optimized: {
        Args: never
        Returns: string[]
      }
      get_unique_provinces_optimized: { Args: never; Returns: string[] }
      get_unique_settori_optimized: { Args: never; Returns: string[] }
      get_user_permissions:
        | {
            Args: { target_user_id?: string }
            Returns: {
              action: string
              permission_id: string
              resource: string
              source: string
            }[]
          }
        | {
            Args: { user_email?: string }
            Returns: {
              action_name: string
              resource_name: string
            }[]
          }
      get_user_roles: {
        Args: never
        Returns: {
          description: string
          id: string
          name: string
        }[]
      }
      get_user_roles_by_email: {
        Args: { user_email?: string }
        Returns: {
          role_description: string
          role_name: string
        }[]
      }
      get_users_list: {
        Args: never
        Returns: {
          email: string
          id: string
        }[]
      }
      has_credential_access: {
        Args: {
          p_credenziale_id: string
          p_required_level?: string
          p_user_id: string
        }
        Returns: boolean
      }
      has_finance_access: { Args: never; Returns: boolean }
      has_permission: {
        Args: { action_name: string; resource_name: string }
        Returns: boolean
      }
      has_role: { Args: { role_name: string }; Returns: boolean }
      is_admin: { Args: never; Returns: boolean }
      is_admin_user: { Args: never; Returns: boolean }
      is_authenticated: { Args: never; Returns: boolean }
      is_super_admin: { Args: never; Returns: boolean }
      is_user_admin:
        | { Args: never; Returns: boolean }
        | { Args: { user_id: string }; Returns: boolean }
      log_credential_access: {
        Args: {
          p_action: string
          p_changed_fields?: Json
          p_credential_id: string
          p_ip_address?: unknown
          p_user_agent?: string
        }
        Returns: undefined
      }
      log_password_view:
        | {
            Args: {
              p_credenziale_id: string
              p_ip_address?: unknown
              p_user_agent?: string
            }
            Returns: undefined
          }
        | {
            Args: {
              p_credenziale_id: string
              p_ip_address?: string
              p_user_agent?: string
            }
            Returns: undefined
          }
      process_compression_queue: {
        Args: never
        Returns: {
          error_count: number
          processed_count: number
        }[]
      }
      refresh_stats_views: { Args: never; Returns: string }
      remove_role_from_user: {
        Args: { role_name: string; user_email: string }
        Returns: boolean
      }
      revoke_credential_access: {
        Args: { p_credential_id: string; p_user_id: string }
        Returns: boolean
      }
      rimuovi_file_documento: {
        Args: { p_nome_file: string; p_notion_id: string; p_tipo: string }
        Returns: undefined
      }
      search_wiki_pages: {
        Args: {
          category_filter?: string
          limit_count?: number
          search_query: string
          status_filter?: string
          visibility_filter?: string
        }
        Returns: {
          category: string
          created_at: string
          description: string
          id: string
          published_at: string
          rank: number
          slug: string
          status: string
          subcategory: string
          tags: string[]
          title: string
          updated_at: string
          version: number
          visibility: string
        }[]
      }
      set_user_role: {
        Args: { new_role_name: string; target_user_id: string }
        Returns: Json
      }
      share_credential: {
        Args: {
          p_access_level?: string
          p_credential_id: string
          p_expires_at?: string
          p_user_id: string
        }
        Returns: string
      }
      suggest_invoice_match: {
        Args: { p_transaction_id: string }
        Returns: {
          invoice_id: string
          invoice_number: string
          match_reason: string
          match_score: number
          total_amount: number
        }[]
      }
      test_connection: { Args: never; Returns: string }
      test_notion_functions: {
        Args: never
        Returns: {
          function_name: string
          result: string
        }[]
      }
      test_notion_schema: {
        Args: never
        Returns: {
          table_name: string
        }[]
      }
      user_has_permission: {
        Args: { action_name: string; resource_name: string }
        Returns: boolean
      }
      user_has_role: { Args: { role_name: string }; Returns: boolean }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

// ========================================
// HELPER TYPES - Sicilean Gestionale
// ========================================

// Type aliases semplificati per le tabelle principali
export type Account = Tables<'accounts'>
export type Article = Tables<'articles'>
export type AuditLog = Tables<'audit_log'>
export type BankAccount = Tables<'bank_accounts'>
export type BankConnection = Tables<'bank_connections'>
export type BrandKit = Tables<'brand_kits'>
export type BrandKitColor = Tables<'brand_kit_colors'>
export type BrandKitFile = Tables<'brand_kit_files'>
export type BrandKitFolder = Tables<'brand_kit_folders'>
export type BrandKitFeedback = Tables<'brand_kit_feedback'>
export type BrandKitStrategy = Tables<'brand_kit_strategy'>
export type BrandKitPersona = Tables<'brand_kit_personas'>
export type BrandKitCoreValue = Tables<'brand_kit_core_values'>
export type BrandKitContentPillar = Tables<'brand_kit_content_pillars'>
export type BrandKitCompetitor = Tables<'brand_kit_competitors'>
export type BrandKitGlossary = Tables<'brand_kit_glossary'>
export type BrandKitToneGuideline = Tables<'brand_kit_tone_guidelines'>
export type BrandKitCommunicationExample = Tables<'brand_kit_communication_examples'>
export type BudgetTarget = Tables<'budget_targets'>
export type CompanyInfo = Tables<'company_info'>
export type ConsultingService = Tables<'consulting_services'>
export type Contact = Tables<'contacts'>
export type Counterparty = Tables<'counterparties'>
export type CounterpartyAccount = Tables<'counterparty_accounts'>
export type Credenziale = Tables<'credenziali'>
export type CredenzialeAccess = Tables<'credenziali_access'>
export type CredenzialeAuditLog = Tables<'credenziali_audit_log'>
export type CrmActivity = Tables<'crm_activities'>
export type CrmLead = Tables<'crm_leads'>
export type CrmOpportunity = Tables<'crm_opportunities'>
export type CrmOpportunityQuote = Tables<'crm_opportunity_quotes'>
export type Invoice = Tables<'invoices'>
export type InvoiceDocument = Tables<'invoice_documents'>
export type MarketingAttribution = Tables<'marketing_attribution'>
export type MarketingCampaign = Tables<'marketing_campaigns'>
export type MarketingFeedback = Tables<'marketing_feedback'>
export type MarketingFeedbackToken = Tables<'marketing_feedback_tokens'>
export type MarketingSource = Tables<'marketing_sources'>
export type Permission = Tables<'permissions'>
export type PersonaFisica = Tables<'persone_fisiche'>
export type PersonaGiuridica = Tables<'persone_giuridiche'>
export type PersonaFisicaRelazione = Tables<'persone_fisiche_relazioni'>
export type PersonaGiuridicaRelazione = Tables<'persone_giuridiche_relazioni'>
export type PricingConfiguration = Tables<'pricing_configuration'>
export type PricingRule = Tables<'pricing_rules'>
export type Profile = Tables<'profiles'>
export type ProfileDocument = Tables<'profile_documents'>
export type Project = Tables<'projects'>
export type ProjectFeedback = Tables<'project_feedback'>
export type ProjectFeedbackToken = Tables<'project_feedback_tokens'>
export type ProjectFile = Tables<'project_files'>
export type ProjectMilestone = Tables<'project_milestones'>
export type Quote = Tables<'quotes'>
export type QuoteTemplate = Tables<'quote_templates'>
export type QuoteTerm = Tables<'quote_terms'>
export type Role = Tables<'roles'>
export type RolePermission = Tables<'role_permissions'>
export type Service = Tables<'services'>
export type ServiceModule = Tables<'service_modules'>
export type ServiceParameter = Tables<'service_parameters'>
export type ServicePreset = Tables<'service_presets'>
export type ServiceRelationship = Tables<'service_relationships'>
export type ServiceToModulesMapping = Tables<'service_to_modules_mapping'>
export type ServiceToBrandAssetsMapping = Tables<'service_to_brand_assets_mapping'>
export type ServiceToManagedServicesMapping = Tables<'service_to_managed_services_mapping'>
export type ServiceToRequirementsMapping = Tables<'service_to_requirements_mapping'>
export type ServizioGestito = Tables<'servizi_gestiti'>
export type SoftwareProject = Tables<'software_projects'>
export type SoftwareProjectChangelog = Tables<'software_project_changelog'>
export type SoftwareProjectEnvironment = Tables<'software_project_environments'>
export type SoftwareProjectFeature = Tables<'software_project_features'>
export type SoftwareProjectFeedback = Tables<'software_project_feedback'>
export type SoftwareProjectFile = Tables<'software_project_files'>
export type SoftwareProjectMilestone = Tables<'software_project_milestones'>
export type SoftwareProjectSpec = Tables<'software_project_specs'>
export type StrategyAnalyticsService = Tables<'strategy_analytics_services'>
export type Transaction = Tables<'transactions'>
export type TransactionCategory = Tables<'transaction_categories'>
export type TransactionDocument = Tables<'transaction_documents'>
export type TransactionInvoiceLink = Tables<'transaction_invoice_links'>
export type TransactionLeg = Tables<'transaction_legs'>
export type TransactionTag = Tables<'transaction_tags'>
export type UserPermission = Tables<'user_permissions'>
export type UserRole = Tables<'user_roles'>
export type WikiLearningResource = Tables<'wiki_learning_resources'>
export type WikiPage = Tables<'wiki_pages'>
export type WikiPageVersion = Tables<'wiki_page_versions'>
export type WikiProcedure = Tables<'wiki_procedures'>
export type WikiProcedureVersion = Tables<'wiki_procedure_versions'>
export type WikiTechnology = Tables<'wiki_technologies'>
export type WikiTool = Tables<'wiki_tools'>

// ========================================
// TYPES FOR CALLBACKS AND GENERIC USE
// ========================================

// Contatto type (from persone_fisiche.contatti JSON)
export interface Contatto {
  tipo: 'email' | 'pec' | 'telefono' | 'cellulare' | 'fax' | 'altro' | string
  valore: string
  note?: string
}

// Client selector callback type
export interface ClientSelection {
  id?: string
  notion_id: string
  nome_completo?: string
  ragione_sociale?: string
  email?: string
  telefono?: string
  indirizzo?: string
  cap?: string
  citta?: string
  provincia?: string
  contatti?: Contatto[]
  pec?: string
  partita_iva?: string
  codice_fiscale?: string
  tipo_organizzazione?: string
  forma_giuridica?: string
}

// Referente type for callbacks
export interface Referente {
  notion_id: string
  nome_completo: string
  email?: string | null
  telefono?: string | null
  ruolo?: string | null
}

// Relazione type for display
export interface RelazioneDisplay {
  tipo_relazione: string
  persona_fisica?: { nome_completo: string } | null
  azienda_1?: { ragione_sociale: string } | null
  azienda_2?: { ragione_sociale: string } | null
}

// Service Configuration type for quotes
export interface ServiceConfiguration {
  service_id?: string
  service_name?: string
  quantity?: number
  unit_price?: number
  base_price?: number
  discount?: number
  urgenza?: number
  complessita?: number
  volume_lavoro?: number
  importanza?: number
  altri_costi?: number
  budget_interno?: number
  budget_effettivo?: number
  duration?: {
    period_months: number
    recurrence_period: string
  } | null
  responsabile_user_id?: string | null
  customizations?: Record<string, string | number | boolean | null>
  notes?: string
  description?: string
  detailed_description?: string
  timeline?: string
  deliverables?: string[]
  requirements?: string[]
  workflow_steps?: WorkflowStep[]
  client_activities?: ClientActivity[]
  sales_notes?: SalesNotes
  billing_options?: BillingOption[]
  selected_modules?: Array<{
    module_id: string
    module_name: string
    parameters?: Record<string, string | number | boolean | null>
    calculated_price: number
  }>
  parameters?: Record<string, string | number | boolean | null>
}

// API Response wrapper
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// ========================================
// RECURRENCE PERIOD CONSTANTS & FUNCTIONS
// ========================================

export type RecurrencePeriod = 'mensile' | 'bimensile' | 'trimestrale' | 'semestrale' | 'annuale'
export type BillingType = 'anticipata_mensile' | 'anticipata_trimestrale' | 'anticipata_semestrale' | 'anticipata_annuale' | 'one_time'

export const RECURRENCE_PERIOD_MONTHS: Record<RecurrencePeriod, number> = {
  mensile: 1,
  bimensile: 2,
  trimestrale: 3,
  semestrale: 6,
  annuale: 12,
}

export const RECURRENCE_PERIOD_LABELS: Record<RecurrencePeriod, string> = {
  mensile: 'Mensile (ogni mese)',
  bimensile: 'Bimensile (ogni 2 mesi)',
  trimestrale: 'Trimestrale (ogni 3 mesi)',
  semestrale: 'Semestrale (ogni 6 mesi)',
  annuale: 'Annuale (ogni 12 mesi)',
}

export const BILLING_TYPE_LABELS: Record<BillingType, string> = {
  anticipata_mensile: 'Anticipata Mensile',
  anticipata_trimestrale: 'Anticipata Trimestrale',
  anticipata_semestrale: 'Anticipata Semestrale',
  anticipata_annuale: 'Anticipata Annuale',
  one_time: 'Una tantum',
}

// Helper functions per servizi ricorrenti

export function calculateRecurringDuration(periodMonths: number, quantity: number): { years: number; months: number } {
  const totalMonths = periodMonths * quantity
  const years = Math.floor(totalMonths / 12)
  const months = totalMonths % 12
  return { years, months }
}

export function formatDuration(years: number, months: number): string {
  const parts: string[] = []
  if (years > 0) {
    parts.push(years === 1 ? '1 anno' : `${years} anni`)
  }
  if (months > 0) {
    parts.push(months === 1 ? '1 mese' : `${months} mesi`)
  }
  return parts.length > 0 ? parts.join(' e ') : '0 mesi'
}

export function calculateNextRenewalDate(startDate: Date, periodMonths: number, currentSlot: number): Date {
  const nextDate = new Date(startDate)
  nextDate.setMonth(nextDate.getMonth() + (periodMonths * currentSlot))
  return nextDate
}

export function calculateContractEndDate(startDate: Date, periodMonths: number, totalSlots: number): Date {
  const endDate = new Date(startDate)
  endDate.setMonth(endDate.getMonth() + (periodMonths * totalSlots))
  return endDate
}

export function calculateResidualValue(unitPrice: number, totalSlots: number, slotsPaid: number): number {
  const remainingSlots = totalSlots - slotsPaid
  return unitPrice * remainingSlots
}

export function getBillingTypeFromRecurrence(recurrencePeriod: RecurrencePeriod | null): BillingType {
  if (!recurrencePeriod) return 'one_time'
  const mapping: Record<RecurrencePeriod, BillingType> = {
    mensile: 'anticipata_mensile',
    bimensile: 'anticipata_mensile', // Bimensile usa fatturazione mensile
    trimestrale: 'anticipata_trimestrale',
    semestrale: 'anticipata_semestrale',
    annuale: 'anticipata_annuale',
  }
  return mapping[recurrencePeriod]
}

// Service Configuration Types
export interface BillingOption {
  id: string
  name: string
  price: number
  frequency: 'one_time' | 'monthly' | 'quarterly' | 'yearly'
  description?: string
}

export interface WorkflowStep {
  id: string
  title: string
  description?: string
  order?: number
  estimated_duration?: string
}

export interface ClientActivity {
  id: string
  title: string
  description?: string
  order: number
}

export interface SalesNotes {
  how_to_sell?: string
  key_selling_points?: string[]
  objection_handling?: string[]
  ideal_client_profile?: string
  pricing_strategy?: string
  upsell_opportunities?: string[]
}

// Pricing Parameters Type
export interface PricingParams {
  base_price: number
  urgenza: number
  complessita: number
  volume_lavoro: number
  importanza: number
  altri_costi: number
  budget_interno: number
  budget_effettivo: number
}

// Relazione Type - for relationships between entities
export interface Relazione {
  id: number
  tipo_relazione: string
  entity_id?: string
  entity_name?: string
  note?: string | null
  created_at?: string | null
  persona_fisica_id?: string | null
  persona_giuridica_id?: string | null
  persona_fisica?: { nome_completo: string } | null
  persona_giuridica?: { ragione_sociale: string; p_iva?: string; forma_giuridica?: string; settore?: string; notion_id?: string } | null
}

// Client CLV Type - for CRM clients table
export interface ClientCLV {
  customerId: string
  customerName: string
  customerType: 'persona_fisica' | 'persona_giuridica'
  totalQuotes: number
  acceptedQuotes: number
  conversionRate: number
  customerLifetimeValue: number
  firstPurchaseDate: string | null
  lastPurchaseDate: string | null
  activeProjects: number
}

// Quote Service Type - Configurazione servizio nel preventivo
export interface QuoteService {
  service_id: string
  service_name: string
  quantity: number
  unit_price: number
  base_price?: number
  discount?: number
  
  // Parametri pricing - possono essere flat o nested
  urgenza?: number
  complessita?: number
  volume_lavoro?: number
  importanza?: number
  altri_costi?: number
  budget_interno?: number
  budget_effettivo?: number
  
  // Parametri pricing nested (alternativo)
  pricing_params?: {
    base_price: number
    urgenza: number
    complessita: number
    volume_lavoro: number
    importanza: number
    altri_costi: number
    budget_interno: number
    budget_effettivo: number
  }
  
  // Servizi ricorrenti
  duration?: {
    period_months: number
    recurrence_period: string
  } | null
  is_recurring?: boolean
  recurrence_period?: string
  recurrence_period_months?: number
  
  // Responsabile servizio
  responsabile_user_id?: string | null
  
  // Moduli
  selected_modules?: Array<{
    module_id: string
    module_name: string
    parameters?: Record<string, unknown>
    calculated_price: number
  }>
  
  // Parametri e customizations
  parameters?: Record<string, unknown>
  customizations?: Record<string, string | number | boolean | null>
  notes?: string
  description?: string
}

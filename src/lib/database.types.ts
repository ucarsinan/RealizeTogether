export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: '14.4'
  }
  public: {
    Tables: {
      conversations: {
        Row: {
          application_id: string
          created_at: string | null
          id: string
          project_id: string
        }
        Insert: {
          application_id: string
          created_at?: string | null
          id?: string
          project_id: string
        }
        Update: {
          application_id?: string
          created_at?: string | null
          id?: string
          project_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'conversations_application_id_fkey'
            columns: ['application_id']
            isOneToOne: false
            referencedRelation: 'project_applications'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'conversations_project_id_fkey'
            columns: ['project_id']
            isOneToOne: false
            referencedRelation: 'projects'
            referencedColumns: ['id']
          },
        ]
      }
      matches: {
        Row: {
          applicant_confirmed: boolean | null
          created_at: string | null
          creator_confirmed: boolean | null
          id: string
          matched_at: string | null
          project_id: string
          role_id: string | null
          user_id: string
        }
        Insert: {
          applicant_confirmed?: boolean | null
          created_at?: string | null
          creator_confirmed?: boolean | null
          id?: string
          matched_at?: string | null
          project_id: string
          role_id?: string | null
          user_id: string
        }
        Update: {
          applicant_confirmed?: boolean | null
          created_at?: string | null
          creator_confirmed?: boolean | null
          id?: string
          matched_at?: string | null
          project_id?: string
          role_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'matches_project_id_fkey'
            columns: ['project_id']
            isOneToOne: false
            referencedRelation: 'projects'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'matches_role_id_fkey'
            columns: ['role_id']
            isOneToOne: false
            referencedRelation: 'project_roles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'matches_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string | null
          id: string
          read_at: string | null
          sender_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string | null
          id?: string
          read_at?: string | null
          sender_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string | null
          id?: string
          read_at?: string | null
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'messages_conversation_id_fkey'
            columns: ['conversation_id']
            isOneToOne: false
            referencedRelation: 'conversations'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'messages_sender_id_fkey'
            columns: ['sender_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      nda_consents: {
        Row: {
          consented_at: string | null
          id: string
          project_id: string
          user_id: string
        }
        Insert: {
          consented_at?: string | null
          id?: string
          project_id: string
          user_id: string
        }
        Update: {
          consented_at?: string | null
          id?: string
          project_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'nda_consents_project_id_fkey'
            columns: ['project_id']
            isOneToOne: false
            referencedRelation: 'projects'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'nda_consents_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          full_name: string
          id: string
          imdb_url: string | null
          is_verified: boolean | null
          linkedin_url: string | null
          portfolio_url: string | null
          skills: string[]
          updated_at: string | null
          verification_type: Database['public']['Enums']['verification_type'] | null
          verified_at: string | null
          video_url: string | null
          vimeo_url: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          full_name: string
          id: string
          imdb_url?: string | null
          is_verified?: boolean | null
          linkedin_url?: string | null
          portfolio_url?: string | null
          skills?: string[]
          updated_at?: string | null
          verification_type?: Database['public']['Enums']['verification_type'] | null
          verified_at?: string | null
          video_url?: string | null
          vimeo_url?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          full_name?: string
          id?: string
          imdb_url?: string | null
          is_verified?: boolean | null
          linkedin_url?: string | null
          portfolio_url?: string | null
          skills?: string[]
          updated_at?: string | null
          verification_type?: Database['public']['Enums']['verification_type'] | null
          verified_at?: string | null
          video_url?: string | null
          vimeo_url?: string | null
        }
        Relationships: []
      }
      project_applications: {
        Row: {
          applicant_id: string
          created_at: string | null
          id: string
          message: string | null
          project_id: string
          role_id: string | null
          status: Database['public']['Enums']['application_status'] | null
          updated_at: string | null
        }
        Insert: {
          applicant_id: string
          created_at?: string | null
          id?: string
          message?: string | null
          project_id: string
          role_id?: string | null
          status?: Database['public']['Enums']['application_status'] | null
          updated_at?: string | null
        }
        Update: {
          applicant_id?: string
          created_at?: string | null
          id?: string
          message?: string | null
          project_id?: string
          role_id?: string | null
          status?: Database['public']['Enums']['application_status'] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'project_applications_applicant_id_fkey'
            columns: ['applicant_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'project_applications_project_id_fkey'
            columns: ['project_id']
            isOneToOne: false
            referencedRelation: 'projects'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'project_applications_role_id_fkey'
            columns: ['role_id']
            isOneToOne: false
            referencedRelation: 'project_roles'
            referencedColumns: ['id']
          },
        ]
      }
      project_roles: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          project_id: string
          quantity: number | null
          role_name: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          project_id: string
          quantity?: number | null
          role_name: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          project_id?: string
          quantity?: number | null
          role_name?: string
        }
        Relationships: [
          {
            foreignKeyName: 'project_roles_project_id_fkey'
            columns: ['project_id']
            isOneToOne: false
            referencedRelation: 'projects'
            referencedColumns: ['id']
          },
        ]
      }
      projects: {
        Row: {
          category: string | null
          collab_type: Database['public']['Enums']['collab_type']
          commitment_type: Database['public']['Enums']['commitment_type']
          created_at: string | null
          creator_id: string
          description: string
          id: string
          logline: string | null
          requires_nda: boolean | null
          stage: Database['public']['Enums']['project_stage'] | null
          status: Database['public']['Enums']['project_status'] | null
          synopsis_url: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          collab_type: Database['public']['Enums']['collab_type']
          commitment_type: Database['public']['Enums']['commitment_type']
          created_at?: string | null
          creator_id: string
          description: string
          id?: string
          logline?: string | null
          requires_nda?: boolean | null
          stage?: Database['public']['Enums']['project_stage'] | null
          status?: Database['public']['Enums']['project_status'] | null
          synopsis_url?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          collab_type?: Database['public']['Enums']['collab_type']
          commitment_type?: Database['public']['Enums']['commitment_type']
          created_at?: string | null
          creator_id?: string
          description?: string
          id?: string
          logline?: string | null
          requires_nda?: boolean | null
          stage?: Database['public']['Enums']['project_stage'] | null
          status?: Database['public']['Enums']['project_status'] | null
          synopsis_url?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'projects_creator_id_fkey'
            columns: ['creator_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      user_skills: {
        Row: {
          created_at: string | null
          experience_level: string | null
          id: string
          role_name: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          experience_level?: string | null
          id?: string
          role_name: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          experience_level?: string | null
          id?: string
          role_name?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'user_skills_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      application_status: 'pending' | 'in_talks' | 'matched' | 'rejected'
      collab_type: 'paid' | 'passion' | 'both'
      commitment_type: 'hobby' | 'side_project' | 'serious' | 'professional'
      project_stage: 'idea' | 'concept' | 'development' | 'ready' | 'production' | 'completed'
      project_status: 'open' | 'in_progress' | 'completed'
      verification_type: 'none' | 'portfolio' | 'identity'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      application_status: ['pending', 'in_talks', 'matched', 'rejected'],
      collab_type: ['paid', 'passion', 'both'],
      commitment_type: ['hobby', 'side_project', 'serious', 'professional'],
      project_stage: ['idea', 'concept', 'development', 'ready', 'production', 'completed'],
      project_status: ['open', 'in_progress', 'completed'],
      verification_type: ['none', 'portfolio', 'identity'],
    },
  },
} as const

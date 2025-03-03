export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      application_comments: {
        Row: {
          application_id: string
          comment: string
          created_at: string | null
          id: string
          type: string
          user_id: string | null
        }
        Insert: {
          application_id: string
          comment: string
          created_at?: string | null
          id?: string
          type: string
          user_id?: string | null
        }
        Update: {
          application_id?: string
          comment?: string
          created_at?: string | null
          id?: string
          type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "application_comments_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
        ]
      }
      application_statuses: {
        Row: {
          id: number
          name: string
        }
        Insert: {
          id: number
          name: string
        }
        Update: {
          id?: number
          name?: string
        }
        Relationships: []
      }
      applications: {
        Row: {
          application_number: string | null
          arn: string
          assigned_to: string | null
          card_type: string
          created_at: string | null
          customer_name: string
          customer_type: string
          documents: Json | null
          id: string
          itr_flag: string | null
          kit_no: string
          lrs_amount_consumed: number | null
          pan_number: string
          processing_type: string
          product_variant: string
          status: string
          status_id: number | null
          total_amount_loaded: number
          updated_at: string | null
        }
        Insert: {
          application_number?: string | null
          arn: string
          assigned_to?: string | null
          card_type: string
          created_at?: string | null
          customer_name: string
          customer_type: string
          documents?: Json | null
          id?: string
          itr_flag?: string | null
          kit_no: string
          lrs_amount_consumed?: number | null
          pan_number: string
          processing_type: string
          product_variant: string
          status?: string
          status_id?: number | null
          total_amount_loaded: number
          updated_at?: string | null
        }
        Update: {
          application_number?: string | null
          arn?: string
          assigned_to?: string | null
          card_type?: string
          created_at?: string | null
          customer_name?: string
          customer_type?: string
          documents?: Json | null
          id?: string
          itr_flag?: string | null
          kit_no?: string
          lrs_amount_consumed?: number | null
          pan_number?: string
          processing_type?: string
          product_variant?: string
          status?: string
          status_id?: number | null
          total_amount_loaded?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "applications_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_status_id_fkey"
            columns: ["status_id"]
            isOneToOne: false
            referencedRelation: "application_statuses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_status"
            columns: ["status_id"]
            isOneToOne: false
            referencedRelation: "application_statuses"
            referencedColumns: ["id"]
          },
        ]
      }
      auto_generated_files: {
        Row: {
          created_at: string | null
          file_name: string
          file_path: string
          id: string
          is_auto_generated: boolean | null
          record_count: number | null
        }
        Insert: {
          created_at?: string | null
          file_name: string
          file_path: string
          id?: string
          is_auto_generated?: boolean | null
          record_count?: number | null
        }
        Update: {
          created_at?: string | null
          file_name?: string
          file_path?: string
          id?: string
          is_auto_generated?: boolean | null
          record_count?: number | null
        }
        Relationships: []
      }
      bulk_processing_files: {
        Row: {
          created_at: string | null
          file_name: string
          file_path: string
          id: string
          maker_number: number
          processed_at: string | null
          status: string | null
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string | null
          file_name: string
          file_path: string
          id?: string
          maker_number: number
          processed_at?: string | null
          status?: string | null
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string | null
          file_name?: string
          file_path?: string
          id?: string
          maker_number?: number
          processed_at?: string | null
          status?: string | null
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bulk_processing_files_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      bulk_processing_results: {
        Row: {
          application_id: string | null
          created_at: string | null
          id: string
          maker1_file_id: string | null
          maker1_itr_flag: string | null
          maker1_lrs_amount: number | null
          maker1_total_amount: number | null
          maker2_file_id: string | null
          maker2_itr_flag: string | null
          maker2_lrs_amount: number | null
          maker2_total_amount: number | null
          message: string | null
          status: string
        }
        Insert: {
          application_id?: string | null
          created_at?: string | null
          id?: string
          maker1_file_id?: string | null
          maker1_itr_flag?: string | null
          maker1_lrs_amount?: number | null
          maker1_total_amount?: number | null
          maker2_file_id?: string | null
          maker2_itr_flag?: string | null
          maker2_lrs_amount?: number | null
          maker2_total_amount?: number | null
          message?: string | null
          status: string
        }
        Update: {
          application_id?: string | null
          created_at?: string | null
          id?: string
          maker1_file_id?: string | null
          maker1_itr_flag?: string | null
          maker1_lrs_amount?: number | null
          maker1_total_amount?: number | null
          maker2_file_id?: string | null
          maker2_itr_flag?: string | null
          maker2_lrs_amount?: number | null
          maker2_total_amount?: number | null
          message?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "bulk_processing_results_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bulk_processing_results_maker1_file_id_fkey"
            columns: ["maker1_file_id"]
            isOneToOne: false
            referencedRelation: "bulk_processing_files"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bulk_processing_results_maker2_file_id_fkey"
            columns: ["maker2_file_id"]
            isOneToOne: false
            referencedRelation: "bulk_processing_files"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
          username: string
        }
        Insert: {
          created_at?: string
          id: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          username: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          username?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      bytea_to_text: {
        Args: {
          data: string
        }
        Returns: string
      }
      http: {
        Args: {
          request: Database["public"]["CompositeTypes"]["http_request"]
        }
        Returns: unknown
      }
      http_delete:
        | {
            Args: {
              uri: string
            }
            Returns: unknown
          }
        | {
            Args: {
              uri: string
              content: string
              content_type: string
            }
            Returns: unknown
          }
      http_get:
        | {
            Args: {
              uri: string
            }
            Returns: unknown
          }
        | {
            Args: {
              uri: string
              data: Json
            }
            Returns: unknown
          }
      http_head: {
        Args: {
          uri: string
        }
        Returns: unknown
      }
      http_header: {
        Args: {
          field: string
          value: string
        }
        Returns: Database["public"]["CompositeTypes"]["http_header"]
      }
      http_list_curlopt: {
        Args: Record<PropertyKey, never>
        Returns: {
          curlopt: string
          value: string
        }[]
      }
      http_patch: {
        Args: {
          uri: string
          content: string
          content_type: string
        }
        Returns: unknown
      }
      http_post:
        | {
            Args: {
              uri: string
              content: string
              content_type: string
            }
            Returns: unknown
          }
        | {
            Args: {
              uri: string
              data: Json
            }
            Returns: unknown
          }
      http_put: {
        Args: {
          uri: string
          content: string
          content_type: string
        }
        Returns: unknown
      }
      http_reset_curlopt: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      http_set_curlopt: {
        Args: {
          curlopt: string
          value: string
        }
        Returns: boolean
      }
      text_to_bytea: {
        Args: {
          data: string
        }
        Returns: string
      }
      urlencode:
        | {
            Args: {
              data: Json
            }
            Returns: string
          }
        | {
            Args: {
              string: string
            }
            Returns: string
          }
        | {
            Args: {
              string: string
            }
            Returns: string
          }
    }
    Enums: {
      user_role: "maker" | "checker"
    }
    CompositeTypes: {
      http_header: {
        field: string | null
        value: string | null
      }
      http_request: {
        method: unknown | null
        uri: string | null
        headers: Database["public"]["CompositeTypes"]["http_header"][] | null
        content_type: string | null
        content: string | null
      }
      http_response: {
        status: number | null
        content_type: string | null
        headers: Database["public"]["CompositeTypes"]["http_header"][] | null
        content: string | null
      }
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

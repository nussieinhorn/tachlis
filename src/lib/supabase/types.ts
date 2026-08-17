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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      action_plans: {
        Row: {
          created_at: string
          id: string
          issue_id: string
          lead_name: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          issue_id: string
          lead_name?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          issue_id?: string
          lead_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "action_plans_issue_id_fkey"
            columns: ["issue_id"]
            isOneToOne: true
            referencedRelation: "issues"
            referencedColumns: ["id"]
          },
        ]
      }
      action_tasks: {
        Row: {
          action_plan_id: string
          created_at: string
          hidden: boolean
          id: string
          sort_order: number
          status: string
          title: string
        }
        Insert: {
          action_plan_id: string
          created_at?: string
          hidden?: boolean
          id?: string
          sort_order?: number
          status?: string
          title: string
        }
        Update: {
          action_plan_id?: string
          created_at?: string
          hidden?: boolean
          id?: string
          sort_order?: number
          status?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "action_tasks_action_plan_id_fkey"
            columns: ["action_plan_id"]
            isOneToOne: false
            referencedRelation: "action_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      action_team_members: {
        Row: {
          created_at: string
          email: string | null
          id: string
          issue_id: string
          name: string
          phone: string | null
          role: string
          status: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          issue_id: string
          name: string
          phone?: string | null
          role?: string
          status?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          issue_id?: string
          name?: string
          phone?: string | null
          role?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "action_team_members_issue_id_fkey"
            columns: ["issue_id"]
            isOneToOne: false
            referencedRelation: "issues"
            referencedColumns: ["id"]
          },
        ]
      }
      action_team_requests: {
        Row: {
          created_at: string
          email: string
          id: string
          issue_id: string
          message: string | null
          name: string
          phone: string | null
          status: string
          task_ids: string[] | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          issue_id: string
          message?: string | null
          name: string
          phone?: string | null
          status?: string
          task_ids?: string[] | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          issue_id?: string
          message?: string | null
          name?: string
          phone?: string | null
          status?: string
          task_ids?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "action_team_requests_issue_id_fkey"
            columns: ["issue_id"]
            isOneToOne: false
            referencedRelation: "issues"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          icon_slug: string | null
          label: string
          slug: string
          sort_order: number
        }
        Insert: {
          icon_slug?: string | null
          label: string
          slug: string
          sort_order?: number
        }
        Update: {
          icon_slug?: string | null
          label?: string
          slug?: string
          sort_order?: number
        }
        Relationships: []
      }
      comments: {
        Row: {
          author_id: string | null
          author_name: string
          body: string
          created_at: string
          id: string
          issue_id: string | null
          parent_comment_id: string | null
          solution_id: string | null
        }
        Insert: {
          author_id?: string | null
          author_name: string
          body: string
          created_at?: string
          id?: string
          issue_id?: string | null
          parent_comment_id?: string | null
          solution_id?: string | null
        }
        Update: {
          author_id?: string | null
          author_name?: string
          body?: string
          created_at?: string
          id?: string
          issue_id?: string | null
          parent_comment_id?: string | null
          solution_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "comments_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_issue_id_fkey"
            columns: ["issue_id"]
            isOneToOne: false
            referencedRelation: "issues"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_parent_comment_id_fkey"
            columns: ["parent_comment_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_solution_id_fkey"
            columns: ["solution_id"]
            isOneToOne: false
            referencedRelation: "solutions"
            referencedColumns: ["id"]
          },
        ]
      }
      communities: {
        Row: {
          created_at: string
          description: string | null
          display_code: string
          id: string
          location: string | null
          name: string
          owner_id: string | null
          privacy: string
          tone: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_code?: string
          id?: string
          location?: string | null
          name: string
          owner_id?: string | null
          privacy?: string
          tone?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_code?: string
          id?: string
          location?: string | null
          name?: string
          owner_id?: string | null
          privacy?: string
          tone?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "communities_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      community_access_requests: {
        Row: {
          community_id: string
          created_at: string
          id: string
          message: string | null
          status: string
          user_id: string
        }
        Insert: {
          community_id: string
          created_at?: string
          id?: string
          message?: string | null
          status?: string
          user_id: string
        }
        Update: {
          community_id?: string
          created_at?: string
          id?: string
          message?: string | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_access_requests_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_access_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      community_editors: {
        Row: {
          community_id: string
          created_at: string
          user_id: string
        }
        Insert: {
          community_id: string
          created_at?: string
          user_id: string
        }
        Update: {
          community_id?: string
          created_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_editors_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_editors_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      issue_alert_subscriptions: {
        Row: {
          created_at: string
          issue_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          issue_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          issue_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "issue_alert_subscriptions_issue_id_fkey"
            columns: ["issue_id"]
            isOneToOne: false
            referencedRelation: "issues"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "issue_alert_subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      issue_editors: {
        Row: {
          created_at: string
          issue_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          issue_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          issue_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "issue_editors_issue_id_fkey"
            columns: ["issue_id"]
            isOneToOne: false
            referencedRelation: "issues"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "issue_editors_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      issue_links: {
        Row: {
          created_at: string
          id: string
          issue_id: string
          label: string
          url: string
        }
        Insert: {
          created_at?: string
          id?: string
          issue_id: string
          label: string
          url: string
        }
        Update: {
          created_at?: string
          id?: string
          issue_id?: string
          label?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "issue_links_issue_id_fkey"
            columns: ["issue_id"]
            isOneToOne: false
            referencedRelation: "issues"
            referencedColumns: ["id"]
          },
        ]
      }
      issue_status_config: {
        Row: {
          color_token: string
          key: string
          label: string
          sort_order: number
        }
        Insert: {
          color_token: string
          key: string
          label: string
          sort_order?: number
        }
        Update: {
          color_token?: string
          key?: string
          label?: string
          sort_order?: number
        }
        Relationships: []
      }
      issue_supports: {
        Row: {
          contact_email: string | null
          contact_name: string | null
          contact_phone: string | null
          created_at: string
          id: string
          issue_id: string
          level: string
          user_id: string | null
        }
        Insert: {
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          id?: string
          issue_id: string
          level: string
          user_id?: string | null
        }
        Update: {
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          id?: string
          issue_id?: string
          level?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "issue_supports_issue_id_fkey"
            columns: ["issue_id"]
            isOneToOne: false
            referencedRelation: "issues"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "issue_supports_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      issue_updates: {
        Row: {
          author_id: string | null
          body: string
          created_at: string
          id: string
          issue_id: string
        }
        Insert: {
          author_id?: string | null
          body: string
          created_at?: string
          id?: string
          issue_id: string
        }
        Update: {
          author_id?: string | null
          body?: string
          created_at?: string
          id?: string
          issue_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "issue_updates_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "issue_updates_issue_id_fkey"
            columns: ["issue_id"]
            isOneToOne: false
            referencedRelation: "issues"
            referencedColumns: ["id"]
          },
        ]
      }
      issues: {
        Row: {
          action_plan_visible: boolean
          allow_suggest_solutions: boolean
          category_slug: string
          comments_enabled: boolean
          comments_require_login: boolean
          community_id: string | null
          created_at: string
          description: string
          description_more: string | null
          display_code: string
          first_chosen_prompted_at: string | null
          go_live_date: string | null
          hidden_date: string | null
          id: string
          location: string | null
          owner_id: string
          share_count: number
          show_hidden_solutions_after_chosen: boolean
          show_in_search: boolean
          show_on_homepage: boolean
          status: string
          support_requires_login: boolean
          title: string
          updated_at: string
          view_count: number
          visibility: string
          visit_count: number
          vote_requires_login: boolean
          voting_close_date: string | null
        }
        Insert: {
          action_plan_visible?: boolean
          allow_suggest_solutions?: boolean
          category_slug: string
          comments_enabled?: boolean
          comments_require_login?: boolean
          community_id?: string | null
          created_at?: string
          description: string
          description_more?: string | null
          display_code?: string
          first_chosen_prompted_at?: string | null
          go_live_date?: string | null
          hidden_date?: string | null
          id?: string
          location?: string | null
          owner_id: string
          share_count?: number
          show_hidden_solutions_after_chosen?: boolean
          show_in_search?: boolean
          show_on_homepage?: boolean
          status?: string
          support_requires_login?: boolean
          title: string
          updated_at?: string
          view_count?: number
          visibility?: string
          visit_count?: number
          vote_requires_login?: boolean
          voting_close_date?: string | null
        }
        Update: {
          action_plan_visible?: boolean
          allow_suggest_solutions?: boolean
          category_slug?: string
          comments_enabled?: boolean
          comments_require_login?: boolean
          community_id?: string | null
          created_at?: string
          description?: string
          description_more?: string | null
          display_code?: string
          first_chosen_prompted_at?: string | null
          go_live_date?: string | null
          hidden_date?: string | null
          id?: string
          location?: string | null
          owner_id?: string
          share_count?: number
          show_hidden_solutions_after_chosen?: boolean
          show_in_search?: boolean
          show_on_homepage?: boolean
          status?: string
          support_requires_login?: boolean
          title?: string
          updated_at?: string
          view_count?: number
          visibility?: string
          visit_count?: number
          vote_requires_login?: boolean
          voting_close_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "issues_category_slug_fkey"
            columns: ["category_slug"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["slug"]
          },
          {
            foreignKeyName: "issues_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "issues_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          issue_id: string
          payload: Json | null
          read_at: string | null
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          issue_id: string
          payload?: Json | null
          read_at?: string | null
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          issue_id?: string
          payload?: Json | null
          read_at?: string | null
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_issue_id_fkey"
            columns: ["issue_id"]
            isOneToOne: false
            referencedRelation: "issues"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      pending_invites: {
        Row: {
          created_at: string
          email: string
          id: string
          invited_by: string
          resource_id: string
          resource_type: string
          role: string
          status: string
          token: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          invited_by: string
          resource_id: string
          resource_type: string
          role: string
          status?: string
          token?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          invited_by?: string
          resource_id?: string
          resource_type?: string
          role?: string
          status?: string
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "pending_invites_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      private_access_requests: {
        Row: {
          created_at: string
          id: string
          issue_id: string
          message: string | null
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          issue_id: string
          message?: string | null
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          issue_id?: string
          message?: string | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "private_access_requests_issue_id_fkey"
            columns: ["issue_id"]
            isOneToOne: false
            referencedRelation: "issues"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "private_access_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          email_notify_types: string[]
          id: string
          name: string
          notify_types: string[]
          phone: string | null
          theme_preference: string
        }
        Insert: {
          created_at?: string
          email: string
          email_notify_types?: string[]
          id: string
          name?: string
          notify_types?: string[]
          phone?: string | null
          theme_preference?: string
        }
        Update: {
          created_at?: string
          email?: string
          email_notify_types?: string[]
          id?: string
          name?: string
          notify_types?: string[]
          phone?: string | null
          theme_preference?: string
        }
        Relationships: []
      }
      solution_status_config: {
        Row: {
          color_token: string
          key: string
          label: string
          sort_order: number
        }
        Insert: {
          color_token: string
          key: string
          label: string
          sort_order?: number
        }
        Update: {
          color_token?: string
          key?: string
          label?: string
          sort_order?: number
        }
        Relationships: []
      }
      solution_votes: {
        Row: {
          created_at: string
          id: string
          solution_id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          solution_id: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          solution_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "solution_votes_solution_id_fkey"
            columns: ["solution_id"]
            isOneToOne: false
            referencedRelation: "solutions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "solution_votes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      solutions: {
        Row: {
          cons: string[]
          created_at: string
          deleted: boolean
          description: string
          display_code: string
          hidden: boolean
          id: string
          is_chosen: boolean
          issue_id: string
          pros: string[]
          review_status: string
          sort_order: number
          status: string
          submitted_by: string
          submitter_location: string | null
          submitter_phone: string | null
          title: string
          updated_at: string
        }
        Insert: {
          cons?: string[]
          created_at?: string
          deleted?: boolean
          description: string
          display_code?: string
          hidden?: boolean
          id?: string
          is_chosen?: boolean
          issue_id: string
          pros?: string[]
          review_status?: string
          sort_order?: number
          status?: string
          submitted_by: string
          submitter_location?: string | null
          submitter_phone?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          cons?: string[]
          created_at?: string
          deleted?: boolean
          description?: string
          display_code?: string
          hidden?: boolean
          id?: string
          is_chosen?: boolean
          issue_id?: string
          pros?: string[]
          review_status?: string
          sort_order?: number
          status?: string
          submitted_by?: string
          submitter_location?: string | null
          submitter_phone?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "solutions_issue_id_fkey"
            columns: ["issue_id"]
            isOneToOne: false
            referencedRelation: "issues"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "solutions_submitted_by_fkey"
            columns: ["submitted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      accept_pending_invite: {
        Args: { p_token: string }
        Returns: {
          display_code: string
          resource_type: string
        }[]
      }
      comment_target_issue: {
        Args: { p_issue_id: string; p_solution_id: string }
        Returns: {
          action_plan_visible: boolean
          allow_suggest_solutions: boolean
          category_slug: string
          comments_enabled: boolean
          comments_require_login: boolean
          community_id: string | null
          created_at: string
          description: string
          description_more: string | null
          display_code: string
          first_chosen_prompted_at: string | null
          go_live_date: string | null
          hidden_date: string | null
          id: string
          location: string | null
          owner_id: string
          share_count: number
          show_hidden_solutions_after_chosen: boolean
          show_in_search: boolean
          show_on_homepage: boolean
          status: string
          support_requires_login: boolean
          title: string
          updated_at: string
          view_count: number
          visibility: string
          visit_count: number
          vote_requires_login: boolean
          voting_close_date: string | null
        }
        SetofOptions: {
          from: "*"
          to: "issues"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      delete_own_account: { Args: never; Returns: undefined }
      get_issue_stub: {
        Args: { p_display_code: string }
        Returns: {
          display_code: string
          id: string
          visibility: string
        }[]
      }
      has_community_edit_access: {
        Args: { p_community_id: string }
        Returns: boolean
      }
      has_issue_edit_access: { Args: { p_issue_id: string }; Returns: boolean }
      has_private_issue_access: {
        Args: { p_issue_id: string }
        Returns: boolean
      }
      is_super_admin: { Args: never; Returns: boolean }
      notify_issue_followers:
        | { Args: { p_issue_id: string; p_type: string }; Returns: undefined }
        | {
            Args: { p_issue_id: string; p_payload?: Json; p_type: string }
            Returns: undefined
          }
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

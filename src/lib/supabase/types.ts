export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: { id: string; name: string; email: string; phone: string | null; created_at: string };
        Insert: { id: string; name?: string; email: string; phone?: string | null };
        Update: { name?: string; phone?: string | null };
      };
      categories: {
        Row: { slug: string; label: string; sort_order: number };
        Insert: { slug: string; label: string; sort_order?: number };
        Update: { label?: string; sort_order?: number };
      };
      communities: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          location: string | null;
          privacy: "public" | "private";
          tone: string;
          owner_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          location?: string | null;
          privacy?: "public" | "private";
          tone?: string;
          owner_id?: string | null;
        };
        Update: Partial<{
          name: string;
          description: string | null;
          location: string | null;
          privacy: "public" | "private";
          tone: string;
        }>;
      };
      community_editors: {
        Row: { community_id: string; user_id: string; created_at: string };
        Insert: { community_id: string; user_id: string };
        Update: Record<string, never>;
      };
      issues: {
        Row: {
          id: string;
          community_id: string | null;
          title: string;
          description: string;
          description_more: string | null;
          category_slug: string;
          location: string | null;
          status: string;
          owner_id: string;
          visibility: "public" | "private";
          show_on_homepage: boolean;
          show_in_search: boolean;
          support_requires_login: boolean;
          vote_requires_login: boolean;
          comments_enabled: boolean;
          comments_require_login: boolean;
          allow_suggest_solutions: boolean;
          show_hidden_solutions_after_chosen: boolean;
          go_live_date: string | null;
          voting_close_date: string | null;
          hidden_date: string | null;
          share_count: number;
          visit_count: number;
          view_count: number;
          first_chosen_prompted_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["issues"]["Row"]> & {
          title: string;
          description: string;
          category_slug: string;
          owner_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["issues"]["Row"]>;
      };
      issue_editors: {
        Row: { issue_id: string; user_id: string; created_at: string };
        Insert: { issue_id: string; user_id: string };
        Update: Record<string, never>;
      };
      issue_supports: {
        Row: {
          id: string;
          issue_id: string;
          user_id: string | null;
          level: "just-support" | "resonates" | "willing-to-help";
          contact_name: string | null;
          contact_email: string | null;
          contact_phone: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          issue_id: string;
          user_id?: string | null;
          level: "just-support" | "resonates" | "willing-to-help";
          contact_name?: string | null;
          contact_email?: string | null;
          contact_phone?: string | null;
        };
        Update: Record<string, never>;
      };
      issue_links: {
        Row: { id: string; issue_id: string; label: string; url: string; created_at: string };
        Insert: { id?: string; issue_id: string; label: string; url: string };
        Update: Partial<{ label: string; url: string }>;
      };
      issue_updates: {
        Row: { id: string; issue_id: string; author_id: string | null; body: string; created_at: string };
        Insert: { id?: string; issue_id: string; author_id?: string | null; body: string };
        Update: Record<string, never>;
      };
      solutions: {
        Row: {
          id: string;
          issue_id: string;
          title: string;
          description: string;
          pros: string[];
          cons: string[];
          status: string;
          review_status: "pending" | "approved" | "rejected";
          is_chosen: boolean;
          submitted_by: string;
          submitter_phone: string | null;
          hidden: boolean;
          deleted: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["solutions"]["Row"]> & {
          issue_id: string;
          title: string;
          description: string;
          submitted_by: string;
        };
        Update: Partial<Database["public"]["Tables"]["solutions"]["Row"]>;
      };
      solution_votes: {
        Row: { id: string; solution_id: string; user_id: string | null; created_at: string };
        Insert: { id?: string; solution_id: string; user_id?: string | null };
        Update: Record<string, never>;
      };
      comments: {
        Row: {
          id: string;
          issue_id: string | null;
          solution_id: string | null;
          parent_comment_id: string | null;
          author_id: string | null;
          author_name: string;
          body: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          issue_id?: string | null;
          solution_id?: string | null;
          parent_comment_id?: string | null;
          author_id?: string | null;
          author_name: string;
          body: string;
        };
        Update: Record<string, never>;
      };
      action_plans: {
        Row: { id: string; issue_id: string; lead_name: string | null; created_at: string };
        Insert: { id?: string; issue_id: string; lead_name?: string | null };
        Update: Partial<{ lead_name: string | null }>;
      };
      action_tasks: {
        Row: {
          id: string;
          action_plan_id: string;
          title: string;
          status: string;
          sort_order: number;
          hidden: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          action_plan_id: string;
          title: string;
          status?: string;
          sort_order?: number;
          hidden?: boolean;
        };
        Update: Partial<{ title: string; status: string; sort_order: number; hidden: boolean }>;
      };
      action_team_members: {
        Row: {
          id: string;
          issue_id: string;
          name: string;
          email: string | null;
          phone: string | null;
          role: "lead" | "volunteer";
          status: "active" | "removed" | "hidden";
          created_at: string;
        };
        Insert: {
          id?: string;
          issue_id: string;
          name: string;
          email?: string | null;
          phone?: string | null;
          role?: "lead" | "volunteer";
          status?: "active" | "removed" | "hidden";
        };
        Update: Partial<{ status: "active" | "removed" | "hidden" }>;
      };
      action_team_requests: {
        Row: {
          id: string;
          issue_id: string;
          name: string;
          email: string;
          phone: string | null;
          message: string | null;
          task_ids: string[];
          status: "pending" | "approved" | "rejected";
          created_at: string;
        };
        Insert: {
          id?: string;
          issue_id: string;
          name: string;
          email: string;
          phone?: string | null;
          message?: string | null;
          task_ids?: string[];
        };
        Update: Partial<{ status: "pending" | "approved" | "rejected" }>;
      };
      private_access_requests: {
        Row: { id: string; issue_id: string; user_id: string; status: "pending" | "approved" | "rejected"; created_at: string };
        Insert: { id?: string; issue_id: string; user_id: string };
        Update: Partial<{ status: "pending" | "approved" | "rejected" }>;
      };
      issue_alert_subscriptions: {
        Row: { issue_id: string; user_id: string; created_at: string };
        Insert: { issue_id: string; user_id: string };
        Update: Record<string, never>;
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          issue_id: string;
          type: "update_posted" | "solution_chosen" | "status_changed" | "solution_suggested";
          read_at: string | null;
          created_at: string;
        };
        Insert: never;
        Update: Partial<{ read_at: string | null }>;
      };
    };
  };
};

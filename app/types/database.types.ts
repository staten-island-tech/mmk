export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      graphql: {
        Args: {
          extensions?: Json;
          operationName?: string;
          query?: string;
          variables?: Json;
        };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  public: {
    Tables: {
      battle_heartbeats: {
        Row: {
          last_heartbeat: string;
          uid: string;
        };
        Insert: {
          last_heartbeat?: string;
          uid?: string;
        };
        Update: {
          last_heartbeat?: string;
          uid?: string;
        };
        Relationships: [];
      };
      matches: {
        Row: {
          created_at: string;
          current_turn: string | null;
          game_state: Json | null;
          id: string;
          player1_uid: string;
          player2_uid: string;
          status: string;
          winner: string | null;
        };
        Insert: {
          created_at?: string;
          current_turn?: string | null;
          game_state?: Json | null;
          id?: string;
          player1_uid: string;
          player2_uid: string;
          status?: string;
          winner?: string | null;
        };
        Update: {
          created_at?: string;
          current_turn?: string | null;
          game_state?: Json | null;
          id?: string;
          player1_uid?: string;
          player2_uid?: string;
          status?: string;
          winner?: string | null;
        };
        Relationships: [];
      };
      matchmaking_heartbeats: {
        Row: {
          last_heartbeat: string;
          uid: string;
        };
        Insert: {
          last_heartbeat?: string;
          uid?: string;
        };
        Update: {
          last_heartbeat?: string;
          uid?: string;
        };
        Relationships: [];
      };
      matchmaking_queue: {
        Row: {
          joined_at: string;
          match_id: string | null;
          rank: string;
          status: string;
          uid: string;
        };
        Insert: {
          joined_at?: string;
          match_id?: string | null;
          rank?: string;
          status?: string;
          uid?: string;
        };
        Update: {
          joined_at?: string;
          match_id?: string | null;
          rank?: string;
          status?: string;
          uid?: string;
        };
        Relationships: [
          {
            foreignKeyName: "matchmaking_queue_uid_fkey1";
            columns: ["uid"];
            isOneToOne: true;
            referencedRelation: "matchmaking_heartbeats";
            referencedColumns: ["uid"];
          },
        ];
      };
      user_cards: {
        Row: {
          card_id: number;
          id: string;
          obtained_at: string;
          uid: string;
        };
        Insert: {
          card_id: number;
          id?: string;
          obtained_at?: string;
          uid?: string;
        };
        Update: {
          card_id?: number;
          id?: string;
          obtained_at?: string;
          uid?: string;
        };
        Relationships: [];
      };
      user_stats: {
        Row: {
          battle_card: string | null;
          draft: number | null;
          games: number;
          onboarded: boolean;
          uid: string;
          wins: number;
        };
        Insert: {
          battle_card?: string | null;
          draft?: number | null;
          games?: number;
          onboarded?: boolean;
          uid?: string;
          wins?: number;
        };
        Update: {
          battle_card?: string | null;
          draft?: number | null;
          games?: number;
          onboarded?: boolean;
          uid?: string;
          wins?: number;
        };
        Relationships: [
          {
            foreignKeyName: "user_stats_battle_card_fkey";
            columns: ["battle_card"];
            isOneToOne: false;
            referencedRelation: "user_cards";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      get_user_display_names: {
        Args: { user_ids: string[] };
        Returns: {
          display_name: string;
          id: string;
        }[];
      };
      release_matchmaking_lock: { Args: never; Returns: undefined };
      try_matchmaking_lock: { Args: never; Returns: boolean };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const;

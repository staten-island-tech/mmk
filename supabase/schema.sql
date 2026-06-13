


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE EXTENSION IF NOT EXISTS "pg_cron" WITH SCHEMA "pg_catalog";






CREATE EXTENSION IF NOT EXISTS "pg_net" WITH SCHEMA "extensions";






COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "hypopg" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "index_advisor" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."get_user_display_names"("user_ids" "uuid"[]) RETURNS TABLE("id" "uuid", "display_name" "text")
    LANGUAGE "sql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  SELECT 
    id, 
    raw_user_meta_data->>'display_name' AS display_name
  FROM auth.users
  WHERE id = ANY(user_ids);
$$;


ALTER FUNCTION "public"."get_user_display_names"("user_ids" "uuid"[]) OWNER TO "supabase_admin";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$begin
insert into
  public.user_stats (uid)
values
  (new.id);

return new;

end;$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "supabase_admin";


CREATE OR REPLACE FUNCTION "public"."release_matchmaking_lock"() RETURNS "void"
    LANGUAGE "sql"
    AS $$select
  pg_advisory_unlock(99999);$$;


ALTER FUNCTION "public"."release_matchmaking_lock"() OWNER TO "supabase_admin";


CREATE OR REPLACE FUNCTION "public"."try_matchmaking_lock"() RETURNS boolean
    LANGUAGE "sql"
    AS $$select
  pg_try_advisory_lock(99999)$$;


ALTER FUNCTION "public"."try_matchmaking_lock"() OWNER TO "supabase_admin";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."battle_heartbeats" (
    "uid" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    "last_heartbeat" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."battle_heartbeats" OWNER TO "supabase_admin";


COMMENT ON TABLE "public"."battle_heartbeats" IS 'Updates to users in battle.';



CREATE TABLE IF NOT EXISTS "public"."matches" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "player1_uid" "uuid" NOT NULL,
    "player2_uid" "uuid" NOT NULL,
    "current_turn" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "winner" "uuid",
    "game_state" "jsonb",
    "status" "text" DEFAULT 'waiting'::"text" NOT NULL,
    "player1_card_id" bigint NOT NULL,
    "player2_card_id" bigint NOT NULL,
    "rewarded" boolean DEFAULT false NOT NULL
);


ALTER TABLE "public"."matches" OWNER TO "supabase_admin";


COMMENT ON TABLE "public"."matches" IS 'List of matches between users.';



COMMENT ON COLUMN "public"."matches"."winner" IS 'The player who won the match.';



COMMENT ON COLUMN "public"."matches"."game_state" IS 'The state of the game.';



COMMENT ON COLUMN "public"."matches"."status" IS 'The status of the match.';



COMMENT ON COLUMN "public"."matches"."player1_card_id" IS 'The ID of Player 1''s battle card.';



COMMENT ON COLUMN "public"."matches"."player2_card_id" IS 'The ID of Player 2''s battle card.';



COMMENT ON COLUMN "public"."matches"."rewarded" IS 'Whether or not the winner has been rewarded.';



CREATE TABLE IF NOT EXISTS "public"."matchmaking_heartbeats" (
    "uid" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    "last_heartbeat" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."matchmaking_heartbeats" OWNER TO "supabase_admin";


COMMENT ON TABLE "public"."matchmaking_heartbeats" IS 'Updates to queue users.';



CREATE TABLE IF NOT EXISTS "public"."matchmaking_queue" (
    "uid" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    "rank" "text" DEFAULT ''::"text" NOT NULL,
    "status" "text" DEFAULT 'waiting'::"text" NOT NULL,
    "joined_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "match_id" "uuid"
);


ALTER TABLE "public"."matchmaking_queue" OWNER TO "supabase_admin";


COMMENT ON TABLE "public"."matchmaking_queue" IS 'The list of users in the matchmaking queue.';



CREATE TABLE IF NOT EXISTS "public"."user_cards" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "uid" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    "card_id" integer NOT NULL,
    "obtained_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."user_cards" OWNER TO "supabase_admin";


COMMENT ON TABLE "public"."user_cards" IS 'Table of user-owned cards.';



COMMENT ON COLUMN "public"."user_cards"."id" IS 'The user card entry ID.';



COMMENT ON COLUMN "public"."user_cards"."uid" IS 'The ID of the user owning the card.';



COMMENT ON COLUMN "public"."user_cards"."card_id" IS 'The ID of the card.';



COMMENT ON COLUMN "public"."user_cards"."obtained_at" IS 'The date and time at which the user obtained the card.';



CREATE TABLE IF NOT EXISTS "public"."user_stats" (
    "uid" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    "wins" integer DEFAULT 0 NOT NULL,
    "games" integer DEFAULT 0 NOT NULL,
    "onboarded" boolean DEFAULT false NOT NULL,
    "draft" integer,
    "battle_card" "uuid"
);


ALTER TABLE "public"."user_stats" OWNER TO "supabase_admin";


COMMENT ON TABLE "public"."user_stats" IS 'Stats associated with each user account.';



COMMENT ON COLUMN "public"."user_stats"."wins" IS 'The number of wins the user has.';



COMMENT ON COLUMN "public"."user_stats"."games" IS 'The number of games the user has played.';



COMMENT ON COLUMN "public"."user_stats"."onboarded" IS 'Whether or not the user completed the onboarding.';



COMMENT ON COLUMN "public"."user_stats"."draft" IS 'The ID of the user''s starter card drawn in the onboarding.';



COMMENT ON COLUMN "public"."user_stats"."battle_card" IS 'The card the user fights with in matches.';



ALTER TABLE ONLY "public"."battle_heartbeats"
    ADD CONSTRAINT "battle_heartbeats_pkey" PRIMARY KEY ("uid");



ALTER TABLE ONLY "public"."matches"
    ADD CONSTRAINT "matches_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."matchmaking_heartbeats"
    ADD CONSTRAINT "matchmaking_heartbeats_pkey" PRIMARY KEY ("uid");



ALTER TABLE ONLY "public"."matchmaking_queue"
    ADD CONSTRAINT "matchmaking_queue_pkey" PRIMARY KEY ("uid");



ALTER TABLE ONLY "public"."user_cards"
    ADD CONSTRAINT "user_cards_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_stats"
    ADD CONSTRAINT "user_stats_pkey" PRIMARY KEY ("uid");



CREATE OR REPLACE TRIGGER "trigger_matchmaking" AFTER INSERT OR UPDATE ON "public"."matchmaking_heartbeats" FOR EACH ROW EXECUTE FUNCTION "supabase_functions"."http_request"('https://YOUR_SUPABASE_URL/functions/v1/matchmaking', 'POST', '{"Content-type":"application/json","Authorization":"Bearer YOUR_ANON_KEY"}', '{}', '5000');



ALTER TABLE ONLY "public"."battle_heartbeats"
    ADD CONSTRAINT "battle_heartbeats_uid_fkey" FOREIGN KEY ("uid") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."matches"
    ADD CONSTRAINT "matches_current_turn_fkey" FOREIGN KEY ("current_turn") REFERENCES "auth"."users"("id") ON DELETE SET DEFAULT;



ALTER TABLE ONLY "public"."matches"
    ADD CONSTRAINT "matches_player1_uid_fkey" FOREIGN KEY ("player1_uid") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."matches"
    ADD CONSTRAINT "matches_player2_uid_fkey" FOREIGN KEY ("player2_uid") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."matches"
    ADD CONSTRAINT "matches_winner_fkey" FOREIGN KEY ("winner") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."matchmaking_heartbeats"
    ADD CONSTRAINT "matchmaking_heartbeats_uid_fkey" FOREIGN KEY ("uid") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."matchmaking_queue"
    ADD CONSTRAINT "matchmaking_queue_uid_fkey" FOREIGN KEY ("uid") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."matchmaking_queue"
    ADD CONSTRAINT "matchmaking_queue_uid_fkey1" FOREIGN KEY ("uid") REFERENCES "public"."matchmaking_heartbeats"("uid") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_cards"
    ADD CONSTRAINT "user_cards_uid_fkey" FOREIGN KEY ("uid") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_stats"
    ADD CONSTRAINT "user_stats_battle_card_fkey" FOREIGN KEY ("battle_card") REFERENCES "public"."user_cards"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."user_stats"
    ADD CONSTRAINT "user_stats_uid_fkey" FOREIGN KEY ("uid") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



CREATE POLICY "Allow users to view own data" ON "public"."user_stats" FOR SELECT USING ((( SELECT "auth"."uid"() AS "uid") = "uid"));



CREATE POLICY "Authenticated users can read heartbeats" ON "public"."battle_heartbeats" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Users can manage own queue row" ON "public"."matchmaking_queue" TO "authenticated" USING (("uid" = ( SELECT "auth"."uid"() AS "uid"))) WITH CHECK (("uid" = ( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "Users can read own matches" ON "public"."matches" FOR SELECT USING (((( SELECT "auth"."uid"() AS "uid") = "player1_uid") OR (( SELECT "auth"."uid"() AS "uid") = "player2_uid")));



CREATE POLICY "Users can update own matches" ON "public"."matches" FOR UPDATE USING (((( SELECT "auth"."uid"() AS "uid") = "player1_uid") OR (( SELECT "auth"."uid"() AS "uid") = "player2_uid")));



CREATE POLICY "Users can upsert own heartbeat" ON "public"."battle_heartbeats" USING (("uid" = ( SELECT "auth"."uid"() AS "uid"))) WITH CHECK (("uid" = ( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "Users can upsert own heartbeat" ON "public"."matchmaking_heartbeats" TO "authenticated" USING (("uid" = ( SELECT "auth"."uid"() AS "uid"))) WITH CHECK (("uid" = ( SELECT "auth"."uid"() AS "uid")));



CREATE POLICY "Users can view own cards" ON "public"."user_cards" FOR SELECT USING ((( SELECT "auth"."uid"() AS "uid") = "uid"));



ALTER TABLE "public"."battle_heartbeats" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."matches" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."matchmaking_heartbeats" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."matchmaking_queue" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_cards" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_stats" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";






ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."matches";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."matchmaking_queue";









GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

































































































































































































































GRANT ALL ON FUNCTION "public"."get_user_display_names"("user_ids" "uuid"[]) TO "postgres";
GRANT ALL ON FUNCTION "public"."get_user_display_names"("user_ids" "uuid"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."get_user_display_names"("user_ids" "uuid"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_user_display_names"("user_ids" "uuid"[]) TO "service_role";



REVOKE ALL ON FUNCTION "public"."handle_new_user"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "postgres";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."release_matchmaking_lock"() TO "postgres";
GRANT ALL ON FUNCTION "public"."release_matchmaking_lock"() TO "anon";
GRANT ALL ON FUNCTION "public"."release_matchmaking_lock"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."release_matchmaking_lock"() TO "service_role";



GRANT ALL ON FUNCTION "public"."try_matchmaking_lock"() TO "postgres";
GRANT ALL ON FUNCTION "public"."try_matchmaking_lock"() TO "anon";
GRANT ALL ON FUNCTION "public"."try_matchmaking_lock"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."try_matchmaking_lock"() TO "service_role";






























GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."battle_heartbeats" TO "postgres";
GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."battle_heartbeats" TO "anon";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."battle_heartbeats" TO "authenticated";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."battle_heartbeats" TO "service_role";



GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."matches" TO "postgres";
GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."matches" TO "anon";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."matches" TO "authenticated";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."matches" TO "service_role";



GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."matchmaking_heartbeats" TO "postgres";
GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."matchmaking_heartbeats" TO "anon";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."matchmaking_heartbeats" TO "authenticated";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."matchmaking_heartbeats" TO "service_role";



GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."matchmaking_queue" TO "postgres";
GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."matchmaking_queue" TO "anon";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."matchmaking_queue" TO "authenticated";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."matchmaking_queue" TO "service_role";



GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."user_cards" TO "postgres";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."user_cards" TO "anon";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."user_cards" TO "authenticated";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."user_cards" TO "service_role";



GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."user_stats" TO "postgres";
GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."user_stats" TO "anon";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."user_stats" TO "authenticated";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE "public"."user_stats" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLES TO "service_role";
































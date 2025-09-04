-- First drop the old foreign key constraint
ALTER TABLE "messages" DROP CONSTRAINT IF EXISTS "messages_session_id_chat_sessions_id_fk";

-- Add it back with ON DELETE CASCADE
ALTER TABLE "messages"
ADD CONSTRAINT "messages_session_id_chat_sessions_id_fk"
FOREIGN KEY ("session_id") REFERENCES "chat_sessions"("id")
ON DELETE CASCADE;

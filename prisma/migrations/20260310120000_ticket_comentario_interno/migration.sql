-- Add internal comment field to ticket for operational notes.
ALTER TABLE "Ticket"
ADD COLUMN "comentarioInterno" TEXT;

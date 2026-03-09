import { z } from "zod";
import { Perfil } from "@prisma/client";

const perfilSchema = z.nativeEnum(Perfil);

export const createUserSchema = z.object({
  authUserId: z.string().min(1, "authUserId é obrigatório"),
  nome: z.string().min(2, "Nome inválido"),
  email: z.string().email("E-mail inválido"),
  perfil: perfilSchema,
  ativo: z.boolean().optional()
});

export const updateUserSchema = z
  .object({
    nome: z.string().min(2, "Nome inválido").optional(),
    perfil: perfilSchema.optional(),
    ativo: z.boolean().optional()
  })
  .refine((payload) => Object.keys(payload).length > 0, {
    message: "Informe ao menos um campo para atualização"
  });

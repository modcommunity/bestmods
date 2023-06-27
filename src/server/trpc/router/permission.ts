import { z } from "zod";
import { router, adminProcedure } from "../trpc";

import { TRPCError } from "@trpc/server"

export const permissionRouter = router({
    addUserPerm: adminProcedure
        .input(z.object({
            userId: z.string(),
            perm: z.string()
        }))
        .mutation(async ({ ctx, input }) => {
            try {
                await ctx.prisma.permissions.create({
                    data: {
                        userId: input.userId,
                        perm: input.perm
                    }
                });
            } catch (error) {
                // Ignore error if it is due to existing entry.
                if (typeof error === "string" && error.includes("constraint"))
                    return;

                throw new TRPCError({
                    message: (typeof error == "string") ? error : "",
                    code: "BAD_REQUEST"
                });
            }
        })
});
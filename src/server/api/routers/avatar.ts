import { z } from 'zod'
import axios, { type AxiosResponse } from 'axios'

import { createTRPCRouter, publicProcedure } from '~/server/api/trpc'
import { env } from '~/env.mjs'

interface ResultData {
  url: string;
}

export const avatarRouter = createTRPCRouter({
  generate: publicProcedure
    .input(z.object({ characterClass: z.string(), sessionId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      if (!input.sessionId) {
        return {
          error: true,
        }
      }

      const res: AxiosResponse<{ data: ResultData[] }> = await axios
        .post('https://api.openai.com/v1/images/generations', {
          prompt: `d&d character portrait, ${input.characterClass}, detailed and colorful, by Larry Elmorer`,
          n: 1,
          size: '256x256',
        }, {
          headers: {
            Authorization: `Bearer ${env.OPENAI_API_KEY || ''}`,
          },
        })

      const results = res.data.data

      if (!results) {
        return {
          error: true,
        }
      }
      const url = results[0]?.url || ''

      if (!url) {
        return {
          error: true,
        }
      }
      // TODO: some error handling here, but screw that
      return ctx.prisma.avatar.create({
        data: {
          className: input.characterClass,
          sessionId: input.sessionId,
          url,
        },
      })
    }),
  getAvatar: publicProcedure
    .input(z.object({ sessionId: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.prisma.avatar.findMany({
        where: {
          sessionId: input.sessionId,
        },
      })
    }),
})

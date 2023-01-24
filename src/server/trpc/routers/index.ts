import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { protectedProcedure, publicProcedure, router } from '../trpc'

export const appRouter = router({
  hello: publicProcedure
    .input(
      z.object({
        text: z.string().nullish(),
      })
    )
    .query(({ input }) => {
      return {
        greeting: `hello ${input?.text ?? 'world'}`,
        time: new Date(),
      }
    }),
  whoami: protectedProcedure.query(({ ctx }) => {
    return ctx.session
  }),
  // get account
  getMyAccount: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.session.user?.email) {
      throw new TRPCError({ code: 'UNAUTHORIZED', message: 'unauthorized' })
    }
    const user = await ctx.prisma.user.findFirst({
      where: {
        email: ctx.session.user.email,
      },
      select: {
        avatar: true,
        username: true,
        image: true,
        name: true,
      },
    })
    return user
  }),
  // update account
  changeUsername: protectedProcedure.input(z.string()).mutation(async ({ input, ctx }) => {
    if (!ctx.session.user?.email) {
      throw new TRPCError({ code: 'UNAUTHORIZED', message: 'unauthorized' })
    }
    const existingUser = await ctx.prisma.user.findFirst({
      where: {
        email: ctx.session.user.email,
      },
      select: {
        id: true,
      },
    })
    if (!existingUser) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'User not found 🤨',
      })
    }
    const usernameExists = await ctx.prisma.user.findFirst({
      where: {
        username: input,
      },
      select: {
        id: true,
      },
    })
    if (usernameExists?.id === existingUser.id) {
      return null
    }
    if (usernameExists) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'Username exists',
      })
    }
    const user = await ctx.prisma.user.update({
      where: {
        id: existingUser.id,
      },
      data: {
        username: input,
      },
    })
    return user
  }),
  updateMyAccount: protectedProcedure
    .input(
      z.object({
        avatar: z.string().nullish(),
        bio: z.string().nullish(),
        image: z.string().nullish(),
        name: z.string().nullish(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.session.user?.email) {
        throw new TRPCError({ code: 'UNAUTHORIZED', message: 'unauthorized' })
      }
      const existingUser = await ctx.prisma.user.findFirst({
        where: {
          email: ctx.session.user.email,
        },
        select: {
          id: true,
        },
      })
      if (!existingUser) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found 🤨',
        })
      }
      const user = await ctx.prisma.user.update({
        where: {
          id: existingUser.id,
        },
        data: {
          ...input,
        },
      })
      return user
    }),
  getProfile: publicProcedure.input(z.string()).query(async ({ input, ctx }) => {
    const user = await ctx.prisma.user.findFirst({
      where: {
        OR: [{ username: input }, { email: input }],
      },
      select: {
        avatar: true,
        username: true,
        name: true,
        bio: true,
        image: true,
        links: true,
      },
    })
    return user
  }),
  createProfile: protectedProcedure
    .input(
      z.object({
        links: z.array(
          z.union([
            z.object({
              id: z.string(),
              url: z.string(),
              title: z.string(),
              image: z.string().optional().nullable(),
              icon: z.string().optional().nullable(),
              fontStyle: z.union([z.literal('normal'), z.literal('bold')]),
              fontColor: z.string(),
              backgroundColor: z.string(),
              type: z.literal('link'),
            }),
            z.object({
              id: z.string(),
              title: z.string(),
              fontStyle: z.union([z.literal('normal'), z.literal('bold')]),
              fontColor: z.string(),
              backgroundColor: z.string(),
              type: z.literal('header'),
            }),
          ])
        ),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.session.user?.email) {
        throw new TRPCError({ code: 'UNAUTHORIZED', message: 'unauthorized' })
      }
      const user = await ctx.prisma.user.findFirst({
        where: {
          email: ctx.session.user.email,
        },
      })
      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found 🤨',
        })
      }
      await ctx.prisma.link.deleteMany({
        where: { userId: user.id },
      })
      const now = new Date()
      const created = await ctx.prisma.user.update({
        where: { id: user.id },
        data: {
          links: {
            create: input.links.map(({ id, ...link }) => ({
              createTime: now,
              lastUpdatedTime: now,
              ...link,
            })),
          },
        },
      })
      return created
    }),
})

// export type definition of API
export type AppRouter = typeof appRouter

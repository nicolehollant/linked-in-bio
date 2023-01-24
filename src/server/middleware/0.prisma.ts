import { PrismaClient } from '@prisma/client'
import prisma from '../db/client'

declare module 'h3' {
  interface H3EventContext {
    prisma: PrismaClient
  }
}

export default eventHandler((event) => {
  if (!prisma) {
    const _prisma = new PrismaClient()
    event.context.prisma = _prisma
  } else {
    event.context.prisma = prisma
  }
})

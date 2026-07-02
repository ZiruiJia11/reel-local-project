import type {
  NextFunction,
  Request,
  Response,
} from "express"

import { prisma } from "../db/prisma"

export async function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (!req.user) {
    return res.status(401).json({
      message: "Authentication required",
    })
  }

  const user =
    await prisma.user.findUnique({
      where: {
        id: req.user.userId,
      },
      select: {
        role: true,
      },
    })

  if (!user || user.role !== "ADMIN") {
    return res.status(403).json({
      message: "Admin access required",
    })
  }

  return next()
}

import type {
  NextFunction,
  Request,
  Response,
} from "express"
import jwt from "jsonwebtoken"

type AuthenticatedUser = {
  userId: string
  email: string
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser
    }
  }
}

const JWT_SECRET =
  process.env.JWT_SECRET ||
  "development-secret"

export function authenticateUser(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const authHeader =
    req.headers.authorization

  if (
    !authHeader ||
    !authHeader.startsWith("Bearer ")
  ) {
    return res.status(401).json({
      message: "Authentication required",
    })
  }

  const token =
    authHeader.replace(
      "Bearer ",
      "",
    )

  try {
    const payload =
      jwt.verify(
        token,
        JWT_SECRET,
      )

    if (
      typeof payload === "string" ||
      !payload.userId ||
      !payload.email
    ) {
      return res.status(401).json({
        message: "Invalid token",
      })
    }

    req.user = {
      userId:
        payload.userId,
      email:
        payload.email,
    }

    return next()
  } catch {
    return res.status(401).json({
      message: "Invalid token",
    })
  }
}

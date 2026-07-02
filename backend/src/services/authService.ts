import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

import { prisma } from "../db/prisma"

const JWT_SECRET =
  process.env.JWT_SECRET ||
  "development-secret"

export async function registerUser(
  name: string,
  email: string,
  password: string,
) {

  const existingUser =
    await prisma.user.findUnique({
      where: {
        email,
      },
    })

  if (existingUser) {
    throw new Error(
      "User already exists"
    )
  }

  const tenant =
    await prisma.tenant.findFirst()

  if (!tenant) {
    throw new Error(
      "Tenant not found"
    )
  }

  const hashedPassword =
    await bcrypt.hash(
      password,
      10,
    )

  const user =
    await prisma.user.create({
      data: {
        name,
        email,
        password:
          hashedPassword,
        tenantId:
          tenant.id,
      },
    })

  return user
}

export async function loginUser(
  email: string,
  password: string,
) {

  const user =
    await prisma.user.findUnique({
      where: {
        email,
      },
    })

  if (
    !user ||
    !user.password
  ) {
    throw new Error(
      "Invalid credentials"
    )
  }

  const validPassword =
    await bcrypt.compare(
      password,
      user.password,
    )

  if (!validPassword) {
    throw new Error(
      "Invalid credentials"
    )
  }

  const token =
    jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
      },
      JWT_SECRET,
      {
        expiresIn: "7d",
      },
    )

  return {
    token,
    user,
  }
}

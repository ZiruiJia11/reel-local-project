export type User = {
  id: string
  name: string
  email: string
  role: string
}

const USER_KEY =
  "reel-local-user"

const TOKEN_KEY =
  "reel-local-token"

const API_URL =
  "http://localhost:3001"

export async function login(
  email: string,
  password: string,
) {

  const response =
    await fetch(
      `${API_URL}/api/auth/login`,
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({
          email,
          password,
        }),
      }
    )

  if (!response.ok) {
    throw new Error(
      "Invalid credentials"
    )
  }

  const data =
    await response.json()

  localStorage.setItem(
    TOKEN_KEY,
    data.token,
  )

  localStorage.setItem(
    USER_KEY,
    JSON.stringify(
      data.user
    ),
  )

  return data.user
}

export function logout() {

  localStorage.removeItem(
    TOKEN_KEY,
  )

  localStorage.removeItem(
    USER_KEY,
  )

}

export function getCurrentUser(): User | null {

  const data =
    localStorage.getItem(
      USER_KEY,
    )

  return data
    ? JSON.parse(data)
    : null

}

export function getToken() {

  return localStorage.getItem(
    TOKEN_KEY,
  )

}
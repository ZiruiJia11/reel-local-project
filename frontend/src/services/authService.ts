export type User = {
  name: string
  email: string
}

const STORAGE_KEY =
  "reel-local-user"

export function login(
  user: User
) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(user)
  )
}

export function logout() {
  localStorage.removeItem(
    STORAGE_KEY
  )
}

export function getCurrentUser(): User | null {
  const data =
    localStorage.getItem(STORAGE_KEY)

  return data
    ? JSON.parse(data)
    : null
}
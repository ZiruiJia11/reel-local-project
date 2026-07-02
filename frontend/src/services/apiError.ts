export async function getErrorMessage(
  response: Response,
  fallback: string,
) {
  try {
    const data =
      await response.json()

    if (
      data &&
      typeof data.message === "string"
    ) {
      return data.message
    }
  } catch {
    return fallback
  }

  return fallback
}

export function isAuthError(error: unknown) {
  return (
    error instanceof Error &&
    (
      error.message === "Authentication required" ||
      error.message === "Invalid token"
    )
  )
}

export async function apiFetch<T>(
  input: RequestInfo,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(input, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });

  if (!response.ok) {
    try {
      const payload = await response.json();
      const message = typeof payload?.error === "string" ? payload.error : response.statusText;
      throw new Error(message);
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Erro inesperado");
    }
  }

  return response.json();
}

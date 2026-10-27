// Errors a function can return to the browser. The message is shown to the shopper, so keep it plain.
export class HttpError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

export async function readJson(request: Request, maxBytes: number): Promise<unknown> {
  const text = await request.text();
  if (new TextEncoder().encode(text).length > maxBytes) throw new HttpError(413, "The request is too large.");
  try {
    return JSON.parse(text) as unknown;
  } catch {
    throw new HttpError(400, "The request body is not valid JSON.");
  }
}

// Shows HttpError messages as they are. Anything else is logged in full and shown generically.
export function failure(error: unknown): Response {
  if (error instanceof HttpError) return json({ error: error.message }, error.status);
  console.error(error);
  return json({ error: "Something went wrong. Try again." }, 500);
}

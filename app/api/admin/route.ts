import { copyFile, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { portfolioSchema } from "@/content/schema";

/**
 * Dev-only read/write for content/portfolio.json (CLAUDE.md §7).
 * Returns 404 in production; nothing here ever ships as a working endpoint.
 */
const CONTENT_FILE = path.join(process.cwd(), "content", "portfolio.json");
const BACKUP_FILE = path.join(process.cwd(), "content", "portfolio.backup.json");

const isProduction = process.env.NODE_ENV === "production";
const notFound = () => new Response("Not found", { status: 404 });

/** Reject cross-site writes (e.g. another tab's page trying to PUT to localhost). */
function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try {
    return new URL(origin).host === request.headers.get("host");
  } catch {
    return false; // e.g. "null" origins from sandboxed frames
  }
}

export async function GET() {
  if (isProduction) return notFound();
  const text = await readFile(CONTENT_FILE, "utf8");
  return Response.json(JSON.parse(text));
}

export async function PUT(request: Request) {
  if (isProduction) return notFound();
  if (!isSameOrigin(request)) return new Response("Forbidden", { status: 403 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Body must be JSON" }, { status: 400 });
  }

  const result = portfolioSchema.safeParse(body);
  if (!result.success) {
    return Response.json(
      {
        error: "Validation failed",
        issues: result.error.issues.map((i) => ({
          path: i.path.map((p) => (typeof p === "number" ? p : String(p))),
          message: i.message,
        })),
      },
      { status: 422 },
    );
  }

  await copyFile(CONTENT_FILE, BACKUP_FILE);
  await writeFile(CONTENT_FILE, `${JSON.stringify(result.data, null, 2)}\n`, "utf8");
  return Response.json({ ok: true });
}

import { Pool } from "pg";

let pool;

// Reuse the pool across invocations (best-effort)
function getPool() {
  if (!pool) {
    pool = new Pool({ connectionString: process.env.DATABASE_URL });
  }
  return pool;
}

export default async function handler(req, res) {
  try {
    const db = getPool();

    if (req.method === "GET") {
      const result = await db.query(
        "select id, content, created_at from notes order by created_at desc limit 50"
      );
      return res.status(200).json({ notes: result.rows });
    }

    if (req.method === "POST") {
      const { content } = req.body || {};
      if (typeof content !== "string" || content.trim().length === 0) {
        return res.status(400).json({ error: "content required" });
      }

      await db.query("insert into notes (content) values ($1)", [content.trim()]);
      return res.status(200).json({ ok: true });
    }

    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
}


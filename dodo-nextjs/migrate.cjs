const fs = require("fs");
const path = require("path");
const root = "C:/Users/ratho/Desktop/outbid/dodo-nextjs";
const envFile = fs.readFileSync(path.join(root, ".env.local"), "utf8");

function get(k) {
  const m = envFile.match(new RegExp("^" + k + '="?(.*)"?$', "m"));
  return m ? m[1] : undefined;
}

const { neon } = require("@neondatabase/serverless");
const sql = neon(get("DATABASE_URL_UNPOOLED"));
const migrationsDir = path.join(root, "migrations");
const files = fs
  .readdirSync(migrationsDir)
  .filter((f) => f.endsWith(".sql"))
  .sort();

async function main() {
  for (const file of files) {
    const schema = fs.readFileSync(path.join(migrationsDir, file), "utf8");
    const statements = schema
      .split(";")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    for (const stmt of statements) {
      await sql.query(stmt);
    }
    console.log(`Applied ${file}`);
  }
  const tables =
    await sql`select table_name from information_schema.tables where table_schema = 'public' order by table_name`;
  console.log("Tables:", tables.map((r) => r.table_name).join(", "));
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error("ERR:", e.message);
    process.exit(1);
  });
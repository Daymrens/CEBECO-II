/**
 * Seeds the default admin account.
 *
 *   npm run seed:admin
 *
 * Credentials (override via env):
 *   ADMIN_EMAIL    default admin@cebeco.example
 *   ADMIN_PASSWORD default admin1234
 *   ADMIN_NAME     default "CEBECO II Admin"
 *
 * Idempotent: if the email already exists its name/password are refreshed with
 * the current env values. The password is stored as a bcrypt hash, never
 * plaintext.
 */
import { hashPassword } from "../src/lib/auth/password"
import { getDb, resetDb } from "../src/lib/db"

async function main() {
  resetDb()
  const db = getDb()

  const email = (process.env.ADMIN_EMAIL || "admin@cebeco.example").trim().toLowerCase()
  const name = process.env.ADMIN_NAME || "CEBECO II Admin"
  const password = process.env.ADMIN_PASSWORD || "admin1234"

  if (password.length < 8) {
    console.error("ADMIN_PASSWORD must be at least 8 characters.")
    process.exit(1)
  }

  const hash = await hashPassword(password)
  const user = await db.createUser({ name, email, password_hash: hash, is_admin: true })

  console.log("Seeded admin:")
  console.log(`  name:     ${user.name}`)
  console.log(`  email:    ${user.email}`)
  console.log(`  password: ${password} (documented in README; change it!)`)
  console.log(`  store:    ${db.name}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
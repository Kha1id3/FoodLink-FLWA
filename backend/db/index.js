const pgp = require("pg-promise")({});
const db = pgp(
  process.env.DATABASE_URL || "postgres://postgres:12345678@localhost:5432/foodlink2"
);

module.exports = { db };

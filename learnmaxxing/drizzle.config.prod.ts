import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "sqlite",
  schema: "./worker/db/schema.ts",
  out: "./drizzle",
  driver: "d1-http",
  dbCredentials: {
    accountId: "23a42522df00728d9a9d546fb745fb7e",
    databaseId: "4af0230a-14c2-4226-a9a6-95e39b3e60fe",
    token: "hZIuIDHlUKFy-Zh5BT13QR30twBib5FBtdtgVzDu",
  },
});

import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "sqlite",
  schema: "./worker/db/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    url: "./.wrangler/state/v3/d1/miniflare-D1DatabaseObject/e8438967393d6e6a5033e4f45546181464c863b11aa726f346994f55700ecbc2.sqlite",
  },
});

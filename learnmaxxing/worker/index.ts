import { Hono } from "hono";
import type { D1Database } from "@cloudflare/workers-types"

export type WorkerBindings = {
  DB: D1Database
}

const app = new Hono<{ Bindings: WorkerBindings }>()


app.get('/api/', (c) => {
  // c.env.DB
  return c.json({
    name: "Hello"
  })
})

// export default app
//

export default {
  fetch: app.fetch
}

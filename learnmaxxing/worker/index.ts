import { Hono } from "hono";

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

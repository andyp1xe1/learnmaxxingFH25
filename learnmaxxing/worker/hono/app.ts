import { Hono } from "hono"
import type { WorkerBindings } from "../bindings"
import { jwt } from "hono/jwt"
import { drizzle } from "drizzle-orm/d1"
import { eq } from "drizzle-orm"
import { user } from "../db/schema"
import auth from "./auth"

const api = new Hono<{ Bindings: WorkerBindings }>()

// Public routes
api.get('/', (c) => { 
  return c.text('Up and running\n') 
})

api.route('/auth', auth);

// JWT middleware for protected routes
api.use('/protected/*', async (c, next) => {
  const jwtMiddleware = jwt({
    secret: c.env.JWT_SECRET,
  })
  return jwtMiddleware(c, next)
})

// Get current user profile
api.get('/protected/profile', async (c) => {
  try {
    const payload = c.get('jwtPayload')
    const db = drizzle(c.env.DB)
    
    const foundUser = await db.select().from(user).where(eq(user.id, payload.userId)).get()
    if (!foundUser) {
      return c.json({ error: "User not found" }, 404)
    }

    return c.json({
      id: foundUser.id,
      username: foundUser.username,
      createdAt: foundUser.createdAt
    })
    
  } catch (error) {
    console.error('Profile error:', error)
    return c.json({ error: "Failed to get profile" }, 500)
  }
})

const app = new Hono<{ Bindings: WorkerBindings }>()
  .route('/api', api)

export const AppType = typeof app

export default app

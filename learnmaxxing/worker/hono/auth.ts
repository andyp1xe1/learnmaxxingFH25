import { compare, hash } from "bcryptjs";
import { Hono } from "hono";
import { drizzle } from "drizzle-orm/d1";
import { eq } from "drizzle-orm";
import { sign } from "hono/jwt";
import { user } from "../db/schema";
import type { WorkerBindings } from "../bindings";

const auth = new Hono<{ Bindings: WorkerBindings }>();

// Signup endpoint
auth.post('/signup', async (c) => {
    try {
      const { username, password } = await c.req.json()
      console.log('[SIGNUP] Received:', { username, password: password ? '***' : undefined });
      
      if (!username || !password) {
        console.log('[SIGNUP] Missing username or password');
        return c.json({ error: "Username and password are required" }, 400)
      }
  
      if (password.length < 8) {
        console.log('[SIGNUP] Password too short');
        return c.json({ error: "Password must be at least 6 characters" }, 400)
      }
  
      const db = drizzle(c.env.DB)
      
      // Check if user already exists
      const existingUser = await db.select().from(user).where(eq(user.username, username)).get()
      console.log('[SIGNUP] Existing user:', existingUser);
      if (existingUser) {
        console.log('[SIGNUP] Username already exists');
        return c.json({ error: "Username already exists" }, 409)
      }
  
      // Hash password
      const hashedPassword = await hash(password, 12)
      console.log('[SIGNUP] Hashed password:', hashedPassword);
      
      // Create user
      let newUser;
      try {
        newUser = await db.insert(user).values({
          username,
          password: hashedPassword
        }).returning().get()
        console.log('[SIGNUP] New user created:', newUser);
      } catch (dbErr) {
        console.error('[SIGNUP] DB Insert Error:', dbErr);
        throw dbErr;
      }
  
      // Generate JWT token
      const token = await sign({ 
        userId: newUser.id, 
        username: newUser.username 
      }, c.env.JWT_SECRET)
  
      return c.json({ 
        message: "User created successfully",
        token,
        user: {
          id: newUser.id,
          username: newUser.username,
          createdAt: newUser.createdAt
        }
      }, 201)
    } catch (error) {
      if (error instanceof Error) {
        console.error('Signup error:', error.stack || error.message);
      } else {
        console.error('Signup error:', error);
      }
      return c.json({ error: "Failed to create user" }, 500)
    }
  })
  
  // Login endpoint
  auth.post('/login', async (c) => {
    try {
      const { username, password } = await c.req.json()
      
      if (!username || !password) {
        return c.json({ error: "Username and password are required" }, 400)
      }
  
      const db = drizzle(c.env.DB)
      
      // Find user
      const foundUser = await db.select().from(user).where(eq(user.username, username)).get()
      if (!foundUser) {
        return c.json({ error: "Invalid credentials" }, 401)
      }
  
      // Verify password
      const isValidPassword = await compare(password, foundUser.password || '')
      if (!isValidPassword) {
        return c.json({ error: "Invalid credentials" }, 401)
      }
  
      // Generate JWT token
      const token = await sign({ 
        userId: foundUser.id, 
        username: foundUser.username 
      }, c.env.JWT_SECRET)
  
      return c.json({ 
        message: "Login successful",
        token,
        user: {
          id: foundUser.id,
          username: foundUser.username,
          createdAt: foundUser.createdAt
        }
      })
    } catch (error) {
      console.error('Login error:', error)
      return c.json({ error: "Login failed" }, 500)
    }
  })  

export default auth;
import { app, connectDatabase } from '../server/index.js'

export default async function handler(req, res) {
  try {
    await connectDatabase()
    return app(req, res)
  } catch (error) {
    console.error(error)
    return res.status(503).json({ message: 'Database is unavailable. Please configure MONGODB_URL in Vercel and try again.' })
  }
}
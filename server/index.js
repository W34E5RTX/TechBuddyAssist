/* global process */
import dotenv from 'dotenv'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import mongoose from 'mongoose'
import crypto from 'node:crypto'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const app = express()
const port = process.env.PORT || 5000
const payments = []
app.use(helmet())
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }))
app.use(express.json({ limit: '20kb' }))
app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 100 }))
app.use(express.static(path.join(__dirname, '../dist')))

const validContact = (body) => body.name && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email) && body.phone && body.service && body.message?.length >= 10
const contactSchema = new mongoose.Schema({ name: { type: String, required: true, trim: true, minlength: 2, maxlength: 100 }, email: { type: String, required: true, lowercase: true, trim: true }, phone: { type: String, required: true, trim: true }, service: { type: String, required: true, maxlength: 100 }, message: { type: String, required: true, maxlength: 1000 }, contactPreference: { type: String, enum: ['Email', 'Phone'], default: 'Email' }, status: { type: String, enum: ['New', 'In Progress', 'Resolved'], default: 'New' } }, { timestamps: true })
const Contact = mongoose.model('Contact', contactSchema)
const isDatabaseReady = () => mongoose.connection.readyState === 1

app.get('/api/health', (_req, res) => res.json({ ok: true, database: isDatabaseReady() ? 'connected' : 'unavailable' }))
app.post('/api/contact', async (req, res) => {
  if (!validContact(req.body)) return res.status(400).json({ message: 'Please provide valid contact details and a message of at least 10 characters.' })
  if (!isDatabaseReady()) return res.status(503).json({ message: 'Database is unavailable. Please try again.' })
  try {
    const record = await Contact.create(req.body)
    res.status(201).json({ message: 'Support request received', contact: record })
  } catch (error) {
    res.status(500).json({ message: 'Unable to save support request', error: error.message })
  }
})
app.get('/api/contact', async (_req, res) => { res.json(await Contact.find().sort({ createdAt: -1 })) })
app.get('/api/contact/:id', async (req, res) => { const record = await Contact.findById(req.params.id); if (!record) return res.status(404).json({ message: 'Request not found' }); res.json(record) })
app.patch('/api/contact/:id', async (req, res) => { if (!['New', 'In Progress', 'Resolved'].includes(req.body.status)) return res.status(400).json({ message: 'Invalid status' }); const record = await Contact.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true, runValidators: true }); if (!record) return res.status(404).json({ message: 'Request not found' }); res.json(record) })
app.delete('/api/contact/:id', async (req, res) => { const record = await Contact.findByIdAndDelete(req.params.id); if (!record) return res.status(404).json({ message: 'Request not found' }); res.status(204).end() })
app.post('/api/payments/order', (req, res) => { if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) return res.status(503).json({ message: 'Payment gateway is not configured.' }); res.status(501).json({ message: 'Configure Razorpay order creation in test mode before enabling checkout.' }) })
app.post('/api/payments/verify', (req, res) => { const { orderId, paymentId, signature } = req.body; const expected = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '').update(`${orderId}|${paymentId}`).digest('hex'); if (!signature || signature !== expected) return res.status(400).json({ message: 'Invalid payment signature' }); payments.push({ orderId, paymentId, status: 'paid', createdAt: new Date() }); res.json({ verified: true }) })

app.use((req, res, next) => {
  if (req.path.startsWith('/api')) return next()
  res.sendFile(path.join(__dirname, '../dist/index.html'))
})

const start = async () => { if (!process.env.MONGODB_URL) throw new Error('MONGODB_URL is required to start the API'); await mongoose.connect(process.env.MONGODB_URL, { serverSelectionTimeoutMS: 30000 }); app.listen(port, () => console.log(`TechBuddy Assist API listening on ${port}`)) }
start()

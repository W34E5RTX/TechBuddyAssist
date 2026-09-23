/* global process */
import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import mongoose from 'mongoose'
import crypto from 'node:crypto'

const app = express()
const port = process.env.PORT || 5000
const contacts = []
const payments = []
app.use(helmet())
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }))
app.use(express.json({ limit: '20kb' }))
app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 100 }))

const contactSchema = new mongoose.Schema({ name: { type: String, required: true, trim: true, minlength: 2, maxlength: 100 }, email: { type: String, required: true, lowercase: true, trim: true }, phone: { type: String, required: true, trim: true }, service: { type: String, required: true, maxlength: 100 }, message: { type: String, required: true, maxlength: 1000 }, contactPreference: { type: String, enum: ['Email', 'Phone'], default: 'Email' }, status: { type: String, enum: ['New', 'In Progress', 'Resolved'], default: 'New' } }, { timestamps: true })
const Contact = mongoose.model('Contact', contactSchema)
const isDatabaseReady = () => mongoose.connection.readyState === 1
const validContact = (body) => body.name && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email) && body.phone && body.service && body.message?.length >= 10

app.get('/api/health', (_req, res) => res.json({ ok: true, database: isDatabaseReady() ? 'connected' : 'development-memory' }))
app.post('/api/contact', async (req, res) => {
  if (!validContact(req.body)) return res.status(400).json({ message: 'Please provide valid contact details and a message of at least 10 characters.' })
  try { const record = isDatabaseReady() ? await Contact.create(req.body) : { _id: crypto.randomUUID(), ...req.body, status: 'New', createdAt: new Date() }; if (!isDatabaseReady()) contacts.push(record); res.status(201).json({ message: 'Support request received', contact: record }) } catch (error) { res.status(500).json({ message: 'Unable to save support request', error: error.message }) }
})
app.get('/api/contact', async (_req, res) => { const records = isDatabaseReady() ? await Contact.find().sort({ createdAt: -1 }) : contacts; res.json(records) })
app.get('/api/contact/:id', async (req, res) => { const record = isDatabaseReady() ? await Contact.findById(req.params.id) : contacts.find((item) => item._id === req.params.id); if (!record) return res.status(404).json({ message: 'Request not found' }); res.json(record) })
app.patch('/api/contact/:id', async (req, res) => { if (!['New', 'In Progress', 'Resolved'].includes(req.body.status)) return res.status(400).json({ message: 'Invalid status' }); const record = isDatabaseReady() ? await Contact.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true }) : contacts.find((item) => item._id === req.params.id); if (record && !isDatabaseReady()) record.status = req.body.status; if (!record) return res.status(404).json({ message: 'Request not found' }); res.json(record) })
app.delete('/api/contact/:id', async (req, res) => { if (isDatabaseReady()) await Contact.findByIdAndDelete(req.params.id); else { const index = contacts.findIndex((item) => item._id === req.params.id); if (index >= 0) contacts.splice(index, 1) } res.status(204).end() })
app.post('/api/payments/order', (req, res) => { if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) return res.status(503).json({ message: 'Payment gateway is not configured.' }); res.status(501).json({ message: 'Configure Razorpay order creation in test mode before enabling checkout.' }) })
app.post('/api/payments/verify', (req, res) => { const { orderId, paymentId, signature } = req.body; const expected = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '').update(`${orderId}|${paymentId}`).digest('hex'); if (!signature || signature !== expected) return res.status(400).json({ message: 'Invalid payment signature' }); payments.push({ orderId, paymentId, status: 'paid', createdAt: new Date() }); res.json({ verified: true }) })

const start = async () => { if (process.env.MONGODB_URI) { try { await mongoose.connect(process.env.MONGODB_URI); console.log('MongoDB connected') } catch (error) { console.error('MongoDB unavailable; using development memory store:', error.message) } } app.listen(port, () => console.log(`TechNova Assist API listening on ${port}`)) }
start()

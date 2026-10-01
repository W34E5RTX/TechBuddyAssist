/* global process */
import dotenv from 'dotenv'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import mongoose from 'mongoose'
import { Buffer } from 'node:buffer'
import crypto from 'node:crypto'
import jwt from 'jsonwebtoken'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import Stripe from 'stripe'

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const app = express()
const port = process.env.PORT || 5000
const payments = []
const adminLoginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 10, standardHeaders: 'draft-8', legacyHeaders: false })
const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null
const frontendUrl = process.env.FRONTEND_URL || process.env.CLIENT_URL || 'http://localhost:5173'
const adminSessionSecret = process.env.JWT_SECRET || (process.env.NODE_ENV === 'production' ? '' : crypto.randomBytes(32).toString('hex'))
const defaultSupportPlans = [
  { key: 'quick-support', category: 'QUICK SUPPORT', name: 'Quick support', description: 'A focused answer for a single question.', feature: 'One support conversation', amount: 4900, sortOrder: 1, isActive: true },
  { key: 'remote-assistance', category: 'REMOTE ASSISTANCE', name: 'Remote assistance', description: 'Hands-on help for a supported device.', feature: 'Guided remote session', amount: 9900, sortOrder: 2, isActive: true },
  { key: 'premium-support', category: 'PREMIUM SUPPORT', name: 'Premium support', description: 'A deeper support session for multiple needs.', feature: 'Priority support window', amount: 19900, sortOrder: 3, isActive: true },
]

app.use(helmet())
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }))
app.use('/api/stripe/webhook', express.raw({ type: 'application/json' }))
app.use(express.json({ limit: '20kb' }))
app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 100 }))
app.use(express.static(path.join(__dirname, '../dist')))

const validContact = (body) => body.name && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email) && body.phone && body.service && body.message?.length >= 10
const contactSchema = new mongoose.Schema({ name: { type: String, required: true, trim: true, minlength: 2, maxlength: 100 }, email: { type: String, required: true, lowercase: true, trim: true }, phone: { type: String, required: true, trim: true }, service: { type: String, required: true, maxlength: 100 }, message: { type: String, required: true, maxlength: 1000 }, contactPreference: { type: String, enum: ['Email', 'Phone'], default: 'Email' }, status: { type: String, enum: ['New', 'In Progress', 'Resolved'], default: 'New' } }, { timestamps: true })
const Contact = mongoose.model('Contact', contactSchema)
const supportPlanSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  category: { type: String, required: true, maxlength: 60 },
  name: { type: String, required: true, maxlength: 100 },
  description: { type: String, required: true, maxlength: 300 },
  feature: { type: String, required: true, maxlength: 160 },
  amount: { type: Number, required: true, min: 0, max: 100000000 },
  sortOrder: { type: Number, required: true, default: 0 },
  isActive: { type: Boolean, default: true },
}, { timestamps: true })
const SupportPlan = mongoose.model('SupportPlan', supportPlanSchema)
const customPaymentSchema = new mongoose.Schema({
  customerName: { type: String, required: true, maxlength: 100 },
  customerEmail: { type: String, required: true, lowercase: true, trim: true },
  description: { type: String, required: true, maxlength: 300 },
  amount: { type: Number, required: true, min: 50, max: 100000000 },
  currency: { type: String, default: 'usd', lowercase: true },
  stripeSessionId: { type: String, required: true, unique: true },
  checkoutUrl: { type: String, required: true },
  status: { type: String, enum: ['pending', 'processing', 'paid', 'expired'], default: 'pending' },
  paidAt: Date,
}, { timestamps: true })
const CustomPayment = mongoose.model('CustomPayment', customPaymentSchema)
const isDatabaseReady = () => mongoose.connection.readyState === 1
const ensureSupportPlans = () => SupportPlan.bulkWrite(defaultSupportPlans.map((plan) => ({
  updateOne: { filter: { key: plan.key }, update: { $setOnInsert: plan }, upsert: true },
})))
const missingAdminConfiguration = () => {
  const missing = []
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(process.env.ADMIN_EMAIL?.trim() || '')) missing.push('ADMIN_EMAIL (valid email address)')
  if (process.env.ADMIN_PASSWORD?.length < 12) missing.push('ADMIN_PASSWORD (at least 12 characters)')
  if (!adminSessionSecret || (process.env.NODE_ENV === 'production' &&
      (adminSessionSecret.length < 32 || adminSessionSecret === 'replace-with-a-long-random-secret'))) {
    missing.push('JWT_SECRET (at least 32 random characters)')
  }
  return missing
}
const hasAdminConfiguration = () => missingAdminConfiguration().length === 0

const requireAdmin = (req, res, next) => {
  if (!hasAdminConfiguration()) {
    return res.status(503).json({ message: `Admin is not configured. Set ${missingAdminConfiguration().join(' and ')} in the deployment environment.` })
  }
  const token = req.headers.cookie?.split(';').map((part) => part.trim()).find((part) => part.startsWith('admin_session='))?.slice('admin_session='.length)
  if (!token) return res.status(401).json({ message: 'Admin sign-in required.' })
  try {
    const session = jwt.verify(token, adminSessionSecret)
    if (session.role !== 'admin') return res.status(403).json({ message: 'Admin access required.' })
    next()
  } catch {
    return res.status(401).json({ message: 'Admin session expired. Please sign in again.' })
  }
}

app.get('/api/health', (_req, res) => res.json({ ok: true, database: isDatabaseReady() ? 'connected' : 'unavailable' }))
app.post('/api/admin/login', adminLoginLimiter, (req, res) => {
  const submittedEmail = String(req.body?.email || '').trim().toLowerCase()
  const expectedEmail = String(process.env.ADMIN_EMAIL || '').trim().toLowerCase()
  const configuredPassword = process.env.ADMIN_PASSWORD
  if (!hasAdminConfiguration()) {
    return res.status(503).json({ message: `Admin is not configured. Set ${missingAdminConfiguration().join(' and ')} in the deployment environment.` })
  }
  const submittedPassword = Buffer.from(String(req.body?.password || ''))
  const expectedPassword = Buffer.from(configuredPassword)
  const passwordMatches = submittedPassword.length === expectedPassword.length && crypto.timingSafeEqual(submittedPassword, expectedPassword)
  if (submittedEmail !== expectedEmail || !passwordMatches) {
    return res.status(401).json({ message: 'The admin email or password is incorrect.' })
  }
  const token = jwt.sign({ role: 'admin' }, adminSessionSecret, { expiresIn: '8h' })
  res.cookie('admin_session', token, {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 8 * 60 * 60 * 1000,
    path: '/api',
  })
  res.json({ authenticated: true })
})
app.post('/api/admin/logout', (_req, res) => {
  res.clearCookie('admin_session', { httpOnly: true, sameSite: 'strict', secure: process.env.NODE_ENV === 'production', path: '/api' })
  res.status(204).end()
})
app.get('/api/admin/session', (req, res) => {
  const missing = missingAdminConfiguration()
  if (missing.length) return res.json({ configured: false, authenticated: false, missing })
  const token = req.headers.cookie?.split(';').map((part) => part.trim()).find((part) => part.startsWith('admin_session='))?.slice('admin_session='.length)
  try {
    const session = token ? jwt.verify(token, adminSessionSecret) : null
    res.json({ configured: true, authenticated: session?.role === 'admin' })
  } catch {
    res.json({ configured: true, authenticated: false })
  }
})
app.get('/api/support-plans', async (_req, res) => {
  if (!isDatabaseReady()) return res.status(503).json({ message: 'Support plans are temporarily unavailable.' })
  try {
    await ensureSupportPlans()
    const plans = await SupportPlan.find({ isActive: { $ne: false } }).sort({ sortOrder: 1 }).select('-_id key category name description feature amount').lean()
    res.json({ plans })
  } catch (error) {
    res.status(500).json({ message: 'Unable to load support plans.', error: error.message })
  }
})
app.get('/api/admin/support-plans', requireAdmin, async (_req, res) => {
  if (!isDatabaseReady()) return res.status(503).json({ message: 'Database is unavailable.' })
  try {
    await ensureSupportPlans()
    const plans = await SupportPlan.find().sort({ sortOrder: 1 }).lean()
    res.json({ plans })
  } catch (error) {
    res.status(500).json({ message: 'Unable to load plans.', error: error.message })
  }
})
app.post('/api/admin/support-plans', requireAdmin, async (req, res) => {
  if (!isDatabaseReady()) return res.status(503).json({ message: 'Database is unavailable.' })
  const { category, name, description, feature, amount } = req.body || {}
  if (typeof category !== 'string' || !category.trim() || typeof name !== 'string' || !name.trim() ||
      typeof description !== 'string' || !description.trim() || typeof feature !== 'string' || !feature.trim() ||
      !Number.isInteger(amount) || amount < 0 || amount > 100000000) {
    return res.status(400).json({ message: 'Provide a category, name, description, feature, and a valid amount in cents.' })
  }
  try {
    const latestPlan = await SupportPlan.findOne().sort({ sortOrder: -1 }).select('sortOrder').lean()
    const slug = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'plan'
    const plan = await SupportPlan.create({
      key: `${slug}-${crypto.randomBytes(3).toString('hex')}`,
      category: category.trim(),
      name: name.trim(),
      description: description.trim(),
      feature: feature.trim(),
      amount,
      sortOrder: (latestPlan?.sortOrder || 0) + 1,
      isActive: true,
    })
    res.status(201).json({ plan: plan.toObject() })
  } catch (error) {
    res.status(500).json({ message: 'Unable to add support plan.', error: error.message })
  }
})
app.patch('/api/admin/support-plans/:key', requireAdmin, async (req, res) => {
  if (!isDatabaseReady()) return res.status(503).json({ message: 'Database is unavailable.' })
  const { category, name, description, feature, amount } = req.body || {}
  if (typeof category !== 'string' || !category.trim() || typeof name !== 'string' || !name.trim() ||
      typeof description !== 'string' || !description.trim() || typeof feature !== 'string' || !feature.trim() ||
      !Number.isInteger(amount) || amount < 0 || amount > 100000000) {
    return res.status(400).json({ message: 'Provide a category, name, description, feature, and a valid amount in cents.' })
  }
  try {
    const plan = await SupportPlan.findOneAndUpdate(
      { key: req.params.key },
      { category: category.trim(), name: name.trim(), description: description.trim(), feature: feature.trim(), amount },
      { new: true, runValidators: true },
    ).lean()
    if (!plan) return res.status(404).json({ message: 'Support plan not found.' })
    res.json({ plan })
  } catch (error) {
    res.status(500).json({ message: 'Unable to update support plan.', error: error.message })
  }
})
app.patch('/api/admin/support-plans/:key/status', requireAdmin, async (req, res) => {
  if (!isDatabaseReady()) return res.status(503).json({ message: 'Database is unavailable.' })
  if (typeof req.body?.isActive !== 'boolean') return res.status(400).json({ message: 'Provide isActive as true or false.' })
  try {
    const plan = await SupportPlan.findOneAndUpdate(
      { key: req.params.key },
      { isActive: req.body.isActive },
      { new: true, runValidators: true },
    ).lean()
    if (!plan) return res.status(404).json({ message: 'Support plan not found.' })
    res.json({ plan })
  } catch (error) {
    res.status(500).json({ message: 'Unable to update plan status.', error: error.message })
  }
})
app.get('/api/admin/custom-payments', requireAdmin, async (_req, res) => {
  if (!isDatabaseReady()) return res.status(503).json({ message: 'Database is unavailable.' })
  try {
    const payments = await CustomPayment.find().sort({ createdAt: -1 }).limit(100).lean()
    res.json({ payments })
  } catch (error) {
    res.status(500).json({ message: 'Unable to load custom payments.', error: error.message })
  }
})
app.post('/api/admin/custom-payments', requireAdmin, async (req, res) => {
  if (!stripe) return res.status(503).json({ message: 'Stripe is not configured.' })
  if (!isDatabaseReady()) return res.status(503).json({ message: 'Database is unavailable.' })
  const { customerName, customerEmail, description, amount } = req.body || {}
  if (typeof customerName !== 'string' || !customerName.trim() || customerName.length > 100 ||
      typeof customerEmail !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail) ||
      typeof description !== 'string' || !description.trim() || description.length > 300 ||
      !Number.isInteger(amount) || amount < 50 || amount > 100000000) {
    return res.status(400).json({ message: 'Provide a customer name, valid email, description, and USD amount of at least $0.50.' })
  }

  let session
  try {
    const paymentReference = crypto.randomUUID()
    session = await stripe.checkout.sessions.create({
      mode: 'payment',
      managed_payments: { enabled: false },
      customer_email: customerEmail.trim().toLowerCase(),
      line_items: [{
        price_data: {
          currency: 'usd',
          unit_amount: amount,
          product_data: {
            name: description.trim(),
            description: `Custom support payment for ${customerName.trim()}`,
          },
        },
        quantity: 1,
      }],
      success_url: `${frontendUrl}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontendUrl}/billing/cancel`,
      metadata: { paymentReference, source: 'techbuddyassist-admin' },
    })
    const payment = await CustomPayment.create({
      customerName: customerName.trim(),
      customerEmail: customerEmail.trim().toLowerCase(),
      description: description.trim(),
      amount,
      stripeSessionId: session.id,
      checkoutUrl: session.url,
      status: 'pending',
    })
    res.status(201).json({ payment })
  } catch (error) {
    if (session?.id) await stripe.checkout.sessions.expire(session.id).catch(() => undefined)
    res.status(500).json({ message: 'Unable to create custom payment.', error: error.message })
  }
})
app.post('/api/contact', async (req, res) => {
  if (!validContact(req.body)) return res.status(400).json({ message: 'Please provide valid contact details and a message of at least 10 characters.' })
  if (!isDatabaseReady()) return res.status(503).json({ message: 'Database is unavailable. Please try again.' })
  try {
    const record = await Contact.create(req.body)
    res.status(201).json({ message: 'Support request received', contact: record })
  } catch (error) {
    res.status(500).json({ message: 'Unable to save support request data', error: error.message })
  }
})
app.get('/api/contact', requireAdmin, async (_req, res) => { res.json(await Contact.find().sort({ createdAt: -1 }).limit(200)) })
app.get('/api/contact/:id', requireAdmin, async (req, res) => { const record = await Contact.findById(req.params.id); if (!record) return res.status(404).json({ message: 'Request not found' }); res.json(record) })
app.patch('/api/contact/:id', requireAdmin, async (req, res) => { if (!['New', 'In Progress', 'Resolved'].includes(req.body.status)) return res.status(400).json({ message: 'Invalid status' }); const record = await Contact.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true, runValidators: true }); if (!record) return res.status(404).json({ message: 'Request not found' }); res.json(record) })
app.delete('/api/contact/:id', requireAdmin, async (req, res) => { const record = await Contact.findByIdAndDelete(req.params.id); if (!record) return res.status(404).json({ message: 'Request not found' }); res.status(204).end() })
app.get('/api/stripe/config', (_req, res) => { res.json({ publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || '' }) })
app.post('/api/stripe/webhook', async (req, res) => {
  if (!stripe || !process.env.STRIPE_WEBHOOK_SECRET) return res.status(501).json({ message: 'Stripe webhook is not configured.' })
  const sig = req.headers['stripe-signature']
  let event
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (error) {
    return res.status(400).send(`Webhook Error: ${error.message}`)
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object
    payments.push({ status: 'paid', sessionId: session.id, amount: session.amount_total, metadata: session.metadata, createdAt: new Date() })
    await CustomPayment.findOneAndUpdate(
      { stripeSessionId: session.id },
      { status: session.payment_status === 'paid' ? 'paid' : 'processing', paidAt: session.payment_status === 'paid' ? new Date() : undefined },
    ).catch((error) => console.error(`Unable to update custom payment status: ${error.message}`))
  }

  if (event.type === 'checkout.session.expired') {
    await CustomPayment.findOneAndUpdate({ stripeSessionId: event.data.object.id }, { status: 'expired' })
      .catch((error) => console.error(`Unable to mark custom payment expired: ${error.message}`))
  }

  if (event.type === 'customer.subscription.updated' || event.type === 'customer.subscription.deleted' || event.type === 'invoice.paid') {
    const object = event.data.object
    payments.push({ status: 'processed', eventType: event.type, objectId: object.id, createdAt: new Date() })
  }

  res.json({ received: true })
})
app.post('/api/payments/order', (req, res) => { if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) return res.status(503).json({ message: 'Payment gateway is not configured.' }); res.status(501).json({ message: 'Configure Razorpay order creation in test mode before enabling checkout.' }) })
app.post('/api/payments/verify', (req, res) => { const { orderId, paymentId, signature } = req.body; const expected = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '').update(`${orderId}|${paymentId}`).digest('hex'); if (!signature || signature !== expected) return res.status(400).json({ message: 'Invalid payment signature' }); payments.push({ orderId, paymentId, status: 'paid', createdAt: new Date() }); res.json({ verified: true }) })

app.use((req, res, next) => {
  if (req.path.startsWith('/api')) return next()
  res.sendFile(path.join(__dirname, '../dist/index.html'))
})

export const connectDatabase = async () => {
  if (!process.env.MONGODB_URL) throw new Error('MONGODB_URL is required to start the API')
  if (!isDatabaseReady()) await mongoose.connect(process.env.MONGODB_URL, { serverSelectionTimeoutMS: 30000 })
}

const start = () => {
  app.listen(port, () => console.log(`Techbuddyassist API listening on ${port}`))
  connectDatabase().catch((error) => console.error(`Database unavailable; API is running without database-backed features: ${error.message}`))
}
if (!process.env.VERCEL) start()

export { app }

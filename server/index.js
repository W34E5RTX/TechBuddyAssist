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
import Stripe from 'stripe'

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const app = express()
const port = process.env.PORT || 5000
const payments = []
const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null
const frontendUrl = process.env.FRONTEND_URL || process.env.CLIENT_URL || 'http://localhost:5173'
const stripeCatalog = [
  {
    key: 'support-session',
    name: 'Techbuddyassist Support Session',
    description: 'One-time guided troubleshooting and remote tech help.',
    amount: 14900,
    type: 'payment',
    currency: 'usd',
  },
  {
    key: 'essential-plan',
    name: 'Essential Support Plan',
    description: 'Monthly tech support plan with priority response and ongoing guidance.',
    amount: 4900,
    type: 'subscription',
    currency: 'usd',
    interval: 'month',
  },
  {
    key: 'pro-plan',
    name: 'Pro Support Plan',
    description: 'Priority monthly support for homes, offices, and growing businesses.',
    amount: 9900,
    type: 'subscription',
    currency: 'usd',
    interval: 'month',
  },
  {
    key: 'business-plan',
    name: 'Business IT Support',
    description: 'Ongoing monthly IT support for business systems and device setup.',
    amount: 14900,
    type: 'subscription',
    currency: 'usd',
    interval: 'month',
  },
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
const isDatabaseReady = () => mongoose.connection.readyState === 1

app.get('/api/health', (_req, res) => res.json({ ok: true, database: isDatabaseReady() ? 'connected' : 'unavailable' }))
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
app.get('/api/contact', async (_req, res) => { res.json(await Contact.find().sort({ createdAt: -1 })) })
app.get('/api/contact/:id', async (req, res) => { const record = await Contact.findById(req.params.id); if (!record) return res.status(404).json({ message: 'Request not found' }); res.json(record) })
app.patch('/api/contact/:id', async (req, res) => { if (!['New', 'In Progress', 'Resolved'].includes(req.body.status)) return res.status(400).json({ message: 'Invalid status' }); const record = await Contact.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true, runValidators: true }); if (!record) return res.status(404).json({ message: 'Request not found' }); res.json(record) })
app.delete('/api/contact/:id', async (req, res) => { const record = await Contact.findByIdAndDelete(req.params.id); if (!record) return res.status(404).json({ message: 'Request not found' }); res.status(204).end() })
app.get('/api/stripe/config', (_req, res) => { res.json({ publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || '' }) })
app.get('/api/stripe/products', (_req, res) => { res.json({ products: stripeCatalog }) })
app.post('/api/stripe/create-checkout-session', async (req, res) => {
  if (!stripe) return res.status(503).json({ message: 'Stripe is not configured. Add STRIPE_SECRET_KEY first.' })

  const { productKey = 'support-session', email } = req.body || {}
  const selectedProduct = stripeCatalog.find((product) => product.key === productKey) || stripeCatalog[0]

  try {
    const session = await stripe.checkout.sessions.create({
      mode: selectedProduct.type === 'subscription' ? 'subscription' : 'payment',
      managed_payments: { enabled: false },
      customer_email: email || undefined,
      line_items: [{
        price_data: selectedProduct.type === 'subscription'
          ? {
              currency: selectedProduct.currency,
              recurring: { interval: selectedProduct.interval || 'month' },
              unit_amount: Number(selectedProduct.amount) || 0,
              product_data: {
                name: selectedProduct.name,
                description: selectedProduct.description,
              },
            }
          : {
              currency: selectedProduct.currency,
              product_data: {
                name: selectedProduct.name,
                description: selectedProduct.description,
              },
              unit_amount: Number(selectedProduct.amount) || 0,
            },
        quantity: 1,
      }],
      success_url: `${frontendUrl}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontendUrl}/billing/cancel`,
      metadata: { productKey: selectedProduct.key, source: 'techbuddyassist', email: email || '' },
      invoice_creation: selectedProduct.type === 'payment' ? { enabled: true } : undefined,
    })
    res.json({ url: session.url, sessionId: session.id, product: selectedProduct })
  } catch (error) {
    res.status(500).json({ message: 'Unable to create Stripe checkout session.', error: error.message })
  }
})
app.post('/api/stripe/customer-portal', async (req, res) => {
  if (!stripe) return res.status(503).json({ message: 'Stripe is not configured. Add STRIPE_SECRET_KEY first.' })
  const { email } = req.body || {}
  try {
    const customer = email ? await stripe.customers.create({ email }).catch(() => null) : null
    const portal = await stripe.billingPortal.sessions.create({
      customer: customer?.id || undefined,
      return_url: `${frontendUrl}/billing`,
    })
    res.json({ url: portal.url })
  } catch (error) {
    res.status(500).json({ message: 'Unable to create Stripe billing portal session.', error: error.message })
  }
})
app.post('/api/stripe/invoice', async (req, res) => {
  if (!stripe) return res.status(503).json({ message: 'Stripe is not configured. Add STRIPE_SECRET_KEY first.' })
  const { customerEmail = 'support@techbuddyassist.com', amount = 14900, description = 'Techbuddyassist support invoice' } = req.body || {}
  try {
    const customer = await stripe.customers.create({ email: customerEmail }).catch(() => null)
    const invoice = await stripe.invoices.create({
      customer: customer?.id || undefined,
      collection_method: 'send_invoice',
      days_until_due: 14,
      currency: 'usd',
      description,
      auto_advance: false,
      metadata: { source: 'techbuddyassist' },
    })
    const invoiceItem = await stripe.invoiceItems.create({
      customer: customer?.id || undefined,
      amount: Number(amount) || 14900,
      currency: 'usd',
      description,
      invoice: invoice.id,
    })
    res.json({ invoiceId: invoice.id, invoiceItemId: invoiceItem.id, customerId: customer?.id || null })
  } catch (error) {
    res.status(500).json({ message: 'Unable to create Stripe invoice.', error: error.message })
  }
})
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

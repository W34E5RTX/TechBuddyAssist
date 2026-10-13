import { useEffect, useState } from 'react'
import { BrowserRouter, Link, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, BadgeCheck, Check, ChevronDown, CircleHelp, Clock3, Cloud, Cpu, Headphones, Laptop, Menu, MessageCircle, Network, Phone, ShieldCheck, Smartphone, Sparkles, TabletSmartphone, Wifi, X } from 'lucide-react'
import './App.css'

const services = [
  ['Computer & Laptop', 'Help with common computer issues, settings, software, and everyday technology problems on desktop and laptop systems.', Laptop],
  ['Wi-Fi & Internet', 'Help understanding and troubleshooting common home or small-office connectivity issues, including routers and signal problems.', Wifi],
  ['Smartphone & Tablet', 'Help with everyday smartphone and tablet setup, settings, applications, syncing, and common issues..', Smartphone],
  ['Software Support', 'Assistance installing, configuring, and troubleshooting supported software, including updates and compatibility questions.', Cloud],
  ['Security Assistance', 'Calm guidance for suspicious popups, warnings, and malware concerns.', ShieldCheck],
  ['Device Setup', 'Printers, monitors, cameras, accessories, and new device configuration.', Cpu],
  ['Remote Technical Support', 'Professional assistance without a trip to a service center.', Headphones],
  ['Business IT Support', 'Practical technology help for small teams and growing businesses.', Network],
]

const faqs = [
  ['What types of technology problems do you support?', 'We help with everyday computers, phones, Wi-Fi, software, suspicious messages, device setup, and small-business technology needs.'],
  ['Do you provide remote support?', 'Yes. When remote help is appropriate, we explain each step first and keep you in control throughout the session.'],
  ['Can you help with Wi-Fi problems?', 'We can help troubleshoot routers, connection drops, slow speeds, and common home or small-office network issues.'],
  ['Can you help seniors?', 'Absolutely. Our approach is patient, respectful, and step-by-step, with plain language instead of technical jargon.'],
  ['Do you support smartphones?', 'Yes. We assist with iPhone and Android setup, apps, accounts, settings, and common issues.'],
  ['Can you help small businesses?', 'Yes. We support device setup, email, Wi-Fi, software configuration, basic security, and remote troubleshooting.'],
  ['How does remote support work?', 'Start with the form below. We review what is happening, explain the next step, and schedule remote assistance when suitable.'],
  ['How much does support cost?', 'Contact us for a tailored quote. We explain the scope clearly before any work begins.'],
  ['Is my information secure?', 'We treat your details as confidential and only use them to respond to your support request.'],
  ['How can I contact support?', 'Use the support form or call the number in the footer. Your request will be saved securely in our Neon database.'],
]

const fadeUp = { hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6 } } }
const defaultSupportPlans = [
  { key: 'quick-support', category: 'QUICK SUPPORT', name: 'Quick support', description: 'A focused answer for a single question.', feature: 'One support conversation', amount: 4900 },
  { key: 'remote-assistance', category: 'REMOTE ASSISTANCE', name: 'Remote assistance', description: 'Hands-on help for a supported device.', feature: 'Guided remote session', amount: 9900 },
  { key: 'premium-support', category: 'PREMIUM SUPPORT', name: 'Premium support', description: 'A deeper support session for multiple needs.', feature: 'Priority support window', amount: 19900 },
]

function ActionButton({ label = 'Get Support', onClick, variant = 'primary' }) {
  return (
    <button className={variant === 'outline' ? 'outline-button' : 'button'} onClick={onClick}>
      {label} <ArrowRight size={17} />
    </button>
  )
}

function LogoWordmark({ compact = false }) {
  return (
    <span className={`brand-wordmark ${compact ? 'brand-wordmark-compact' : ''}`} aria-label="Techbuddyassist">
      <span className="brand-tech">Tech</span>
      <span className="brand-buddy">Buddy</span>
      <span className="brand-assist">Assist</span>
    </span>
  )
}

function Nav({ menuOpen, setMenuOpen }) {
  const { pathname } = useLocation()
  const closeMenu = () => setMenuOpen(false)

  return (
    <header className="nav-wrap">
      <nav className="nav container" aria-label="Main navigation">
        <Link className="brand" to="/" onClick={closeMenu} aria-label="Techbuddyassist home">
          <LogoWordmark />
        </Link>
        <button className="menu-toggle" aria-label="Toggle navigation" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X /> : <Menu />}
        </button>
        <div className={`nav-links ${menuOpen ? 'is-open' : ''}`}>
          <Link to="/" onClick={closeMenu} aria-current={pathname === '/' ? 'page' : undefined}>Home</Link>
          <Link to="/services" onClick={closeMenu} aria-current={pathname === '/services' ? 'page' : undefined}>Services</Link>
          <Link to="/how-it-works" onClick={closeMenu} aria-current={pathname === '/how-it-works' ? 'page' : undefined}>How It Works</Link>
          <Link to="/about" onClick={closeMenu} aria-current={pathname === '/about' ? 'page' : undefined}>About</Link>
          <Link to="/faq" onClick={closeMenu} aria-current={pathname === '/faq' ? 'page' : undefined}>FAQ</Link>
          <Link to="/contact" onClick={closeMenu} aria-current={pathname === '/contact' ? 'page' : undefined}>Contact</Link>
          <Link to="/billing" onClick={closeMenu} aria-current={pathname === '/billing' ? 'page' : undefined}>Payment</Link>
          <Link className="button button-small" to="/contact" onClick={closeMenu}>
            Get Support <ArrowRight size={15} />
          </Link>
        </div>
      </nav>
    </header>
  )
}

function FooterLinkGroup({ title, links }) {
  return (
    <div>
      <span className="footer-label">{title}</span>
      {links.map((link) => (
        <Link key={link.label} to={link.href}>{link.label}</Link>
      ))}
    </div>
  )
}

function BillingPage() {
  const [plans, setPlans] = useState(defaultSupportPlans)
  const [pendingPlanKey, setPendingPlanKey] = useState('')
  const [checkoutError, setCheckoutError] = useState('')

  useEffect(() => {
    fetch('/api/support-plans')
      .then((response) => response.json())
      .then((data) => {
        if (Array.isArray(data.plans) && data.plans.length) setPlans(data.plans)
      })
      .catch(() => undefined)
  }, [])

  const startCheckout = async (planKey) => {
    setPendingPlanKey(planKey)
    setCheckoutError('')
    try {
      const response = await fetch('/api/checkout/support-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planKey }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.message || 'Unable to start checkout. Please try again.')
      if (!data.checkoutUrl) throw new Error('Checkout link was not returned. Please try again.')
      window.location.assign(data.checkoutUrl)
    } catch (error) {
      setCheckoutError(error.message || 'Unable to start checkout. Please try again.')
      setPendingPlanKey('')
    }
  }

  return (
    <section id="billing" className="section billing-section">
      <div className="container">
        <div className="section-heading billing-heading">
          <span className="eyebrow">Support options</span>
          <h2>Choose your <em>support plan.</em></h2>
          <p>Choose a plan to continue to secure payment.</p>
        </div>
        {checkoutError && <p className="error-message" role="alert">{checkoutError}</p>}
        <div className="pricing-grid">
          {plans.map((plan, index) => {
            const isFeatured = index === 1
            return (
            <article className={`pricing-card${isFeatured ? ' is-featured' : ''}`} key={plan.key}>
              {isFeatured && <span className="pricing-popular">Most requested</span>}
              <span className="pricing-tag">{plan.category}</span>
              <h3>{plan.name}</h3>
              <div className="price-line">
                <strong>{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(plan.amount / 100)}</strong>
                <span>one-time</span>
              </div>
              <p>{plan.description}</p>
              <div className="pricing-feature"><Check size={17} /><span>{plan.feature}</span></div>
              <button className={`plan-button ${isFeatured ? 'button' : 'outline-button'}`} type="button" onClick={() => startCheckout(plan.key)} disabled={Boolean(pendingPlanKey)}>
                {pendingPlanKey === plan.key ? 'Opening checkout…' : 'Pay now'} <ArrowRight size={17} />
              </button>
            </article>
            )
          })}
        </div>
        <div className="quote-process">
          <span className="eyebrow">More involved support?</span>
          <p>Contact us for a tailored quote. After we agree on the work and final price, we’ll send a secure Stripe invoice.</p>
        </div>
      </div>
    </section>
  )
}

function Footer() {
  const navigationLinks = [
    { label: 'Home', href: '/' },
    { label: 'Services', href: '/services' },
    { label: 'How It Works', href: '/how-it-works' },
    { label: 'About Us', href: '/about' },
    { label: 'FAQ', href: '/faq' },
    { label: 'Contact Us', href: '/contact' },
    { label: 'Payment', href: '/billing' },
  ]

  const serviceLinks = [
    { label: 'Computer Support', href: '/services' },
    { label: 'Windows & Mac', href: '/services' },
    { label: 'Smartphone & Tablet', href: '/services' },
    { label: 'Wi-Fi & Network', href: '/services' },
    { label: 'Remote Support', href: '/services' },
    { label: 'Small Business IT', href: '/services' },
  ]

  const legalLinks = [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/contact' },
    { label: 'Refund Policy', href: '/contact' },
  ]

  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div>
          <Link className="brand footer-brand" to="/">
            <LogoWordmark compact />
          </Link>
          <p>Simple, reliable technology support for real life.</p>
          <address className="footer-contact">
            1901 N. Roselle Rd, Suite 800<br />
            Schaumburg, Illinois 60195<br />
            <a href="tel:+17082311796"><Phone size={14} /> +1 (708) 231-1796</a>
          </address>
        </div>
        <FooterLinkGroup title="Navigation" links={navigationLinks} />
        <FooterLinkGroup title="Services" links={serviceLinks} />
        <FooterLinkGroup title="Legal" links={legalLinks} />
      </div>
      <div className="container footer-bottom">
        <span>© 2026 Techbuddyassist.</span>
        <span>US-based technology support provider.</span>
      </div>
    </footer>
  )
}

function LandingPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const [openFaq, setOpenFaq] = useState(null)
  const [activeTestimonial, setActiveTestimonial] = useState(0)
  const [formState, setFormState] = useState('idle')
  const [formError, setFormError] = useState('')
  const testimonials = [
    ['“The technician explained everything clearly and never made me feel silly for asking questions.”', 'Demo Customer', 'Home technology support'],
    ['“I finally understood what was happening with my Wi-Fi. The next steps were simple and calm.”', 'Demo Customer', 'Connectivity support'],
    ['“A thoughtful, patient experience from the first message to the final fix.”', 'Demo Customer', 'Device setup support'],
  ]

  const scrollTo = (id) => {
    const routes = {
      home: '/',
      services: '/services',
      'how-it-works': '/how-it-works',
      about: '/about',
      faq: '/faq',
      contact: '/contact',
      business: '/services',
      billing: '/billing',
    }
    const targetRoute = routes[id]
    if (location.pathname !== '/' && targetRoute && location.pathname !== targetRoute) {
      navigate(targetRoute)
      return
    }
    if (id === 'home' && location.pathname !== '/') {
      navigate('/')
      return
    }
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    setMenuOpen(false)
  }

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [location.pathname])

  const submitForm = async (event) => {
    event.preventDefault(); setFormState('loading'); setFormError('')
    const formElement = event.currentTarget
    const form = new FormData(formElement)
    const requestBody = JSON.stringify(Object.fromEntries(form.entries()))
    try {
      let response
      for (let attempt = 1; attempt <= 2; attempt += 1) {
        try {
          response = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: requestBody })
          if (response.ok || attempt === 2) break
        } catch (error) {
          if (attempt === 2) throw error
        }
        await new Promise((resolve) => setTimeout(resolve, 800))
      }
      const contentType = response.headers.get('content-type') || ''
      const result = contentType.includes('application/json') ? await response.json().catch(() => ({})) : {}
      if (!contentType.includes('application/json')) throw new Error('The support API is not available on this deployment. Please redeploy the API and configure MONGODB_URL.')
      if (!response.ok || !result.contact?._id) throw new Error(result.message || 'The support API could not save your request. Check that the API is running and MongoDB is connected.')
      setFormState('success'); formElement.reset()
    } catch (error) {
      setFormState('error'); setFormError(error.message || 'We could not save your request right now. Please try submitting again.')
    }
  }

  const pageClass = {
    '/services': 'page-services',
    '/how-it-works': 'page-how-it-works',
    '/about': 'page-about',
    '/faq': 'page-faq',
    '/contact': 'page-contact',
  }[location.pathname] || ''

  return (
    <div className={`site-shell ${pageClass}`}>
      <div className="announcement"><span>New</span> Patient, professional technology support is one message away. <button onClick={() => scrollTo('contact')}>Get help today <ArrowRight size={14} /></button></div>
      <Nav menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
      <main>
        <section id="home" className="hero">
          <div className="hero-glow" />
          <div className="container hero-grid">
            <motion.div initial="hidden" animate="visible" variants={fadeUp} className="hero-copy">
              <div className="eyebrow"><span className="eyebrow-dot" /> Trusted technology support</div>
              <h1>Technology problems shouldn’t <em>slow you down.</em></h1>
              <p className="hero-lede">Techbuddyassist helps individuals, families, seniors, professionals, home offices, and small businesses understand, manage, and resolve technology problems with clear, patient, professional assistance. No jargon. No scare tactics. Just real help from real people who know technology.</p>
              <div className="hero-actions">
                <ActionButton label="Get Support" onClick={() => scrollTo('contact')} />
                <button className="outline-button" onClick={() => navigate('/billing')}>
                  View support options <ArrowRight size={17} />
                </button>
              </div>
              <div className="hero-note">
                <div className="avatar-stack"><span>JM</span><span>RK</span><span>+</span></div>
                <span><b>Real people. Clear answers.</b><br />Support that meets you where you are.</span>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, scale: .95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: .8 }} className="hero-visual">
              <div className="visual-frame">
                <div className="visual-top"><span><i /> live support desk</span><span>09:41</span></div>
                <div className="screen-content">
                  <div className="screen-orb"><Wifi size={42} /></div>
                  <p className="screen-kicker">Connection check</p>
                  <h2>Your devices, back in sync.</h2>
                  <div className="signal-bars"><i /><i /><i /><i /><i /></div>
                  <div className="screen-status"><span className="status-dot" /> Everything looks steady <BadgeCheck size={15} /></div>
                </div>
                <div className="visual-bottom"><span><Headphones size={15} /> Technician connected</span><span className="secure"><ShieldCheck size={14} /> Secure session</span></div>
              </div>
              <motion.div animate={{ y: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 4 }} className="float-card float-one">
                <span className="float-icon blue"><MessageCircle size={17} /></span>
                <span><b>Human help</b><small>Always in your corner</small></span>
              </motion.div>
              <motion.div animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 4 }} className="float-card float-two">
                <span className="float-icon amber"><Check size={16} /></span>
                <span><b>Fast answers</b><small>Clear next steps</small></span>
              </motion.div>
            </motion.div>
          </div>
        </section>

        <section className="trust-strip">
          <div className="container trust-grid">
            <div className="trust-intro"><span className="eyebrow">Our approach</span><h2>Technology support<br /><em>you can understand.</em></h2></div>
            {[['Human assistance', Headphones], ['Simple explanations', MessageCircle], ['Secure support', ShieldCheck], ['Transparent pricing', BadgeCheck]].map(([label, Icon]) => (
              <div className="trust-item" key={label}><Icon size={21} /><span>{label}</span></div>
            ))}
          </div>
        </section>

        <section id="services" className="section light">
          <div className="container">
            <div className="section-heading">
              <div><span className="eyebrow">What we help with</span><h2>Support for the technology<br /><em>you use every day.</em></h2></div>
              <p>From everyday laptops and phones to Wi‑Fi, software, setup, and remote troubleshooting, we make technology feel manageable again.</p>
            </div>
            <div className="service-grid">
              {services.map(([title, description, Icon], index) => (
                <motion.article whileHover={{ y: -5 }} className="service-card" key={title}>
                  <div className="service-icon"><Icon size={21} /></div>
                  <span className="service-number">0{index + 1}</span>
                  <h3>{title}</h3>
                  <p>{description}</p>
                  <button className="link-button" onClick={() => scrollTo('contact')}>Learn more <ArrowRight size={15} /></button>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        <section id="about" className="section cream">
          <div className="container audience-grid">
            <div className="audience-copy">
              <span className="eyebrow">Who we help</span>
              <h2>Technology help for <em>real life.</em></h2>
              <p>Different devices. Different comfort levels. The same respectful, practical support for everyone.</p>
              <ActionButton label="Tell us what’s happening" onClick={() => scrollTo('contact')} />
            </div>
            <div className="audience-list">
              {[['Individuals & families', 'Everyday device questions, software, connectivity, and home technology.', TabletSmartphone], ['Seniors', 'Patient guidance that never rushes or talks down.', CircleHelp], ['Professionals & home offices', 'Reliable setups and practical support for productive work.', Laptop], ['Small businesses', 'Technology assistance for teams that need systems to work.', Network]].map(([title, description, Icon], index) => (
                <div className="audience-card" key={title}>
                  <div className="audience-index">0{index + 1}</div>
                  <Icon size={25} />
                  <div>
                    <h3>{title}</h3>
                    <p>{description}</p>
                  </div>
                  <ArrowRight size={18} />
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section problem-section">
          <div className="container problem-grid">
            <div>
              <span className="eyebrow">When something doesn’t look right</span>
              <h2>Don’t panic.<br /><em>Let’s figure it out.</em></h2>
              <p>Confusing messages and unexpected behavior deserve a calm, knowledgeable response, not pressure or fear.</p>
              <ActionButton label="Tell us your problem" onClick={() => scrollTo('contact')} />
            </div>
            <div className="problem-panel">
              <div className="panel-label"><span className="status-dot" /> Common situations we help untangle</div>
              {['Computer running slowly', 'Internet not working', 'Printer won’t print', 'Suspicious popups', 'Software not installing', 'Phone setup problems', 'Email or account trouble', 'Device configuration'].map((problem) => (
                <div className="problem-row" key={problem}><Check size={16} />{problem}<ArrowRight size={14} /></div>
              ))}
            </div>
          </div>
        </section>

        <section id="how-it-works" className="section light">
          <div className="container">
            <div className="center-heading">
              <span className="eyebrow">How it works</span>
              <h2>Getting help is <em>simple.</em></h2>
              <p>No technical hoops. Describe what’s happening in your own words and we’ll guide you from there.</p>
            </div>
            <div className="steps-grid">
              {[['01', 'Tell us what’s wrong', 'Use the form below to describe the issue in plain language. You don’t need to know the technical term.'], ['02', 'We diagnose the problem', 'We ask the right questions, identify the likely cause, and explain it clearly.'], ['03', 'Get the help you need', 'Receive step-by-step guidance or remote support when it is the right fit.']].map(([number, title, description]) => (
                <div className="step" key={number}>
                  <span className="step-number">{number}</span>
                  <div className="step-line" />
                  <h3>{title}</h3>
                  <p>{description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section navy-section">
          <div className="container why-grid">
            <div>
              <span className="eyebrow light-eyebrow">Why Techbuddyassist</span>
              <h2>Support built around <em>people.</em></h2>
              <p>Professional expertise matters. So does how it feels to ask for help. We bring both together in every conversation.</p>
              <div className="feature-list">
                {['Friendly human support', 'Easy-to-understand explanations', 'Transparent pricing', 'Security-conscious guidance', 'No complicated technical language', 'Professional service'].map((feature) => (
                  <span key={feature}><Check size={15} />{feature}</span>
                ))}
              </div>
            </div>
            <div className="stat-board">
              <div className="stat-card"><strong>500<span>+</span></strong><small>Support requests configured</small></div>
              <div className="stat-card accent-stat"><strong>4.9<span>/5</span></strong><small>Customer satisfaction focus</small></div>
              <div className="stat-card"><strong>24<span>/7</span></strong><small>Responsive support mindset</small></div>
            </div>
          </div>
        </section>

        <section className="section split-section">
          <div className="container split-grid">
            <div className="remote-art">
              <div className="art-screen">
                <div className="art-screen-head"><span /> <span /> <span /></div>
                <div className="art-person"><div className="person-head" /><div className="person-body" /><div className="person-laptop" /></div>
                <div className="art-message"><MessageCircle size={17} /><span>We’re here to help.</span></div>
              </div>
              <div className="art-ring" />
            </div>
            <div className="split-copy">
              <span className="eyebrow">Remote support</span>
              <h2>Get help without <em>leaving home.</em></h2>
              <p>When a hands-on look is useful, our remote support makes it simple to connect with a technician securely from wherever you are.</p>
              <div className="check-copy"><span><ShieldCheck size={17} /> Secure and permission-based</span><span><Headphones size={17} /> A real person on the other end</span><span><Sparkles size={17} /> Clear guidance as we go</span></div>
              <ActionButton label="Request remote support" onClick={() => scrollTo('contact')} />
            </div>
          </div>
        </section>

        <section className="section senior-section">
          <div className="container senior-grid">
            <div>
              <span className="eyebrow">Senior-friendly support</span>
              <h2>Technology help that <em>makes sense.</em></h2>
              <p>Patient explanations. Step-by-step guidance. No confusing terminology. We give you the time and clarity to feel comfortable with your technology.</p>
              <div className="pill-list"><span>Patient explanations</span><span>Plain language</span><span>Device setup</span><span>At your pace</span></div>
              <ActionButton label="Get patient help" onClick={() => scrollTo('contact')} />
            </div>
            <div className="senior-quote">
              <div className="quote-mark">“</div>
              <p>Good support should leave you feeling more confident, not more confused.</p>
              <span>Techbuddyassist approach</span>
            </div>
          </div>
        </section>

        <section id="business" className="section business-section">
          <div className="container business-grid">
            <div>
              <span className="eyebrow">Business IT support</span>
              <h2>Keep your team <em>moving.</em></h2>
              <p>Practical technology assistance for small businesses that need dependable systems without a complicated IT department.</p>
              <ActionButton label="Talk to business support" onClick={() => scrollTo('contact')} />
            </div>
            <div className="business-services">
              {['Computer and employee setup', 'Email and workspace support', 'Wi-Fi and network help', 'Software configuration', 'Basic security assistance', 'Remote troubleshooting'].map((item) => (
                <span key={item}><Check size={16} />{item}</span>
              ))}
            </div>
          </div>
        </section>

        <section className="section light testimonial-section">
          <div className="container">
            <div className="section-heading">
              <div><span className="eyebrow">Customer notes</span><h2>A better kind of <em>support.</em></h2></div>
            </div>
            <div className="testimonial-card">
              <div className="quote-mark">“</div>
              <div>
                <p>{testimonials[activeTestimonial][0]}</p>
                <div className="testimonial-meta"><b>{testimonials[activeTestimonial][1]}</b><span>{testimonials[activeTestimonial][2]}</span></div>
              </div>
              <div className="carousel-controls">
                <button aria-label="Previous testimonial" onClick={() => setActiveTestimonial((activeTestimonial + testimonials.length - 1) % testimonials.length)}>←</button>
                <span>0{activeTestimonial + 1} / 0{testimonials.length}</span>
                <button aria-label="Next testimonial" onClick={() => setActiveTestimonial((activeTestimonial + 1) % testimonials.length)}>→</button>
              </div>
            </div>
          </div>
        </section>

        {location.pathname === '/' && <BillingPage />}

        <section id="faq" className="section faq-section">
          <div className="container faq-grid">
            <div>
              <span className="eyebrow">Questions, answered</span>
              <h2>Good to know.</h2>
              <p>Honest, straightforward answers before you reach out.</p>
              <button className="text-button" onClick={() => scrollTo('contact')}>Still have a question? <ArrowRight size={16} /></button>
            </div>
            <div className="faq-list">
              {faqs.map(([question, answer], index) => (
                <div className={`faq-item ${openFaq === index ? 'open' : ''}`} key={question}>
                  <button onClick={() => setOpenFaq(openFaq === index ? null : index)} aria-expanded={openFaq === index}>
                    <span>{question}</span>
                    <ChevronDown size={18} />
                  </button>
                  <AnimatePresence>
                    {openFaq === index && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="faq-answer">
                        <p>{answer}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="contact" className="contact-section">
          <div className="container contact-grid">
            <div className="contact-copy">
              <span className="eyebrow">Get help today</span>
              <h2>Tell us what’s <em>going on.</em></h2>
              <p>Describe your technology issue and we’ll follow up with clear next steps. No scripts. No pressure. Just helpful guidance from people who understand technology.</p>
              <div className="contact-points">
                <span><MessageCircle size={17} /> Patient, knowledgeable guidance</span>
                <span><Clock3 size={17} /> A clear response process</span>
                <span><ShieldCheck size={17} /> Your information handled with care</span>
                <a href="tel:+17082311796"><Phone size={17} /> +1 (708) 231-1796</a>
              </div>
            </div>

            <form className="contact-form" onSubmit={submitForm}>
              <div className="form-heading"><span>Your support request</span><small>We usually reply within one business day.</small></div>
              <div className="form-row">
                <label>Full name<input name="name" required minLength="2" placeholder="Jane Smith" /></label>
                <label>Email<input name="email" type="email" required placeholder="jane@example.com" /></label>
              </div>
              <div className="form-row">
                <label>Phone<input name="phone" required pattern="[0-9+() .\-]{7,}" placeholder="(555) 123-4567" /></label>
                <label>Service required<select name="service" required defaultValue=""><option value="" disabled>Select a service</option>{services.map(([title]) => <option key={title}>{title}</option>)}</select></label>
              </div>
              <label>Describe your problem<textarea name="message" required minLength="10" maxLength="1000" placeholder="What’s happening? What have you tried so far?" /></label>
              {formState === 'success' ? <div className="success-message"><BadgeCheck size={18} /> Thank you! Your support request has been received.</div> : formState === 'error' ? <div className="error-message">{formError}</div> : null}
              <button className="button form-submit" type="submit" disabled={formState === 'loading'}>{formState === 'loading' ? 'Sending…' : 'Submit request'} <ArrowRight size={17} /></button>
            </form>
          </div>
        </section>

        <section className="final-cta">
          <div className="container">
            <span className="eyebrow light-eyebrow">One less thing to worry about</span>
            <h2>Ready to feel more confident<br />with your technology?</h2>
            <ActionButton label="Get support" onClick={() => scrollTo('contact')} />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}

function StripeStatusPage({ status }) {
  const isSuccess = status === 'success'

  return (
    <div className="site-shell">
      <div className="announcement"><span>Stripe</span> {isSuccess ? 'Your payment was successful.' : 'Your checkout was cancelled.'}</div>
      <div className="section">
        <div className="container" style={{ maxWidth: '760px', paddingTop: '60px' }}>
          <div className="pricing-card" style={{ padding: '36px', textAlign: 'center' }}>
            <span className="eyebrow">Billing</span>
            <h2 style={{ margin: '16px 0 10px' }}>{isSuccess ? 'Thanks for your purchase.' : 'Checkout cancelled'}</h2>
            <p style={{ marginBottom: '24px', color: '#5a6d7a' }}>
              {isSuccess
                ? 'Your Stripe session is complete and your support plan is ready to use.'
                : 'No charge was made. You can choose another plan or return to the support page.'}
            </p>
            <div className="hero-actions" style={{ justifyContent: 'center' }}>
              <Link to="/" className="button">Back to home</Link>
              <Link to="/billing" className="outline-button">View billing</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function PrivacyPolicyPage() {
  return (
    <div className="site-shell privacy-shell">
      <header className="privacy-header">
        <div className="container">
          <Link className="brand" to="/" aria-label="Techbuddyassist home">
            <LogoWordmark compact />
          </Link>
          <Link className="privacy-home-link" to="/">Back to home</Link>
        </div>
      </header>
      <main className="privacy-main">
        <article className="privacy-content">
          <span className="eyebrow">Techbuddyassist</span>
          <h1>Privacy Policy</h1>
          <p className="privacy-updated">Effective October 13, 2026</p>
          <p>We respect your privacy. This policy explains what information Techbuddyassist collects when you use our website and how we use it.</p>

          <h2>Information you provide</h2>
          <p>When you submit a support request, we collect the information in the form, such as your name, email address, phone number, requested service, and description of your issue.</p>

          <h2>How we use your information</h2>
          <p>We use your information to respond to support requests, communicate with you about the help you need, and provide and manage our services.</p>

          <h2>Payments</h2>
          <p>If you choose a paid support plan, payment is handled through our payment provider, Stripe. Payment details are submitted directly to Stripe and are subject to its privacy policy. We receive information needed to manage your order and payment.</p>

          <h2>Service providers</h2>
          <p>We use service providers to operate our website, store support requests, and process payments. We share information with them only as needed to provide those services. We do not sell your personal information.</p>

          <h2>Retention and security</h2>
          <p>We keep information for as long as needed to respond to and manage support requests, meet applicable legal obligations, and resolve disputes. We use reasonable safeguards to help protect the information we handle.</p>

          <h2>Your choices and questions</h2>
          <p>You can contact us to ask about, correct, or request deletion of information you have provided, subject to applicable requirements. Use our <Link to="/contact">contact page</Link> or call <a href="tel:+17082311796">+1 (708) 231-1796</a> for privacy questions.</p>

          <h2>Updates to this policy</h2>
          <p>We may update this policy from time to time. Any changes will be posted on this page with an updated effective date.</p>
        </article>
      </main>
    </div>
  )
}

function BillingPageRoute() {
  return (
    <div className="site-shell">
      <div className="announcement"><span>Quotes</span> We confirm scope and pricing before work begins.</div>
      <header className="nav-wrap">
        <nav className="nav container" aria-label="Billing navigation">
          <Link className="brand" to="/">
            <LogoWordmark />
          </Link>
          <div className="billing-nav-actions">
            <Link to="/admin" className="text-button">Admin</Link>
            <Link to="/" className="outline-button">Back home</Link>
          </div>
        </nav>
      </header>
      <BillingPage />
    </div>
  )
}

function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [plans, setPlans] = useState(defaultSupportPlans)
  const [showNewPlan, setShowNewPlan] = useState(false)
  const [newPlan, setNewPlan] = useState({ category: '', name: '', description: '', feature: '', price: '' })
  const [requests, setRequests] = useState([])
  const [customPayments, setCustomPayments] = useState([])
  const [customPayment, setCustomPayment] = useState({ customerName: '', customerEmail: '', description: '', amount: '' })
  const [generatedPayment, setGeneratedPayment] = useState(null)
  const [copiedPaymentLink, setCopiedPaymentLink] = useState(false)
  const [activeTab, setActiveTab] = useState('plans')
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const loadAdminData = async () => {
    setLoading(true)
    setError('')
    try {
      const [plansResponse, requestsResponse, paymentsResponse] = await Promise.all([
        fetch('/api/admin/support-plans', { credentials: 'same-origin' }),
        fetch('/api/contact', { credentials: 'same-origin' }),
        fetch('/api/admin/custom-payments', { credentials: 'same-origin' }),
      ])
      if (plansResponse.status === 401 || requestsResponse.status === 401 || paymentsResponse.status === 401) {
        setAuthenticated(false)
        return
      }
      const plansData = await plansResponse.json().catch(() => ({}))
      const requestsData = await requestsResponse.json().catch(() => ({}))
      const paymentsData = await paymentsResponse.json().catch(() => ({}))
      if (!plansResponse.ok) throw new Error(plansData.message || 'Unable to load plans.')
      if (!requestsResponse.ok) throw new Error(requestsData.message || 'Unable to load support requests.')
      if (!paymentsResponse.ok) throw new Error(paymentsData.message || 'Unable to load custom payments.')
      setPlans(plansData.plans || [])
      setRequests(Array.isArray(requestsData) ? requestsData : [])
      setCustomPayments(paymentsData.payments || [])
      setAuthenticated(true)
    } catch (requestError) {
      setError(requestError.message || 'Unable to load admin data.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetch('/api/admin/session', { credentials: 'same-origin' })
      .then(async (response) => {
        const data = await response.json().catch(() => ({}))
        if (!response.ok) throw new Error(data.message || 'Unable to check admin session.')
        if (!data.configured) {
          setError(`Admin is not configured. Add ${data.missing?.join(' and ') || 'ADMIN_EMAIL, ADMIN_PASSWORD, and JWT_SECRET'} under Vercel Project Settings > Environment Variables, then redeploy.`)
        } else if (data.authenticated) {
          return loadAdminData()
        }
      })
      .catch((requestError) => setError(requestError.message || 'Unable to check admin session.'))
  }, [])

  const signIn = async (event) => {
    event.preventDefault()
    setError('')
    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.message || 'Unable to sign in.')
      setEmail('')
      setPassword('')
      await loadAdminData()
    } catch (requestError) {
      setError(requestError.message || 'Unable to sign in.')
    }
  }

  const savePlan = async (plan) => {
    setError('')
    setNotice('')
    try {
      const response = await fetch(`/api/admin/support-plans/${encodeURIComponent(plan.key)}`, {
        method: 'PATCH',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...plan, amount: Math.round(Number(plan.amount)) }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.message || 'Unable to save plan.')
      setPlans((currentPlans) => currentPlans.map((item) => item.key === plan.key ? data.plan : item))
      setNotice(`${plan.name} saved.`)
    } catch (requestError) {
      setError(requestError.message || 'Unable to save plan.')
    }
  }

  const addPlan = async (event) => {
    event.preventDefault()
    setError('')
    setNotice('')
    try {
      const response = await fetch('/api/admin/support-plans', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newPlan, amount: Math.round(Number(newPlan.price) * 100) }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.message || 'Unable to add plan.')
      setPlans((currentPlans) => [...currentPlans, data.plan].sort((left, right) => left.sortOrder - right.sortOrder))
      setNewPlan({ category: '', name: '', description: '', feature: '', price: '' })
      setShowNewPlan(false)
      setNotice(`${data.plan.name} added.`)
    } catch (requestError) {
      setError(requestError.message || 'Unable to add plan.')
    }
  }

  const setPlanActive = async (plan, isActive) => {
    setError('')
    setNotice('')
    try {
      const response = await fetch(`/api/admin/support-plans/${encodeURIComponent(plan.key)}/status`, {
        method: 'PATCH',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.message || 'Unable to update plan status.')
      setPlans((currentPlans) => currentPlans.map((item) => item.key === plan.key ? data.plan : item))
      setNotice(`${plan.name} ${isActive ? 'restored' : 'archived'}.`)
    } catch (requestError) {
      setError(requestError.message || 'Unable to update plan status.')
    }
  }

  const createCustomPayment = async (event) => {
    event.preventDefault()
    setError('')
    setNotice('')
    setGeneratedPayment(null)
    setCopiedPaymentLink(false)
    try {
      const response = await fetch('/api/admin/custom-payments', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...customPayment,
          amount: Math.round(Number(customPayment.amount) * 100),
        }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.message || 'Unable to create payment link.')
      setGeneratedPayment(data.payment)
      setCustomPayments((current) => [data.payment, ...current])
      setCustomPayment({ customerName: '', customerEmail: '', description: '', amount: '' })
      setNotice('Payment link created. Send it to the customer to complete payment.')
    } catch (requestError) {
      setError(requestError.message || 'Unable to create payment link.')
    }
  }

  const copyPaymentLink = async () => {
    if (!generatedPayment?.checkoutUrl) return
    try {
      await navigator.clipboard.writeText(generatedPayment.checkoutUrl)
      setCopiedPaymentLink(true)
    } catch {
      setError('Clipboard access is unavailable. Use the Open checkout link instead.')
    }
  }

  const updateRequestStatus = async (requestId, status) => {
    setError('')
    try {
      const response = await fetch(`/api/contact/${requestId}`, {
        method: 'PATCH',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.message || 'Unable to update request.')
      setRequests((currentRequests) => currentRequests.map((request) => request._id === requestId ? data : request))
    } catch (requestError) {
      setError(requestError.message || 'Unable to update request.')
    }
  }

  const signOut = async () => {
    await fetch('/api/admin/logout', { method: 'POST', credentials: 'same-origin' }).catch(() => undefined)
    setAuthenticated(false)
    setRequests([])
  }

  return (
    <div className="site-shell admin-shell">
      <div className="announcement"><span>Admin</span> Techbuddyassist management</div>
      <main className="admin-main">
        <div className="container">
          {!authenticated ? (
            <section className="admin-login">
              <span className="eyebrow">Restricted access</span>
              <h1>Admin sign in</h1>
              <p>Sign in with your admin email and password.</p>
              <form onSubmit={signIn}>
                <label htmlFor="admin-email">Admin email</label>
                <input id="admin-email" type="email" autoComplete="username" required value={email} onChange={(event) => setEmail(event.target.value)} />
                <label htmlFor="admin-password">Admin password</label>
                <input id="admin-password" type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} />
                {error && <div className="error-message" role="alert">{error}</div>}
                <button className="button" type="submit" disabled={loading}>{loading ? 'Checking…' : 'Sign in'} <ArrowRight size={17} /></button>
              </form>
              <Link to="/billing" className="text-button">Back to pricing <ArrowRight size={16} /></Link>
            </section>
          ) : (
            <>
              <header className="admin-header">
                <div><span className="eyebrow">Techbuddyassist</span><h1>Admin dashboard</h1></div>
                <button className="outline-button" onClick={signOut}>Sign out</button>
              </header>
              <div className="admin-tabs" role="tablist" aria-label="Admin sections">
                <button role="tab" aria-selected={activeTab === 'plans'} className={activeTab === 'plans' ? 'is-active' : ''} onClick={() => setActiveTab('plans')}>Plans & pricing</button>
                <button role="tab" aria-selected={activeTab === 'requests'} className={activeTab === 'requests' ? 'is-active' : ''} onClick={() => setActiveTab('requests')}>Quote requests <span>{requests.length}</span></button>
                <button role="tab" aria-selected={activeTab === 'payments'} className={activeTab === 'payments' ? 'is-active' : ''} onClick={() => setActiveTab('payments')}>Custom payments <span>{customPayments.length}</span></button>
              </div>
              {error && <div className="error-message" role="alert">{error}</div>}
              {notice && <div className="success-message" role="status">{notice}</div>}
              {activeTab === 'plans' ? (
                <section aria-label="Edit public plans">
                  <div className="admin-plans-toolbar">
                    <p>Changes update the public pricing page.</p>
                    <button className="outline-button" type="button" onClick={() => setShowNewPlan(!showNewPlan)}>
                      {showNewPlan ? 'Cancel' : 'Add plan'}
                    </button>
                  </div>
                  {showNewPlan && (
                    <form className="admin-plan-form admin-new-plan" onSubmit={addPlan}>
                      <div className="admin-plan-heading"><h2>Add a support plan</h2><span>Shown on the public pricing page when active</span></div>
                      <label>Card label<input maxLength="60" value={newPlan.category} onChange={(event) => setNewPlan((current) => ({ ...current, category: event.target.value }))} required /></label>
                      <label>Plan name<input maxLength="100" value={newPlan.name} onChange={(event) => setNewPlan((current) => ({ ...current, name: event.target.value }))} required /></label>
                      <label>Description<textarea maxLength="300" rows="2" value={newPlan.description} onChange={(event) => setNewPlan((current) => ({ ...current, description: event.target.value }))} required /></label>
                      <label>Included feature<input maxLength="160" value={newPlan.feature} onChange={(event) => setNewPlan((current) => ({ ...current, feature: event.target.value }))} required /></label>
                      <label>Starting price (USD)<input type="number" min="0" step="0.01" value={newPlan.price} onChange={(event) => setNewPlan((current) => ({ ...current, price: event.target.value }))} required /></label>
                      <button className="button" type="submit">Create plan <Check size={16} /></button>
                    </form>
                  )}
                  <div className="admin-plans">
                  {plans.map((plan) => (
                    <form className={`admin-plan-form${plan.isActive === false ? ' is-archived' : ''}`} key={plan.key} onSubmit={(event) => { event.preventDefault(); savePlan(plan) }}>
                      <div className="admin-plan-heading"><h2>{plan.name}</h2><span>{plan.isActive === false ? 'Archived' : plan.key}</span></div>
                      <label>Card label<input maxLength="60" value={plan.category} onChange={(event) => setPlans((current) => current.map((item) => item.key === plan.key ? { ...item, category: event.target.value } : item))} required /></label>
                      <label>Plan name<input maxLength="100" value={plan.name} onChange={(event) => setPlans((current) => current.map((item) => item.key === plan.key ? { ...item, name: event.target.value } : item))} required /></label>
                      <label>Description<textarea maxLength="300" rows="2" value={plan.description} onChange={(event) => setPlans((current) => current.map((item) => item.key === plan.key ? { ...item, description: event.target.value } : item))} required /></label>
                      <label>Included feature<input maxLength="160" value={plan.feature} onChange={(event) => setPlans((current) => current.map((item) => item.key === plan.key ? { ...item, feature: event.target.value } : item))} required /></label>
                      <label>Starting price (USD)<input type="number" min="0" step="0.01" value={(plan.amount / 100).toFixed(2)} onChange={(event) => setPlans((current) => current.map((item) => item.key === plan.key ? { ...item, amount: Math.round(Number(event.target.value) * 100) } : item))} required /></label>
                      <div className="admin-plan-actions">
                        <button className="button" type="submit">Save plan <Check size={16} /></button>
                        <button className="admin-archive-button" type="button" onClick={() => setPlanActive(plan, plan.isActive === false)}>
                          {plan.isActive === false ? 'Restore' : 'Archive'}
                        </button>
                      </div>
                    </form>
                  ))}
                  </div>
                </section>
              ) : activeTab === 'requests' ? (
                <section className="admin-requests" aria-label="Customer quote requests">
                  {requests.length ? requests.map((request) => (
                    <article className="admin-request" key={request._id}>
                      <div><span className="eyebrow">{request.service}</span><h2>{request.name}</h2><a href={`mailto:${request.email}`}>{request.email}</a><a href={`tel:${request.phone}`}>{request.phone}</a><p>{request.message}</p></div>
                      <label>Status<select value={request.status} onChange={(event) => updateRequestStatus(request._id, event.target.value)}><option>New</option><option>In Progress</option><option>Resolved</option></select></label>
                    </article>
                  )) : <p className="admin-empty">No quote requests yet.</p>}
                </section>
              ) : (
                <section className="admin-custom-payments" aria-label="Create custom customer payments">
                  <form className="admin-custom-payment-form" onSubmit={createCustomPayment}>
                    <div className="admin-plan-heading"><h2>Create a payment link</h2><span>Stripe Checkout · USD</span></div>
                    <div className="admin-payment-fields">
                      <label>Customer name<input maxLength="100" autoComplete="name" value={customPayment.customerName} onChange={(event) => setCustomPayment((current) => ({ ...current, customerName: event.target.value }))} required /></label>
                      <label>Customer email<input type="email" maxLength="254" autoComplete="email" value={customPayment.customerEmail} onChange={(event) => setCustomPayment((current) => ({ ...current, customerEmail: event.target.value }))} required /></label>
                      <label className="admin-payment-description">Payment description<input maxLength="300" value={customPayment.description} onChange={(event) => setCustomPayment((current) => ({ ...current, description: event.target.value }))} required /></label>
                      <label>Amount (USD)<input type="number" min="0.50" step="0.01" value={customPayment.amount} onChange={(event) => setCustomPayment((current) => ({ ...current, amount: event.target.value }))} required /></label>
                    </div>
                    <button className="button" type="submit">Create payment link <ArrowRight size={17} /></button>
                  </form>
                  {generatedPayment && (
                    <div className="generated-payment" role="status">
                      <div><span className="eyebrow">Payment link ready</span><h2>{generatedPayment.customerName} · ${(generatedPayment.amount / 100).toFixed(2)}</h2><p>{generatedPayment.customerEmail}</p></div>
                      <div className="generated-payment-actions">
                        <a className="button" href={generatedPayment.checkoutUrl} target="_blank" rel="noreferrer">Open checkout <ArrowRight size={16} /></a>
                        <button className="outline-button" type="button" onClick={copyPaymentLink}>{copiedPaymentLink ? 'Copied' : 'Copy link'}</button>
                      </div>
                    </div>
                  )}
                  <div className="admin-payment-history">
                    <h2>Recent custom payments</h2>
                    {customPayments.length ? customPayments.map((payment) => (
                      <article className="admin-payment-row" key={payment._id}>
                        <div><strong>{payment.customerName}</strong><span>{payment.customerEmail}</span><small>{payment.description}</small></div>
                        <strong>${(payment.amount / 100).toFixed(2)}</strong>
                        <span className={`payment-status is-${payment.status}`}>{payment.status}</span>
                        <a href={payment.checkoutUrl} target="_blank" rel="noreferrer">Open link <ArrowRight size={14} /></a>
                      </article>
                    )) : <p className="admin-empty">No custom payments yet.</p>}
                  </div>
                </section>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/privacy" element={<PrivacyPolicyPage />} />
        <Route path="/services" element={<LandingPage />} />
        <Route path="/how-it-works" element={<LandingPage />} />
        <Route path="/about" element={<LandingPage />} />
        <Route path="/faq" element={<LandingPage />} />
        <Route path="/contact" element={<LandingPage />} />
        <Route path="/billing" element={<BillingPageRoute />} />
        <Route path="/billing/admin" element={<Navigate to="/admin" replace />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/billing/success" element={<StripeStatusPage status="success" />} />
        <Route path="/billing/cancel" element={<StripeStatusPage status="cancelled" />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App

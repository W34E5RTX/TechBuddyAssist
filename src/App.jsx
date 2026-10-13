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
  ['How can I contact support?', 'Use the support form or call the number in the footer. We use the details you provide to respond to your request.'],
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
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Disclaimer', href: '/disclaimer' },
    { label: 'Refund Policy', href: '/refund-policy' },
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

function LegalPageLayout({ title, children }) {
  return (
    <div className="site-shell legal-shell">
      <header className="legal-header">
        <div className="container">
          <Link className="brand" to="/" aria-label="Techbuddyassist home">
            <LogoWordmark compact />
          </Link>
          <Link className="legal-home-link" to="/">Back to home</Link>
        </div>
      </header>
      <main className="legal-main">
        <article className="legal-content">
          <span className="eyebrow">Techbuddyassist</span>
          <h1>{title}</h1>
          <p className="legal-updated">Effective October 13, 2026</p>
          {children}
          <nav className="legal-related-links" aria-label="Other legal pages">
            <a href="https://techbuddyassist.com/privacy">Privacy Policy</a>
            <a href="https://techbuddyassist.com/terms">Terms of Service</a>
            <a href="https://techbuddyassist.com/disclaimer">Disclaimer</a>
            <a href="https://techbuddyassist.com/refund-policy">Refund Policy</a>
          </nav>
        </article>
      </main>
    </div>
  )
}

function PrivacyPolicyPage() {
  return (
    <LegalPageLayout title="Privacy Policy">
      <p>This policy describes how Techbuddyassist collects, uses, and shares information when you visit this website, request support, or make a payment. We do not sell personal information.</p>

      <h2>Information you provide</h2>
      <p>The support form asks for your name, email address, phone number, selected service, and a description of your issue. If you ask for support or provide payment details through a separate checkout, we also process information needed to respond and manage that request or payment.</p>

      <h2>How we use information</h2>
      <p>We use submitted information to respond to you, understand and deliver requested support, arrange or administer payments, maintain our records, protect the website, and meet legal obligations.</p>

      <h2>Storage and service providers</h2>
      <p>Support requests and related records are stored in a MongoDB database used by the website. Website hosting, database, and payment services are provided by third parties that process information on our behalf or under their own terms. We use Stripe-hosted checkout for payments; Stripe collects and processes payment details under its own privacy policy. We do not store full payment card numbers on this website.</p>

      <h2>Cookies and external services</h2>
      <p>When an administrator signs in, the site uses an essential, HTTP-only session cookie to maintain that restricted session. The cookie is limited to the API and expires after eight hours. The website also loads fonts from Google Fonts; when those fonts load, Google may receive technical information such as your IP address and browser details. We have not added advertising or analytics cookies to the website code.</p>

      <h2>Retention and security</h2>
      <p>We keep information for as long as reasonably needed to respond to requests, administer services and payments, meet legal requirements, and resolve disputes. Support requests currently have no automatic deletion schedule and may remain in the database until removed. We use access controls and other safeguards, but no internet transmission or storage system can be guaranteed completely secure.</p>

      <h2>Your choices</h2>
      <h2>Support communications and remote access</h2>
      <p>We use the contact details and issue description you submit to respond to and manage your support request. Support requests are stored in our MongoDB database and are accessible to authorized administrators for handling requests. If remote assistance is offered, access is not initiated through the contact form; it requires your permission for the session. You control whether to grant access and may end the session. Do not send passwords, payment-card details, or one-time security codes through the website.</p>

      <h2>Your choices</h2>
      <p>You may contact us to ask about, correct, or request deletion of information you provided. We may need to verify your request and may retain information where required or permitted by law. To make a request, use our <a href="https://techbuddyassist.com/contact">Contact Us page</a> or call <a href="tel:+17082311796">+1 (708) 231-1796</a>.</p>

      <h2>Children and changes</h2>
      <p>This website is intended for a general audience and is not directed to children under 13. We do not knowingly request personal information from children under 13. We may update this policy; the effective date above will show when it was last revised.</p>

      <h2>Contact</h2>
      <p>Techbuddyassist, 1901 N. Roselle Rd, Suite 800, Schaumburg, Illinois 60195. You may also call <a href="tel:+17082311796">+1 (708) 231-1796</a>.</p>
    </LegalPageLayout>
  )
}

function TermsOfServicePage() {
  return (
    <LegalPageLayout title="Terms of Service">
      <p>These terms apply when you use the TechBuddy Assist website, submit a support request, or purchase a support plan. By using the website, you agree to these terms. If you do not agree, do not use the website. Our <a href="https://techbuddyassist.com/privacy">Privacy Policy</a> explains how we handle support requests and personal information.</p>

      <h2>Our services</h2>
      <p>Techbuddyassist provides technology support and guidance for common computer, mobile-device, software, connectivity, setup, and small-business technology needs. Website descriptions are general summaries. The exact work, timing, and deliverables will depend on the issue and any scope confirmed with you.</p>
      <p>Submitting a support form is a request, not a confirmed appointment or promise that a particular service is available. We use the contact details and issue description you provide to respond and coordinate the request. Any custom quote must be agreed before the quoted work begins.</p>

      <h2>Your responsibilities</h2>
      <p>Provide accurate information and only request help for devices, accounts, and systems you own or are authorized to manage. Before troubleshooting, maintain a separate backup of important files and follow any instructions about access, permissions, or equipment. Do not use our services to violate law, access another person’s system without permission, or interfere with security controls.</p>

      <h2>Remote support</h2>
      <p>Remote access is used only when appropriate and with your permission for the session. The support form does not itself grant device access. You decide whether to grant access and may end the session. Do not share passwords, payment-card details, or one-time security codes in the support form or chat. See our <a href="https://techbuddyassist.com/privacy">Privacy Policy</a> for information about handling support requests and contact details.</p>

      <h2>Prices and payment</h2>
      <p>Prices shown on the payment page are one-time amounts in U.S. dollars for the plan descriptions displayed there. Custom work may have a separate quote. Payment checkout is provided by Stripe and is subject to Stripe’s terms. A checkout canceled before payment is completed is not a completed purchase.</p>
      <p>Refund eligibility and cancellation rules are described in our <a href="https://techbuddyassist.com/refund-policy">Refund Policy</a>. Nothing in that policy or these terms removes rights that cannot legally be waived.</p>

      <h2>Availability and third parties</h2>
      <p>We may update, suspend, or discontinue website features. The site also relies on third-party services, including hosting, database, font, and payment providers; their services are governed by their own terms and availability.</p>

      <h2>Website content</h2>
      <p>Website text, design, and branding belong to Techbuddyassist or their respective owners. You may use the website for personal or internal business purposes, but may not copy or republish site content commercially without permission.</p>

      <h2>Disclaimers and liability</h2>
      <p>Technology support is provided on a best-efforts basis. We do not guarantee that every issue can be diagnosed or resolved, or that the website will always be available. Read the <a href="https://techbuddyassist.com/disclaimer">Disclaimer</a> for important information about technical guidance, data backups, and outcomes.</p>
      <p>Nothing in these terms excludes or limits liability, consumer protections, or other rights where doing so is not permitted by applicable law. Any limitation applies only to the extent the law permits it. These terms have not been reviewed for every jurisdiction; seek independent advice if you need help understanding your rights.</p>

      <h2>Changes and contact</h2>
      <p>We may update these terms by posting a revised version here. The effective date above indicates when the current version takes effect. Questions may be sent through the <a href="https://techbuddyassist.com/contact">Contact Us page</a> or by calling <a href="tel:+17082311796">+1 (708) 231-1796</a>.</p>
      <p>TechBuddy Assist, 1901 N. Roselle Rd, Suite 800, Schaumburg, Illinois 60195.</p>
    </LegalPageLayout>
  )
}

function RefundPolicyPage() {
  return (
    <LegalPageLayout title="Refund Policy">
      <p>This policy applies to one-time support-plan purchases made through TechBuddy Assist’s Stripe-hosted checkout. It is effective October 13, 2026.</p>

      <h2>When you may cancel</h2>
      <p>You may cancel a support purchase and request a full refund any time before support work begins. Contact us through the <a href="https://techbuddyassist.com/contact">Contact Us page</a> or call <a href="tel:+17082311796">+1 (708) 231-1796</a>. Include the name and email used for the purchase and any receipt or payment reference so we can identify it. If a checkout is canceled before payment is completed, no payment is taken.</p>

      <h2>After support begins</h2>
      <p>Once support work has started, payments are not refundable under this policy. This does not limit any refund, cancellation, or other rights that apply under mandatory law. If you believe a payment was made in error or have a concern about the service, contact us so we can review it.</p>

      <h2>How refunds are processed</h2>
      <p>For an eligible request, we will review the request and, when approved, submit the full refund to the original payment method within five business days. Your bank or card issuer controls when the credit appears, so the time for it to post may vary.</p>

      <h2>Custom quotes and questions</h2>
      <p>For custom work, any cancellation or refund terms specifically agreed in writing for that work will apply, subject to applicable law. If no separate written terms were agreed, contact us before work begins to request cancellation and a full refund. Questions about this policy may be sent through the <a href="https://techbuddyassist.com/contact">Contact Us page</a>.</p>

      <h2>Contact</h2>
      <p>TechBuddy Assist, 1901 N. Roselle Rd, Suite 800, Schaumburg, Illinois 60195. Phone: <a href="tel:+17082311796">+1 (708) 231-1796</a>.</p>
    </LegalPageLayout>
  )
}

function DisclaimerPage() {
  return (
    <LegalPageLayout title="Disclaimer">
      <p>This Disclaimer applies to information on the Techbuddyassist website and to general technology guidance provided through our services.</p>

      <h2>Guidance and outcomes</h2>
      <p>Website content and support guidance are general information based on the details available at the time. Technology, software, and device configurations vary. We cannot guarantee that a suggested step will resolve a particular issue or that a device, network, account, or application will remain error-free.</p>

      <h2>Protect your data and access</h2>
      <p>Back up important files before making system changes, installing software, changing settings, or beginning troubleshooting. You are responsible for keeping a current backup and for deciding whether to proceed with a recommended step. Do not send passwords, full payment-card numbers, or security codes through the website.</p>
      <p>Remote assistance, when offered, requires your permission. You remain in control of the device and may stop the session. We do not guarantee recovery of lost data or prevention of every security incident.</p>

      <h2>Third-party products and services</h2>
      <p>References to third-party devices, software, providers, or services are for identification and do not mean that those parties endorse Techbuddyassist. Their products and services remain subject to their own warranties, terms, and support policies. Contact the manufacturer or provider when an issue may affect a warranty, account, or service agreement.</p>

      <h2>No emergency service</h2>
      <p>Techbuddyassist is not an emergency-response provider and does not monitor support requests continuously. Do not rely on this website for urgent safety, medical, or active cyber-incident response. Contact the appropriate emergency service, provider, or qualified incident-response professional when needed.</p>

      <h2>Limits</h2>
      <p>The website and its content are provided as available, without a promise that they will be uninterrupted, error-free, or suitable for every purpose. Any exclusion or limitation of liability applies only to the extent permitted by applicable law. Nothing in this Disclaimer excludes or limits liability, consumer protections, or other rights that cannot legally be excluded or limited.</p>

      <h2>Contact</h2>
      <p>If you have questions about this Disclaimer, please contact TechBuddy Assist through our <a href="https://techbuddyassist.com/contact">Contact Us page</a> or call <a href="tel:+17082311796">+1 (708) 231-1796</a>.</p>
    </LegalPageLayout>
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
        <Route path="/terms" element={<TermsOfServicePage />} />
        <Route path="/disclaimer" element={<DisclaimerPage />} />
        <Route path="/refund-policy" element={<RefundPolicyPage />} />
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

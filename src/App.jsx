import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, BadgeCheck, Check, ChevronDown, CircleHelp, Clock3, Cloud, Cpu, Headphones, Laptop, Menu, MessageCircle, Network, Phone, ShieldCheck, Smartphone, Sparkles, TabletSmartphone, Wifi, X } from 'lucide-react'
import { Analytics } from '@vercel/analytics/react'
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

function ActionButton({ label = 'Get Support', onClick, variant = 'primary' }) {
  return (
    <button className={variant === 'outline' ? 'outline-button' : 'button'} onClick={onClick}>
      {label} <ArrowRight size={17} />
    </button>
  )
}

function Nav({ menuOpen, setMenuOpen, scrollTo }) {
  return (
    <header className="nav-wrap">
      <nav className="nav container" aria-label="Main navigation">
        <button className="brand" onClick={() => scrollTo('home')}>
          <span className="brand-mark"><Sparkles size={17} /></span>
          TechBuddy <b>Assist</b>
        </button>
        <button className="menu-toggle" aria-label="Toggle navigation" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X /> : <Menu />}
        </button>
        <div className={`nav-links ${menuOpen ? 'is-open' : ''}`}>
          <button onClick={() => scrollTo('home')}>Home</button>
          <button onClick={() => scrollTo('services')}>Services</button>
          <button onClick={() => scrollTo('how-it-works')}>How It Works</button>
          <button onClick={() => scrollTo('about')}>About</button>
          <button onClick={() => scrollTo('faq')}>FAQ</button>
          <button onClick={() => scrollTo('contact')}>Contact</button>
          <button className="button button-small" onClick={() => scrollTo('contact')}>
            Get Support <ArrowRight size={15} />
          </button>
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
        <a key={link.label} href={link.href}>{link.label}</a>
      ))}
    </div>
  )
}

function Footer({ scrollTo }) {
  const navigationLinks = [
    { label: 'Home', href: '#home' },
    { label: 'Services', href: '#services' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'About Us', href: '#about' },
    { label: 'FAQ', href: '#faq' },
    { label: 'Contact Us', href: '#contact' },
    { label: 'Payment', href: '#contact' },
  ]

  const serviceLinks = [
    { label: 'Computer Support', href: '#services' },
    { label: 'Windows & Mac', href: '#services' },
    { label: 'Smartphone & Tablet', href: '#services' },
    { label: 'Wi-Fi & Network', href: '#services' },
    { label: 'Remote Support', href: '#services' },
    { label: 'Small Business IT', href: '#business' },
  ]

  const legalLinks = [
    { label: 'Privacy Policy', href: '#contact' },
    { label: 'Terms of Service', href: '#contact' },
    { label: 'Refund Policy', href: '#contact' },
  ]

  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div>
          <button className="brand footer-brand" onClick={() => scrollTo('home')}>
            <span className="brand-mark"><Sparkles size={17} /></span>
            TechBuddy <b>Assist</b>
          </button>
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
        <span>© 2026 TechBuddy Assist.</span>
        <span>US-based technology support provider.</span>
      </div>
    </footer>
  )
}

function App() {
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
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    setMenuOpen(false)
  }

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
      const result = await response.json().catch(() => ({}))
      if (!response.ok || !result.contact?._id) throw new Error(result.message || 'Unable to save request')
      setFormState('success'); formElement.reset()
    } catch (error) {
      setFormState('error'); setFormError(error.message || 'We could not save your request right now. Please try submitting again.')
    }
  }

  return (
    <div className="site-shell">
      <div className="announcement"><span>New</span> Patient, professional technology support is one message away. <button onClick={() => scrollTo('contact')}>Get help today <ArrowRight size={14} /></button></div>
      <Nav menuOpen={menuOpen} setMenuOpen={setMenuOpen} scrollTo={scrollTo} />
      <main>
        <section id="home" className="hero">
          <div className="hero-glow" />
          <div className="container hero-grid">
            <motion.div initial="hidden" animate="visible" variants={fadeUp} className="hero-copy">
              <div className="eyebrow"><span className="eyebrow-dot" /> Trusted technology support</div>
              <h1>Technology problems shouldn’t <em>slow you down.</em></h1>
              <p className="hero-lede">TechBuddy Assist helps individuals, families, seniors, professionals, home offices, and small businesses understand, manage, and resolve technology problems with clear, patient, professional assistance. No jargon. No scare tactics. Just real help from real people who know technology.</p>
              <div className="hero-actions">
                <ActionButton label="Get Support" onClick={() => scrollTo('contact')} />
                <button className="text-button" onClick={() => scrollTo('services')}>Explore services <ArrowRight size={16} /></button>
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
              {['Computer running slowly', 'Internet not working', 'Printer won��t print', 'Suspicious popups', 'Software not installing', 'Phone setup problems', 'Email or account trouble', 'Device configuration'].map((problem) => (
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
              <span className="eyebrow light-eyebrow">Why TechBuddy Assist</span>
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
              <span>TechBuddy Assist approach</span>
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
                <label>Phone<input name="phone" required pattern="[0-9+() .-]{7,}" placeholder="(555) 123-4567" /></label>
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
      <Footer scrollTo={scrollTo} />
      <Analytics />
    </div>
  )
}

export default App

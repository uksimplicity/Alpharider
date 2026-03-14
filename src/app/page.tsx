import Link from "next/link";
import Header from "./components/Header";

const excellenceCards = [
  {
    title: "Lightning Fast",
    description:
      "Same-day delivery guaranteed. Your packages arrive when you need them, every single time.",
  },
  {
    title: "Ultra Secure",
    description:
      "End-to-end encryption and real-time tracking ensure your deliveries are always protected.",
  },
  {
    title: "Always Reliable",
    description:
      "99.9% on-time delivery rate. We take commitment seriously and deliver on our promises.",
  },
  {
    title: "Same-Day Service",
    description:
      "Order before 2 PM and receive your package the same day. No exceptions, no excuses.",
  },
];

const steps = [
  {
    title: "Schedule Pickup",
    description:
      "Book your delivery in seconds through our app or website. Choose your preferred time slot.",
  },
  {
    title: "We Pick & Deliver",
    description:
      "Our professional couriers collect your package and ensure safe, swift transportation.",
  },
  {
    title: "Receive Confirmation",
    description:
      "Get instant delivery confirmation with photo proof and digital signature verification.",
  },
];

const stats = [
  { value: "50K+", label: "Cool Number" },
  { value: "99.9%", label: "On Time" },
  { value: "24/7", label: "Support" },
];

const trustCards = [
  { title: "Fully Insured", description: "Every package protected" },
  { title: "Award Winning", description: "Best Delivery Service" },
  { title: "500K+ Customers", description: "Trusted by businesses worldwide" },
  { title: "99.9% Success", description: "Industry leading delivery rate" },
  { title: "Secure Handling", description: "End-to-end encrypted tracking" },
  { title: "24/7 Support", description: "Always here when you need us" },
];

const ctaStats = [
  { title: "< 2 Hours", description: "Average Delivery Time" },
  { title: "99.9%", description: "On-Time Delivery Rate" },
  { title: "24/7", description: "Customer Support" },
];

export default function Home() {
  return (
    <div className="homepage">
      <Header />

      <section className="hero">
        <div className="hero-content">
          <h1>Delivery at the Speed of Trust</h1>
          <p>
            Experience premium delivery service that combines lightning-fast
            speed with enterprise-grade security. Your packages, delivered same
            day.
          </p>
          <div className="hero-actions">
            <button className="button cta">Get Started Now</button>
            <button className="button ghost">Track Your Package</button>
          </div>
          <div className="hero-stats">
            {stats.map((stat) => (
              <div key={stat.label} className="hero-stat">
                <strong>{stat.value}</strong>
                <span>{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="track-card">
          <div className="track-header">
            <span>Track Package</span>
            <span className="track-icon" />
          </div>
          <div className="track-divider" />
          <label>
            Tracking Number
            <input type="text" placeholder="Enter Tracking Number" />
          </label>
          <button className="button cta small">Submit</button>
          <div className="track-status">
            <ul>
              <li>
                <span className="dot" />
                <div>
                  <strong>Package Received</strong>
                  <span>09:00 AM</span>
                </div>
              </li>
              <li>
                <span className="dot" />
                <div>
                  <strong>In Transit</strong>
                  <span>11:30 AM</span>
                </div>
              </li>
              <li>
                <span className="dot" />
                <div>
                  <strong>Out for Delivery</strong>
                  <span>Est. 2:00 PM</span>
                </div>
              </li>
              <li className="muted">
                <span className="dot" />
                <div>
                  <strong>Delivered</strong>
                  <span>Pending</span>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section className="excellence">
        <span className="pill">Why Choose Us</span>
        <h2>Delivery Excellence</h2>
        <p className="subtitle">
          Built on a foundation of speed, security, and reliability. Experience
          delivery reimagined.
        </p>
        <div className="card-grid">
          {excellenceCards.map((card) => (
            <article key={card.title} className="card">
              <h3>{card.title}</h3>
              <p>{card.description}</p>
            </article>
          ))}
        </div>
        <div className="trusted">
          <span>Trusted by 500,000+ customers nationwide</span>
        </div>
      </section>

      <section className="process">
        <span className="pill light">Simple Process</span>
        <h2>How It Works</h2>
        <p className="subtitle">
          Three simple steps to get your package delivered safely and on time.
        </p>
        <div className="step-grid">
          {steps.map((step, index) => (
            <div key={step.title} className="step-card">
              <span className="step-number">0{index + 1}</span>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </div>
          ))}
        </div>
        <button className="button cta">Start Your Delivery Now</button>
      </section>

      <section className="why">
        <span className="pill">Testimonials</span>
        <h2>Why Choose Us</h2>
        <p className="subtitle">
          Join hundreds of thousands of satisfied customers who trust us with
          their most important deliveries.
        </p>
        <div className="why-grid">
          <div className="why-image">
            <div className="image-overlay">
              <div className="image-stats">
                <div>
                  <strong>99K+</strong>
                  <span>Packages</span>
                </div>
                <div>
                  <strong>19+</strong>
                  <span>Cities</span>
                </div>
                <div>
                  <strong>4.8★</strong>
                  <span>Rating</span>
                </div>
              </div>
            </div>
          </div>
          <div className="trust-grid">
            {trustCards.map((card) => (
              <div key={card.title} className="trust-card">
                <h3>{card.title}</h3>
                <p>{card.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="cta">
        <div className="cta-content">
          <span className="pill">AlphaRider Pro</span>
          <h2>Ready to Experience Premium Delivery?</h2>
          <p>
            Join 500,000+ satisfied customers. Get your first delivery free when
            you sign up today.
          </p>
          <div className="hero-actions">
            <button className="button cta">Get Started Now</button>
            <button className="button ghost">Download App</button>
          </div>
        </div>
        <div className="cta-stats">
          {ctaStats.map((item) => (
            <div key={item.title} className="cta-card">
              <strong>{item.title}</strong>
              <span>{item.description}</span>
            </div>
          ))}
        </div>
      </section>

      <footer className="footer">
        <div className="footer-main">
          <div className="footer-brand">
            <div className="logo">
              <img src="/logo.png" alt="AlphaRide" />
            </div>
            <p>
              Premium delivery service offering fast, secure, and reliable
              same-day delivery solutions.
            </p>
            <div className="socials">
              <span>f</span>
              <span>X</span>
              <span>▶</span>
              <span>◎</span>
            </div>
          </div>
          <div className="footer-links">
            <div>
              <h4>Quick Links</h4>
              <Link href="#">About Us</Link>
              <Link href="#">Services</Link>
              <Link href="#">Track Package</Link>
              <Link href="#">Become a Partner</Link>
            </div>
            <div>
              <h4>Support</h4>
              <Link href="#">Help Center</Link>
              <Link href="#">Terms of Service</Link>
              <Link href="#">Privacy Policy</Link>
              <Link href="#">FAQs</Link>
            </div>
            <div>
              <h4>Contact us</h4>
              <span>info@alphariderapp.com</span>
              <span>+234 704 516 8796</span>
              <span>Lagos, Nigeria</span>
            </div>
          </div>
        </div>
        <div className="footer-divider" />
        <div className="footer-bottom">
          <span>Copyright © 2026 Alpha Rider | Powered by FNUK Technologies</span>
        </div>
      </footer>
    </div>
  );
}

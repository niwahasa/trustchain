import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import {
  ShieldCheck,
  Upload,
  Lock,
  Link2,
  FileSearch,
  Users,
  Receipt,
  Globe,
  ChevronRight,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ─── Hero Sphere Animation ─── */
function ProtocolSphere() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);
    let frame = 0;
    let animId: number;

    const particles: {
      x: number;
      y: number;
      z: number;
      baseX: number;
      baseY: number;
    }[] = [];
    const PARTICLE_COUNT = 1200;
    const RADIUS = Math.min(w, h) * 0.3;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const phi = Math.acos(-1 + (2 * i) / PARTICLE_COUNT);
      const theta = Math.PI * (1 + Math.sqrt(5)) * i;
      const x = RADIUS * Math.sin(phi) * Math.cos(theta);
      const y = RADIUS * Math.sin(phi) * Math.sin(theta);
      const z = RADIUS * Math.cos(phi);
      particles.push({ x, y, z, baseX: x, baseY: y });
    }

    function draw() {
      if (!ctx) return;
      ctx.clearRect(0, 0, w, h);
      frame++;

      const cx = w / 2;
      const cy = h / 2;
      const rotY = frame * 0.003;
      const rotX = Math.sin(frame * 0.001) * 0.3;

      for (const p of particles) {
        const cosY = Math.cos(rotY);
        const sinY = Math.sin(rotY);
        const cosX = Math.cos(rotX);
        const sinX = Math.sin(rotX);

        const rx = p.baseX * cosY - p.z * sinY;
        const rz = p.baseX * sinY + p.z * cosY;
        const ry = p.baseY * cosX - rz * sinX;
        const rz2 = p.baseY * sinX + rz * cosX;

        const scale = 800 / (800 + rz2);
        const sx = cx + rx * scale;
        const sy = cy + ry * scale;

        const alpha = (scale - 0.5) * 0.6;
        const size = scale * 1.2;

        ctx.beginPath();
        ctx.arc(sx, sy, size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 212, 255, ${Math.max(0, alpha)})`;
        ctx.fill();
      }

      // Wireframe icosahedron
      ctx.strokeStyle = "rgba(0, 212, 255, 0.08)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      const wireRadius = RADIUS * 1.15;
      for (let i = 0; i < 12; i++) {
        const phi = Math.acos(-1 + (2 * i) / 12);
        const theta = Math.PI * (1 + Math.sqrt(5)) * i;
        const wx = wireRadius * Math.sin(phi) * Math.cos(theta + rotY);
        const wy = wireRadius * Math.sin(phi) * Math.sin(theta + rotY);
        const wz = wireRadius * Math.cos(phi);
        const ws = 800 / (800 + wz);
        if (i === 0) ctx.moveTo(cx + wx * ws, cy + wy * ws);
        else ctx.lineTo(cx + wx * ws, cy + wy * ws);
      }
      ctx.closePath();
      ctx.stroke();

      animId = requestAnimationFrame(draw);
    }

    draw();

    const handleResize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
}

/* ─── Kinetic Text ─── */
function KineticHeading({ text }: { text: string }) {
  const ref = useRef<HTMLHeadingElement>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    document.fonts.ready.then(() => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setLoaded(true));
      });
    });
  }, []);

  const words = text.split(" ");

  return (
    <h1
      ref={ref}
      className={cn(
        "flex flex-wrap justify-center gap-x-[0.3em] font-syne font-extrabold text-center leading-tight",
        "text-3xl sm:text-4xl md:text-5xl lg:text-[3.5rem]",
        loaded ? "is-loaded" : ""
      )}
    >
      {words.map((word, wi) => (
        <span key={wi} className="inline-flex overflow-hidden relative">
          {word.split("").map((char, ci) => {
            const centerWord = (words.length - 1) / 2;
            const centerChar = (word.length - 1) / 2;
            const wordDist = Math.abs(wi - centerWord);
            const charDist = Math.abs(ci - centerChar);
            const delay = wordDist * 0.15 + charDist * 0.04;

            return (
              <span
                key={ci}
                className="inline-block transition-all duration-[1200ms]"
                style={{
                  transitionDelay: `${delay}s`,
                  transitionTimingFunction: "cubic-bezier(0.87, 0, 0.13, 1)",
                  transform: loaded ? "translateY(0)" : "translateY(100%)",
                  opacity: loaded ? 1 : 0,
                }}
              >
                {char}
              </span>
            );
          })}
        </span>
      ))}
    </h1>
  );
}

/* ─── Feature Card ─── */
function FeatureCard({
  icon: Icon,
  title,
  description,
  color = "#00d4ff",
}: {
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  title: string;
  description: string;
  color?: string;
}) {
  return (
    <div className="glass-card p-7 hover:-translate-y-1 hover:border-[rgba(0,212,255,0.25)] hover:shadow-glass transition-all duration-300">
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
        style={{ backgroundColor: `${color}15` }}
      >
        <Icon className="w-6 h-6" style={{ color }} />
      </div>
      <h3 className="font-syne font-bold text-base text-trust-text mb-2">
        {title}
      </h3>
      <p className="text-sm text-trust-text-secondary leading-relaxed">
        {description}
      </p>
    </div>
  );
}

/* ─── How It Works Card ─── */
function StepCard({
  step,
  icon: Icon,
  title,
  description,
  color = "#00d4ff",
}: {
  step: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  title: string;
  description: string;
  color?: string;
}) {
  return (
    <div className="glass-card p-8 relative overflow-hidden group">
      <span
        className="absolute top-4 right-4 font-mono-code text-5xl font-normal opacity-[0.07]"
        style={{ color }}
      >
        {step}
      </span>
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
        style={{ backgroundColor: `${color}15` }}
      >
        <Icon className="w-6 h-6" style={{ color }} />
      </div>
      <h3 className="font-syne font-bold text-lg text-trust-text mb-3">
        {title}
      </h3>
      <p className="text-sm text-trust-text-secondary leading-relaxed">
        {description}
      </p>
    </div>
  );
}

/* ─── Main Page ─── */
export default function Home() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-navy-deepest">
      {/* Navigation */}
      <nav
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          scrolled
            ? "bg-navy-deepest/90 backdrop-blur-md border-b border-[rgba(0,212,255,0.08)]"
            : "bg-transparent"
        )}
      >
        <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <ShieldCheck className="w-6 h-6 text-cyan" />
            <span className="font-syne font-bold text-lg text-trust-text">
              TRUST<span className="text-cyan">CHAIN</span>
            </span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-trust-text-secondary hover:text-trust-text transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="text-sm text-trust-text-secondary hover:text-trust-text transition-colors">
              How It Works
            </a>
            <Link
              to="/verify"
              className="text-sm text-trust-text-secondary hover:text-trust-text transition-colors"
            >
              Verify
            </Link>
            <div className="flex items-center gap-3 ml-4">
              <Link
                to="/login"
                className="text-sm text-trust-text-secondary hover:text-trust-text transition-colors px-4 py-2"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="btn-primary text-sm py-2 px-5"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
        <ProtocolSphere />
        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto" style={{ marginTop: "-5vh" }}>
          <KineticHeading text="Blockchain Verification Protocol" />
          <p
            className="mt-8 text-lg text-trust-text-secondary max-w-xl mx-auto leading-relaxed opacity-0 animate-[fadeInUp_0.4s_ease-out_0.5s_forwards]"
          >
            Immutable document anchoring. Instant trust. Zero ambiguity.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 mt-10 opacity-0 animate-[fadeInUp_0.4s_ease-out_0.7s_forwards]">
            <Link to="/register" className="btn-primary inline-flex items-center gap-2">
              Get Started <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/verify" className="btn-secondary">
              Verify Document
            </Link>
          </div>
        </div>

        {/* Status Bar */}
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-10 flex items-center gap-12 opacity-0 animate-[fadeIn_0.4s_ease-out_1s_forwards]">
          {[
            { label: "24,847 Documents Anchored" },
            { label: "Polygon PoS" },
            { label: "99.99% Uptime" },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan" />
              <span className="font-mono-code text-xs text-trust-text-muted">
                {item.label}
              </span>
            </div>
          ))}
        </div>

        {/* Navigation Pills */}
        <div className="absolute bottom-20 left-12 z-10 hidden lg:flex flex-col gap-0.5 opacity-0 animate-[fadeIn_0.4s_ease-out_1.2s_forwards]">
          {["Verify Document", "Issue Receipt", "View Protocol"].map(
            (label, i) => (
              <Link
                key={i}
                to={i === 0 ? "/verify" : i === 1 ? "/receipts/new" : "/dashboard"}
                className="flex items-center gap-2 text-[13px] font-medium text-trust-text-secondary hover:text-trust-text hover:translate-x-1 transition-all duration-200 py-1"
              >
                <ChevronRight className="w-3 h-3" />
                {label}
              </Link>
            )
          )}
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-32 px-6 grid-bg">
        <div className="max-w-[1400px] mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-syne font-bold text-3xl md:text-4xl text-trust-text mb-4">
              How It Works
            </h2>
            <p className="text-trust-text-secondary">
              Three steps to cryptographic permanence
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StepCard
              step="01"
              icon={Upload}
              title="Upload"
              description="Drag or select your document. We accept PDF, DOCX, and images."
              color="#00d4ff"
            />
            <StepCard
              step="02"
              icon={Lock}
              title="Hash & Encrypt"
              description="SHA-256 fingerprint generated. AES-256-GCM encryption applied."
              color="#1a56db"
            />
            <StepCard
              step="03"
              icon={Link2}
              title="Anchor to Chain"
              description="Permanently recorded on Polygon PoS. Tamper-proof forever."
              color="#00e5a0"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div className="glass-card p-8">
              <h3 className="font-syne font-bold text-lg text-trust-text mb-3">
                Your TrustChain ID
              </h3>
              <p className="text-sm text-trust-text-secondary mb-5">
                Every document receives a unique verification code.
              </p>
              <div className="bg-[rgba(0,212,255,0.05)] border border-dashed border-[rgba(0,212,255,0.2)] rounded-lg p-4">
                <span className="font-mono-code text-xl text-cyan tracking-[0.1em]">
                  TC-7X9K-2M4P
                </span>
              </div>
            </div>
            <div className="glass-card p-8 md:col-span-2">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                {[
                  { label: "Document", icon: Upload, color: "#00d4ff" },
                  { label: "Hash", icon: Lock, color: "#1a56db" },
                  { label: "IPFS", icon: Globe, color: "#00e5a0" },
                  { label: "Blockchain", icon: Link2, color: "#00d4ff" },
                  { label: "Verify", icon: FileSearch, color: "#00e5a0" },
                ].map((step, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="flex flex-col items-center gap-2 w-20">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: `${step.color}15` }}
                      >
                        <step.icon
                          className="w-5 h-5"
                          style={{ color: step.color }}
                        />
                      </div>
                      <span className="text-[11px] text-trust-text-secondary text-center">
                        {step.label}
                      </span>
                    </div>
                    {i < 4 && (
                      <ArrowRight className="w-4 h-4 text-trust-text-muted opacity-40 -mt-6" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-32 px-6 border-t border-[rgba(0,212,255,0.06)]">
        <div className="max-w-[1400px] mx-auto">
          <h2 className="font-syne font-bold text-3xl md:text-4xl text-trust-text mb-12 text-center">
            Protocol Features
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <FeatureCard
              icon={ShieldCheck}
              title="Immutable Proof"
              description="Cryptographic hashes make tampering mathematically impossible"
              color="#00e5a0"
            />
            <FeatureCard
              icon={FileSearch}
              title="Instant Verify"
              description="Verify any document in seconds with its TrustChain ID"
              color="#00d4ff"
            />
            <FeatureCard
              icon={Users}
              title="Multi-Party Sign"
              description="Contracts that require signatures from all parties"
              color="#1a56db"
            />
            <FeatureCard
              icon={Receipt}
              title="Receipt Engine"
              description="Generate blockchain-backed receipts with tax and discounts"
              color="#00d4ff"
            />
            <FeatureCard
              icon={Globe}
              title="Global Access"
              description="Verify from anywhere. No account needed."
              color="#00e5a0"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6">
        <div className="max-w-xl mx-auto">
          <div className="glass-card p-12 text-center">
            <h2 className="font-syne font-bold text-2xl md:text-3xl text-trust-text mb-4">
              Ready to Anchor Your First Document?
            </h2>
            <p className="text-trust-text-secondary mb-8 leading-relaxed">
              Join thousands of businesses and individuals who trust TrustChain
              for their most important documents.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link to="/register" className="btn-primary">
                Get Started
              </Link>
              <Link to="/dashboard" className="btn-secondary">
                View Pricing
              </Link>
            </div>
            <p className="mt-8 text-[13px] text-trust-text-muted">
              Trusted by 500+ businesses
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[rgba(0,212,255,0.06)] py-16 px-6">
        <div className="max-w-[1400px] mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
            <div>
              <Link to="/" className="flex items-center gap-2 mb-4">
                <ShieldCheck className="w-5 h-5 text-cyan" />
                <span className="font-syne font-bold text-lg">
                  TRUST<span className="text-cyan">CHAIN</span>
                </span>
              </Link>
              <p className="text-sm text-trust-text-secondary leading-relaxed mb-4">
                Document verification infrastructure for the modern enterprise.
              </p>
            </div>
            <div>
              <h4 className="text-[13px] font-semibold text-trust-text uppercase tracking-wider mb-4">
                Product
              </h4>
              <div className="flex flex-col gap-2.5">
                {["Verify", "Issue Receipt", "Create Contract", "API Access"].map(
                  (item) => (
                    <Link
                      key={item}
                      to="/"
                      className="text-sm text-trust-text-secondary hover:text-trust-text transition-colors"
                    >
                      {item}
                    </Link>
                  )
                )}
              </div>
            </div>
            <div>
              <h4 className="text-[13px] font-semibold text-trust-text uppercase tracking-wider mb-4">
                Resources
              </h4>
              <div className="flex flex-col gap-2.5">
                {["Documentation", "Blockchain Explorer", "Status Page", "Blog"].map(
                  (item) => (
                    <span
                      key={item}
                      className="text-sm text-trust-text-secondary hover:text-trust-text transition-colors cursor-pointer"
                    >
                      {item}
                    </span>
                  )
                )}
              </div>
            </div>
            <div>
              <h4 className="text-[13px] font-semibold text-trust-text uppercase tracking-wider mb-4">
                Legal
              </h4>
              <div className="flex flex-col gap-2.5">
                {["Privacy Policy", "Terms of Service", "Security Audit", "Contact"].map(
                  (item) => (
                    <span
                      key={item}
                      className="text-sm text-trust-text-secondary hover:text-trust-text transition-colors cursor-pointer"
                    >
                      {item}
                    </span>
                  )
                )}
              </div>
            </div>
          </div>
          <div className="pt-6 border-t border-[rgba(0,212,255,0.06)] flex flex-wrap items-center justify-between gap-4">
            <span className="font-mono-code text-xs text-trust-text-muted">
              &copy; 2025 TrustChain Protocol. All rights reserved.
            </span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-trust-text-muted">
                Built on Polygon PoS
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-trust-success animate-pulse" />
              <span className="text-xs text-trust-text-muted">
                All Systems Operational
              </span>
            </div>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
}

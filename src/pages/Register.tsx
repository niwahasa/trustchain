import { useState } from "react";
import { Link } from "react-router";
import { ShieldCheck, Eye, EyeOff, Loader2, Building2, User, Shield } from "lucide-react";
import { trpc } from "@/providers/trpc";
import { cn } from "@/lib/utils";

const roles = [
  { value: "individual", label: "Individual", icon: User, desc: "Personal document verification" },
  { value: "business", label: "Business", icon: Building2, desc: "Enterprise document management" },
  { value: "verifier", label: "Verifier", icon: Shield, desc: "Third-party verification" },
];

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<"individual" | "business" | "verifier">("individual");
  const [error, setError] = useState("");

  const registerMutation = trpc.localAuth.register.useMutation({
    onSuccess: (data) => {
      localStorage.setItem("auth_token", data.token);
      window.location.href = "/dashboard";
    },
    onError: (err) => {
      setError(err.message || "Registration failed");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!name || !email || !password) {
      setError("Please fill in all fields");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    registerMutation.mutate({ name, email, password, role });
  };

  return (
    <div className="min-h-screen bg-navy-deepest flex items-center justify-center px-4 py-12 grid-bg">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-6">
            <ShieldCheck className="w-7 h-7 text-cyan" />
            <span className="font-syne font-bold text-xl text-trust-text">
              TRUST<span className="text-cyan">CHAIN</span>
            </span>
          </Link>
          <h1 className="font-syne font-bold text-2xl text-trust-text mb-2">
            Create Account
          </h1>
          <p className="text-sm text-trust-text-secondary">
            Join the TrustChain Protocol
          </p>
        </div>

        <div className="glass-card p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-trust-text-secondary mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="input-trust w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-trust-text-secondary mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="input-trust w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-trust-text-secondary mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  className="input-trust w-full pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-trust-text-muted hover:text-trust-text transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-trust-text-secondary mb-2">
                Account Type
              </label>
              <div className="grid grid-cols-3 gap-2">
                {roles.map((r) => {
                  const Icon = r.icon;
                  return (
                    <button
                      key={r.value}
                      type="button"
                      onClick={() => setRole(r.value as typeof role)}
                      className={cn(
                        "flex flex-col items-center gap-2 p-3 rounded-lg border text-center transition-all duration-200",
                        role === r.value
                          ? "border-cyan bg-[rgba(0,212,255,0.08)]"
                          : "border-[rgba(0,212,255,0.08)] hover:border-[rgba(0,212,255,0.2)]"
                      )}
                    >
                      <Icon
                        className={cn(
                          "w-5 h-5",
                          role === r.value ? "text-cyan" : "text-trust-text-muted"
                        )}
                      />
                      <span
                        className={cn(
                          "text-xs font-medium",
                          role === r.value
                            ? "text-cyan"
                            : "text-trust-text-secondary"
                        )}
                      >
                        {r.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {error && (
              <p className="text-sm text-trust-danger bg-[rgba(255,64,96,0.1)] border border-[rgba(255,64,96,0.2)] rounded-lg px-4 py-2.5">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={registerMutation.isPending}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {registerMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating Account...
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-[rgba(0,212,255,0.08)] text-center">
            <p className="text-sm text-trust-text-secondary">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-cyan hover:underline font-medium"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState } from "react";
import { Link } from "react-router";
import { ShieldCheck, Eye, EyeOff, Loader2 } from "lucide-react";
import { trpc } from "@/providers/trpc";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const loginMutation = trpc.localAuth.login.useMutation({
    onSuccess: (data) => {
      localStorage.setItem("auth_token", data.token);
      window.location.href = "/dashboard";
    },
    onError: (err) => {
      setError(err.message || "Invalid credentials");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }
    loginMutation.mutate({ email, password });
  };

  return (
    <div className="min-h-screen bg-navy-deepest flex items-center justify-center px-4 grid-bg">
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="text-center mb-10">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-6">
            <ShieldCheck className="w-7 h-7 text-cyan" />
            <span className="font-syne font-bold text-xl text-trust-text">
              TRUST<span className="text-cyan">CHAIN</span>
            </span>
          </Link>
          <h1 className="font-syne font-bold text-2xl text-trust-text mb-2">
            Welcome Back
          </h1>
          <p className="text-sm text-trust-text-secondary">
            Sign in to your TrustChain account
          </p>
        </div>

        {/* Card */}
        <div className="glass-card p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
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
                  placeholder="Enter your password"
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

            {error && (
              <p className="text-sm text-trust-danger bg-[rgba(255,64,96,0.1)] border border-[rgba(255,64,96,0.2)] rounded-lg px-4 py-2.5">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loginMutation.isPending}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {loginMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-[rgba(0,212,255,0.08)] text-center">
            <p className="text-sm text-trust-text-secondary">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="text-cyan hover:underline font-medium"
              >
                Create Account
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center mt-6 text-xs text-trust-text-muted">
          Secured by TrustChain Protocol. Immutable. Verifiable. Forever.
        </p>
      </div>
    </div>
  );
}

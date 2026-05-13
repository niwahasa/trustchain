import { Link } from "react-router";
import { ShieldCheck, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-navy-deepest flex items-center justify-center px-4">
      <div className="text-center">
        <ShieldCheck className="w-16 h-16 text-cyan/20 mx-auto mb-6" />
        <h1 className="font-syne font-extrabold text-7xl text-cyan mb-4">404</h1>
        <h2 className="font-syne font-bold text-xl text-trust-text mb-3">
          Page Not Found
        </h2>
        <p className="text-sm text-trust-text-secondary mb-8 max-w-sm mx-auto">
          The page you're looking for doesn't exist or has been moved to a new
          location.
        </p>
        <Link
          to="/"
          className="btn-primary inline-flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
      </div>
    </div>
  );
}

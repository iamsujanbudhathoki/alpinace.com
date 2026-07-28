"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/lib/admin-auth-context";
import { Mountain, Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function AdminLoginPage() {
  const { login } = useAdminAuth();
  const router = useRouter();

  const [email, setEmail] = useState("admin@alpineace.com");
  const [password, setPassword] = useState("alpineace2026");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setIsSubmitting(true);

    try {
      const success = await login(email, password);
      if (success) {
        router.replace("/admin");
      } else {
        setErrorMsg("Invalid email or password");
      }
    } catch {
      setErrorMsg("Unable to sign in. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-sm space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-amber-400 flex items-center justify-center font-bold">
              <Mountain className="w-5 h-5" />
            </div>
          </Link>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Sign in to AlpineAce Admin
          </h1>
        </div>

        {/* Login Form Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-lg bg-red-50 text-red-700 text-xs font-medium">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="space-y-1">
              <label className="block text-slate-700 font-semibold">Email</label>
              <Input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@alpineace.com"
                className="text-xs bg-slate-50/50 border-slate-200 focus:bg-white"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-slate-700 font-semibold">Password</label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pr-9 text-xs bg-slate-50/50 border-slate-200 focus:bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs h-9 rounded-lg"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Signing in...
                </span>
              ) : (
                "Sign in"
              )}
            </Button>
          </form>
        </div>

        <div className="text-center">
          <Link href="/" className="text-xs text-slate-500 hover:text-slate-900 transition-colors">
            ← Back to website
          </Link>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/lib/admin-auth-context";
import {
  Mountain,
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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
        setErrorMsg("Invalid credentials. Please enter a valid email and password.");
      }
    } catch (err) {
      setErrorMsg("An unexpected login error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const fillDemoCredentials = () => {
    setEmail("admin@alpineace.com");
    setPassword("alpineace2026");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />

      <div className="w-full max-w-md space-y-6 relative z-10">
        {/* Brand Logo Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-slate-900 text-amber-400 shadow-lg border border-slate-800">
            <Mountain className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Alpine<span className="text-amber-600">Ace</span> Admin
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
              Expedition Command & Agency Management Portal
            </p>
          </div>
        </div>

        {/* Login Form Card */}
        <Card className="bg-white border-slate-200 shadow-xl rounded-2xl overflow-hidden p-2 sm:p-4">
          <CardHeader className="space-y-1 pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-bold text-slate-900">Staff Portal Access</CardTitle>
              <Badge variant="outline" className="text-[10px] bg-amber-50 text-amber-700 border-amber-200 font-semibold">
                Protected Route
              </Badge>
            </div>
            <CardDescription className="text-xs text-slate-500 font-medium">
              Enter your authorized staff email and security key below.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="block text-slate-700 font-bold">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <Input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@alpineace.com"
                    className="pl-9 text-xs bg-slate-50 border-slate-200 focus:bg-white h-10"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-slate-700 font-bold">Password</label>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pl-9 pr-9 text-xs bg-slate-50 border-slate-200 focus:bg-white h-10"
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
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs h-10 rounded-xl shadow-xs transition-all mt-2"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                    Authenticating Session...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-1.5">
                    Sign In to Dashboard
                    <ArrowRight className="w-4 h-4 text-amber-400" />
                  </span>
                )}
              </Button>
            </form>

            {/* Quick Demo Credentials Assistant */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
              <div className="text-[11px] text-slate-500 font-medium">
                Testing Demo Account:
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={fillDemoCredentials}
                className="text-[11px] h-7 font-bold text-amber-700 bg-amber-50 border-amber-200 hover:bg-amber-100 flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3 text-amber-600" />
                <span>Auto-fill Demo Pass</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Security Footer Info */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>256-bit Encrypted Staff Auth • NMA Compliant</span>
          </div>
          <div>
            <Link href="/" className="text-xs text-slate-600 hover:text-slate-900 underline font-semibold">
              ← Return to live public website
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAdminAuth } from "@/lib/admin-auth-context";
import { Mountain, Eye, EyeOff, Loader2, AlertCircle, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required.")
    .email("Please enter a valid email address."),
  password: z
    .string()
    .min(1, "Password is required.")
    .min(6, "Password must be at least 6 characters."),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function AdminLoginPage() {
  const { login } = useAdminAuth();
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setErrorMsg("");
    setIsSubmitting(true);

    try {
      const success = await login(values.email, values.password);
      if (success) {
        router.replace("/admin");
      }
    } catch (err: any) {
      setErrorMsg(err?.message || "Authentication failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLockoutError =
    errorMsg.toLowerCase().includes("locked") ||
    errorMsg.toLowerCase().includes("too many failed") ||
    errorMsg.toLowerCase().includes("disabled");

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-sm space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-amber-400 flex items-center justify-center font-bold shadow-xs">
              <Mountain className="w-5 h-5" />
            </div>
          </Link>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight font-heading">
            Sign in to AlpineAce Admin
          </h1>
          <p className="text-xs text-slate-500">Authorized personnel access only</p>
        </div>

        {/* Login Form Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          {errorMsg && (
            <div
              className={`p-3.5 rounded-xl text-xs font-semibold flex items-start gap-2.5 shadow-2xs leading-relaxed ${
                isLockoutError
                  ? "bg-amber-500/10 border border-amber-500/30 text-amber-950"
                  : "bg-rose-50 border border-rose-200/90 text-rose-800"
              }`}
            >
              {isLockoutError ? (
                <ShieldAlert className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
              )}
              <div className="flex-1">
                {isLockoutError && (
                  <p className="font-bold text-amber-900 text-[11px] uppercase tracking-wider mb-0.5">
                    Security Lockout Notice
                  </p>
                )}
                <span>{errorMsg}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4 text-xs">
            {/* Email Field */}
            <div className="space-y-1">
              <label className="block text-slate-700 font-bold">Email Address</label>
              <Input
                type="email"
                disabled={isSubmitting}
                {...register("email")}
                className={`text-xs bg-slate-50/50 text-slate-900 font-medium transition-all focus:bg-white ${
                  errors.email
                    ? "border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 bg-rose-50/30"
                    : "border-slate-200 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                }`}
              />
              {errors.email && (
                <p className="text-[11px] font-semibold text-rose-600 flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>{errors.email.message}</span>
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-1">
              <label className="block text-slate-700 font-bold">Password</label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  disabled={isSubmitting}
                  {...register("password")}
                  placeholder="••••••••"
                  className={`pr-9 text-xs bg-slate-50/50 text-slate-900 font-medium transition-all focus:bg-white ${
                    errors.password
                      ? "border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 bg-rose-50/30"
                      : "border-slate-200 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-[11px] font-semibold text-rose-600 flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>{errors.password.message}</span>
                </p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs h-10 rounded-xl cursor-pointer transition-colors shadow-xs"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                  Authenticating...
                </span>
              ) : (
                "Sign in"
              )}
            </Button>
          </form>
        </div>

        <div className="text-center">
          <Link href="/" className="text-xs font-bold text-slate-700 hover:text-slate-950 transition-colors">
            ← Back to website
          </Link>
        </div>
      </div>
    </div>
  );
}

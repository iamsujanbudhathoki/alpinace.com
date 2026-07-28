"use client";

import Link from "next/link";
import { Hero } from "@/components/marketing/sections/hero";
import {
  Compass,
  Footprints,
  Mountain,
  ShieldCheck,
  Award,
  HeartHandshake,
  Clock,
  ArrowRight,
} from "lucide-react";
import { initialTreksData } from "@/lib/trek-data";

export default function Home() {
  return (
    <div className="bg-[#fafaf9] text-slate-900">
      {/* Video Hero */}
      <Hero />


   
    </div>
  );
}

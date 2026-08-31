import { CheckCircle2 } from "lucide-react";
import Link from "next/link";

const reasons = [
  "20+ years of experience",
  "10,000+ travelers served annually",
  "100% locally owned, based in Kathmandu",
  "No hidden charges",
  "Custom trips for every budget",
  "Certified guides, safety-first approach",
  "Responsible, community-focused travel",
];

export function WhyChooseUs() {
  return (
    <section className="py-16 bg-white border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

          {/* Left */}
          <div className="space-y-4">
            <h2 className="font-heading text-2xl sm:text-3xl font-bold text-stone-900">
              Why travel with us
            </h2>
            <p className="text-stone-500 text-sm leading-relaxed max-w-sm">
              A family-run trekking company from Thamel, Kathmandu — honest, experienced, and genuinely passionate about the mountains.
            </p>
            <Link
              href="/about"
              className="inline-block text-xs font-semibold text-amber-800 hover:underline underline-offset-4 mt-2"
            >
              More about us →
            </Link>
          </div>

          {/* Right — clean list */}
          <ul className="space-y-0 divide-y divide-stone-100">
            {reasons.map((reason, i) => (
              <li key={i} className="flex items-center gap-3 py-3">
                <CheckCircle2 className="w-4 h-4 text-amber-800 shrink-0" />
                <span className="text-sm text-stone-700">{reason}</span>
              </li>
            ))}
          </ul>

        </div>
      </div>
    </section>
  );
}

import Metadata from "next";
import Link from "next/link";
import { ShieldCheck, ArrowLeft, Lock, FileText, Eye } from "lucide-react";

export const metadata = {
  title: "Privacy Policy | Alpine Ace",
  description: "Privacy policy and data protection guidelines for Alpine Ace Treks & Expeditions.",
};

export default function PrivacyPage() {
  return (
    <div className="pt-24 min-h-screen bg-stone-50 pb-20 font-sans">
      {/* Header Banner */}
      <section className="py-16 bg-slate-950 text-white relative overflow-hidden">
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-3">
          <span className="text-amber-400 text-sm font-medium block">Legal &amp; Compliance</span>
          <h1 className="font-heading text-3xl sm:text-5xl font-bold tracking-tight text-white">
            Privacy Policy
          </h1>
          <p className="text-slate-300 text-sm max-w-xl mx-auto font-light leading-relaxed">
            How Alpine Ace Treks &amp; Expeditions collects, uses, and safeguards your personal data during trip planning and high-altitude operations.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <main className="py-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="bg-white p-8 sm:p-12 rounded-3xl border border-stone-200 space-y-8 text-zinc-700 text-sm leading-relaxed font-normal">
          
          <div className="border-b border-stone-100 pb-6 flex items-center justify-between">
            <div>
              <p className="text-xs text-zinc-500 font-medium">Last Updated: August 2026</p>
              <p className="text-xs text-zinc-500 font-medium">Effective Date: Immediate</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-amber-800 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200">
              <ShieldCheck className="h-4 w-4 text-amber-600" />
              <span>Data Protection Guarantee</span>
            </div>
          </div>

          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="font-heading text-lg font-bold text-zinc-900 flex items-center gap-2">
              <Lock className="h-4 w-4 text-amber-700" />
              1. Our Commitment to Your Privacy
            </h2>
            <p>
              Alpine Ace Treks &amp; Expeditions (&ldquo;Alpine Ace&rdquo;, &ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;) respects your privacy and is dedicated to protecting the personal information you share with us. This Privacy Policy details how we gather, utilize, disclose, and guard your personal details when you access our website, make inquiries, or book high-altitude treks, cultural tours, and peak climbing expeditions in Nepal.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="font-heading text-lg font-bold text-zinc-900 flex items-center gap-2">
              <Eye className="h-4 w-4 text-amber-700" />
              2. Information We Collect
            </h2>
            <p>
              To process expedition permits, arrange domestic aviation/helicopter shuttles, and reserve high-altitude lodges, we collect personal details provided directly by you during inquiry or booking:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-zinc-700">
              <li><strong>Personal Identifiers:</strong> Full legal name, date of birth, passport number, nationality, and gender.</li>
              <li><strong>Contact Information:</strong> Email address, telephone/WhatsApp number, physical residential address.</li>
              <li><strong>Expedition &amp; Medical Details:</strong> Dietary preferences, physical fitness background, previous high-altitude experience, pre-existing medical conditions, emergency contact details, and travel insurance policy numbers (including high-altitude rescue coverage).</li>
              <li><strong>Payment Data:</strong> Transaction references and billing addresses processed securely via certified banking partners.</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="font-heading text-lg font-bold text-zinc-900 flex items-center gap-2">
              <FileText className="h-4 w-4 text-amber-700" />
              3. How We Use Your Information
            </h2>
            <p>
              We utilize your information exclusively for legitimate travel operations and safety compliance:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-zinc-700">
              <li>Procuring official trek permits from the Nepal Tourism Board (NTB) and Department of Immigration.</li>
              <li>Securing National Park and Conservation Area permits (e.g., Sagarmatha, Annapurna, Manaslu).</li>
              <li>Coordinating emergency medical evacuation, helicopter standby services, and rescue readiness.</li>
              <li>Reserving specialized teahouses, mountain lodges, and domestic flights (Kathmandu to Lukla/Pokhara).</li>
              <li>Communicating pre-trip itineraries, packing guidelines, and weather safety briefings.</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="font-heading text-lg font-bold text-zinc-900">
              4. Information Sharing &amp; Third Parties
            </h2>
            <p>
              We never sell, rent, or trade your personal data to third parties. We share data strictly on a need-to-know basis with:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-zinc-700">
              <li><strong>Government Authorities:</strong> Government offices of Nepal, National Park checkpoints, and Climbing Associations (NMA/TAAN) for legal permit issuance.</li>
              <li><strong>Rescue Operators:</strong> Certified helicopter evacuation and high-altitude medical services in emergency situations.</li>
              <li><strong>Local Lead Guides:</strong> Certified IFMGA/NMA Sherpa guide leaders responsible for your safety on the trail.</li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="font-heading text-lg font-bold text-zinc-900">
              5. Data Security &amp; Storage
            </h2>
            <p>
              We implement industry-standard encryption, strict access controls, and secure server architecture to safeguard your personal data from unauthorized access, alteration, or disclosure. Personal information is retained only for the period necessary to fulfill legal, operational, and accounting obligations.
            </p>
          </section>

          {/* Section 6 */}
          <section className="space-y-3">
            <h2 className="font-heading text-lg font-bold text-zinc-900">
              6. Your Legal Rights
            </h2>
            <p>
              You maintain the right to access, update, or request the deletion of your personal data stored in our systems at any time. To exercise these rights or inquire about data practices, contact our Data Concierge Desk.
            </p>
          </section>

          {/* Section 7 */}
          <div className="pt-6 border-t border-stone-100 space-y-2 bg-stone-50 p-6 rounded-2xl">
            <h3 className="font-heading text-base font-bold text-zinc-900">Contact Concierge Legal Desk</h3>
            <p className="text-xs text-zinc-600">
              Alpine Ace Treks &amp; Expeditions Pvt. Ltd.<br />
              Tridevi Marg, Thamel, Kathmandu 44600, Nepal<br />
              Email: <a href="mailto:concierge@alpineacetreks.com" className="text-amber-800 font-semibold underline">concierge@alpineacetreks.com</a><br />
              Phone: +977 1 4410988
            </p>
          </div>

        </div>

        <div className="flex justify-between items-center text-xs font-semibold text-zinc-700">
          <Link href="/" className="flex items-center gap-1 hover:text-amber-800 transition-colors">
            <ArrowLeft className="h-4 w-4" />
            <span>Return to Home</span>
          </Link>
          <Link href="/terms" className="hover:text-amber-800 transition-colors">
            Terms &amp; Conditions &rarr;
          </Link>
        </div>
      </main>
    </div>
  );
}

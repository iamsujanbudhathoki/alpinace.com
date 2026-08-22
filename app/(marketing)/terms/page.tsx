import Metadata from "next";
import Link from "next/link";
import { ShieldAlert, ArrowLeft, FileText, CheckCircle2, AlertTriangle } from "lucide-react";

export const metadata = {
  title: "Terms & Conditions | Alpine Ace",
  description: "Terms and conditions, booking policies, and expedition agreements for Alpine Ace Treks & Expeditions.",
};

export default function TermsPage() {
  return (
    <div className="pt-24 min-h-screen bg-stone-50 pb-20 font-sans">
      {/* Header Banner */}
      <section className="py-16 bg-slate-950 text-white relative overflow-hidden">
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-3">
          <span className="text-amber-400 text-sm font-medium block">Expedition Agreement</span>
          <h1 className="font-heading text-3xl sm:text-5xl font-bold tracking-tight text-white">
            Terms &amp; Conditions
          </h1>
          <p className="text-slate-300 text-sm max-w-xl mx-auto font-light leading-relaxed">
            Please review our booking policies, high-altitude safety agreements, and cancellation terms prior to reserving your trip with Alpine Ace.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <main className="py-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="bg-white p-6 sm:p-10 rounded-xl border border-stone-200 space-y-8 text-zinc-700 text-sm leading-relaxed font-normal">
          
          <div className="border-b border-stone-100 pb-6 flex items-center justify-between">
            <div>
              <p className="text-xs text-zinc-500 font-medium">Last Updated: August 2026</p>
              <p className="text-xs text-zinc-500 font-medium">Applicability: All Treks, Tours &amp; Expeditions</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-amber-800 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200">
              <FileText className="h-4 w-4 text-amber-600" />
              <span>Official Contract</span>
            </div>
          </div>

          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="font-heading text-lg font-bold text-zinc-900 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-amber-700" />
              1. Booking &amp; Contract Agreement
            </h2>
            <p>
              By submitting a trip deposit or booking confirmation with Alpine Ace Treks &amp; Expeditions Pvt. Ltd. (&ldquo;Alpine Ace&rdquo;), you acknowledge that you have read, understood, and agreed to be legally bound by these Terms &amp; Conditions. All bookings become active upon receipt of your initial deposit and official booking confirmation email from our Kathmandu concierge.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="font-heading text-lg font-bold text-zinc-900">
              2. Deposit &amp; Payment Schedule
            </h2>
            <ul className="list-disc pl-5 space-y-2 text-zinc-700">
              <li><strong>Initial Booking Deposit:</strong> A non-refundable 25% deposit per person is required to confirm your reservation and secure permit processing, domestic flight seats, and lodge reservations.</li>
              <li><strong>Final Balance Payment:</strong> The remaining 75% balance must be settled in full at least 14 days prior to your trip start date in Kathmandu or upon arrival during your pre-trip briefing in USD cash or Bank Transfer.</li>
              <li><strong>Peak Expeditions:</strong> Major peak climbing expeditions (e.g., Ama Dablam, Everest) require a 40% deposit due to advance non-refundable royalty payments to the Nepal Ministry of Culture, Tourism and Civil Aviation.</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="font-heading text-lg font-bold text-zinc-900 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-700" />
              3. Cancellation &amp; Refund Policy
            </h2>
            <p>
              Cancellations must be submitted in writing to <a href="mailto:concierge@alpineacetreks.com" className="text-amber-800 font-semibold underline">concierge@alpineacetreks.com</a>. Refund percentages depend on the timing of written notice prior to departure:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-zinc-700">
              <li><strong>30+ days prior to departure:</strong> Deposit retained as travel credit valid for 24 months; remaining funds refunded.</li>
              <li><strong>15 to 29 days prior to departure:</strong> 50% of total trip cost is non-refundable.</li>
              <li><strong>Less than 14 days prior to departure:</strong> 100% of total trip cost is non-refundable due to pre-committed guide logistics, permits, and lodge allocations.</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="font-heading text-lg font-bold text-zinc-900 flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-amber-700" />
              4. Mandatory Travel &amp; High-Altitude Rescue Insurance
            </h2>
            <p>
              Comprehensive travel insurance is strictly <strong>MANDATORY</strong> for all participants on treks and expeditions operating above 3,000 meters altitude in Nepal.
            </p>
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl text-xs text-amber-900 leading-relaxed font-medium">
              Your insurance policy MUST explicitly cover high-altitude trekking/mountaineering up to your maximum planned altitude (e.g., 5,500m+ for Everest Base Camp / Kalapatthar) AND emergency helicopter search, rescue, and medical evacuation. Policy details must be provided during pre-trip briefing.
            </div>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="font-heading text-lg font-bold text-zinc-900">
              5. High-Altitude Risk &amp; Personal Health
            </h2>
            <p>
              Himalayan trekking and high-altitude mountaineering involve inherent risks, including Acute Mountain Sickness (AMS), extreme weather fluctuations, landslides, flight delays (e.g., Lukla weather closures), and physical exertion. Participants are responsible for ensuring physical fitness readiness and disclosing all pre-existing medical conditions prior to departure.
            </p>
          </section>

          {/* Section 6 */}
          <section className="space-y-3">
            <h2 className="font-heading text-lg font-bold text-zinc-900">
              6. Sherpa Guide Authority &amp; Route Flexibility
            </h2>
            <p>
              Your safety is our highest priority. The designated Expedition Director or IFMGA/NMA Senior Lead Sherpa Guide holds full authority to modify day-to-day itineraries, turn back participants, or alter acclimatization schedules if weather conditions, altitude sickness, or natural events endanger group safety. No refunds will be issued for itinerary adjustments dictated by safety considerations.
            </p>
          </section>

          {/* Section 7 */}
          <section className="space-y-3">
            <h2 className="font-heading text-lg font-bold text-zinc-900">
              7. Passports, Visas &amp; Documentation
            </h2>
            <p>
              Participants must hold a valid passport with at least six (6) months validity beyond the intended date of departure from Nepal. Obtaining a entry visa for Nepal (available on arrival or online via immigration.gov.np) is the sole responsibility of the traveler.
            </p>
          </section>

          {/* Section 8 */}
          <section className="space-y-3">
            <h2 className="font-heading text-lg font-bold text-zinc-900">
              8. Governing Law &amp; Jurisdiction
            </h2>
            <p>
              This agreement is governed by and construed in accordance with the laws of Nepal. Any legal disputes or claims arising out of trip operations shall be subject to the exclusive jurisdiction of the courts of Kathmandu, Nepal.
            </p>
          </section>

          {/* Contact Footer */}
          <div className="pt-6 border-t border-stone-100 space-y-2 bg-stone-50 p-6 rounded-2xl">
            <h3 className="font-heading text-base font-bold text-zinc-900">Questions Regarding Terms?</h3>
            <p className="text-xs text-zinc-600">
              Contact our Operations Office in Kathmandu:<br />
              Alpine Ace Treks &amp; Expeditions Pvt. Ltd.<br />
              Tridevi Marg, Thamel, Kathmandu, Nepal<br />
              Email: <a href="mailto:concierge@alpineacetreks.com" className="text-amber-800 font-semibold underline">concierge@alpineacetreks.com</a>
            </p>
          </div>

        </div>

        <div className="flex justify-between items-center text-xs font-semibold text-zinc-700">
          <Link href="/privacy" className="flex items-center gap-1 hover:text-amber-800 transition-colors">
            <ArrowLeft className="h-4 w-4" />
            <span>Privacy Policy</span>
          </Link>
          <Link href="/contact" className="hover:text-amber-800 transition-colors">
            Contact Concierge &rarr;
          </Link>
        </div>
      </main>
    </div>
  );
}

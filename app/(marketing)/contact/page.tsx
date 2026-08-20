"use client";

import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle, Clock } from 'lucide-react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { InquiryService } from '@/lib/services/admin-service';
import { useSettings } from '@/lib/settings-context';
import { FormLabel } from '@/components/ui/form-label';
import { cn } from '@/lib/utils';
import { COUNTRY_OPTIONS } from '@/lib/country-list';

const contactSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(1, 'Full name is required'),
  email: z
    .string()
    .trim()
    .min(1, 'Email address is required')
    .email('Please enter a valid email address'),
  phone: z.string().trim().min(1, 'Phone or WhatsApp number is required'),
  country: z.string().optional(),
  destination: z.string().optional(),
  travelers: z.string().optional(),
  message: z
    .string()
    .trim()
    .min(1, 'Question or query message is required'),
});

type ContactFormData = z.infer<typeof contactSchema>;

export default function ContactView() {
  const { settings } = useSettings();
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      country: '',
      destination: 'Everest Region (Khumbu)',
      travelers: '2',
      message: '',
    },
  });

  const onSubmit = async (data: ContactFormData) => {
    try {
      const res = await InquiryService.create({
        guestName: data.fullName,
        email: data.email,
        phone: data.phone,
        country: data.country || 'N/A',
        interestedTrip: data.destination || 'General Inquiry',
        travelDates: 'Flexible',
        groupSize: Number(data.travelers) || 1,
        message: data.message,
      });

      if (res?.success !== false) {
        setSubmitted(true);
        reset();
        toast.success("Your inquiry has been submitted! Our team will reach out shortly.");
      } else {
        toast.error(res.message || "Failed to submit inquiry. Please try again.");
      }
    } catch (err: any) {
      console.error("Failed to submit inquiry:", err);
      toast.error(err.message || "Failed to submit inquiry. Please try again or message via WhatsApp.");
    }
  };

  return (
    <div className="pt-28 pb-20 min-h-screen bg-stone-50 text-zinc-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Editorial Title */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-amber-800 text-sm font-medium block">
            Get in Touch
          </span>
          <h1 className="font-heading text-3xl sm:text-5xl font-bold tracking-tight text-zinc-900">
            Plan Your Journey
          </h1>
          <p className="text-zinc-600 text-sm max-w-2xl mx-auto font-normal leading-relaxed">
            Reach out to our local team in Kathmandu to secure permits, reserve lodges, or craft your custom Himalayan itinerary.
          </p>
        </div>

        {/* Contact Info Header Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Panel: Direct Concierge & Operations Contact Details */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs space-y-6">
              <div className="space-y-2">
                <span className="text-xs font-bold text-amber-800 uppercase tracking-wider block">
                  Direct Line &amp; Desk
                </span>
                <h3 className="font-heading text-xl font-bold text-zinc-900">
                  Alpine Ace Concierge
                </h3>
                <p className="text-zinc-600 text-xs font-light leading-relaxed">
                  Connect directly with our Kathmandu headquarters for expedition planning and instant travel advice.
                </p>
              </div>

              <ul className="space-y-4 pt-2 border-t border-stone-100">
                {settings.companyAddress && (
                  <li className="flex items-start gap-3.5 text-xs text-zinc-700">
                    <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-800 flex items-center justify-center shrink-0 border border-amber-200/60">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold block text-zinc-900">Headquarters</span>
                      <span className="font-light text-zinc-600 leading-relaxed">{settings.companyAddress}</span>
                    </div>
                  </li>
                )}

                {settings.contactPhone && (
                  <li className="flex items-start gap-3.5 text-xs text-zinc-700">
                    <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-800 flex items-center justify-center shrink-0 border border-amber-200/60">
                      <Phone className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold block text-zinc-900">Phone &amp; WhatsApp Desk</span>
                      <a href={`tel:${settings.contactPhone}`} className="font-medium text-amber-800 hover:underline">
                        {settings.contactPhone}
                      </a>
                    </div>
                  </li>
                )}

                {settings.contactEmail && (
                  <li className="flex items-start gap-3.5 text-xs text-zinc-700">
                    <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-800 flex items-center justify-center shrink-0 border border-amber-200/60">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold block text-zinc-900">Email Inquiry Desk</span>
                      <a href={`mailto:${settings.contactEmail}`} className="font-medium text-amber-800 hover:underline">
                        {settings.contactEmail}
                      </a>
                    </div>
                  </li>
                )}
              </ul>
            </div>

            {/* Interactive Google Map */}
            {(settings.googleMapsUrl || settings.companyAddress) && (
              <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between px-1">
                  <h3 className="font-heading text-sm font-semibold text-zinc-900">Find Our Office</h3>
                  {settings.googleMapsUrl && (
                    <a
                      href={settings.googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-medium text-amber-700 hover:text-amber-800 transition-colors flex items-center gap-1"
                    >
                      <span>Open in Google Maps</span>
                      <span>&rarr;</span>
                    </a>
                  )}
                </div>
                <div className="relative h-64 rounded-xl overflow-hidden border border-stone-200">
                  <iframe
                    src={
                      settings.googleMapsUrl?.includes("embed")
                        ? settings.googleMapsUrl
                        : `https://maps.google.com/maps?q=${encodeURIComponent(
                            settings.companyAddress || settings.googleMapsUrl || ""
                          )}&t=&z=15&ie=UTF8&iwloc=&output=embed`
                    }
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="strict-origin-when-cross-origin"
                    title={`${settings.siteName} Location Map`}
                    className="w-full h-full"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Right Panel: Contact Inquiry Form */}
          <div className="lg:col-span-7 bg-white p-8 sm:p-10 rounded-3xl border border-stone-200 shadow-xs">
            
            {submitted ? (
              <div className="py-12 text-center space-y-6 max-w-lg mx-auto animate-fade-in">
                <div className="bg-emerald-50 text-emerald-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto border border-emerald-200 shadow-xs">
                  <CheckCircle className="h-8 w-8 text-emerald-600" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-heading text-xl font-bold text-zinc-900">Inquiry Sent Successfully</h3>
                  <p className="text-zinc-600 text-sm leading-relaxed font-normal">
                    Thank you. Your bespoke adventure inquiry has been received by our Senior Destination Planner team.
                  </p>
                </div>
                <div className="bg-stone-50 border border-stone-200 p-4 rounded-xl text-xs text-zinc-700 leading-normal font-medium">
                  Want immediate assistance? Tap the bottom-right <strong className="text-zinc-950">WhatsApp</strong> button to speak directly with an active operations specialist.
                </div>
                <button
                  onClick={() => setSubmitted(false)}
                  className="bg-amber-800 hover:bg-amber-900 text-white font-semibold text-xs px-5 py-2.5 rounded-xl transition-colors cursor-pointer"
                >
                  Send another inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
                <div className="space-y-2">
                  <h2 className="font-heading text-2xl font-bold text-zinc-900">Plan Your Journey</h2>
                  <p className="text-zinc-600 text-xs font-light leading-relaxed">
                    Provide your tentative dates, travelers count, and desired goals, and we will formulate a personalized expedition draft.
                  </p>
                </div>

                {/* Form fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <FormLabel required>Full Name</FormLabel>
                    <input
                      type="text"
                      placeholder="e.g. Alexander Wright"
                      {...register("fullName")}
                      className={cn(
                        "w-full bg-stone-50/80 border text-xs rounded-xl px-4 py-3 focus:outline-none transition-colors font-medium",
                        errors.fullName
                          ? "border-rose-400 focus:border-rose-500 bg-rose-50/20 text-rose-950"
                          : "border-stone-200 focus:border-amber-700 bg-white"
                      )}
                    />
                    {errors.fullName && (
                      <p className="text-[11px] font-semibold text-rose-600 mt-1">{errors.fullName.message}</p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <FormLabel required>Email Address</FormLabel>
                    <input
                      type="email"
                      placeholder="e.g. alexander@example.com"
                      {...register("email")}
                      className={cn(
                        "w-full bg-stone-50/80 border text-xs rounded-xl px-4 py-3 focus:outline-none transition-colors font-medium",
                        errors.email
                          ? "border-rose-400 focus:border-rose-500 bg-rose-50/20 text-rose-950"
                          : "border-stone-200 focus:border-amber-700 bg-white"
                      )}
                    />
                    {errors.email && (
                      <p className="text-[11px] font-semibold text-rose-600 mt-1">{errors.email.message}</p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <FormLabel required>Phone / WhatsApp Number</FormLabel>
                    <input
                      type="tel"
                      placeholder="e.g. +1 (555) 019-2834"
                      {...register("phone")}
                      className={cn(
                        "w-full bg-stone-50/80 border text-xs rounded-xl px-4 py-3 focus:outline-none transition-colors font-medium",
                        errors.phone
                          ? "border-rose-400 focus:border-rose-500 bg-rose-50/20 text-rose-950"
                          : "border-stone-200 focus:border-amber-700 bg-white"
                      )}
                    />
                    {errors.phone && (
                      <p className="text-[11px] font-semibold text-rose-600 mt-1">{errors.phone.message}</p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <FormLabel>
                      Country of Residence <span className="text-stone-400 font-normal">(Optional)</span>
                    </FormLabel>
                    <select
                      {...register("country")}
                      className="w-full bg-white border border-stone-200 text-xs rounded-xl px-4 py-3 focus:outline-none focus:border-amber-700 transition-colors cursor-pointer font-medium"
                    >
                      <option value="">Select Country...</option>
                      {COUNTRY_OPTIONS.map((c) => (
                        <option key={c.value} value={c.value}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <FormLabel>
                      Region of Interest <span className="text-stone-400 font-normal">(Optional)</span>
                    </FormLabel>
                    <select
                      {...register("destination")}
                      className="w-full bg-white border border-stone-200 text-xs rounded-xl px-4 py-3 focus:outline-none focus:border-amber-700 transition-colors cursor-pointer font-medium"
                    >
                      <option value="Everest Region (Khumbu)">Everest Region (Khumbu)</option>
                      <option value="Annapurna Region">Annapurna Region</option>
                      <option value="Kathmandu Valley & Culture">Kathmandu Valley & Culture</option>
                      <option value="Peak Climbing Expeditions">Peak Climbing Expeditions</option>
                      <option value="Other / Custom Wilderness">Other / Custom Wilderness</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <FormLabel>
                      Number of Travelers <span className="text-stone-400 font-normal">(Optional)</span>
                    </FormLabel>
                    <select
                      {...register("travelers")}
                      className="w-full bg-white border border-stone-200 text-xs rounded-xl px-4 py-3 focus:outline-none focus:border-amber-700 transition-colors cursor-pointer font-medium"
                    >
                      <option value="1">Solo Traveler</option>
                      <option value="2">2 Travelers (Couple/Friends)</option>
                      <option value="3">3 to 5 Travelers (Private Group)</option>
                      <option value="6">6+ Travelers</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <FormLabel required>Question or Inquiry Message</FormLabel>
                  <textarea
                    rows={4}
                    placeholder="Describe your desired altitude goals, physical preparation level, or questions..."
                    {...register("message")}
                    className={cn(
                      "w-full bg-stone-50/80 border text-xs rounded-xl px-4 py-3 focus:outline-none resize-none leading-relaxed transition-colors font-medium",
                      errors.message
                        ? "border-rose-400 focus:border-rose-500 bg-rose-50/20 text-rose-950"
                        : "border-stone-200 focus:border-amber-700 bg-white"
                    )}
                  />
                  {errors.message && (
                    <p className="text-[11px] font-semibold text-rose-600 mt-1">{errors.message.message}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-amber-800 hover:bg-amber-900 text-white font-heading text-sm font-semibold py-3.5 rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-[0.99]"
                >
                  <Send className="h-4 w-4 text-amber-300" />
                  <span>{isSubmitting ? 'Sending...' : 'Send Inquiry'}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

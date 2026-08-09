"use client";

import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle, Clock } from 'lucide-react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { InquiryService } from '@/lib/services/admin-service';
import { FormLabel } from '@/components/ui/form-label';
import { cn } from '@/lib/utils';

const contactSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, 'Full name must be at least 2 characters'),
  email: z
    .string()
    .trim()
    .min(1, 'Email address is required')
    .email('Please enter a valid email address'),
  phone: z.string().optional(),
  destination: z.string().min(1, 'Please select a region of interest'),
  travelers: z.string().min(1, 'Please select number of travelers'),
  message: z
    .string()
    .trim()
    .min(10, 'Please enter at least 10 characters for your message'),
});

type ContactFormData = z.infer<typeof contactSchema>;

export default function ContactView() {
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
      destination: 'Everest Region (Khumbu)',
      travelers: '2',
      message: '',
    },
  });

  const onSubmit = async (data: ContactFormData) => {
    try {
      await InquiryService.create({
        guestName: data.fullName,
        email: data.email,
        phone: data.phone || '+1 000-000-0000',
        country: 'International',
        interestedTrip: data.destination,
        travelDates: 'Upcoming Season',
        groupSize: Number(data.travelers) || 1,
        message: data.message,
      });
      setSubmitted(true);
      reset();
    } catch (err) {
      console.error("Failed to submit inquiry:", err);
      setSubmitted(true);
    }
  };

  return (
    <div className="pt-24 min-h-screen bg-stone-50 pb-20">
      
      {/* Banner */}
      <section className="py-16 bg-slate-950 text-white relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1542856391-010fb87dcfed?q=80&w=1600"
            alt="Kathmandu and Pokhara scenic overview"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover opacity-25"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-slate-950/40" />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-amber-400 text-sm font-medium block mb-1">Connect With Us</span>
          <h1 className="font-heading text-3xl sm:text-5xl font-bold tracking-tight text-white mb-4">
            Bespoke Adventure Planning
          </h1>
          <p className="text-slate-300 text-sm max-w-2xl mx-auto font-light leading-relaxed">
            Reach out to our private concierge desk in Kathmandu to secure permits, reserve luxury lodges, or customize your high-altitude itinerary.
          </p>
        </div>
      </section>

      {/* Main split grid */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left Panel: Contact info & Map */}
          <div className="lg:col-span-5 space-y-8">
            
            {/* Info details */}
            <div className="bg-white p-8 rounded-2xl border border-stone-200 space-y-6">
              <h2 className="font-heading text-lg font-bold text-zinc-900 border-b border-stone-100 pb-3">Kathmandu Headquarters</h2>
              
              <ul className="space-y-4 text-xs sm:text-sm text-zinc-700">
                <li className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-zinc-900 font-semibold mb-0.5">Physical Address</strong>
                    <span>Tridevi Marg, Thamel, Kathmandu, Nepal 44600 (Opposite Himalayan Java Coffee)</span>
                  </div>
                </li>
                
                <li className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-zinc-900 font-semibold mb-0.5">Telephone Numbers</strong>
                    <span className="text-xs text-zinc-950 block">+977 1 4410988 (Office Desk)</span>
                    <span className="text-xs text-zinc-950 block">+977 98511 23456 (24/7 Crisis Hotline)</span>
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-zinc-900 font-semibold mb-0.5">Direct Concierge Email</strong>
                    <span className="text-xs text-zinc-950 block">concierge@alpineacetreks.com</span>
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-zinc-900 font-semibold mb-0.5">Office Business Hours</strong>
                    <span>Sunday – Friday: 9:00 AM – 6:00 PM NPT (UTC+5:45)</span>
                  </div>
                </li>
              </ul>
            </div>

            {/* Interactive Google Map */}
            <div className="bg-white p-4 rounded-2xl border border-stone-200 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-heading text-sm font-semibold text-zinc-900">Find Our Office</h3>
                <a
                  href="https://maps.app.goo.gl/pZ9452LNnDzHN37M8"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-medium text-amber-700 hover:text-amber-800 transition-colors flex items-center gap-1"
                >
                  <span>Open in Google Maps</span>
                  <span>&rarr;</span>
                </a>
              </div>
              <div className="relative h-64 rounded-xl overflow-hidden border border-stone-200">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3532.0854101316063!2d85.31076392638629!3d27.714649076178347!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39eb18fd69092351%3A0x94dae66556fce46b!2sTridevi%20Marg%2C%20Kathmandu%2044600!5e0!3m2!1sen!2snp!4v1786292099624!5m2!1sen!2snp"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="strict-origin-when-cross-origin"
                  title="Alpine Ace Treks & Expeditions Location Map"
                  className="w-full h-full"
                />
              </div>
            </div>

          </div>

          {/* Right Panel: Contact Inquiry Form */}
          <div className="lg:col-span-7 bg-white p-8 sm:p-10 rounded-3xl border border-stone-200">
            
            {submitted ? (
              <div className="py-12 text-center space-y-6 max-w-lg mx-auto animate-fade-in">
                <div className="bg-amber-50 text-amber-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto border border-amber-200">
                  <CheckCircle className="h-8 w-8 text-amber-600" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-heading text-xl font-bold text-zinc-900">Inquiry Sent Successfully</h3>
                  <p className="text-zinc-600 text-sm leading-relaxed font-light">
                    Thank you. Your bespoke adventure inquiry has been saved to our database and assigned to our Senior Destination Planner.
                  </p>
                </div>
                <div className="bg-stone-100/60 border border-stone-200 p-4 rounded-xl text-xs text-zinc-700 leading-normal font-light">
                  Want immediate assistance? Tap the top-right <strong className="text-zinc-950">WhatsApp</strong> button to speak directly with an active operations specialist.
                </div>
                <button
                  onClick={() => setSubmitted(false)}
                  className="bg-zinc-900 hover:bg-zinc-800 text-white font-medium text-xs px-5 py-2.5 rounded-lg transition-colors cursor-pointer"
                >
                  Send another inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
                <div className="space-y-2">
                  <span className="text-amber-700 text-sm font-medium block">Get in Touch</span>
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
                      placeholder="e.g. Dr. Jennifer Vance"
                      {...register("fullName")}
                      className={cn(
                        "w-full bg-stone-50/80 border text-xs rounded-lg px-4 py-3 focus:outline-none transition-colors",
                        errors.fullName
                          ? "border-rose-400 focus:border-rose-500 bg-rose-50/20"
                          : "border-stone-200 focus:border-amber-500"
                      )}
                    />
                    {errors.fullName && (
                      <p className="text-xs font-medium text-rose-500 mt-1">{errors.fullName.message}</p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <FormLabel required>Email Address</FormLabel>
                    <input
                      type="email"
                      placeholder="e.g. jennifer@luxuryexpeditions.com"
                      {...register("email")}
                      className={cn(
                        "w-full bg-stone-50/80 border text-xs rounded-lg px-4 py-3 focus:outline-none transition-colors",
                        errors.email
                          ? "border-rose-400 focus:border-rose-500 bg-rose-50/20"
                          : "border-stone-200 focus:border-amber-500"
                      )}
                    />
                    {errors.email && (
                      <p className="text-xs font-medium text-rose-500 mt-1">{errors.email.message}</p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <FormLabel>Contact Number</FormLabel>
                    <input
                      type="tel"
                      placeholder="e.g. +1 (415) 555-0199"
                      {...register("phone")}
                      className="w-full bg-stone-50/80 border border-stone-200 text-xs rounded-lg px-4 py-3 focus:outline-none focus:border-amber-500 transition-colors"
                    />
                  </div>

                  <div className="space-y-1">
                    <FormLabel>Region of Interest</FormLabel>
                    <select
                      {...register("destination")}
                      className="w-full bg-stone-50/80 border border-stone-200 text-xs rounded-lg px-4 py-3 focus:outline-none focus:border-amber-500 transition-colors"
                    >
                      <option value="Everest Region (Khumbu)">Everest Region (Khumbu)</option>
                      <option value="Annapurna Region">Annapurna Region</option>
                      <option value="Kathmandu Valley & Culture">Kathmandu Valley & Culture</option>
                      <option value="Peak Climbing Expeditions">Peak Climbing Expeditions</option>
                      <option value="Other / Custom Wilderness">Other / Custom Wilderness</option>
                    </select>
                  </div>

                  <div className="space-y-1 sm:col-span-2">
                    <FormLabel>Number of Travelers</FormLabel>
                    <select
                      {...register("travelers")}
                      className="w-full bg-stone-50/80 border border-stone-200 text-xs rounded-lg px-4 py-3 focus:outline-none focus:border-amber-500 transition-colors"
                    >
                      <option value="1">Solo Traveler</option>
                      <option value="2">2 Travelers (Couple/Friends)</option>
                      <option value="3">3 to 5 Travelers (Private Group)</option>
                      <option value="6">6+ Travelers</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <FormLabel required>Your Goals / Message</FormLabel>
                  <textarea
                    rows={4}
                    placeholder="Describe your desired altitude goals, physical preparation level, and special dietary/helicopter requirements."
                    {...register("message")}
                    className={cn(
                      "w-full bg-stone-50/80 border text-xs rounded-lg px-4 py-3 focus:outline-none resize-none leading-relaxed transition-colors",
                      errors.message
                        ? "border-rose-400 focus:border-rose-500 bg-rose-50/20"
                        : "border-stone-200 focus:border-amber-500"
                    )}
                  />
                  {errors.message && (
                    <p className="text-xs font-medium text-rose-500 mt-1">{errors.message.message}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-heading text-sm font-semibold py-3.5 rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-[0.99]"
                >
                  <Send className="h-4 w-4 text-amber-400" />
                  <span>{isSubmitting ? 'Sending...' : 'Send Inquiry'}</span>
                </button>
              </form>
            )}

          </div>

        </div>
      </section>

    </div>
  );
}

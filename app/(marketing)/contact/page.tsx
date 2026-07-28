"use client";

import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle, Clock, Sparkles } from 'lucide-react';

export default function ContactView() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    destination: 'Everest Region',
    travelers: '2',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.fullName && formData.email) {
      setSubmitted(true);
      // Reset form
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        destination: 'Everest Region',
        travelers: '2',
        message: ''
      });
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
          <span className="text-gold-400 text-xs uppercase tracking-widest font-extrabold block mb-2">Connect With Us</span>
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
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
              <h2 className="font-heading text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">Kathmandu Headquarters</h2>
              
              <ul className="space-y-4 text-xs sm:text-sm text-slate-700">
                <li className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-gold-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-slate-900 font-semibold mb-0.5">Physical Address</strong>
                    <span>Tridevi Marg, Thamel, Kathmandu, Nepal 44600 (Opposite Himalayan Java Coffee)</span>
                  </div>
                </li>
                
                <li className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-gold-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-slate-900 font-semibold mb-0.5">Telephone Numbers</strong>
                    <span className="font-mono text-xs text-slate-950 block">+977 1 4410988 (Office Desk)</span>
                    <span className="font-mono text-xs text-slate-950 block">+977 98511 23456 (24/7 Crisis Hotline)</span>
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-gold-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-slate-900 font-semibold mb-0.5">Direct Concierge Email</strong>
                    <span className="font-mono text-xs text-slate-950 block">concierge@alpineacetreks.com</span>
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-gold-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-slate-900 font-semibold mb-0.5">Office Business Hours</strong>
                    <span>Sunday – Friday: 9:00 AM – 6:00 PM NPT (UTC+5:45)</span>
                  </div>
                </li>
              </ul>
            </div>

            {/* Google Map Placeholder (Beautiful illustrated map container) */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <span className="text-[10px] uppercase font-bold text-slate-500 font-mono tracking-wider block">Office Location Map</span>
              <div className="relative h-60 bg-slate-100 rounded-xl overflow-hidden border border-slate-200 flex flex-col justify-center items-center text-center px-6">
                
                {/* Styled background lines */}
                <div className="absolute inset-0 bg-[radial-gradient(#e1e1d8_1px,transparent_1px)] [background-size:16px_16px] opacity-60" />
                
                {/* Simulated streets */}
                <div className="absolute top-24 left-0 right-0 h-4 bg-white/80 border-y border-slate-200" />
                <div className="absolute left-1/3 top-0 bottom-0 w-4 bg-white/80 border-x border-slate-200" />
                
                {/* Marker */}
                <div className="relative z-10 flex flex-col items-center">
                  <div className="bg-slate-950 text-gold-400 p-2.5 rounded-full shadow-lg border border-gold-500 animate-bounce">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div className="bg-slate-950/90 text-white text-[11px] font-heading font-bold uppercase tracking-wider px-3 py-1.5 rounded shadow mt-2 border border-gold-500/20">
                    Tridevi Marg, Thamel
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono mt-1">Kathmandu, Nepal</span>
                </div>
              </div>
            </div>

          </div>

          {/* Right Panel: Contact Inquiry Form */}
          <div className="lg:col-span-7 bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-sm">
            
            {submitted ? (
              <div className="py-12 text-center space-y-6 max-w-lg mx-auto animate-fade-in">
                <div className="bg-gold-100 text-gold-700 w-16 h-16 rounded-full flex items-center justify-center mx-auto border border-gold-300">
                  <CheckCircle className="h-8 w-8 text-gold-600" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-heading text-xl font-bold text-slate-900">Inquiry Securely Dispatched</h3>
                  <p className="text-slate-600 text-sm leading-relaxed font-light">
                    Thank you. Your bespoke adventure inquiry has been assigned to our Senior Destination Planner, who will review flight grids, lodge allotments, and reach out via email within <strong className="text-slate-950">4 hours</strong>.
                  </p>
                </div>
                <div className="bg-slate-950/5 border border-slate-950/10 p-4 rounded-xl text-xs text-slate-700 leading-normal font-light">
                  <Sparkles className="h-4.5 w-4.5 text-gold-600 inline mr-1 mb-0.5 animate-spin-slow" />
                  Want immediate assistance? Tap the top-right <strong className="text-slate-950">WhatsApp</strong> button to speak directly with an active operations specialist.
                </div>
                <button
                  onClick={() => setSubmitted(false)}
                  className="bg-gold-500 hover:bg-gold-400 text-slate-950 border border-gold-400 text-xs font-bold uppercase tracking-wider px-6 py-3 rounded-lg shadow-xs hover:shadow-md transition-all cursor-pointer"
                >
                  Send another inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <span className="text-gold-600 text-xs uppercase tracking-widest font-extrabold block">Bespoke Inquiries</span>
                  <h2 className="font-heading text-2xl font-bold text-slate-900">Submit a Qualified Booking Request</h2>
                  <p className="text-slate-600 text-xs font-light leading-relaxed">
                    Provide your tentative dates, travelers count, and desired goals, and we will formulate a personalized expedition draft.
                  </p>
                </div>

                {/* Form fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 block uppercase tracking-wide">Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Dr. Jennifer Vance"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="w-full bg-stone-50 border border-slate-200 text-xs rounded-lg px-4 py-3 focus:outline-none focus:border-gold-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 block uppercase tracking-wide">Email Address *</label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. jennifer@luxuryexpeditions.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-stone-50 border border-slate-200 text-xs rounded-lg px-4 py-3 focus:outline-none focus:border-gold-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 block uppercase tracking-wide">Contact Number</label>
                    <input
                      type="tel"
                      placeholder="e.g. +1 (415) 555-0199"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full bg-stone-50 border border-slate-200 text-xs rounded-lg px-4 py-3 focus:outline-none focus:border-gold-500 font-mono"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 block uppercase tracking-wide">Region of Interest</label>
                    <select
                      value={formData.destination}
                      onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                      className="w-full bg-stone-50 border border-slate-200 text-xs rounded-lg px-4 py-3 focus:outline-none focus:border-gold-500"
                    >
                      <option>Everest Region (Khumbu)</option>
                      <option>Annapurna Region</option>
                      <option>Kathmandu Valley & Culture</option>
                      <option>Peak Climbing Expeditions</option>
                      <option>Other / Custom Wilderness</option>
                    </select>
                  </div>

                  <div className="space-y-2 sm:col-span-2">
                    <label className="text-xs font-bold text-slate-700 block uppercase tracking-wide">Number of Travelers</label>
                    <select
                      value={formData.travelers}
                      onChange={(e) => setFormData({ ...formData, travelers: e.target.value })}
                      className="w-full bg-stone-50 border border-slate-200 text-xs rounded-lg px-4 py-3 focus:outline-none focus:border-gold-500"
                    >
                      <option value="1">Solo Traveler</option>
                      <option value="2">2 Travelers (Couple/Friends)</option>
                      <option value="3-5">3 to 5 Travelers (Private Group)</option>
                      <option value="6+">6+ Travelers</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 block uppercase tracking-wide">Your Goals / Message</label>
                  <textarea
                    rows={4}
                    placeholder="Describe your desired altitude goals, physical preparation level, and special dietary/helicopter requirements."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full bg-stone-50 border border-slate-200 text-xs rounded-lg px-4 py-3 focus:outline-none focus:border-gold-500 resize-none leading-relaxed"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-gold-500 hover:bg-gold-400 text-slate-950 border border-gold-400 font-heading text-xs font-bold uppercase tracking-widest py-4 rounded-lg shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="h-4.5 w-4.5" />
                  <span>Dispatch Qualified Inquiry</span>
                </button>
              </form>
            )}

          </div>

        </div>
      </section>

    </div>
  );
}

import React, { useState } from 'react';
import Header from '../partials/Header';
import Footer from '../partials/Footer';

const API_URL = import.meta.env.VITE_NOTIFLOW_API_URL || '';

function Newsletter() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [message, setMessage] = useState('');

  const isValidEmail = (value) => {
    const trimmed = value.trim();
    if (!trimmed || trimmed.length > 254 || /[\r\n]/.test(trimmed)) return false;
    return /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(trimmed);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValidEmail(email)) {
      setStatus('error');
      setMessage('Please enter a valid email address.');
      return;
    }
    setStatus('loading');
    setMessage('');

    try {
      const res = await fetch(`${API_URL}/web/newsletter/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || 'Unable to subscribe right now.');
      }

      setStatus('success');
      setMessage(data.message || "You're subscribed! Check your inbox for a confirmation.");
      setEmail('');
    } catch (err) {
      setStatus('error');
      setMessage(err.message || 'Something went wrong. Please try again.');
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Site header */}
      <Header />

      <main className="flex-grow bg-slate-50">
        {/* Hero + Form */}
        <section className="relative overflow-hidden py-16 sm:py-20 bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-800 text-white">
          <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
            <div className="absolute -left-16 -top-24 h-64 w-64 rounded-full bg-indigo-500 blur-[120px] opacity-40" />
            <div className="absolute right-0 -bottom-10 h-72 w-72 rounded-full bg-amber-400 blur-[140px] opacity-30" />
            <div className="absolute left-1/2 top-10 h-32 w-32 rounded-full bg-emerald-400 blur-[100px] opacity-30" />
          </div>
          <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-[1.2fr,1fr] gap-10 items-center">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-semibold tracking-wide">
                <span className="h-2 w-2 rounded-full bg-emerald-300 animate-pulse" />
                NotiFlow Newsletter
              </div>
              <h1 className="text-3xl sm:text-4xl font-semibold leading-tight">
                The weekly pulse on push notifications, creative angles, and cadence trends.
              </h1>
              <p className="text-slate-100/80 text-base sm:text-lg max-w-2xl">
                Get field-tested insights, teardown notes, and real campaign patterns from the notification graph. Zero fluff, zero spam.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-slate-100/90">
                {[
                  'Cadence benchmarks across top apps',
                  'Creative teardown highlights',
                  'API-first tactics and automation tips',
                  'Early access to new dashboards',
                ].map((item) => (
                  <div key={item} className="inline-flex items-center gap-2">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/10 border border-white/10 text-xs">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 text-emerald-200">
                        <path fillRule="evenodd" d="M16.704 5.29a1 1 0 010 1.415l-7.25 7.25a1 1 0 01-1.414 0l-3.04-3.04a1 1 0 111.414-1.415l2.333 2.334 6.543-6.544a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="rounded-2xl bg-white/90 backdrop-blur border border-white/40 shadow-2xl p-6 sm:p-7">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-700">Join the list</p>
                    <p className="text-xs text-slate-500">Weekly, actionable, no spam.</p>
                  </div>
                  <div className="h-10 w-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm">
                    NF
                  </div>
                </div>
                <form className="space-y-3" onSubmit={handleSubmit}>
                  <div>
                    <label htmlFor="newsletter-email" className="text-xs font-semibold text-slate-600 block mb-1">
                      Work email
                    </label>
                    <input
                      id="newsletter-email"
                      type="email"
                      placeholder="name@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-900"
                      aria-label="Email address"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={status === 'loading'}
                    className={`w-full text-white font-semibold py-3 rounded-lg transition duration-200 shadow-sm ${
                      status === 'loading'
                        ? 'bg-indigo-300 cursor-not-allowed'
                        : 'bg-indigo-600 hover:bg-indigo-700'
                    }`}
                  >
                    {status === 'loading' ? 'Signing up...' : 'Subscribe'}
                  </button>
                  {message && (
                    <p
                      className={`text-sm ${
                        status === 'success' ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {message}
                    </p>
                  )}
                  {status === 'idle' && (
                    <p className="text-xs text-slate-500">No spam. Unsubscribe anytime.</p>
                  )}
                </form>
                <div className="mt-5 grid grid-cols-2 gap-3 text-xs text-slate-500">
                  <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                    <p className="font-semibold text-slate-700">Avg. read time</p>
                    <p className="text-slate-500">3 minutes</p>
                  </div>
                  <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                    <p className="font-semibold text-slate-700">Noise level</p>
                    <p className="text-slate-500">Zero ads. Just signal.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* What you get */}
        <section className="py-14">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10 space-y-2">
              <p className="text-sm font-semibold text-indigo-600">Inside the newsletter</p>
              <h2 className="text-2xl sm:text-3xl font-semibold text-slate-900">Actionable, scannable, every week.</h2>
              <p className="text-slate-600 text-base max-w-2xl mx-auto">
                Teardowns, timing benchmarks, and copy patterns pulled from thousands of live notifications.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                {
                  title: 'Playbook snippets',
                  body: 'Micro-plays you can ship in minutes: subject lines, urgency framing, and CTA language.',
                },
                {
                  title: 'Cadence radar',
                  body: 'Weekly timing and volume benchmarks so you know when to lean in or back off.',
                },
                {
                  title: 'Signals & outliers',
                  body: 'Interesting spikes, campaigns worth copying, and what made them work.',
                },
              ].map((item) => (
                <div key={item.title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700 font-semibold text-sm mb-3">
                    {item.title.split(' ')[0]}
                  </div>
                  <p className="font-semibold text-slate-900 mb-1">{item.title}</p>
                  <p className="text-sm text-slate-600">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Site footer */}
      <Footer />
    </div>
  );
}

export default Newsletter;

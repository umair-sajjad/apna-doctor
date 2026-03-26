"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, Variants } from "framer-motion";
import {
  Star,
  ShieldCheck,
  Zap,
  Bell,
  RefreshCw,
  DollarSign,
  ChevronRight,
  Sparkles,
  Send,
  Quote,
  Smartphone,
} from "lucide-react";
import Logo from "@/components/shared/logo";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, delay: i * 0.1, ease: "easeOut" },
  }),
};

const specializations = [
  {
    name: "Dermatologist",
    img: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=120&h=120&fit=crop&crop=face",
  },
  {
    name: "Cardiologist",
    img: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=120&h=120&fit=crop&crop=face",
  },
  {
    name: "Pediatrician",
    img: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=120&h=120&fit=crop&crop=face",
  },
  {
    name: "Gynecologist",
    img: "https://images.unsplash.com/photo-1651008376811-b90baee60c1f?w=120&h=120&fit=crop&crop=face",
  },
  {
    name: "Dentist",
    img: "https://images.unsplash.com/photo-1607990281513-2c110a25bd8c?w=120&h=120&fit=crop&crop=face",
  },
  {
    name: "Orthopedic",
    img: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=120&h=120&fit=crop&crop=face",
  },
];

const features = [
  {
    icon: ShieldCheck,
    title: "PMDC Verified Doctors",
    desc: "Every doctor is licensed and verified by PMDC before listing.",
  },
  {
    icon: Zap,
    title: "Instant Confirmation",
    desc: "Booking confirmation via SMS and email in seconds.",
  },
  {
    icon: Star,
    title: "Real Patient Reviews",
    desc: "Authentic reviews from verified patients only.",
  },
  {
    icon: DollarSign,
    title: "Transparent Pricing",
    desc: "See consultation fees upfront — no hidden charges.",
  },
  {
    icon: RefreshCw,
    title: "Easy Cancellation",
    desc: "Cancel or reschedule with automatic refunds.",
  },
  {
    icon: Bell,
    title: "Smart Reminders",
    desc: "SMS and email reminders before every appointment.",
  },
];

const doctors = [
  {
    name: "Dr. Ayesha Malik",
    specialty: "Cardiologist",
    rating: 4.9,
    reviews: 312,
    experience: "12 yrs",
    fee: "PKR 3,000",
    img: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=300&h=300&fit=crop&crop=face",
    available: "Today, 4:00 PM",
  },
  {
    name: "Dr. Usman Tariq",
    specialty: "Dermatologist",
    rating: 4.8,
    reviews: 198,
    experience: "8 yrs",
    fee: "PKR 2,500",
    img: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=300&h=300&fit=crop&crop=face",
    available: "Tomorrow, 10:00 AM",
  },
  {
    name: "Dr. Sara Ahmed",
    specialty: "Pediatrician",
    rating: 4.9,
    reviews: 445,
    experience: "15 yrs",
    fee: "PKR 2,000",
    img: "https://images.unsplash.com/photo-1527613426441-4da17471b66d?w=300&h=300&fit=crop&crop=face",
    available: "Today, 6:30 PM",
  },
];

const testimonials = [
  {
    name: "Ahmed Raza",
    location: "Lahore",
    rating: 5,
    text: "Found a cardiologist within minutes. The AI understood exactly what I needed and booked the appointment instantly. Highly recommend.",
    img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face",
    specialty: "Cardiology",
  },
  {
    name: "Fatima Khan",
    location: "Karachi",
    rating: 5,
    text: "As a mother of three, ApnaDoctor has been a lifesaver. I booked a pediatrician at 11pm for the next morning. The reminders are a great touch.",
    img: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&h=80&fit=crop&crop=face",
    specialty: "Pediatrics",
  },
  {
    name: "Bilal Sheikh",
    location: "Islamabad",
    rating: 5,
    text: "Transparent fees and PMDC-verified doctors gave me confidence. The whole booking took under 3 minutes. No more calling clinics.",
    img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&crop=face",
    specialty: "Dermatology",
  },
];

const SUGGESTED_PROMPTS = [
  "I have a skin rash",
  "Need a heart checkup",
  "Child has fever",
  "Back pain for 2 weeks",
];

export default function HomeClient() {
  const router = useRouter();
  const [aiInput, setAiInput] = useState("");

  const handleAiSubmit = (prompt?: string) => {
    const query = prompt ?? aiInput;
    if (!query.trim()) return;
    router.push(`/chat?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <div className="min-h-screen" style={{ fontFamily: "var(--font-body)" }}>
      {/* ── HERO ─────────────────────────────────────────────── */}
      <section
        className="hero-noise relative flex min-h-screen flex-col justify-center overflow-hidden"
        style={{ background: "var(--hero-bg)" }}
      >
        {/* Gradient mesh */}
        <div
          className="absolute inset-0 z-0"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 60% 40%, rgba(14,165,233,0.12) 0%, transparent 60%), radial-gradient(ellipse 50% 40% at 10% 80%, rgba(26,111,184,0.15) 0%, transparent 50%), linear-gradient(135deg, #050e1f 0%, #0a1628 50%, #060d1c 100%)",
          }}
        />

        {/* Grid lines */}
        <div
          className="absolute inset-0 z-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        {/* Glow orbs */}
        <div
          className="pointer-events-none absolute top-1/4 right-1/4 z-0 h-96 w-96 rounded-full opacity-20 blur-3xl"
          style={{ background: "var(--accent)" }}
        />
        <div
          className="pointer-events-none absolute bottom-1/3 left-1/6 z-0 h-64 w-64 rounded-full opacity-10 blur-3xl"
          style={{ background: "var(--primary)" }}
        />

        <div className="relative z-10 mx-auto w-full max-w-7xl px-6 py-24 lg:py-32">
          <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
            {/* Left */}
            <div>
              <motion.div
                variants={fadeUp}
                initial="hidden"
                animate="show"
                custom={0}
                className="mb-8 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium"
                style={{
                  background: "rgba(14,165,233,0.1)",
                  border: "1px solid rgba(14,165,233,0.25)",
                  color: "var(--accent)",
                }}
              >
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-400" />
                Pakistan's First AI-Powered Healthcare Platform
              </motion.div>

              <motion.h1
                variants={fadeUp}
                initial="hidden"
                animate="show"
                custom={1}
                className="font-display text-5xl leading-[1.05] font-bold text-white lg:text-6xl xl:text-7xl"
              >
                Find the Right{" "}
                <span
                  className="block"
                  style={{
                    background:
                      "linear-gradient(90deg, var(--accent), var(--primary))",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  Doctor,
                </span>
                Book Instantly.
              </motion.h1>

              <motion.p
                variants={fadeUp}
                initial="hidden"
                animate="show"
                custom={2}
                className="mt-6 text-lg leading-relaxed"
                style={{ color: "rgba(255,255,255,0.55)" }}
              >
                Talk to our AI assistant in English or Urdu. Get matched with
                PMDC-verified doctors near you in seconds.
              </motion.p>

              {/* AI Input */}
              <motion.div
                variants={fadeUp}
                initial="hidden"
                animate="show"
                custom={3}
                className="mt-10"
              >
                <div
                  className="flex items-center gap-3 rounded-2xl p-2"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(14,165,233,0.3)",
                    backdropFilter: "blur(12px)",
                  }}
                >
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                    style={{ background: "rgba(14,165,233,0.15)" }}
                  >
                    <Sparkles size={18} style={{ color: "var(--accent)" }} />
                  </div>
                  <input
                    type="text"
                    value={aiInput}
                    onChange={(e) => setAiInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAiSubmit()}
                    placeholder="Describe your health concern…"
                    className="flex-1 bg-transparent py-2 text-sm text-white placeholder-white/30 focus:outline-none"
                  />
                  <button
                    onClick={() => handleAiSubmit()}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white transition-all hover:opacity-80 active:scale-95"
                    style={{
                      background:
                        "linear-gradient(135deg, var(--primary), var(--accent))",
                    }}
                    aria-label="Send to AI"
                  >
                    <Send size={16} />
                  </button>
                </div>

                {/* Suggested prompts */}
                <div className="mt-3 flex flex-wrap gap-2">
                  {SUGGESTED_PROMPTS.map((p) => (
                    <button
                      key={p}
                      onClick={() => handleAiSubmit(p)}
                      className="rounded-full px-3 py-1 text-xs transition-all hover:border-white/30 hover:text-white/70"
                      style={{
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        color: "rgba(255,255,255,0.45)",
                      }}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </motion.div>

              {/* Stats */}
              <motion.div
                variants={fadeUp}
                initial="hidden"
                animate="show"
                custom={4}
                className="mt-12 grid grid-cols-3 gap-6 border-t pt-8"
                style={{ borderColor: "rgba(255,255,255,0.07)" }}
              >
                {[
                  { value: "500+", label: "Verified Doctors" },
                  { value: "10K+", label: "Happy Patients" },
                  { value: "50+", label: "Specializations" },
                ].map((stat) => (
                  <div key={stat.label}>
                    <div
                      className="font-display text-3xl font-bold"
                      style={{ color: "var(--accent)" }}
                    >
                      {stat.value}
                    </div>
                    <div
                      className="mt-1 text-xs"
                      style={{ color: "rgba(255,255,255,0.4)" }}
                    >
                      {stat.label}
                    </div>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Right — doctor cards */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="show"
              custom={2}
              className="hidden flex-col gap-4 lg:flex"
            >
              <div
                className="relative overflow-hidden rounded-2xl"
                style={{ border: "1px solid var(--hero-border)" }}
              >
                <img
                  src="https://images.unsplash.com/photo-1638202993928-7267aad84c31?w=700&h=380&fit=crop&crop=center"
                  alt="Doctors team"
                  className="h-56 w-full object-cover opacity-80"
                />
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(to top, var(--hero-bg) 0%, transparent 55%)",
                  }}
                />
                <div
                  className="absolute bottom-4 left-4 flex items-center gap-3 rounded-xl px-4 py-3"
                  style={{
                    background: "rgba(10,22,40,0.85)",
                    border: "1px solid rgba(14,165,233,0.2)",
                    backdropFilter: "blur(12px)",
                  }}
                >
                  <div className="h-2 w-2 animate-pulse rounded-full bg-green-400" />
                  <div>
                    <p className="text-sm font-semibold text-white">
                      142 doctors online
                    </p>
                    <p
                      className="text-xs"
                      style={{ color: "rgba(255,255,255,0.4)" }}
                    >
                      Available right now
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {doctors.slice(0, 2).map((doc, i) => (
                  <motion.div
                    key={doc.name}
                    variants={fadeUp}
                    initial="hidden"
                    animate="show"
                    custom={3 + i}
                    className="flex flex-col gap-3 rounded-xl p-4"
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.08)",
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={doc.img}
                        alt={doc.name}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                      <div>
                        <p className="text-sm leading-tight font-semibold text-white">
                          {doc.name}
                        </p>
                        <p
                          className="text-xs"
                          style={{ color: "var(--accent)" }}
                        >
                          {doc.specialty}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Star
                          size={12}
                          className="fill-yellow-400 text-yellow-400"
                        />
                        <span className="text-xs font-medium text-white">
                          {doc.rating}
                        </span>
                        <span
                          className="text-xs"
                          style={{ color: "rgba(255,255,255,0.3)" }}
                        >
                          ({doc.reviews})
                        </span>
                      </div>
                      <span className="rounded-full border border-green-500/20 bg-green-500/10 px-2 py-0.5 text-xs text-green-400">
                        Available
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Wave SVG transition */}
        <div className="absolute right-0 bottom-0 left-0 z-10">
          <svg
            viewBox="0 0 1440 80"
            preserveAspectRatio="none"
            className="w-full"
            style={{ display: "block", height: "80px" }}
          >
            <path
              d="M0,40 C240,80 480,0 720,40 C960,80 1200,0 1440,40 L1440,80 L0,80 Z"
              fill="var(--bg-soft)"
            />
          </svg>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────── */}
      <section className="py-24" style={{ background: "var(--bg-soft)" }}>
        <div className="mx-auto max-w-7xl px-6">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="mb-16 text-center"
          >
            <p
              className="mb-3 text-sm font-semibold tracking-widest uppercase"
              style={{ color: "var(--accent)" }}
            >
              Simple Process
            </p>
            <h2
              className="font-display text-4xl font-bold"
              style={{ color: "var(--text-dark)" }}
            >
              Book in 3 Simple Steps
            </h2>
          </motion.div>

          <div className="relative grid grid-cols-1 gap-8 md:grid-cols-3">
            {[
              {
                step: "01",
                title: "Tell Us What You Need",
                desc: "Describe your health concern in simple words — in English or Urdu.",
                img: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400&h=240&fit=crop",
              },
              {
                step: "02",
                title: "Get Matched with Doctors",
                desc: "Our AI finds the best verified doctors near you based on your needs.",
                img: "https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=400&h=240&fit=crop",
              },
              {
                step: "03",
                title: "Book Instantly",
                desc: "Choose a time slot and confirm your appointment in seconds.",
                img: "https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=400&h=240&fit=crop",
              },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                custom={i}
                className="group relative overflow-hidden rounded-2xl"
                style={{
                  background: "white",
                  border: "1px solid var(--primary-light)",
                }}
              >
                <div className="h-40 overflow-hidden">
                  <img
                    src={item.img}
                    alt={item.title}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <div className="p-6">
                  <span
                    className="font-display absolute top-4 right-4 text-5xl font-bold opacity-10"
                    style={{ color: "var(--primary)" }}
                  >
                    {item.step}
                  </span>
                  <h3
                    className="font-display mb-2 text-lg font-bold"
                    style={{ color: "var(--text-dark)" }}
                  >
                    {item.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-gray-500">
                    {item.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS COUNTER ────────────────────────────────────── */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {[
              {
                value: "500+",
                label: "Verified Doctors",
                sub: "PMDC registered",
                color: "var(--primary)",
              },
              {
                value: "10,000+",
                label: "Happy Patients",
                sub: "Across Pakistan",
                color: "var(--accent)",
              },
              {
                value: "50+",
                label: "Specializations",
                sub: "All major fields",
                color: "var(--primary)",
              },
              {
                value: "4.9",
                label: "Average Rating",
                sub: "From verified reviews",
                color: "var(--accent)",
              },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                custom={i * 0.5}
                className="relative flex flex-col items-center justify-center overflow-hidden rounded-2xl p-8 text-center"
                style={{
                  background: "var(--bg-soft)",
                  border: "1px solid var(--primary-light)",
                }}
              >
                <div
                  className="absolute top-0 right-0 left-0 h-1 rounded-t-2xl"
                  style={{
                    background: `linear-gradient(90deg, ${stat.color}, transparent)`,
                  }}
                />
                <span
                  className="font-display text-4xl font-bold lg:text-5xl"
                  style={{ color: stat.color }}
                >
                  {stat.value}
                </span>
                <p
                  className="mt-2 text-sm font-semibold"
                  style={{ color: "var(--text-dark)" }}
                >
                  {stat.label}
                </p>
                <p className="mt-1 text-xs text-gray-400">{stat.sub}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED DOCTORS ─────────────────────────────────── */}
      <section className="bg-white py-24">
        <div className="mx-auto max-w-7xl px-6">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="mb-12 flex items-end justify-between"
          >
            <div>
              <p
                className="mb-2 text-sm font-semibold tracking-widest uppercase"
                style={{ color: "var(--accent)" }}
              >
                Top Rated
              </p>
              <h2
                className="font-display text-4xl font-bold"
                style={{ color: "var(--text-dark)" }}
              >
                Featured Doctors
              </h2>
            </div>
            <Link
              href="/doctors"
              className="hidden items-center gap-2 text-sm font-semibold transition-colors hover:opacity-80 sm:flex"
              style={{ color: "var(--primary)" }}
            >
              View All <ChevronRight size={16} />
            </Link>
          </motion.div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {doctors.map((doc, i) => (
              <motion.div
                key={doc.name}
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                custom={i}
                className="group overflow-hidden rounded-2xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                style={{ borderColor: "var(--primary-light)" }}
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={doc.img}
                    alt={doc.name}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div
                    className="absolute inset-0"
                    style={{
                      background:
                        "linear-gradient(to top, rgba(5,14,31,0.6) 0%, transparent 60%)",
                    }}
                  />
                  <div className="absolute right-3 bottom-3 left-3 flex items-center justify-between">
                    <span
                      className="rounded-full px-2 py-1 text-xs font-medium text-white"
                      style={{ background: "var(--primary)" }}
                    >
                      {doc.specialty}
                    </span>
                    <span className="rounded-full border border-green-400/30 bg-green-500/20 px-2 py-1 text-xs font-medium text-green-300">
                      Available
                    </span>
                  </div>
                </div>

                <div className="p-5">
                  <div className="mb-3 flex items-start justify-between">
                    <div>
                      <h3
                        className="font-display text-base font-bold"
                        style={{ color: "var(--text-dark)" }}
                      >
                        {doc.name}
                      </h3>
                      <p className="mt-0.5 text-xs text-gray-400">
                        {doc.experience} experience
                      </p>
                    </div>
                    <div className="flex items-center gap-1 rounded-lg bg-yellow-50 px-2 py-1">
                      <Star
                        size={12}
                        className="fill-yellow-500 text-yellow-500"
                      />
                      <span className="text-xs font-bold text-yellow-700">
                        {doc.rating}
                      </span>
                    </div>
                  </div>

                  <div
                    className="mt-3 flex items-center justify-between border-t pt-3"
                    style={{ borderColor: "var(--primary-light)" }}
                  >
                    <div>
                      <p className="text-xs text-gray-400">Next slot</p>
                      <p
                        className="text-xs font-semibold"
                        style={{ color: "var(--primary)" }}
                      >
                        {doc.available}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-400">Fee</p>
                      <p
                        className="text-sm font-bold"
                        style={{ color: "var(--text-dark)" }}
                      >
                        {doc.fee}
                      </p>
                    </div>
                  </div>

                  <Link
                    href="/doctors"
                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold text-white transition-all hover:opacity-90"
                    style={{
                      background:
                        "linear-gradient(135deg, var(--primary), var(--accent))",
                    }}
                  >
                    Book Appointment
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SPECIALIZATIONS ──────────────────────────────────── */}
      <section className="py-24" style={{ background: "var(--bg-soft)" }}>
        <div className="mx-auto max-w-7xl px-6">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="mb-14 text-center"
          >
            <p
              className="mb-3 text-sm font-semibold tracking-widest uppercase"
              style={{ color: "var(--accent)" }}
            >
              Browse by Category
            </p>
            <h2
              className="font-display text-4xl font-bold"
              style={{ color: "var(--text-dark)" }}
            >
              Popular Specializations
            </h2>
            <p className="mt-3 text-gray-500">
              Find doctors across 50+ medical specialties
            </p>
          </motion.div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {specializations.map((spec, i) => (
              <motion.div
                key={spec.name}
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                custom={i * 0.5}
              >
                <Link
                  href={`/doctors?specialization=${spec.name}`}
                  className="group flex flex-col items-center gap-3 rounded-2xl border bg-white p-5 transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg"
                  style={{ borderColor: "var(--primary-light)" }}
                >
                  <div
                    className="h-14 w-14 overflow-hidden rounded-full border-2"
                    style={{ borderColor: "var(--primary-light)" }}
                  >
                    <img
                      src={spec.img}
                      alt={spec.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                  <p
                    className="text-center text-sm font-semibold"
                    style={{ color: "var(--text-dark)" }}
                  >
                    {spec.name}
                  </p>
                </Link>
              </motion.div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link
              href="/doctors"
              className="inline-flex items-center gap-2 text-sm font-semibold transition-colors hover:opacity-80"
              style={{ color: "var(--primary)" }}
            >
              View All Specializations <ChevronRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── WHY APNADOCTOR ───────────────────────────────────── */}
      <section
        className="relative overflow-hidden py-24"
        style={{ background: "var(--text-dark)" }}
      >
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
            backgroundSize: "40px 40px",
          }}
        />
        <div className="relative z-10 mx-auto max-w-7xl px-6">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="mb-16 text-center"
          >
            <p
              className="mb-3 text-sm font-semibold tracking-widest uppercase"
              style={{ color: "var(--accent)" }}
            >
              Why Us
            </p>
            <h2 className="font-display text-4xl font-bold text-white">
              Why Choose ApnaDoctor?
            </h2>
            <p
              className="mt-3 text-sm"
              style={{ color: "rgba(255,255,255,0.45)" }}
            >
              Pakistan's most trusted healthcare booking platform
            </p>
          </motion.div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                custom={i * 0.5}
                className="group rounded-2xl p-6 transition-all duration-300 hover:scale-[1.02]"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <div
                  className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl"
                  style={{
                    background: "rgba(14,165,233,0.12)",
                    border: "1px solid rgba(14,165,233,0.2)",
                  }}
                >
                  <f.icon size={20} style={{ color: "var(--accent)" }} />
                </div>
                <h3 className="font-display mb-2 font-bold text-white">
                  {f.title}
                </h3>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: "rgba(255,255,255,0.45)" }}
                >
                  {f.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ─────────────────────────────────────── */}
      <section className="bg-white py-24">
        <div className="mx-auto max-w-7xl px-6">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="mb-14 text-center"
          >
            <p
              className="mb-3 text-sm font-semibold tracking-widest uppercase"
              style={{ color: "var(--accent)" }}
            >
              Patient Stories
            </p>
            <h2
              className="font-display text-4xl font-bold"
              style={{ color: "var(--text-dark)" }}
            >
              What Our Patients Say
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                custom={i}
                className="rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                style={{
                  background: "var(--bg-soft)",
                  border: "1px solid var(--primary-light)",
                }}
              >
                <Quote
                  size={28}
                  className="mb-4 opacity-20"
                  style={{ color: "var(--primary)" }}
                />
                <p className="mb-6 text-sm leading-relaxed text-gray-600">
                  "{t.text}"
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={t.img}
                      alt={t.name}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                    <div>
                      <p
                        className="text-sm font-semibold"
                        style={{ color: "var(--text-dark)" }}
                      >
                        {t.name}
                      </p>
                      <p className="text-xs text-gray-400">{t.location}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: t.rating }).map((_, s) => (
                      <Star
                        key={s}
                        size={12}
                        className="fill-yellow-400 text-yellow-400"
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── APP DOWNLOAD BANNER ──────────────────────────────── */}
      <section className="py-20" style={{ background: "var(--bg-soft)" }}>
        <div className="mx-auto max-w-7xl px-6">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-3xl"
            style={{ background: "var(--text-dark)" }}
          >
            {/* background glow */}
            <div
              className="absolute top-0 right-0 h-full w-1/2 opacity-10"
              style={{
                background:
                  "radial-gradient(ellipse at right, var(--accent), transparent 70%)",
              }}
            />
            <div
              className="absolute inset-0 opacity-[0.03]"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
                backgroundSize: "32px 32px",
              }}
            />

            <div className="relative z-10 flex flex-col items-center gap-10 px-8 py-14 lg:flex-row lg:justify-between">
              <div className="text-center lg:text-left">
                <p
                  className="mb-2 text-sm font-semibold tracking-widest uppercase"
                  style={{ color: "var(--accent)" }}
                >
                  Coming Soon
                </p>
                <h2 className="font-display text-3xl font-bold text-white lg:text-4xl">
                  ApnaDoctor on Your Phone
                </h2>
                <p
                  className="mt-3 max-w-md text-sm leading-relaxed"
                  style={{ color: "rgba(255,255,255,0.5)" }}
                >
                  Book appointments, chat with AI, and get reminders — all from
                  the palm of your hand. Available soon on iOS and Android.
                </p>
                <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row lg:justify-start">
                  {[
                    { label: "App Store", sub: "Download on the" },
                    { label: "Google Play", sub: "Get it on" },
                  ].map((store) => (
                    <button
                      key={store.label}
                      className="flex items-center gap-3 rounded-xl px-5 py-3 transition-all hover:scale-105"
                      style={{
                        background: "rgba(255,255,255,0.07)",
                        border: "1px solid rgba(255,255,255,0.12)",
                      }}
                    >
                      <Smartphone
                        size={22}
                        style={{ color: "var(--accent)" }}
                      />
                      <div className="text-left">
                        <p
                          className="text-xs"
                          style={{ color: "rgba(255,255,255,0.4)" }}
                        >
                          {store.sub}
                        </p>
                        <p className="text-sm font-semibold text-white">
                          {store.label}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Phone mockup */}
              <div className="relative shrink-0">
                <div
                  className="h-64 w-32 overflow-hidden rounded-3xl border-4 shadow-2xl"
                  style={{ borderColor: "rgba(255,255,255,0.15)" }}
                >
                  <img
                    src="https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=300&h=600&fit=crop"
                    alt="App preview"
                    className="h-full w-full object-cover opacity-60"
                  />
                  <div
                    className="absolute inset-0 flex items-center justify-center rounded-3xl"
                    style={{ background: "rgba(5,14,31,0.4)" }}
                  >
                    <div className="text-center">
                      <div
                        className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-2xl"
                        style={{
                          background:
                            "linear-gradient(135deg, var(--primary), var(--accent))",
                        }}
                      >
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 44 44"
                          fill="none"
                        >
                          <rect
                            x="19"
                            y="6"
                            width="6"
                            height="32"
                            rx="3"
                            fill="white"
                          />
                          <rect
                            x="6"
                            y="19"
                            width="32"
                            height="6"
                            rx="3"
                            fill="white"
                          />
                        </svg>
                      </div>
                      <p className="font-display text-xs font-bold text-white">
                        ApnaDoctor
                      </p>
                    </div>
                  </div>
                </div>
                {/* Glow under phone */}
                <div
                  className="absolute -bottom-4 left-1/2 h-8 w-24 -translate-x-1/2 rounded-full opacity-40 blur-xl"
                  style={{ background: "var(--accent)" }}
                />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────── */}
      <section className="bg-white py-24">
        <div className="mx-auto max-w-4xl px-6">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-3xl p-12 text-center"
            style={{
              background:
                "linear-gradient(135deg, var(--primary-dark) 0%, var(--accent) 100%)",
            }}
          >
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
                backgroundSize: "30px 30px",
              }}
            />
            <div className="relative z-10">
              <h2 className="font-display mb-4 text-4xl font-bold text-white">
                Ready to Find Your Doctor?
              </h2>
              <p className="mb-8 text-lg text-blue-100">
                Join thousands of patients who trust ApnaDoctor
              </p>
              <div className="flex flex-col justify-center gap-4 sm:flex-row">
                <Link
                  href="/register/user"
                  className="rounded-xl bg-white px-8 py-4 text-sm font-semibold transition-all hover:bg-blue-50 hover:shadow-lg"
                  style={{ color: "var(--primary-dark)" }}
                >
                  Sign Up Free
                </Link>
                <Link
                  href="/register/doctor"
                  className="rounded-xl border border-white/40 px-8 py-4 text-sm font-semibold text-white transition-all hover:bg-white/10"
                >
                  Are you a Doctor? Join Us
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────── */}
      <footer
        className="border-t py-16"
        style={{
          background: "var(--hero-bg)",
          borderColor: "rgba(255,255,255,0.06)",
        }}
      >
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-12 grid grid-cols-1 gap-10 md:grid-cols-4">
            <div className="md:col-span-1">
              <Logo variant="light" size="md" />
              <p
                className="mt-4 text-sm leading-relaxed"
                style={{ color: "rgba(255,255,255,0.35)" }}
              >
                Pakistan's leading AI-powered healthcare booking platform.
              </p>
            </div>
            {[
              {
                title: "For Patients",
                links: [
                  { label: "Find Doctors", href: "/doctors" },
                  { label: "AI Assistant", href: "/chat" },
                  { label: "Sign Up", href: "/register/user" },
                  { label: "Login", href: "/login/user" },
                ],
              },
              {
                title: "For Doctors",
                links: [
                  { label: "Register as Doctor", href: "/register/doctor" },
                  { label: "Doctor Login", href: "/login/doctor" },
                ],
              },
              {
                title: "Support",
                links: [
                  { label: "Contact Us", href: "/contact" },
                  { label: "About", href: "/about" },
                  { label: "FAQ", href: "/faq" },
                  { label: "Privacy Policy", href: "/privacy" },
                  { label: "Terms of Service", href: "/terms" },
                ],
              },
            ].map((col) => (
              <div key={col.title}>
                <h3 className="mb-4 text-sm font-semibold text-white">
                  {col.title}
                </h3>
                <ul className="space-y-2.5">
                  {col.links.map((l) => (
                    <li key={l.label}>
                      <Link
                        href={l.href}
                        className="text-sm transition-colors hover:text-white"
                        style={{ color: "rgba(255,255,255,0.35)" }}
                      >
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div
            className="flex flex-col items-center justify-between gap-4 border-t pt-8 sm:flex-row"
            style={{ borderColor: "rgba(255,255,255,0.06)" }}
          >
            <p className="text-xs" style={{ color: "rgba(255,255,255,0.25)" }}>
              © {new Date().getFullYear()} ApnaDoctor. All rights reserved.
            </p>
            <p className="text-xs" style={{ color: "rgba(255,255,255,0.25)" }}>
              Built for Pakistan's healthcare future.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

"use client";

import { MapPin, X, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface LocationPermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGrant: () => void;
  onDeny: () => void;
}

const benefits = [
  "Find doctors near you automatically",
  "Calculate accurate distances and travel times",
  "Get personalized recommendations based on your area",
  "Your location updates automatically on each login",
];

export default function LocationPermissionModal({
  isOpen,
  onClose,
  onGrant,
  onDeny,
}: LocationPermissionModalProps) {
  const handleGrant = () => {
    onGrant();
    onClose();
  };
  const handleDeny = () => {
    onDeny();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50"
            style={{
              background: "rgba(5,14,31,0.7)",
              backdropFilter: "blur(4px)",
            }}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl"
            >
              {/* Dark top section */}
              <div
                className="relative overflow-hidden px-8 pt-8 pb-6 text-center"
                style={{ background: "var(--text-dark)" }}
              >
                <div
                  className="pointer-events-none absolute inset-0 opacity-5"
                  style={{
                    backgroundImage:
                      "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
                    backgroundSize: "24px 24px",
                  }}
                />
                <div
                  className="pointer-events-none absolute inset-0 opacity-10"
                  style={{
                    background:
                      "radial-gradient(ellipse at center, var(--accent), transparent 60%)",
                  }}
                />

                {/* Close button */}
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 flex h-7 w-7 items-center justify-center rounded-full text-white/40 transition-colors hover:text-white"
                >
                  <X size={15} />
                </button>

                {/* Icon */}
                <div className="relative z-10">
                  <div
                    className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl"
                    style={{
                      background: "rgba(14,165,233,0.15)",
                      border: "1px solid rgba(14,165,233,0.2)",
                    }}
                  >
                    <MapPin size={28} style={{ color: "var(--accent)" }} />
                  </div>
                  <h3 className="font-display text-2xl font-bold text-white">
                    Enable Location Access
                  </h3>
                  <p
                    className="mt-2 text-sm leading-relaxed"
                    style={{ color: "rgba(255,255,255,0.5)" }}
                  >
                    ApnaDoctor needs your location to show nearby doctors and
                    provide accurate search results.
                  </p>
                </div>
              </div>

              {/* Body */}
              <div className="px-8 py-6">
                {/* Benefits */}
                <div
                  className="mb-5 rounded-2xl p-5"
                  style={{
                    background: "var(--bg-soft)",
                    border: "1px solid var(--primary-light)",
                  }}
                >
                  <p
                    className="mb-3 text-xs font-semibold tracking-widest uppercase"
                    style={{ color: "var(--accent)" }}
                  >
                    Why we need this
                  </p>
                  <ul className="space-y-2.5">
                    {benefits.map((b) => (
                      <li
                        key={b}
                        className="flex items-start gap-2.5 text-sm text-gray-600"
                      >
                        <span
                          className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"
                          style={{ background: "var(--primary)" }}
                        />
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Privacy note */}
                <div className="mb-5 flex items-center justify-center gap-2">
                  <ShieldCheck size={13} className="text-gray-400" />
                  <p className="text-xs text-gray-400">
                    Your location is private and only used to improve your
                    experience.
                  </p>
                </div>

                {/* Buttons */}
                <div className="space-y-3">
                  <button
                    onClick={handleGrant}
                    className="w-full rounded-xl py-3 text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-[0.99]"
                    style={{
                      background:
                        "linear-gradient(135deg, var(--primary), var(--accent))",
                    }}
                  >
                    Enable Location Access
                  </button>
                  <button
                    onClick={handleDeny}
                    className="w-full rounded-xl border py-3 text-sm font-semibold transition-all hover:bg-gray-50"
                    style={{
                      borderColor: "var(--primary-light)",
                      color: "var(--text-dark)",
                    }}
                  >
                    Not Now
                  </button>
                </div>

                <p className="mt-4 text-center text-xs text-gray-400">
                  You can manually enter your city if you prefer.
                </p>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

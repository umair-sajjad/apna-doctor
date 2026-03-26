"use client";

import { useState } from "react";
import { MapPin, X, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface LocationPermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGrant: () => void;
  onDeny: () => void;
}

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
            className="fixed inset-0 z-50 bg-black/50"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
            >
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Icon */}
              <div className="mb-4 flex justify-center">
                <div className="rounded-full bg-blue-100 p-4">
                  <MapPin className="h-10 w-10 text-blue-600" />
                </div>
              </div>

              {/* Content */}
              <div className="mb-6 text-center">
                <h3 className="mb-2 text-2xl font-bold text-gray-900">
                  Enable Location Access
                </h3>
                <p className="text-gray-600">
                  ApnaDoctor needs your location to show you nearby doctors and
                  provide accurate search results.
                </p>
              </div>

              {/* Benefits */}
              <div className="mb-6 rounded-lg bg-blue-50 p-4">
                <div className="mb-3 flex items-start gap-2">
                  <Info className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
                  <div>
                    <p className="text-sm font-semibold text-blue-900">
                      Why we need this:
                    </p>
                  </div>
                </div>
                <ul className="ml-7 space-y-2 text-sm text-blue-800">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600">•</span>
                    <span>Find doctors near you automatically</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600">•</span>
                    <span>Calculate accurate distances and travel times</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600">•</span>
                    <span>
                      Get personalized recommendations based on your area
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600">•</span>
                    <span>
                      Your location updates automatically on each login
                    </span>
                  </li>
                </ul>
              </div>

              {/* Privacy Note */}
              <p className="mb-6 text-center text-xs text-gray-500">
                🔒 Your location is private and only used to improve your
                experience. You can disable this anytime in settings.
              </p>

              {/* Buttons */}
              <div className="space-y-3">
                <button
                  onClick={handleGrant}
                  className="w-full rounded-lg bg-blue-600 py-3 font-medium text-white transition-colors hover:bg-blue-700"
                >
                  Enable Location Access
                </button>
                <button
                  onClick={handleDeny}
                  className="w-full rounded-lg border border-gray-300 bg-white py-3 font-medium text-gray-700 transition-colors hover:bg-gray-50"
                >
                  Not Now
                </button>
              </div>

              <p className="mt-4 text-center text-xs text-gray-500">
                You can manually enter your city if you prefer
              </p>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

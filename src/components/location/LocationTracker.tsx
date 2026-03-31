"use client";

import { useEffect, useState } from "react";
import { useLocationTracking } from "@/hooks/useLocationTracking";
import LocationPermissionModal from "./LocationPermissionModal";

interface LocationTrackerProps {
  userId: string;
  locationPermissionGranted: boolean | null;
}

export default function LocationTracker({
  userId,
  locationPermissionGranted,
}: LocationTrackerProps) {
  const [showModal, setShowModal] = useState(false);
  const locationState = useLocationTracking(userId, "user");

  useEffect(() => {
    if (!locationPermissionGranted) {
      const timer = setTimeout(() => setShowModal(true), 1500);
      return () => clearTimeout(timer);
    }
  }, [locationPermissionGranted]);

  const handleGrant = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        await fetch("/api/user/location", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lat: latitude, lng: longitude }),
        });
      },
      () => {}
    );
  };

  return (
    <LocationPermissionModal
      isOpen={showModal}
      onClose={() => setShowModal(false)}
      onGrant={() => {
        handleGrant();
        setShowModal(false);
      }}
      onDeny={() => setShowModal(false)}
    />
  );
}

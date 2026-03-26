"use client";

import { useEffect, useState } from "react";
import { useLocationTracking } from "@/hooks/useLocationTracking";
import LocationPermissionModal from "./LocationPermissionModal";

interface LocationTrackerProps {
  userId: string;
  userType: "user" | "doctor";
  locationPermissionGranted: boolean;
}

export default function LocationTracker({
  userId,
  userType,
  locationPermissionGranted,
}: LocationTrackerProps) {
  const [showModal, setShowModal] = useState(false);
  const locationState = useLocationTracking(userId, userType);

  useEffect(() => {
    // Only show modal for users (not doctors) and if permission not granted
    if (userType === "user" && !locationPermissionGranted) {
      // Show modal after 2 seconds delay
      const timer = setTimeout(() => {
        setShowModal(true);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [userType, locationPermissionGranted]);

  const handleGrant = () => {
    // The hook will handle the actual permission request
    window.location.reload();
  };

  const handleDeny = () => {
    // User chose not to grant permission
    console.log("User denied location permission");
  };

  return (
    <LocationPermissionModal
      isOpen={showModal}
      onClose={() => setShowModal(false)}
      onGrant={handleGrant}
      onDeny={handleDeny}
    />
  );
}

"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

interface LocationState {
  granted: boolean;
  requesting: boolean;
  error: string | null;
  lat: number | null;
  lng: number | null;
}

export function useLocationTracking(
  userId: string | null,
  userType: "user" | "doctor"
) {
  const [state, setState] = useState<LocationState>({
    granted: false,
    requesting: false,
    error: null,
    lat: null,
    lng: null,
  });

  useEffect(() => {
    if (!userId || userType !== "user") return;

    const checkAndRequestLocation = async () => {
      const supabase = createClient();

      // Check if permission already granted
      const { data: user } = await supabase
        .from("users")
        .select("location_permission_granted")
        .eq("id", userId)
        .single();

      if (user?.location_permission_granted) {
        // Permission already granted, just update location silently
        updateLocationSilently();
      } else {
        // First time - request permission
        requestLocationPermission();
      }
    };

    checkAndRequestLocation();

    // Set up interval to update location every 5 minutes if permission granted
    const interval = setInterval(
      () => {
        updateLocationSilently();
      },
      5 * 60 * 1000
    ); // 5 minutes

    return () => clearInterval(interval);
  }, [userId, userType]);

  const requestLocationPermission = () => {
    if (!navigator.geolocation) {
      setState((prev) => ({
        ...prev,
        error: "Geolocation not supported",
      }));
      return;
    }

    setState((prev) => ({ ...prev, requesting: true }));

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        await updateLocationInDB(latitude, longitude, true);

        setState({
          granted: true,
          requesting: false,
          error: null,
          lat: latitude,
          lng: longitude,
        });

        toast.success("Location access granted");
      },
      (error) => {
        let errorMessage = "Location access denied";

        if (error.code === error.PERMISSION_DENIED) {
          errorMessage =
            "Location permission denied. You can enable it later in settings.";
        }

        setState((prev) => ({
          ...prev,
          requesting: false,
          error: errorMessage,
        }));

        toast.error(errorMessage);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const updateLocationSilently = () => {
    if (!navigator.geolocation || !userId) return;

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        await updateLocationInDB(latitude, longitude, true);
      },
      () => {
        // Silent fail - don't show error to user
        console.log("Failed to update location silently");
      },
      {
        enableHighAccuracy: false,
        timeout: 5000,
        maximumAge: 60000, // Accept cached position up to 1 minute old
      }
    );
  };

  const updateLocationInDB = async (
    lat: number,
    lng: number,
    permissionGranted: boolean
  ) => {
    if (!userId) return;

    const supabase = createClient();

    await supabase
      .from("users")
      .update({
        location_lat: lat,
        location_lng: lng,
        location_permission_granted: permissionGranted,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);
  };

  return state;
}

"use client";

import { APIProvider, Map, Marker } from "@vis.gl/react-google-maps";
import { Navigation, MapPin } from "lucide-react";

interface ClinicMapProps {
  latitude: number;
  longitude: number;
  clinicName: string;
  clinicAddress: string;
}

export default function ClinicMap({
  latitude,
  longitude,
  clinicName,
  clinicAddress,
}: ClinicMapProps) {
  const position = { lat: latitude, lng: longitude };

  const openUrl = (url: string) => {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (isMobile) window.location.href = url;
    else window.open(url, "_blank");
  };

  const getDirections = () =>
    openUrl(
      `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`
    );

  const openInMaps = () =>
    openUrl(
      `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`
    );

  return (
    <div className="space-y-4">
      <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}>
        <div
          className="h-72 w-full overflow-hidden rounded-2xl"
          style={{ border: "1px solid var(--primary-light)" }}
        >
          <Map
            defaultCenter={position}
            defaultZoom={15}
            gestureHandling="cooperative"
            disableDefaultUI={false}
            mapId="clinic-map"
          >
            <Marker position={position} title={clinicName} />
          </Map>
        </div>
      </APIProvider>

      {/* Action buttons */}
      <div className="flex gap-3">
        <button
          onClick={getDirections}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-[0.99]"
          style={{
            background:
              "linear-gradient(135deg, var(--primary), var(--accent))",
          }}
        >
          <Navigation size={15} />
          Get Directions
        </button>
        <button
          onClick={openInMaps}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl border py-3 text-sm font-semibold transition-all hover:bg-gray-50"
          style={{
            borderColor: "var(--primary-light)",
            color: "var(--text-dark)",
          }}
        >
          <MapPin size={15} />
          Open in Maps
        </button>
      </div>

      {/* Address card */}
      <div
        className="flex items-start gap-3 rounded-2xl p-4"
        style={{
          background: "var(--bg-soft)",
          border: "1px solid var(--primary-light)",
        }}
      >
        <div
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
          style={{ background: "var(--primary-light)" }}
        >
          <MapPin size={14} style={{ color: "var(--primary)" }} />
        </div>
        <div>
          <p
            className="text-sm font-semibold"
            style={{ color: "var(--text-dark)" }}
          >
            {clinicName}
          </p>
          <p className="mt-0.5 text-xs text-gray-500">{clinicAddress}</p>
        </div>
      </div>
    </div>
  );
}

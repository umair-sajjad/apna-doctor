"use client";

import { APIProvider, Map, Marker } from "@vis.gl/react-google-maps";

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

  const openGoogleMaps = () => {
    // Universal Google Maps link that works on all platforms
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    if (isMobile) {
      // Opens native Google Maps app on mobile
      window.location.href = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
    } else {
      // Opens Google Maps in new tab on desktop
      window.open(
        `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`,
        "_blank"
      );
    }
  };

  const getDirections = () => {
    // Opens directions in Google Maps
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;

    if (isMobile) {
      window.location.href = url;
    } else {
      window.open(url, "_blank");
    }
  };

  return (
    <div className="space-y-4">
      <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}>
        <div className="h-80 w-full overflow-hidden rounded-lg border border-gray-200 shadow-sm">
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

      <div className="flex gap-3">
        <button
          onClick={getDirections}
          className="flex flex-1 items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-3 font-medium text-white transition-colors hover:bg-blue-700"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
            />
          </svg>
          <span>Get Directions</span>
        </button>

        <button
          onClick={openGoogleMaps}
          className="flex flex-1 items-center justify-center gap-2 rounded-md border-2 border-gray-300 bg-white px-4 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-50"
        >
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
          </svg>
          <span>Open in Maps</span>
        </button>
      </div>

      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
        <div className="flex items-start gap-3">
          <svg
            className="mt-0.5 h-5 w-5 text-gray-600"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
          </svg>
          <div className="flex-1">
            <p className="font-medium text-gray-900">{clinicName}</p>
            <p className="mt-1 text-sm text-gray-600">{clinicAddress}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

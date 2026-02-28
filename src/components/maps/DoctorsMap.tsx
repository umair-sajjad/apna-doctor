"use client";

import {
  APIProvider,
  Map,
  AdvancedMarker,
  InfoWindow,
  Pin,
} from "@vis.gl/react-google-maps";
import { useState } from "react";
import Link from "next/link";

interface Doctor {
  id: string;
  full_name: string;
  specialization: string;
  clinic_location: {
    latitude: number;
    longitude: number;
  };
  clinic_name: string;
  clinic_address: string;
  consultation_fee: number;
  average_rating: number;
}

interface DoctorsMapProps {
  doctors: Doctor[];
  center?: { lat: number; lng: number };
}

export default function DoctorsMap({ doctors, center }: DoctorsMapProps) {
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);

  // Calculate center from doctors if not provided
  const mapCenter =
    center ||
    (doctors.length > 0
      ? {
          lat: doctors[0].clinic_location.latitude,
          lng: doctors[0].clinic_location.longitude,
        }
      : { lat: 31.5497, lng: 74.3436 }); // Lahore default

  return (
    <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}>
      <div className="h-[600px] w-full overflow-hidden rounded-lg border border-gray-200 shadow-sm">
        <Map
          defaultCenter={mapCenter}
          defaultZoom={12}
          mapId="doctors-map"
          gestureHandling="cooperative"
        >
          {doctors.map((doctor) => (
            <AdvancedMarker
              key={doctor.id}
              position={{
                lat: doctor.clinic_location.latitude,
                lng: doctor.clinic_location.longitude,
              }}
              onClick={() => setSelectedDoctor(doctor)}
            >
              <Pin
                background="#2563eb"
                borderColor="#1e40af"
                glyphColor="#ffffff"
              />
            </AdvancedMarker>
          ))}

          {selectedDoctor && (
            <InfoWindow
              position={{
                lat: selectedDoctor.clinic_location.latitude,
                lng: selectedDoctor.clinic_location.longitude,
              }}
              onCloseClick={() => setSelectedDoctor(null)}
            >
              <div className="max-w-xs p-2">
                <h3 className="text-base font-semibold text-black">
                  Dr. {selectedDoctor.full_name}
                </h3>
                <p className="mt-1 text-sm text-gray-600">
                  {selectedDoctor.specialization}
                </p>
                <p className="mt-1 text-sm text-gray-600">
                  {selectedDoctor.clinic_name}
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-sm text-yellow-500">
                    ⭐ {selectedDoctor.average_rating.toFixed(1)}
                  </span>
                  <span className="text-sm font-semibold text-green-600">
                    PKR {selectedDoctor.consultation_fee}
                  </span>
                </div>
                <div className="mt-3 flex gap-2">
                  <Link
                    href={`/doctors/${selectedDoctor.id}`}
                    className="rounded bg-blue-600 px-3 py-1.5 text-xs text-white transition-colors hover:bg-blue-700"
                  >
                    View Profile
                  </Link>
                  <Link
                    href={`/booking/${selectedDoctor.id}`}
                    className="rounded bg-green-600 px-3 py-1.5 text-xs text-white transition-colors hover:bg-green-700"
                  >
                    Book Now
                  </Link>
                </div>
              </div>
            </InfoWindow>
          )}
        </Map>
      </div>
    </APIProvider>
  );
}

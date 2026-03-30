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
import { Star, MapPin } from "lucide-react";

interface Doctor {
  id: string;
  full_name: string;
  specialization: string;
  clinic_location: { latitude: number; longitude: number };
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
      <div
        className="h-[600px] w-full overflow-hidden rounded-2xl"
        style={{ border: "1px solid var(--primary-light)" }}
      >
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
                background="#1A6FB8"
                borderColor="#1E40AF"
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
              {/* Info window uses inline styles since it renders outside our CSS scope */}
              <div
                style={{
                  maxWidth: "220px",
                  padding: "4px",
                  fontFamily: "DM Sans, sans-serif",
                }}
              >
                <p
                  style={{
                    fontWeight: 700,
                    fontSize: "14px",
                    color: "#1E3A5F",
                    margin: 0,
                  }}
                >
                  Dr. {selectedDoctor.full_name}
                </p>
                <p
                  style={{
                    fontSize: "12px",
                    color: "#0EA5E9",
                    margin: "2px 0 0",
                  }}
                >
                  {selectedDoctor.specialization}
                </p>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    marginTop: "4px",
                  }}
                >
                  <svg
                    width="11"
                    height="11"
                    viewBox="0 0 24 24"
                    fill="#f59e0b"
                  >
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                  <span
                    style={{
                      fontSize: "12px",
                      fontWeight: 600,
                      color: "#1E3A5F",
                    }}
                  >
                    {selectedDoctor.average_rating.toFixed(1)}
                  </span>
                  <span
                    style={{
                      fontSize: "12px",
                      color: "#059669",
                      fontWeight: 600,
                      marginLeft: "4px",
                    }}
                  >
                    PKR {selectedDoctor.consultation_fee.toLocaleString()}
                  </span>
                </div>
                <p
                  style={{
                    fontSize: "11px",
                    color: "#9ca3af",
                    margin: "4px 0 0",
                    display: "flex",
                    alignItems: "center",
                    gap: "3px",
                  }}
                >
                  {selectedDoctor.clinic_name}
                </p>
                <div style={{ display: "flex", gap: "6px", marginTop: "8px" }}>
                  <a
                    href={`/doctors/${selectedDoctor.id}`}
                    style={{
                      flex: 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "linear-gradient(135deg, #1A6FB8, #0EA5E9)",
                      color: "white",
                      borderRadius: "8px",
                      padding: "5px 10px",
                      fontSize: "11px",
                      fontWeight: 600,
                      textDecoration: "none",
                    }}
                  >
                    View Profile
                  </a>
                  <a
                    href={`/booking/${selectedDoctor.id}`}
                    style={{
                      flex: 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "#059669",
                      color: "white",
                      borderRadius: "8px",
                      padding: "5px 10px",
                      fontSize: "11px",
                      fontWeight: 600,
                      textDecoration: "none",
                    }}
                  >
                    Book Now
                  </a>
                </div>
              </div>
            </InfoWindow>
          )}
        </Map>
      </div>
    </APIProvider>
  );
}

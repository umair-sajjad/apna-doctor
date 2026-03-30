"use client";

import { useState, useEffect } from "react";
import {
  Country,
  State,
  City,
  ICountry,
  IState,
  ICity,
} from "country-state-city";
import { MapPin, Building2, Home, Mail } from "lucide-react";

interface AddressInputProps {
  defaultValues?: {
    country?: string;
    state?: string;
    city?: string;
    area?: string;
    street?: string;
    houseNumber?: string;
    zipCode?: string;
  };
  namePrefix?: string;
  required?: boolean;
}

const INPUT =
  "w-full rounded-xl border px-4 py-3 text-sm transition focus:outline-none disabled:cursor-not-allowed disabled:opacity-60";
const INPUT_STYLE = {
  borderColor: "var(--primary-light)",
  color: "var(--text-dark)",
};
const INPUT_DISABLED_STYLE = {
  borderColor: "var(--primary-light)",
  color: "var(--text-dark)",
  background: "var(--bg-soft)",
};
const LABEL =
  "mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide";
const LABEL_STYLE = { color: "var(--text-dark)" };

export default function AddressInput({
  defaultValues = {},
  namePrefix = "",
  required = false,
}: AddressInputProps) {
  const [countries, setCountries] = useState<ICountry[]>([]);
  const [states, setStates] = useState<IState[]>([]);
  const [cities, setCities] = useState<ICity[]>([]);

  const [selectedCountry, setSelectedCountry] = useState(
    defaultValues.country || "PK"
  );
  const [selectedState, setSelectedState] = useState(defaultValues.state || "");
  const [selectedCity, setSelectedCity] = useState(defaultValues.city || "");

  useEffect(() => {
    setCountries(Country.getAllCountries());
  }, []);

  useEffect(() => {
    if (selectedCountry) {
      const s = State.getStatesOfCountry(selectedCountry);
      setStates(s);
      if (!s.find((st) => st.isoCode === selectedState)) {
        setSelectedState("");
        setCities([]);
        setSelectedCity("");
      }
    } else {
      setStates([]);
      setCities([]);
      setSelectedState("");
      setSelectedCity("");
    }
  }, [selectedCountry]);

  useEffect(() => {
    if (selectedCountry && selectedState) {
      const c = City.getCitiesOfState(selectedCountry, selectedState);
      setCities(c);
      if (!c.find((ci) => ci.name === selectedCity)) setSelectedCity("");
    } else {
      setCities([]);
      setSelectedCity("");
    }
  }, [selectedCountry, selectedState]);

  const n = (field: string) => (namePrefix ? `${namePrefix}_${field}` : field);

  const previewParts = [
    defaultValues.houseNumber,
    defaultValues.street,
    defaultValues.area,
    selectedCity || defaultValues.city,
    selectedState
      ? states.find((s) => s.isoCode === selectedState)?.name
      : undefined,
    selectedCountry
      ? countries.find((c) => c.isoCode === selectedCountry)?.name
      : undefined,
    defaultValues.zipCode,
  ].filter(Boolean);

  return (
    <div className="space-y-5">
      {/* Country + State */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label className={LABEL} style={LABEL_STYLE}>
            <MapPin size={12} />
            Country {required && <span className="text-red-500">*</span>}
          </label>
          <select
            name={n("country")}
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
            required={required}
            className={INPUT}
            style={INPUT_STYLE}
          >
            <option value="">Select Country</option>
            {countries.map((c) => (
              <option key={c.isoCode} value={c.isoCode}>
                {c.flag} {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={LABEL} style={LABEL_STYLE}>
            Province / State{" "}
            {required && <span className="text-red-500">*</span>}
          </label>
          <select
            name={n("state")}
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            disabled={!selectedCountry || states.length === 0}
            required={required}
            className={INPUT}
            style={
              !selectedCountry || states.length === 0
                ? INPUT_DISABLED_STYLE
                : INPUT_STYLE
            }
          >
            <option value="">Select Province / State</option>
            {states.map((s) => (
              <option key={s.isoCode} value={s.isoCode}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* City + Area */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label className={LABEL} style={LABEL_STYLE}>
            City {required && <span className="text-red-500">*</span>}
          </label>
          <select
            name={n("city")}
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            disabled={!selectedState || cities.length === 0}
            required={required}
            className={INPUT}
            style={
              !selectedState || cities.length === 0
                ? INPUT_DISABLED_STYLE
                : INPUT_STYLE
            }
          >
            <option value="">Select City</option>
            {cities.map((c) => (
              <option key={c.name} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={LABEL} style={LABEL_STYLE}>
            <Building2 size={12} />
            Area / Locality{" "}
            {required && <span className="text-red-500">*</span>}
          </label>
          <input
            type="text"
            name={n("area")}
            defaultValue={defaultValues.area}
            required={required}
            placeholder="e.g., Gulberg, DHA, Johar Town"
            className={INPUT}
            style={INPUT_STYLE}
          />
        </div>
      </div>

      {/* Street + House number */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label className={LABEL} style={LABEL_STYLE}>
            Street / Road Name
          </label>
          <input
            type="text"
            name={n("street")}
            defaultValue={defaultValues.street}
            placeholder="e.g., Main Boulevard, Street 5"
            className={INPUT}
            style={INPUT_STYLE}
          />
        </div>
        <div>
          <label className={LABEL} style={LABEL_STYLE}>
            <Home size={12} />
            House / Building Number
          </label>
          <input
            type="text"
            name={n("houseNumber")}
            defaultValue={defaultValues.houseNumber}
            placeholder="e.g., House 123, Block A"
            className={INPUT}
            style={INPUT_STYLE}
          />
        </div>
      </div>

      {/* Zip */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label className={LABEL} style={LABEL_STYLE}>
            <Mail size={12} />
            Postal / Zip Code
          </label>
          <input
            type="text"
            name={n("zipCode")}
            defaultValue={defaultValues.zipCode}
            placeholder="e.g., 54000"
            className={INPUT}
            style={INPUT_STYLE}
          />
        </div>
      </div>

      {/* Preview */}
      {previewParts.length > 0 && (
        <div
          className="rounded-2xl p-4"
          style={{
            background: "var(--bg-soft)",
            border: "1px solid var(--primary-light)",
          }}
        >
          <p
            className="mb-1 text-xs font-semibold tracking-wide uppercase"
            style={{ color: "var(--accent)" }}
          >
            Address Preview
          </p>
          <p
            className="text-sm leading-relaxed"
            style={{ color: "var(--text-dark)" }}
          >
            {previewParts.join(", ")}
          </p>
        </div>
      )}
    </div>
  );
}

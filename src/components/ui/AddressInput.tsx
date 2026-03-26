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

  // Load countries on mount
  useEffect(() => {
    const allCountries = Country.getAllCountries();
    setCountries(allCountries);
  }, []);

  // Load states when country changes
  useEffect(() => {
    if (selectedCountry) {
      const countryStates = State.getStatesOfCountry(selectedCountry);
      setStates(countryStates);

      // If there's a default state and it exists in new states, keep it
      const stateExists = countryStates.find((s) => s.name === selectedState);
      if (!stateExists) {
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

  // Load cities when state changes
  useEffect(() => {
    if (selectedCountry && selectedState) {
      const stateCities = City.getCitiesOfState(selectedCountry, selectedState);
      setCities(stateCities);

      // If there's a default city and it exists in new cities, keep it
      const cityExists = stateCities.find((c) => c.name === selectedCity);
      if (!cityExists) {
        setSelectedCity("");
      }
    } else {
      setCities([]);
      setSelectedCity("");
    }
  }, [selectedCountry, selectedState]);

  const getFieldName = (field: string) => {
    return namePrefix ? `${namePrefix}_${field}` : field;
  };

  return (
    <div className="space-y-4">
      {/* Country & State */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            <MapPin className="mr-1 inline h-4 w-4" />
            Country {required && <span className="text-red-500">*</span>}
          </label>
          <select
            name={getFieldName("country")}
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
            required={required}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Country</option>
            {countries.map((country) => (
              <option key={country.isoCode} value={country.isoCode}>
                {country.flag} {country.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Province/State {required && <span className="text-red-500">*</span>}
          </label>
          <select
            name={getFieldName("state")}
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            disabled={!selectedCountry || states.length === 0}
            required={required}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-100"
          >
            <option value="">Select Province/State</option>
            {states.map((state) => (
              <option key={state.isoCode} value={state.isoCode}>
                {state.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* City & Area */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            City {required && <span className="text-red-500">*</span>}
          </label>
          <select
            name={getFieldName("city")}
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            disabled={!selectedState || cities.length === 0}
            required={required}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-100"
          >
            <option value="">Select City</option>
            {cities.map((city) => (
              <option key={city.name} value={city.name}>
                {city.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            <Building2 className="mr-1 inline h-4 w-4" />
            Area/Locality {required && <span className="text-red-500">*</span>}
          </label>
          <input
            type="text"
            name={getFieldName("area")}
            defaultValue={defaultValues.area}
            required={required}
            placeholder="e.g., Gulberg, DHA, Johar Town"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Street & House Number */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Street/Road Name
          </label>
          <input
            type="text"
            name={getFieldName("street")}
            defaultValue={defaultValues.street}
            placeholder="e.g., Main Boulevard, Street 5"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            <Home className="mr-1 inline h-4 w-4" />
            House/Building Number
          </label>
          <input
            type="text"
            name={getFieldName("houseNumber")}
            defaultValue={defaultValues.houseNumber}
            placeholder="e.g., House 123, Block A"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Zip Code */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            <Mail className="mr-1 inline h-4 w-4" />
            Postal/Zip Code
          </label>
          <input
            type="text"
            name={getFieldName("zipCode")}
            defaultValue={defaultValues.zipCode}
            placeholder="e.g., 54000"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Preview */}
      {(selectedCountry || defaultValues.area) && (
        <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
          <p className="mb-1 text-xs font-medium text-gray-600">
            Address Preview:
          </p>
          <p className="text-sm text-gray-900">
            {defaultValues.houseNumber && `${defaultValues.houseNumber}, `}
            {defaultValues.street && `${defaultValues.street}, `}
            {defaultValues.area && `${defaultValues.area}, `}
            {selectedCity || defaultValues.city}
            {selectedState &&
              `, ${states.find((s) => s.isoCode === selectedState)?.name}`}
            {selectedCountry &&
              `, ${countries.find((c) => c.isoCode === selectedCountry)?.name}`}
            {defaultValues.zipCode && ` - ${defaultValues.zipCode}`}
          </p>
        </div>
      )}
    </div>
  );
}

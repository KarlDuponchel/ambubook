"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { BookmarkPlus, ChevronDown, Check, MapPin } from "lucide-react";
import { Input, Textarea } from "@/components/ui";
import { useSession } from "@/lib/auth-client";
import { StepProps, BookingFormData } from "../types";

interface AddressSuggestion {
  label: string;
  address: string;
  city: string;
  postalCode: string;
}

interface CustomerAddress {
  id: string;
  label: string;
  type: "HOME" | "WORK" | "MEDICAL" | "OTHER";
  address: string;
  city: string;
  postalCode: string;
  details: string | null;
  isDefault: boolean;
}

const ADDRESS_TYPES = [
  { value: "HOME", label: "Domicile" },
  { value: "WORK", label: "Travail" },
  { value: "MEDICAL", label: "Centre médical" },
  { value: "OTHER", label: "Autre" },
] as const;

interface AddressBlockProps {
  title: string;
  prefix: "pickup" | "destination";
  formData: BookingFormData;
  setFormData: (data: BookingFormData) => void;
  errors: Partial<Record<keyof BookingFormData, string>>;
  isLoggedIn: boolean;
  savedAddresses: CustomerAddress[];
  onSaveAddress: (prefix: "pickup" | "destination", type: string) => void;
  savingAddress: boolean;
}

function AddressBlock({
  title,
  prefix,
  formData,
  setFormData,
  errors,
  isLoggedIn,
  savedAddresses,
  onSaveAddress,
  savingAddress,
}: AddressBlockProps) {
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSaveForm, setShowSaveForm] = useState(false);
  const [selectedType, setSelectedType] = useState<string>("HOME");
  const [savedAddressDropdown, setSavedAddressDropdown] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const savedAddressRef = useRef<HTMLDivElement>(null);

  const addressKey = `${prefix}Address` as keyof BookingFormData;
  const cityKey = `${prefix}City` as keyof BookingFormData;
  const postalCodeKey = `${prefix}PostalCode` as keyof BookingFormData;
  const detailsKey = `${prefix}Details` as keyof BookingFormData;

  const fetchSuggestions = useCallback(async (query: string) => {
    if (query.length < 3) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`/api/address/autocomplete?q=${encodeURIComponent(query)}`);
      if (res.ok) {
        const data = await res.json();
        setSuggestions(data.results || []);
        setIsOpen((data.results || []).length > 0);
      }
    } catch {
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleAddressChange = (value: string) => {
    setFormData({ ...formData, [addressKey]: value });

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      fetchSuggestions(value);
    }, 300);
  };

  const handleSelectSuggestion = (suggestion: AddressSuggestion) => {
    setFormData({
      ...formData,
      [addressKey]: suggestion.address,
      [cityKey]: suggestion.city,
      [postalCodeKey]: suggestion.postalCode,
    });
    setSuggestions([]);
    setIsOpen(false);
  };

  const handleChange = (field: keyof BookingFormData, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSelectSavedAddress = (addr: CustomerAddress) => {
    setFormData({
      ...formData,
      [addressKey]: addr.address,
      [cityKey]: addr.city,
      [postalCodeKey]: addr.postalCode,
      [detailsKey]: addr.details || "",
    });
    setSavedAddressDropdown(false);
  };

  const handleSaveAddress = () => {
    onSaveAddress(prefix, selectedType);
    setShowSaveForm(false);
  };

  const hasAddressData = !!(formData[addressKey] && formData[cityKey] && formData[postalCodeKey]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-neutral-800 flex items-center gap-2">
          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-sm ${
            prefix === "pickup" ? "bg-success-100 text-success-700" : "bg-danger-100 text-danger-700"
          }`}>
            {prefix === "pickup" ? "A" : "B"}
          </span>
          {title}
        </h4>

        {/* Dropdown adresses sauvegardées */}
        {isLoggedIn && savedAddresses.length > 0 && (
          <div className="relative" ref={savedAddressRef}>
            <button
              type="button"
              onClick={() => setSavedAddressDropdown(!savedAddressDropdown)}
              className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              <MapPin className="w-4 h-4" />
              Mes adresses
              <ChevronDown className={`w-4 h-4 transition-transform ${savedAddressDropdown ? "rotate-180" : ""}`} />
            </button>
            {savedAddressDropdown && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-neutral-200 py-1 z-50">
                {savedAddresses.map((addr) => (
                  <button
                    key={addr.id}
                    type="button"
                    onClick={() => handleSelectSavedAddress(addr)}
                    className="w-full px-4 py-2 text-left hover:bg-neutral-50 transition-colors"
                  >
                    <p className="text-sm font-medium text-neutral-900">{addr.label}</p>
                    <p className="text-xs text-neutral-500 truncate">{addr.address}, {addr.city}</p>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div ref={containerRef} className="relative">
        <Input
          label="Adresse *"
          name={addressKey}
          value={formData[addressKey] as string}
          onChange={(e) => handleAddressChange(e.target.value)}
          placeholder="12 rue de la Paix"
          error={errors[addressKey]}
          autoComplete="off"
          icon={
            isLoading ? (
              <svg
                className="w-5 h-5 animate-spin text-neutral-400"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            ) : (
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            )
          }
        />

        {/* Dropdown suggestions */}
        {isOpen && suggestions.length > 0 && (
          <div className="absolute z-50 w-full mt-1 bg-white rounded-lg border border-neutral-200 shadow-lg overflow-hidden">
            <ul className="py-1 max-h-48 overflow-y-auto">
              {suggestions.map((suggestion, index) => (
                <li key={index}>
                  <button
                    type="button"
                    onClick={() => handleSelectSuggestion(suggestion)}
                    className="w-full px-4 py-2 text-left hover:bg-neutral-50 transition-colors"
                  >
                    <p className="text-sm font-medium text-neutral-900 truncate">
                      {suggestion.label}
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Ville *"
          name={cityKey}
          value={formData[cityKey] as string}
          onChange={(e) => handleChange(cityKey, e.target.value)}
          placeholder="Paris"
          error={errors[cityKey]}
        />
        <Input
          label="Code postal *"
          name={postalCodeKey}
          value={formData[postalCodeKey] as string}
          onChange={(e) => handleChange(postalCodeKey, e.target.value)}
          placeholder="75001"
          error={errors[postalCodeKey]}
        />
      </div>

      <Textarea
        label="Détails"
        name={detailsKey}
        value={formData[detailsKey] as string}
        onChange={(e) => handleChange(detailsKey, e.target.value)}
        placeholder="Étage, code, bâtiment, service..."
        rows={2}
      />

      {/* Bouton sauvegarder l'adresse */}
      {isLoggedIn && hasAddressData && (
        <div className="pt-2">
          {!showSaveForm ? (
            <button
              type="button"
              onClick={() => setShowSaveForm(true)}
              className="flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              <BookmarkPlus className="w-4 h-4" />
              Sauvegarder cette adresse
            </button>
          ) : (
            <div className="flex items-center gap-2 p-3 bg-neutral-50 rounded-lg">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="flex-1 px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {ADDRESS_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleSaveAddress}
                disabled={savingAddress}
                className="flex items-center gap-1 px-3 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 disabled:opacity-50"
              >
                <Check className="w-4 h-4" />
                {savingAddress ? "..." : "OK"}
              </button>
              <button
                type="button"
                onClick={() => setShowSaveForm(false)}
                className="px-3 py-2 text-sm text-neutral-600 hover:text-neutral-800"
              >
                Annuler
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function AddressStep({ formData, setFormData, errors }: StepProps) {
  const { data: session } = useSession();
  const [savedAddresses, setSavedAddresses] = useState<CustomerAddress[]>([]);
  const [savingAddress, setSavingAddress] = useState(false);

  const isLoggedIn = !!session?.user;

  // Charger les adresses sauvegardées
  useEffect(() => {
    if (isLoggedIn) {
      fetch("/api/user/addresses")
        .then((res) => res.json())
        .then((data) => setSavedAddresses(data.addresses || []))
        .catch(() => setSavedAddresses([]));
    }
  }, [isLoggedIn]);

  const handleSaveAddress = async (prefix: "pickup" | "destination", type: string) => {
    const addressKey = `${prefix}Address` as keyof typeof formData;
    const cityKey = `${prefix}City` as keyof typeof formData;
    const postalCodeKey = `${prefix}PostalCode` as keyof typeof formData;
    const detailsKey = `${prefix}Details` as keyof typeof formData;

    setSavingAddress(true);
    try {
      const res = await fetch("/api/user/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          address: formData[addressKey],
          city: formData[cityKey],
          postalCode: formData[postalCodeKey],
          details: formData[detailsKey] || null,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setSavedAddresses((prev) => [...prev, data.address]);
      }
    } catch {
      // Silently fail
    } finally {
      setSavingAddress(false);
    }
  };

  return (
    <div className="space-y-8">
      <AddressBlock
        title="Adresse de départ"
        prefix="pickup"
        formData={formData}
        setFormData={setFormData}
        errors={errors}
        isLoggedIn={isLoggedIn}
        savedAddresses={savedAddresses}
        onSaveAddress={handleSaveAddress}
        savingAddress={savingAddress}
      />

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-neutral-200" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-white px-3">
            <svg
              className="w-6 h-6 text-neutral-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
          </span>
        </div>
      </div>

      <AddressBlock
        title="Adresse d'arrivée"
        prefix="destination"
        formData={formData}
        setFormData={setFormData}
        errors={errors}
        isLoggedIn={isLoggedIn}
        savedAddresses={savedAddresses}
        onSaveAddress={handleSaveAddress}
        savingAddress={savingAddress}
      />
    </div>
  );
}

"use client";

import { useRef } from "react";
import { Camera, X, FileText } from "lucide-react";
import { Input, Checkbox, Textarea } from "@/components/ui";
import { StepProps, BookingFormData, Company } from "../types";

interface ScheduleStepProps extends StepProps {
  company: Company;
}

const TRANSPORT_LABELS = {
  AMBULANCE: "Ambulance",
  VSL: "VSL",
};

const MOBILITY_LABELS = {
  WALKING: "Valide",
  WHEELCHAIR: "Fauteuil roulant",
  STRETCHER: "Brancard",
};

export function ScheduleStep({ formData, setFormData, errors, company }: ScheduleStepProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = <K extends keyof BookingFormData>(
    field: K,
    value: BookingFormData[K]
  ) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, transportVoucherFile: file });
    }
  };

  const handleRemoveFile = () => {
    setFormData({ ...formData, transportVoucherFile: null });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Date minimum : aujourd'hui
  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="space-y-6">
      {/* Date et heure aller */}
      <div>
        <h4 className="font-medium text-neutral-800 mb-3">
          {formData.tripType === "ROUND_TRIP" ? "Aller" : "Date et heure"}
        </h4>
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Date *"
            name="requestedDate"
            type="date"
            min={today}
            value={formData.requestedDate}
            onChange={(e) => handleChange("requestedDate", e.target.value)}
            error={errors.requestedDate}
          />
          <Input
            label="Heure *"
            name="requestedTime"
            type="time"
            value={formData.requestedTime}
            onChange={(e) => handleChange("requestedTime", e.target.value)}
            error={errors.requestedTime}
          />
        </div>
      </div>

      {/* Date et heure retour */}
      {formData.tripType === "ROUND_TRIP" && (
        <div>
          <h4 className="font-medium text-neutral-800 mb-3">Retour</h4>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Date *"
              name="returnDate"
              type="date"
              min={formData.requestedDate || today}
              value={formData.returnDate}
              onChange={(e) => handleChange("returnDate", e.target.value)}
              error={errors.returnDate}
            />
            <Input
              label="Heure *"
              name="returnTime"
              type="time"
              value={formData.returnTime}
              onChange={(e) => handleChange("returnTime", e.target.value)}
              error={errors.returnTime}
            />
          </div>
        </div>
      )}

      {/* Bon de transport */}
      <div className="space-y-3">
        <Checkbox
          label="J'ai un bon de transport"
          description="Prescription médicale de transport"
          checked={formData.hasTransportVoucher}
          onChange={(checked) => {
            handleChange("hasTransportVoucher", checked);
            if (!checked) {
              handleRemoveFile();
            }
          }}
        />

        {/* Upload du bon de transport */}
        {formData.hasTransportVoucher && (
          <div className="ml-6 p-4 bg-neutral-50 rounded-xl border border-neutral-200">
            <p className="text-sm font-medium text-neutral-700 mb-2">
              Joindre le bon de transport (optionnel)
            </p>
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileSelect}
              accept="image/*,.pdf"
              capture="environment"
              className="hidden"
              id="transport-voucher-upload"
            />

            {formData.transportVoucherFile ? (
              <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-neutral-200">
                <div className="p-2 rounded-lg bg-success-50">
                  <FileText className="h-5 w-5 text-success-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-neutral-900 truncate">
                    {formData.transportVoucherFile.name}
                  </p>
                  <p className="text-xs text-neutral-500">
                    {(formData.transportVoucherFile.size / 1024).toFixed(0)} Ko
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveFile}
                  className="p-1.5 text-neutral-400 hover:text-danger-600 hover:bg-danger-50 rounded-lg transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <label
                htmlFor="transport-voucher-upload"
                className="flex items-center justify-center gap-2 w-full px-4 py-3 border-2 border-dashed border-neutral-300 rounded-lg cursor-pointer hover:border-primary-400 hover:bg-primary-50/50 transition-colors"
              >
                <Camera className="h-5 w-5 text-neutral-400" />
                <span className="text-sm text-neutral-600">
                  Photographier ou sélectionner
                </span>
              </label>
            )}
            <p className="text-xs text-neutral-500 mt-2">
              Photo ou PDF - Max 10 Mo
            </p>
          </div>
        )}
      </div>

      {/* Motif et notes */}
      <div className="space-y-4">
        <Input
          label="Motif du transport"
          name="reason"
          value={formData.reason}
          onChange={(e) => handleChange("reason", e.target.value)}
          placeholder="Consultation, hospitalisation, dialyse..."
        />

        <Textarea
          label="Notes supplémentaires"
          name="notes"
          value={formData.notes}
          onChange={(e) => handleChange("notes", e.target.value)}
          placeholder="Informations utiles pour l'ambulancier..."
          rows={3}
          error={errors.notes}
        />
      </div>

      {/* Récapitulatif */}
      <div className="bg-neutral-50 rounded-xl p-4 space-y-3">
        <h4 className="font-medium text-neutral-900">Récapitulatif</h4>

        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
          <div className="text-neutral-500">Patient</div>
          <div className="text-neutral-900 font-medium">
            {formData.patientFirstName} {formData.patientLastName}
          </div>

          <div className="text-neutral-500">Téléphone</div>
          <div className="text-neutral-900">{formData.patientPhone}</div>

          <div className="text-neutral-500">Ambulancier</div>
          <div className="text-neutral-900 font-medium">{company.name}</div>

          <div className="text-neutral-500">Transport</div>
          <div className="text-neutral-900">
            {TRANSPORT_LABELS[formData.transportType]} - {MOBILITY_LABELS[formData.mobilityType]}
          </div>

          <div className="text-neutral-500">Trajet</div>
          <div className="text-neutral-900">
            {formData.tripType === "ROUND_TRIP" ? "Aller-retour" : "Aller simple"}
          </div>

          <div className="col-span-2 border-t border-neutral-200 my-1" />

          <div className="text-neutral-500">Départ</div>
          <div className="text-neutral-900">
            {formData.pickupAddress}, {formData.pickupPostalCode} {formData.pickupCity}
          </div>

          <div className="text-neutral-500">Arrivée</div>
          <div className="text-neutral-900">
            {formData.destinationAddress}, {formData.destinationPostalCode} {formData.destinationCity}
          </div>

          {formData.requestedDate && (
            <>
              <div className="col-span-2 border-t border-neutral-200 my-1" />
              <div className="text-neutral-500">
                {formData.tripType === "ROUND_TRIP" ? "Aller" : "Date"}
              </div>
              <div className="text-neutral-900">
                {new Date(formData.requestedDate).toLocaleDateString("fr-FR", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                })}{" "}
                à {formData.requestedTime}
              </div>

              {formData.tripType === "ROUND_TRIP" && formData.returnDate && (
                <>
                  <div className="text-neutral-500">Retour</div>
                  <div className="text-neutral-900">
                    {new Date(formData.returnDate).toLocaleDateString("fr-FR", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                    })}{" "}
                    à {formData.returnTime}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

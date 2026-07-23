"use client";

import { useRef } from "react";
import { Camera, X, FileText } from "lucide-react";
import { Field, FieldArea, CheckRow } from "../fields";
import { StepProps, BookingFormData, Company } from "../types";

interface ScheduleStepProps extends StepProps {
  company: Company;
  /** Affiche la case de consentement RGPD (réservation patient uniquement) */
  showConsent?: boolean;
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

export function ScheduleStep({ formData, setFormData, errors, company, showConsent = true }: ScheduleStepProps) {
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
        <h4 className="font-bold text-ink mb-3">
          {formData.tripType === "ROUND_TRIP" ? "Aller" : "Date et heure"}
        </h4>
        <div className="grid grid-cols-2 gap-4">
          <Field
            label="Date *"
            name="requestedDate"
            type="date"
            min={today}
            value={formData.requestedDate}
            onChange={(e) => handleChange("requestedDate", e.target.value)}
            error={errors.requestedDate}
          />
          <Field
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
          <h4 className="font-bold text-ink mb-3">Retour</h4>
          <div className="grid grid-cols-2 gap-4">
            <Field
              label="Date *"
              name="returnDate"
              type="date"
              min={formData.requestedDate || today}
              value={formData.returnDate}
              onChange={(e) => handleChange("returnDate", e.target.value)}
              error={errors.returnDate}
            />
            <Field
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
        <CheckRow
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
          <div className="ml-6 p-4 bg-surface-2 rounded-xl border border-line">
            <p className="text-sm font-bold text-ink mb-2">
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
              <div className="flex items-center gap-3 p-3 bg-surface rounded-xl border border-line">
                <div className="grid place-items-center w-9 h-9 rounded-lg bg-vert/12 text-vert">
                  <FileText className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-ink truncate">
                    {formData.transportVoucherFile.name}
                  </p>
                  <p className="text-xs text-ink-3">
                    {(formData.transportVoucherFile.size / 1024).toFixed(0)} Ko
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveFile}
                  className="p-1.5 text-ink-3 hover:text-rouge hover:bg-surface-2 rounded-lg transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <label
                htmlFor="transport-voucher-upload"
                className="flex items-center justify-center gap-2 w-full px-4 py-3 border-2 border-dashed border-line rounded-xl cursor-pointer hover:border-brand hover:bg-brand/5 transition-colors"
              >
                <Camera className="h-5 w-5 text-ink-3" />
                <span className="text-sm text-ink-2">
                  Photographier ou sélectionner
                </span>
              </label>
            )}
            <p className="text-xs text-ink-3 mt-2">
              Photo ou PDF - Max 10 Mo
            </p>
          </div>
        )}
      </div>

      {/* Motif et notes */}
      <div className="space-y-4">
        <Field
          label="Motif du transport"
          name="reason"
          value={formData.reason}
          onChange={(e) => handleChange("reason", e.target.value)}
          placeholder="Consultation, hospitalisation, dialyse..."
        />

        <FieldArea
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
      <div className="bg-surface-2 border border-line rounded-2xl p-4 space-y-3">
        <h4 className="font-bold text-ink">Récapitulatif</h4>

        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
          <div className="text-ink-3">Patient</div>
          <div className="text-ink font-semibold">
            {formData.patientFirstName} {formData.patientLastName}
          </div>

          <div className="text-ink-3">Téléphone</div>
          <div className="text-ink">{formData.patientPhone}</div>

          <div className="text-ink-3">Ambulancier</div>
          <div className="text-ink font-semibold">{company.name}</div>

          <div className="text-ink-3">Transport</div>
          <div className="text-ink">
            {TRANSPORT_LABELS[formData.transportType]} - {MOBILITY_LABELS[formData.mobilityType]}
          </div>

          <div className="text-ink-3">Trajet</div>
          <div className="text-ink">
            {formData.tripType === "ROUND_TRIP" ? "Aller-retour" : "Aller simple"}
          </div>

          <div className="col-span-2 border-t border-line my-1" />

          <div className="text-ink-3">Départ</div>
          <div className="text-ink">
            {formData.pickupAddress}, {formData.pickupPostalCode} {formData.pickupCity}
          </div>

          <div className="text-ink-3">Arrivée</div>
          <div className="text-ink">
            {formData.destinationAddress}, {formData.destinationPostalCode} {formData.destinationCity}
          </div>

          {formData.requestedDate && (
            <>
              <div className="col-span-2 border-t border-line my-1" />
              <div className="text-ink-3">
                {formData.tripType === "ROUND_TRIP" ? "Aller" : "Date"}
              </div>
              <div className="text-ink">
                {new Date(formData.requestedDate).toLocaleDateString("fr-FR", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                })}{" "}
                à {formData.requestedTime}
              </div>

              {formData.tripType === "ROUND_TRIP" && formData.returnDate && (
                <>
                  <div className="text-ink-3">Retour</div>
                  <div className="text-ink">
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

      {/* Consentement RGPD - données de santé (art. 9) */}
      {showConsent && (
      <div
        className={`rounded-xl border p-3.5 ${
          errors.consentGiven
            ? "border-rouge/40 bg-rouge/8"
            : "border-line bg-surface-2"
        }`}
      >
        <CheckRow
          label="J'accepte que mes données (dont données de santé) soient traitées par l'ambulancier et AmbuBook afin d'organiser ce transport sanitaire."
          checked={formData.consentGiven}
          onChange={(checked) => handleChange("consentGiven", checked)}
        />
        <p className="mt-1.5 pl-8 text-xs text-ink-3">
          Consentement requis (art. 9 RGPD). Voir notre{" "}
          <a
            href="/politique-confidentialite"
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand hover:underline"
          >
            politique de confidentialité
          </a>
          .
        </p>
        {errors.consentGiven && (
          <p className="mt-1.5 text-sm text-rouge">{errors.consentGiven}</p>
        )}
      </div>
      )}
    </div>
  );
}

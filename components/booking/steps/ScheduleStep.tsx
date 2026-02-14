"use client";

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
  const handleChange = <K extends keyof BookingFormData>(
    field: K,
    value: BookingFormData[K]
  ) => {
    setFormData({ ...formData, [field]: value });
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
      <Checkbox
        label="J'ai un bon de transport"
        description="Prescription médicale de transport"
        checked={formData.hasTransportVoucher}
        onChange={(checked) => handleChange("hasTransportVoucher", checked)}
      />

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

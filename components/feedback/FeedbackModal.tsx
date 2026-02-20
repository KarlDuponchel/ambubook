"use client";

import { useState, useRef } from "react";
import { usePathname } from "next/navigation";
import { X, Camera, Loader2, Bug, Lightbulb, HelpCircle, MessageSquare, Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type FeedbackType = "BUG" | "IMPROVEMENT" | "QUESTION" | "OTHER";

const FEEDBACK_TYPES: { value: FeedbackType; label: string; icon: typeof Bug; color: string }[] = [
  { value: "BUG", label: "Bug", icon: Bug, color: "text-danger-600 bg-danger-50 border-danger-200" },
  { value: "IMPROVEMENT", label: "Suggestion", icon: Lightbulb, color: "text-warning-600 bg-warning-50 border-warning-200" },
  { value: "QUESTION", label: "Question", icon: HelpCircle, color: "text-primary-600 bg-primary-50 border-primary-200" },
  { value: "OTHER", label: "Autre", icon: MessageSquare, color: "text-neutral-600 bg-neutral-50 border-neutral-200" },
];

export function FeedbackModal({ isOpen, onClose }: FeedbackModalProps) {
  const pathname = usePathname();
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [type, setType] = useState<FeedbackType>("BUG");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Vérifier la taille (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("L'image est trop volumineuse (max 5 Mo)");
      return;
    }

    // Convertir en base64
    const reader = new FileReader();
    reader.onloadend = () => {
      setScreenshot(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!subject.trim() || !message.trim()) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    setIsSubmitting(true);

    try {
      const pageUrl = typeof window !== "undefined" ? window.location.href : pathname;

      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          subject: subject.trim(),
          message: message.trim(),
          screenshot: screenshot || undefined,
          pageUrl,
        }),
      });

      if (!res.ok) {
        const data = await res.json() as { error?: string };
        throw new Error(data.error || "Erreur lors de l'envoi");
      }

      toast.success("Merci pour votre retour ! Nous l'examinerons rapidement.");
      handleClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur lors de l'envoi");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setType("BUG");
    setSubject("");
    setMessage("");
    setScreenshot(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200">
          <h2 className="text-lg font-semibold text-neutral-900">
            Signaler un problème ou une suggestion
          </h2>
          <button
            type="button"
            onClick={handleClose}
            className="p-2 -mr-2 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Type de retour
            </label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {FEEDBACK_TYPES.map((ft) => {
                const Icon = ft.icon;
                const isSelected = type === ft.value;
                return (
                  <button
                    key={ft.value}
                    type="button"
                    onClick={() => setType(ft.value)}
                    className={`
                      flex flex-col items-center gap-1.5 p-3 rounded-lg border-2 transition-all
                      ${isSelected
                        ? ft.color + " border-current"
                        : "bg-white border-neutral-200 text-neutral-500 hover:border-neutral-300"
                      }
                    `}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-xs font-medium">{ft.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Subject */}
          <div>
            <label htmlFor="feedback-subject" className="block text-sm font-medium text-neutral-700 mb-1.5">
              Sujet <span className="text-danger-500">*</span>
            </label>
            <input
              id="feedback-subject"
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Décrivez brièvement le problème"
              maxLength={200}
              className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          {/* Message */}
          <div>
            <label htmlFor="feedback-message" className="block text-sm font-medium text-neutral-700 mb-1.5">
              Description <span className="text-danger-500">*</span>
            </label>
            <textarea
              id="feedback-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Expliquez en détail ce qui s'est passé ou ce que vous suggérez..."
              rows={4}
              maxLength={5000}
              className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
            />
            <p className="mt-1 text-xs text-neutral-400 text-right">
              {message.length} / 5000
            </p>
          </div>

          {/* Screenshot */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">
              Capture d'écran (optionnel)
            </label>

            {screenshot ? (
              <div className="relative group">
                <img
                  src={screenshot}
                  alt="Capture d'écran"
                  className="w-full max-h-48 object-contain rounded-lg border border-neutral-200 bg-neutral-50"
                />
                <button
                  type="button"
                  onClick={() => setScreenshot(null)}
                  className="absolute top-2 right-2 p-1.5 bg-white/90 hover:bg-white rounded-full shadow-sm border border-neutral-200 text-neutral-500 hover:text-danger-600 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleScreenshotChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center justify-center gap-2 w-full py-3 border-2 border-dashed border-neutral-300 rounded-lg text-neutral-500 hover:border-primary-400 hover:text-primary-600 hover:bg-primary-50/50 transition-all"
                >
                  <Camera className="w-5 h-5" />
                  <span className="text-sm">Ajouter une image</span>
                </button>
                <p className="mt-1 text-xs text-neutral-400">
                  PNG, JPEG ou WebP - max 5 Mo
                </p>
              </>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors disabled:opacity-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !subject.trim() || !message.trim()}
              className="flex items-center gap-2 px-5 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Envoi...
                </>
              ) : (
                "Envoyer"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

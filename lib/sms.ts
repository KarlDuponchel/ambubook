/**
 * Service SMS via Twilio
 * Documentation: https://www.twilio.com/docs/sms
 */

// Configuration
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;

// Configuration de retry
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY_MS = 1000; // 1 seconde

interface SendSMSParams {
  to: string;
  message: string;
}

interface SMSResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

interface TwilioMessageResponse {
  sid: string;
  status: string;
  error_code?: number;
  error_message?: string;
}

/**
 * Vérifie que la configuration SMS est valide
 */
export function isSMSConfigured(): boolean {
  return !!(TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN && TWILIO_PHONE_NUMBER);
}

/**
 * Formate un numéro de téléphone français au format E.164
 * Ex: "06 12 34 56 78" -> "+33612345678"
 */
export function formatPhoneNumber(phone: string): string {
  // Supprimer tous les caractères non numériques
  let cleaned = phone.replace(/\D/g, "");

  // Si le numéro commence par 0, remplacer par +33
  if (cleaned.startsWith("0")) {
    cleaned = "33" + cleaned.slice(1);
  }

  // Ajouter le + si nécessaire
  if (!cleaned.startsWith("+")) {
    cleaned = "+" + cleaned;
  }

  return cleaned;
}

/**
 * Valide un numéro de téléphone
 */
export function isValidPhoneNumber(phone: string): boolean {
  const formatted = formatPhoneNumber(phone);
  // Format E.164 : + suivi de 10-15 chiffres
  return /^\+[1-9]\d{9,14}$/.test(formatted);
}

/**
 * Délai avec exponential backoff
 */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Envoie un SMS via l'API Twilio
 */
async function sendSMSToTwilio(to: string, body: string): Promise<TwilioMessageResponse> {
  const url = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;

  const credentials = Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString("base64");

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      To: to,
      From: TWILIO_PHONE_NUMBER!,
      Body: body,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || `Twilio API error: ${response.status}`);
  }

  return data as TwilioMessageResponse;
}

/**
 * Envoie un SMS avec retry automatique
 */
export async function sendSMS({ to, message }: SendSMSParams): Promise<SMSResult> {
  // Vérifier la configuration
  if (!isSMSConfigured()) {
    console.warn("SMS non configuré - message ignoré:", { to, message: message.slice(0, 50) + "..." });
    return {
      success: false,
      error: "Service SMS non configuré",
    };
  }

  // Valider et formater le numéro
  if (!isValidPhoneNumber(to)) {
    return {
      success: false,
      error: `Numéro de téléphone invalide: ${to}`,
    };
  }

  const formattedPhone = formatPhoneNumber(to);

  // Tentatives avec retry
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const result = await sendSMSToTwilio(formattedPhone, message);

      console.log(`SMS envoyé avec succès à ${formattedPhone}`, {
        messageId: result.sid,
        status: result.status,
      });

      return {
        success: true,
        messageId: result.sid,
      };
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      console.warn(`Échec envoi SMS (tentative ${attempt}/${MAX_RETRIES}):`, {
        to: formattedPhone,
        error: lastError.message,
      });

      // Si ce n'est pas la dernière tentative, attendre avant de réessayer
      if (attempt < MAX_RETRIES) {
        const delayMs = INITIAL_RETRY_DELAY_MS * Math.pow(2, attempt - 1);
        await delay(delayMs);
      }
    }
  }

  console.error(`Échec définitif envoi SMS après ${MAX_RETRIES} tentatives:`, {
    to: formattedPhone,
    error: lastError?.message,
  });

  return {
    success: false,
    error: lastError?.message || "Erreur inconnue",
  };
}

// ============================================
// TEMPLATES DE MESSAGES SMS
// ============================================

/**
 * SMS de confirmation de demande de transport
 */
export async function sendTransportRequestConfirmation(params: {
  phone: string;
  patientName: string;
  companyName: string;
  date: string;
  time: string;
  trackingId: string;
}): Promise<SMSResult> {
  const { phone, patientName, companyName, date, time, trackingId } = params;

  const message = `AmbuBook: Bonjour ${patientName}, votre demande de transport auprès de ${companyName} pour le ${date} à ${time} a bien été enregistrée. Ref: ${trackingId}`;

  return sendSMS({ to: phone, message });
}

/**
 * SMS de confirmation d'acceptation du transport
 */
export async function sendTransportAccepted(params: {
  phone: string;
  patientName: string;
  companyName: string;
  date: string;
  time: string;
}): Promise<SMSResult> {
  const { phone, patientName, companyName, date, time } = params;

  const message = `AmbuBook: Bonne nouvelle ${patientName} ! ${companyName} a confirmé votre transport le ${date} à ${time}. Pensez à préparer vos documents.`;

  return sendSMS({ to: phone, message });
}

/**
 * SMS de refus du transport
 */
export async function sendTransportRefused(params: {
  phone: string;
  patientName: string;
  companyName: string;
}): Promise<SMSResult> {
  const { phone, patientName, companyName } = params;

  const message = `AmbuBook: ${patientName}, ${companyName} n'est malheureusement pas disponible pour votre transport. Nous vous invitons à contacter une autre société.`;

  return sendSMS({ to: phone, message });
}

/**
 * SMS de contre-proposition
 */
export async function sendTransportCounterProposal(params: {
  phone: string;
  patientName: string;
  companyName: string;
  newDate: string;
  newTime: string;
}): Promise<SMSResult> {
  const { phone, patientName, companyName, newDate, newTime } = params;

  const message = `AmbuBook: ${patientName}, ${companyName} vous propose un nouveau créneau : ${newDate} à ${newTime}. Connectez-vous pour accepter ou refuser.`;

  return sendSMS({ to: phone, message });
}

/**
 * SMS de rappel de transport (J-1)
 */
export async function sendTransportReminder(params: {
  phone: string;
  patientName: string;
  companyName: string;
  date: string;
  time: string;
  pickupAddress: string;
}): Promise<SMSResult> {
  const { phone, patientName, companyName, date, time, pickupAddress } = params;

  const message = `AmbuBook: Rappel ${patientName}, votre transport avec ${companyName} est prévu demain ${date} à ${time}. Adresse: ${pickupAddress}`;

  return sendSMS({ to: phone, message });
}

/**
 * SMS de code de vérification
 */
export async function sendVerificationCode(params: {
  phone: string;
  code: string;
}): Promise<SMSResult> {
  const { phone, code } = params;

  const message = `AmbuBook: Votre code de vérification est ${code}. Il expire dans 10 minutes.`;

  return sendSMS({ to: phone, message });
}

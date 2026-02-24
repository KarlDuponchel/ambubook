import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

// Email de l'admin qui recevra les notifications
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@ambubook.fr";
// Email d'expédition (doit être vérifié sur Resend)
const FROM_EMAIL = process.env.FROM_EMAIL || "AmbuBook <noreply@ambubook.fr>";

interface SendEmailParams {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
}

/**
 * Envoie un email via Resend
 */
export async function sendEmail({ to, subject, html, text }: SendEmailParams) {
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      text,
    });

    if (error) {
      console.error("Erreur envoi email:", error);
      // Convertir l'erreur Resend en string
      const errorMsg = error.message || JSON.stringify(error);
      return { success: false, error: errorMsg };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Erreur envoi email:", error);
    const errorMsg = error instanceof Error ? error.message : "Erreur inconnue";
    return { success: false, error: errorMsg };
  }
}

/**
 * Notifie l'admin d'une nouvelle inscription en attente
 */
export async function notifyAdminNewSignup(params: {
  userName: string;
  userEmail: string;
  companyName: string;
}) {
  const { userName, userEmail, companyName } = params;

  return sendEmail({
    to: ADMIN_EMAIL,
    subject: "🚑 Nouveau compte ambulancier en attente de validation",
    html: `
      <h2>Nouvelle inscription sur AmbuBook</h2>
      <p>Un nouveau compte ambulancier a été créé et attend votre validation :</p>
      <ul>
        <li><strong>Nom :</strong> ${userName}</li>
        <li><strong>Email :</strong> ${userEmail}</li>
        <li><strong>Société :</strong> ${companyName}</li>
      </ul>
      <p>Connectez-vous au dashboard admin pour valider ce compte.</p>
    `,
    text: `Nouvelle inscription AmbuBook\n\nNom: ${userName}\nEmail: ${userEmail}\nSociété: ${companyName}\n\nConnectez-vous au dashboard admin pour valider ce compte.`,
  });
}

/**
 * Confirme à l'ambulancier que son inscription est en attente
 */
export async function notifyUserSignupPending(params: {
  userName: string;
  userEmail: string;
  companyName: string;
}) {
  const { userName, userEmail, companyName } = params;

  return sendEmail({
    to: userEmail,
    subject: "Votre inscription sur AmbuBook - En attente de validation",
    html: `
      <h2>Bienvenue sur AmbuBook, ${userName} !</h2>
      <p>Votre compte pour la société <strong>${companyName}</strong> a bien été créé.</p>
      <p>Il est actuellement <strong>en cours de vérification</strong> par notre équipe.</p>
      <p>Vous recevrez un email dès que votre compte sera activé et que vous pourrez vous connecter.</p>
      <br>
      <p>À très bientôt,</p>
      <p>L'équipe AmbuBook</p>
    `,
    text: `Bienvenue sur AmbuBook, ${userName} !\n\nVotre compte pour la société "${companyName}" a bien été créé.\n\nIl est actuellement en cours de vérification par notre équipe.\nVous recevrez un email dès que votre compte sera activé.\n\nÀ très bientôt,\nL'équipe AmbuBook`,
  });
}

/**
 * Notifie l'ambulancier que son compte a été activé
 */
export async function notifyUserAccountActivated(params: {
  userName: string;
  userEmail: string;
}) {
  const { userName, userEmail } = params;

  return sendEmail({
    to: userEmail,
    subject: "Votre compte AmbuBook est activé !",
    html: `
      <h2>Bonne nouvelle, ${userName} !</h2>
      <p>Votre compte AmbuBook a été <strong>validé et activé</strong>.</p>
      <p>Vous pouvez maintenant vous connecter et commencer à utiliser la plateforme.</p>
      <p><a href="${process.env.BETTER_AUTH_URL || "http://localhost:3000"}/connexion">Se connecter à AmbuBook</Link>
</p>
      <br>
      <p>À très bientôt,</p>
      <p>L'équipe AmbuBook</p>
    `,
    text: `Bonne nouvelle, ${userName} !\n\nVotre compte AmbuBook a été validé et activé.\n\nVous pouvez maintenant vous connecter et commencer à utiliser la plateforme.\n\nÀ très bientôt,\nL'équipe AmbuBook`,
  });
}

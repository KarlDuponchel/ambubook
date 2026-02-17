/**
 * Templates de notifications (email + SMS)
 */

import { NotificationType } from "./types";

interface NotificationTemplates {
  emailSubject: string;
  emailHtml: string;
  emailText: string;
  smsMessage: string;
}

const BASE_URL = process.env.BETTER_AUTH_URL || "http://localhost:3000";

/**
 * Génère les templates pour un type de notification donné
 */
export function getNotificationTemplates(
  type: NotificationType,
  data: Record<string, unknown>
): NotificationTemplates {
  switch (type) {
    case "TRANSPORT_REQUEST_CREATED":
      return transportRequestCreatedTemplates(data);
    case "TRANSPORT_ACCEPTED":
      return transportAcceptedTemplates(data);
    case "TRANSPORT_REFUSED":
      return transportRefusedTemplates(data);
    case "TRANSPORT_COUNTER_PROPOSAL":
      return transportCounterProposalTemplates(data);
    case "TRANSPORT_NEW_REQUEST":
      return transportNewRequestTemplates(data);
    case "TRANSPORT_REMINDER":
      return transportReminderTemplates(data);
    case "TRANSPORT_CUSTOMER_RESPONSE":
      return transportCustomerResponseTemplates(data);
    case "WELCOME_CUSTOMER":
      return welcomeCustomerTemplates(data);
    case "WELCOME_AMBULANCIER":
      return welcomeAmbulancierTemplates(data);
    case "ACCOUNT_ACTIVATED":
      return accountActivatedTemplates(data);
    case "VERIFICATION_CODE":
      return verificationCodeTemplates(data);
    case "TRANSPORT_ATTACHMENT_ADDED":
      return transportAttachmentAddedTemplates(data);
    case "ADMIN_NEW_SIGNUP":
      return adminNewSignupTemplates(data);
    default:
      return defaultTemplates(data);
  }
}

// ============================================
// TRANSPORT - CLIENT
// ============================================

function transportRequestCreatedTemplates(data: Record<string, unknown>): NotificationTemplates {
  const { patientName, companyName, date, time, trackingId } = data as {
    patientName: string;
    companyName: string;
    date: string;
    time: string;
    trackingId: string;
  };

  const trackingUrl = `${BASE_URL}/mes-transports/${trackingId}`;

  return {
    emailSubject: `Votre demande de transport a été enregistrée - AmbuBook`,
    emailHtml: `
      <h2>Bonjour ${patientName},</h2>
      <p>Votre demande de transport auprès de <strong>${companyName}</strong> a bien été enregistrée.</p>
      <p><strong>Date :</strong> ${date}<br>
      <strong>Heure :</strong> ${time}</p>
      <p>Vous recevrez une confirmation dès que ${companyName} aura traité votre demande.</p>
      <p><a href="${trackingUrl}" style="display:inline-block;padding:12px 24px;background:#2563eb;color:white;text-decoration:none;border-radius:6px;">Suivre ma demande</a></p>
      <br>
      <p>À bientôt,<br>L'équipe AmbuBook</p>
    `,
    emailText: `Bonjour ${patientName},\n\nVotre demande de transport auprès de ${companyName} a bien été enregistrée.\n\nDate: ${date}\nHeure: ${time}\n\nSuivez votre demande: ${trackingUrl}\n\nL'équipe AmbuBook`,
    smsMessage: `AmbuBook: Bonjour ${patientName}, votre demande de transport auprès de ${companyName} pour le ${date} à ${time} a bien été enregistrée. Ref: ${trackingId}`,
  };
}

function transportAcceptedTemplates(data: Record<string, unknown>): NotificationTemplates {
  const { patientName, companyName, companyPhone, date, time } = data as {
    patientName: string;
    companyName: string;
    companyPhone?: string;
    date: string;
    time: string;
  };

  const phoneInfo = companyPhone ? `\n\nEn cas de besoin, contactez ${companyName} au ${companyPhone}.` : "";

  return {
    emailSubject: `Votre transport est confirmé ! - AmbuBook`,
    emailHtml: `
      <h2>Bonne nouvelle ${patientName} !</h2>
      <p><strong>${companyName}</strong> a confirmé votre transport.</p>
      <p><strong>Date :</strong> ${date}<br>
      <strong>Heure :</strong> ${time}</p>
      <p>Pensez à préparer vos documents (carte vitale, bon de transport si applicable).</p>
      ${companyPhone ? `<p>Contact : <a href="tel:${companyPhone}">${companyPhone}</a></p>` : ""}
      <br>
      <p>À bientôt,<br>L'équipe AmbuBook</p>
    `,
    emailText: `Bonne nouvelle ${patientName} !\n\n${companyName} a confirmé votre transport.\n\nDate: ${date}\nHeure: ${time}\n\nPensez à préparer vos documents.${phoneInfo}\n\nL'équipe AmbuBook`,
    smsMessage: `AmbuBook: Bonne nouvelle ${patientName} ! ${companyName} a confirmé votre transport le ${date} à ${time}. Pensez à préparer vos documents.`,
  };
}

function transportRefusedTemplates(data: Record<string, unknown>): NotificationTemplates {
  const { patientName, companyName, reason } = data as {
    patientName: string;
    companyName: string;
    reason?: string;
  };

  const reasonText = reason ? `\n\nMotif : ${reason}` : "";

  return {
    emailSubject: `Votre demande de transport n'a pas pu être acceptée - AmbuBook`,
    emailHtml: `
      <h2>Bonjour ${patientName},</h2>
      <p>Nous sommes désolés, <strong>${companyName}</strong> n'est pas en mesure d'assurer votre transport.</p>
      ${reason ? `<p><strong>Motif :</strong> ${reason}</p>` : ""}
      <p>Nous vous invitons à rechercher une autre société d'ambulances sur AmbuBook.</p>
      <p><a href="${BASE_URL}" style="display:inline-block;padding:12px 24px;background:#2563eb;color:white;text-decoration:none;border-radius:6px;">Rechercher une ambulance</a></p>
      <br>
      <p>L'équipe AmbuBook</p>
    `,
    emailText: `Bonjour ${patientName},\n\nNous sommes désolés, ${companyName} n'est pas en mesure d'assurer votre transport.${reasonText}\n\nRecherchez une autre ambulance sur ${BASE_URL}\n\nL'équipe AmbuBook`,
    smsMessage: `AmbuBook: ${patientName}, ${companyName} n'est malheureusement pas disponible pour votre transport. Recherchez une autre société sur ambubook.fr`,
  };
}

function transportCounterProposalTemplates(data: Record<string, unknown>): NotificationTemplates {
  const { patientName, companyName, originalDate, originalTime, proposedDate, proposedTime, trackingId } = data as {
    patientName: string;
    companyName: string;
    originalDate: string;
    originalTime: string;
    proposedDate: string;
    proposedTime: string;
    trackingId: string;
  };

  const trackingUrl = `${BASE_URL}/mes-transports/${trackingId}`;

  return {
    emailSubject: `Nouvelle proposition de créneau - AmbuBook`,
    emailHtml: `
      <h2>Bonjour ${patientName},</h2>
      <p><strong>${companyName}</strong> vous propose un nouveau créneau pour votre transport.</p>
      <p><strong>Créneau initial :</strong> ${originalDate} à ${originalTime}<br>
      <strong>Nouveau créneau proposé :</strong> ${proposedDate} à ${proposedTime}</p>
      <p>Connectez-vous pour accepter ou refuser cette proposition.</p>
      <p><a href="${trackingUrl}" style="display:inline-block;padding:12px 24px;background:#2563eb;color:white;text-decoration:none;border-radius:6px;">Voir la proposition</a></p>
      <br>
      <p>L'équipe AmbuBook</p>
    `,
    emailText: `Bonjour ${patientName},\n\n${companyName} vous propose un nouveau créneau.\n\nInitial: ${originalDate} à ${originalTime}\nProposé: ${proposedDate} à ${proposedTime}\n\nRépondez sur: ${trackingUrl}\n\nL'équipe AmbuBook`,
    smsMessage: `AmbuBook: ${patientName}, ${companyName} vous propose un nouveau créneau : ${proposedDate} à ${proposedTime}. Répondez sur ambubook.fr`,
  };
}

function transportReminderTemplates(data: Record<string, unknown>): NotificationTemplates {
  const { patientName, companyName, companyPhone, date, time, pickupAddress } = data as {
    patientName: string;
    companyName: string;
    companyPhone?: string;
    date: string;
    time: string;
    pickupAddress: string;
  };

  return {
    emailSubject: `Rappel : Votre transport demain - AmbuBook`,
    emailHtml: `
      <h2>Rappel ${patientName},</h2>
      <p>Votre transport avec <strong>${companyName}</strong> est prévu <strong>demain</strong>.</p>
      <p><strong>Date :</strong> ${date}<br>
      <strong>Heure :</strong> ${time}<br>
      <strong>Adresse de prise en charge :</strong> ${pickupAddress}</p>
      <p>Pensez à préparer vos documents.</p>
      ${companyPhone ? `<p>Contact : <a href="tel:${companyPhone}">${companyPhone}</a></p>` : ""}
      <br>
      <p>L'équipe AmbuBook</p>
    `,
    emailText: `Rappel ${patientName},\n\nVotre transport avec ${companyName} est prévu demain.\n\nDate: ${date}\nHeure: ${time}\nAdresse: ${pickupAddress}\n\nL'équipe AmbuBook`,
    smsMessage: `AmbuBook: Rappel ${patientName}, votre transport avec ${companyName} est prévu demain ${date} à ${time}. Adresse: ${pickupAddress}`,
  };
}

// ============================================
// TRANSPORT - AMBULANCIER
// ============================================

function transportNewRequestTemplates(data: Record<string, unknown>): NotificationTemplates {
  const { ambulancierName, patientName, companyName, date, time, pickupCity, destinationCity } = data as {
    ambulancierName: string;
    patientName: string;
    companyName: string;
    date: string;
    time: string;
    pickupCity: string;
    destinationCity: string;
  };

  const dashboardUrl = `${BASE_URL}/dashboard/demandes`;

  return {
    emailSubject: `Nouvelle demande de transport - ${companyName}`,
    emailHtml: `
      <h2>Nouvelle demande de transport</h2>
      <p>Bonjour ${ambulancierName},</p>
      <p>Une nouvelle demande de transport a été reçue pour <strong>${companyName}</strong>.</p>
      <p><strong>Patient :</strong> ${patientName}<br>
      <strong>Date :</strong> ${date} à ${time}<br>
      <strong>Trajet :</strong> ${pickupCity} → ${destinationCity}</p>
      <p><a href="${dashboardUrl}" style="display:inline-block;padding:12px 24px;background:#2563eb;color:white;text-decoration:none;border-radius:6px;">Voir les demandes</a></p>
      <br>
      <p>AmbuBook</p>
    `,
    emailText: `Nouvelle demande de transport\n\nPatient: ${patientName}\nDate: ${date} à ${time}\nTrajet: ${pickupCity} → ${destinationCity}\n\nVoir: ${dashboardUrl}`,
    smsMessage: `AmbuBook: Nouvelle demande pour ${companyName}. ${patientName}, ${date} ${time}. ${pickupCity} → ${destinationCity}`,
  };
}

function transportCustomerResponseTemplates(data: Record<string, unknown>): NotificationTemplates {
  const { ambulancierName, patientName, response, companyName } = data as {
    ambulancierName: string;
    patientName: string;
    response: "accepted" | "refused" | "new_proposal";
    companyName: string;
  };

  const responseText =
    response === "accepted"
      ? "a accepté votre proposition"
      : response === "refused"
        ? "a refusé votre proposition"
        : "a proposé un nouveau créneau";

  const dashboardUrl = `${BASE_URL}/dashboard/demandes`;

  return {
    emailSubject: `Réponse du client - ${companyName}`,
    emailHtml: `
      <h2>Réponse du client</h2>
      <p>Bonjour ${ambulancierName},</p>
      <p><strong>${patientName}</strong> ${responseText}.</p>
      <p><a href="${dashboardUrl}" style="display:inline-block;padding:12px 24px;background:#2563eb;color:white;text-decoration:none;border-radius:6px;">Voir les demandes</a></p>
      <br>
      <p>AmbuBook</p>
    `,
    emailText: `Réponse du client\n\n${patientName} ${responseText}.\n\nVoir: ${dashboardUrl}`,
    smsMessage: `AmbuBook: ${patientName} ${responseText}. Voir vos demandes sur ambubook.fr`,
  };
}

// ============================================
// COMPTE
// ============================================

function welcomeCustomerTemplates(data: Record<string, unknown>): NotificationTemplates {
  const { userName } = data as { userName: string };

  return {
    emailSubject: `Bienvenue sur AmbuBook !`,
    emailHtml: `
      <h2>Bienvenue ${userName} !</h2>
      <p>Votre compte AmbuBook a été créé avec succès.</p>
      <p>Vous pouvez maintenant :</p>
      <ul>
        <li>Rechercher des ambulances près de chez vous</li>
        <li>Réserver vos transports en ligne</li>
        <li>Suivre vos demandes en temps réel</li>
      </ul>
      <p><a href="${BASE_URL}" style="display:inline-block;padding:12px 24px;background:#2563eb;color:white;text-decoration:none;border-radius:6px;">Commencer</a></p>
      <br>
      <p>L'équipe AmbuBook</p>
    `,
    emailText: `Bienvenue ${userName} !\n\nVotre compte AmbuBook a été créé.\n\nCommencez sur ${BASE_URL}\n\nL'équipe AmbuBook`,
    smsMessage: `AmbuBook: Bienvenue ${userName} ! Votre compte est prêt. Recherchez et réservez vos transports sur ambubook.fr`,
  };
}

function welcomeAmbulancierTemplates(data: Record<string, unknown>): NotificationTemplates {
  const { userName, companyName } = data as { userName: string; companyName: string };

  return {
    emailSubject: `Bienvenue sur AmbuBook Pro !`,
    emailHtml: `
      <h2>Bienvenue ${userName} !</h2>
      <p>Votre compte ambulancier pour <strong>${companyName}</strong> a été créé.</p>
      <p>Votre compte est en attente de validation par notre équipe. Vous recevrez un email dès qu'il sera activé.</p>
      <br>
      <p>L'équipe AmbuBook</p>
    `,
    emailText: `Bienvenue ${userName} !\n\nVotre compte pour ${companyName} a été créé.\n\nIl est en attente de validation.\n\nL'équipe AmbuBook`,
    smsMessage: `AmbuBook: Bienvenue ${userName} ! Votre compte ${companyName} est en attente de validation.`,
  };
}

function accountActivatedTemplates(data: Record<string, unknown>): NotificationTemplates {
  const { userName } = data as { userName: string };

  const loginUrl = `${BASE_URL}/dashboard/connexion`;

  return {
    emailSubject: `Votre compte AmbuBook est activé !`,
    emailHtml: `
      <h2>Bonne nouvelle ${userName} !</h2>
      <p>Votre compte AmbuBook a été <strong>validé et activé</strong>.</p>
      <p>Vous pouvez maintenant vous connecter et gérer vos demandes de transport.</p>
      <p><a href="${loginUrl}" style="display:inline-block;padding:12px 24px;background:#2563eb;color:white;text-decoration:none;border-radius:6px;">Se connecter</a></p>
      <br>
      <p>L'équipe AmbuBook</p>
    `,
    emailText: `Bonne nouvelle ${userName} !\n\nVotre compte est activé.\n\nConnectez-vous: ${loginUrl}\n\nL'équipe AmbuBook`,
    smsMessage: `AmbuBook: ${userName}, votre compte est maintenant actif ! Connectez-vous sur ambubook.fr`,
  };
}

function verificationCodeTemplates(data: Record<string, unknown>): NotificationTemplates {
  const { code } = data as { code: string };

  return {
    emailSubject: `Votre code de vérification AmbuBook`,
    emailHtml: `
      <h2>Code de vérification</h2>
      <p>Votre code de vérification AmbuBook est :</p>
      <p style="font-size:32px;font-weight:bold;letter-spacing:4px;text-align:center;padding:20px;background:#f3f4f6;border-radius:8px;">${code}</p>
      <p>Ce code expire dans 10 minutes.</p>
      <p>Si vous n'avez pas demandé ce code, ignorez cet email.</p>
      <br>
      <p>L'équipe AmbuBook</p>
    `,
    emailText: `Votre code de vérification AmbuBook : ${code}\n\nCe code expire dans 10 minutes.\n\nL'équipe AmbuBook`,
    smsMessage: `AmbuBook: Votre code de vérification est ${code}. Il expire dans 10 minutes.`,
  };
}

// ============================================
// TRANSPORT - PIÈCES JOINTES
// ============================================

function transportAttachmentAddedTemplates(data: Record<string, unknown>): NotificationTemplates {
  const { recipientName, uploaderName, fileName, trackingId } = data as {
    recipientName: string;
    uploaderName: string;
    fileName: string;
    trackingId: string;
  };

  const trackingUrl = `${BASE_URL}/mes-transports/${trackingId}`;

  return {
    emailSubject: `Nouvelle pièce jointe ajoutée - AmbuBook`,
    emailHtml: `
      <h2>Bonjour ${recipientName},</h2>
      <p><strong>${uploaderName}</strong> a ajouté une nouvelle pièce jointe à votre demande de transport.</p>
      <p><strong>Fichier :</strong> ${fileName}</p>
      <p><a href="${trackingUrl}" style="display:inline-block;padding:12px 24px;background:#2563eb;color:white;text-decoration:none;border-radius:6px;">Voir la demande</a></p>
      <br>
      <p>L'équipe AmbuBook</p>
    `,
    emailText: `Bonjour ${recipientName},\n\n${uploaderName} a ajouté une nouvelle pièce jointe à votre demande de transport.\n\nFichier: ${fileName}\n\nVoir: ${trackingUrl}\n\nL'équipe AmbuBook`,
    smsMessage: `AmbuBook: ${uploaderName} a ajouté un fichier (${fileName}) à votre demande de transport.`,
  };
}

// ============================================
// ADMIN
// ============================================

function adminNewSignupTemplates(data: Record<string, unknown>): NotificationTemplates {
  const { userName, userEmail, companyName } = data as {
    userName: string;
    userEmail: string;
    companyName: string;
  };

  const adminUrl = `${BASE_URL}/admin/utilisateurs`;

  return {
    emailSubject: `🚑 Nouveau compte ambulancier en attente - ${companyName}`,
    emailHtml: `
      <h2>Nouvelle inscription sur AmbuBook</h2>
      <p>Un nouveau compte ambulancier a été créé et attend votre validation :</p>
      <ul>
        <li><strong>Nom :</strong> ${userName}</li>
        <li><strong>Email :</strong> ${userEmail}</li>
        <li><strong>Société :</strong> ${companyName}</li>
      </ul>
      <p><a href="${adminUrl}" style="display:inline-block;padding:12px 24px;background:#2563eb;color:white;text-decoration:none;border-radius:6px;">Valider le compte</a></p>
      <br>
      <p>AmbuBook</p>
    `,
    emailText: `Nouvelle inscription AmbuBook\n\nNom: ${userName}\nEmail: ${userEmail}\nSociété: ${companyName}\n\nValidez le compte: ${adminUrl}`,
    smsMessage: `AmbuBook Admin: Nouveau compte en attente - ${userName} (${companyName})`,
  };
}

// ============================================
// DEFAULT
// ============================================

function defaultTemplates(data: Record<string, unknown>): NotificationTemplates {
  const message = (data.message as string) || "Notification AmbuBook";

  return {
    emailSubject: `Notification AmbuBook`,
    emailHtml: `<p>${message}</p>`,
    emailText: message,
    smsMessage: `AmbuBook: ${message}`,
  };
}

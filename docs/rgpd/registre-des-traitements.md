# Registre des activités de traitement (art. 30 RGPD)

> **Statut : CANEVAS À COMPLÉTER ET VALIDER PAR UN DPO / JURISTE.**
> Modèle pré-rempli à partir d'AmbuBook. Les champs entre crochets `[…]` sont à
> renseigner.

## Informations générales
- **Responsable de traitement** : `[Raison sociale]`, `[SIRET]`, `[adresse]`
- **Représentant / DPO** : `[nom, email]`
- **Dernière mise à jour** : `[date]`

---

## Traitement n°1 — Prise de rendez-vous de transport sanitaire

| Champ | Contenu |
|-------|---------|
| **Finalité** | Permettre à un patient de demander un transport sanitaire et à un ambulancier de le gérer |
| **Base légale** | Consentement explicite (art. 9-2-a) pour les données de santé ; exécution du service (art. 6-1-b) |
| **Catégories de personnes** | Patients (inscrits et invités) |
| **Catégories de données** | Identité (nom, prénom, email, téléphone) ; **données de santé** (motif, type de transport, mobilité, ordonnance, carte vitale) ; **n° de sécurité sociale** (facultatif) ; adresses |
| **Destinataires** | Société d'ambulance concernée ; éditeur (admin) |
| **Sous-traitants** | Hébergeur HDS `[Scaleway]`, Resend (email), Twilio (SMS) |
| **Transferts hors UE** | Non (hébergement France). Email/SMS : `[à préciser selon DPA]` |
| **Durée de conservation** | 5 ans (obligation médicale) puis purge |
| **Mesures de sécurité** | HTTPS/HSTS, auth+rôles+ownership, chiffrement NIR (AES-256-GCM), chiffrement au repos (hébergeur), consentement art. 9, rate-limiting |

---

## Traitement n°2 — Gestion des comptes utilisateurs

| Champ | Contenu |
|-------|---------|
| **Finalité** | Création/gestion des comptes patients, ambulanciers, admin ; authentification |
| **Base légale** | Exécution du service (art. 6-1-b) ; intérêt légitime (sécurité) |
| **Catégories de personnes** | Patients, ambulanciers, administrateurs |
| **Catégories de données** | Nom, email, téléphone, mot de passe haché (scrypt), rôle, préférences de notification |
| **Destinataires** | Éditeur (admin) |
| **Sous-traitants** | Hébergeur HDS, Resend (emails de vérification/reset) |
| **Durée de conservation** | Anonymisation 3 ans après la dernière activité |
| **Mesures de sécurité** | Hachage scrypt, vérification email, rate-limiting connexion, cookies HttpOnly/Secure/SameSite |

---

## Traitement n°3 — Gestion des sociétés d'ambulance

| Champ | Contenu |
|-------|---------|
| **Finalité** | Référencement des sociétés, gestion de leur profil public, validation par l'admin |
| **Base légale** | Exécution du service ; obligation légale (agrément) |
| **Catégories de personnes** | Ambulanciers / gérants |
| **Catégories de données** | Raison sociale, SIRET, n° agrément ARS, adresse, contact, horaires, congés |
| **Destinataires** | Public (page société), admin |
| **Durée de conservation** | Durée de la relation + obligations légales |
| **Mesures de sécurité** | Auth+rôles, validation admin, contrôle d'ownership |

---

## Traitement n°4 — Notifications (email / SMS / in-app)

| Champ | Contenu |
|-------|---------|
| **Finalité** | Informer des évolutions des demandes (confirmation, rappel J-1, réponses) |
| **Base légale** | Exécution du service ; consentement (marketing/newsletter) |
| **Catégories de données** | Email, téléphone, contenu de notification |
| **Sous-traitants** | Resend, Twilio |
| **Durée de conservation** | Logs de notification 30 j (lues) / 90 j (non lues) |
| **Mesures** | Préférences de notification par utilisateur ; ⚠️ éviter le contenu médical dans email/SMS |

---

## Traitement n°5 — Journalisation & sécurité

| Champ | Contenu |
|-------|---------|
| **Finalité** | Traçabilité des actions sensibles, détection d'incidents, débogage |
| **Base légale** | Intérêt légitime (sécurité) |
| **Catégories de données** | ID utilisateur, IP, user-agent, action, horodatage |
| **Durée de conservation** | Audit 90 j ; erreurs 90 j (résolues) / 6 mois (non résolues) |
| **Mesures** | Accès admin restreint, purge automatique (cron) |

---

## Registre des sous-traitants (art. 28) — DPA à signer
- [ ] `[Hébergeur HDS]` — convention HDS + DPA
- [ ] Resend — DPA
- [ ] Twilio — DPA
- [ ] Axeptio — DPA

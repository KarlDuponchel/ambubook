# Analyse d'Impact relative à la Protection des Données (AIPD / DPIA)

> **Statut : CANEVAS À COMPLÉTER ET VALIDER PAR UN DPO / JURISTE.**
> Ce document est un modèle pré-rempli à partir de l'application AmbuBook. Il ne
> constitue pas un avis juridique. Une AIPD est **obligatoire** ici car le
> traitement porte sur des **données de santé** (catégorie particulière, art. 9
> RGPD) traitées à grande échelle (critères CNIL/EDPB).

- **Responsable de traitement** : _[Raison sociale / SIRET — cf. mentions légales]_
- **DPO / contact** : _[à désigner]_
- **Date de rédaction** : _[à compléter]_
- **Version** : 0.1 (brouillon)

---

## 1. Description du traitement

### 1.1 Finalités
- Mise en relation patients ↔ sociétés d'ambulance et **prise de rendez-vous de transport sanitaire** (ambulance / VSL).
- Gestion des demandes de transport (création, acceptation, contre-proposition, suivi).
- Notifications (email/SMS/in-app) liées aux transports.
- Gestion des comptes (patients, ambulanciers, admin).

### 1.2 Nature des données traitées
| Catégorie | Données | Sensibilité |
|-----------|---------|-------------|
| Identité | Nom, prénom, email, téléphone | Personnelle |
| **Santé (art. 9)** | Motif du transport, type de véhicule (ambulance/VSL), **mobilité** (valide/fauteuil/brancard), accompagnement, ordonnance, carte vitale, **n° de sécurité sociale**, adresses (établissements de soins) | **Sensible** |
| Compte | Rôle, mot de passe (haché), préférences de notification | Personnelle |
| Technique | Logs d'audit, IP (rate-limiting), user-agent | Personnelle |

### 1.3 Personnes concernées
Patients (y compris invités non inscrits), ambulanciers, administrateurs.

### 1.4 Destinataires
- La société d'ambulance choisie (accès aux demandes la concernant).
- L'éditeur (administration de la plateforme).
- Sous-traitants (cf. §1.6).

### 1.5 Durées de conservation
- Comptes : anonymisation 3 ans après la dernière activité (cron `retention`).
- Demandes de transport : 5 ans (obligation médicale), puis purge.
- Journaux d'audit/erreurs : 90 j (jusqu'à 6 mois pour erreurs non résolues).
- Notifications : 30 j (lues) / 90 j (non lues).

### 1.6 Sous-traitants (art. 28)
| Sous-traitant | Rôle | Localisation | Point de conformité |
|---------------|------|--------------|---------------------|
| **[Hébergeur HDS visé, ex. Scaleway]** | Hébergement (app, base, stockage) | France (`fr-par`) | **Certification HDS requise** + convention HDS à signer |
| Resend | Envoi d'emails transactionnels | UE/US | ⚠️ Ne pas transmettre de contenu médical par email |
| Twilio | Envoi de SMS | US | DPA + minimiser le contenu |
| Axeptio | Gestion du consentement cookies | UE | OK |

### 1.7 Flux / support
Application web Next.js. Chiffrement en transit (HTTPS/HSTS). Chiffrement au repos : disque (hébergeur HDS) + **chiffrement applicatif AES-256-GCM du n° de sécurité sociale**.

---

## 2. Nécessité et proportionnalité

- **Base légale** : consentement explicite du patient pour les données de santé (art. 9-2-a) recueilli dans le tunnel de réservation ; exécution du service (art. 6-1-b) pour la relation contractuelle.
- **Minimisation** : le n° de Sécu est **facultatif** ; les documents médicaux ne sont **pas exposés** sur le lien de suivi public.
- **Information** : politique de confidentialité + mentions dans les formulaires.
- **Droits des personnes** : accès/portabilité (export JSON), effacement (anonymisation self-service), rectification (édition du profil).

**À compléter** : justifier la proportionnalité de chaque donnée sensible collectée (le n° de Sécu est-il indispensable au bon de transport ? sinon envisager de le retirer).

---

## 3. Risques et mesures

| Risque | Impact | Mesures en place | Mesures à renforcer |
|--------|--------|------------------|---------------------|
| Accès illégitime aux données de santé | Élevé | Auth + rôles, ownership, middleware, chiffrement NIR | Hébergement HDS, 2FA admin, chiffrement applicatif étendu (motif/notes) |
| Fuite via lien de suivi public | Moyen | trackingId non devinable + 2e facteur (nom) + docs non exposés + rate-limit | — |
| Compromission de compte | Moyen | Rate-limit connexion, vérif email, mots de passe hachés (scrypt) | 2FA, détection connexions suspectes |
| Perte de données | Moyen | — | **Backups automatisés** (à mettre en place) |
| Sous-traitant hors UE | Moyen | Consent Mode, minimisation | DPA signés, éviter contenu médical par email/SMS |
| Absence de journalisation | Faible | AuditLog + ErrorLog | Monitoring (Sentry), alertes |

---

## 4. Avis et validation

- [ ] Avis du DPO
- [ ] Consultation de la CNIL si risque résiduel élevé (art. 36)
- [ ] Validation du responsable de traitement
- [ ] Revue périodique (au moins tous les 12 mois ou à chaque évolution majeure)

---

## 5. Points d'action prioritaires (issus de cette AIPD)
1. Finaliser l'hébergement **HDS** (bloquant).
2. Mettre en place **backups** + **monitoring**.
3. **Stocker la preuve horodatée du consentement** art. 9 en base.
4. Signer les **DPA** avec chaque sous-traitant.
5. Décider du sort du **n° de Sécu** (indispensable ? sinon retirer).

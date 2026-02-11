# Cahier des Charges MVP — AmbuBook

Vision : Permettre aux ambulanciers de recevoir des demandes de réservation en ligne, réduire les appels téléphoniques.
Périmètre MVP

## On fait :

    Formulaire patient pour demander un transport
    Dashboard ambulancier pour gérer les demandes
    Notifications SMS/email

## On ne fait PAS (v1) :

    Marketplace multi-ambulanciers
    Paiement en ligne
    Intégration CPAM
    App mobile native

## Use Cases
### UC1 — Patient soumet une demande

    Accède au formulaire via l'URL de l'ambulancier
    Remplit : nom, téléphone, date/heure, adresses départ/arrivée, type (ambulance/VSL), motif, bon de transport oui/non
    Valide → reçoit confirmation + lien de suivi

### UC2 — Ambulancier consulte les demandes

    Se connecte à son dashboard
    Voit la liste avec badge "Nouvelles"
    Clique pour voir le détail

### UC3 — Ambulancier accepte

    Clique "Accepter" sur une demande
    Confirme l'heure
    Patient reçoit SMS de confirmation

### UC4 — Ambulancier propose autre créneau

    Clique "Proposer un créneau"
    Saisit nouvelle date/heure
    Patient reçoit la proposition, peut accepter/refuser

### UC5 — Ambulancier refuse

    Clique "Refuser" + motif optionnel
    Patient est notifié

### UC6 — Patient suit sa demande

    Clique sur le lien reçu par SMS
    Voit le statut en temps réel

## Écrans

### Patient (public)

    Formulaire : /ambulances-dupont
    Confirmation post-soumission
    Suivi : /suivi/abc123

### Ambulancier (auth)

    Login
    Dashboard (liste + filtres)
    Détail demande + actions
    Paramètres

### Stack suggérée
Composant	Tech
Frontend/Backend	Next.js (App Router)
Base de données	PostgreSQL (Prisma ORM)
Auth	BetterAuth
SMS	Twilio
Email	Resend
Hébergement	Vercel
Planning (6 semaines)
Semaine	Objectif
1-2	Setup, auth, modèle de données, formulaire patient
3-4	Dashboard, actions accepter/refuser, page suivi
5	Notifications email + SMS
6	Tests avec pilote, corrections, mise en prod
Critères de succès

    L'ambulancier pilote utilise l'outil chaque jour
    Il déclare gagner du temps
    10+ demandes traitées le premier mois
// Document de consentement à la collecte et au transfert des données (autorisation APDP n° 2026-327/AT/APDP/DST/SC
// du 25 juin 2026, point b ; 30/10/2026). Affiché à l'inscription (jeune, point de retrait, sponsor) ; l'API refuse
// l'inscription sans « consent: true » et enregistre la preuve (compte, version, date, adresse IP).
// Changer le texte : changer CONSENT_VERSION ici ET dans l'API (src/users/consent.ts). Reprend pages/privacy.js.
export const CONSENT_VERSION = "2026-10-30"

export const CONSENT_TITLE = "Consentement à la collecte et au transfert de vos données"

export const CONSENT_SECTIONS = [
    {
        title: "Qui traite vos données",
        text: "BeCare, la startup E.doto family (Cotonou, République du Bénin), responsable du traitement. Traitement autorisé par l'Autorité de Protection des Données à caractère Personnel (APDP) : autorisation n° 2026-327/AT/APDP/DST/SC du 25 juin 2026.",
    },
    {
        title: "Données collectées",
        text: "Selon les services utilisés : nom et prénoms, adresse e-mail, téléphone, date de naissance, sexe, ville, photo ; commandes, paiements et retraits ; demandes de kits gratuits ; pour la santé (téléconsultation, contraception, suivi) : comptes rendus et notes, chiffrés.",
    },
    {
        title: "Pourquoi",
        text: "Créer et gérer votre compte, traiter vos commandes et vos retraits, organiser les campagnes de kits gratuits, permettre les téléconsultations et le suivi d'une contraception, vous envoyer les e-mails et SMS liés à ces services, et protéger la plateforme.",
    },
    {
        title: "Transfert hors du Bénin",
        text: "Pour fonctionner, la plateforme s'appuie sur des prestataires qui hébergent des données hors du Bénin, notamment dans l'Union européenne et aux États-Unis : Vercel, Render, TiDB Cloud (Allemagne), Cloudinary, Brevo, FeexPay, Groq, Jitsi, OpenStreetMap. Vos données ne sont jamais vendues.",
    },
    {
        title: "Durée de conservation",
        text: "Tant que votre compte est actif, puis au plus six (06) mois après la fin de votre activité sur la plateforme ; vous êtes prévenu(e) par e-mail avant l'effacement. Les factures et paiements sont gardés pour la seule durée imposée par la loi.",
    },
    {
        title: "Vos droits",
        text: "Articles 437, 438, 440, 441 et 443 du Code du numérique : accès, portabilité, opposition, rectification, suppression, effacement et oubli. Pour les exercer, écrivez à contact@edotofamily.com en précisant le droit concerné et l'adresse e-mail de votre compte, ou corrigez vos informations dans « Mon profil ». Vous pouvez aussi saisir l'APDP (www.apdp.bj).",
    },
    {
        title: "Votre choix",
        text: "Ce consentement est libre. Sans lui, le compte ne peut pas être créé. Vous pouvez le retirer à tout moment en demandant la fermeture de votre compte. La date, la version de ce document et l'adresse IP de votre acceptation sont enregistrées comme preuve.",
    },
]

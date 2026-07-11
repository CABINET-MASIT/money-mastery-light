# FinancePilote

## Intégration Lengo Pay

L'application utilise Lengo Pay pour les paiements Orange Money / MTN Money en Guinée.

### Secrets requis (côté backend Lovable Cloud)
- `LENGOPAY_LICENSE_KEY` — clé Base64 fournie par Lengo Pay
- `LENGOPAY_WEBSITE_ID` — identifiant du site marchand
- `LENGOPAY_LICENSE_KEY_ACTIVE` / `LENGOPAY_WEBSITE_ID_ACTIVE` — identifiants actifs utilisés en priorité si configurés

### URLs à déclarer dans le tableau de bord Lengo Pay
Remplacez `https://votre-domaine.com` par le domaine réel de l'application publiée.

- **return_url** (retour après succès) : `https://votre-domaine.com/paiement?paiement=succes`
- **callback_url** (notification serveur) : `https://votre-domaine.com/paiement?paiement=callback`
- **failure_url** (retour après échec) : `https://votre-domaine.com/paiement?paiement=echec`

### Edge Function
`supabase/functions/lengopay-initiate` reçoit la requête du front, appelle Lengo Pay avec la License Key stockée en secret et renvoie l'URL de paiement. La License Key n'est jamais exposée au navigateur.

### Page de paiement
Accessible sur `/paiement`. Détecte l'état online/offline et gère le retour utilisateur (activation automatique de l'abonnement pendant 1 heure au retour `?paiement=succes`).

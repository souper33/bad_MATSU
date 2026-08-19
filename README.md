# Balade à deux — site d'écoute

Petit site à une chanson : un vinyle qui tourne (fait à partir de ta photo), les commandes de lecture, et un compteur du nombre d'écoutes + du temps d'écoute total, stocké directement dans le navigateur.

## Mettre en ligne sur GitHub Pages

1. Crée un nouveau dépôt GitHub (public), par ex. `balade-a-deux`.
2. Mets-y tout le contenu de ce dossier tel quel (`index.html`, `style.css`, `script.js`, `manifest.json`, `sw.js`, `assets/`) — à la racine du dépôt.
3. Dans le dépôt : **Settings → Pages → Build and deployment → Source : Deploy from a branch**, choisis la branche `main` et le dossier `/root`, puis **Save**.
4. Ton site sera en ligne quelques minutes après à une adresse du type
   `https://TON-PSEUDO.github.io/balade-a-deux/`.

## Écoute écran verrouillé / en arrière-plan

- Tant que l'onglet reste ouvert (même écran verrouillé), la lecture continue et le compteur avance — le site utilise l'API Media Session pour afficher les commandes lecture/pause sur l'écran de verrouillage.
- Pour la meilleure tenue en arrière-plan sur mobile, ouvre le site puis **« Ajouter à l'écran d'accueil »** (Safari/Chrome) : il se comporte alors comme une petite appli installée.
- Un téléphone **réellement éteint** (ou l'appli/onglet complètement fermée) ne peut techniquement rien lire — aucun site web ne peut contourner ça. Le compteur reprend simplement là où il en était dès que tu rouvres la page, sans rien perdre de ce qui a déjà été enregistré.

## Où sont stockées les stats

Dans le `localStorage` du navigateur utilisé — donc propre à cet appareil/navigateur. Vider les données de navigation du site remet le compteur à zéro. Pas de compte, pas de serveur : tout reste en local.

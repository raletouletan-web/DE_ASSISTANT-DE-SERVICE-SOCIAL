# Jury IA — VAE Aide-Soignant

Simulation d'entretien VAE en temps réel basée sur **OpenAI Realtime API (gpt-realtime, GA)**.
Conçue par Patrice DIAKITÉ — SAVOIRSCOPE.

---

## 🚀 Déploiement sur Railway

### 1. Pousser le code sur GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <votre-repo>
git push -u origin main
```

### 2. Créer un projet Railway
1. Allez sur https://railway.com
2. **New Project → Deploy from GitHub repo** → sélectionnez votre repo
3. Railway détecte automatiquement Node.js + Nixpacks

### 3. Configurer les variables d'environnement
Dans l'onglet **Variables** du service Railway, ajoutez :

| Variable | Valeur |
|----------|--------|
| `OPENAI_API_KEY` | `sk-xxxxxxxxxxxxxxxxxxxxxxxx` (votre clé OpenAI) |
| `PORT` | *(laissé vide — Railway l'injecte automatiquement)* |

> **Note** : la variable `PORT` est **automatiquement fournie par Railway**, vous n'avez pas besoin de la définir manuellement. Le serveur écoute sur `process.env.PORT`.

### 4. Générer un domaine public
Dans l'onglet **Settings → Networking → Generate Domain**.
L'application est accessible sur `https://<votre-app>.up.railway.app`.

### 5. Healthcheck
Railway vérifie automatiquement `GET /healthz` (configuré dans `railway.json`).

---

## 🛠 Développement local

```bash
# 1. Installer les dépendances
npm install

# 2. Créer un fichier .env à la racine
echo "OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxx" > .env
echo "PORT=3000" >> .env

# 3. Builder le front
npm run build

# 4. Lancer le serveur
node server.js
# → http://localhost:3000
```

---

## 📁 Architecture des fichiers

| Fichier | Rôle |
|---------|------|
| `server.js` | Backend Express : sert le build + génère les ephemeral keys |
| `src/App.tsx` | Front React : interface + WebRTC + détection d'inactivité |
| `nixpacks.toml` | Config build/start pour Railway |
| `railway.json` | Config déploiement Railway (healthcheck, restart policy) |
| `Procfile` | Fallback pour plateformes type Heroku |
| `.env.example` | Template des variables d'environnement |

---

## ⏱ Gestion de l'inactivité

- **90 secondes** sans parole détectée → bandeau d'alerte en bas d'écran
- **15 secondes** supplémentaires sans interaction → déconnexion automatique
- Compteur visible dans le bandeau, possibilité d'annuler en cliquant sur "Continuer"

---

## 🎙 Modèle utilisé

- **Modèle** : `gpt-realtime` (GA)
- **Voix** : `shimmer`
- **Langue** : français (forcée dans le prompt et dans Whisper)
- **Transport** : WebRTC GA (`/v1/realtime/calls`)
- **Endpoint clé éphémère** : `/v1/realtime/client_secrets`

/**
 * server.js — Backend Express pour le Jury IA VAE Aide-Soignant
 *
 * Compatible Railway :
 * - Lit OPENAI_API_KEY et PORT
 * - Sert le build Vite (dist/)
 * - Génère une clé Realtime temporaire
 * - Expose un healthcheck
 */

import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

const PORT = process.env.PORT || 3000;

// Debug variables OpenAI
console.log(
  "Variables OPENAI détectées :",
  Object.keys(process.env).filter((k) =>
    k.includes("OPENAI")
  )
);

console.log(
  "OPENAI_API_KEY présente :",
  !!process.env.OPENAI_API_KEY
);

app.use(cors());

app.use(
  express.json({
    limit: "10mb",
  })
);

// ─────────────────────────────────────────────
// Fichiers statiques Vite
// ─────────────────────────────────────────────

app.use(
  express.static(
    path.join(__dirname, "dist")
  )
);

// ─────────────────────────────────────────────
// Healthcheck Railway
// ─────────────────────────────────────────────

app.get("/healthz", (_req, res) => {
  res.status(200).json({
    status: "ok",
    apiKey: process.env.OPENAI_API_KEY
      ? "configured"
      : "missing",

    timestamp: new Date().toISOString(),
  });
});

// ─────────────────────────────────────────────
// Création session Realtime OpenAI
// ─────────────────────────────────────────────

app.get(
  "/api/session",
  async (_req, res) => {

    const OPENAI_API_KEY =
      process.env.OPENAI_API_KEY;

    if (!OPENAI_API_KEY) {

      console.error(
        "❌ OPENAI_API_KEY absente"
      );

      return res.status(500).json({
        error:
          "OPENAI_API_KEY manquante",
      });
    }

    try {

      console.log(
        "Création session Realtime..."
      );

      const response =
        await fetch(
          "https://api.openai.com/v1/realtime/client_secrets",
          {
            method: "POST",

            headers: {
              Authorization:
                `Bearer ${OPENAI_API_KEY}`,

              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              session: {

                type: "realtime",

                model:
                  "gpt-realtime",

                voice:
                  "shimmer",

                modalities: [
                  "audio",
                  "text",
                ],

                instructions: `
Tu es un jury VAE aide-soignant.

Tu réalises un entretien oral interactif.

Règles :

- Parle uniquement français
- Une question à la fois
- Attends la réponse
- Relance si nécessaire
- Évalue les compétences
- Posture bienveillante mais exigeante
- Simulation réaliste de jury
`,
              },
            }),
          }
        );

      const raw =
        await response.text();

      console.log(
        "Status OpenAI :",
        response.status
      );

      console.log(
        "Réponse OpenAI :",
        raw
      );

      if (!response.ok) {

        return res
          .status(
            response.status
          )
          .json({
            error:
              "Erreur OpenAI",

            detail: raw,
          });
      }

      let sessionData;

      try {

        sessionData =
          JSON.parse(raw);

      } catch {

        return res
          .status(500)
          .json({
            error:
              "Réponse OpenAI invalide",
          });
      }

      console.log(
        "✅ Session créée"
      );

      console.log(
        sessionData
      );

      return res.json(
        sessionData
      );

    } catch (err) {

      console.error(
        "Erreur serveur :",
        err
      );

      return res
        .status(500)
        .json({
          error:
            "Erreur interne",

          detail:
            err.message,
        });
    }
  }
);

// ─────────────────────────────────────────────
// Fallback SPA Vite
// ─────────────────────────────────────────────

app.use(
  (req, res, next) => {

    if (
      req.method !== "GET"
    ) {
      return next();
    }

    res.sendFile(
      path.join(
        __dirname,
        "dist",
        "index.html"
      )
    );
  }
);

// ─────────────────────────────────────────────
// Lancement serveur
// ─────────────────────────────────────────────

app.listen(
  PORT,
  "0.0.0.0",
  () => {

    console.log(
      `✅ Serveur démarré : ${PORT}`
    );

    console.log(
      "Healthcheck : /healthz"
    );

    console.log(
      "Realtime : /api/session"
    );
  }
);

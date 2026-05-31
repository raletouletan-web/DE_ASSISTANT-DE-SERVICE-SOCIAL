export default async function handler(req, res) {

  // Vérification du token
  const token = req.query.token;
  const validTokens = (process.env.VALID_TOKENS || "")
    .split(",")
    .map(t => t.trim())
    .filter(Boolean);

  if (!token || !validTokens.includes(token)) {
    return res.status(403).json({ error: "Token invalide." });
  }

  // Vérification de la clé OpenAI
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
  if (!OPENAI_API_KEY) {
    return res.status(500).json({ error: "OPENAI_API_KEY manquante." });
  }

  // Appel OpenAI
  try {
    const response = await fetch(
      "https://api.openai.com/v1/realtime/client_secrets",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          session: {
            type: "realtime",
            model: "gpt-realtime",
          },
        }),
      }
    );

    const data = await response.json();
    return res.status(200).json(data);

  } catch (err) {
    return res.status(500).json({ error: "Erreur interne du serveur." });
  }
}

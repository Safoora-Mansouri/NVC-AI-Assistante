const express = require("express");
const axios = require("axios");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("./db");


require("dotenv").config();

const app = express();
const JWT_SECRET = "nvc_secret";

/* ================= MIDDLEWARE ================= */
app.use(cors({
  origin: "http://localhost:8080",
  credentials: true
}));

app.use(express.json());

/* ================= UTIL ================= */
function safeJSONParse(text) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function emptyResponse() {
  return {
    nvc_translation: "",
    feelings: { primary: [], secondary: [] },
    needs: { emotional: [], relational: [], physical: [] },
    strategy: { first: [], second: [] }
  };
}

/* ================= CHAT ================= */
app.post("/chat", async (req, res) => {
  const { messages, userName } = req.body;

  try {
    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        // model: "llama-3.1-8b-instant",
        model: "openai/gpt-oss-20b",
        temperature: 0.7,

        messages: [
          {
            role: "system",
            content: `
You are a warm assistant based on Nonviolent Communication (NVC).

Rules:
- Be empathetic
- Reflect feelings and needs
- Do not be repetitive
- Do not overuse the user's name
            `
          },

          ...(userName
            ? [{ role: "system", content: `User: ${userName}` }]
            : []),

          ...messages
        ]
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    res.json({
      reply: response.data.choices[0].message.content
    });

  } catch (err) {
    // console.error("CHAT ERROR:", err.message);
    console.error("CHAT ERROR:", err.response?.data || err.message);

    res.status(500).json({
      reply: "Server connection issue."
    });
  }
});

/* ================= ANALYZE ================= */
app.post("/analyze", async (req, res) => {
  const { text, userName } = req.body;

  try {
    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
      
        model: "openai/gpt-oss-20b",
        temperature: 0.4,
        response_format: { type: "json_object" },

        messages: [
          {
            role: "system",
            content: `
You are an NVC analysis assistant.

Convert input into:
FEELINGS → NEEDS → STRATEGY

Rules:
- No judgment
- No diagnosis
- Stay simple and structured
            `
          },

          ...(userName
            ? [{ role: "system", content: `User: ${userName}` }]
            : []),

          {
            role: "system",
            content: `
Return ONLY JSON:
{
  "nvc_translation": "",
  "feelings": {
    "primary": [],
    "secondary": []
  },
  "needs": {
    "emotional": [],
    "relational": [],
    "physical": []
  },
  "strategy": {
    "first": [],
    "second": []
  }
}
`
          },

          {
            role: "user",
            content: text
          }
        ]
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    const parsed = safeJSONParse(response.data.choices[0].message.content);

    if (!parsed) {
      return res.status(500).json(emptyResponse());
    }

    res.json(parsed);

  } catch (err) {
    console.error("ANALYZE ERROR:", err.message);
    res.status(500).json(emptyResponse());
  }
});

/* ================= AUTH ================= */

/* ================= MIDDLEWARE ================= */
app.use(cors({
  origin: "http://localhost:8080"
}));

app.use(express.json());

/* ================= REGISTER ================= */
app.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const hash = await bcrypt.hash(password, 10);

    db.query(
      "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
      [name, email, hash],
      (err) => {
        if (err) {
          return res.status(500).json({
            message: "Database error",
            error: err
          });
        }

        res.json({ message: "User registered successfully" });
      }
    );

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ================= LOGIN ================= */
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  db.query(
    "SELECT * FROM users WHERE email = ?",
    [email],
    async (err, results) => {

      if (err) {
        return res.status(500).json({ message: "DB error" });
      }

      if (!results || results.length === 0) {
        return res.status(401).json({ message: "User not found" });
      }

      const user = results[0];

      try {
        const match = await bcrypt.compare(password, user.password);

        if (!match) {
          return res.status(401).json({ message: "Wrong password" });
        }

        const token = jwt.sign(
          { id: user.id, name: user.name },
          JWT_SECRET,
          { expiresIn: "7d" }
        );

        res.json({
          token,
          user: {
            id: user.id,
            name: user.name
          }
        });

      } catch (e) {
        res.status(500).json({ message: e.message });
      }
    }
  );
});

/* ================= START SERVER ================= */
app.listen(3000, () => {
  console.log("✅ Server running on http://localhost:3000");
});
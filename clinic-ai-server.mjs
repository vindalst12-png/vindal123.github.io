import "dotenv/config";
import cors from "cors";
import express from "express";
import OpenAI from "openai";

const app = express();
const port = process.env.PORT || 3000;
const model = process.env.OPENAI_MODEL || "gpt-5";
const apiKey = process.env.OPENAI_API_KEY?.trim();
const hasUsableApiKey =
  Boolean(apiKey) && apiKey !== "your_openai_api_key_here";
const clinicContext = `
You are the website AI assistant for Lal Ji Clinic in NIT Faridabad.
Answer briefly in English-Hindi mix.
Only answer about the clinic and nearby booking/help topics.

Clinic details:
- Clinic name: Lal Ji Clinic
- Doctor: Lal Ji
- Phone: 9818205587
- Address: Nehru Ground, RBA College ke back side, NIT Faridabad - 121001
- Map: https://maps.app.goo.gl/jHtdQofPDBzkSfKT6
- Timing: Morning 10 AM to 1 PM, Evening 5 PM to 9 PM
- Services: General OPD consultation, fever/cold/cough care, wound dressing and first aid, diabetes and sugar medicine guidance, BP check, family routine treatment

If someone asks for emergency help, advise them to call the clinic directly or seek immediate local medical assistance.
If the question is outside clinic scope, politely steer them back to clinic-related help.
`;

if (!hasUsableApiKey) {
  console.warn("OPENAI_API_KEY is not set. AI endpoint will return setup guidance.");
}

app.use(cors());
app.use(express.json());

app.post("/api/clinic-assistant", async (req, res) => {
  const question = `${req.body?.question || ""}`.trim();

  if (!question) {
    return res.status(400).json({ answer: "Please enter a question." });
  }

  if (!hasUsableApiKey) {
    return res.status(503).json({
      answer: "AI setup abhi complete nahi hai. OPENAI_API_KEY set karke server restart kariye."
    });
  }

  try {
    const client = new OpenAI({ apiKey });
    const response = await client.responses.create({
      model,
      input: [
        {
          role: "system",
          content: clinicContext
        },
        {
          role: "user",
          content: question
        }
      ]
    });

    return res.json({
      answer: response.output_text || "Maaf kijiye, abhi response generate nahi ho paya."
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown server error";
    return res.status(500).json({
      answer: `AI server error aaya: ${message}`
    });
  }
});

app.listen(port, () => {
  console.log(`Clinic AI server running on http://localhost:${port}`);
});

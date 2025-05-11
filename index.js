const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const OpenAI = require("openai");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

// OpenAIの初期化
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// POSTリクエストでコメントと格言を生成
app.post("/comment", async (req, res) => {
  const prompt = req.body.prompt || "今日を振り返って";

  try {
    const chatCompletion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "あなたは日々の振り返りに対して優しいコメントを返し、翌日の心の糧となる哲学的な格言を1つ添える、穏やかなカウンセラーです。"
        },
        {
          role: "user",
          content: `${prompt}\n\n以下の条件を守ってください。\n・コメントと格言は分けて返してください。\n・格言には必ず「≪格言≫」で始めてください。\n・格言は哲学的・内省的な名言から選んでください。`
        }
      ],
      temperature: 0.8
    });

    const message = chatCompletion.choices[0].message.content;
    res.json({ message });
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ error: "OpenAIリクエストに失敗しました。" });
  }
});

// ポート設定
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

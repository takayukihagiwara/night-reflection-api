const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { Configuration, OpenAIApi } = require("openai");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

app.post("/comment", async (req, res) => {
  try {
    const { mood, goodThings } = req.body;

    const userPrompt = `
以下の内容をもとに：
- 気分スコア：${mood}
- 良かったこと：
${goodThings.map((item, index) => `${index + 1}. ${item.good}（理由：${item.reason}）`).join("\n")}

この人の今日の振り返りに対して：
1. やさしい一言を短く届けてください。
2. 哲学的な格言を1つ添えてください。
格言は「＜格言＞」で始めてください。
コメントと格言は1つの文章で返してください。
`;

    const completion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "あなたは利用者の心を穏やかにするカウンセラーです。短くやさしいコメントと、哲学的で深みのある格言を一緒に届けてください。",
        },
        {
          role: "user",
          content: userPrompt,
        },
      ],
      temperature: 0.8,
    });

    const fullText = completion.data.choices[0].message.content;
    const [kindComment, quotePart] = fullText.split("＜格言＞");
    const quote = quotePart ? "＜格言＞" + quotePart.trim() : "";

    res.json({
      comment: kindComment.trim(),
      quote: quote,
    });
  } catch (error) {
    console.error("エラー:", error);
    res.json({
      comment: "エラーが発生しました",
      quote: "",
    });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

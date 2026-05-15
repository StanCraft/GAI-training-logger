export default async function handler(req, res) {
    try {
      const { workout } = req.body;
  
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.CLAUDE_API_KEY,
          "anthropic-version": "2023-06-01"
        },
        body: JSON.stringify({
          model: "claude-3-haiku-20240307",
          max_tokens: 80,
          messages: [
            {
              role: "user",
              content: `Give short gym encouragement for this workout:\n${workout}`
            }
          ]
        })
      });
  
      const data = await response.json();
  
      const message =
        data?.content?.[0]?.text ||
        "Good work today. Keep going.";
  
      res.status(200).json({ message });
    } catch (err) {
      res.status(500).json({ message: "Failed to generate message" });
    }
  }
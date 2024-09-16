import {
  GoogleGenerativeAI,
  GenerateContentResult,
} from "@google/generative-ai";

interface Song {
  name: string;
  artist: string;
  album?: string;
  year?: string;
  genres?: string[];
  explanation?: string;
}

const MAX_RETRIES = 2;
const TIMEOUT = 50000; // 50 seconds

export async function POST(request: Request) {
  let retries = 0;

  while (retries <= MAX_RETRIES) {
    try {
      const { song } = await request.json();

      if (!song || typeof song !== "string") {
        return Response.json({ error: "Invalid song input" }, { status: 400 });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("GEMINI_API_KEY is not set");
      }

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });

      const prompt = `Generate a curated playlist of 5 songs similar to "${song}". For each song, provide:

1. Song title
2. Artist name
3. Album name (if applicable)
4. Release year
5. Genre(s)
6. A brief explanation (1-2 sentences) of why this song is similar to "${song}" in terms of style, mood, or musical elements.

Ensure a diverse selection within the similarity criteria, including both well-known and lesser-known artists. Avoid duplicate artists unless they have a particularly relevant song. Format the response as a JSON array of objects, each containing the fields: name, artist, album, year, genres (as an array), and explanation. Ensure the JSON is valid and properly formatted. Do not include any markdown formatting, code block syntax, or additional text in your response. The response should be a valid JSON array and nothing else.`;

      const result = (await Promise.race([
        model.generateContent(prompt),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Timeout")), TIMEOUT)
        ),
      ])) as GenerateContentResult;

      const responseText = result.response.text();

      // Clean up the response
      const cleanedResponse = responseText
        .replace(/```json\s*|\s*```/g, "")
        .replace(/^\s*\[|\]\s*$/g, "")
        .replace(/},\s*{/g, "},\n{")
        .trim();

      let playlist: Song[];
      try {
        playlist = JSON.parse(`[${cleanedResponse}]`);
      } catch (parseError) {
        console.error("JSON parsing failed:", parseError);
        const lines = cleanedResponse.split("\n");
        playlist = lines.map((line) => {
          try {
            return JSON.parse(line);
          } catch {
            return { name: "Unknown", artist: "Unknown" };
          }
        });
      }

      playlist = playlist
        .filter((song) => song && typeof song === "object")
        .map((song) => ({
          name: song.name || "Unknown",
          artist: song.artist || "Unknown",
          album: song.album,
          year: song.year,
          genres: Array.isArray(song.genres) ? song.genres : [],
          explanation: song.explanation,
        }));

      if (playlist.length === 0) {
        throw new Error("Failed to generate a valid playlist");
      }

      return Response.json({ playlist });
    } catch (error) {
      console.error(
        `Error in generate-playlist route (attempt ${retries + 1}):`,
        error
      );
      retries++;

      if (retries > MAX_RETRIES) {
        return Response.json(
          { error: "Failed to generate playlist after multiple attempts" },
          { status: 500 }
        );
      }
    }
  }
}

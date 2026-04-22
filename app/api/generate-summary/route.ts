import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: Request) {
    const { content } = await req.json();

    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

    const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
    });

    const result = await model.generateContent(
        `Summarize this blog in about 200 words:\n${content}`
    );

    return Response.json({
        summary: result.response.text(),
    });
}
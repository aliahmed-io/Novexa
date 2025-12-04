import { NextResponse } from "next/server";

export async function GET() {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        return NextResponse.json({ success: false, error: "API Key Missing" }, { status: 500 });
    }

    const prompt = "A futuristic sneaker, neon colors, 4k, studio lighting";

    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-001:predict?key=${apiKey}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    instances: [
                        {
                            prompt: prompt,
                        },
                    ],
                    parameters: {
                        sampleCount: 1,
                        aspectRatio: "1:1",
                    },
                }),
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            return NextResponse.json({ success: false, error: errorText }, { status: response.status });
        }

        const data = await response.json();

        if (data.predictions && data.predictions.length > 0) {
            // Don't return the full base64 to avoid huge response, just success
            return NextResponse.json({ success: true, message: "Image generated successfully" });
        } else {
            return NextResponse.json({ success: false, error: "No predictions returned" }, { status: 500 });
        }
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

import { NextResponse } from "next/server";

export async function GET() {
    const prompt = "futuristic sneaker neon colors 4k studio lighting";
    const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1024&height=1024&model=flux&nologo=true`;

    try {
        const response = await fetch(url);
        if (response.ok) {
            return NextResponse.json({ success: true, url: url });
        } else {
            return NextResponse.json({ success: false, status: response.status });
        }
    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message });
    }
}

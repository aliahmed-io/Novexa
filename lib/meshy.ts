import axios from "axios";

const MESHY_API_KEY = process.env.MESHY_API_KEY;

if (!MESHY_API_KEY) {
    // We'll log a warning but not throw immediately to allow build, 
    // as user promised to add key later.
    console.warn("MESHY_API_KEY is missing from environment variables.");
}

const client = axios.create({
    baseURL: "https://api.meshy.ai/v2",
    headers: {
        Authorization: `Bearer ${MESHY_API_KEY}`,
    },
});

export async function createMeshyTask(imageUrl: string) {
    try {
        const response = await client.post("/image-to-3d", {
            image_url: imageUrl,
            enable_pbr: true,
            should_remesh: true,
            webhook_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/meshy`,
        });
        return response.data;
    } catch (error) {
        console.error("Error creating Meshy task:", error);
        throw error;
    }
}

export async function getMeshyTask(taskId: string) {
    try {
        const response = await client.get(`/image-to-3d/${taskId}`);
        return response.data;
    } catch (error) {
        console.error("Error getting Meshy task:", error);
        throw error;
    }
}

import { defineConfig } from "prisma/config";
import { config } from "dotenv";

config({ path: '.env' });
config({ path: '.env.local' });


export default defineConfig({
    schema: 'prisma/schema.prisma',
    migrations: {
        path: 'prisma/migrations',
    },
    datasource: {
        url: (process.env.DATABASE_URL || "").replace("&channel_binding=require", "") + "&sslmode=no-verify&connect_timeout=30"
    }
});

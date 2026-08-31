import {defineConfig} from "astro/config";

// https://astro.build/config
import icon from "astro-icon";
import vercel from "@astrojs/vercel";
import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
    site: 'https://hssan.dev',
    output: 'server',
    adapter: vercel(),
    integrations: [icon({
        include: {
            "simple-icons": ["*"],
            "mdi": ["*"]
        }
    })],
    vite: {
        plugins: [tailwindcss()],
    },
});

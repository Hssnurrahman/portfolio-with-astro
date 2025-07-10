import {defineConfig} from "astro/config";

// https://astro.build/config
import tailwind from "@tailwindcss/vite";
import icon from "astro-icon";


// https://astro.build/config
export default defineConfig({
    integrations: [tailwind(), icon({
        include: {
            "simple-icons": ["*"],
            "mdi": ["*"]
        }
    })],
});

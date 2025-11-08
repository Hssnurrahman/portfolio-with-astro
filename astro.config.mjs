import {defineConfig} from "astro/config";

// https://astro.build/config
import tailwind from "@astrojs/tailwind";
import icon from "astro-icon";
import vercel from "@astrojs/vercel";


// https://astro.build/config
export default defineConfig({
    site: 'https://hssan.dev',
    output: 'server',
    adapter: vercel(),
    integrations: [tailwind({
        applyBaseStyles: false,
    }),
        icon({
            include: {
                "simple-icons": ["*"],
                "mdi": ["*"]
            }
        },),
    ],
});

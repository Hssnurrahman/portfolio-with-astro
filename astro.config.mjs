import {defineConfig} from "astro/config";

// https://astro.build/config
import tailwind from "@astrojs/tailwind";
import icon from "astro-icon";
import node from "@astrojs/node";


// https://astro.build/config
export default defineConfig({
    output: 'server',
    adapter: node({
        mode: 'standalone'
    }),
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

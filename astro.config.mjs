import {defineConfig, envField} from "astro/config";

// https://astro.build/config
import icon from "astro-icon";
import vercel from "@astrojs/vercel";
import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
    site: 'https://hssan.dev',
    output: 'server',
    adapter: vercel(),
    // Read at runtime via getSecret() from astro:env/server, so secrets are never
    // inlined into the build output. Optional: a missing value makes the endpoint 500.
    env: {
        schema: {
            HUMKALAM_AGORA_APP_ID: envField.string({context: "server", access: "secret", optional: true}),
            HUMKALAM_AGORA_APP_CERTIFICATE: envField.string({context: "server", access: "secret", optional: true}),
            HUMKALAM_FIREBASE_PROJECT_ID: envField.string({context: "server", access: "secret", optional: true}),
        },
    },
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

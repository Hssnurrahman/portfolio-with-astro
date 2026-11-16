import {defineConfig, envField} from "astro/config";

// https://astro.build/config
import icon from "astro-icon";
import vercel from "@astrojs/vercel";
import tailwindcss from "@tailwindcss/vite";
import sitemap from "@astrojs/sitemap";

// https://astro.build/config
export default defineConfig({
    site: 'https://hssan.dev',
    output: 'server',
    adapter: vercel(),
    // Read at runtime via getSecret() from astro:env/server, so secrets are never
    // inlined into the build output. Optional: a missing value makes the endpoint 500.
    env: {
        schema: {
            RESEND_API_KEY: envField.string({context: "server", access: "secret", optional: true}),
            CONTACT_EMAIL: envField.string({context: "server", access: "secret", optional: true}),
            RESEND_FROM_EMAIL: envField.string({context: "server", access: "secret", optional: true}),
            HUMKALAM_AGORA_APP_ID: envField.string({context: "server", access: "secret", optional: true}),
            HUMKALAM_AGORA_APP_CERTIFICATE: envField.string({context: "server", access: "secret", optional: true}),
            HUMKALAM_FIREBASE_PROJECT_ID: envField.string({context: "server", access: "secret", optional: true}),
        },
    },
    integrations: [sitemap(), icon({
        include: {
            "simple-icons": ["*"],
            "mdi": ["*"]
        }
    })],
    vite: {
        plugins: [tailwindcss()],
    },
});

export interface Project {
    name: string;
    description: string;
    href: string;
    tags: string[];
    featured?: boolean;
    category: "Web" | "Mobile";
    highlights?: string[];
    /** Case-study content, shown only on the project's own page. */
    details?: ProjectDetails;
}

export interface ProjectDetails {
    tagline: string;
    overview: string[];
    features: { title: string; description: string }[];
    technical: string[];
    challenges?: { title: string; solution: string }[];
}

export const projects: Project[] = [
    {
        name: "Devvoir",
        description:
            "Devvoir is an AI-powered tool that turns your GitHub pull requests into polished standup, technical, or executive reports in seconds, for any date range.",
        href: "https://app.devvoir.com",
        tags: ["Next.js", "Mistral AI", "PostgreSQL", "Prisma", "NextAuth", "Vercel"],
        featured: true,
        category: "Web",
        highlights: [
            "AI-written reports from your GitHub pull requests",
            "Standup, technical, or executive tone",
            "Built with Next.js, Prisma, and Mistral AI",
        ],
        details: {
            tagline:
                "AI-written standup and progress reports built from your GitHub pull requests, in the tone and length you choose.",
            overview: [
                "Devvoir is a web app for developers who have to write status updates. You sign in with GitHub, pick your personal account or an organization, then a repository, a branch, and a date range. Devvoir lists the matching pull requests, pulls the code diffs for the ones you select, and has an LLM turn them into a structured Markdown report that non-engineers can follow.",
                "Reports come in three tones: a brief standup, a detailed technical summary, or an executive overview for non-technical stakeholders. You can copy, regenerate, or export them as Markdown or PDF. Every account gets a monthly free quota, and extra report packs are sold through Lemon Squeezy.",
            ],
            features: [
                {
                    title: "GitHub sign-in with organizations",
                    description:
                        "GitHub OAuth sign-in. The account picker lists your personal account and every organization you belong to.",
                },
                {
                    title: "Pull request selection",
                    description:
                        "Pull requests are fetched from the GitHub REST API and filtered by base branch and created-date range.",
                },
                {
                    title: "AI report generation",
                    description:
                        "Selected PR diffs go to Mistral with a structured prompt. Every bullet starts with a verb such as Added, Updated, Fixed, or Refactored.",
                },
                {
                    title: "Configurable tone and length",
                    description:
                        "Choose standup, detailed, or executive tone and concise, standard, or comprehensive length. Length also sets the token budget.",
                },
                {
                    title: "Built-in diff viewer",
                    description:
                        "A custom diff component parses unified diff hunks and highlights syntax with Prism.js, so you can review changes next to the report.",
                },
                {
                    title: "Export and regenerate",
                    description:
                        "Download reports as Markdown, export to PDF, copy to the clipboard, or regenerate with the same settings. Reports are saved to Postgres.",
                },
                {
                    title: "Free quota and paid top-ups",
                    description:
                        "A monthly free report limit, with Lite and Pro packs sold through Lemon Squeezy and credited by a signed webhook.",
                },
            ],
            technical: [
                "Next.js 16 App Router with React 19, TypeScript, and Tailwind CSS v4, hosted on Vercel.",
                "Mistral AI (mistral-medium-latest) through the official SDK, with a system prompt assembled from tone and length modules. PR metadata such as title, labels, and description is added by code after generation rather than by the model.",
                "NextAuth with the GitHub provider and JWT sessions. The GitHub access token in the session is used for all GitHub REST API calls.",
                "PostgreSQL through Prisma 7 with the pg driver adapter. Models cover users, sessions, saved reports, and per-user quota settings.",
                "Lemon Squeezy checkout and webhook. The webhook verifies its HMAC-SHA256 signature with a timing-safe comparison before crediting reports.",
                "A daily Vercel Cron job resets each user's monthly usage on their reset date.",
            ],
            challenges: [
                {
                    title: "Large pull requests vs. the model's context window",
                    solution:
                        "Changed files are ranked by an importance score: lines changed plus diff hunks, weighted up for source files and down for lockfiles. Only the top files go to the model, and if the context is still too large the API returns a clear 413 asking you to select fewer PRs.",
                },
                {
                    title: "One report, different audiences",
                    solution:
                        "Separate tone and length instructions are appended to a strict base prompt, and the token cap scales with the chosen length, so a standup and an executive summary built from the same PRs each read the way they should.",
                },
                {
                    title: "Combining a free tier with paid credits",
                    solution:
                        "Generation draws on monthly credits first and purchased credits second. Purchased credits survive the monthly reset, and when both run out the API returns 429 with the reset date.",
                },
            ],
        },
    },
    {
        name: "DropShop",
        description:
            "DropShop is a full-stack eCommerce store with Safepay checkout, variant-level inventory, order status tracking, and an AI assistant that drafts product listings.",
        href: "https://drop-shop-shopify.vercel.app/",
        tags: ["Next.js", "tRPC", "MongoDB", "AWS S3", "Safepay", "Vercel"],
        category: "Web",
        details: {
            tagline:
                "A Next.js storefront with Safepay hosted checkout, variant-level inventory, and AI-assisted product listings.",
            overview: [
                "DropShop is a full-stack eCommerce app built with Next.js and MongoDB. Shoppers browse and filter a catalogue, pick product variants and sub-variants (for example colour, then size), check out as a guest or signed-in user, and pay through Safepay's hosted checkout. Signed-in customers can follow each order's status from their account.",
                "It is built for a small store owner who wants to run their own catalogue and orders without a hosted platform. A role-protected admin area covers products, categories, and orders, product media is stored on Amazon S3, and an AI assistant powered by Claude drafts product listings from an image or a short description.",
            ],
            features: [
                {
                    title: "Storefront with variants",
                    description:
                        "Search, sort, and filters, image and video galleries, and two levels of variants, each with its own price add-on, stock, and media.",
                },
                {
                    title: "Safepay hosted checkout",
                    description:
                        "The server creates a Safepay payment session and redirects to Safepay's hosted page. Payment is confirmed both on return and through a signed webhook.",
                },
                {
                    title: "Server-side order validation",
                    description:
                        "When an order is placed, stock is re-checked and every price is recomputed from the database, then stock is reduced at the variant level.",
                },
                {
                    title: "Order status tracking",
                    description:
                        "Orders move from pending to delivered with a separate payment status. Customers see status on their orders page, and admins filter and update orders.",
                },
                {
                    title: "Admin console",
                    description:
                        "Role-gated admin pages for creating and editing products with rich-text descriptions, managing categories, and handling orders.",
                },
                {
                    title: "AI product assistant",
                    description:
                        "Admins upload a product image or type a description and Claude drafts the listing. A URL-analysis option scrapes a product page as a starting point.",
                },
                {
                    title: "Large media uploads",
                    description:
                        "Images and videos upload straight from the browser to S3 using presigned multipart URLs, with progress tracking and resumable sessions.",
                },
            ],
            technical: [
                "Next.js 15 App Router with React 19 and TypeScript. Typed client-server calls use tRPC v11 with React Query and Zod.",
                "MongoDB through Mongoose, with nested variant and sub-variant schemas, auto-generated order numbers, and indexes for customer, status, and payment lookups.",
                "NextAuth credentials sign-in with bcrypt-hashed passwords and role-carrying JWT sessions. Middleware keeps non-admins out of the admin area.",
                "Safepay Node SDK with a sandbox/production switch. The webhook verifies an HMAC-SHA512 signature and checks amount, currency, and payment state before marking an order paid.",
                "AWS SDK v3 for S3 presigned and multipart uploads, with optional Transfer Acceleration. Images are served as WebP/AVIF through Next.js image optimization.",
                "Anthropic Claude API for product listing drafts, with Cheerio for scraping reference product pages. Styled with Tailwind CSS v4 and deployed on Vercel.",
            ],
            challenges: [
                {
                    title: "Stopping price tampering at checkout",
                    solution:
                        "The order endpoint ignores client-sent prices: it recomputes every line from the database, including variant add-ons, rejects any mismatch, and checks that the total equals subtotal plus shipping and tax.",
                },
                {
                    title: "Trusting the payment result",
                    solution:
                        "The Safepay session is stored on the order before redirecting, and the order is looked up by that session rather than by URL parameters. It is only marked paid when the payment has completed and the amount and currency match. The signed webhook makes the flow safe to run twice.",
                },
                {
                    title: "Uploads larger than serverless limits",
                    solution:
                        "Large product videos skip the server entirely. The browser uploads parts directly to S3 with presigned multipart URLs, and interrupted uploads can be resumed.",
                },
            ],
        },
    },
    {
        name: "Dairify",
        description:
            "Dairify is a bookkeeping app for milk-trading dairy businesses that records daily morning and evening sales and purchases, payments, party balances, and expenses.",
        href: "https://dairify.hssnurrahman.workers.dev/",
        tags: ["TanStack Start", "Cloudflare Workers", "Cloudflare D1", "Drizzle ORM", "TypeScript", "TailwindCSS"],
        category: "Web",
        details: {
            tagline:
                "A multi-tenant milk ledger for dairy businesses: daily sales, purchases, payments, balances, and expenses.",
            overview: [
                "Dairify is a bookkeeping web app, also installable as a PWA, for small dairy businesses that buy milk from suppliers and sell it to buyers. Each day an operator records the morning and evening milk quantity for every party, the rate per litre, and the amount paid or received. The app keeps running balances for every party and builds daily and date-range reports.",
                "It replaces paper registers. Each business gets its own private workspace, and the first account becomes the admin, who can add staff as operators or read-only viewers. It is set up for Pakistan out of the box (PKR, local time zone and date format), and also tracks expenses and keeps registers of workers, vehicles, and shops.",
            ],
            features: [
                {
                    title: "Daily milk entry",
                    description:
                        "One sale or purchase entry per party per day, with separate morning and evening quantities, rate per litre, and the amount paid or received.",
                },
                {
                    title: "Party ledger and balances",
                    description:
                        "Buyers and suppliers have opening balances. Remaining amounts carry forward and overpayments show as advances.",
                },
                {
                    title: "Reports",
                    description:
                        "Today, last 7 or 15 days, this month, or a custom range, for the whole business or one party, with milk sold vs purchased, cash in and out, expenses, and net cash. Reports are printable.",
                },
                {
                    title: "Dashboard",
                    description:
                        "The selected day's entries plus a chart that switches between money and litres over 7, 15, or 30 days.",
                },
                {
                    title: "Expenses",
                    description:
                        "Categorised expenses such as feed, fuel, salary, and rent, optionally linked to a worker, vehicle, or shop, with CSV and print/PDF export.",
                },
                {
                    title: "Workers, vehicles, and shops",
                    description:
                        "Registers of staff with role and monthly salary, vehicles with registration numbers, and shops with contact details.",
                },
                {
                    title: "Users and roles",
                    description:
                        "Admins add staff as admin, operator, or viewer. Operators only see the parties and entries they created, and viewers are read-only.",
                },
            ],
            technical: [
                "Full-stack TanStack Start (React 19 with file-based routing), deployed to Cloudflare Workers. All data access goes through typed server functions.",
                "Cloudflare D1 (SQLite) with Drizzle ORM and versioned SQL migrations. SQL views calculate party balances and daily and date-range reports.",
                "Money is stored as integer paisa and milk as millilitres, and line totals are recalculated on the server, so floating-point errors never reach a balance.",
                "Custom authentication: scrypt password hashing, hashed session tokens in HttpOnly cookies, login throttling with lockouts, and revocation of other sessions when a password changes.",
                "Middleware adds CSRF protection and strict security headers (CSP, HSTS, frame denial). A service worker pre-caches static assets and serves an offline fallback page.",
            ],
            challenges: [
                {
                    title: "Keeping tenants isolated in one database",
                    solution:
                        "Every query is scoped to the workspace from the session, and database triggers add a second check by rejecting any record that would link data across workspaces.",
                },
                {
                    title: "Getting money arithmetic exactly right",
                    solution:
                        "Amounts are integers rather than floats, totals are computed on the server instead of trusted from the browser, and reports come from SQL views, so balances and daily totals always agree.",
                },
                {
                    title: "Secure logins without an auth provider",
                    solution:
                        "Passwords are hashed with scrypt, login timing is equalised for unknown users, failed attempts are throttled, and changing a password revokes all other sessions.",
                },
            ],
        },
    },
    {
        name: "LedgerFlow",
        description:
            "LedgerFlow is a debt and credit book for small business owners. Manage multiple businesses, track customer-wise credit and debit with running balances, and share PDF statements on WhatsApp. The core ledger works offline, with PIN or biometric lock, due-date reminders, CSV export, backups, and dark mode.",
        href: "https://play.google.com/store/apps/details?id=com.ledgerflow.app&hl=en",
        tags: ["Flutter", "Dart", "SQLite", "Provider", "fl_chart", "PDF Generation", "Biometrics", "Google Mobile Ads", "Android"],
        category: "Mobile",
        details: {
            tagline:
                "An offline digital ledger for small businesses: track credit and debit per customer and share PDF statements, with no sign-up.",
            overview: [
                "LedgerFlow (\"LedgerFlow: Debt & Credit Book\" on Google Play) is a Flutter app for shopkeepers, freelancers, and small business owners. You record money given and received for each customer, and the app keeps a running balance so you always know who owes what.",
                "It replaces paper notebooks and slow phone spreadsheets. There is no account or login, and ledger data stays on the device in SQLite, so the core ledger works offline. The network is only used for sharing, ads, and update checks.",
            ],
            features: [
                {
                    title: "Multiple businesses",
                    description: "Keep separate businesses, each with its own customers, in one app.",
                },
                {
                    title: "Customer ledger",
                    description:
                        "Credit and debit entries with notes and up to three receipt photos each, a full history per customer, and a running balance.",
                },
                {
                    title: "PDF account statements",
                    description:
                        "Multi-page statements for any date range, grouped by month with subtotals and a closing balance, shared through the system share sheet.",
                },
                {
                    title: "WhatsApp sharing",
                    description: "Send a customer their statement or open a chat with them on WhatsApp in one tap.",
                },
                {
                    title: "Due-date reminders",
                    description: "Set due dates on balances and get local notifications when payments are due.",
                },
                {
                    title: "Reports dashboard",
                    description:
                        "Charts for activity trends, balance distribution, top customers, period comparison, and outstanding balances over any date range.",
                },
                {
                    title: "App lock",
                    description: "PIN, fingerprint, or face lock that re-locks whenever the app goes to the background.",
                },
                {
                    title: "Backup, export, and dark mode",
                    description:
                        "Compressed backups you can save anywhere and restore later, CSV export of customers and transactions, and a dark theme.",
                },
            ],
            technical: [
                "Flutter and Dart with Provider for state management, and a repository layer for report queries.",
                "Local SQLite through sqflite at schema version 10, with step-by-step migrations and indexes for customer and date lookups.",
                "Backups are gzipped JSON, and receipt photos are resized and re-encoded before they are embedded. Restore detects compressed files by their magic bytes, so older plain-JSON backups still restore.",
                "PDF statements are generated on the device with the pdf and printing packages, using bundled fonts and a multi-page layout that repeats table headers.",
                "An app-lifecycle observer drives the auto-lock (local_auth plus PIN) and a usage-based in-app review prompt. Ads are AdMob native ads placed inside the lists.",
            ],
            challenges: [
                {
                    title: "Restores failing on duplicate records",
                    solution:
                        "Restore runs inside a single transaction, matches incoming businesses and customers against existing ones, and remaps their IDs, so restoring into a non-empty app skips duplicates instead of failing.",
                },
                {
                    title: "Multi-page PDF layout bugs",
                    solution:
                        "Fixed a duplicated table header on the second page and a clipped closing-balance label by restructuring how the final table section renders and letting long labels wrap.",
                },
                {
                    title: "Backups bloated by receipt photos",
                    solution:
                        "Backups are gzip-compressed and photos are resized and re-encoded as JPEG before being embedded, with a plain-JSON fallback if compression fails.",
                },
            ],
        },
    },
    {
        name: "KitchenKeep",
        description:
            "A smart grocery list app with a focused in-store mode, reusable list templates, spending tracking, and restock suggestions based on your purchase history.",
        href: "https://play.google.com/store/apps/details?id=com.kitchenkeep.app",
        tags: ["Flutter", "Dart", "BLoC", "SQLite", "SharedPreferences", "GetIt", "Android"],
        category: "Mobile",
        details: {
            tagline:
                "An offline grocery list app with a store mode, reusable templates, spending breakdowns, and restock suggestions.",
            overview: [
                "KitchenKeep is an Android grocery list app for households that shop regularly and want their lists and spending in one place. You keep several shopping lists, add items with quantities, units, notes, and prices, sort them into categories, and tick them off in a large-tile Store Mode while you shop.",
                "Everything is stored on the device, with no account and no network calls. Each checked-off item is logged to a purchase history, which powers spending breakdowns by category and month and suggests items you regularly buy when they are due again. Item entry autocompletes from a built-in catalogue of about a thousand products, including South Asian names.",
            ],
            features: [
                {
                    title: "Multiple shopping lists",
                    description:
                        "Create, rename, and delete lists, with items grouped by category and swipe-to-delete with undo.",
                },
                {
                    title: "Store Mode",
                    description:
                        "A focused in-store view with large tiles, a progress bar, search, and unchecked items kept above checked ones.",
                },
                {
                    title: "Price capture at checkout",
                    description:
                        "Checking off an unpriced item asks for its price, pre-filled with the last price you paid.",
                },
                {
                    title: "Spending tracker",
                    description: "Totals of what you bought, broken down by category and by month.",
                },
                {
                    title: "Restock suggestions",
                    description:
                        "Learns how often you buy each item and suggests the ones that are nearly due, most overdue first. One tap adds an item to your list.",
                },
                {
                    title: "Templates",
                    description:
                        "Save any list as a reusable template, including units, prices, and notes, and start new lists from it.",
                },
                {
                    title: "Smart entry, sharing, and search",
                    description:
                        "Autocomplete with sensible default units, lists shared as formatted text with totals, and search across every list.",
                },
            ],
            technical: [
                "Clean-architecture layering: domain entities and repository interfaces, a data layer on sqflite, and a presentation layer of BLoCs, pages, and widgets.",
                "Four BLoCs for lists, items, templates, and search, wired up with GetIt dependency injection and provided at the app root.",
                "SQLite schema at version 13 with step-by-step migrations, foreign keys with cascading deletes, and indexes on list and item lookups.",
                "Restock suggestions are calculated from purchase history with SQL grouping plus an average-interval and due-ratio calculation in Dart.",
                "Settings such as currency, default sort, and per-category default units are stored in SharedPreferences. Material 3 light and dark themes follow the system setting.",
            ],
            challenges: [
                {
                    title: "Double-taps corrupting check state",
                    solution:
                        "Checking an item flips its state atomically in SQL inside a transaction, then reads it back, and only writes to purchase history when the item actually becomes checked.",
                },
                {
                    title: "Evolving the schema without losing data",
                    solution:
                        "Thirteen versioned migrations upgrade existing installs in place. Column type changes rebuild the table inside a transaction, so a failed upgrade cannot leave the database half-migrated.",
                },
                {
                    title: "Recording prices without nagging",
                    solution:
                        "The last known price is looked up by normalised item name and filled in automatically when an item is added, so you are only asked for prices the app has never seen.",
                },
            ],
        },
    },
    {
        name: "Quivora Chat",
        description:
            "Chat with Gemini, Claude, and GPT-4o in one app, and analyze photos and documents in your conversations. A simple, modern AI chat app for students, professionals, and creative minds.",
        href: "https://play.google.com/store/apps/details?id=com.quivora.chat&hl=en",
        tags: ["Flutter", "Supabase", "Claude API", "OpenAI API", "Gemini API", "Google AdMob"],
        category: "Mobile",
        details: {
            tagline:
                "A Flutter app for chatting with Gemini, Claude, and GPT-4o in one place, with image and document analysis.",
            overview: [
                "Quivora Chat is a cross-platform Flutter app where you pick a model from Google, Anthropic, or OpenAI and chat with it. You can attach photos for vision-capable models, or PDF, DOCX, TXT, and Markdown files, whose text is extracted on the device and added to the conversation. Conversations, messages, and files are saved to your account with Supabase.",
                "Usage runs on credits: each model costs a set amount per message, from cheap fast models to premium ones. New users get a welcome balance and can earn more through rewarded ads, daily rewards, and achievements. The same product family includes a Next.js web client, a Telegram bot, and a terminal client written in Go.",
            ],
            features: [
                {
                    title: "Multi-provider model picker",
                    description:
                        "Gemini 2.5 Flash and Pro, Claude 3.5 Haiku, Claude Sonnet 4 and 4.5, and GPT-4o, each showing its credit cost per message.",
                },
                {
                    title: "Streaming responses",
                    description: "Replies stream in token by token, and you can stop a response mid-stream.",
                },
                {
                    title: "Image analysis",
                    description:
                        "Attach photos from the camera or gallery. They are compressed on the device before being sent to vision models.",
                },
                {
                    title: "Document analysis",
                    description:
                        "Attach PDF, DOCX, TXT, or Markdown files up to 10 MB. Text is extracted on the device and the original is kept in cloud storage.",
                },
                {
                    title: "Cloud conversation history",
                    description:
                        "Conversations sync to your account, protected by row-level security. Rename conversations, and retry or delete messages.",
                },
                {
                    title: "Accounts",
                    description:
                        "Email and password or Google sign-in, with password reset through deep links that open straight in the app.",
                },
                {
                    title: "Credits and rewards",
                    description:
                        "Per-message credits, topped up through rewarded ads, daily rewards, and achievement points that convert to credits.",
                },
                {
                    title: "Polished chat UI",
                    description:
                        "Markdown rendering, syntax-highlighted code blocks, light and dark themes, a connection indicator, and a low-credit banner.",
                },
            ],
            technical: [
                "Flutter and Dart, with an AI service layer that routes each request to a per-provider implementation for Anthropic, OpenAI, and Google based on the selected model.",
                "Streaming is implemented by parsing Server-Sent Events from the chunked HTTP response by hand, so replies render as they arrive.",
                "Supabase handles authentication (email and Google OAuth), Postgres tables protected by row-level security, a trigger that sets up each new user's profile, and Storage for uploaded files.",
                "Credits and rewards run as Postgres functions, so balances are only changed inside the database.",
                "A lightweight reasoning helper spots math, logic, and code prompts and asks capable models to work step by step.",
                "Companion clients: a Next.js 15 web app with Drizzle on Neon Postgres, a grammY Telegram bot, and a Go command-line client.",
            ],
            challenges: [
                {
                    title: "Never double-spending credits",
                    solution:
                        "Credit deduction is a single Postgres function that locks the user's row, checks the balance, and deducts in one transaction, so two messages sent at once can never overdraw an account.",
                },
                {
                    title: "Large phone photos and vision APIs",
                    solution:
                        "Images are capped at 1920px wide and JPEG quality is stepped down until the file fits a target size, then encoded in the format each provider expects.",
                },
                {
                    title: "Using PDFs and Word files in chat",
                    solution:
                        "Text is extracted on the device: PDFs through a PDF library, and DOCX files by unzipping the document and reading its text runs directly. Only the text goes to the model.",
                },
            ],
        },
    },
];

export function projectSlug(project: Project): string {
    return project.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

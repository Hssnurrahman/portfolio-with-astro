export interface Project {
    name: string;
    description: string;
    href: string;
    tags: string[];
    featured?: boolean;
    category: "Web" | "Mobile";
    highlights?: string[];
}

export const projects: Project[] = [
    {
        name: "Devvoir",
        description:
            "Devvoir is an AI-powered platform that automatically generates professional daily or weekly reports from your GitHub activity, helping developers save time and stay organized.",
        href: "https://app.devvoir.com",
        tags: ["NextJS", "NeonDB", "ChatGPT", "Vercel"],
        featured: true,
        category: "Web",
        highlights: [
            "AI-generated reports from GitHub activity",
            "Daily & weekly automated digests",
            "Built with Next.js, NeonDB, and ChatGPT",
        ],
    },
    {
        name: "DropShop",
        description:
            "DropShop is a modern eCommerce platform offering secure payments, real-time order tracking, and a seamless shopping experience with an intuitive user interface.",
        href: "https://drop-shop-shopify.vercel.app/",
        tags: ["Next.js", "MongoDB", "AWS", "Vercel"],
        category: "Web",
    },
    {
        name: "Dairify",
        description:
            "Dairify is a dairy management platform that helps track milk production, animal health, and daily farm operations in one place.",
        href: "https://dairify.hssnurrahman.workers.dev/",
        tags: ["Cloudflare Workers", "TypeScript", "Hono", "TailwindCSS"],
        category: "Web",
    },
    {
        name: "LedgerFlow",
        description:
            "LedgerFlow is a smart business ledger and credit management app built for small business owners. It lets you manage multiple businesses, track customer-wise credit/debit transactions, view running balances, and generate PDF reports — all stored locally with no internet required. Features include WhatsApp payment reminders, QR code payments, CSV/PDF export, biometric app lock, dark mode, and Google AdMob integration.",
        href: "https://play.google.com/store/apps/details?id=com.ledgerflow.app&hl=en",
        tags: ["Flutter", "Dart", "SQLite", "Provider", "sqflite", "fl_chart", "Android", "iOS", "PDF Generation", "Google Mobile Ads", "Biometrics", "QR Code", "WhatsApp Integration", "CSV Export"],
        category: "Mobile",
    },
    {
        name: "KitchenKeep",
        description:
            "A smart grocery list management app for organizing shopping lists and tracking spending.",
        href: "https://play.google.com/store/apps/details?id=com.kitchenkeep.app",
        tags: ["Flutter", "Dart", "BLoC", "SQLite", "SharedPreferences", "GetIt", "Android"],
        category: "Mobile",
    },
    {
        name: "Quivora Chat",
        description:
            "Chat with multiple AI models like ChatGPT, Claude, and Gemini in one app, and analyze documents or images instantly. A simple, secure, and modern interface, making it the perfect AI chat solution for students, professionals, and creative minds.",
        href: "https://play.google.com/store/apps/details?id=com.quivora.chat&hl=en",
        tags: ["Flutter", "Supabase", "Fly.io", "Vercel"],
        category: "Mobile",
    },
];

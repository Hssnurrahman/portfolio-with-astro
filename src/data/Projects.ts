export interface Project {
    name: string;
    description: string;
    href: string;
    tags: string[];
    featured?: boolean;
    category: "Web" | "Mobile";
}

export const projects: Project[] = [
    // {
    //   name: "Audio Player",
    //   description:
    //     "Simple audio player app in which you can pick audio to play and pause it. It also shows you duration of audio in correct format.",
    //   href: "https://github.com/Hssnurrahman/audio-player",
    //   tags: ["Flutter", "Dart"],
    // },
    // {
    //     name: "ThreeJS Shirt",
    //     description:
    //         "This is a 3D model of a shirt which is rendered in 3D using ThreeJS.",
    //     href: "https://github.com/Hssnurrahman/threejs-project",
    //     tags: ["ThreeJS", "React", "Valtio"],
    // },
    {
        name: "Devvoir",
        description:
            "Devvoir is an AI-powered platform that automatically generates professional daily or weekly reports from your GitHub activity, helping developers save time and stay organized.",
        href: "https://app.devvoir.com",
        tags: ["NextJS", "NeonDB", "ChatGPT", "Vercel"],
        featured: true,
        category: "Web",
    },
    // {
    //     name: "Fake Data Generator",
    //     description:
    //         "This is fake data generator which is used to generate fake data for testing purpose.",
    //     href: "https://github.com/Hssnurrahman/fake-data-generator",
    //     tags: ["Prisma", "GraphQL", "PostgreSQL"],
    // },
    {
        name: "DropShop",
        description:
            "DropShop is a modern eCommerce platform offering secure payments, real-time order tracking, and a seamless shopping experience with an intuitive user interface.",
        href: "https://drop-shop.online",
        tags: ["Next.js", "MongoDB", "AWS", "Vercel"],
        category: "Web",
    },
    // {
    //     name: "Resume Builder",
    //     description:
    //         "This is fake data generator which is used to generate fake data for testing purpose.",
    //     href: "https://resume-builder-three-teal.vercel.app/",
    //     tags: ["Prisma", "GraphQL", "PostgreSQL"],
    // },
    {
        name: "ClipFetch",
        description:
            "A full-stack YouTube downloader web app that lets users download, trim, and convert YouTube videos. Supports multiple quality tiers (Guest, Free, Pro), audio extraction, subtitle downloads in various languages, and real-time progress via WebSockets.",
        href: "https://clipfetch.app",
        tags: ["React", "TypeScript", "Vite", "TailwindCSS", "FastAPI", "Python", "yt-dlp", "WebSockets", "Supabase", "Docker", "Fly.io", "Traefik"],
        category: "Web",
    },
    {
        name: "LedgerFlow",
        description:
            "LedgerFlow is a smart business ledger and credit management app built for small business owners. It lets you manage multiple businesses, track customer-wise credit/debit transactions, view running balances, and generate PDF reports — all stored locally with no internet required. Features include WhatsApp payment reminders, QR code payments, CSV/PDF export, biometric app lock, dark mode, and Google AdMob integration.",
        href: "/ledgerflow",
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

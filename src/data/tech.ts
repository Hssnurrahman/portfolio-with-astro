import type { TechCategory } from "./types";
import { languageIcons } from "./LanguageIcons";
import { frontendIcons } from "./FrontendIcons";
import { backendIcons } from "./BackendIcons";
import { mobileIcons } from "./MobileIcons";
import { databaseIcons } from "./DatabaseIcons";
import { toolsIcons } from "./ToolsIcons";

/**
 * Single source of truth for the Skills categories and their counts.
 * Both Skills.astro and About.astro derive their numbers from here, so adding
 * or removing a technology updates every count on the site automatically.
 */
export const techCategories: TechCategory[] = [
  {
    heading: "Languages",
    description: "Type-safe, expressive code",
    categoryIcon: "mdi:code-tags",
    icons: languageIcons,
  },
  {
    heading: "Frontend",
    description: "Interfaces users love",
    categoryIcon: "mdi:monitor-dashboard",
    icons: frontendIcons,
  },
  {
    heading: "Backend",
    description: "APIs and services at scale",
    categoryIcon: "mdi:server-network",
    icons: backendIcons,
  },
  {
    heading: "Mobile",
    description: "Cross-platform experiences",
    categoryIcon: "mdi:cellphone-link",
    icons: mobileIcons,
  },
  {
    heading: "Database",
    description: "SQL & NoSQL data stores",
    categoryIcon: "mdi:database",
    icons: databaseIcons,
  },
  {
    heading: "Cloud & Tools",
    description: "Shipping, deploying, iterating",
    categoryIcon: "mdi:tools",
    icons: toolsIcons,
  },
];

export const totalTech = techCategories.reduce((sum, c) => sum + c.icons.length, 0);

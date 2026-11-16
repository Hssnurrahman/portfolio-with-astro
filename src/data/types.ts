/** A single technology tile shown in the Skills section. */
export interface TechIcon {
  icon: string;
  className: string;
  ariaLabel: string;
  label: string;
}

/** A Skills category: its heading plus the technologies it contains. */
export interface TechCategory {
  heading: string;
  description: string;
  categoryIcon: string;
  icons: TechIcon[];
}

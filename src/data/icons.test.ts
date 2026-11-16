import { createRequire } from 'node:module';
import { describe, expect, it } from 'vitest';
import { techCategories } from './tech';
import { landingIcons } from './LandingIcons';

// Resolve the installed Iconify JSON directly so the test fails if a referenced
// icon was renamed or removed from the package (e.g. simple-icons:amazonaws).
const require = createRequire(import.meta.url);
const simpleIcons = require('@iconify-json/simple-icons/icons.json') as {
  icons: Record<string, unknown>;
};
const mdi = require('@iconify-json/mdi/icons.json') as { icons: Record<string, unknown> };

function iconExists(name: string): boolean {
  const [set, id] = name.split(':');
  if (!id) return false;

  const collection = set === 'simple-icons' ? simpleIcons : set === 'mdi' ? mdi : undefined;
  return Boolean(collection?.icons[id]);
}

describe('portfolio icon data', () => {
  it('references only icons that exist in the installed Iconify sets', () => {
    const names = [
      ...techCategories.flatMap((category) => [
        category.categoryIcon,
        ...category.icons.map((icon) => icon.icon),
      ]),
      ...landingIcons.map((icon) => icon.icon),
    ];

    expect(names.filter((name) => !iconExists(name))).toEqual([]);
  });

  it('does not list the same technology in more than one category', () => {
    const labels = techCategories.flatMap((category) => category.icons.map((icon) => icon.label));
    const duplicates = labels.filter((label, index) => labels.indexOf(label) !== index);

    expect([...new Set(duplicates)]).toEqual([]);
  });

  it('gives every technology its own color class', () => {
    const classNames = techCategories.flatMap((category) =>
      category.icons.map((icon) => icon.className)
    );
    const duplicates = classNames.filter((name, index) => classNames.indexOf(name) !== index);

    expect([...new Set(duplicates)]).toEqual([]);
  });
});

export interface Tab {
  slug: string;
  label: string;
  theme: string;
  order: number;
  description?: string;
}

export const tabs: Tab[] = [
  { slug: 'welcome',     label: 'Welcome',     theme: 'welcome',     order: 0 },
  { slug: 'vision',      label: 'Vision',      theme: 'vision',      order: 1 },
  { slug: 'experiments', label: 'Experiments', theme: 'experiments', order: 2 },
  { slug: 'thinking',    label: 'Thinking',    theme: 'thinking',    order: 3 },
  { slug: 'writing',     label: 'Writing',     theme: 'writing',     order: 4 },
  {
    slug: 'collaborate',
    label: 'Collaborate',
    theme: 'collaborate',
    order: 5,
    description: 'Open questions, community, and intellectual lineage.',
  },
];

export function getTab(slug: string): Tab | undefined {
  return tabs.find(t => t.slug === slug);
}

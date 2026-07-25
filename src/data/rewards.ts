import type { WorldId } from "./worlds";

/** Original pet characters — hatched by completing lessons in each world. */
export interface Pet {
  id: string;
  name: string;
  emoji: string;
  world: WorldId;
  /** Fraction of the world's lessons that must be completed to hatch. */
  milestone: number;
  spoken: string;
}

/**
 * Milestones are deliberately front-loaded: the very first lesson in a world
 * hatches a friend. For a 3-year-old, a reward that takes seven lessons to
 * arrive is a reward that never arrives — the first one has to land while the
 * child still remembers earning it. Later pets stretch further out, once the
 * habit (and the child's patience) has grown.
 */
export const PETS: Pet[] = [
  { id: "scooter", name: "Scooter the Squirrel", emoji: "🐿️", world: "playground", milestone: 0.1, spoken: "Scooter the squirrel loves your squiggles!" },
  { id: "poppy", name: "Poppy the Puppy", emoji: "🐶", world: "playground", milestone: 1, spoken: "Poppy the puppy is jumping for joy!" },
  { id: "fern", name: "Fern the Fox", emoji: "🦊", world: "forest", milestone: 0.04, spoken: "Fern the fox padded out of the forest to meet you!" },
  { id: "willow", name: "Willow the Owl", emoji: "🦉", world: "forest", milestone: 0.5, spoken: "Willow the owl says whoo-hoo for you!" },
  { id: "bramble", name: "Bramble the Bear", emoji: "🐻", world: "forest", milestone: 1, spoken: "Bramble the bear gives you a great big bear hug!" },
  { id: "rosie", name: "Rosie the Cloud Sheep", emoji: "🐑", world: "rainbow", milestone: 0.04, spoken: "Rosie the cloud sheep floated down to see you!" },
  { id: "pippin", name: "Pippin the Parrot", emoji: "🦜", world: "rainbow", milestone: 0.5, spoken: "Pippin the parrot is singing your name!" },
  { id: "luna", name: "Luna the Unicorn", emoji: "🦄", world: "rainbow", milestone: 1, spoken: "Luna the unicorn appeared in a burst of rainbows!" },
  { id: "bubbles", name: "Bubbles the Octopus", emoji: "🐙", world: "ocean", milestone: 0.1, spoken: "Bubbles the octopus wants a high five... times eight!" },
  { id: "finn", name: "Finn the Dolphin", emoji: "🐬", world: "ocean", milestone: 1, spoken: "Finn the dolphin did a triple flip for you!" },
  { id: "cosmo", name: "Cosmo the Star", emoji: "⭐", world: "space", milestone: 0.1, spoken: "Cosmo the star twinkled all the way here!" },
  { id: "nova", name: "Nova the Space Cat", emoji: "🐱", world: "space", milestone: 1, spoken: "Nova the space cat purred across the galaxy!" },
];

/** Treehouse decorations, unlocked by spending stars. */
export interface Decoration {
  id: string;
  name: string;
  emoji: string;
  cost: number;
}

export const DECORATIONS: Decoration[] = [
  { id: "lantern", name: "Firefly Lantern", emoji: "🏮", cost: 3 },
  { id: "flower", name: "Flower Pot", emoji: "🌻", cost: 3 },
  { id: "swing", name: "Rope Swing", emoji: "🪢", cost: 5 },
  { id: "flag", name: "Rainbow Flag", emoji: "🎏", cost: 5 },
  { id: "telescope", name: "Star Telescope", emoji: "🔭", cost: 8 },
  { id: "slide", name: "Curly Slide", emoji: "🛝", cost: 8 },
  { id: "hammock", name: "Cozy Hammock", emoji: "🛏️", cost: 10 },
  { id: "kite", name: "Dragon Kite", emoji: "🪁", cost: 10 },
  { id: "piano", name: "Tiny Piano", emoji: "🎹", cost: 12 },
  { id: "rocketbox", name: "Rocket Mailbox", emoji: "📮", cost: 12 },
  { id: "garden", name: "Butterfly Garden", emoji: "🦋", cost: 15 },
  { id: "disco", name: "Disco Ball", emoji: "🪩", cost: 20 },
];

export function getPet(id: string): Pet | undefined {
  return PETS.find((p) => p.id === id);
}

export function getDecoration(id: string): Decoration | undefined {
  return DECORATIONS.find((d) => d.id === id);
}

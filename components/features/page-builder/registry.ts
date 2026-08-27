import type { BlockCategory, BlockDefinition } from "./types";
import { heroLargeSplitBlock } from "./blocks/hero-large-split";
import { heroCenteredBlock } from "./blocks/hero-centered";

/**
 * Every working block, keyed by `type`. Adding another is a new folder under
 * `blocks/` plus one line here.
 */
export const BLOCK_REGISTRY: Record<string, BlockDefinition> = {
  [heroLargeSplitBlock.type]: heroLargeSplitBlock,
  [heroCenteredBlock.type]: heroCenteredBlock,
};

export const CATEGORY_ORDER: BlockCategory[] = [
  "hero",
  "text",
  "images",
  "media",
  "cards",
  "dynamic",
  "structure",
];

export const CATEGORY_LABELS: Record<BlockCategory, string> = {
  hero: "Hero",
  text: "Text",
  images: "Images",
  media: "Media",
  cards: "Cards",
  dynamic: "Dynamic",
  structure: "Structure",
};

export const CATEGORY_DOT: Record<BlockCategory, string> = {
  hero: "#3b82f6",
  text: "#22c55e",
  images: "#a855f7",
  media: "#f97316",
  cards: "#eab308",
  dynamic: "#ec4899",
  structure: "#94a3b8",
};

/**
 * Blocks shown in the picker but not yet implemented — they render as disabled
 * cards ("în curând"). Copy matches the design.
 */
export interface UpcomingBlock {
  name: string;
  description: string;
  category: BlockCategory;
}

export const UPCOMING_BLOCKS: UpcomingBlock[] = [
  {
    name: "Hero – Intro",
    description: "Secțiune intro cu fundal colorat și text scurt",
    category: "hero",
  },
  {
    name: "Hero – Statistics",
    description: "Hero cu contoare/statistici integrate",
    category: "hero",
  },
];

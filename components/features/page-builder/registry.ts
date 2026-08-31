import type { BlockCategory, BlockDefinition } from "./types";
import { heroLargeSplitBlock } from "./blocks/hero-large-split";
import { heroCenteredBlock } from "./blocks/hero-centered";
import { heroIntroBlock } from "./blocks/hero-intro";
import { heroStatisticsBlock } from "./blocks/hero-statistics";
import { featureCardsBlock } from "./blocks/feature-cards";
import { articleGridBlock } from "./blocks/article-grid";
import { programmeGridBlock } from "./blocks/programme-grid";
import { peopleGridBlock } from "./blocks/people-grid";
import { categoryGridBlock } from "./blocks/category-grid";
import { peopleCollectionBlock } from "./blocks/people-collection";
import { testimonialsBlock } from "./blocks/testimonials";
import { faqCollectionBlock } from "./blocks/faq-collection";
import { richTextBlock } from "./blocks/rich-text";

/**
 * Every working block, keyed by `type`. Adding another is a new folder under
 * `blocks/` plus one line here.
 */
export const BLOCK_REGISTRY: Record<string, BlockDefinition> = {
  [heroLargeSplitBlock.type]: heroLargeSplitBlock,
  [heroCenteredBlock.type]: heroCenteredBlock,
  [heroIntroBlock.type]: heroIntroBlock,
  [heroStatisticsBlock.type]: heroStatisticsBlock,
  [featureCardsBlock.type]: featureCardsBlock,
  [articleGridBlock.type]: articleGridBlock,
  [programmeGridBlock.type]: programmeGridBlock,
  [peopleGridBlock.type]: peopleGridBlock,
  [categoryGridBlock.type]: categoryGridBlock,
  [peopleCollectionBlock.type]: peopleCollectionBlock,
  [testimonialsBlock.type]: testimonialsBlock,
  [faqCollectionBlock.type]: faqCollectionBlock,
  [richTextBlock.type]: richTextBlock,
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

/** Icon-chip fill/foreground per category, matching the sidebar dot hue. */
export const CATEGORY_ICON: Record<BlockCategory, { bg: string; fg: string }> = {
  hero: { bg: "#eff6ff", fg: "#2563eb" },
  text: { bg: "#f0fdf4", fg: "#16a34a" },
  images: { bg: "#faf5ff", fg: "#9333ea" },
  media: { bg: "#fff7ed", fg: "#ea580c" },
  cards: { bg: "#fefce8", fg: "#ca8a04" },
  dynamic: { bg: "#fdf2f8", fg: "#db2777" },
  structure: { bg: "#f8fafc", fg: "#64748b" },
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

export const UPCOMING_BLOCKS: UpcomingBlock[] = [];

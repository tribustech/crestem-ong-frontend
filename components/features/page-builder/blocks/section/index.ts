import { Layers } from "lucide-react";
import { defineBlock } from "../../types";
import { SectionEditor } from "./Editor";
import { SectionBlock } from "./SectionBlock";
import { sectionSchema, SECTION_DEFAULTS } from "./schema";

export const sectionBlock = defineBlock({
  type: "section",
  category: "structure",
  name: "Section",
  description: "Container de grupare pentru blocuri de conținut înrudite",
  icon: Layers,
  schema: sectionSchema,
  defaults: SECTION_DEFAULTS,
  Editor: SectionEditor,
  Renderer: SectionBlock,
});

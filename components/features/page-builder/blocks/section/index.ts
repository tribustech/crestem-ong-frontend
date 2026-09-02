import { RectangleHorizontal } from "lucide-react";
import { defineBlock } from "../../types";
import { SectionEditor } from "./Editor";
import { SectionBlock } from "./SectionBlock";
import { sectionSchema, SECTION_DEFAULTS } from "./schema";

export const sectionBlock = defineBlock({
  type: "section",
  category: "structure",
  name: "Section",
  description: "Bandă de secțiune cu fundal, spațiere și titlu opțional",
  icon: RectangleHorizontal,
  schema: sectionSchema,
  defaults: SECTION_DEFAULTS,
  Editor: SectionEditor,
  Renderer: SectionBlock,
});

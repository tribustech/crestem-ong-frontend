import { MoveVertical } from "lucide-react";
import { defineBlock } from "../../types";
import { SpacerEditor } from "./Editor";
import { SpacerBlock } from "./SpacerBlock";
import { spacerSchema, SPACER_DEFAULTS } from "./schema";

export const spacerBlock = defineBlock({
  type: "spacer",
  category: "structure",
  name: "Spacer",
  description: "Spațiu vertical configurabil",
  icon: MoveVertical,
  schema: spacerSchema,
  defaults: SPACER_DEFAULTS,
  Editor: SpacerEditor,
  Renderer: SpacerBlock,
});

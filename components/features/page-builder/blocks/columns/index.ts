import { Columns2 } from "lucide-react";
import { defineBlock } from "../../types";
import { ColumnsEditor } from "./Editor";
import { ColumnsBlock } from "./ColumnsBlock";
import { columnsSchema, COLUMNS_DEFAULTS } from "./schema";

export const columnsBlock = defineBlock({
  type: "columns",
  category: "structure",
  name: "Columns",
  description: "Layout cu două sau trei coloane de text",
  icon: Columns2,
  schema: columnsSchema,
  defaults: COLUMNS_DEFAULTS,
  Editor: ColumnsEditor,
  Renderer: ColumnsBlock,
});

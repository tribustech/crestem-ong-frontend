import { serverApiFetch } from "./server";

export const MENU_LOCATIONS = ["header", "footer"] as const;

export type MenuLocation = (typeof MENU_LOCATIONS)[number];

export interface MenuChild {
  label: string;
  url: string;
}

export interface MenuItem {
  label: string;
  /**
   * Absent on a footer parent: those are column headings, not links. Present on
   * every header item.
   */
  url?: string;
  children: MenuChild[];
}

export interface Menu {
  documentId: string;
  location: MenuLocation;
  name: string;
  items: MenuItem[];
}

/** Both menus, ordered header first — the order the editor's list shows them in. */
export async function listMenus(): Promise<Menu[]> {
  const { data } = await serverApiFetch<{ data: Menu[] }>("/api/menus");
  return data;
}

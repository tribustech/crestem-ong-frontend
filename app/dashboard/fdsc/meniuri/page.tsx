import { getFooter } from "@/lib/api/footer";
import { listMenus } from "@/lib/api/menus";
import { MenuBuilder } from "@/components/features/menus/MenuBuilder";

export default async function Page() {
  const [menus, footer] = await Promise.all([listMenus(), getFooter()]);

  return <MenuBuilder menus={menus} footer={footer} />;
}

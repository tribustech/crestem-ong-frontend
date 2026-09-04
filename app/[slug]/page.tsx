import { notFound } from "next/navigation";
import { getPublicPage } from "@/lib/api/pages";
import { BlockRenderer } from "@/components/features/pages/BlockRenderer";

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = await getPublicPage(slug);

  // Missing and not-permitted are the same answer on purpose: a restricted page
  // must not confirm its own existence.
  if (!page) notFound();

  return <BlockRenderer blocks={page.blocuri} />;
}

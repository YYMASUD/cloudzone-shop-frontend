import { redirect } from "next/navigation";

/** /categories/[slug] is not a page — filter the products listing by category. */
export default async function CategoryDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  redirect(`/products?category=${encodeURIComponent(slug)}`);
}

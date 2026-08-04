/**
 * Wedding data is loaded in the authenticated dashboard, so its IDs are not
 * known while creating the GitHub Pages export.
 */
export function generateStaticParams(): { id: string }[] {
  return [];
}

export default function WeddingLayout({ children }: { children: React.ReactNode }) {
  return children;
}

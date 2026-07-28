import { SiteHeader } from "@/components/layout/site-header";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-full flex flex-col">
      <SiteHeader />
      <main className="flex-1">{children}</main>
    </div>
  );
}

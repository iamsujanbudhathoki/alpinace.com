import { SiteHeader } from "@/components/marketing/layout/site-header";
import { SiteFooter } from "@/components/marketing/layout/site-footer";
import { FloatingWhatsApp } from "@/components/marketing/layout/floating-whatsapp";
import { DetailNavProvider } from "@/lib/detail-nav-context";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DetailNavProvider>
      <div className="min-h-full flex flex-col justify-between">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <FloatingWhatsApp />
        <SiteFooter />
      </div>
    </DetailNavProvider>
  );
}

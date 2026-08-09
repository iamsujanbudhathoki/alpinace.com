import { SiteHeader } from "@/components/marketing/layout/site-header";
import { SiteFooter } from "@/components/marketing/layout/site-footer";
import { WhatsAppButton } from "@/components/marketing/layout/whatsapp-button";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-full flex flex-col justify-between">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
      <WhatsAppButton />
    </div>
  );
}

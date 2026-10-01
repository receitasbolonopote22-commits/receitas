import Header from "@/components/Header";
import Footer from "@/components/Footer";

/** Layout das páginas da biblioteca (todas protegidas pela senha — veja proxy.ts). */
export default function SiteLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <Header />
      <main id="conteudo" className="min-h-[70vh]">
        {children}
      </main>
      <Footer />
    </>
  );
}

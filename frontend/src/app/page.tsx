import Link from "next/link";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 flex flex-col">
        {/* 1. Hero Section */}
        <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden px-6 flex flex-col items-center text-center">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-glow-cyan opacity-40 pointer-events-none rounded-full blur-3xl -z-10" />
          
          <h1 className="text-[35px] md:text-[68px] font-medium leading-[1.2] md:leading-[0.94] tracking-[-0.025em] md:tracking-[-0.05em] text-porcelain max-w-4xl mb-6">
            Your wardrobe, analyzed by AI.
          </h1>
          
          <p className="text-[16px] md:text-[20px] text-cloudburst max-w-2xl mb-12 leading-relaxed">
            Upload your clothes, organize your wardrobe, and get outfit combinations based on color, weather, occasion, and personal style.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 items-center z-10">
            <Link href="/register">
              <Button variant="hero-ghost" size="xl" className="border border-starlight/20 hover:border-porcelain/50 bg-carbon/50 backdrop-blur-md">
                Start analyzing
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="ghost-cyan" size="lg">
                View demo →
              </Button>
            </Link>
          </div>
        </section>

        {/* 4/5. Previews (Dashboard & AI Combo) */}
        <section className="py-12 px-6 max-w-6xl mx-auto w-full relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            {/* Dashboard Preview */}
            <Card variant="translucent" className="p-6 md:p-8 transform md:rotate-[-2deg] shadow-2xl relative overflow-hidden group">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-glow-blue opacity-50 pointer-events-none transition-opacity" />
              <div className="flex items-center gap-2 mb-6 border-b border-starlight/10 pb-4">
                <div className="w-3 h-3 rounded-full bg-starlight/20"></div>
                <div className="w-3 h-3 rounded-full bg-starlight/20"></div>
                <div className="w-3 h-3 rounded-full bg-starlight/20"></div>
              </div>
              <h3 className="text-xl text-porcelain mb-4">Wardrobe Intelligence</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-carbon p-4 rounded-xl border border-starlight/5">
                  <p className="text-xs text-cloudburst mb-1 font-[family-name:var(--font-mono)]">TOTAL ITEMS</p>
                  <p className="text-3xl text-porcelain">142</p>
                </div>
                <div className="bg-carbon p-4 rounded-xl border border-starlight/5">
                  <p className="text-xs text-cloudburst mb-1 font-[family-name:var(--font-mono)]">COMBINATIONS</p>
                  <p className="text-3xl text-cyber-cyan">8,430</p>
                </div>
              </div>
            </Card>

            {/* AI Suggestion Preview */}
            <Card variant="translucent" className="p-6 md:p-8 transform md:rotate-[2deg] shadow-2xl mt-8 md:mt-16">
              <div className="flex items-center gap-2 mb-4 border-b border-starlight/10 pb-4">
                <span className="text-cyber-cyan">✦</span>
                <span className="text-sm font-[family-name:var(--font-mono)] text-porcelain">AI Recommendation</span>
              </div>
              <div className="space-y-3">
                <div className="h-12 bg-carbon rounded flex items-center px-4 border border-starlight/5">
                  <span className="text-sm text-cloudburst">Top:</span>
                  <span className="text-sm text-porcelain ml-2">Navy Cotton T-Shirt</span>
                </div>
                <div className="h-12 bg-carbon rounded flex items-center px-4 border border-starlight/5">
                  <span className="text-sm text-cloudburst">Bottom:</span>
                  <span className="text-sm text-porcelain ml-2">Beige Chino Pants</span>
                </div>
                <div className="bg-inkwell/50 p-3 rounded text-sm text-cloudburst mt-4 border-l-2 border-cyber-cyan">
                  Perfect for today's 72° clear weather. The navy and beige offer a classic, high-contrast casual look.
                </div>
              </div>
            </Card>
          </div>
        </section>

        {/* 2. How it works */}
        <section className="py-24 px-6 bg-inkwell relative mt-12">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-[24px] md:text-[35px] font-medium text-porcelain text-center mb-16 tracking-tight">
              How it works
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-carbon border border-cyber-cyan/30 flex items-center justify-center text-cyber-cyan text-xl mx-auto mb-6 shadow-[0_0_15px_rgba(82,225,254,0.15)] font-[family-name:var(--font-mono)]">01</div>
                <h3 className="text-lg font-medium text-porcelain mb-2">Upload</h3>
                <p className="text-sm text-cloudburst">Snap a photo of your clothes. Our AI automatically extracts categories, colors, and materials.</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-carbon border border-cyber-cyan/30 flex items-center justify-center text-cyber-cyan text-xl mx-auto mb-6 shadow-[0_0_15px_rgba(82,225,254,0.15)] font-[family-name:var(--font-mono)]">02</div>
                <h3 className="text-lg font-medium text-porcelain mb-2">Organize</h3>
                <p className="text-sm text-cloudburst">Build your digital closet. Track what you wear, what needs washing, and what you haven't touched.</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-carbon border border-cyber-cyan/30 flex items-center justify-center text-cyber-cyan text-xl mx-auto mb-6 shadow-[0_0_15px_rgba(82,225,254,0.15)] font-[family-name:var(--font-mono)]">03</div>
                <h3 className="text-lg font-medium text-porcelain mb-2">Combine</h3>
                <p className="text-sm text-cloudburst">Get instant AI outfit suggestions based on the current weather and your specific occasion.</p>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Features */}
        <section className="py-24 px-6 max-w-6xl mx-auto">
          <h2 className="text-[24px] md:text-[35px] font-medium text-porcelain mb-12 tracking-tight">
            Built for precision.
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card variant="translucent" className="p-8 min-h-[240px] flex flex-col justify-end">
              <span className="text-cyber-cyan mb-4 text-2xl">☁️</span>
              <h3 className="text-xl font-medium text-porcelain mb-2">Weather-Aware</h3>
              <p className="text-cloudburst text-sm">Integrates real-time weather data to suggest layers, fabrics, and colors suited for today's climate.</p>
            </Card>
            <Card variant="translucent" className="p-8 min-h-[240px] flex flex-col justify-end">
              <span className="text-cyber-cyan mb-4 text-2xl">🎨</span>
              <h3 className="text-xl font-medium text-porcelain mb-2">Color Theory Engine</h3>
              <p className="text-cloudburst text-sm">Analyzes primary and secondary colors using strict design principles to prevent clashing.</p>
            </Card>
            <Card variant="translucent" className="p-8 min-h-[240px] flex flex-col justify-end">
              <span className="text-cyber-cyan mb-4 text-2xl">📊</span>
              <h3 className="text-xl font-medium text-porcelain mb-2">Usage Analytics</h3>
              <p className="text-cloudburst text-sm">Monitor wear counts. Identify neglected items and optimize your minimalist capsule wardrobe.</p>
            </Card>
            <Card variant="translucent" className="p-8 min-h-[240px] flex flex-col justify-end">
              <span className="text-cyber-cyan mb-4 text-2xl">⚡</span>
              <h3 className="text-xl font-medium text-porcelain mb-2">Fast Organization</h3>
              <p className="text-cloudburst text-sm">Direct-to-S3 uploads and instant machine learning classification make digitizing your closet painless.</p>
            </Card>
          </div>
        </section>

        {/* 6. CTA Section */}
        <section className="py-32 px-6 border-t border-starlight/10 bg-inkwell relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl h-[400px] bg-glow-blue opacity-20 pointer-events-none rounded-full blur-3xl" />
          
          <div className="max-w-2xl mx-auto text-center relative z-10">
            <h2 className="text-[35px] font-medium text-porcelain mb-6 tracking-tight">
              Ready to upgrade your style?
            </h2>
            <p className="text-cloudburst mb-10">
              Join the beta today and let Midnight Intelligence redefine how you get dressed.
            </p>
            <Link href="/register">
              <Button variant="filled" size="lg" className="w-full sm:w-auto min-w-[200px]">
                Create free account
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

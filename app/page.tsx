import Link from "next/link";
import { Button } from "../components/Button";
import { ArrowRight, CheckCircle2, Clock, Search, ShieldCheck } from "lucide-react";
import { CATEGORIES } from "@/types/constants";

export default function Home() {
  return (
    <div className="space-y-16 pb-20">
    {/* Hero */}
    <section className="relative overflow-hidden bg-gunmetal/30 py-20 lg:py-32 border-b border-slateSteel">
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1581092921461-eab62e97a78e?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-10"></div>
      <div className="max-w-7xl mx-auto px-4 relative z-10 text-center">
        <h1 className="text-5xl md:text-7xl font-display font-bold text-white mb-6 leading-tight">
          Repair, Don't <span className="text-transparent bg-clip-text bg-linear-to-r from-electricAqua to-cyberGreen">Replace</span>.
        </h1>
        <p className="text-xl text-softGray max-w-2xl mx-auto mb-10">
          The trusted peer-to-peer marketplace for device repairs. Compare verified technicians, track your repair live, and get a guaranteed warranty.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/Browse/All"><Button size="lg">Find a Technician</Button></Link>
          <Button variant="outline" size="lg">How it Works</Button>
        </div>
      </div>
    </section>

    {/* Categories */}
    <section className="max-w-7xl mx-auto px-4">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-3xl font-display font-bold text-white">What needs fixing?</h2>
          <p className="text-softGray mt-2">Select a category to find experts.</p>
        </div>
        <Link href="/Browse/All"><Button variant="secondary" size="sm" className="hidden md:flex">View All <ArrowRight className="w-4 h-4 ml-1"/></Button></Link>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {CATEGORIES.map((cat) => (
          <Link key={cat.id} href={`/Browse/Category/${cat.id}`}>
            <div 
            key={cat.id} 
            className="group cursor-pointer bg-gunmetal border border-slateSteel p-6 rounded-md hover:border-electricAqua transition-all hover:-translate-y-1"
          >
            <div className="w-12 h-12 bg-deepCarbon rounded-full flex items-center justify-center mb-4 group-hover:bg-electricAqua group-hover:text-deepCarbon text-electricAqua transition-colors">
              {/* Dynamic Icon Rendering would go here, simplified for this snippet */}
              <Search className="w-6 h-6" />
            </div>
            <h3 className="font-medium text-white group-hover:text-electricAqua">{cat.label}</h3>
          </div>
          </Link>
        ))}
      </div>
    </section>

    {/* Trust Signals */}
    <section className="max-w-7xl mx-auto px-4 grid md:grid-cols-3 gap-8">
      {[
        { title: 'Verified Pros', desc: 'All technicians pass a strict background & skill check.', icon: ShieldCheck },
        { title: 'Live Tracking', desc: 'Watch your device move from pickup to repair to return.', icon: Clock },
        { title: 'Warranty Assured', desc: 'Every repair comes with a minimum 30-day warranty.', icon: CheckCircle2 },
      ].map((item, i) => (
        <div key={i} className="flex gap-4 p-6 bg-gunmetal/50 rounded-lg border border-slateSteel/50">
          <item.icon className="w-10 h-10 text-cyberGreen shrink-0" />
          <div>
            <h3 className="font-bold text-white text-lg">{item.title}</h3>
            <p className="text-sm text-softGray mt-1">{item.desc}</p>
          </div>
        </div>
      ))}
    </section>
  </div>
  );
}

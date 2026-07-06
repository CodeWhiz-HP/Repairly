"use client";
import { CheckCircle2, ShieldCheck, Star } from "lucide-react";
import { CATEGORIES } from "@/lib/constants";
import { Button } from "@/components/Button";
import { getTechnicians } from "@/actions/repairRequest";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Technician } from "@/types/types";
import { HashLoader } from "react-spinners";

const BrowseView = () => {
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getTechnicians()
      .then((data) => {
        setTechnicians(data as any);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 min-h-screen">
      <div className="mb-8">
        <h2 className="text-3xl font-display font-bold text-white mb-2">
          {'Top Rated Technicians'}
        </h2>
        <p className="text-softGray">Compare prices, ratings, and warranty offers.</p>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 text-softGray gap-4">
          <HashLoader color="#26fff2" size={40} />
          <span className="text-sm font-medium tracking-wide">Loading technicians...</span>
        </div>
      ) : (
        <div className="grid lg:grid-cols-1 gap-6">
          {/* Comparison Header for Desktop */}
          <div className="hidden lg:grid grid-cols-12 gap-4 px-6 py-3 bg-deepCarbon border border-slateSteel rounded-t-lg text-sm text-softGray font-medium uppercase tracking-wider">
            <div className="col-span-4">Technician</div>
            <div className="col-span-2 text-center">Rating</div>
            <div className="col-span-4 text-center">Specialties</div>
            <div className="col-span-2 text-right">Action</div>
          </div>

          {technicians.map((tech) => (
            <div key={tech.key} className="group flex flex-col lg:grid lg:grid-cols-12 gap-4 bg-gunmetal border border-slateSteel rounded-lg p-6 items-center hover:border-electricAqua/50 transition-all">

              {/* Technician Info */}
              <div className="col-span-4 flex items-center gap-4 w-full">
                <img src={tech.avatar || tech.imageUrl || "https://picsum.photos/100/100?random=1"} alt={tech.name} className="w-16 h-16 rounded-md object-cover border border-slateSteel" />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-white text-lg">{tech.businessName}</h3>
                    {tech.verified && <ShieldCheck className="w-4 h-4 text-electricAqua" />}
                  </div>
                  <p className="text-sm text-softGray">{tech.name}</p>
                </div>
              </div>

              {/* Rating */}
              <div className="col-span-2 flex flex-col items-center justify-center w-full lg:w-auto mt-4 lg:mt-0">
                <div className="flex items-center gap-1 text-warningYellow">
                  <Star className="w-5 h-5 fill-current" />
                  <span className="font-bold text-lg">{tech.rating || 0}</span>
                </div>
                <span className="text-xs text-softGray">{tech.reviewCount || 0} reviews</span>
              </div>

              {/* Specialties Column */}
              <div className="col-span-4 flex flex-wrap justify-center gap-1.5 w-full lg:w-auto mt-2 lg:mt-0">
                {(tech.specialties || []).map(s => (
                  <span key={s} className="text-xs bg-slateSteel px-3 py-1 rounded text-white uppercase font-semibold">{s}</span>
                ))}
              </div>

              {/* Action */}
              <div className="col-span-2 flex justify-end w-full lg:w-auto mt-4 lg:mt-0">
                <Link href={`/Book?techId=${tech.id}`} className="w-full lg:w-auto">
                  <Button className="w-full lg:w-auto">Request Repair</Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BrowseView;
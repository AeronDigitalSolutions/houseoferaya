import { Instagram, Mail } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-black/10 px-5 py-14 sm:px-8 lg:px-12">
      <div className="mx-auto grid w-full max-w-7xl gap-10 md:grid-cols-3 md:items-end">
        <div>
          <div className="flex items-center gap-3">
            <Image
              src="/assets/logo.jpeg"
              alt="House of Eraya logo"
              width={44}
              height={44}
              className="h-11 w-11 rounded-full border border-white/80 object-cover"
            />
            <h4 className="font-heading text-3xl text-royal-800">House of Eraya</h4>
          </div>
          <p className="mt-3 max-w-sm text-sm text-royal-700/70">
            Contemporary heirloom jewelry designed with restraint, precision, and soul.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-6 text-sm">
          <div>
            <p className="mb-3 text-[10px] uppercase tracking-[0.25em] text-royal-700/55">Explore</p>
            <ul className="space-y-2 text-royal-700/80">
              <li><Link href="#">Collections</Link></li>
              <li><Link href="#">Maison</Link></li>
              <li><Link href="#">Journal</Link></li>
            </ul>
          </div>
          <div>
            <p className="mb-3 text-[10px] uppercase tracking-[0.25em] text-royal-700/55">Contact</p>
            <ul className="space-y-2 text-royal-700/80">
              <li>atelier@houseoferaya.com</li>
              <li>+91 22 0000 0000</li>
              <li>Mumbai</li>
            </ul>
          </div>
        </div>

        <div className="md:justify-self-end">
          <p className="mb-3 text-[10px] uppercase tracking-[0.25em] text-royal-700/55">Social</p>
          <div className="flex items-center gap-2">
            <button className="rounded-full border border-black/15 bg-white/50 p-2.5"><Instagram size={15} /></button>
            <button className="rounded-full border border-black/15 bg-white/50 p-2.5"><Mail size={15} /></button>
          </div>
        </div>
      </div>
    </footer>
  );
}

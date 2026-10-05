import Image from "next/image";
import logo from "../public/logo/favicon.png";

// Logo E·Doto Family commun à l'en-tête et au pied de page : emblème + nom compact
// (« E·Doto » en serif à dégradé rose, « FAMILY » en petites capitales espacées).
export default function BrandMark({ size = "md", className = "" }) {
  const lg = size === "lg";
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <span className={`relative shrink-0 ${lg ? "h-11 w-11" : "h-9 w-9"}`}>
        <Image src={logo} alt="" fill sizes="44px" className="object-contain" priority />
      </span>
      <span className="flex flex-col leading-none">
        <span
          className={`font-brand font-semibold tracking-[-0.01em] bg-gradient-to-r from-[#FF6EA9] via-[#E0457F] to-[#B0175A] bg-clip-text text-transparent ${
            lg ? "text-[28px]" : "text-[23px]"
          }`}
        >
          E·Doto
        </span>
        <span className={`mt-[3px] font-poppins font-medium uppercase text-slate-500 ${lg ? "text-[9.5px] tracking-[0.5em]" : "text-[8.5px] tracking-[0.46em]"}`}>
          Family
        </span>
      </span>
    </span>
  );
}

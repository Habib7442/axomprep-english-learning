import Link from "next/link";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface LogoProps {
  className?: string;
  showTagline?: boolean;
}

export function Logo({ className = "", showTagline = true }: LogoProps) {
  return (
    <Link href="/" className={cn("flex flex-col gap-1 group", className)}>
      <div className="flex items-center gap-2.5">
        <div className="relative">
          <Image 
            src="/images/logo.png" 
            alt="Logo" 
            width={40} 
            height={40} 
            className="h-9 w-auto object-contain transition-transform duration-500 group-hover:scale-110" 
            priority
          />
          <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </div>
        <div className="flex flex-col">
          <span className="text-xl font-black text-white tracking-tighter transition-colors group-hover:text-primary leading-none">
            INTEGRATE<span className="text-primary">PDF</span>
          </span>
          {showTagline && (
            <span className="text-[7px] font-black text-primary/60 tracking-[0.3em] uppercase mt-0.5">
              Stop Reading. Start Talking.
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

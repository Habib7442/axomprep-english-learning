"use client";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

const navItems = [
  { label: "Home", href: "/" },
  { label: "AI Tutors", href: "/companions" },
  { label: "My Journey", href: "/my-journey" },
  { label: "Pricing", href: "/subscription" },
];

const NavItems = () => {
  const pathName = usePathname();
  
  return (
    <>
      {/* Desktop view - horizontal layout */}
      <nav className="hidden md:flex items-center gap-4">
        {navItems.map(({ label, href }) => (
          <Link 
            href={href} 
            key={label} 
            className={cn(
              "px-4 py-2 rounded-lg transition-colors font-medium",
              pathName === href 
                ? "bg-gradient-to-r from-[#FF6B35] to-[#FF914D] text-white shadow-lg" 
                : "text-gray-700 hover:bg-gray-100"
            )}
          >
            {label}
          </Link>
        ))}
      </nav>
      
      {/* Mobile view - vertical layout for Sheet */}
      <nav className="md:hidden flex flex-col gap-2">
        {navItems.map(({ label, href }) => (
          <Link 
            href={href} 
            key={label} 
            className={cn(
              "px-4 py-3 rounded-lg transition-colors text-lg font-medium",
              pathName === href 
                ? "bg-gradient-to-r from-[#FF6B35] to-[#FF914D] text-white shadow-lg" 
                : "text-gray-700 hover:bg-gray-100"
            )}
          >
            {label}
          </Link>
        ))}
      </nav>
    </>
  );
};

export default NavItems;
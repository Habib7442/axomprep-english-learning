"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

interface NavItemsProps {
  mobile?: boolean;
}

export function NavItems({ mobile = false }: NavItemsProps) {
  const items = [
    { name: "Features", href: "#features" },
    { name: "How It Works", href: "#how-it-works" },
    { name: "Pricing", href: "#pricing" },
    { name: "Testimonials", href: "#testimonials" },
  ];

  if (mobile) {
    return (
      <div className="flex flex-col space-y-3">
        {items.map((item) => (
          <Button
            key={item.name}
            variant="ghost"
            className="justify-start text-base text-foreground/80 hover:text-foreground dark:text-foreground/80 dark:hover:text-foreground"
            asChild
          >
            <Link href={item.href}>{item.name}</Link>
          </Button>
        ))}
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-6">
      {items.map((item) => (
        <Button
          key={item.name}
          variant="ghost"
          className="text-foreground/80 hover:text-foreground dark:text-foreground/80 dark:hover:text-foreground"
          asChild
        >
          <Link href={item.href}>{item.name}</Link>
        </Button>
      ))}
    </div>
  );
}
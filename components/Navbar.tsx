"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { NavItems } from "@/components/NavItems";
import { motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Logo } from "@/components/Logo";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <motion.header 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur-md"
    >
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Logo />
        </motion.div>

        {/* Desktop Navigation - Centered */}
        <nav className="hidden md:block absolute left-1/2 transform -translate-x-1/2">
          <NavItems />
        </nav>

        {/* Auth Buttons - Desktop */}
        <div className="hidden md:flex items-center">
          <Navigation />
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center">
          <Button
            variant="ghost"
            size="icon"
            className="text-foreground/80 hover:text-foreground dark:text-foreground/80 dark:hover:text-foreground"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="md:hidden border-t border-border/40 bg-background/95 backdrop-blur-md"
        >
          <div className="container px-4 py-4 flex flex-col space-y-4">
            <NavItems mobile />
            <div className="flex flex-col space-y-3 pt-4 border-t border-border/40">
              <Navigation />
            </div>
          </div>
        </motion.div>
      )}
    </motion.header>
  );
}
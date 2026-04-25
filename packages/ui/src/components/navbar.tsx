"use client";

import React, { useState, useEffect } from 'react';
import { cn } from "../lib/utils";

interface NavbarProps {
  logoSrc?: string;
  links?: { label: string; href: string }[];
  className?: string;
}

export const Navbar = ({ 
  logoSrc = "https://www.iiap.gob.pe/img/logo-iiap.png",
  links = [
    { label: "Biblioteca", href: "#" },
    { label: "Especies", href: "#" },
    { label: "Estadísticas", href: "#" },
  ],
  className 
}: NavbarProps) => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 w-full z-50 transition-all duration-300",
        isScrolled 
          ? "bg-background/95 backdrop-blur-md shadow-sm py-4 border-b" 
          : "bg-transparent py-6",
        className
      )}
    >
      <div className="container mx-auto px-6 flex justify-between items-center h-full">
        <a href="/" className="group flex gap-3 items-center transition-colors duration-300">
          <img
            src={logoSrc}
            alt="Logo IIAP"
            className="h-10 w-auto object-contain transition-transform group-hover:scale-105"
          />
          <span className={cn(
            "text-sm md:text-base font-medium max-w-[260px] leading-tight",
            isScrolled ? "text-foreground" : "text-white"
          )}>
            IIAP Fonoteca
          </span>
        </a>

        <nav className="hidden md:flex items-center gap-8">
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                isScrolled ? "text-muted-foreground" : "text-white/80 hover:text-white"
              )}
            >
              {link.label}
            </a>
          ))}
        </nav>
        
        <div className="flex items-center gap-4">
            <button className={cn(
                "px-4 py-2 rounded-full text-sm font-medium transition-all",
                isScrolled 
                    ? "bg-primary text-primary-foreground hover:opacity-90" 
                    : "bg-white text-primary-dark hover:bg-white/90"
            )}>
                Ingresar
            </button>
        </div>
      </div>
    </header>
  );
};

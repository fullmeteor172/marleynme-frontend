"use client";

import {
  Navbar,
  NavBody,
  NavItems,
  MobileNav,
  NavbarButton,
  MobileNavHeader,
  MobileNavToggle,
  MobileNavMenu,
} from "@/components/ui/resizable-navbar";
import { useState } from "react";
import { ModeToggle } from "../ui/mode-toggle";
import Logo from "@/assets/logo";

export function Nav({ visible }: { visible?: boolean }) {
  const navItems = [
    { name: "How It Works", link: "#how-it-works" },
    { name: "Services", link: "#services" },
  ];

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Smooth scroll
  const handleScrollToSection = (
    e: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
    link: string
  ) => {
    e.preventDefault();
    const id = link.replace("#", "");
    const target = document.getElementById(id);

    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    setTimeout(() => setIsMobileMenuOpen(false), 150);
  };

  return (
    <Navbar>
      {/* Desktop */}
      <NavBody visible={visible}>
        {/* Logo */}
        <a href="#" className="flex items-center gap-3">
          <Logo className="h-9 w-9" />
          <span className="text-lg font-semibold tracking-tight">
            Marley 'n' Me
          </span>
        </a>

        {/* FLOW NAV ITEMS — always inline, never centered absolutely */}
        <div className="hidden lg:flex flex-1 justify-center">
          <NavItems
            items={navItems}
            onItemClick={(e) => {
              const anchor = (e.target as HTMLElement).closest("a");
              if (!anchor) return;
              const href = anchor.getAttribute("href");
              if (!href) return;
              handleScrollToSection(e as any, href);
            }}
          />
        </div>

        {/* Right side buttons */}
        <div className="flex items-center gap-4">
          <NavbarButton
            variant="primary"
            className="group relative overflow-hidden"
          >
            Book a call
          </NavbarButton>
          <NavbarButton
            variant="gradient"
            className="group relative overflow-hidden"
          >
            Join Waitlist
          </NavbarButton>

          <ModeToggle />
        </div>
      </NavBody>

      {/* Mobile */}
      <MobileNav visible={visible}>
        <MobileNavHeader>
          <a href="#" className="flex items-center gap-3">
            <Logo className="h-9 w-9" />
            <span className="text-lg font-semibold tracking-tight">
              Marley 'n' Me
            </span>
          </a>

          <div className="flex items-center gap-3">
            <ModeToggle />
            <MobileNavToggle
              isOpen={isMobileMenuOpen}
              onClick={() => setIsMobileMenuOpen((v) => !v)}
            />
          </div>
        </MobileNavHeader>

        <MobileNavMenu
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
        >
          {navItems.map((item, idx) => (
            <a
              key={idx}
              href={item.link}
              onClick={(e) => handleScrollToSection(e, item.link)}
              className="block text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white transition"
            >
              {item.name}
            </a>
          ))}

          <div className="flex w-full flex-col gap-2">
            <NavbarButton
              variant="secondary"
              className="w-full group relative overflow-hidden"
              onClick={() => setTimeout(() => setIsMobileMenuOpen(false), 150)}
            >
              Join Waitlist
            </NavbarButton>

            <NavbarButton
              variant="primary"
              className="w-full group relative overflow-hidden"
              onClick={() => setTimeout(() => setIsMobileMenuOpen(false), 150)}
            >
              Book a call
            </NavbarButton>
          </div>
        </MobileNavMenu>
      </MobileNav>
    </Navbar>
  );
}

"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { GlowingEffect } from "@/components/ui/glowing-effect";

import {
  FaScissors,
  FaHouseUser,
  FaPersonWalking,
  FaTruckFast,
  FaSyringe,
  FaStethoscope,
  FaDove,
  FaPhoneVolume,
  FaShieldHeart,
  FaBone,
  FaCameraRetro,
} from "react-icons/fa6";
import { FaHandsHelping } from "react-icons/fa";
/**
 * Services Grid
 *
 * - Designer layout using a 12-column responsive grid.
 * - Wide cards: md:col-span-6 (two side-by-side on md+ when space allows).
 * - Small cards: md:col-span-3 (four across at xl).
 * - Images are hidden on small screens (mobile); icons + badges remain.
 * - GlowingEffect enabled and tuned (reduced spread).
 * - Icons use per-service color classes (works for light/dark).
 */

/* ---------------------------
   Services data (with colors)
   --------------------------- */
const services = [
  // wide image services (image + text)
  {
    id: "grooming",
    type: "wide",
    title: "Pet Grooming",
    description: "Professional grooming at your home or our studio.",
    image: "https://placehold.co/600x600?text=Grooming",
    icon: <FaScissors className="h-5 w-5" />,
    badges: ["At-Home", "On-Site"],
    // colors applied to icon bubble (BG + text color)
    colorBg: "bg-[#4F9BFF]/20 dark:bg-[#1E3A8A]/15",
    colorText: "text-[#2563EB] dark:text-[#60A5FA]",
  },

  {
    id: "vaccination",
    type: "wide",
    title: "At-Home Vaccination",
    description: "Certified vets provide vaccinations in the comfort of home.",
    image: "https://placehold.co/600x600?text=Vaccination",
    icon: <FaSyringe className="h-5 w-5" />,
    badges: ["At-Home"],
    colorBg: "bg-[#A0E8AF]/20 dark:bg-[#064e3b]/12",
    colorText: "text-[#16A34A] dark:text-[#86efac]",
  },

  {
    id: "checkups",
    type: "wide",
    title: "At-Home Checkups",
    description: "Routine health assessments done by qualified vets.",
    image: "https://placehold.co/600x600?text=Checkup",
    icon: <FaStethoscope className="h-5 w-5" />,
    badges: ["At-Home"],
    colorBg: "bg-[#A0D8FF]/20 dark:bg-[#022c5b]/12",
    colorText: "text-[#0ea5e9] dark:text-[#7dd3fc]",
  },

  {
    id: "walking",
    type: "wide",
    title: "Pet Walking",
    description: "Daily exercise and walks for a healthy, happy pet.",
    image: "https://placehold.co/600x600?text=Walking",
    icon: <FaPersonWalking className="h-5 w-5" />,
    badges: ["On-Site"],
    colorBg: "bg-[#FFD447]/20 dark:bg-[#45350a]/12",
    colorText: "text-[#c08400] dark:text-[#facc15]",
  },

  // small cards (no image)
  {
    id: "sitting",
    type: "small",
    title: "Pet Sitting",
    description: "In-home care when you're away.",
    icon: <FaHouseUser className="h-5 w-5" />,
    badges: ["At-Home"],
    colorBg: "bg-[#45D9B2]/20 dark:bg-[#064e3b]/12",
    colorText: "text-[#059669] dark:text-[#34d399]",
  },

  {
    id: "transport",
    type: "small",
    title: "Pet Transport",
    description: "Safe and secure travel for your pets.",
    icon: <FaTruckFast className="h-5 w-5" />,
    badges: ["On-Site"],
    colorBg: "bg-[#FF8B5E]/20 dark:bg-[#4c1d14]/12",
    colorText: "text-[#fb923c] dark:text-[#ffb394]",
  },

  {
    id: "food",
    type: "small",
    title: "Specialized Pet Food",
    description: "Nutrition curated for your pet’s needs.",
    icon: <FaBone className="h-5 w-5" />,
    badges: ["On-Site"],
    colorBg: "bg-[#FFECB5]/20 dark:bg-[#442d04]/12",
    colorText: "text-[#b45309] dark:text-[#f59e0b]",
  },

  {
    id: "paravets",
    type: "small",
    title: "24/7 Doorstep Paravets",
    description: "Emergency medical help at your location.",
    icon: <FaShieldHeart className="h-5 w-5" />,
    badges: ["At-Home"],
    colorBg: "bg-[#FEE2E2]/20 dark:bg-[#4c0519]/12",
    colorText: "text-[#ef4444] dark:text-[#fca5a5]",
  },

  {
    id: "emergency",
    type: "small",
    title: "24/7 Emergency Consultation",
    description: "Immediate professional help anytime.",
    icon: <FaPhoneVolume className="h-5 w-5" />,
    badges: ["At-Home"],
    colorBg: "bg-[#FFE4D6]/20 dark:bg-[#4a2711]/12",
    colorText: "text-[#f97316] dark:text-[#fb923c]",
  },

  {
    id: "events",
    type: "small",
    title: "Pet Events (Photoshoots, Parties)",
    description: "At-home events, photoshoots, birthdays & more.",
    icon: <FaCameraRetro className="h-5 w-5" />,
    badges: ["At-Home"],
    colorBg: "bg-[#EAD8FF]/20 dark:bg-[#2b0b3a]/12",
    colorText: "text-[#7c3aed] dark:text-[#c4b5fd]",
  },

  {
    id: "adoption",
    type: "small",
    title: "Pet Adoption Services",
    description: "On-site adoption events & support.",
    icon: <FaHandsHelping className="h-5 w-5" />,
    badges: ["On-Site"],
    colorBg: "bg-[#D1FAE5]/20 dark:bg-[#093822]/12",
    colorText: "text-[#10b981] dark:text-[#86efac]",
  },

  {
    id: "rites",
    type: "small",
    title: "Last Rites",
    description: "Handled with dignity and care.",
    icon: <FaDove className="h-5 w-5" />,
    badges: ["At-Home"],
    colorBg: "bg-[#E3D0FF]/20 dark:bg-[#3a1857]/12",
    colorText: "text-[#7C3AED] dark:text-[#c4b5fd]",
  },
];

/* ------------------------------------
   Component: ServicesGrid (with heading)
   ------------------------------------ */
export function ServicesGrid() {
  return (
    <section className="w-full max-w-7xl mx-auto px-4 py-12 md:py-20">
      {/* Header */}
      <div className="mb-8 text-left md:text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground">
          Services we offer
        </h2>
        <p className="mt-2 text-sm text-muted-foreground max-w-2xl mx-0 md:mx-auto">
          All the services your pet needs — delivered with care, at home or
          on-site.
        </p>
      </div>

      {/* Grid */}
      <ul
        className="
          grid grid-cols-1 gap-4
          sm:grid-cols-2
          md:grid-cols-12
          xl:grid-cols-12
        "
      >
        {services.map((s) => (
          <ServiceCard key={s.id} {...s} />
        ))}
      </ul>
    </section>
  );
}

/* ------------------------------------
   Component: ServiceCard
   ------------------------------------ */
const ServiceCard = ({
  id,
  type,
  title,
  description,
  icon,
  badges,
  image,
  colorBg,
  colorText,
  subtle,
}: any) => {
  const isWide = type === "wide";

  // column spans:
  // wide -> md:col-span-6 (two wide side-by-side at md+)
  // small -> md:col-span-3 (four across in a 12-col grid)
  const colClass = isWide ? "md:col-span-6" : "md:col-span-3";

  return (
    <li
      className={`relative list-none rounded-2xl border p-1 md:rounded-3xl md:p-2 overflow-hidden ${colClass}`}
    >
      {/* Glowing effect (enabled) — tightened spread to reduce outer/inner gap */}
      <GlowingEffect
        spread={18}
        glow={true}
        disabled={false}
        proximity={48}
        inactiveZone={0.03}
      />

      <div
        className="
          relative rounded-xl border-0.75
          bg-white/60 dark:bg-neutral-900/60
          shadow-sm backdrop-blur
          flex h-full
          overflow-hidden
        "
      >
        {/* image side (desktop only) */}
        {isWide && image ? (
          <div className="hidden md:block md:w-1/2">
            <img
              src={image}
              alt={title}
              className="h-full w-full object-cover rounded-l-xl"
            />
          </div>
        ) : null}

        {/* content */}
        <div
          className={`flex flex-col gap-3 p-4 md:p-6 ${
            isWide && image ? "w-full md:w-1/2" : "w-full"
          }`}
        >
          {/* ICON bubble (apply per-service color) */}
          <div
            className={`w-fit rounded-lg p-2 border shadow-sm bg-white dark:bg-neutral-900`}
          >
            <div
              className={`rounded-md h-10 w-10 flex items-center justify-center ${colorBg} ${colorText}`}
            >
              {icon}
            </div>
          </div>

          <h3 className="text-lg md:text-xl font-semibold text-foreground">
            {title}
          </h3>

          <p className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
            {description}
          </p>

          <div className="flex flex-wrap gap-2 pt-2">
            {badges?.map((b: string, i: number) => (
              <Badge
                key={i}
                variant="secondary"
                className="text-xs px-2 py-0.5"
              >
                {b}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </li>
  );
};

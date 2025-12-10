"use client";

import { Badge } from "@/components/ui/badge";
import { Marquee } from "@/components/ui/marquee";
import TappingCat from "@/assets/tapping-cat.gif";
import { FloatingGif } from "@/components/ui/floating-gif";
import CatGroomingImg from "@/assets/images/dog-being-groomed.webp";
import CatVaccinationImg from "@/assets/images/cat-being-vaccinated.webp";

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

/* ============================================================
   SERVICE DATA
   ============================================================ */

const staticServices = [
  {
    id: "grooming",
    type: "wide",
    title: "Pet Grooming",
    description: "Professional grooming at your home or our certified studios.",
    image: CatGroomingImg,
    icon: <FaScissors className="h-5 w-5" />,
    badges: ["At-Home", "On-Site"],
    colorBg: "bg-[#4F9BFF]/20 dark:bg-[#1E3A8A]/15",
    colorText: "text-[#2563EB] dark:text-[#60A5FA]",
  },
  {
    id: "vaccination",
    type: "wide",
    title: "At-Home Vaccination",
    description: "Certified vets provide vaccinations in the comfort of home.",
    image: CatVaccinationImg,
    icon: <FaSyringe className="h-5 w-5" />,
    badges: ["At-Home"],
    colorBg: "bg-[#A0E8AF]/20 dark:bg-[#064e3b]/12",
    colorText: "text-[#16A34A] dark:text-[#86efac]",
  },
  {
    id: "checkups",
    type: "small",
    title: "At-Home Checkups",
    description: "Routine health assessments by qualified vets.",
    icon: <FaStethoscope className="h-5 w-5" />,
    colorBg: "bg-[#A0D8FF]/20 dark:bg-[#022c5b]/12",
    colorText: "text-[#0ea5e9] dark:text-[#7dd3fc]",
    badges: ["At-Home", "On-Site"],
  },
  {
    id: "walking",
    type: "small",
    title: "Pet Walking",
    description: "Daily exercise and walks for a healthy, happy pet.",
    icon: <FaPersonWalking className="h-5 w-5" />,
    colorBg: "bg-[#FFD447]/20 dark:bg-[#45350a]/12",
    colorText: "text-[#c08400] dark:text-[#facc15]",
    badges: ["At-Home"],
  },
  {
    id: "sitting",
    type: "small",
    title: "Pet Sitting",
    description: "In-home care when you're away.",
    icon: <FaHouseUser className="h-5 w-5" />,
    colorBg: "bg-[#45D9B2]/20 dark:bg-[#064e3b]/12",
    colorText: "text-[#059669] dark:text-[#34d399]",
    badges: ["At-Home"],
  },
  {
    id: "emergency",
    type: "small",
    title: "24/7 Emergency Consultation",
    description: "Immediate professional help anytime.",
    icon: <FaPhoneVolume className="h-5 w-5" />,
    colorBg: "bg-[#FFE4D6]/20 dark:bg-[#4a2711]/12",
    colorText: "text-[#f97316] dark:text-[#fb923c]",
    badges: ["At-Home"],
  },
];

const marqueeServices = [
  {
    id: "transport",
    title: "Pet Transport",
    description: "Safe and secure travel for your pets.",
    image: "https://placehold.co/300x300?text=Transport",
    icon: <FaTruckFast className="h-5 w-5" />,
    badges: ["At-Home", "On-Site"],
    colorBg: "bg-[#FF8B5E]/20 dark:bg-[#4c1d14]/12",
    colorText: "text-[#fb923c] dark:text-[#ffb394]",
  },
  {
    id: "food",
    title: "Specialized Pet Food",
    description: "Nutrition curated for your pet’s needs.",
    image: "https://placehold.co/300x300?text=Food",
    icon: <FaBone className="h-5 w-5" />,
    badges: ["At-Home"],
    colorBg: "bg-[#FFECB5]/20 dark:bg-[#442d04]/12",
    colorText: "text-[#b45309] dark:text-[#f59e0b]",
  },
  {
    id: "paravets",
    title: "24/7 Doorstep Paravets",
    description: "Emergency medical help at your location.",
    image: "https://placehold.co/300x300?text=Paravets",
    icon: <FaShieldHeart className="h-5 w-5" />,
    badges: ["At-Home"],
    colorBg: "bg-[#FEE2E2]/20 dark:bg-[#4c0519]/12",
    colorText: "text-[#ef4444] dark:text-[#fca5a5]",
  },
  {
    id: "events",
    title: "Pet Events (Photoshoots, Parties)",
    description: "At-home photoshoots, birthdays & more.",
    image: "https://placehold.co/300x300?text=Events",
    icon: <FaCameraRetro className="h-5 w-5" />,
    badges: ["At-Home"],
    colorBg: "bg-[#EAD8FF]/20 dark:bg-[#2b0b3a]/12",
    colorText: "text-[#7c3aed] dark:text-[#c4b5fd]",
  },
  {
    id: "adoption",
    title: "Pet Adoption Services",
    description: "On-site adoption events & support.",
    image: "https://placehold.co/300x300?text=Adoption",
    icon: <FaHandsHelping className="h-5 w-5" />,
    badges: ["On-Site"],
    colorBg: "bg-[#D1FAE5]/20 dark:bg-[#093822]/12",
    colorText: "text-[#10b981] dark:text-[#86efac]",
  },
  {
    id: "rites",
    title: "Last Rites",
    description: "Handled with dignity and care.",
    image: "https://placehold.co/300x300?text=Last%20Rites",
    icon: <FaDove className="h-5 w-5" />,
    badges: ["At-Home"],
    colorBg: "bg-[#E3D0FF]/20 dark:bg-[#3a1857]/12",
    colorText: "text-[#7C3AED] dark:text-[#c4b5fd]",
  },
];

/* ============================================================
   MAIN
   ============================================================ */

export function ServicesSection() {
  const marqueeRow1 = marqueeServices.filter((_, i) => i % 2 === 0);
  const marqueeRow2 = marqueeServices.filter((_, i) => i % 2 !== 0);

  return (
    <section className="w-full max-w-7xl mx-auto px-4 py-16" id="services">
      {/* Header */}
      <div className="text-center mb-10">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground">
          Services we offer
        </h2>
        <p className="text-sm text-muted-foreground mt-2">
          Everything your pet needs — delivered with care.
        </p>
      </div>

      {/* STATIC GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
        {staticServices.slice(0, 2).map((s) => (
          <WideServiceCard key={s.id} service={s} />
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-14">
        {staticServices.slice(2).map((s) => (
          <SmallServiceCard key={s.id} service={s} />
        ))}
      </div>

      {/* MARQUEE */}
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold text-foreground">
          And there’s even more…
        </h3>
      </div>

      <div className="relative overflow-hidden w-full flex flex-col gap-4">
        <Marquee className="[--duration:15s]">
          <div className="flex gap-3">
            {marqueeRow1.map((s) => (
              <MarqueeCard key={s.id} service={s} />
            ))}
          </div>
        </Marquee>

        <Marquee reverse className="[--duration:15s]">
          <div className="flex gap-3">
            {marqueeRow2.map((s) => (
              <MarqueeCard key={s.id} service={s} />
            ))}
          </div>
        </Marquee>

        {/* Fade edges */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-1/6 bg-linear-to-r from-white dark:from-neutral-950 to-transparent"></div>
        <div className="pointer-events-none absolute inset-y-0 right-0 w-1/6 bg-linear-to-l from-white dark:from-neutral-950 to-transparent"></div>
      </div>
    </section>
  );
}

/* ============================================================
   CARDS — STATIC
   ============================================================ */

function WideServiceCard({ service }: { service: any }) {
  const { title, description, image, icon, badges, colorBg, colorText } =
    service;

    

  return (
    <article className="rounded-2xl border p-1 bg-white/60 dark:bg-neutral-900/50 backdrop-blur shadow-sm h-full">
      <div className="rounded-xl border-0.75 bg-white dark:bg-neutral-900 flex h-full overflow-hidden">
        {/* Wider image — perfect flush */}
        {service.id === "grooming" && (
          <FloatingGif
            src={TappingCat}
            alt="Cat tapping"
            size={80}
            className="absolute -top-10 left-10 md:left-10"
            style={{ transform: "translateY(-20%)" }}
          />
        )}

        <img
          src={image}
          alt={title}
          className="w-[130px] h-full object-cover rounded-l-xl shrink-0"
        />

        <div className="flex flex-col justify-between flex-1 p-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div
                className={`rounded-md h-10 w-10 flex items-center justify-center ${colorBg} ${colorText}`}
              >
                {icon}
              </div>
              <h4 className="text-lg font-semibold text-foreground">{title}</h4>
            </div>

            <p className="text-sm text-muted-foreground">{description}</p>
          </div>

          <div className="flex gap-2 flex-wrap mt-2">
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
    </article>
  );
}

function SmallServiceCard({ service }: { service: any }) {
  const { title, description, icon, badges, colorBg, colorText } = service;

  return (
    <article className="rounded-2xl border p-1 bg-white/60 dark:bg-neutral-900/50 backdrop-blur shadow-sm h-full">
      <div className="rounded-xl border-0.75 bg-white dark:bg-neutral-900 p-3 flex flex-col gap-2 h-full">
        {/* Icon + Title */}
        <div className="flex items-center gap-2">
          <div
            className={`rounded-md h-8 w-8 flex items-center justify-center ${colorBg} ${colorText}`}
          >
            {icon}
          </div>

          <h4 className="text-sm font-semibold text-foreground">{title}</h4>
        </div>

        {/* Description */}
        <p className="text-xs text-muted-foreground leading-snug">
          {description}
        </p>

        {/* Spacer pushes badges down slightly but keeps card compact */}
        <div className="flex-1" />

        {/* Badges */}
        <div className="flex gap-1 flex-wrap mt-1">
          {badges?.map((b: string, i: number) => (
            <Badge
              key={i}
              variant="secondary"
              className="text-[10px] px-1.5 py-0.5"
            >
              {b}
            </Badge>
          ))}
        </div>
      </div>
    </article>
  );
}


/* ============================================================
   MARQUEE CARD
   ============================================================ */

function MarqueeCard({ service }: { service: any }) {
  const { title, icon, badges, colorBg, colorText } = service;

  return (
    <article
      className="
        flex shrink-0 w-[220px] h-[90px]
        rounded-2xl border p-3 bg-white/60 dark:bg-neutral-900/50
        backdrop-blur shadow-sm overflow-hidden
      "
    >
      <div className="flex flex-col justify-between flex-1">
        {/* Icon + Title */}
        <div className="flex items-center gap-3">
          <div
            className={`rounded-md h-8 w-8 flex items-center justify-center ${colorBg} ${colorText}`}
          >
            {icon}
          </div>

          <h4 className="text-sm font-semibold text-foreground">{title}</h4>
        </div>

        {/* Badges */}
        <div className="flex gap-1 flex-wrap mt-1">
          {badges?.map((b: string, i: number) => (
            <Badge
              key={i}
              variant="secondary"
              className="text-[10px] px-1.5 py-0.5"
            >
              {b}
            </Badge>
          ))}
        </div>
      </div>
    </article>
  );
}

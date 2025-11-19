import {
  FaUserPlus,
  FaSearch,
  FaRegCalendarCheck,
  FaCoffee,
} from "react-icons/fa";

const timelineSteps = [
  {
    step: "Step 1",
    title: "Create Profile",
    description:
      "Sign up and set up a quick profile for your pet — their needs, habits, and personality.",
    icon: <FaUserPlus className="w-5 h-5" />,
    color: "bg-[#4F9BFF]/20 text-[#4F9BFF]",
  },
  {
    step: "Step 2",
    title: "Choose Service",
    description:
      "Pick from grooming, vet visits, walking, training, sitting, and more.",
    icon: <FaSearch className="w-5 h-5" />,
    color: "bg-[#45D9B2]/20 text-[#45D9B2]",
  },
  {
    step: "Step 3",
    title: "Schedule Date",
    description:
      "Choose a time that works for you — including evenings and weekends.",
    icon: <FaRegCalendarCheck className="w-5 h-5" />,
    color: "bg-[#FFD447]/20 text-[#FFD447]",
  },
  {
    step: "Step 4",
    title: "Relax & Enjoy",
    description:
      "We confirm your booking instantly. Sit back while your pet gets expert care.",
    icon: <FaCoffee className="w-5 h-5" />,
    color: "bg-[#c847ff]/10 text-[#7C3AED]", // NICE PURPLE
  },
];

export const Timeline = () => {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-12 md:py-20">
      {/* Heading */}
      <div className="flex flex-col mb-12 items-start md:items-center text-left md:text-center">
        <h2 className="text-3xl md:text-5xl font-bold text-foreground tracking-tight">
          How It Works
        </h2>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl">
          Getting the best care for your pet is just a few simple steps away.
        </p>
      </div>

      <div className="relative w-full">
        {/* STEP CARDS */}
        <div className="grid grid-cols-1 gap-y-12 md:grid-cols-4 md:gap-x-8">
          {timelineSteps.map((item, index) => {
            const isLast = index === timelineSteps.length - 1;

            return (
              <div
                key={index}
                className="
                  relative flex flex-row md:flex-col items-start
                  md:bg-muted/30 md:dark:bg-neutral-900/40 
                  md:rounded-2xl md:p-6 md:pt-10 
                  md:shadow-sm md:border md:border-border/40
                "
              >
                {/* MOBILE VERTICAL LINE */}
                {!isLast && (
                  <div className="absolute left-6 top-12 -bottom-12 w-0.5 bg-border md:hidden" />
                )}

                {/* ICON (centered always, overlaps card in desktop) */}
                <div
                  className="
                    relative z-10 shrink-0
                    flex items-center justify-center 
                    h-12 w-12 rounded-xl 
                    bg-white dark:bg-neutral-900 shadow-sm
                    mx-0 md:mx-auto 
                    md:absolute md:-top-6 md:left-1/2 md:-translate-x-1/2
                  "
                >
                  <div
                    className={`
                      h-10 w-10 rounded-md flex items-center justify-center
                      ${item.color}
                    `}
                  >
                    {item.icon}
                  </div>
                </div>

                {/* CONTENT */}
                <div className="ml-6 md:ml-0 md:mt-8 w-full text-left">
                  <span className="inline-block py-1 px-2 rounded bg-muted/50 text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                    {item.step}
                  </span>

                  <h3 className="text-xl font-bold text-foreground mb-2">
                    {item.title}
                  </h3>

                  <p className="text-muted-foreground leading-relaxed text-sm">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

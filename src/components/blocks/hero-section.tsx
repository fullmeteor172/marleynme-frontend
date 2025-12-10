import { ContainerTextFlip } from "../ui/container-text-flip";
import { FloatingGif } from "../ui/floating-gif";
import jumpingCat from "@/assets/cat-jumping.gif";

const Hero = () => {
  return (
    <section
      id="hero"
      className="relative flex items-center justify-center px-4 pt-28 pb-14"
    >
      <div className="max-w-6xl mx-auto w-full text-center">
        {/* MOBILE: COMING TO HYDERABAD */}
        <span className="md:hidden block text-sm tracking-wider text-accent-foreground/80 dark:text-accent-foreground/90 font-semibold mb-1">
          COMING TO HYDERABAD
        </span>

        {/* Headline */}
        <h1 className="text-4xl sm:text-5xl font-bold text-neutral-900 dark:text-white mt-4 leading-tight">
          {/* Desktop headline */}
          <span className="hidden md:inline">
            Hyderabad, Get Ready For Better
          </span>

          {/* Mobile headline */}
          <span className="md:hidden block">Get Ready for Better</span>
        </h1>

        {/* Flip text (its own clean line) */}
        <div className="mt-3 mb-6 text-2xl md:text-3xl font-semibold text-neutral-900 dark:text-neutral-100">
          <ContainerTextFlip
            words={[
              "Pet Care",
              "Grooming",
              "Pet Sitting",
              "Vet Services",
              "Pet Transport",
            ]}
          />
        </div>


        {/* Subtext — warmer + shorter */}
        <p className="text-lg md:text-xl text-neutral-600 dark:text-neutral-300 max-w-3xl mx-auto mb-6 leading-relaxed">
          All the help your pet needs, from vets to groomers to walkers -
          brought together with warmth, trust, and care.
        </p>

        {/* Cat GIF - positioned for decoration */}
        <div className="relative w-full flex justify-center mt-8">
          <FloatingGif
            src={jumpingCat}
            alt="Jumping cat"
            size={100}
            className=""
          />
        </div>
      </div>
    </section>
  );
};

export default Hero;

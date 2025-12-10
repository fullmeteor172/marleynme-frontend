import {
  PiFacebookLogoFill,
  PiInstagramLogoFill,
  PiTwitterLogoFill,
  PiYoutubeLogoFill,
} from "react-icons/pi";
import Logo from "@/assets/logo.tsx";
import waggingDog from "@/assets/dog-wagging-tail.gif";
import { FloatingGif } from "../ui/floating-gif";

const Footer = () => {
  return (
    <footer className="relative border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950">
      <FloatingGif
        src={waggingDog}
        alt="Dog wagging tail"
        size={70}
        className="
      right-10 
      -top-17.5 
      md:right-12 
      md:-top-12
      opacity-95
    "
      />

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="flex flex-col items-center justify-between gap-8 md:flex-row">
          <a href="#" className="flex items-center gap-3">
            <Logo className="h-9 w-9" />
            <span className="text-lg font-semibold tracking-tight">
              Marley 'n' Me
            </span>
          </a>

          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-neutral-600 dark:text-neutral-300">
            <a
              href="#how-it-works"
              className="hover:text-neutral-800 dark:hover:text-white transition"
            >
              How It Works
            </a>
            <a
              href="#services"
              className="hover:text-neutral-800 dark:hover:text-white transition"
            >
              Services
            </a>
            <a
              href="#"
              className="hover:text-neutral-800 dark:hover:text-white transition"
            >
              Book a Call
            </a>
          </div>

          <div className="flex items-center gap-5">
            <a href="https://www.instagram.com/marleynme.official">
              <PiFacebookLogoFill className="size-5 opacity-80 hover:opacity-100 transition" />
            </a>
            <a href="https://www.instagram.com/marleynme.official">
              <PiInstagramLogoFill className="size-5 opacity-80 hover:opacity-100 transition" />
            </a>
            <a href="https://www.instagram.com/marleynme.official">
              <PiTwitterLogoFill className="size-5 opacity-80 hover:opacity-100 transition" />
            </a>
            <a href="https://www.instagram.com/marleynme.official">
              <PiYoutubeLogoFill className="size-5 opacity-80 hover:opacity-100 transition" />
            </a>
          </div>
        </div>

        <div className="mt-10 w-full border-t border-neutral-200 dark:border-neutral-800" />

        <div className="mt-6 flex justify-center text-center">
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            © 2025 Marley 'n' Me — Helping pets live happier, healthier lives 🐾
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

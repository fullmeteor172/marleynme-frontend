import Logo from "@/assets/logo.tsx"; // your SVG

export const NavbarLogo = () => {
  return (
    <a
      href="#hero"
      className="relative z-20 mr-4 flex items-center space-x-2 px-2 py-1"
    >
      <Logo className="h-7 w-7" />
      <span className="font-semibold text-lg text-black dark:text-white">
        Marley n Me
      </span>
    </a>
  );
};

import { ModeToggle } from "@/components/ui/mode-toggle";
import { ContainerTextFlip } from "./components/ui/container-text-flip";
import { Nav } from "./components/blocks/nav";
import { GlowingEffectDemo } from "./components/blocks/glowing-demo";
import Footer from "./components/blocks/footer";

function App() {
  return (
    <>
      <Nav />

      <div className="flex min-h-svh flex-col items-center justify-center">
        <GlowingEffectDemo />
        <ModeToggle />
        <ContainerTextFlip
          words={["better", "modern", "kewllllll", "awesome"]}
        />
      </div>
      <Footer />
    </>
  );
}

export default App;

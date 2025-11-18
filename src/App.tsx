import { Button } from "@/components/ui/button";
import { ContainerTextFlip } from "./components/ui/container-text-flip";
import { ModeToggle } from "./components/ui/mode-toggle";
import { StickyBanner } from "./components/ui/sticky-banner";

function App() {
  return (
    <>
      <StickyBanner className="bg-linear-to-b from-blue-500 to-blue-600">Sticky test</StickyBanner>
      <div className="flex min-h-svh flex-col items-center justify-center">
        <ModeToggle />
        <Button>Click me</Button>
        <ContainerTextFlip
          words={["better", "modern", "kewllllll", "awesome"]}
        />
      </div>
    </>
  );
}

export default App;

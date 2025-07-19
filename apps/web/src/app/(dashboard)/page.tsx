import { EmptyState } from "@/components/empty-state";
import { InputSection } from "@/components/input-section";
import { MethodologyIndicators } from "@/components/methodology-indicators";

const HomePage = () => (
  <main
    id="main-content"
    className="mx-auto flex justify-center min-w-4xl max-w-4xl flex-grow flex-col items-center gap-3 p-6"
  >
    <EmptyState />
    <InputSection />
    <MethodologyIndicators />
  </main>
);

export default HomePage;

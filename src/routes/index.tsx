import { createFileRoute } from "@tanstack/react-router";
import { ImpaktLens } from "@/components/impakt-lens/ImpaktLens";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return <ImpaktLens />;
}

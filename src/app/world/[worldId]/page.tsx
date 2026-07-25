import { notFound } from "next/navigation";
import { WORLDS, getWorld } from "@/data/worlds";
import { WorldTrail } from "./WorldTrail";

export function generateStaticParams() {
  return WORLDS.map((w) => ({ worldId: w.id }));
}

export default async function WorldPage(props: PageProps<"/world/[worldId]">) {
  const { worldId } = await props.params;
  const world = getWorld(worldId);
  if (!world) notFound();

  return <WorldTrail world={world} />;
}

import { notFound } from "next/navigation";
import { ALL_GLYPHS, getGlyph, getWorldForGlyph } from "@/data/worlds";
import { TraceScreen } from "@/components/tracing/TraceScreen";

export function generateStaticParams() {
  return ALL_GLYPHS.map((g) => ({ glyphId: g.id }));
}

export default async function TracePage(props: PageProps<"/trace/[glyphId]">) {
  const { glyphId } = await props.params;
  const glyph = getGlyph(glyphId);
  const world = getWorldForGlyph(glyphId);
  if (!glyph || !world) notFound();

  return <TraceScreen glyph={glyph} world={world} />;
}

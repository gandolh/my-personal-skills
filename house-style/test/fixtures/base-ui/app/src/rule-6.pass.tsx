// Tokens, arbitrary sizes and CSS variables are fine; so is a colour in a comment: bg-[#000].
export function Swatches({ swatch }: { swatch: string }) {
  const data = { "--swatch": swatch };
  return (
    <div className="bg-surface text-ink w-[12rem] bg-(--swatch) grid-cols-[1fr_auto]" data-colour="#1a1a1a" style={data}>
      #1a1a1a
    </div>
  );
}

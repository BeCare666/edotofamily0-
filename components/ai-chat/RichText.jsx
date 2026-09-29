"use client";

// Rendu markdown minimal des réponses (paragraphes, listes, **gras**, liens) sans HTML injecté.
function inline(text, keyPrefix) {
    const out = [];
    const re = /\*\*([^*]+)\*\*|\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)|(https?:\/\/[^\s)]+)/g;
    let last = 0;
    let m;
    let i = 0;
    while ((m = re.exec(text))) {
        if (m.index > last) out.push(text.slice(last, m.index));
        const key = `${keyPrefix}-${i++}`;
        if (m[1]) {
            out.push(<strong key={key} className="font-semibold text-slate-900">{m[1]}</strong>);
        } else {
            const href = m[3] || m[4];
            out.push(
                <a key={key} href={href} target="_blank" rel="noopener noreferrer"
                    className="text-pink-600 underline decoration-pink-300 underline-offset-2 hover:decoration-pink-600 break-words">
                    {m[2] || href}
                </a>,
            );
        }
        last = re.lastIndex;
    }
    if (last < text.length) out.push(text.slice(last));
    return out;
}

export default function RichText({ text }) {
    const blocks = [];
    let list = null;
    text.split("\n").forEach((raw, idx) => {
        const line = raw.trimEnd();
        const bullet = line.match(/^\s*(?:[-*•]|\d+[.)])\s+(.*)$/);
        if (bullet) {
            if (!list) {
                list = { ordered: /^\s*\d/.test(line), items: [] };
                blocks.push(list);
            }
            list.items.push(bullet[1]);
            return;
        }
        list = null;
        if (!line.trim()) return;
        const heading = line.match(/^#{1,4}\s+(.*)$/);
        blocks.push({ p: heading ? heading[1] : line, heading: !!heading, idx });
    });

    return (
        <div className="space-y-3 text-[15px] leading-7 text-slate-700">
            {blocks.map((b, i) =>
                b.items ? (
                    b.ordered ? (
                        <ol key={i} className="list-decimal pl-5 space-y-1.5 marker:text-pink-400 marker:font-semibold">
                            {b.items.map((it, j) => <li key={j}>{inline(it, `${i}-${j}`)}</li>)}
                        </ol>
                    ) : (
                        <ul key={i} className="space-y-1.5">
                            {b.items.map((it, j) => (
                                <li key={j} className="flex gap-2.5">
                                    <span className="mt-[11px] h-1.5 w-1.5 shrink-0 rounded-full bg-gradient-to-br from-[#FF6EA9] to-[#4AB3F4]" />
                                    <span>{inline(it, `${i}-${j}`)}</span>
                                </li>
                            ))}
                        </ul>
                    )
                ) : (
                    <p key={i} className={b.heading ? "font-semibold text-slate-900" : undefined}>{inline(b.p, `${i}`)}</p>
                ),
            )}
        </div>
    );
}

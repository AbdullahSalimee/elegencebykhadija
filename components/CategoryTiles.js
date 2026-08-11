import Image from "next/image";
import { getCategoryTiles } from "@/lib/data/content";

// Image-led category grid: 6 across on desktop, 3 on tablet, 2 on a phone —
// the tile stays square at every step so the row never breaks alignment.
//
// Fetches its own tiles rather than taking them as a prop: it's a Server
// Component with a single caller, and the query is cached and tagged, so the
// read costs nothing per render.
export default async function CategoryTiles() {
  const tiles = await getCategoryTiles();
  if (!tiles.length) return null;

  return (
    <section className="eth-section">
      <div className="eth-section-head">
        <h2 className="eth-section-title">Shop by Category</h2>
      </div>
      <div className="eth-tiles">
        {tiles.map((tile) => (
          <a key={tile.id} className="eth-tile" href={tile.href}>
            <div className="eth-tile-photo">
              {tile.image && (
                <Image
                  src={tile.image}
                  alt=""
                  fill
                  sizes="(max-width: 560px) 45vw, (max-width: 900px) 30vw, 16vw"
                  className="eth-tile-img"
                />
              )}
            </div>
            <span className="eth-tile-label">{tile.label}</span>
          </a>
        ))}
      </div>
    </section>
  );
}

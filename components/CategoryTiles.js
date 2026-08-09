import Image from "next/image";
import { CATEGORY_TILES } from "@/lib/site-config";

// Image-led category grid: 6 across on desktop, 3 on tablet, 2 on a phone —
// the tile stays square at every step so the row never breaks alignment.
export default function CategoryTiles() {
  return (
    <section className="eth-section">
      <div className="eth-section-head">
        <h2 className="eth-section-title">Shop by Category</h2>
      </div>
      <div className="eth-tiles">
        {CATEGORY_TILES.map((tile) => (
          <a key={tile.id} className="eth-tile" href={tile.href}>
            <div className="eth-tile-photo">
              <Image
                src={tile.image}
                alt=""
                fill
                sizes="(max-width: 560px) 45vw, (max-width: 900px) 30vw, 16vw"
                className="eth-tile-img"
              />
            </div>
            <span className="eth-tile-label">{tile.label}</span>
          </a>
        ))}
      </div>
    </section>
  );
}

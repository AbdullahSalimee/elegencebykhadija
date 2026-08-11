import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { FABRIC_GUIDE } from "@/lib/site-config";
import { getProducts } from "@/lib/data/products";

export const metadata = { title: "Fabric Guide — Elegance by Khadija" };
export const revalidate = 300;

export default async function FabricGuidePage() {
  const { products } = await getProducts({ pageSize: 200 });
  return (
    <div className="pg-fabric eth">
      <Nav />

      <div className="page-head eth-page-head">
        <div className="eth-eyebrow">Know your fabric</div>
        <h1 className="eth-page-title">The Fabric Guide</h1>
        <p className="eth-page-copy">
          Unstitched means the fabric does the talking before your tailor ever
          touches it. Here's what each one is made for — so you can pick by
          season and occasion, not just print.
        </p>
      </div>

      <div
        className="page-body"
        style={{
          padding: "24px 48px 64px",
          display: "flex",
          flexDirection: "column",
          gap: 28,
        }}
      >
        {FABRIC_GUIDE.map((f, i) => {
          const count = products.filter((p) => p.fabric === f.name).length;
          const reversed = i % 2 === 1;
          return (
            <div
              key={f.id}
              className="fabric-card"
              style={{ flexDirection: reversed ? "row-reverse" : "row" }}
            >
              <div
                className="fabric-swatch-panel"
                style={{ background: f.texture }}
              >
                <div className="fabric-swatch-label">
                  <div className="fabric-swatch-number">
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <div className="fabric-swatch-name">{f.name}</div>
                </div>
              </div>
              <div className="fabric-info-panel">
                <div className="tag tag-neutral" style={{ marginBottom: 10 }}>
                  {count} pieces in {f.name.toLowerCase()} right now
                </div>
                <h2 style={{ fontSize: 28, marginBottom: 4 }}>{f.name}</h2>
                <div
                  style={{
                    fontSize: 15,
                    fontStyle: "italic",
                    opacity: 0.75,
                    marginBottom: 16,
                  }}
                >
                  {f.tagline}
                </div>
                <p style={{ fontSize: 14.5, opacity: 0.85, maxWidth: "52ch" }}>
                  {f.body}
                </p>
                <div className="fabric-spec-grid">
                  <div>
                    <div className="fabric-spec-label">Weight</div>
                    <div className="fabric-spec-value">{f.weight}</div>
                  </div>
                  <div>
                    <div className="fabric-spec-label">Best worn</div>
                    <div className="fabric-spec-value">{f.season}</div>
                  </div>
                  <div>
                    <div className="fabric-spec-label">Feel</div>
                    <div className="fabric-spec-value">{f.feel}</div>
                  </div>
                  <div>
                    <div className="fabric-spec-label">Care</div>
                    <div className="fabric-spec-value">{f.care}</div>
                  </div>
                </div>
                <a
                  href={`/shop`}
                  className="btn btn-primary"
                  style={{ marginTop: 20, alignSelf: "flex-start" }}
                >
                  Shop {f.name}
                </a>
              </div>
            </div>
          );
        })}
      </div>

      <Footer />
    </div>
  );
}

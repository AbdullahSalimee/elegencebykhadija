import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { FABRIC_GUIDE, PRODUCTS } from "@/lib/products";

export const metadata = { title: "Fabric Guide — Elegance by Khadija" };

export default function FabricGuidePage() {
  return (
    <div className="pg-fabric">
      <Nav />

      <div className="page-head" style={{ padding: "56px 48px 20px", maxWidth: 780 }}>
        <div className="tag tag-outline" style={{ marginBottom: 16 }}>
          Know your fabric
        </div>
        <h1 style={{ fontSize: 48 }}>The Fabric Guide</h1>
        <p style={{ fontSize: 16, opacity: 0.8 }}>
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
          const count = PRODUCTS.filter((p) => p.fabric === f.name).length;
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

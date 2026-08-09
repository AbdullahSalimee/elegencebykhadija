import Image from "next/image";
import Reveal from "@/components/Reveal";

// One collection block: centred heading, short rule, a tall photograph, and a
// caption plate straddling the image's bottom edge. Heading and image reveal
// separately so the block assembles itself as you reach it.
export default function CollectionBanner({ block }) {
  return (
    <section className="hr-block">
      <Reveal as="header" className="hr-head">
        <h2 className="hr-title">{block.heading}</h2>
        <span className="hr-rule" />
      </Reveal>

      <Reveal className="hr-figure-wrap" delay={110}>
        <a className="hr-figure" href={block.href}>
          <span className="hr-figure-photo">
            <Image
              src={block.image}
              alt=""
              fill
              // Contained on desktop, so it renders ~580px wide however
              // wide the band itself runs.
              sizes="(max-width: 900px) 100vw, 640px"
              className="hr-figure-img"
            />
          </span>
          <span className="hr-caption">{block.caption}</span>
        </a>
      </Reveal>
    </section>
  );
}

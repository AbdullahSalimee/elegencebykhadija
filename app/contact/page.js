import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import ContactChannels from "@/components/ContactChannels";

export const metadata = { title: "Contact us — Elegance by Khadija" };

export default function ContactPage() {
  return (
    <div className="pg-contact eth">
      <Nav />

      <div className="page-head eth-page-head">
        <div className="eth-eyebrow">Get in touch</div>
        <h1 className="eth-page-title">Let's talk fabric.</h1>
        <p className="eth-page-copy">
          Orders are placed on the site and tracked from your account — but for
          anything else, WhatsApp is the fastest way to check stock, confirm a
          colourway, or ask before you buy. Write your message below and we'll
          pick it up from there.
        </p>
      </div>

      <ContactChannels />

      <Footer />
    </div>
  );
}

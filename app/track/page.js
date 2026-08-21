import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import TrackOrders from "@/components/TrackOrders";

// Order tracking, post-accounts. There's no order number to dig out of an old
// text message any more: the session cookie says who you are, so this page
// just lists everything you've ordered and where each one has got to. Status
// changes made by the admin show up here the next time the page is opened —
// the same moment the status email goes out.
export const metadata = { title: "Track your order — Elegance by Khadija" };

export default function TrackPage() {
  return (
    <div className="pg-track">
      <Nav />
      <TrackOrders />
      <Footer />
    </div>
  );
}

import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import LoginForm from "@/components/LoginForm";

// Log in / create an account outside of checkout. Most customers never see
// this page — they get an account automatically the first time they order —
// but it's how you get back in on a new phone, or after logging out.
export const metadata = { title: "Your account — Elegance by Khadija" };

export default function LoginPage() {
  return (
    <div className="pg-track">
      <Nav />
      <LoginForm />
      <Footer />
    </div>
  );
}

import NavClient from "@/components/NavClient";
import { getMegaNav, getUtilityLinks, getAnnouncements } from "@/lib/data/content";

// Server half of the site chrome: fetches the mega menu, utility links and
// announcement bar, then hands them to the client component that needs state
// (open panels, flyouts, the mobile drawer).
//
// It sits here rather than in each page so that `import Nav from
// "@/components/Nav"` keeps working everywhere it already did, and so the
// three queries are shared by Next's request cache rather than repeated.
export default async function Nav({ overlay = false }) {
  const [megaNav, utilityLinks, announcements] = await Promise.all([
    getMegaNav(),
    getUtilityLinks(),
    getAnnouncements(),
  ]);

  return (
    <NavClient
      overlay={overlay}
      megaNav={megaNav}
      utilityLinks={utilityLinks}
      announcements={announcements}
    />
  );
}

// Site config: categories and nav links.
// SWAP for real tables once the backend exists (category, nav_link), same shape.

export const CATEGORIES = [
  { id: "lawn", label: "Lawn" },
  { id: "silk", label: "Silk" },
  { id: "karandi", label: "Karandi" },
];

export const NAV_LINKS = [
  { id: "new-in", label: "New In", href: "/new-in", order: 1 },
  {
    id: "unstitched",
    label: "Unstitched Suits",
    href: "/shop",
    order: 2,
  },
  {
    id: "fabric-guide",
    label: "Fabric Guide",
    href: "/fabric-guide",
    order: 3,
  },
  { id: "sale", label: "Sale", href: "/sale", order: 4 },
  { id: "contact", label: "Contact", href: "/contact", order: 5 },
];

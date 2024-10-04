export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: "My Beautiful Albums",
  description: "Store your library of favorite albums in one place.",
  navItems: [
    {
      label: "Home",
      href: "/",
    },
    {
      label: "Profile",
      href: "/profile",
    },
    {
      label: "Search",
      href: "/search",
    },
  ],
  navMenuItems: [
    {
      label: "Home",
      href: "/",
    },
    {
      label: "Profile",
      href: "/profile",
    },
    {
      label: "Search",
      href: "/search",
    },
    {
      label: "Logout",
      href: "/logout",
    },
  ],
  links: {
    github: "https://github.com/nextui-org/nextui",
    twitter: "https://twitter.com/getnextui",
    docs: "https://nextui.org",
    spotify: "https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M",
  },
};

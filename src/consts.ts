export const SITE_TITLE = "Isiah Fletcher";
export const SITE_DESCRIPTION =
  "Isiah is a musician, writer, and software engineer based in Boise, Idaho.";

export const SOCIAL_LINKS = {
  facebook: "https://www.facebook.com/fletchmydrumsticks/",
  instagram: "https://www.instagram.com/fletchmydrumsticks/",
  youtube: "https://www.youtube.com/channel/UCeV7RrWm2WOt6gMXxXGdkUw",
  github: "https://github.com/Ifletcher668",
};

export const BAND_LINKS = {
  aterrima: { title: "Aterrima", href: "/music/aterrima" },
  wealdAndWoe: { title: "Weald and Woe", href: "/music/weald-and-woe" },
};

export const BAND_LINKS_ARRAY = Object.values(BAND_LINKS);

export const NAV_LINKS = [
  {
    title: "Music",
    href: "/music",
    subLinks: BAND_LINKS_ARRAY,
  },
  {
    title: "Work",
    href: "/work",
  },
];

export const EXTERNAL_LINKS = {
  shelbzWebsite: "https://shelbzcitrine.com",
};

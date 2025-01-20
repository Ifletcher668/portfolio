export const SITE_TITLE = "Isiah Fletcher";
export const SITE_DESCRIPTION =
  "Isiah is a musician, writer, and software engineer based in Salem, Oregon.";

export const EXTERNAL_LINKS = {
  shelbzWebsite: "https://shelbzcitrine.com",
};

export const SOCIAL_LINKS = {
  facebook: "https://www.facebook.com/fletchmydrumsticks/",
  youtube: "https://www.youtube.com/channel/UCeV7RrWm2WOt6gMXxXGdkUw",
  github: "https://github.com/Ifletcher668",
};

export const BAND_LINKS = {
  aterrima: { title: "Aterrima", href: "/music/aterrima" },
  wealdAndWoe: { title: "Weald & Woe", href: "/music/weald-and-woe" },
};

export const PROJECT_LINKS = {
  threeJsJourney: {
    title: "Three.js Journey",
    href: "/projects/three-js-journey",
  },
  shelbzWebsite: {
    title: "Portfolio for Shelbz Citrine",
    href: EXTERNAL_LINKS.shelbzWebsite,
  },
};

export const PROJECT_LINKS_ARRAY = Object.values(PROJECT_LINKS);
export const BAND_LINKS_ARRAY = Object.values(BAND_LINKS);

export const PAGE_LINKS = {
  music: {
    title: "Music",
    href: "/music",
    subLinks: BAND_LINKS_ARRAY,
  },
  work: {
    title: "Work",
    href: "/work",
  },
  hobbies: {
    title: "Interests",
    href: "/hobbies",
  },
  projects: {
    title: "Projects",
    href: "/projects",
    subLinks: PROJECT_LINKS_ARRAY,
  },
};

export const NAV_LINKS_ARRAY = Object.values(PAGE_LINKS);

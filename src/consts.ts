export const SITE_TITLE = "Isiah Fletcher";
export const SITE_DESCRIPTION =
  "Isiah is a musician, writer, and software engineer based in Olympia, Washington.";

export const EXTERNAL_LINKS = {
  shelbzWebsite: "https://shelbzcitrine.com",
};

export const SOCIAL_LINKS = {
  facebook: "https://www.facebook.com/fletchmydrumsticks/",
  instagram: "https://www.instagram.com/fletchmydrumsticks/",
  substack: "https://isiahfletcher7.substack.com/",
  youtube: "https://www.youtube.com/channel/UCeV7RrWm2WOt6gMXxXGdkUw",
  github: "https://github.com/Ifletcher668",
};

export const BAND_LINKS = {
  aterrima: { title: "Aterrima", href: "/music/aterrima" },
  wealdAndWoe: { title: "Weald & Woe", href: "/music/weald-and-woe" },
};

type PageLink = {
  title: string;
  href: string;
  subLinks?: PageLink[];
};

export const THREE_JS_JOURNEY_LINKS = {
  floatingTextWithDonuts: {
    title: "Floating Text with Donuts",
    href: "/projects/three-js-journey/floating-text-with-donuts",
  },
};
export const THREE_JS_JOURNEY_LINKS_ARRAY = Object.values(
  THREE_JS_JOURNEY_LINKS
);

export const PROJECT_LINKS = {
  threeJsJourney: {
    title: "Three.js Journey",
    href: "/projects/three-js-journey",
    imgSrc: "/floating-text-with-donuts.webp",
    subLinks: THREE_JS_JOURNEY_LINKS_ARRAY,
  },
  shelbzWebsite: {
    title: "Portfolio for Shelbz Citrine",
    href: EXTERNAL_LINKS.shelbzWebsite,
    imgSrc: "/shelbz-website-project.png",
  },
};

export const PROJECT_LINKS_ARRAY = Object.values(PROJECT_LINKS);
export const BAND_LINKS_ARRAY = Object.values(BAND_LINKS);

export const PAGE_LINKS: Record<string, PageLink> = {
  blog: {
    title: "Blog",
    href: "/blog",
  },
  work: {
    title: "Work",
    href: "/work",
  },
  hobbies: {
    title: "Interests",
    href: "/hobbies",
  },
  music: {
    title: "Music",
    href: "/music",
    subLinks: BAND_LINKS_ARRAY,
  },
  projects: {
    title: "Projects",
    href: "/projects",
    subLinks: PROJECT_LINKS_ARRAY,
  },
};

export const NAV_LINKS_ARRAY = Object.values(PAGE_LINKS);

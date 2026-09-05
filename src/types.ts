export type SectionId =
  | 'intro'
  | 'spaces'
  | 'services'
  | 'construction'
  | 'projects'
  | 'journey'
  | 'process'
  | 'about'
  | 'contact';

export type Project = {
  id: string;
  title: string;
  summary: string;
  location: string;
  type: string;
  videoSrc: string;
  videoPosition: string;
};

export type Service = {
  title: string;
  description: string;
  // Present on roughly half the cards. A rail of six identical boxes reads as
  // filler, so media and typographic cards alternate down the track.
  videoSrc?: string;
};

export type BuildPhase = {
  label: string;
  title: string;
  description: string;
};

export type ConstructionHighlight = {
  title: string;
  description: string;
};

export type TimelineStep = {
  title: string;
  description: string;
};

export type Testimonial = {
  quote: string;
  name: string;
  projectType: string;
  location: string;
};

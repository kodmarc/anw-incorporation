export type SectionId =
  | 'intro'
  | 'spaces'
  | 'services'
  | 'construction'
  | 'projects'
  | 'journey'
  | 'process'
  | 'clients'
  | 'contact';

export type Project = {
  id: string;
  title: string;
  summary: string;
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

/** A client video hosted on YouTube. Only the video id is stored, never an embed. */
export type ClientVideo = {
  /** The id from the URL. For a Short, youtube.com/shorts/THIS_PART */
  youtubeId: string;
  /** Optional caption. Left off, the video runs without a label. */
  title?: string;
  client?: string;
};

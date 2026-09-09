import type { BuildPhase, ClientVideo, ConstructionHighlight, Project, SectionId, Service, TimelineStep } from './types';
import projectVideoOne from '../assets/c.mp4';
import projectVideoTwo from '../assets/d.mp4';
import projectVideoThree from '../assets/a.mp4';
import projectVideoFour from '../assets/b.mp4';
import projectVideoFive from '../assets/e.mp4';
import serviceVideoOne from '../assets/2.mp4';
import serviceVideoTwo from '../assets/3.mp4';
import serviceVideoThree from '../assets/f.mp4';

export const brand = {
  name: 'ANW Incorporation',
  short: 'ANW',
} as const;

export const contact = {
  email: 'anwincorporation@gmail.com',
  phone: '0304 2760727',
  // E.164 for the tel: link. Pakistan country code, leading zero dropped.
  phoneHref: '+923042760727',
  address: 'Office #202, 2nd Floor, 42C, 22nd Commercial Street, D.H.A Phase II Extension, Defence Housing Authority, Karachi, Sindh.',
  website: 'anwincorporation.com',
} as const;

// One CTA label per intent (skill section 4.5). Contact intent uses "Start a project"
// everywhere on the page. Portfolio intent uses "See our work".
export const cta = {
  contact: 'Start a project',
  work: 'See our work',
} as const;

const baseNav: Array<{ label: string; id: SectionId }> = [
  { label: 'Interior', id: 'spaces' },
  { label: 'Services', id: 'services' },
  { label: 'Construction', id: 'construction' },
  { label: 'Journey', id: 'journey' },
  { label: 'Process', id: 'process' },
  { label: 'Contact', id: 'contact' },
];

// Section numbers are deliberately absent: numbered eyebrows are a banned pattern
// (skill section 9.F). These labels are used for the mobile menu and footer only.
const baseSections: Array<{ id: SectionId; label: string }> = [
  { id: 'intro', label: 'Home' },
  { id: 'spaces', label: 'Interior' },
  { id: 'services', label: 'Services' },
  { id: 'construction', label: 'Construction' },
  { id: 'journey', label: 'Shell to interior' },
  { id: 'projects', label: 'Projects' },
  { id: 'process', label: 'Process' },
  { id: 'contact', label: 'Contact' },
];

export const services: Service[] = [
  {
    title: 'Interior design',
    description: 'Room planning, material palettes and lighting shaped around how the house is actually used.',
    videoSrc: serviceVideoOne,
  },
  {
    title: 'Construction planning',
    description: 'Site strategy, sequencing and budgeting that keep the build realistic and aligned with the design.',
  },
  {
    title: 'Fit-out and joinery',
    description: 'Carpentry, cabinetry and installation detail that bridge the structure and the finished room.',
    videoSrc: serviceVideoTwo,
  },
  {
    title: 'Renovation delivery',
    description: 'Structural upgrades, demolition and rebuild coordinated as one controlled process.',
  },
  {
    title: 'Build management',
    description: 'On-site coordination, trade sequencing and quality control from shell to handover.',
    videoSrc: serviceVideoThree,
  },
  {
    title: 'Custom interiors',
    description: 'Bespoke detailing and furniture integration shaped to the architecture of the house.',
  },
];

export const constructionHighlights: ConstructionHighlight[] = [
  {
    title: 'Survey and planning',
    description: 'We assess the shell, logistics and sequencing before work starts, so interior goals and site reality agree.',
  },
  {
    title: 'Structural works',
    description: 'Walls, openings and services are managed with the same care as the finished interior.',
  },
  {
    title: 'Finishes and fit-out',
    description: 'Joinery, flooring, lighting and fixtures land as one composed layer, not as separate trades.',
  },
  {
    title: 'Handover and aftercare',
    description: 'We close out with snagging, walkthroughs and finishing touches so the space is ready to live in.',
  },
];

// Drives the pinned WebGL build sequence. Each phase maps to a scroll range in
// the 3D scene: bare frame, enclosed shell, finished interior.
export const buildPhases: BuildPhase[] = [
  {
    label: 'Frame',
    title: 'It starts as structure.',
    description: 'Columns, beams and floor plates set the geometry every later decision has to live inside.',
  },
  {
    label: 'Shell',
    title: 'Then it becomes a building.',
    description: 'Walls, openings and services close the frame in while the interior intent stays fixed.',
  },
  {
    label: 'Interior',
    title: 'Then it becomes a home.',
    description: 'Light, material and joinery land last, on a structure that was planned to receive them.',
  },
];

export const projects: Project[] = [
  {
    id: 'contemporary-residence',
    title: 'Contemporary residence',
    summary: 'Open-plan entertaining spaces with warm stone, custom millwork and layered lighting.',
    type: 'Private residence',
    videoSrc: projectVideoOne,
    videoPosition: 'center center',
  },
  {
    id: 'warm-modern-home',
    title: 'Warm modern home',
    summary: 'Soft architectural lines and tactile materials shaping a family interior.',
    type: 'Residential interior',
    videoSrc: projectVideoTwo,
    videoPosition: 'center 45%',
  },
  {
    id: 'minimal-residence',
    title: 'Minimal residence',
    summary: 'A calm house with precise proportions and carefully edited material contrast.',
    type: 'Complete interior',
    videoSrc: projectVideoThree,
    videoPosition: 'center 30%',
  },
  {
    id: 'boutique-office-interior',
    title: 'Boutique office interior',
    summary: 'A compact work environment with warm finishes and a premium client-facing feel.',
    type: 'Office interior',
    videoSrc: projectVideoFour,
    videoPosition: 'center 60%',
  },
  {
    id: 'complete-transformation',
    title: 'Complete home transformation',
    summary: 'A full spatial reset, from raw potential to an intimate living environment.',
    type: 'Renovation',
    videoSrc: projectVideoFive,
    videoPosition: 'center 55%',
  },
];

// Verb labels, not "Stage 1 / Stage 2" (banned, skill section 9.F).
export const timeline: TimelineStep[] = [
  { title: 'Discover', description: 'We learn how you live, what the site allows and what the house needs to become.' },
  { title: 'Plan', description: 'Design, budget and construction approach are shaped into one path before work starts.' },
  { title: 'Build', description: 'Structural work, services and installation move forward in a controlled sequence.' },
  { title: 'Refine', description: 'Every material, finish and detail is selected and coordinated on site.' },
  { title: 'Deliver', description: 'The house is handed over finished, snagged and ready to live in.' },
];

/**
 * Client work videos.
 *
 * To add one: open the video on YouTube, copy the id out of the address bar, and
 * add an entry below. In https://www.youtube.com/watch?v=dQw4w9WgXcQ the id is
 * the part after "v=", so: dQw4w9WgXcQ
 *
 * The section is hidden while this list is empty, so nothing half-built ships.
 * Nothing loads from YouTube until a visitor actually clicks a video.
 */
export const clientWork: ClientVideo[] = [
  { youtubeId: 'xXmZD5WP7Z4' },
  { youtubeId: '8TN7LYGulKE' },
  { youtubeId: '2_cXE0ynIZE' },
  { youtubeId: '22Qtmc1Wtuk' },
];

// A link to a section that does not exist scrolls nowhere, so the client work
// entries are only added once there is at least one video.
const clientEntry = { label: 'Client work', id: 'clients' as SectionId };

export const navItems = clientWork.length
  ? [...baseNav.slice(0, -1), clientEntry, ...baseNav.slice(-1)]
  : baseNav;

export const sections = clientWork.length
  ? [...baseSections.slice(0, -1), { id: clientEntry.id, label: clientEntry.label }, ...baseSections.slice(-1)]
  : baseSections;

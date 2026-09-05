import type { BuildPhase, ConstructionHighlight, Project, SectionId, Service, Testimonial, TimelineStep } from './types';
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

// One CTA label per intent (skill section 4.5). Contact intent uses "Start a project"
// everywhere on the page. Portfolio intent uses "See our work".
export const cta = {
  contact: 'Start a project',
  work: 'See our work',
} as const;

export const navItems: Array<{ label: string; id: SectionId }> = [
  { label: 'Interior', id: 'spaces' },
  { label: 'Services', id: 'services' },
  { label: 'Construction', id: 'construction' },
  { label: 'Journey', id: 'journey' },
  { label: 'Process', id: 'process' },
  // Previously pointed at the hero, which meant "About" highlighted itself at the
  // top of the page and scrolled nowhere.
  { label: 'About', id: 'about' },
  { label: 'Contact', id: 'contact' },
];

// Section numbers are deliberately absent: numbered eyebrows are a banned pattern
// (skill section 9.F). These labels are used for the mobile menu and footer only.
export const sections: Array<{ id: SectionId; label: string }> = [
  { id: 'intro', label: 'Home' },
  { id: 'spaces', label: 'Interior' },
  { id: 'services', label: 'Services' },
  { id: 'construction', label: 'Construction' },
  { id: 'journey', label: 'Shell to interior' },
  { id: 'projects', label: 'Projects' },
  { id: 'process', label: 'Process' },
  { id: 'about', label: 'About' },
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
    location: '[Location]',
    type: 'Private residence',
    videoSrc: projectVideoOne,
    videoPosition: 'center center',
  },
  {
    id: 'warm-modern-home',
    title: 'Warm modern home',
    summary: 'Soft architectural lines and tactile materials shaping a family interior.',
    location: '[Location]',
    type: 'Residential interior',
    videoSrc: projectVideoTwo,
    videoPosition: 'center 45%',
  },
  {
    id: 'minimal-residence',
    title: 'Minimal residence',
    summary: 'A calm house with precise proportions and carefully edited material contrast.',
    location: '[Location]',
    type: 'Complete interior',
    videoSrc: projectVideoThree,
    videoPosition: 'center 30%',
  },
  {
    id: 'boutique-office-interior',
    title: 'Boutique office interior',
    summary: 'A compact work environment with warm finishes and a premium client-facing feel.',
    location: '[Location]',
    type: 'Office interior',
    videoSrc: projectVideoFour,
    videoPosition: 'center 60%',
  },
  {
    id: 'complete-transformation',
    title: 'Complete home transformation',
    summary: 'A full spatial reset, from raw potential to an intimate living environment.',
    location: '[Location]',
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

// TODO(client): these are PLACEHOLDERS. Replace with real, permissioned client
// quotes and names before publishing. Do not ship invented testimonials.
export const testimonials: Testimonial[] = [
  {
    quote: 'The build team and the interior team behaved like one team, and the result feels completely ours.',
    name: '[Client name]',
    projectType: 'Design and build residence',
    location: '[Location]',
  },
  {
    quote: 'The house feels calm and properly resolved, from the shell right through to the finishes.',
    name: '[Client name]',
    projectType: 'Construction and interiors',
    location: '[Location]',
  },
  {
    quote: 'It reads less like a renovation and more like a house that already knew us.',
    name: '[Client name]',
    projectType: 'Renovation and interior design',
    location: '[Location]',
  },
];

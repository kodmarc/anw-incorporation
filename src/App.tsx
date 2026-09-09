import { Suspense, lazy, useEffect, useLayoutEffect, useRef, useState, type FormEvent, type RefObject } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { BeforeAfterSlider } from './components/BeforeAfterSlider';
import { FloatingNav } from './components/FloatingNav';
import { LazyVideo } from './components/LazyVideo';
import { SectionHeader } from './components/SectionHeader';
import { YouTubeEmbed } from './components/YouTubeEmbed';
import { brand, buildPhases, clientWork, constructionHighlights, contact, cta, projects, sections, services, timeline } from './content';
import { useInteractions } from './hooks/useInteractions';
import { useLenis } from './hooks/useLenis';
import { useScrollScrubVideo } from './hooks/useScrollScrubVideo';
import { useMediaQuery } from './hooks/useMediaQuery';
import { usePrefersReducedMotion } from './hooks/usePrefersReducedMotion';
import { useScrollSpy } from './hooks/useScrollSpy';
import type { Project } from './types';
// The hero film, scrubbed by scroll.
import heroVideo from '../assets/hero-scrub.mp4';
import logoLockup from '../assets/anw-lockup.webp';
import processImage from '../assets/asset-image.jpeg';
import beforeImage from '../assets/before.jpeg';
import afterImage from '../assets/after.jpeg';

gsap.registerPlugin(ScrollTrigger);

// Three.js is a large dependency, so the scene loads as its own chunk and never
// blocks the first render (skill section 6.E).
// Note: src/three/StructureFrame.tsx is the previous WebGL hero. It is no longer
// imported, so it is not bundled, but the file is kept in case you want it back.
const BuildSequence = lazy(() =>
  import('./three/BuildSequence').then((module) => ({ default: module.BuildSequence })),
);

const sectionIds = sections.map((section) => section.id);

function useSiteAnimations(rootRef: RefObject<HTMLDivElement>, reducedMotion: boolean, canPin: boolean) {
  useLayoutEffect(() => {
    if (reducedMotion || !rootRef.current) {
      return undefined;
    }

    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((element) => {
        gsap.fromTo(
          element,
          { y: 34, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.9,
            ease: 'power3.out',
            scrollTrigger: { trigger: element, start: 'top 84%', toggleActions: 'play none none reverse' },
          },
        );
      });

      // Hero copy leads the page in, ahead of the WebGL frame assembling behind it.
      gsap.fromTo(
        '[data-hero-line]',
        { yPercent: 118 },
        { yPercent: 0, duration: 1.15, ease: 'power4.out', stagger: 0.09, delay: 0.1 },
      );
      gsap.fromTo(
        '[data-hero-fade]',
        { opacity: 0, y: 18 },
        { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', stagger: 0.09, delay: 0.5 },
      );

      gsap.utils.toArray<HTMLElement>('[data-parallax]').forEach((element) => {
        gsap.fromTo(
          element,
          { yPercent: 9 },
          {
            yPercent: -9,
            ease: 'none',
            scrollTrigger: { trigger: element, start: 'top bottom', end: 'bottom top', scrub: true },
          },
        );
      });

      // Statement lines: kinetic type that resolves as the section arrives.
      const statement = document.querySelector<HTMLElement>('[data-statement-section]');
      if (statement) {
        gsap.fromTo(
          '[data-statement-line]',
          { yPercent: 100, opacity: 0 },
          {
            yPercent: 0,
            opacity: 1,
            duration: 1,
            stagger: 0.11,
            ease: 'power4.out',
            scrollTrigger: { trigger: statement, start: 'top 76%', toggleActions: 'play none none reverse' },
          },
        );
      }

      // Process line draws itself as the timeline is read.
      const process = document.querySelector<HTMLElement>('[data-process-section]');
      if (process) {
        gsap.fromTo(
          '[data-process-line]',
          { scaleY: 0 },
          {
            scaleY: 1,
            ease: 'none',
            scrollTrigger: { trigger: process, start: 'top 68%', end: 'bottom 30%', scrub: true },
          },
        );
      }

      // Reading progress, written straight to the element instead of React state.
      gsap.fromTo(
        '[data-read-progress]',
        { scaleX: 0 },
        {
          scaleX: 1,
          ease: 'none',
          scrollTrigger: { trigger: document.body, start: 'top top', end: 'max', scrub: true },
        },
      );

      // Horizontal pan, canonical pinned skeleton. Desktop only: on phones the rail
      // scrolls natively with snap points instead of hijacking the page.
      const railWrap = document.querySelector<HTMLElement>('[data-rail-wrap]');
      const rail = document.querySelector<HTMLElement>('[data-rail]');
      if (canPin && railWrap && rail) {
        const distance = () => rail.scrollWidth - window.innerWidth + 96;
        gsap.to(rail, {
          x: () => -distance(),
          ease: 'none',
          scrollTrigger: {
            trigger: railWrap,
            start: 'top top',
            end: () => `+=${distance()}`,
            pin: true,
            // scrub: true, not a number. A numeric scrub adds catch-up lag, so the
            // rail was still gliding after the pin had already released, which read
            // as the section breaking mid-motion.
            scrub: true,
            invalidateOnRefresh: true,
          },
        });
      }
    }, rootRef);

    return () => ctx.revert();
  }, [reducedMotion, rootRef, canPin]);
}

function App() {
  const rootRef = useRef<HTMLDivElement>(null);
  const heroWrapRef = useRef<HTMLElement>(null);
  const heroPinRef = useRef<HTMLDivElement>(null);
  const heroVideoRef = useRef<HTMLVideoElement>(null);
  const heroCopyRef = useRef<HTMLDivElement>(null);
  const reducedMotion = usePrefersReducedMotion();
  const isDesktop = useMediaQuery('(min-width: 768px)');
  // Phones seek video far too slowly to scrub smoothly, so they get a looping
  // background instead of the scroll-driven playhead.
  const scrubHero = isDesktop && !reducedMotion;
  const activeId = useScrollSpy(sectionIds);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [formStatus, setFormStatus] = useState<'idle' | 'sending' | 'sent' | 'failed' | 'unconfigured'>('idle');

  useLenis(!reducedMotion);
  useSiteAnimations(rootRef, reducedMotion, isDesktop);
  useInteractions(rootRef, !reducedMotion);
  useScrollScrubVideo({
    wrapRef: heroWrapRef,
    pinRef: heroPinRef,
    videoRef: heroVideoRef,
    copyRef: heroCopyRef,
    enabled: scrubHero,
  });

  // Nav state comes from a ScrollTrigger toggle, not a scroll listener.
  // The end deliberately overshoots the document: with end "max" the trigger goes
  // inactive at the very bottom of the page, dropping the nav's background exactly
  // when the footer scrolls under it.
  useLayoutEffect(() => {
    const trigger = ScrollTrigger.create({
      start: 64,
      end: () => ScrollTrigger.maxScroll(window) + 400,
      onToggle: (self) => setScrolled(self.isActive),
    });
    return () => trigger.kill();
  }, []);

  // Under reduced motion the hero holds one frame. Park it a second in, so the
  // still is a real shot rather than whatever the first frame happens to be.
  useEffect(() => {
    const video = heroVideoRef.current;
    if (!reducedMotion || !video) return undefined;
    const hold = () => {
      video.pause();
      if (video.duration && Number.isFinite(video.duration)) {
        video.currentTime = Math.min(1, video.duration / 2);
      }
    };
    if (video.readyState >= 1) hold();
    else video.addEventListener('loadedmetadata', hold, { once: true });
    return () => video.removeEventListener('loadedmetadata', hold);
  }, [reducedMotion]);

  useEffect(() => {
    document.body.style.overflow = menuOpen || selectedProject ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen, selectedProject]);

  useEffect(() => {
    if (!selectedProject) return undefined;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSelectedProject(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selectedProject]);

  const goTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });


  /**
   * Posts the enquiry to whichever hosted form service is configured in .env.
   * A static site cannot receive email on its own, but it does not need a backend
   * of its own either: any service that accepts a form POST works here.
   *
   *   VITE_ENQUIRY_ENDPOINT   the service URL to post to
   *   VITE_ENQUIRY_ACCESS_KEY optional, for services that expect a key in the body
   */
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    // Delivers to the studio inbox out of the box. Override with a different
    // service (Formspree, Web3Forms) by setting VITE_ENQUIRY_ENDPOINT.
    const endpoint =
      import.meta.env.VITE_ENQUIRY_ENDPOINT || `https://formsubmit.co/ajax/${contact.email}`;

    setFormStatus('sending');
    try {
      const body = new FormData(form);
      const accessKey = import.meta.env.VITE_ENQUIRY_ACCESS_KEY;
      if (accessKey) body.append('access_key', accessKey);
      const subject = `New enquiry from the ${brand.name} website`;
      body.append('subject', subject);
      body.append('_subject', subject);
      body.append('_template', 'table');
      body.append('_captcha', 'false');

      const response = await fetch(endpoint, {
        method: 'POST',
        body,
        headers: { Accept: 'application/json' },
      });

      // A 200 does not mean delivered. These services answer 200 with a body that
      // says the send failed (an unactivated form, a bad key, a rejected address).
      // Trusting the status code alone tells the visitor their enquiry arrived when
      // it did not, and the enquiry is lost silently.
      let delivered = response.ok;
      try {
        const result = await response.clone().json();
        if (result && typeof result === 'object') {
          if ('success' in result) delivered = String(result.success) === 'true';
          else if ('ok' in result) delivered = result.ok === true;
          if ('errors' in result || 'error' in result) delivered = false;
        }
      } catch {
        // Not JSON. Fall back to the status code.
      }

      if (delivered) {
        setFormStatus('sent');
        form.reset();
      } else {
        setFormStatus('failed');
      }
    } catch {
      setFormStatus('failed');
    }
  };

  return (
    <div ref={rootRef} className="app-shell">
      <div className="read-progress" aria-hidden="true">
        <span data-read-progress />
      </div>
      <FloatingNav
        activeId={activeId}
        scrolled={scrolled}
        menuOpen={menuOpen}
        onMenuChange={setMenuOpen}
        onNavigate={goTo}
      />

      <main>
        <section className={`hero ${scrubHero ? 'hero--scrub' : ''}`} id="intro" ref={heroWrapRef}>
          <div className="hero__viewport" ref={heroPinRef}>
            <video
              className="hero__video"
              ref={heroVideoRef}
              src={heroVideo}
              muted
              playsInline
              preload="auto"
              // Three states: scrubbed by scroll on desktop, looping on phones, and
              // a single held frame under reduced motion, where an endlessly looping
              // background would be exactly the motion the user asked not to see.
              autoPlay={!scrubHero && !reducedMotion}
              loop={!scrubHero && !reducedMotion}
              aria-hidden="true"
            />
            <div className="hero__veil" />
            <div className="hero__content" ref={heroCopyRef}>
              <p className="eyebrow" data-hero-fade>
                Design and build studio
              </p>
              <h1>
                <span className="line">
                  <span data-hero-line>We build the structure,</span>
                </span>
                <span className="line">
                  <span data-hero-line>then design what fills it.</span>
                </span>
              </h1>
              <p className="hero__body" data-hero-fade>
                One team for construction and interiors, from site work and structure through to the last fitting.
              </p>
              <div className="actions" data-hero-fade>
                <button className="button" type="button" data-magnetic onClick={() => goTo('contact')}>
                  {cta.contact}
                </button>
                <button className="button button--ghost" type="button" onClick={() => goTo('projects')}>
                  {cta.work}
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="statement" id="spaces" data-statement-section>
          <h2 className="statement__type">
            {['Structure first.', 'Then light,', 'material, and calm.'].map((line) => (
              <span className="line" key={line}>
                <span data-statement-line>{line}</span>
              </span>
            ))}
          </h2>
          <p className="statement__body" data-reveal>
            Most houses are designed by one company and built by another. The gap between them is where budgets slip and
            details get lost. We hold both sides, so the drawing and the build stay the same idea.
          </p>
        </section>

        <section className="rail-section" id="services" data-rail-wrap>
          <div className="rail-section__inner">
            <div className="rail-section__header">
              <h2>A complete design and construction service.</h2>
            </div>
            <div className="rail" data-rail>
              {services.map((service) => (
                <article
                  className={`rail-card ${service.videoSrc ? 'rail-card--media' : 'rail-card--text'}`}
                  key={service.title}
                >
                  {service.videoSrc ? (
                    <span className="rail-card__media" aria-hidden="true">
                      <LazyVideo className="rail-card__video" src={service.videoSrc} autoPlay loop muted playsInline />
                    </span>
                  ) : (
                    <span className="rail-card__rule" aria-hidden="true" />
                  )}
                  <h3>{service.title}</h3>
                  <p>{service.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="pillars-section section" id="construction">
          <div className="pillars-section__copy" data-reveal>
            <h2>We build the structure the interior sits inside.</h2>
            <p>
              From shell works to fit-out and handover, the build stays practical, coordinated and aligned to the finished
              room from day one.
            </p>
          </div>
          <div className="pillars" data-reveal>
            {constructionHighlights.map((item) => (
              <article className="pillar" key={item.title}>
                <span className="pillar__rule" aria-hidden="true" />
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="sequence-section" id="journey">
          <SectionHeader
            eyebrow="How a house comes together"
            title="Watch the shell become an interior."
            description="Scroll to move through the three stages we run in-house, from bare frame to finished room."
          />
          <Suspense fallback={<div className="sequence sequence--loading" aria-hidden="true" />}>
            <BuildSequence phases={buildPhases} reducedMotion={reducedMotion} />
          </Suspense>
        </section>

        <section className="projects section" id="projects">
          <SectionHeader title="Selected projects." description="Five recent houses and workspaces, start to finish." />
          <div className="projects__grid">
            {projects.map((project) => (
              <button
                className="project"
                key={project.id}
                type="button"
                data-tilt
                data-reveal
                onClick={() => setSelectedProject(project)}
              >
                <span className="project__media">
                  <LazyVideo
                    className="project__video"
                    src={project.videoSrc}
                    style={{ objectPosition: project.videoPosition }}
                    autoPlay
                    loop
                    muted
                    playsInline
                  />
                </span>
                <span className="project__body">
                  <span className="project__type">{project.type}</span>
                  <span className="project__title">{project.title}</span>
                  <span className="project__summary">{project.summary}</span>
                </span>
              </button>
            ))}
          </div>
        </section>

        <section className="compare section">
          <div className="compare__copy" data-reveal>
            <h2>From shell to home.</h2>
            <p>Drag to see the same room before we started and after handover.</p>
          </div>
          <div className="compare__frame" data-reveal>
            <BeforeAfterSlider
              beforeSrc={beforeImage}
              afterSrc={afterImage}
              beforeAlt="The same living room stripped back to bare plaster and screed, with a ladder and dust sheets against the right wall."
              afterAlt="The finished living room with oak flooring, full-height timber joinery, linen seating and recessed lighting."
            />
          </div>
        </section>

        <section className="process section" id="process" data-process-section>
          <SectionHeader eyebrow="Process" title="Five stages, one team." />
          <div className="process__layout">
            <div className="process__media" data-reveal>
              <img
                src={processImage}
                alt="Drawings, a scale ruler, oak, plaster and metal samples, and a hard hat laid out on a work table."
                loading="lazy"
                decoding="async"
              />
            </div>
            <div className="process__steps">
              <div className="process__line" aria-hidden="true">
                <span data-process-line />
              </div>
              <ol>
                {timeline.map((step) => (
                  <li className="process__step" key={step.title} data-reveal>
                    <h3>{step.title}</h3>
                    <p>{step.description}</p>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        {clientWork.length > 0 ? (
          <section className="clients section" id="clients">
            <SectionHeader
              title="Hear it from the people we built for."
              description="Short conversations with clients about how the work actually went."
            />
            <div className="clients__grid" data-reveal>
              {clientWork.map((video, index) => (
                <figure className="client" key={`${video.youtubeId}-${index}`}>
                  <YouTubeEmbed
                    video={video}
                    label={video.title ?? `${brand.name} client video ${index + 1}`}
                    autoPlay={!reducedMotion}
                  />
                  {video.title || video.client ? (
                    <figcaption>
                      {video.title ? <span className="client__title">{video.title}</span> : null}
                      {video.client ? <span className="client__name">{video.client}</span> : null}
                    </figcaption>
                  ) : null}
                </figure>
              ))}
            </div>
          </section>
        ) : null}

        <section className="contact section" id="contact">
          <div className="contact__copy" data-reveal>
            <h2>Tell us about the house.</h2>
            <p>Send the basics and we will come back with a first view on scope, sequence and budget.</p>
            <dl className="contact__details">
              <div>
                <dt>Email</dt>
                <dd>
                  <a href={`mailto:${contact.email}`}>{contact.email}</a>
                </dd>
              </div>
              <div>
                <dt>Phone</dt>
                <dd>
                  <a href={`tel:${contact.phoneHref}`}>{contact.phone}</a>
                </dd>
              </div>
              <div>
                <dt>Studio</dt>
                <dd>{contact.address}</dd>
              </div>
              <div>
                <dt>Web</dt>
                <dd>
                  <a href={`https://${contact.website}`}>{contact.website}</a>
                </dd>
              </div>
            </dl>
          </div>
          <form className="contact-form" data-reveal onSubmit={handleSubmit}>
            <label>
              Name
              <input name="name" type="text" autoComplete="name" required />
            </label>
            <label>
              Email
              <input name="email" type="email" autoComplete="email" required />
            </label>
            <label>
              Phone
              <input name="phone" type="tel" autoComplete="tel" />
            </label>
            <label>
              Project type
              <input name="projectType" type="text" placeholder="Renovation, new build, interior only" />
            </label>
            <label className="contact-form__wide">
              What are you planning?
              <textarea name="message" rows={4} required />
            </label>
            {/* Honeypots. Real people never fill these; bots usually do. Both names
                are here because the common form services look for different ones. */}
            <input className="contact-form__trap" type="text" name="botcheck" tabIndex={-1} autoComplete="off" />
            <input className="contact-form__trap" type="text" name="_gotcha" tabIndex={-1} autoComplete="off" />
            <input className="contact-form__trap" type="text" name="_honey" tabIndex={-1} autoComplete="off" />
            <button className="button" type="submit" data-magnetic disabled={formStatus === 'sending'}>
              {formStatus === 'sending' ? 'Sending' : cta.contact}
            </button>
            <p className="contact-form__status" role="status">
              {formStatus === 'sent' ? 'Thanks. We will reply within two working days.' : null}
              {formStatus === 'failed' ? 'That did not send. Please email us directly and we will pick it up.' : null}
              {formStatus === 'unconfigured'
                ? `Could not reach the mail service. Please email us at ${contact.email}.`
                : null}
            </p>
          </form>
        </section>

        <footer className="footer">
          <div className="footer__top">
            <img className="footer__logo" src={logoLockup} alt={brand.name} width={560} height={325} />
            <nav className="footer__links" aria-label="Footer navigation">
              {sections.map((section) => (
                <button key={section.id} type="button" onClick={() => goTo(section.id)}>
                  {section.label}
                </button>
              ))}
            </nav>
          </div>
          <p className="footer__legal">
            © {new Date().getFullYear()} {brand.name}. All rights reserved.
          </p>
        </footer>
      </main>

      {selectedProject ? (
        <div className="modal" role="dialog" aria-modal="true" aria-label={selectedProject.title}>
          <button className="modal__backdrop" type="button" aria-label="Close project" onClick={() => setSelectedProject(null)} />
          <div className="modal__panel">
            <LazyVideo className="modal__video" src={selectedProject.videoSrc} autoPlay loop muted playsInline />
            <div className="modal__content">
              <button className="modal__close" type="button" onClick={() => setSelectedProject(null)}>
                Close
              </button>
              <span className="modal__type">{selectedProject.type}</span>
              <h2>{selectedProject.title}</h2>
              <p>{selectedProject.summary}</p>
            </div>
          </div>
        </div>
      ) : null}

      {menuOpen ? (
        <div className="mobile-menu" id="mobile-menu">
          {sections.map((section, index) => (
            <button
              className="mobile-menu__link"
              key={section.id}
              type="button"
              style={{ animationDelay: `${index * 55}ms` }}
              onClick={() => {
                setMenuOpen(false);
                goTo(section.id);
              }}
            >
              {section.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export default App;

import { useCallback, useContext, useRef, useState, type CSSProperties } from "react";
import { Link, useLocation, useNavigate, useNavigationType, useParams } from "react-router-dom";
import { FiArrowLeft, FiArrowRight, FiArrowUpRight } from "react-icons/fi";
import { useProject, useProjects } from "../../lib/hooks";
import { detailScreens } from "../../lib/project-detail-screens";
import { PageMeta } from "../PageMeta";
import { PublicDataState } from "../PublicDataState";
import { CaseGallery } from "../CaseGallery";
import { EngineeringCaseStudy } from "../EngineeringCaseStudy";
import { nonempty, projectDisplayName } from "../../../shared/content-integrity";
import { caseStudyFor, screenMatches, caseStudyImageCaption } from "../../../shared/case-study-runtime";
import { CaseNarrative } from "./CaseNarrative";
import { CaseDisclosure } from "./CaseDisclosure";
import { CaseMediaNav } from "./CaseMediaNav";
import { ScreenshotFrame } from "./ScreenshotFrame";
import { JobPilotJourneyContext, ordinaryActivation } from './jobpilot-journey';
import { useJobPilotHandoff } from './use-jobpilot-handoff';
import './jobpilot-handoff.css';
import { completeScreenSource, isRegistrationExcerpt, mediaPresentation, screenColumnWidth, screenGeometry, screenOriginalSource, screenSizes, type DetailScreen } from "../../lib/project-detail-screens";

export function ProjectReader() {
  const { slug = "" } = useParams();
  const location = useLocation();
  const navigate = useNavigate(), navigation = useNavigationType();
  const journeys = useContext(JobPilotJourneyContext);
  const from = location.state as { collection?: string; jobpilotJourney?: { key: string; screen: string } } | null;
  const collectionUrl = from?.collection?.startsWith('/?') && new URLSearchParams(from.collection.slice(2).split('#')[0]).get('project') === slug
    ? from.collection : slug === 'jobpilot-ai' && from?.jobpilotJourney ? '/?project=jobpilot-ai' : undefined;
  const journey = slug === 'jobpilot-ai' ? journeys.get(from?.jobpilotJourney?.key ?? '') : undefined;
  const root = useRef<HTMLElement>(null);
  const record = useProject(slug),
    projects = useProjects();
  const [chapterRecord, setChapterRecord] = useState<{slug: string; index: number; source?: string}>({ slug, index: 0, source: slug === 'jobpilot-ai' ? from?.jobpilotJourney?.screen : undefined }),
    [zoomRecord, setZoomRecord] = useState<{ slug: string; index: number } | null>(null);
  const chapter = chapterRecord.slug === slug ? chapterRecord.index : 0;
  const [readyRecord, setReadyRecord] = useState<{ slug: string; src: string } | null>(null);
  const imageReady = useCallback((src: string) => setReadyRecord(previous => previous?.slug === slug && previous.src === src ? previous : { slug, src }), [slug]);
  const zoom = zoomRecord?.slug === slug ? zoomRecord.index : null;
  const setZoom = (index: number | null) => setZoomRecord(index === null ? null : { slug, index });
  const setChapter = (index: number) => setChapterRecord({ slug, index, source: undefined });
  const [galleryTrigger, setGalleryTrigger] = useState<HTMLButtonElement | null>(null);
  const openGallery = (index: number, trigger: HTMLButtonElement) => {
    setGalleryTrigger(trigger);
    setZoomRecord({ slug, index });
  };
  const project = record.data;
  useJobPilotHandoff(root, journey, location.key, Boolean(project && !record.isLoading && !record.isError), navigation !== 'POP', chapterRecord.source ?? String(chapter));
  if (record.isLoading || record.isError || !project)
    return (
        <main className="page-surface" id="main-content" tabIndex={-1} ref={root}>
        <PublicDataState
          loading={record.isLoading}
          error={record.isError}
          onRetry={() => void record.refetch()}
          label="project"
        />
      </main>
    );
  const study = caseStudyFor(project);
  const originals = detailScreens(project);
  const leadIndex = study ? originals.findIndex(screen => screenMatches(screen.src, study.lead.map(completeScreenSource))) : -1;
  const screens = leadIndex > 0 ? [originals[leadIndex], ...originals.filter((_, index) => index !== leadIndex)] : originals;
  const displayName = projectDisplayName(project);
  const imageExplanation = (screen: DetailScreen) => study?.mediaQualification
    ?? study?.workflow.find(step => screenMatches(screen.src, step.matches.map(completeScreenSource)))?.notice
    ?? (mediaPresentation(screen.src)?.role === 'artwork' ? 'Project overview artwork.' : 'Recorded project screen. Open full screen for details.');
  const role = project.myRole?.trim();
  const ownership = project.ownership?.trim();
  const contributions = nonempty(project.contributions);
  const team = nonempty(project.team);
  const hasContribution = Boolean(role || ownership || contributions.length);
  const teamSize = project.teamSize || (team.length > 1 ? team.length : null);
  const features = nonempty(project.features);
  const stack = nonempty(project.stack);
  const purpose = study?.summary || project.tagline?.trim() || project.description?.trim();
  const overview = project.overview?.trim() || project.description?.trim();
  const carriedIndex = screens.findIndex(screen => screen.src === chapterRecord.source);
  const activeIndex = carriedIndex >= 0 ? carriedIndex : chapter < screens.length ? chapter : 0;
  const current = screens[activeIndex];
  const displayedIndex = readyRecord?.slug === slug ? screens.findIndex(screen => screen.src === readyRecord.src) : -1;
  const displayed = screens[displayedIndex] ?? current;
  const geometry = current && screenGeometry(current);
  const all =
    projects.data?.filter(
      (item) => item.published && item.showOnPortfolio !== false,
    ) ?? [];
  const next =
    all.length > 1
      ? all[(all.findIndex((item) => item.slug === slug) + 1) % all.length]
      : undefined;
  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="page-surface project-reader"
      ref={root}
    >
      <PageMeta
        title={displayName}
        description={study?.summary || project.description || undefined}
        image={isRegistrationExcerpt(project.coverImage ?? '') ? screens[0]?.src : project.coverImage}
        canonicalPath={`/projects/${slug}`}
      />
      <article className={`case-page${study ? ` reviewed-case reviewed-case-${study.kind}` : ''}`}>
        <Link
          className="case-back text-link"
          to={
            collectionUrl
              ? collectionUrl
              : "/projects"
          }
          state={slug === 'jobpilot-ai' && from?.jobpilotJourney ? {
            ...journey?.routeState, jobpilotReturn: from.jobpilotJourney.key,
            jobpilotScreen: from.jobpilotJourney.screen,
            routeRestore: journey?.position ?? { x: 0, y: 0 },
          } : undefined}
          replace={Boolean(slug === 'jobpilot-ai' && from?.jobpilotJourney)}
          onClick={event => {
            if (!journey || !ordinaryActivation(event) || journey.historyIndex < 0 || history.state?.idx !== journey.historyIndex + 1) return;
            event.preventDefault(); navigate(-1);
          }}
        >
          <FiArrowLeft />
          {from?.collection ? "Collection" : "All projects"}
        </Link>
        <header className="case-heading">
          <div>
            <span className="eyebrow">{slug === 'jobpilot-ai' && <><span className="case-project-number">01</span> / </>}CASE STUDY / {project.type}</span>
            <h1 className="view-heading">{displayName}</h1>
            {displayName !== project.name && <p className="case-functional-name">{project.name}</p>}
            {(role || teamSize) && <p className="case-role">
              {role && <span>{role}</span>}
              {Boolean(teamSize) && (
                <span className="case-team-size">
                  {teamSize === 1 ? "Independent project." : `${teamSize}-person team`}
                </span>
              )}
            </p>}
            {project.program?.trim() && <p>{project.program}</p>}
          </div>
          <div>
            {purpose && <p className="case-purpose">
              {purpose}
            </p>}
            {!study && project.impactSummary?.trim() && <p>{project.impactSummary}</p>}
            {(project.demo || project.github) && <div className="case-actions">
              {project.demo && (
                <a
                  href={project.demo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="solid-action"
                >
                  View demo
                  <FiArrowUpRight />
                </a>
              )}
              {project.github && (
                <a
                  href={project.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-link"
                  aria-label={study?.sourceAccess === 'private' ? 'Source code (access required)' : undefined}
                >
                  {study?.sourceAccess === 'private' ? 'Private source' : 'Source code'}
                  <FiArrowUpRight />
                </a>
              )}
            </div>}
          </div>
        </header>
        {current && (
          <>
            <CaseMediaNav screens={screens} index={activeIndex} select={setChapter} enlarge={trigger => openGallery(displayedIndex >= 0 ? displayedIndex : activeIndex, trigger)} />
            <figure className="case-figure" data-source={current.src}>
              <ScreenshotFrame src={current.src} alt={`${displayName}: ${current.label}`} label={`${displayName} screenshot`}
                ratio={`${geometry?.width ?? 16} / ${geometry?.height ?? 10}`}
                buttonClassName="case-image" priority
                style={{ '--frame-max-width': `${screenColumnWidth(current)}px` } as CSSProperties}
                sizes={screenSizes(current)}
                onImageReady={imageReady} enlarge={trigger => openGallery(displayedIndex >= 0 ? displayedIndex : activeIndex, trigger)} />
              <figcaption className="image-caption">{study ? caseStudyImageCaption(study, screenOriginalSource(displayed.src), displayed.label) : displayed.label}</figcaption>
              <button className="text-link case-full-screen" onClick={event => openGallery(displayedIndex >= 0 ? displayedIndex : activeIndex, event.currentTarget)}>View full screen<FiArrowUpRight /></button>
            </figure>
          </>
        )}
        {study ? <CaseNarrative project={project} study={study} screens={screens} openGallery={openGallery} /> : <>
        <div className={`case-notes${hasContribution || team.length ? '' : ' case-notes-single'}`}>
          <section id="overview">
            <span className="eyebrow">01 / OVERVIEW</span>
            <h2>The project.</h2>
            {overview && <p>{overview}</p>}
            {stack.length > 0 && <div className="stack-tags">
              {stack.map((tech) => (
                <span key={tech}>{tech}</span>
              ))}
            </div>}
          </section>
          {hasContribution && <section id="contribution">
            <span className="eyebrow">02 / CONTRIBUTION</span>
            <h2>My part in the work.</h2>
            {role && <p>{role}</p>}
            {ownership && <p>{ownership}</p>}
            {contributions.length > 0 && <ul>
              {contributions.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>}
            {team.length > 0 && (
              <>
                <h3>Team</h3>
                <ul>
                  {team.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </>
            )}
          </section>}
          {!hasContribution && team.length > 0 && <section id="team">
            <span className="eyebrow">TEAM DELIVERY</span>
            <h2>The team.</h2>
            <ul>{team.map(member => <li key={member}>{member}</li>)}</ul>
          </section>}
        </div>
        {(project.problem?.trim() || project.solution?.trim()) && (
          <div className="case-notes">
            {project.problem?.trim() && (
              <section>
                <span className="eyebrow">THE PROBLEM</span>
                <h2>What needed to change.</h2>
                <p>{project.problem}</p>
              </section>
            )}
            {project.solution?.trim() && (
              <section>
                <span className="eyebrow">THE SOLUTION</span>
                <h2>The approach.</h2>
                <p>{project.solution}</p>
              </section>
            )}
          </div>
        )}
        {features.length > 0 && (
          <section className="reader-features" id="workflow">
            <span className="eyebrow">03 / PRODUCT WORKFLOW</span>
            <h2>What it does.</h2>
            <ul>
              {features.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </section>
        )}
        {Boolean(
          project.architecture?.length ||
            project.codeDiffs?.length ||
            project.benchmarks?.length,
        ) && (
          <EngineeringCaseStudy
            architecture={project.architecture}
            codeDiffs={project.codeDiffs}
            benchmarks={project.benchmarks}
          />
        )}
        </>}
        {screens.length > 1 && (study ? <CaseDisclosure className="case-gallery-disclosure" title={`All project images (${screens.length})`}>
          <section className="reader-gallery" id="gallery">
            <span className="eyebrow">PRODUCT GALLERY / {screens.length} IMAGES</span>
            <div>{screens.map((screen, index) => <figure key={screen.src}>
              <figcaption><h3>{screen.label}</h3><p>{imageExplanation(screen)}</p></figcaption>
              <ScreenshotFrame src={screen.src} alt={`${displayName}: ${screen.label}`} label={screen.label} ratio={`${screenGeometry(screen).width} / ${screenGeometry(screen).height}`}
                sizes={screenSizes(screen)} style={{ '--frame-max-width': `${screenColumnWidth(screen)}px` } as CSSProperties} enlarge={trigger => openGallery(index, trigger)} />
              <button className="text-link" onClick={event => openGallery(index, event.currentTarget)}>View full screen<FiArrowUpRight /></button>
            </figure>)}</div>
          </section>
        </CaseDisclosure> : (
          <section className="reader-gallery" id="gallery">
            <span className="eyebrow">
              PRODUCT GALLERY / {screens.length} IMAGES
            </span>
            <div>
              {screens.map((screen, index) => (
                <figure key={screen.src}>
                  <figcaption><h3>{screen.label}</h3><p>{imageExplanation(screen)}</p></figcaption>
                  <ScreenshotFrame src={screen.src} alt={`${displayName}: ${screen.label}`} label={screen.label} ratio={`${screenGeometry(screen).width} / ${screenGeometry(screen).height}`}
                    sizes={screenSizes(screen)} style={{ '--frame-max-width': `${screenColumnWidth(screen)}px` } as CSSProperties} enlarge={trigger => openGallery(index, trigger)} />
                  <button className="text-link" onClick={event => openGallery(index, event.currentTarget)}>View full screen<FiArrowUpRight /></button>
                </figure>
              ))}
            </div>
          </section>
        ))}
        <div className="case-end">
          <Link className="text-link" to="/projects">
            <FiArrowLeft />
            All projects
          </Link>
          {next && (
            <Link className="next-project" to={`/projects/${next.slug}`}>
              <span className="eyebrow">NEXT PROJECT</span>
              <span>
                {projectDisplayName(next)}
                <FiArrowRight />
              </span>
            </Link>
          )}
        </div>
      </article>
      {zoom !== null && screens[zoom] && (
        <CaseGallery
          key={project.id}
          screens={screens}
          projectName={displayName}
          initialIndex={zoom}
          returnFocusTo={galleryTrigger}
          notice={study?.mediaQualification}
          onClose={() => setZoom(null)}
        />
      )}
    </main>
  );
}

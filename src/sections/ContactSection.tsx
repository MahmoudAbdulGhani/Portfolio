import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import {
  FiArrowRight,
  FiArrowUpRight,
  FiCheckCircle,
  FiGithub,
  FiInstagram,
  FiLinkedin,
  FiLoader,
  FiMail,
  FiMessageCircle,
  FiPhone,
  FiSend,
  FiZap,
  FiMapPin,
  FiMonitor,
} from "react-icons/fi";
import { useProfile, useSiteSection, useSubmitMessage } from "../lib/hooks";
import { Reveal } from "../components/Reveal";
import { cn } from "../lib/format";

const socialIcons = { github: FiGithub, linkedin: FiLinkedin, instagram: FiInstagram, whatsapp: FiMessageCircle };

type FormState = { name: string; email: string; subject: string; message: string; website: string };
type FormErrors = Partial<Record<keyof FormState, string>>;

const initialForm: FormState = { name: "", email: "", subject: "", message: "", website: "" };

function validate(form: FormState): FormErrors {
  const errors: FormErrors = {};
  if (!form.name.trim()) errors.name = "Please enter your name.";
  if (!form.email.trim()) {
    errors.email = "Please enter your email.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
    errors.email = "Please enter a valid email address.";
  }
  if (!form.message.trim()) errors.message = "Please write a short message.";
  return errors;
}

export function ContactSection() {
  const { data: profile } = useProfile();
  const { data: section } = useSiteSection("contact");
  const { data: jobMatchSection } = useSiteSection("jobMatch");
  const submit = useSubmitMessage();
  const successRef = useRef<HTMLDivElement>(null);
  useEffect(() => { if (submit.isSuccess) successRef.current?.focus(); }, [submit.isSuccess]);
  const [form, setForm] = useState<FormState>(initialForm);
  const [touched, setTouched] = useState<Partial<Record<keyof FormState, boolean>>>({});
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState("");
  const [sentEmail, setSentEmail] = useState("");

  const contentText = (key: string) => typeof section?.content[key] === "string" ? section.content[key] as string : "";
  // The profile is the single response-time source when older CMS copy repeats a conflicting promise.
  const confirmation = contentText("successMessage").replace("your email", sentEmail || "your email");
  const successMessage = profile?.responseTime ? confirmation.replace(/\s*[—–-]\s*I usually reply[^.]*\./i, ".") : confirmation;
  const availabilityOptions = Array.isArray(section?.content.availabilityOptions) ? section.content.availabilityOptions.filter((item): item is string => typeof item === "string") : [];
  const cards = profile ? [
    { id: "phone", label: "Phone", value: profile.phone, href: `tel:${profile.phone.replace(/[^+0-9]/g, "")}`, icon: FiPhone, priority: true },
    { id: "email", label: "Email", value: profile.email, href: `mailto:${profile.email}`, icon: FiMail, priority: true },
    ...profile.socials.filter((social) => social.showInContact !== false).map((social) => ({ id: social.id ?? social.url, label: social.label, value: social.username || social.label, href: social.platform === "whatsapp" ? `https://wa.me/${(profile.whatsappNumber || profile.phone).replace(/[^0-9]/g, "")}?text=${encodeURIComponent(profile.whatsappMessage || "")}` : social.url, icon: socialIcons[social.platform as keyof typeof socialIcons] ?? FiArrowUpRight, priority: false })),
  ] : [];

  const setField = (key: keyof FormState, value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const markTouched = (key: keyof FormState) =>
    setTouched((t) => ({ ...t, [key]: true }));

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (submit.isPending) return;
    setSubmitError("");
    const nextErrors = validate(form);
    setErrors(nextErrors);
    setTouched({ name: true, email: true, subject: true, message: true });
    if (Object.keys(nextErrors).length > 0) { requestAnimationFrame(() => document.getElementById(`contact-${Object.keys(nextErrors)[0]}`)?.focus()); return; }

    submit.mutate(form, {
      onSuccess: () => {
        setSentEmail(form.email.trim());
        setForm(initialForm);
        setTouched({});

      },
      onError: () => setSubmitError("Something went wrong. Please try again."),
    });
  };

  const field = (key: keyof FormState) => {
    const hasError = Boolean(touched[key] && errors[key]);
    const errorId = `${key}-error`;
    return {
      hasError,
      errorId,
      ariaInvalid: hasError || undefined,
      describedBy: hasError ? errorId : undefined,
    };
  };

  const nameField = field("name");
  const emailField = field("email");
  const subjectField = field("subject");
  const messageField = field("message");

  const heading = section?.heading || "Start a real conversation";
  const split = heading.lastIndexOf(" ");
  return <section id="contact" className="public-container">
    <div className="contact-layout">
      <Reveal y={14} className="contact-intro">
        <p className="public-eyebrow">{section?.eyebrow || "Contact"}</p>
        <h1>{split > 0 ? <>{heading.slice(0, split)} <em>{heading.slice(split + 1)}</em></> : heading}</h1>
        <p className="contact-description">{section?.description}</p>
        <div className="contact-availability"><ul>{availabilityOptions.map(option => <li key={option}>{option}</li>)}</ul>{profile?.location && <p><FiMapPin aria-hidden />{profile.location}</p>}{profile?.remoteAvailability && <p><FiMonitor aria-hidden />{profile.remoteAvailability}</p>}</div>
        <div className="contact-links">{cards.filter(card => card.priority).sort((a,b) => Number(b.id === "email") - Number(a.id === "email")).map(card => { const Icon = card.icon; const external = card.href.startsWith("http"); return <a key={card.id} href={card.href} target={external ? "_blank" : undefined} rel={external ? "noopener noreferrer" : undefined} className="contact-link"><Icon aria-hidden /><span><small>{card.label}</small><strong>{card.value}</strong></span><FiArrowUpRight aria-hidden /></a>; })}</div>
        <div className="contact-socials">{cards.filter(card => !card.priority).map(card => { const Icon = card.icon; return <a key={card.id} href={card.href} target="_blank" rel="noopener noreferrer" aria-label={`${card.label}: ${card.value}`}><Icon aria-hidden />{card.label}<FiArrowUpRight aria-hidden /></a>; })}</div>
      </Reveal>
      <Reveal y={14} delay={0.08}>
        {submit.isSuccess ? <div className="contact-success ai-state-enter" role="status" tabIndex={-1} ref={successRef}><FiCheckCircle aria-hidden /><h2>{contentText("successHeading")}</h2><p>{successMessage}</p>{profile?.responseTime && <p>{profile.responseTime}</p>}<button type="button" className="btn-outline" onClick={() => { submit.reset(); requestAnimationFrame(() => document.getElementById("contact-name")?.focus()); }}>Send another message</button></div> : (
              <form onSubmit={handleSubmit} noValidate className="contact-form">
                <div className="absolute -left-[10000px]" aria-hidden="true"><label htmlFor="contact-website">Website</label><input id="contact-website" name="website" tabIndex={-1} autoComplete="off" value={form.website} onChange={(e) => setField("website", e.target.value)} /></div>
                <h2>
                  {contentText("formHeading")}
                </h2>
                <p className="mt-1 text-sm text-muted">
                  {profile?.responseTime || contentText("formDescription")}
                </p>

                <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="contact-name" className="field-label">
                      Name
                    </label>
                    <input
                      id="contact-name"
                      className={cn("input", nameField.hasError && "input-error")}
                      autoComplete="name"
                      placeholder="Your name"
                      value={form.name}
                      onChange={(e) => setField("name", e.target.value)}
                      onBlur={() => markTouched("name")}
                      aria-invalid={nameField.ariaInvalid}
                      aria-describedby={nameField.describedBy}
                      required
                    />
                    {nameField.hasError && (
                      <p id={nameField.errorId} className="inline-state-enter mt-1.5 text-xs font-medium text-danger">
                        {errors.name}
                      </p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="contact-email" className="field-label">
                      Email
                    </label>
                    <input
                      id="contact-email"
                      type="email"
                      autoComplete="email"
                      className={cn("input", emailField.hasError && "input-error")}
                      placeholder="you@example.com"
                      value={form.email}
                      onChange={(e) => setField("email", e.target.value)}
                      onBlur={() => markTouched("email")}
                      aria-invalid={emailField.ariaInvalid}
                      aria-describedby={emailField.describedBy}
                      required
                    />
                    {emailField.hasError && (
                      <p id={emailField.errorId} className="inline-state-enter mt-1.5 text-xs font-medium text-danger">
                        {errors.email}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-4">
                  <label htmlFor="contact-subject" className="field-label">
                    Subject <span className="font-normal normal-case text-faint">(optional)</span>
                  </label>
                  <input
                    id="contact-subject"
                    className={cn("input", subjectField.hasError && "input-error")}
                    placeholder="What's this about?"
                    value={form.subject}
                    onChange={(e) => setField("subject", e.target.value)}
                    onBlur={() => markTouched("subject")}
                    aria-invalid={subjectField.ariaInvalid}
                    aria-describedby={subjectField.describedBy}
                  />
                  {subjectField.hasError && (
                    <p id={subjectField.errorId} className="inline-state-enter mt-1.5 text-xs font-medium text-danger">
                      {errors.subject}
                    </p>
                  )}
                </div>

                <div className="mt-4">
                  <label htmlFor="contact-message" className="field-label">
                    Message
                  </label>
                  <textarea
                    id="contact-message"
                    className={cn("textarea min-h-36 resize-y", messageField.hasError && "textarea-error")}
                    placeholder="Tell me about the role or project…"
                    value={form.message}
                    onChange={(e) => setField("message", e.target.value)}
                    onBlur={() => markTouched("message")}
                    aria-invalid={messageField.ariaInvalid}
                    aria-describedby={messageField.describedBy}
                    required
                  />
                  {messageField.hasError && (
                    <p id={messageField.errorId} className="inline-state-enter mt-1.5 text-xs font-medium text-danger">
                      {errors.message}
                    </p>
                  )}
                </div>

                {submitError && (
                  <p
                    role="alert"
                    className="inline-state-enter mt-4 flex items-center gap-2 rounded-lg border border-danger/30 bg-danger/10 px-4 py-3 text-sm font-semibold text-danger"
                  >
                    {submitError}
                  </p>
                )}

                <div className="mt-6 flex flex-wrap items-center gap-4">
                  <button
                    type="submit"
                    disabled={submit.isPending}
                    className="btn-primary group"
                  >
                    {submit.isPending ? (
                      <>
                        <FiLoader size={15} className="animate-spin" />
                        Sending…
                      </>
                    ) : (
                      <>
                        <FiSend
                          size={15}
                          className="transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                        />
                        Send message
                      </>
                    )}
                  </button>
                  <span className="text-xs text-faint">
                    Prefer email? Write to{" "}
                    <a
                      href={`mailto:${profile?.email ?? ""}`}
                      className="link-inline"
                    >
                      {profile?.email}
                    </a>
                  </span>
                </div>
              </form>
        )}
      </Reveal>
    </div>
    {jobMatchSection?.visible !== false && <Reveal y={12}><div className="contact-promotion"><div><FiZap size={24} aria-hidden /><div><h2>{contentText("jobMatchHeading")}</h2><p>{contentText("jobMatchText")}</p></div></div><Link to="/job-match">{contentText("jobMatchCta")}<FiArrowRight aria-hidden /></Link></div></Reveal>}
  </section>;
}

import { useState } from "react";
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
} from "react-icons/fi";
import { useProfile, useSiteSection, useSubmitMessage } from "../lib/hooks";
import { Reveal } from "../components/Reveal";
import { SectionHeading } from "../components/SectionHeading";
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
  const submit = useSubmitMessage();
  const [form, setForm] = useState<FormState>(initialForm);
  const [touched, setTouched] = useState<Partial<Record<keyof FormState, boolean>>>({});
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState("");
  const [sentEmail, setSentEmail] = useState("");

  const contentText = (key: string) => typeof section?.content[key] === "string" ? section.content[key] as string : "";
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
    setSubmitError("");
    const nextErrors = validate(form);
    setErrors(nextErrors);
    setTouched({ name: true, email: true, subject: true, message: true });
    if (Object.keys(nextErrors).length > 0) return;

    submit.mutate(form, {
      onSuccess: () => {
        setSentEmail(form.email.trim());
        setForm(initialForm);
        setTouched({});
        window.setTimeout(() => submit.reset(), 8000);
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

  return (
    <section id="contact" className="section relative overflow-hidden bg-bg-soft">
      <div className="container-x space-y-12">
        <SectionHeading
          eyebrow={section?.eyebrow ?? ""}
          title={section?.heading ?? ""}
          description={section?.description ?? ""}
          align="center"
        />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
          <Reveal className="lg:col-span-2" variant="clip">
            <div className="flex h-full flex-col gap-3">
              <div className="rounded-xl border border-line bg-surface p-4 shadow-card">
                <h3 className="tech-label">Why reach out</h3>
                <ul className="mt-3 space-y-2.5 text-sm text-muted">
                  {availabilityOptions.map((option) => <li key={option} className="flex items-center gap-2.5">
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent" aria-hidden />
                    {option}
                  </li>)}
                </ul>
                <div className="mt-4 grid grid-cols-1 gap-3 border-t border-line pt-4 font-mono text-xs text-faint">
                  <span className="flex items-center justify-between gap-2">
                    Response time
                    <span className="font-semibold text-ink">{profile?.responseTime}</span>
                  </span>
                  <span className="flex items-center justify-between gap-2">
                    Location
                    <span className="font-semibold text-ink">{profile?.location}</span>
                  </span>
                  <span className="flex items-center justify-between gap-2">
                    Remote
                    <span className="font-semibold text-ink">{profile?.remoteAvailability}</span>
                  </span>
                </div>
              </div>

              <div className="grid h-full grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1">
              {cards.map((card) => {
                const Icon = card.icon;
                const href = card.href;
                const external = href.startsWith("http");
                return (
                  <a
                    key={card.label}
                    href={href}
                    target={external ? "_blank" : undefined}
                    rel={external ? "noopener noreferrer" : undefined}
                    className={cn(
                      "group flex items-center gap-4 rounded-xl border p-4 transition-all duration-200",
                      card.priority
                        ? "border-line bg-surface shadow-card hover:-translate-y-0.5 hover:border-accent/25 hover:shadow-card-lg"
                        : "border-transparent bg-transparent hover:border-line hover:bg-surface/60",
                    )}
                  >
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-line bg-surface-2 text-muted transition-colors duration-200 group-hover:border-accent/40 group-hover:text-accent">
                      <Icon size={18} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-mono text-[11px] font-bold uppercase tracking-wider text-faint">
                        {card.label}
                      </span>
                      <span className="block truncate text-sm font-semibold text-ink">{card.value}</span>
                    </span>
                    <FiArrowUpRight
                      size={15}
                      className="shrink-0 text-faint transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-accent"
                    />
                  </a>
                );
              })}
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.1} className="lg:col-span-3" variant="scale">
            {submit.isSuccess ? (
              <div className="card flex h-full flex-col items-center justify-center gap-4 p-10 text-center">
                <span className="grid h-14 w-14 place-items-center rounded-full bg-ok/10 text-ok">
                  <FiCheckCircle size={26} />
                </span>
                <h3 className="font-display text-lg font-bold text-ink">
                  {contentText("successHeading")}
                </h3>
                <p className="max-w-sm text-sm leading-relaxed text-muted">
                  {contentText("successMessage").replace("your email", sentEmail || "your email")}
                </p>
                <button
                  type="button"
                  onClick={() => submit.reset()}
                  className="btn-outline mt-2"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate className="card h-full p-6 sm:p-8">
                <div className="absolute -left-[10000px]" aria-hidden="true"><label htmlFor="contact-website">Website</label><input id="contact-website" name="website" tabIndex={-1} autoComplete="off" value={form.website} onChange={(e) => setField("website", e.target.value)} /></div>
                <h3 className="font-display text-lg font-bold text-ink">
                  {contentText("formHeading")}
                </h3>
                <p className="mt-1 text-sm text-muted">
                  {contentText("formDescription")}
                </p>

                <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="contact-name" className="field-label">
                      Name
                    </label>
                    <input
                      id="contact-name"
                      className={cn("input", nameField.hasError && "input-error")}
                      placeholder="Your name"
                      value={form.name}
                      onChange={(e) => setField("name", e.target.value)}
                      onBlur={() => markTouched("name")}
                      aria-invalid={nameField.ariaInvalid}
                      aria-describedby={nameField.describedBy}
                      required
                    />
                    {nameField.hasError && (
                      <p id={nameField.errorId} className="mt-1.5 text-xs font-medium text-danger">
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
                      <p id={emailField.errorId} className="mt-1.5 text-xs font-medium text-danger">
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
                    <p id={subjectField.errorId} className="mt-1.5 text-xs font-medium text-danger">
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
                    <p id={messageField.errorId} className="mt-1.5 text-xs font-medium text-danger">
                      {errors.message}
                    </p>
                  )}
                </div>

                {submitError && (
                  <p
                    role="alert"
                    className="mt-4 flex items-center gap-2 rounded-lg border border-danger/30 bg-danger/10 px-4 py-3 text-sm font-semibold text-danger"
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

        <Reveal delay={0.12}>
          <div className="flex flex-col items-start justify-between gap-5 rounded-2xl border border-line bg-surface-2 p-6 sm:flex-row sm:items-center sm:p-7">
            <div className="flex items-start gap-4">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-accent/10 text-accent">
                <FiZap size={20} />
              </span>
              <div>
                <h3 className="font-display text-lg font-bold text-ink">
                  {contentText("jobMatchHeading")}
                </h3>
                <p className="mt-1 max-w-md text-sm leading-relaxed text-muted">
                  {contentText("jobMatchText")}
                </p>
              </div>
            </div>
            <Link to="/job-match" className="btn-outline btn-sm group shrink-0">
              {contentText("jobMatchCta")}
              <FiArrowRight
                size={14}
                className="transition-transform duration-200 group-hover:translate-x-0.5"
              />
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

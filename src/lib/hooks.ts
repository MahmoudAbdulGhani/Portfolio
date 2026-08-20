import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  AnalyticsSummary,
  AuthUser,
  Certification,
  Education,
  Message,
  Profile,
  Project,
  Skill,
  Technology,
  SiteSection,
} from "../types";
import { api } from "./api";

const getProfile = () => api<Profile>("/profile");
const getProjects = () => api<Project[]>("/projects");
const getTechnologies = () => api<Technology[]>("/technologies");
const getSkills = () => api<Skill[]>("/skills");
const getEducation = () => api<Education[]>("/education");
const getCertifications = () => api<Certification[]>("/certifications");

/* ------------------------------------------------------------------ */
/*  Public queries (database/API authoritative; no silent fixtures)    */
/* ------------------------------------------------------------------ */

export function useProfile() {
  return useQuery({
    queryKey: ["profile"],
    queryFn: getProfile,
  });
}

export function useProjects() {
  return useQuery({
    queryKey: ["projects"],
    queryFn: getProjects,
    staleTime: 10 * 60_000,
  });
}

export function useProject(slug: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ["project", slug],
    enabled: options?.enabled,
    queryFn: () => api<Project>(`/projects/${slug}`),
  });
}

export function useTechnologies() {
  return useQuery({
    queryKey: ["technologies"],
    queryFn: getTechnologies,
  });
}

export function useSkills() {
  return useQuery({
    queryKey: ["skills"],
    queryFn: getSkills,
  });
}

export function useEducation() {
  return useQuery({
    queryKey: ["education"],
    queryFn: getEducation,
  });
}

export function useCertifications() {
  return useQuery({
    queryKey: ["certifications"],
    queryFn: getCertifications,
  });
}

export function useSiteContent() {
  return useQuery({ queryKey: ["site-content"], queryFn: () => api<SiteSection[]>("/site-content") });
}

export function useSiteSection(key: string) {
  const query = useSiteContent();
  return { ...query, data: query.data?.find((section) => section.key === key) };
}

export function useAdminSiteContent() {
  return useQuery({ queryKey: ["site-content", "admin"], queryFn: () => api<SiteSection[]>("/admin/site-content") });
}

export function useUpdateSiteContent() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (sections: SiteSection[]) => api<SiteSection[]>("/admin/site-content", { method: "PUT", body: JSON.stringify(sections.map((section) => ({ key: section.key, eyebrow: section.eyebrow, heading: section.heading, description: section.description, ctaLabel: section.ctaLabel, ctaUrl: section.ctaUrl, visible: section.visible, order: section.order, content: section.content }))) }), onSuccess: (sections) => {
    qc.setQueryData(["site-content", "admin"], sections);
    void qc.invalidateQueries({ queryKey: ["site-content"] });
  } });
}

/* ------------------------------------------------------------------ */
/*  Admin queries (authenticated by an HttpOnly cookie)               */
/* ------------------------------------------------------------------ */

export function useAuth() {
  return useQuery({
    queryKey: ["auth"],
    queryFn: () => api<AuthUser>("/admin/me"),
    retry: false,
  });
}

export function useSessionStatus() {
  return useQuery({
    queryKey: ["auth", "session"],
    queryFn: () => api<{ admin: AuthUser | null }>("/admin/auth/session"),
    retry: false,
  });
}

export function useMessages(enabled = true) {
  return useQuery({ queryKey: ["messages"], queryFn: () => api<Message[]>("/admin/messages"), enabled });
}

export function useAnalytics() {
  return useQuery({
    queryKey: ["analytics"],
    queryFn: () => api<AnalyticsSummary>("/admin/analytics"),
  });
}

export function useAdminTechnologies() {
  return useQuery({
    queryKey: ["technologies", "admin"],
    queryFn: () => api<Technology[]>("/admin/technologies"),
  });
}

export function useAdminProjects() {
  return useQuery({
    queryKey: ["projects", "admin"],
    queryFn: () => api<Project[]>("/admin/projects"),
  });
}

export function useAdminProfile() {
  return useQuery({
    queryKey: ["profile", "admin"],
    queryFn: () => api<Profile>("/admin/profile"),
  });
}

export function useAdminProject(slug: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ["project", "admin", slug],
    enabled: options?.enabled,
    queryFn: () => api<Project>(`/admin/projects/${slug}`),
  });
}

export function useAdminSkills() {
  return useQuery({
    queryKey: ["skills", "admin"],
    queryFn: () => api<Skill[]>("/admin/skills"),
  });
}

export function useAdminEducation() {
  return useQuery({
    queryKey: ["education", "admin"],
    queryFn: () => api<Education[]>("/admin/education"),
  });
}

export function useAdminCertifications() {
  return useQuery({
    queryKey: ["certifications", "admin"],
    queryFn: () => api<Certification[]>("/admin/certifications"),
  });
}

/* ------------------------------------------------------------------ */
/*  Auth mutations                                                     */
/* ------------------------------------------------------------------ */

export function useLogin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { email: string; password: string }) =>
      api<{ admin: AuthUser }>("/admin/auth/login", {
        method: "POST",
        body: JSON.stringify(input),
      }),
    onSuccess: ({ admin }) => {
      qc.setQueryData(["auth"], admin);
      qc.setQueryData(["auth", "session"], { admin });
    },
  });
}

export function useLogout() {
  return useMutation({
    mutationFn: () => api<void>("/admin/auth/logout", { method: "POST" }),
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (input: { currentPassword: string; newPassword: string }) =>
      api<{ message: string }>("/admin/auth/change-password", {
        method: "POST",
        body: JSON.stringify(input),
      }),
  });
}

/* ------------------------------------------------------------------ */
/*  Public mutations                                                   */
/* ------------------------------------------------------------------ */

export function useSubmitMessage() {
  return useMutation({
    mutationFn: (input: {
      name: string;
      email: string;
      subject: string;
      message: string;
      website: string;
    }) =>
      api<Message>("/messages", {
        method: "POST",
        body: JSON.stringify(input),
      }),
  });
}

/* ------------------------------------------------------------------ */
/*  Projects                                                           */
/* ------------------------------------------------------------------ */

export function useUpdateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<Project> }) =>
      api<Project>(`/admin/projects/${id}`, {
        method: "PATCH",
        body: JSON.stringify(patch),
      }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["projects"] });
      void qc.invalidateQueries({ queryKey: ["project"] });
      void qc.invalidateQueries({ queryKey: ["analytics"] });
    },
  });
}

export function useCreateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (
      input: Omit<Project, "id" | "createdAt" | "updatedAt" | "views">,
    ) =>
      api<Project>("/admin/projects", {
        method: "POST",
        body: JSON.stringify(input),
      }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["projects"] });
      void qc.invalidateQueries({ queryKey: ["project"] });
      void qc.invalidateQueries({ queryKey: ["analytics"] });
    },
  });
}

export function useDeleteProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      api<void>(`/admin/projects/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["projects"] });
      void qc.invalidateQueries({ queryKey: ["project"] });
      void qc.invalidateQueries({ queryKey: ["analytics"] });
    },
  });
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (patch: Partial<Profile>) =>
      api<Profile>("/admin/profile", {
        method: "PATCH",
        body: JSON.stringify(patch),
      }),
    onSuccess: (profile) => {
      qc.setQueryData(["profile", "admin"], profile);
      qc.setQueryData(["profile"], profile);
      void qc.invalidateQueries({ queryKey: ["profile"] });
    },
  });
}

/* ------------------------------------------------------------------ */
/*  Generic CRUD factories (technologies, skills, education, certs)    */
/* ------------------------------------------------------------------ */

type CrudInput = Record<string, unknown>;

function makeCrudMutations<T>(base: string) {
  const listKey = [base];
  const useCreate = () => {
    const qc = useQueryClient();
    return useMutation({
      mutationFn: (input: CrudInput) =>
        api<T>(`/admin/${base}`, {
          method: "POST",
          body: JSON.stringify(input),
        }),
      onSuccess: () => void qc.invalidateQueries({ queryKey: listKey }),
    });
  };
  const useUpdate = () => {
    const qc = useQueryClient();
    return useMutation({
      mutationFn: ({ id, input }: { id: string; input: CrudInput }) =>
        api<T>(`/admin/${base}/${id}`, {
          method: "PATCH",
          body: JSON.stringify(input),
        }),
      onSuccess: () => void qc.invalidateQueries({ queryKey: listKey }),
    });
  };
  const useRemove = () => {
    const qc = useQueryClient();
    return useMutation({
      mutationFn: (id: string) =>
        api<void>(`/admin/${base}/${id}`, { method: "DELETE" }),
      onSuccess: () => void qc.invalidateQueries({ queryKey: listKey }),
    });
  };
  return { useCreate, useUpdate, useRemove };
}

const techCrud = makeCrudMutations<Technology>("technologies");
export const useCreateTechnology = techCrud.useCreate;
export const useUpdateTechnology = techCrud.useUpdate;
export const useDeleteTechnology = techCrud.useRemove;

const skillCrud = makeCrudMutations<Skill>("skills");
export const useCreateSkill = skillCrud.useCreate;
export const useUpdateSkill = skillCrud.useUpdate;
export const useDeleteSkill = skillCrud.useRemove;

const educationCrud = makeCrudMutations<Education>("education");
export const useCreateEducation = educationCrud.useCreate;
export const useUpdateEducation = educationCrud.useUpdate;
export const useDeleteEducation = educationCrud.useRemove;

const certificationCrud = makeCrudMutations<Certification>("certifications");
export const useCreateCertification = certificationCrud.useCreate;
export const useUpdateCertification = certificationCrud.useUpdate;
export const useDeleteCertification = certificationCrud.useRemove;

/* ------------------------------------------------------------------ */
/*  Messages                                                           */
/* ------------------------------------------------------------------ */

export function useMarkMessageRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      api<Message>(`/admin/messages/${id}/read`, { method: "PATCH" }),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ["messages"] });
      const previous = qc.getQueryData<Message[]>(["messages"]);
      if (previous) {
        qc.setQueryData<Message[]>(
          ["messages"],
          previous.map((message) =>
            message.id === id ? { ...message, read: true } : message,
          ),
        );
      }
      return { previous };
    },
    onError: (_error, _id, context) => {
      if (context?.previous) {
        qc.setQueryData<Message[]>(["messages"], context.previous);
      }
    },
    onSettled: () => {
      void qc.invalidateQueries({ queryKey: ["messages"] });
      void qc.invalidateQueries({ queryKey: ["analytics"] });
    },
  });
}

export function useDeleteMessage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      api<void>(`/admin/messages/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["messages"] });
      void qc.invalidateQueries({ queryKey: ["analytics"] });
    },
  });
}

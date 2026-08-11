import { useState } from "react";
import type { FormEvent, ReactNode } from "react";
import {
  FiEdit2,
  FiLoader,
  FiPlus,
  FiRefreshCw,
  FiTrash2,
  FiX,
} from "react-icons/fi";
import { ConfirmDialog } from "../ConfirmDialog";
import { AnimatePresence, motion } from "framer-motion";

export interface CrudField {
  key: string;
  label: string;
  placeholder?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
}

export interface CrudColumn<T> {
  key: string;
  label: string;
  render?: (row: T) => ReactNode;
  className?: string;
}

interface CrudListProps<T extends { id: string }> {
  title: string;
  subtitle: string;
  columns: CrudColumn<T>[];
  fields: CrudField[];
  items?: T[];
  isLoading?: boolean;
  queryError?: unknown;
  onRetry?: () => void;
  isRetrying?: boolean;
  emptyText?: string;
  onCreate: (input: Record<string, unknown>) => Promise<unknown>;
  onUpdate: (id: string, input: Record<string, unknown>) => Promise<unknown>;
  onDelete: (id: string) => Promise<unknown>;
}

function toValues<T>(row: T): Record<string, string> {
  const record = row as Record<string, unknown>;
  return Object.fromEntries(
    Object.entries(record).map(([k, v]) => [
      k,
      v === null || v === undefined ? "" : String(v),
    ]),
  );
}

function CrudTableSkeleton({ labels }: { labels: string[] }) {
  const widths = ["w-32", "w-24", "w-20", "w-28", "w-16"];

  return (
    <div className="overflow-x-auto" tabIndex={0} aria-label="Loading data table">
      <table className="w-full min-w-[640px] text-left text-sm" aria-hidden="true">
        <thead>
          <tr className="border-b border-line bg-surface-2 font-mono text-[11px] uppercase tracking-wider text-muted">
            {labels.map((label) => (
              <th key={label} className="px-5 py-3.5 font-semibold">
                {label}
              </th>
            ))}
            <th className="px-5 py-3.5 text-right font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 4 }).map((_, rowIndex) => (
            <tr key={rowIndex} className="border-b border-line last:border-0">
              {Array.from({ length: labels.length + 1 }).map((_, columnIndex) => (
                <td key={columnIndex} className="px-5 py-4">
                  <div
                    className={`h-4 animate-pulse rounded-md bg-surface-3 ${
                      widths[(rowIndex + columnIndex) % widths.length]
                    } ${columnIndex === labels.length ? "ml-auto" : ""}`}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function CrudList<T extends { id: string }>({
  title,
  subtitle,
  columns,
  fields,
  items,
  isLoading,
  queryError,
  onRetry,
  isRetrying,
  emptyText = "No entries yet.",
  onCreate,
  onUpdate,
  onDelete,
}: CrudListProps<T>) {
  const [editing, setEditing] = useState<T | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [values, setValues] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<T | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const sorted = [...(items ?? [])].sort((a, b) => {
    const ao = (a as { order?: number }).order ?? 0;
    const bo = (b as { order?: number }).order ?? 0;
    return ao - bo;
  });
  const showLoadingSkeleton = isLoading && items === undefined;
  const showInitialQueryError =
    !showLoadingSkeleton && items === undefined && Boolean(queryError);
  const queryErrorMessage =
    queryError instanceof Error && queryError.message
      ? queryError.message
      : "Please check your connection and try again.";

  const openCreate = () => {
    setEditing(null);
    setValues({});
    setShowForm(true);
    setError("");
  };

  const openEdit = (row: T) => {
    setEditing(row);
    setValues(toValues(row));
    setShowForm(true);
    setError("");
  };

  const closeForm = () => {
    setShowForm(false);
    setEditing(null);
    setError("");
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    for (const field of fields) {
      if (field.required && !(values[field.key] ?? "").trim()) {
        setError(`${field.label} is required.`);
        return;
      }
    }

    const payload: Record<string, unknown> = {};
    for (const field of fields) payload[field.key] = values[field.key] ?? "";

    setSaving(true);
    try {
      if (editing) await onUpdate(editing.id, payload);
      else await onCreate(payload);
      closeForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save.");
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    setDeletingId(pendingDelete.id);
    try {
      await onDelete(pendingDelete.id);
      setPendingDelete(null);
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "Failed to delete.");
    } finally {
      setDeletingId(null);
    }
  };

  const getLabel = (row: T): string =>
    String(
      (row as Record<string, unknown>).name ??
        (row as Record<string, unknown>).title ??
        (row as Record<string, unknown>).school ??
        "this entry",
    );

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="admin-heading">{title}</h1>
          <p className="mt-1.5 text-sm text-muted">{subtitle}</p>
        </div>
        {!showForm && (
          <button
            type="button"
            onClick={openCreate}
            className="btn-primary btn-sm self-start"
          >
            <FiPlus size={15} />
            Add
          </button>
        )}
      </div>

      <AnimatePresence initial={false}>
      {showForm && (
        <motion.form
          initial={{ opacity: 0, height: 0, y: -8 }}
          animate={{ opacity: 1, height: "auto", y: 0 }}
          exit={{ opacity: 0, height: 0, y: -8 }}
          transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
          onSubmit={handleSubmit}
          className="card space-y-4 overflow-hidden p-6"
        >
          <div className="flex items-center justify-between">
            <h2 className="font-display text-base font-bold text-ink">
              {editing ? "Edit entry" : "New entry"}
            </h2>
            <button
              type="button"
              onClick={closeForm}
              className="btn-icon-sm border border-line text-muted transition-colors hover:border-danger/50 hover:text-danger"
              aria-label="Cancel"
            >
              <FiX size={15} />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {fields.map((field) => (
              <div key={field.key}>
                <label htmlFor={`crud-${field.key}`} className="field-label">
                  {field.label}
                  {field.required && " *"}
                </label>
                {field.options ? (
                  <select
                    id={`crud-${field.key}`}
                    className="select"
                    value={values[field.key] ?? ""}
                    onChange={(e) =>
                      setValues((v) => ({ ...v, [field.key]: e.target.value }))
                    }
                  >
                    <option value="">Select…</option>
                    {field.options.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    id={`crud-${field.key}`}
                    type={field.key === "order" ? "number" : "text"}
                    className="input"
                    value={values[field.key] ?? ""}
                    onChange={(e) =>
                      setValues((v) => ({ ...v, [field.key]: e.target.value }))
                    }
                    placeholder={field.placeholder}
                    required={field.required}
                  />
                )}
              </div>
            ))}
          </div>

          {error && (
            <p
              role="alert"
              className="rounded-lg border border-danger/30 bg-danger/10 px-4 py-3 text-sm font-semibold text-danger"
            >
              {error}
            </p>
          )}

          <div className="flex items-center gap-3">
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? (
                <FiLoader size={15} className="animate-spin" />
              ) : (
                <FiPlus size={15} />
              )}
              {saving ? "Saving…" : editing ? "Save changes" : "Add entry"}
            </button>
            <button type="button" onClick={closeForm} className="btn-ghost">
              Cancel
            </button>
          </div>
        </motion.form>
      )}
      </AnimatePresence>

      <div className="card overflow-hidden">
        {showLoadingSkeleton ? (
          <>
            <div className="sr-only" role="status">
            Loading…
            </div>
            <CrudTableSkeleton labels={columns.map((column) => column.label)} />
          </>
        ) : showInitialQueryError ? (
          <div
            role="alert"
            className="m-5 flex flex-col gap-3 rounded-xl border border-danger/30 bg-danger/10 p-4 text-sm text-danger sm:flex-row sm:items-center sm:justify-between"
          >
            <p>
              <span className="font-semibold">Unable to load {title.toLowerCase()}.</span>{" "}
              {queryErrorMessage}
            </p>
            {onRetry && (
              <button
                type="button"
                onClick={onRetry}
                disabled={isRetrying}
                aria-label={isRetrying ? "Retrying..." : "Retry"}
                className="btn-outline btn-sm shrink-0 border-danger/40 text-danger hover:border-danger hover:bg-danger/10"
              >
                {isRetrying ? (
                  <FiLoader size={14} className="animate-spin" />
                ) : (
                  <FiRefreshCw size={14} />
                )}
                {isRetrying ? "Retrying..." : "Retry"}
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto" tabIndex={0} aria-label="Scrollable data table">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-line bg-surface-2 font-mono text-[11px] uppercase tracking-wider text-muted">
                  {columns.map((col) => (
                    <th key={col.key} className="px-5 py-3.5 font-semibold">
                      {col.label}
                    </th>
                  ))}
                  <th className="px-5 py-3.5 text-right font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>
              <motion.tbody layout>
                {sorted.map((row) => {
                  const deleting = deletingId === row.id;
                  return (
                    <motion.tr
                      layout="position"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      key={row.id}
                      className="border-b border-line last:border-0 hover:bg-surface-2/60"
                    >
                      {columns.map((col) => (
                        <td
                          key={col.key}
                          className={`px-5 py-4 ${col.className ?? ""}`}
                        >
                          {col.render
                            ? col.render(row)
                            : String((row as Record<string, unknown>)[col.key] ?? "—")}
                        </td>
                      ))}
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => openEdit(row)}
                            className="btn-icon-sm admin-row-action"
                            aria-label="Edit"
                          >
                            <FiEdit2 size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setPendingDelete(row)}
                            disabled={deleting}
                            className="btn-icon-sm admin-row-action-danger disabled:opacity-50"
                            aria-label="Delete"
                          >
                            {deleting ? (
                              <FiLoader size={14} className="animate-spin" />
                            ) : (
                              <FiTrash2 size={14} />
                            )}
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
                {sorted.length === 0 && (
                  <tr>
                    <td colSpan={columns.length + 1} className="px-5 py-16 text-center">
                      <p className="text-sm font-semibold text-ink">{emptyText}</p>
                    </td>
                  </tr>
                )}
              </motion.tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title={`Delete "${pendingDelete ? getLabel(pendingDelete) : ""}"?`}
        description="This entry will be removed from the public site. This cannot be undone."
        confirmLabel="Delete"
        onCancel={() => setPendingDelete(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}

import { useState } from "react";
import {
  FiCheck,
  FiChevronDown,
  FiLoader,
  FiMail,
  FiTrash2,
} from "react-icons/fi";
import {
  useDeleteMessage,
  useMarkMessageRead,
  useMessages,
} from "../../lib/hooks";
import { cn, formatDate } from "../../lib/format";
import { ConfirmDialog } from "../../components/ConfirmDialog";
import type { Message } from "../../types";

export function Messages() {
  const { data: messages, isLoading } = useMessages();
  const markRead = useMarkMessageRead();
  const del = useDeleteMessage();
  const [openId, setOpenId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Message | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);
  const [bulkAction, setBulkAction] = useState<"read" | "delete" | null>(null);

  const sorted = [...(messages ?? [])].sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
  const unread = sorted.filter((m) => !m.read).length;
  const allSelected = sorted.length > 0 && selected.size === sorted.length;
  const selectedUnread = sorted.filter((m) => selected.has(m.id) && !m.read);

  const toggleSelected = (id: string) => {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const markSelectedRead = async () => {
    if (selectedUnread.length === 0) return;
    setBulkAction("read");
    try {
      await Promise.all(selectedUnread.map((message) => markRead.mutateAsync(message.id)));
      setSelected(new Set());
    } finally {
      setBulkAction(null);
    }
  };

  const deleteSelected = async () => {
    const ids = [...selected];
    if (ids.length === 0) return;
    setBulkAction("delete");
    try {
      await Promise.all(ids.map((id) => del.mutateAsync(id)));
      setSelected(new Set());
      setConfirmBulkDelete(false);
    } finally {
      setBulkAction(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="admin-heading">Messages</h1>
        <p className="mt-1.5 text-sm text-muted">
          Messages sent through the contact form.
        </p>
        {unread > 0 && (
          <p className="mt-2 inline-flex items-center gap-2 rounded-full border border-accent/25 bg-accent/10 px-3 py-1 text-xs font-semibold text-accent">
            {unread} unread
          </p>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="card animate-pulse p-5">
              <div className="flex items-center gap-3">
                <div className="h-2.5 w-2.5 rounded-full bg-surface-3" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-40 rounded-full bg-surface-3" />
                  <div className="h-3 w-56 rounded-full bg-surface-3" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : sorted.length === 0 ? (
        <div className="card flex flex-col items-center gap-3 p-14 text-center">
          <span className="grid h-12 w-12 place-items-center rounded-full bg-surface-2 text-faint">
            <FiMail size={20} />
          </span>
          <p className="text-sm font-semibold text-ink">No messages yet</p>
          <p className="max-w-xs text-sm text-muted">
            Messages submitted through the contact form will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="sticky top-20 z-20 flex flex-col gap-3 rounded-xl border border-line bg-surface/95 p-3 shadow-sm backdrop-blur sm:flex-row sm:items-center sm:justify-between">
            <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-ink">
              <input
                type="checkbox"
                checked={allSelected}
                ref={(input) => { if (input) input.indeterminate = selected.size > 0 && !allSelected; }}
                onChange={() => setSelected(allSelected ? new Set() : new Set(sorted.map((message) => message.id)))}
                className="h-4 w-4 accent-[var(--color-accent)]"
              />
              {selected.size > 0 ? `${selected.size} selected` : "Select all messages"}
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => void markSelectedRead()}
                disabled={selectedUnread.length === 0 || bulkAction !== null}
                className="btn-outline btn-sm flex-1 sm:flex-none"
              >
                {bulkAction === "read" ? <FiLoader className="animate-spin" /> : <FiCheck />}
                Mark as read
              </button>
              <button
                type="button"
                onClick={() => setConfirmBulkDelete(true)}
                disabled={selected.size === 0 || bulkAction !== null}
                className="btn-ghost-danger btn-sm flex-1 sm:flex-none"
              >
                {bulkAction === "delete" ? <FiLoader className="animate-spin" /> : <FiTrash2 />}
                Delete
              </button>
            </div>
          </div>
          {sorted.map((msg) => {
            const open = openId === msg.id;
            const readPending = markRead.isPending && markRead.variables === msg.id;
            const deletePending = del.isPending && del.variables === msg.id;
            return (
              <div
                key={msg.id}
                className={cn(
                  "card overflow-hidden transition-colors",
                  !msg.read && "border-accent/30",
                )}
              >
                <div className="flex items-stretch">
                  <label className="grid shrink-0 cursor-pointer place-items-center py-5 pl-5" aria-label={`Select message from ${msg.name}`}>
                    <input
                      type="checkbox"
                      checked={selected.has(msg.id)}
                      onChange={() => toggleSelected(msg.id)}
                      className="h-4 w-4 accent-[var(--color-accent)]"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => setOpenId(open ? null : msg.id)}
                    aria-expanded={open}
                    className="flex min-w-0 flex-1 items-center justify-between gap-4 p-5 text-left"
                  >
                  <div className="flex min-w-0 items-center gap-3">
                    {!msg.read ? (
                      <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-accent" />
                    ) : (
                      <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-surface-2 text-faint">
                        <FiMail size={11} />
                      </span>
                    )}
                    <span className="min-w-0">
                      <span className="flex flex-wrap items-baseline gap-x-2">
                        <span className="font-semibold text-ink">{msg.name}</span>
                        <span className="truncate font-mono text-xs text-muted">
                          {msg.subject}
                        </span>
                      </span>
                      <span className="block truncate text-xs text-faint">
                        {msg.email}
                      </span>
                    </span>
                  </div>
                  <span className="flex shrink-0 items-center gap-3">
                    <span className="hidden font-mono text-[11px] text-faint sm:inline">
                      {formatDate(msg.createdAt)}
                    </span>
                    <FiChevronDown
                      size={16}
                      className={cn(
                        "text-faint transition-transform duration-200",
                        open && "rotate-180",
                      )}
                    />
                  </span>
                  </button>
                </div>

                {open && (
                  <div className="border-t border-line px-5 py-4">
                    <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-muted [overflow-wrap:anywhere]">
                      {msg.message}
                    </p>
                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      {!msg.read && (
                        <button
                          type="button"
                          onClick={() => markRead.mutate(msg.id)}
                          disabled={readPending}
                          className="btn-outline btn-sm"
                        >
                          {readPending ? (
                            <FiLoader size={14} className="animate-spin" />
                          ) : (
                            <FiCheck size={14} />
                          )}
                          Mark as read
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          if (selected.size > 0) setConfirmBulkDelete(true);
                          else setPendingDelete(msg);
                        }}
                        disabled={deletePending}
                        className="btn-ghost-danger btn-sm"
                      >
                        {deletePending ? (
                          <FiLoader size={14} className="animate-spin" />
                        ) : (
                          <FiTrash2 size={14} />
                        )}
                        {selected.size > 0 ? `Delete selected (${selected.size})` : "Delete"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title={`Delete message from ${pendingDelete?.name ?? ""}?`}
        description="This permanently removes the message. This cannot be undone."
        confirmLabel="Delete message"
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => {
          if (pendingDelete) {
            del.mutate(pendingDelete.id, { onSettled: () => {
              setSelected((current) => {
                const next = new Set(current);
                next.delete(pendingDelete.id);
                return next;
              });
              setPendingDelete(null);
            } });
          }
        }}
      />
      <ConfirmDialog
        open={confirmBulkDelete}
        title={`Delete ${selected.size} selected message${selected.size === 1 ? "" : "s"}?`}
        description="The selected messages will be permanently removed. This cannot be undone."
        confirmLabel={bulkAction === "delete" ? "Deleting..." : "Delete messages"}
        onCancel={() => setConfirmBulkDelete(false)}
        onConfirm={() => void deleteSelected()}
      />
    </div>
  );
}

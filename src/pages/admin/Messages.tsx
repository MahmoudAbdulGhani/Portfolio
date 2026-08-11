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

  const sorted = [...(messages ?? [])].sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
  const unread = sorted.filter((m) => !m.read).length;

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
                <button
                  type="button"
                  onClick={() => setOpenId(open ? null : msg.id)}
                  aria-expanded={open}
                  className="flex w-full items-center justify-between gap-4 p-5 text-left"
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
                        onClick={() => setPendingDelete(msg)}
                        disabled={deletePending}
                        className="btn-ghost-danger btn-sm"
                      >
                        {deletePending ? (
                          <FiLoader size={14} className="animate-spin" />
                        ) : (
                          <FiTrash2 size={14} />
                        )}
                        Delete
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
            del.mutate(pendingDelete.id, { onSettled: () => setPendingDelete(null) });
          }
        }}
      />
    </div>
  );
}

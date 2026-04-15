'use client';

/**
 * LinuxMachine — EmailApp
 *
 * VFS-backed email client. Inbox messages are stored as JSON files at
 * /var/mail/inbox/{id}.json and sent messages at /var/mail/sent/{id}.json.
 *
 * Boot sequence
 * ─────────────
 * On first mount the app checks the VFS for existing inbox messages. If the
 * inbox is empty and a state endpoint is configured, it fetches
 * {stateEndpoint}/mail/inbox.json — an array of MailMessage objects — and
 * seeds each message into the VFS, marking them origin:'local' (they will
 * persist across refreshes via sessionStorage). Subsequent mounts read
 * entirely from VFS.
 *
 * VFS message schema
 * ──────────────────
 * Path:  /var/mail/inbox/{id}.json   or   /var/mail/sent/{id}.json
 * Content:  JSON.stringify(MailMessage)
 *
 * Compose
 * ───────
 * Composed messages are written to /var/mail/sent/{timestamp}.json and
 * optionally added to the inbox to simulate a reply if the recipient
 * appears in the inbox. The send is fictional — no real email is sent.
 *
 * AODA
 * ────
 * • Message list: role="list", each item role="listitem"
 * • Unread messages have aria-label including "(unread)" indicator
 * • Active message: role="article", aria-labelledby the subject heading
 * • Compose form: all fields have associated <label>
 * • Navigation toolbar: aria-label on all icon buttons
 * • sr-only live region announces new messages seeded on first boot
 */

import {
  useState,
  useEffect,
  useRef,
  useCallback,
  type FormEvent,
} from 'react';

import { useKernel, useMachineState, useStateEndpoint } from '../../LinuxMachine/MachineContext';
import { loadAppResource } from '../../LinuxMachine/stateLoader';
import type { EmailAppState } from '../../LinuxMachine/MachineTypes';

// ─── Message types ────────────────────────────────────────────────────────────

export interface MailMessage {
  id:      string;
  from:    string;
  to:      string;
  subject: string;
  date:    string;   // ISO 8601
  body:    string;
  read?:   boolean;
}

// ─── VFS helpers ─────────────────────────────────────────────────────────────

const INBOX_DIR = '/var/mail/inbox';
const SENT_DIR  = '/var/mail/sent';

function msgPath(dir: string, id: string): string {
  return `${dir}/${id}.json`;
}

function parseMessage(raw: string): MailMessage | null {
  try {
    const m = JSON.parse(raw) as Partial<MailMessage>;
    if (
      typeof m.id      === 'string' &&
      typeof m.from    === 'string' &&
      typeof m.to      === 'string' &&
      typeof m.subject === 'string' &&
      typeof m.date    === 'string' &&
      typeof m.body    === 'string'
    ) {
      return m as MailMessage;
    }
    return null;
  } catch {
    return null;
  }
}

function formatDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat('en-CA', {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

// ─── EmailApp ─────────────────────────────────────────────────────────────────

export interface EmailAppProps {
  windowId: string;
  appState: EmailAppState;
}

export function EmailApp({ windowId, appState }: EmailAppProps) {
  const kernel        = useKernel();
  const machineState  = useMachineState();
  const stateEndpoint = useStateEndpoint();

  // ── Local view state ────────────────────────────────────────────────────
  const [view, setView] = useState<EmailAppState['view']>(appState.view);
  const [openId, setOpenId] = useState<string | undefined>(appState.openMessageId);

  // ── Screen-reader live announcement ─────────────────────────────────────
  const [srAnnouncement, setSrAnnouncement] = useState('');

  // ── Persist view state to kernel ────────────────────────────────────────
  const syncKernel = useCallback((v: EmailAppState['view'], id?: string): void => {
    kernel.updateWindowAppState(windowId, {
      view: v, openMessageId: id,
    } satisfies EmailAppState);
  }, [kernel, windowId]);

  // ── Derive inbox from VFS ───────────────────────────────────────────────
  function readFolder(dir: string): MailMessage[] {
    const names = kernel.listDir(dir);
    const msgs: MailMessage[] = [];
    for (const name of names) {
      if (!name.endsWith('.json')) continue;
      const raw = kernel.readFile(`${dir}/${name}`);
      if (raw) {
        const m = parseMessage(raw);
        if (m) msgs.push(m);
      }
    }
    return msgs.sort((a, b) => b.date.localeCompare(a.date));
  }

  // ── Seed inbox from state endpoint on first mount ───────────────────────
  const didSeedRef = useRef(false);
  useEffect(() => {
    if (didSeedRef.current) return;
    didSeedRef.current = true;

    const existingNames = kernel.listDir(INBOX_DIR);
    const hasMessages   = existingNames.some(n => n.endsWith('.json'));
    if (hasMessages || !stateEndpoint) return;

    loadAppResource<MailMessage[]>(stateEndpoint, 'mail/inbox.json').then(msgs => {
      if (!msgs || !Array.isArray(msgs)) return;
      let count = 0;
      for (const m of msgs) {
        if (!m.id || !m.from) continue;
        kernel.writeFile(msgPath(INBOX_DIR, m.id), JSON.stringify(m));
        count++;
      }
      if (count > 0) {
        setSrAnnouncement(`${count} message${count > 1 ? 's' : ''} loaded into inbox.`);
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Derive messages from VFS (re-renders on state change via context) ───
  const inboxMsgs = readFolder(INBOX_DIR);
  const sentMsgs  = readFolder(SENT_DIR);

  const unreadCount = inboxMsgs.filter(m => !m.read).length;
  const openMsg     = openId
    ? (inboxMsgs.find(m => m.id === openId) ?? sentMsgs.find(m => m.id === openId))
    : undefined;

  // ── Open a message and mark it read ────────────────────────────────────
  const openMessage = useCallback((msg: MailMessage): void => {
    if (!msg.read) {
      const updated: MailMessage = { ...msg, read: true };
      kernel.writeFile(
        msgPath(msg.id.startsWith('sent-') ? SENT_DIR : INBOX_DIR, msg.id),
        JSON.stringify(updated),
      );
    }
    setView('message');
    setOpenId(msg.id);
    syncKernel('message', msg.id);
  }, [kernel, syncKernel]);

  const goToInbox = useCallback((): void => {
    setView('inbox');
    setOpenId(undefined);
    syncKernel('inbox');
  }, [syncKernel]);

  const goToSent = useCallback((): void => {
    setView('sent');
    setOpenId(undefined);
    syncKernel('sent');
  }, [syncKernel]);

  const goToCompose = useCallback((): void => {
    setView('compose');
    setOpenId(undefined);
    syncKernel('compose');
  }, [syncKernel]);

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div
      className="flex h-full font-sans text-sm"
      style={{ background: '#0d1117', color: '#c9d1d9' }}
    >
      {/* ── Sidebar ─────────────────────────────────────────────────────── */}
      <aside
        className="shrink-0 flex flex-col py-3 px-2 gap-1"
        style={{ width: '9rem', background: '#010409', borderRight: '1px solid #21262d' }}
        aria-label="Mailbox navigation"
      >
        <span
          className="px-2 pb-1 text-xs font-semibold uppercase tracking-widest"
          style={{ color: '#484f58' }}
          aria-hidden="true"
        >
          {machineState.user}
        </span>

        <SidebarItem
          label={`Inbox${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
          icon="✉"
          active={view === 'inbox' || view === 'message'}
          onClick={goToInbox}
        />
        <SidebarItem
          label="Sent"
          icon="↑"
          active={view === 'sent'}
          onClick={goToSent}
        />
        <div className="mt-2">
          <SidebarItem
            label="Compose"
            icon="＋"
            active={view === 'compose'}
            onClick={goToCompose}
          />
        </div>
      </aside>

      {/* ── Main panel ──────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {view === 'inbox' && (
          <MessageList
            messages={inboxMsgs}
            title="Inbox"
            emptyText="Your inbox is empty."
            onOpen={openMessage}
            onCompose={goToCompose}
          />
        )}
        {view === 'sent' && (
          <MessageList
            messages={sentMsgs}
            title="Sent"
            emptyText="No sent messages."
            onOpen={openMessage}
            onCompose={goToCompose}
          />
        )}
        {view === 'message' && openMsg && (
          <MessageView
            message={openMsg}
            onBack={goToInbox}
            onCompose={goToCompose}
          />
        )}
        {view === 'message' && !openMsg && (
          <EmptyPane text="Message not found." />
        )}
        {view === 'compose' && (
          <ComposeView
            user={machineState.user}
            onSend={(msg) => {
              kernel.writeFile(msgPath(SENT_DIR, msg.id), JSON.stringify(msg));
              setSrAnnouncement('Message sent.');
              goToSent();
            }}
            onDiscard={goToInbox}
          />
        )}
      </div>

      {/* SR-only live region */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {srAnnouncement}
      </div>
    </div>
  );
}

// ─── SidebarItem ─────────────────────────────────────────────────────────────

interface SidebarItemProps {
  label:   string;
  icon:    string;
  active:  boolean;
  onClick: () => void;
}

function SidebarItem({ label, icon, active, onClick }: SidebarItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-2 px-2 py-1.5 rounded text-xs w-full text-left transition-colors"
      style={{
        background: active ? '#161b22' : 'transparent',
        color:      active ? '#c9d1d9' : '#8b949e',
        border:     active ? '1px solid #21262d' : '1px solid transparent',
      }}
      aria-current={active ? 'page' : undefined}
      aria-label={label}
    >
      <span aria-hidden="true" style={{ fontFamily: 'monospace', userSelect: 'none' }}>
        {icon}
      </span>
      <span className="truncate">{label.split('(')[0].trim()}</span>
    </button>
  );
}

// ─── MessageList ──────────────────────────────────────────────────────────────

interface MessageListProps {
  messages:  MailMessage[];
  title:     string;
  emptyText: string;
  onOpen:    (msg: MailMessage) => void;
  onCompose: () => void;
}

function MessageList({ messages, title, emptyText, onOpen, onCompose }: MessageListProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div
        className="shrink-0 flex items-center justify-between px-4 py-2"
        style={{ borderBottom: '1px solid #21262d' }}
      >
        <h2 style={{ color: '#c9d1d9', fontSize: '0.875rem', fontWeight: 600, margin: 0 }}>
          {title}
        </h2>
        <button
          type="button"
          onClick={onCompose}
          className="px-3 py-1 rounded text-xs font-medium"
          style={{ background: '#1f6feb', color: '#ffffff' }}
          aria-label="Compose new message"
        >
          New
        </button>
      </div>

      {/* Message list */}
      {messages.length === 0 ? (
        <EmptyPane text={emptyText} />
      ) : (
        <ul
          className="flex-1 overflow-y-auto"
          role="list"
          aria-label={`${title} messages`}
        >
          {messages.map(msg => (
            <li key={msg.id} role="listitem">
              <button
                type="button"
                onClick={() => onOpen(msg)}
                className="w-full text-left px-4 py-3 transition-colors"
                style={{ borderBottom: '1px solid #161b22', background: 'transparent' }}
                aria-label={`${msg.read ? '' : 'Unread: '}${msg.subject} — from ${msg.from} — ${formatDate(msg.date)}`}
                onMouseEnter={e => (e.currentTarget.style.background = '#161b22')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <div className="flex items-baseline justify-between gap-2">
                  <span
                    className="truncate text-xs font-medium"
                    style={{ color: msg.read ? '#8b949e' : '#c9d1d9' }}
                  >
                    {!msg.read && (
                      <span
                        className="inline-block w-1.5 h-1.5 rounded-full mr-1.5 align-middle"
                        style={{ background: '#58a6ff' }}
                        aria-hidden="true"
                      />
                    )}
                    {msg.from}
                  </span>
                  <span
                    className="shrink-0 text-xs"
                    style={{ color: '#484f58' }}
                  >
                    {formatDate(msg.date)}
                  </span>
                </div>
                <div
                  className="truncate text-xs mt-0.5"
                  style={{ color: msg.read ? '#6e7681' : '#c9d1d9' }}
                >
                  {msg.subject}
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ─── MessageView ──────────────────────────────────────────────────────────────

interface MessageViewProps {
  message:   MailMessage;
  onBack:    () => void;
  onCompose: () => void;
}

const SUBJECT_ID_PREFIX = 'email-subject-';

function MessageView({ message, onBack, onCompose }: MessageViewProps) {
  const subjectId = `${SUBJECT_ID_PREFIX}${message.id}`;
  return (
    <div className="flex flex-col h-full overflow-hidden" role="article" aria-labelledby={subjectId}>
      {/* Toolbar */}
      <div
        className="shrink-0 flex items-center gap-2 px-4 py-2"
        style={{ borderBottom: '1px solid #21262d' }}
      >
        <button
          type="button"
          onClick={onBack}
          className="px-3 py-1 rounded text-xs"
          style={{ background: '#21262d', color: '#8b949e' }}
          aria-label="Back to message list"
        >
          ← Back
        </button>
        <button
          type="button"
          onClick={onCompose}
          className="px-3 py-1 rounded text-xs"
          style={{ background: '#1f6feb', color: '#ffffff' }}
          aria-label="Compose new message"
        >
          New
        </button>
      </div>

      {/* Message header */}
      <div
        className="shrink-0 px-5 py-4"
        style={{ borderBottom: '1px solid #21262d' }}
      >
        <h2
          id={subjectId}
          style={{ color: '#c9d1d9', fontSize: '1rem', fontWeight: 600, margin: '0 0 0.5rem 0' }}
        >
          {message.subject}
        </h2>
        <dl className="text-xs" style={{ color: '#8b949e' }}>
          <div className="flex gap-2">
            <dt style={{ color: '#484f58', minWidth: '2.5rem' }}>From</dt>
            <dd style={{ margin: 0 }}>{message.from}</dd>
          </div>
          <div className="flex gap-2 mt-0.5">
            <dt style={{ color: '#484f58', minWidth: '2.5rem' }}>To</dt>
            <dd style={{ margin: 0 }}>{message.to}</dd>
          </div>
          <div className="flex gap-2 mt-0.5">
            <dt style={{ color: '#484f58', minWidth: '2.5rem' }}>Date</dt>
            <dd style={{ margin: 0 }}>
              <time dateTime={message.date}>{formatDate(message.date)}</time>
            </dd>
          </div>
        </dl>
      </div>

      {/* Message body */}
      <div
        className="flex-1 overflow-y-auto px-5 py-4 text-sm"
        style={{ color: '#c9d1d9', whiteSpace: 'pre-wrap', lineHeight: '1.6' }}
        tabIndex={0}
        aria-label="Message body"
      >
        {message.body}
      </div>
    </div>
  );
}

// ─── ComposeView ──────────────────────────────────────────────────────────────

interface ComposeViewProps {
  user:      string;
  onSend:    (msg: MailMessage) => void;
  onDiscard: () => void;
}

function ComposeView({ user, onSend, onDiscard }: ComposeViewProps) {
  const [to,      setTo]      = useState('');
  const [subject, setSubject] = useState('');
  const [body,    setBody]    = useState('');

  function handleSubmit(e: FormEvent<HTMLFormElement>): void {
    e.preventDefault();
    const msg: MailMessage = {
      id:      `sent-${Date.now()}`,
      from:    `${user}@localhost`,
      to:      to.trim(),
      subject: subject.trim() || '(no subject)',
      date:    new Date().toISOString(),
      body:    body,
      read:    true,
    };
    onSend(msg);
  }

  const inputStyle = {
    background:  '#0d1117',
    color:       '#c9d1d9',
    border:      '1px solid #30363d',
    borderRadius: '0.375rem',
    padding:     '0.375rem 0.75rem',
    fontSize:    '0.875rem',
    width:       '100%',
  } as const;

  return (
    <form
      className="flex flex-col h-full"
      onSubmit={handleSubmit}
      aria-label="Compose new message"
    >
      {/* Toolbar */}
      <div
        className="shrink-0 flex items-center justify-between px-4 py-2"
        style={{ borderBottom: '1px solid #21262d' }}
      >
        <h2 style={{ color: '#c9d1d9', fontSize: '0.875rem', fontWeight: 600, margin: 0 }}>
          New Message
        </h2>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onDiscard}
            className="px-3 py-1 rounded text-xs"
            style={{ background: '#21262d', color: '#8b949e' }}
            aria-label="Discard message"
          >
            Discard
          </button>
          <button
            type="submit"
            className="px-3 py-1 rounded text-xs font-medium"
            style={{ background: '#1f6feb', color: '#ffffff' }}
            aria-label="Send message"
          >
            Send
          </button>
        </div>
      </div>

      {/* Fields */}
      <div
        className="shrink-0 flex flex-col px-5 py-3 gap-3"
        style={{ borderBottom: '1px solid #21262d' }}
      >
        <div className="flex items-center gap-3">
          <label
            htmlFor="compose-from"
            className="text-xs shrink-0"
            style={{ color: '#484f58', width: '3rem' }}
          >
            From
          </label>
          <input
            id="compose-from"
            type="text"
            value={`${user}@localhost`}
            readOnly
            style={{ ...inputStyle, color: '#6e7681' }}
            aria-readonly="true"
          />
        </div>
        <div className="flex items-center gap-3">
          <label
            htmlFor="compose-to"
            className="text-xs shrink-0"
            style={{ color: '#484f58', width: '3rem' }}
          >
            To
          </label>
          <input
            id="compose-to"
            type="text"
            value={to}
            placeholder="recipient@example.com"
            required
            autoFocus
            style={inputStyle}
            onChange={e => setTo(e.target.value)}
            onFocus={e  => { e.currentTarget.style.borderColor = '#58a6ff'; }}
            onBlur={e   => { e.currentTarget.style.borderColor = '#30363d'; }}
          />
        </div>
        <div className="flex items-center gap-3">
          <label
            htmlFor="compose-subject"
            className="text-xs shrink-0"
            style={{ color: '#484f58', width: '3rem' }}
          >
            Subject
          </label>
          <input
            id="compose-subject"
            type="text"
            value={subject}
            placeholder="(no subject)"
            style={inputStyle}
            onChange={e => setSubject(e.target.value)}
            onFocus={e  => { e.currentTarget.style.borderColor = '#58a6ff'; }}
            onBlur={e   => { e.currentTarget.style.borderColor = '#30363d'; }}
          />
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 flex flex-col px-5 py-3">
        <label htmlFor="compose-body" className="sr-only">
          Message body
        </label>
        <textarea
          id="compose-body"
          value={body}
          placeholder="Write your message here…"
          className="flex-1 resize-none text-sm"
          style={{
            background:  'transparent',
            color:       '#c9d1d9',
            border:      'none',
            outline:     'none',
            lineHeight:  '1.6',
          }}
          onChange={e => setBody(e.target.value)}
        />
      </div>
    </form>
  );
}

// ─── EmptyPane ────────────────────────────────────────────────────────────────

function EmptyPane({ text }: { text: string }) {
  return (
    <div
      className="flex-1 flex items-center justify-center"
      style={{ color: '#484f58', fontSize: '0.875rem' }}
      aria-label={text}
    >
      {text}
    </div>
  );
}

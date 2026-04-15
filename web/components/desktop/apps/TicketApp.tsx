'use client';

/**
 * LinuxMachine — TicketApp (AC 1.1, 1.2, 1.3)
 *
 * Virtual ticket management application. Tickets are stored as JSON files at
 * /var/tickets/{id}.json in the desktop VFS.
 *
 * Views
 * ─────
 *   list   — sortable table of all tickets with status/priority badges
 *   new    — form to create a new ticket
 *   detail — full view with inline status/priority editing and description edit
 *
 * URL integration (AC 1.3)
 * ────────────────────────
 *   sandbox://ticket-app            → list view
 *   sandbox://ticket-app/new        → new-ticket form
 *   sandbox://ticket-app/detail/ID  → detail view for ticket ID
 * These are handled by kernel.openWith() (AC 2.3).
 *
 * AODA
 * ────
 * • All form fields have explicit <label> elements.
 * • Status/priority selects use <select> with associated <label>.
 * • Ticket table: role="grid" with scope="col" headers.
 * • sr-only aria-live region announces ticket creation/updates.
 * • Focus moves to the new ticket row after creation.
 * • All interactive elements are keyboard-navigable.
 */

import {
  useState,
  useCallback,
  useEffect,
  useRef,
  type FormEvent,
  type KeyboardEvent,
} from 'react';

import { useKernel, useMachineState } from '../LinuxMachine/MachineContext';
import type { TicketAppState } from '../LinuxMachine/MachineTypes';

// ─── Types ────────────────────────────────────────────────────────────────────

export type TicketStatus   = 'open' | 'in-progress' | 'closed';
export type TicketPriority = 'low' | 'medium' | 'high';

export interface Ticket {
  id:          string;
  title:       string;
  description: string;
  status:      TicketStatus;
  priority:    TicketPriority;
  createdAt:   string;
  updatedAt:   string;
  assignee?:   string;
  tags?:       string[];
}

// ─── VFS helpers ──────────────────────────────────────────────────────────────

const TICKETS_DIR = '/var/tickets';

function ticketPath(id: string): string {
  return `${TICKETS_DIR}/${id}.json`;
}

function generateId(): string {
  // e.g. T-LX3F7Q
  return `T-${Date.now().toString(36).toUpperCase().slice(-6)}`;
}

function parseTicket(raw: string): Ticket | null {
  try {
    const t = JSON.parse(raw) as Partial<Ticket>;
    if (
      typeof t.id          === 'string' &&
      typeof t.title       === 'string' &&
      typeof t.description === 'string' &&
      typeof t.status      === 'string' &&
      typeof t.priority    === 'string' &&
      typeof t.createdAt   === 'string' &&
      typeof t.updatedAt   === 'string'
    ) {
      return t as Ticket;
    }
    return null;
  } catch {
    return null;
  }
}

// ─── Design constants ─────────────────────────────────────────────────────────

const STATUS_COLORS: Record<TicketStatus, { bg: string; fg: string }> = {
  'open':        { bg: '#1c3a5c', fg: '#79b8ff' },
  'in-progress': { bg: '#3a2f0b', fg: '#e3b341' },
  'closed':      { bg: '#1a3a2a', fg: '#3fb950' },
};
const PRIORITY_COLORS: Record<TicketPriority, { bg: string; fg: string }> = {
  low:    { bg: '#1a2d1a', fg: '#56d364' },
  medium: { bg: '#3a2f0b', fg: '#e3b341' },
  high:   { bg: '#3a1212', fg: '#f85149' },
};
const STATUS_LABELS: Record<TicketStatus, string>    = { open: 'Open', 'in-progress': 'In Progress', closed: 'Closed' };
const PRIORITY_LABELS: Record<TicketPriority, string> = { low: 'Low', medium: 'Medium', high: 'High' };

const inputStyle: React.CSSProperties = {
  background:   '#0d1117',
  border:       '1px solid #30363d',
  borderRadius: '0.375rem',
  color:        '#c9d1d9',
  fontSize:     '0.875rem',
  padding:      '0.4rem 0.625rem',
  width:        '100%',
  boxSizing:    'border-box',
};

// ─── Shared sub-components ────────────────────────────────────────────────────

function Badge({ value, colors }: { value: string; colors: { bg: string; fg: string } }) {
  return (
    <span style={{
      display:      'inline-block',
      padding:      '0.125rem 0.5rem',
      borderRadius: '9999px',
      fontSize:     '0.7rem',
      fontWeight:   600,
      background:   colors.bg,
      color:        colors.fg,
      whiteSpace:   'nowrap',
    }}>
      {value}
    </span>
  );
}

function Field({ id, label, required, children }: {
  id: string; label: string; required?: boolean; children: React.ReactNode;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
      <label htmlFor={id} style={{ color: '#8b949e', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {label}
        {required && <span aria-hidden="true" style={{ color: '#f85149', marginLeft: '0.25rem' }}>*</span>}
      </label>
      {children}
    </div>
  );
}

// ─── TicketApp ────────────────────────────────────────────────────────────────

export interface TicketAppProps {
  windowId: string;
  appState: TicketAppState;
}

export function TicketApp({ windowId, appState }: TicketAppProps) {
  const kernel = useKernel();
  const state  = useMachineState();

  const [view,    setView]    = useState<TicketAppState['view']>(appState.view);
  const [openId,  setOpenId]  = useState<string | undefined>(appState.openTicketId);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [liveMsg, setLiveMsg] = useState('');

  const syncAppState = useCallback((v: TicketAppState['view'], id?: string) => {
    kernel.updateWindowAppState(windowId, { view: v, openTicketId: id } satisfies TicketAppState);
  }, [kernel, windowId]);

  // Load tickets from VFS whenever VFS changes
  const loadTickets = useCallback((): Ticket[] => {
    const files = kernel.listDir(TICKETS_DIR);
    return files
      .filter(f => f.endsWith('.json'))
      .map(f => { const raw = kernel.readFile(`${TICKETS_DIR}/${f}`); return raw ? parseTicket(raw) : null; })
      .filter((t): t is Ticket => t !== null)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [kernel]);

  useEffect(() => { setTickets(loadTickets()); }, [state.vfs, loadTickets]);

  const handleCreate = useCallback((draft: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now    = new Date().toISOString();
    const id     = generateId();
    const ticket: Ticket = { ...draft, id, createdAt: now, updatedAt: now };
    kernel.mkdir(TICKETS_DIR, true);
    kernel.writeFile(ticketPath(id), JSON.stringify(ticket, null, 2));
    setLiveMsg(`Ticket ${id} created: ${ticket.title}`);
    setOpenId(id);
    setView('detail');
    syncAppState('detail', id);
  }, [kernel, syncAppState]);

  const handleUpdate = useCallback((id: string, patch: Partial<Ticket>) => {
    const raw = kernel.readFile(ticketPath(id));
    if (!raw) return;
    const existing = parseTicket(raw);
    if (!existing) return;
    const updated: Ticket = { ...existing, ...patch, updatedAt: new Date().toISOString() };
    kernel.writeFile(ticketPath(id), JSON.stringify(updated, null, 2));
    setLiveMsg(`Ticket ${id} updated`);
  }, [kernel]);

  const openDetail = useCallback((id: string) => { setOpenId(id); setView('detail'); syncAppState('detail', id); }, [syncAppState]);
  const openList   = useCallback(() => { setView('list'); setOpenId(undefined); syncAppState('list'); }, [syncAppState]);
  const openNew    = useCallback(() => { setView('new'); setOpenId(undefined); syncAppState('new'); }, [syncAppState]);

  const openTicket = openId ? (tickets.find(t => t.id === openId) ?? null) : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#0d1117', color: '#c9d1d9', fontFamily: 'system-ui, sans-serif', fontSize: '0.875rem' }}>
      {/* AODA: live region */}
      <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">{liveMsg}</div>

      {/* Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.75rem', background: '#161b22', borderBottom: '1px solid #21262d', flexShrink: 0 }}>
        {view !== 'list' && (
          <button type="button" aria-label="Back to ticket list" onClick={openList}
            style={{ background: 'transparent', border: '1px solid #30363d', borderRadius: '0.375rem', color: '#8b949e', cursor: 'pointer', fontSize: '0.8rem', padding: '0.25rem 0.625rem' }}>
            ← Back
          </button>
        )}
        <h1 style={{ color: '#e6edf3', fontSize: '0.95rem', fontWeight: 600, margin: 0, flex: 1 }}>
          {view === 'list'   && 'All Tickets'}
          {view === 'new'    && 'New Ticket'}
          {view === 'detail' && (openTicket ? `#${openTicket.id}` : 'Ticket')}
        </h1>
        {view === 'list' && (
          <button type="button" aria-label="Create new ticket" onClick={openNew}
            style={{ background: '#1f6feb', border: 'none', borderRadius: '0.375rem', color: '#fff', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, padding: '0.3rem 0.75rem' }}>
            + New Ticket
          </button>
        )}
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        {view === 'list'   && <TicketList tickets={tickets} onOpen={openDetail} onNew={openNew} />}
        {view === 'new'    && <TicketForm onSubmit={handleCreate} onCancel={openList} windowId={windowId} />}
        {view === 'detail' && openTicket  && <TicketDetail ticket={openTicket} onUpdate={handleUpdate} />}
        {view === 'detail' && !openTicket && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#484f58' }} role="alert">
            Ticket not found.
          </div>
        )}
      </div>
    </div>
  );
}

// ─── TicketList ───────────────────────────────────────────────────────────────

function TicketList({ tickets, onOpen, onNew }: { tickets: Ticket[]; onOpen: (id: string) => void; onNew: () => void }) {
  if (tickets.length === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '1rem', color: '#484f58' }} role="status">
        <div style={{ fontSize: '2.5rem', lineHeight: 1 }} aria-hidden="true">🎫</div>
        <p style={{ margin: 0, fontSize: '0.9rem' }}>No tickets yet.</p>
        <button type="button" onClick={onNew}
          style={{ background: '#1f6feb', border: 'none', borderRadius: '0.375rem', color: '#fff', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600, padding: '0.4rem 1rem' }}>
          Create your first ticket
        </button>
      </div>
    );
  }

  return (
    <div style={{ height: '100%', overflow: 'auto', padding: '0.75rem' }}>
      <table role="grid" aria-label="Ticket list" style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #21262d' }}>
            {['ID', 'Title', 'Status', 'Priority', 'Updated'].map(col => (
              <th key={col} scope="col" style={{ color: '#8b949e', fontSize: '0.75rem', fontWeight: 600, padding: '0.4rem 0.5rem', textAlign: 'left', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tickets.map(t => (
            <tr key={t.id} style={{ borderBottom: '1px solid #161b22' }}>
              <td style={{ padding: '0.4rem 0.5rem', width: '6rem', verticalAlign: 'middle' }}>
                <button type="button" aria-label={`Open ticket ${t.id}: ${t.title}`} onClick={() => onOpen(t.id)}
                  style={{ background: 'transparent', border: 'none', color: '#79b8ff', cursor: 'pointer', fontSize: '0.8rem', fontFamily: 'monospace', padding: 0, textDecoration: 'underline' }}>
                  {t.id}
                </button>
              </td>
              <td style={{ padding: '0.4rem 0.5rem', verticalAlign: 'middle', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '18rem' }}>
                {t.title}
              </td>
              <td style={{ padding: '0.4rem 0.5rem', verticalAlign: 'middle' }}>
                <Badge value={STATUS_LABELS[t.status]} colors={STATUS_COLORS[t.status]} />
              </td>
              <td style={{ padding: '0.4rem 0.5rem', verticalAlign: 'middle' }}>
                <Badge value={PRIORITY_LABELS[t.priority]} colors={PRIORITY_COLORS[t.priority]} />
              </td>
              <td style={{ padding: '0.4rem 0.5rem', verticalAlign: 'middle', color: '#8b949e', fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
                <time dateTime={t.updatedAt}>{new Date(t.updatedAt).toLocaleDateString('en-CA')}</time>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── TicketForm ───────────────────────────────────────────────────────────────

function TicketForm({ onSubmit, onCancel, windowId }: {
  onSubmit: (t: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
  windowId: string;
}) {
  const [title,       setTitle]       = useState('');
  const [description, setDescription] = useState('');
  const [status,      setStatus]      = useState<TicketStatus>('open');
  const [priority,    setPriority]    = useState<TicketPriority>('medium');
  const [assignee,    setAssignee]    = useState('');
  const [tagsRaw,     setTagsRaw]     = useState('');
  const [error,       setError]       = useState('');

  const p = (suffix: string) => `ticket-${windowId}-${suffix}`;
  const selectStyle: React.CSSProperties = { ...inputStyle, cursor: 'pointer' };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!title.trim()) { setError('Title is required.'); return; }
    setError('');
    const tags = tagsRaw.split(',').map(s => s.trim()).filter(Boolean);
    onSubmit({ title: title.trim(), description: description.trim(), status, priority, assignee: assignee.trim() || undefined, tags: tags.length ? tags : undefined });
  };

  return (
    <form onSubmit={handleSubmit} noValidate aria-label="New ticket form"
      style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1rem', height: '100%', overflow: 'auto', boxSizing: 'border-box' }}>
      {error && <div role="alert" style={{ color: '#f85149', fontSize: '0.8rem', padding: '0.5rem 0.75rem', background: '#3a1212', borderRadius: '0.375rem' }}>{error}</div>}
      <Field id={p('title')} label="Title" required>
        <input id={p('title')} type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Short, descriptive title" required autoFocus style={inputStyle} />
      </Field>
      <Field id={p('desc')} label="Description">
        <textarea id={p('desc')} value={description} onChange={e => setDescription(e.target.value)} placeholder="Steps to reproduce, context, expected behaviour…" rows={5} style={{ ...inputStyle, resize: 'vertical' }} />
      </Field>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <Field id={p('status')} label="Status">
          <select id={p('status')} value={status} onChange={e => setStatus(e.target.value as TicketStatus)} style={selectStyle}>
            <option value="open">Open</option>
            <option value="in-progress">In Progress</option>
            <option value="closed">Closed</option>
          </select>
        </Field>
        <Field id={p('priority')} label="Priority">
          <select id={p('priority')} value={priority} onChange={e => setPriority(e.target.value as TicketPriority)} style={selectStyle}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </Field>
      </div>
      <Field id={p('assignee')} label="Assignee">
        <input id={p('assignee')} type="text" value={assignee} onChange={e => setAssignee(e.target.value)} placeholder="username or email (optional)" style={inputStyle} />
      </Field>
      <Field id={p('tags')} label="Tags">
        <input id={p('tags')} type="text" value={tagsRaw} onChange={e => setTagsRaw(e.target.value)} placeholder="bug, frontend, urgent (comma-separated)" style={inputStyle} />
      </Field>
      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: 'auto', paddingTop: '0.5rem' }}>
        <button type="button" onClick={onCancel} style={{ background: 'transparent', border: '1px solid #30363d', borderRadius: '0.375rem', color: '#8b949e', cursor: 'pointer', fontSize: '0.875rem', padding: '0.4rem 1rem' }}>Cancel</button>
        <button type="submit" style={{ background: '#1f6feb', border: 'none', borderRadius: '0.375rem', color: '#fff', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600, padding: '0.4rem 1rem' }}>Create Ticket</button>
      </div>
    </form>
  );
}

// ─── TicketDetail ─────────────────────────────────────────────────────────────

function TicketDetail({ ticket, onUpdate }: { ticket: Ticket; onUpdate: (id: string, patch: Partial<Ticket>) => void }) {
  const [editingDesc, setEditingDesc] = useState(false);
  const [descDraft,   setDescDraft]   = useState(ticket.description);

  useEffect(() => { setDescDraft(ticket.description); setEditingDesc(false); }, [ticket.id, ticket.description]);

  const saveDesc = () => { onUpdate(ticket.id, { description: descDraft }); setEditingDesc(false); };
  const handleDescKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Escape') { setDescDraft(ticket.description); setEditingDesc(false); }
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) saveDesc();
  };

  const rowS: React.CSSProperties = { display: 'flex', flexDirection: 'row', gap: '0.75rem', alignItems: 'flex-start', padding: '0.5rem 0', borderBottom: '1px solid #161b22' };
  const labelS: React.CSSProperties = { color: '#8b949e', fontSize: '0.75rem', fontWeight: 600, minWidth: '7rem', textTransform: 'uppercase', letterSpacing: '0.05em', paddingTop: '0.25rem', flexShrink: 0 };

  return (
    <article aria-labelledby={`th-${ticket.id}`} style={{ height: '100%', overflow: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column' }}>
      <h2 id={`th-${ticket.id}`} style={{ color: '#e6edf3', fontSize: '1.1rem', fontWeight: 700, margin: '0 0 0.75rem 0' }}>{ticket.title}</h2>
      <dl style={{ margin: 0 }}>
        <div style={rowS}><dt style={labelS}>ID</dt><dd style={{ margin: 0, fontFamily: 'monospace', color: '#79b8ff' }}>{ticket.id}</dd></div>
        <div style={rowS}>
          <dt style={labelS}>Status</dt>
          <dd style={{ margin: 0 }}>
            <label htmlFor={`ds-${ticket.id}`} className="sr-only">Status</label>
            <select id={`ds-${ticket.id}`} value={ticket.status} onChange={e => onUpdate(ticket.id, { status: e.target.value as TicketStatus })} style={{ ...inputStyle, width: 'auto' }}>
              <option value="open">Open</option><option value="in-progress">In Progress</option><option value="closed">Closed</option>
            </select>
          </dd>
        </div>
        <div style={rowS}>
          <dt style={labelS}>Priority</dt>
          <dd style={{ margin: 0 }}>
            <label htmlFor={`dp-${ticket.id}`} className="sr-only">Priority</label>
            <select id={`dp-${ticket.id}`} value={ticket.priority} onChange={e => onUpdate(ticket.id, { priority: e.target.value as TicketPriority })} style={{ ...inputStyle, width: 'auto' }}>
              <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option>
            </select>
          </dd>
        </div>
        {ticket.assignee && <div style={rowS}><dt style={labelS}>Assignee</dt><dd style={{ margin: 0 }}>{ticket.assignee}</dd></div>}
        {ticket.tags && ticket.tags.length > 0 && (
          <div style={rowS}>
            <dt style={labelS}>Tags</dt>
            <dd style={{ margin: 0, display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
              {ticket.tags.map(tag => (
                <span key={tag} style={{ background: '#21262d', border: '1px solid #30363d', borderRadius: '0.25rem', color: '#8b949e', fontSize: '0.75rem', padding: '0.1rem 0.4rem' }}>{tag}</span>
              ))}
            </dd>
          </div>
        )}
        <div style={rowS}><dt style={labelS}>Created</dt><dd style={{ margin: 0, color: '#8b949e', fontSize: '0.8rem' }}><time dateTime={ticket.createdAt}>{new Date(ticket.createdAt).toLocaleString('en-CA')}</time></dd></div>
        <div style={rowS}><dt style={labelS}>Updated</dt><dd style={{ margin: 0, color: '#8b949e', fontSize: '0.8rem' }}><time dateTime={ticket.updatedAt}>{new Date(ticket.updatedAt).toLocaleString('en-CA')}</time></dd></div>
      </dl>

      {/* Description */}
      <div style={{ marginTop: '1rem', flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
          <h3 style={{ color: '#8b949e', fontSize: '0.75rem', fontWeight: 600, margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Description</h3>
          {!editingDesc && (
            <button type="button" aria-label="Edit description" onClick={() => setEditingDesc(true)}
              style={{ background: 'transparent', border: '1px solid #30363d', borderRadius: '0.25rem', color: '#8b949e', cursor: 'pointer', fontSize: '0.75rem', padding: '0.15rem 0.5rem' }}>
              Edit
            </button>
          )}
        </div>
        {editingDesc ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label htmlFor={`dd-${ticket.id}`} className="sr-only">Ticket description — press Ctrl+Enter to save, Escape to cancel</label>
            <textarea id={`dd-${ticket.id}`} value={descDraft} onChange={e => setDescDraft(e.target.value)} onKeyDown={handleDescKey} rows={8} autoFocus style={{ ...inputStyle, resize: 'vertical' }} />
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => { setDescDraft(ticket.description); setEditingDesc(false); }} style={{ background: 'transparent', border: '1px solid #30363d', borderRadius: '0.375rem', color: '#8b949e', cursor: 'pointer', fontSize: '0.8rem', padding: '0.25rem 0.75rem' }}>Cancel</button>
              <button type="button" onClick={saveDesc} style={{ background: '#1f6feb', border: 'none', borderRadius: '0.375rem', color: '#fff', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, padding: '0.25rem 0.75rem' }}>Save</button>
            </div>
          </div>
        ) : (
          <div style={{ background: '#161b22', border: '1px solid #21262d', borderRadius: '0.375rem', color: ticket.description ? '#c9d1d9' : '#484f58', fontSize: '0.875rem', lineHeight: 1.6, minHeight: '6rem', padding: '0.625rem 0.75rem', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
            {ticket.description || 'No description provided.'}
          </div>
        )}
      </div>
    </article>
  );
}

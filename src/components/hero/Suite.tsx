// The product suite of a fictional SaaS company ("Kestrel", placeholder), mashed up from the reference
// dashboards (louis-sidebar-agent, louis-crm-chat, crm-customer-ui, louis-slate-ai) and framed like the
// attio.com hero: a big CRM window with four app windows overlapping its edges. Agent cursors work across
// them (agents.ts). Drawn at a fixed design size (main window 1200×688) and scaled by Hero via --k.
// Elements agents interact with carry data-target; text they type into carries data-type.
import { useId, type CSSProperties, type ReactNode } from 'react';
import {
  Activity,
  CalendarDays,
  Clock,
  Flag,
  ArrowUp,
  AtSign,
  Bird,
  Building2,
  ChevronDown,
  ChevronsUpDown,
  CircleDollarSign,
  CircleHelp,
  Code2,
  FileText,
  Filter,
  Globe,
  History,
  Home,
  Inbox,
  LayoutGrid,
  MapPin,
  MessageSquare,
  Mic,
  MoreHorizontal,
  PanelLeft,
  Play,
  Plus,
  Search,
  Settings,
  Share,
  SlidersHorizontal,
  Sparkles,
  Sun,
  Tag,
  UserCircle,
  Users,
  Workflow,
  ArrowLeftRight,
  Wallet,
  Zap,
} from 'lucide-react';
import s from './Suite.module.css';

/* ---------- shared bits ---------- */

const people = {
  jane: { name: 'Jane Moore', img: 'women-44' },
  dana: { name: 'Dana Whitfield', img: 'women-68' },
  marcus: { name: 'Marcus Reed', img: 'men-32' },
  emily: { name: 'Emily Johnson', img: 'women-12' },
  david: { name: 'David Okafor', img: 'men-75' },
  sarah: { name: 'Sarah Davis', img: 'women-90' },
  chris: { name: 'Chris Wilson', img: 'men-46' },
  priya: { name: 'Priya Nair', img: 'women-26' },
  tom: { name: 'Tom Becker', img: 'men-11' },
  leo: { name: 'Leo Brandt', img: 'men-52' },
};
type Who = keyof typeof people;

function Avatar({ who, size = 18 }: { who: Who; size?: number }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img className={s.avatar} src={`/avatars/${people[who].img}.jpg`} alt="" width={size} height={size} />;
}
function Stack({ who, size = 18 }: { who: Who[]; size?: number }) {
  return (
    <span className={s.stack}>
      {who.map((w) => (
        <Avatar key={w} who={w} size={size} />
      ))}
    </span>
  );
}
// Logos that are black or near-black: inverted on dark surfaces (see globals.css, img[data-mono]).
const MONO = new Set(['vercel', 'notion', 'github', 'anthropic', 'openai', 'zendesk', 'airbnb']);
function Logo({ name, size = 16 }: { name: string; size?: number }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img className={s.logo} src={`/logos/${name}.svg`} alt="" width={size} height={size} data-mono={MONO.has(name) ? '' : undefined} />;
}

// The agents' marks: Clara keeps the eight-petal flower; the others each get their own small geometric logo.
const clara = ['#A78BFA', '#C084FC', '#8B5CF6', '#D8B4FE', '#A78BFA', '#C4B5FD', '#9333EA', '#DDD6FE'];
export function AgentIcon({ id, size = 16 }: { id: string; size?: number }) {
  const uid = useId().replace(/:/g, '');
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" aria-hidden="true" className={s.agentIcon}>
      {id === 'rune' && (
        // Lyra (support): a glowing orb on a tilted orbit, with a spark of light.
        <>
          <defs>
            <radialGradient id={`${uid}-orb`} cx="35%" cy="30%" r="75%">
              <stop offset="0" stopColor="#FDE68A" />
              <stop offset="0.45" stopColor="#FB7185" />
              <stop offset="1" stopColor="#8B5CF6" />
            </radialGradient>
          </defs>
          <circle cx="8" cy="8" r="5.6" fill={`url(#${uid}-orb)`} />
          <ellipse cx="8" cy="8" rx="7.4" ry="2.5" fill="none" stroke="#FFFFFF" strokeOpacity="0.9" strokeWidth="0.9" transform="rotate(-28 8 8)" />
          <path d="M5.6 3.9 L6.1 5.2 L7.4 5.7 L6.1 6.2 L5.6 7.5 L5.1 6.2 L3.8 5.7 L5.1 5.2 Z" fill="#FFFFFF" />
        </>
      )}
      {id === 'aether' && (
        // Nova (sales): a four-point star with a smaller one set diagonally behind it.
        <>
          <path d="M8 1 L9.7 6.3 L15 8 L9.7 9.7 L8 15 L6.3 9.7 L1 8 L6.3 6.3 Z" fill="#E879F9" />
          <path d="M8 4.6 L8.9 7.1 L11.4 8 L8.9 8.9 L8 11.4 L7.1 8.9 L4.6 8 L7.1 7.1 Z" fill="#FB7185" transform="rotate(45 8 8)" />
        </>
      )}
      {id === 'syntax' && (
        // Flux (workflows): three staggered bars, a step moving through a flow.
        <>
          <rect x="1.5" y="2.5" width="9" height="3.2" rx="1.6" fill="#5EEAD4" />
          <rect x="5.5" y="6.4" width="9" height="3.2" rx="1.6" fill="#86EFAC" />
          <rect x="1.5" y="10.3" width="9" height="3.2" rx="1.6" fill="#67E8F9" />
        </>
      )}
      {id === 'theo' && (
        // Atlas (ops): two peaks, one stacked in front of the other.
        <>
          <path d="M6 2.5 L11.5 13 H0.8 Z" fill="#0EA5E9" />
          <path d="M10.5 6 L15.2 13 H7 Z" fill="#2DD4BF" />
        </>
      )}
      {id === 'clara' && (
        <>
          {clara.map((c, i) => (
            <ellipse key={i} cx="8" cy="3.6" rx="1.55" ry="2.6" fill={c} transform={`rotate(${i * 45} 8 8)`} />
          ))}
          <circle cx="8" cy="8" r="1.7" fill={clara[0]} opacity=".55" />
        </>
      )}
    </svg>
  );
}

export const agents = [
  { id: 'rune', name: 'Lyra', role: 'Support', color: '#e11d48' },
  { id: 'aether', name: 'Nova', role: 'Sales', color: '#c026d3' },
  { id: 'syntax', name: 'Flux', role: 'Workflows', color: '#0f766e' },
  { id: 'theo', name: 'Atlas', role: 'Ops', color: '#0369a1' },
  { id: 'clara', name: 'Clara', role: 'Billing', color: '#7c3aed' },
] as const;

function Win({ className, sat, style, children }: { className: string; sat?: string; style?: CSSProperties; children: ReactNode }) {
  return (
    <div className={`${s.win} ${className}`} data-sat={sat} style={style}>
      <div className={s.chrome}>
        <span className={s.lights} aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
      </div>
      <div className={s.panel}>{children}</div>
    </div>
  );
}

const Kbd = ({ children }: { children: ReactNode }) => <span className={s.kbd}>{children}</span>;

/* ---------- main: customers (crm-customer-ui + sidebar-agent sidebar) ---------- */

const tagTone: Record<string, string> = { SaaS: s.tBlue, AI: s.tViolet, Fintech: s.tGreen, Enterprise: s.tSlate, B2B: s.tAmber, Commerce: s.tRose };
const rows: { logo: string; name: string; loc: string; site: string; tags: string[]; lead: Who; team: Who[]; arr: string; target?: string }[] = [
  { logo: 'vercel', name: 'Vercel', loc: 'San Francisco, US', site: 'vercel.com', tags: ['SaaS', 'AI'], lead: 'marcus', team: ['emily', 'chris', 'tom'], arr: '$136,400' },
  { logo: 'figma', name: 'Figma', loc: 'San Francisco, US', site: 'figma.com', tags: ['SaaS'], lead: 'emily', team: ['sarah', 'leo'], arr: '$161,200', target: 'tag' },
  { logo: 'shopify', name: 'Shopify', loc: 'Ottawa, CA', site: 'shopify.com', tags: ['Commerce', 'B2B'], lead: 'david', team: ['priya', 'marcus', 'jane', 'tom'], arr: '$130,900' },
  { logo: 'notion', name: 'Notion', loc: 'New York, US', site: 'notion.so', tags: ['SaaS'], lead: 'sarah', team: ['chris', 'emily'], arr: '$121,050' },
  { logo: 'linear', name: 'Linear', loc: 'Remote', site: 'linear.app', tags: ['SaaS', 'AI'], lead: 'chris', team: ['leo', 'david', 'sarah'], arr: '$117,600' },
  { logo: 'airbnb', name: 'Airbnb', loc: 'San Francisco, US', site: 'airbnb.com', tags: ['Commerce', 'Enterprise'], lead: 'priya', team: ['tom', 'jane'], arr: '$109,800' },
  { logo: 'hubspot', name: 'HubSpot', loc: 'Cambridge, US', site: 'hubspot.com', tags: ['SaaS', 'B2B'], lead: 'tom', team: ['marcus', 'priya', 'emily'], arr: '$98,300' },
  { logo: 'intercom', name: 'Intercom', loc: 'Dublin, IE', site: 'intercom.com', tags: ['SaaS', 'AI'], lead: 'leo', team: ['sarah', 'david'], arr: '$94,720' },
  { logo: 'zendesk', name: 'Zendesk', loc: 'San Francisco, US', site: 'zendesk.com', tags: ['Enterprise', 'B2B'], lead: 'jane', team: ['chris', 'leo', 'tom'], arr: '$88,150' },
  { logo: 'github', name: 'GitHub', loc: 'San Francisco, US', site: 'github.com', tags: ['SaaS', 'Enterprise'], lead: 'emily', team: ['david', 'marcus'], arr: '$77,480' },
  { logo: 'stripe', name: 'Stripe', loc: 'Dublin, IE', site: 'stripe.com', tags: ['Fintech', 'B2B'], lead: 'sarah', team: ['tom', 'leo', 'jane'], arr: '$74,900' },
  { logo: 'anthropic', name: 'Anthropic', loc: 'San Francisco, US', site: 'anthropic.com', tags: ['AI', 'Enterprise'], lead: 'marcus', team: ['priya', 'chris'], arr: '$71,300' },
  { logo: 'slack-color', name: 'Slack', loc: 'San Francisco, US', site: 'slack.com', tags: ['SaaS'], lead: 'david', team: ['emily', 'sarah', 'tom'], arr: '$66,850' },
  { logo: 'openai', name: 'OpenAI', loc: 'San Francisco, US', site: 'openai.com', tags: ['AI'], lead: 'priya', team: ['marcus', 'leo'], arr: '$63,200' },
  { logo: 'meta', name: 'Meta', loc: 'Menlo Park, US', site: 'meta.com', tags: ['Enterprise', 'AI'], lead: 'chris', team: ['jane', 'david', 'emily'], arr: '$58,940' },
  { logo: 'googlegemini', name: 'Google', loc: 'Mountain View, US', site: 'google.com', tags: ['Enterprise'], lead: 'tom', team: ['sarah', 'priya'], arr: '$52,610' },
];
// Extra columns, varied by row so the table reads as live data.
const stages = [
  ['Live', s.stLive],
  ['Expansion', s.stExp],
  ['Pilot', s.stPilot],
  ['Live', s.stLive],
  ['Renewal', s.stRenew],
  ['Live', s.stLive],
  ['Pilot', s.stPilot],
] as const;
const health = [92, 78, 64, 88, 71, 95, 58, 83, 69, 90, 76, 87, 61, 94, 73, 80];
const lastSeen = ['2m ago', '14m ago', '1h ago', '3h ago', 'Yesterday', '5m ago', '2d ago', '40m ago', '6h ago', '1h ago', 'Yesterday', '9m ago', '3d ago', '25m ago', '4h ago', '2h ago'];
const renewals = ['Mar 1', 'Jan 12', 'Apr 30', 'Feb 18', 'Jun 2', 'Mar 22', 'May 9', 'Jan 30', 'Aug 14', 'Feb 3', 'Jul 21', 'Apr 4', 'Sep 10', 'Mar 15', 'Oct 1', 'May 27'];

function SideItem({ icon, label, active, right, soon }: { icon: ReactNode; label: string; active?: boolean; right?: ReactNode; soon?: boolean }) {
  return (
    <div className={`${s.sItem} ${active ? s.sOn : ''} ${soon ? s.sSoon : ''}`}>
      {icon}
      <span>{label}</span>
      {right && <span className={s.sRight}>{right}</span>}
    </div>
  );
}

function MainWindow() {
  const I = { size: 15, strokeWidth: 1.75 };
  return (
    <Win className={s.main}>
      <div className={s.app}>
        <aside className={s.sidebar}>
          <div className={s.wsRow}>
            <span className={s.wsLogo}>
              <Bird size={13} strokeWidth={2.2} />
            </span>
            <b>Kestrel</b>
            <ChevronsUpDown size={13} className={s.dim} />
            <PanelLeft size={15} className={`${s.dim} ${s.push}`} />
          </div>
          <div className={s.searchRow}>
            <Search size={14} />
            <span>Search</span>
            <span className={s.push}>
              <Kbd>⌘</Kbd>
              <Kbd>K</Kbd>
            </span>
          </div>
          <SideItem icon={<AgentIcon id="rune" size={15} />} label="Agents" right={<><Kbd>⌘</Kbd><Kbd>Y</Kbd></>} />
          <SideItem icon={<Home {...I} />} label="Home" />
          <SideItem icon={<Inbox {...I} />} label="Inbox" right={<span className={s.badge}>12</span>} />
          <SideItem icon={<MessageSquare {...I} />} label="Messages" />
          <p className={s.sLabel}>
            Company <ChevronDown size={11} />
          </p>
          <SideItem icon={<Users {...I} />} label="Customers" active />
          <SideItem icon={<FileText {...I} />} label="Contracts" />
          <SideItem icon={<Wallet {...I} />} label="Balances" />
          <SideItem icon={<ArrowLeftRight {...I} />} label="Transactions" />
          <SideItem icon={<Workflow {...I} />} label="Workflows" />
          <p className={s.sLabel}>
            Spaces <ChevronDown size={11} />
          </p>
          <SideItem icon={<CircleDollarSign {...I} />} label="Payments" />
          <SideItem icon={<LayoutGrid {...I} />} label="App Library" />
          <SideItem icon={<Settings {...I} />} label="Settings" />
          <div className={s.me}>
            <Avatar who="jane" size={20} />
            <b>Jane Moore</b>
            <MoreHorizontal size={15} className={`${s.dim} ${s.push}`} />
          </div>
        </aside>

        <section className={s.content}>
          <header className={s.topbar}>
            <Users size={15} strokeWidth={1.75} />
            <b>Customers</b>
            <span className={s.push} />
            <span className={s.ghostBtn}>
              <Plus size={14} /> Customer
            </span>
            <span className={s.ghostBtn}>
              <Share size={14} /> Share
            </span>
            <Stack who={['jane', 'marcus', 'emily']} size={20} />
            <span className={s.sep} />
            <Sun size={15} className={s.dim} />
            <CircleHelp size={15} className={s.dim} />
          </header>
          <div className={s.toolbar}>
            <span className={s.ghostBtn}>
              <SlidersHorizontal size={14} /> Filter (0)
            </span>
            <Plus size={14} className={s.dim} />
            <span className={s.push} />
            <span className={s.ghostBtn}>
              <LayoutGrid size={14} /> Layout
            </span>
            <span className={s.ghostBtn}>
              <Filter size={14} /> Sort
            </span>
            <span className={s.ghostBtn}>
              <Settings size={14} /> View settings
            </span>
          </div>
          <div className={s.table}>
            <div className={`${s.tr} ${s.th}`}>
              <span>#</span>
              <span>
                <Building2 size={13} /> Account
              </span>
              <span>
                <MapPin size={13} /> Location
              </span>
              <span>
                <Globe size={13} /> Website
              </span>
              <span>
                <Tag size={13} /> Categories
              </span>
              <span>
                <UserCircle size={13} /> Lead
              </span>
              <span>
                <Users size={13} /> Team
              </span>
              <span>
                <CircleDollarSign size={13} /> ARR
              </span>
              <span>
                <Flag size={13} /> Stage
              </span>
              <span>
                <Activity size={13} /> Health
              </span>
              <span>
                <Clock size={13} /> Last activity
              </span>
              <span>
                <CalendarDays size={13} /> Renewal
              </span>
            </div>
            {rows.map((r, i) => (
              <div key={r.name} className={`${s.tr} ${r.target ? s.trHot : ''}`}>
                <span className={s.dim}>{i + 1}</span>
                <span className={s.acct}>
                  <Logo name={r.logo} size={15} />
                  <b>{r.name}</b>
                </span>
                <span className={s.sub}>{r.loc}</span>
                <span className={s.link}>{r.site}</span>
                <span className={s.tags} data-target={r.target}>
                  {r.tags.map((t) => (
                    <i key={t} className={tagTone[t]}>
                      {t}
                    </i>
                  ))}
                  {r.target && (
                    <i className={`${s.tAmber} ${s.tagNew}`}>
                      <span data-type="tag" />
                    </i>
                  )}
                </span>
                <span className={s.lead}>
                  <Avatar who={r.lead} />
                  {people[r.lead].name}
                </span>
                <span>
                  <Stack who={r.team} />
                </span>
                <span className={s.num}>{r.arr}</span>
                <span>
                  <i className={`${s.stage} ${stages[i % stages.length][1]}`}>{stages[i % stages.length][0]}</i>
                </span>
                <span className={s.health}>
                  <i style={{ width: `${health[i]}%` }} className={health[i] < 65 ? s.low : ''} />
                  <em>{health[i]}</em>
                </span>
                <span className={s.sub}>{lastSeen[i]}</span>
                <span className={s.sub}>{renewals[i]}</span>
              </div>
            ))}
            <div className={`${s.tr} ${s.tf}`}>
              <span>–</span>
              <span>Total: 120 accounts</span>
              <span>Count</span>
              <span>Count</span>
              <span>Count</span>
              <span>Count</span>
              <span>Count</span>
              <span>Sum $4.2M</span>
              <span>4 stages</span>
              <span>Avg 79</span>
              <span>–</span>
              <span>–</span>
            </div>
          </div>
        </section>
      </div>
    </Win>
  );
}

/* ---------- satellite: Ask Lyra (sidebar-agent / crm-chat) — holds the card that lifts ---------- */

function ChatWindow() {
  return (
    <Win className={s.chat} sat="chat" style={{ transformOrigin: '0% 50%' }}>
      <header className={s.topbar}>
        <AgentIcon id="rune" />
        <span className={s.dim}>Agent /</span>
        <b>Ask Lyra</b>
        <span className={s.push} />
        <span className={s.ghostBtn}>
          <Sparkles size={13} /> Quick Chat
        </span>
        <History size={14} className={s.dim} />
      </header>
      <div className={s.agentTabs}>
        {agents.slice(0, 4).map((a, i) => (
          <span key={a.id} className={i === 0 ? s.tabOn : ''}>
            <AgentIcon id={a.id} size={13} /> {a.name}
          </span>
        ))}
      </div>
      <div className={s.thread}>
        <div className={s.userMsg}>
          <p>Dana says order 88213 arrived cracked. Sort it out?</p>
          <Avatar who="jane" size={22} />
        </div>
        <div className={s.botMsg}>
          <AgentIcon id="rune" size={18} />
          <div>
            <p>Checked the photos and the order. Damage confirmed, so I&apos;m refunding her.</p>
            <div className={s.toolChips}>
              <span data-target="tool-zendesk">
                <Logo name="zendesk" size={12} /> ticket #99812
              </span>
              <span data-target="tool-stripe">
                <Logo name="stripe" size={12} /> payments.refund
              </span>
            </div>
            {/* The action Lyra proposes, inline in its reply. This is what lifts out into the x-ray flow. */}
            <div className={s.action} data-lift data-target="refund-card">
              <div className={s.aHead}>
                <span className={s.aChip}>Proposed action</span>
                <span className={s.pending}>Pending</span>
              </div>
              <p className={s.aTitle}>Refund $480.00</p>
              <p className={s.sub}>
                <Logo name="stripe" size={11} /> Order 88213 · card ending 4417
              </p>
              <div className={s.aBtns}>
                <span className={s.primary} data-target="refund-issue">
                  Issue refund
                </span>
                <span className={s.secondary}>Hold</span>
              </div>
            </div>
          </div>
        </div>

      </div>
      <div className={s.composer}>
        <span className={s.placeholder}>Ask Lyra anything…</span>
        <div className={s.composerBar}>
          <Plus size={14} />
          <AtSign size={14} />
          <span className={s.sep} />
          <span className={s.ghostBtn}>
            <Code2 size={13} /> Skills
          </span>
          <span className={s.models}>
            <span className={s.modelDot}>
              <Logo name="anthropic" size={11} />
            </span>
            <span className={s.modelDot}>
              <Logo name="openai" size={11} />
            </span>
          </span>
          <span>Model Fusion</span>
          <span className={s.push} />
          <Mic size={14} className={s.dim} />
          <span className={s.send}>
            <ArrowUp size={13} />
          </span>
        </div>
      </div>
    </Win>
  );
}

/* ---------- satellite: workflow canvas (slate-ai) ---------- */

function WorkflowWindow() {
  const nodes = [
    { icon: <Logo name="zendesk" size={14} />, kind: 'Trigger', title: 'New refund ticket' },
    { icon: <AgentIcon id="rune" size={15} />, kind: 'Agent', title: 'Lyra drafts a resolution', running: true, target: 'wf-node' },
    { icon: <Logo name="stripe" size={14} />, kind: 'Tool', title: 'payments.refund' },
  ];
  return (
    <Win className={s.flow} sat="flow" style={{ transformOrigin: '100% 0%' }}>
      <header className={s.topbar}>
        <Workflow size={14} />
        <b>Refund requests</b>
        <span className={s.push} />
        <span className={s.runBtn} data-target="wf-run">
          <Play size={11} /> Run
        </span>
      </header>
      <div className={s.canvas}>
        {nodes.map((n, i) => (
          <div key={n.kind} className={s.nodeWrap}>
            {i > 0 && <span className={s.edge} />}
            <div className={s.node} data-target={n.target}>
              <span className={s.nodeIcon}>{n.icon}</span>
              <span>
                <i>{n.kind}</i>
                <b>{n.title}</b>
              </span>
              {n.running ? <span className={s.running}>Running</span> : <MoreHorizontal size={14} className={s.dim} />}
            </div>
          </div>
        ))}
      </div>
    </Win>
  );
}

/* ---------- satellite: App Library (sidebar-agent suggested applications) ---------- */

const apps = [
  { logo: 'stripe', name: 'Stripe', text: 'Payments and refunds', target: 'app-stripe' },
  { logo: 'slack-color', name: 'Slack', text: 'Post to channels', on: true },
  { logo: 'github', name: 'GitHub', text: 'Pull requests', on: true },
  { logo: 'googlecalendar', name: 'Google Calendar', text: 'Meetings' },
  { logo: 'hubspot', name: 'HubSpot', text: 'Deals and contacts' },
];
function AppsWindow() {
  return (
    <Win className={s.apps} sat="apps" style={{ transformOrigin: '100% 100%' }}>
      <header className={s.topbar}>
        <LayoutGrid size={14} />
        <b>App library</b>
        <span className={s.push} />
        <Search size={13} className={s.dim} />
      </header>
      <ul className={s.appList}>
        {apps.map((a) => (
          <li key={a.name} data-target={a.target}>
            <span className={s.appLogo}>
              <Logo name={a.logo} size={14} />
            </span>
            <b>{a.name}</b>
            <span className={s.dim}>{a.text}</span>
            {a.on ? (
              <span className={s.connected}>Connected</span>
            ) : (
              <span className={a.target ? s.connect : s.connectGhost} data-target={a.target ? 'app-connect' : undefined}>
                {a.target ? <span data-type="connect">Connect</span> : 'Connect'}
              </span>
            )}
          </li>
        ))}
      </ul>
    </Win>
  );
}

/* ---------- satellite: terminal (Geist Mono only here) ---------- */

function TerminalWindow() {
  return (
    <Win className={s.term} sat="term" style={{ transformOrigin: '50% 0%' }}>
      <div className={s.termBody} data-target="term">
        <p className={s.termHead}>
          <AgentIcon id="theo" size={12} /> atlas · ops agent · production
        </p>
        <p>
          <span className={s.prompt}>$</span> <span data-type="term" />
          <span className={s.caret} />
        </p>
        <p data-log>✓ build api v4.1 · 41s</p>
        <p data-log>→ rolling out to eu-west</p>
        <p data-log>→ 3 of 12 instances healthy</p>
        <p data-log className={s.dim}>
          <Zap size={10} /> 18 tool calls · 2m 04s
        </p>
      </div>
    </Win>
  );
}

export function Suite() {
  return (
    <div className={s.suite} aria-hidden="true">
      <MainWindow />
      <AppsWindow />
      <WorkflowWindow />
      <TerminalWindow />
      {/* Frosted veil: when the scroll focuses on the refund card, it covers every window but the chat. */}
      <div className={s.veil} data-veil />
      <ChatWindow />
      {agents.map((a) => (
        <div key={a.id} className={s.cursor} data-cursor={a.id} data-cursor-other={a.id === 'rune' ? undefined : ''} style={{ '--c': a.color } as CSSProperties}>
          <svg width="22" height="24" viewBox="0 0 18 20" className={s.arrow}>
            <path d="M1 1l15 7.2-6.6 1.9L6.4 18z" />
          </svg>
          <span className={s.name}>{a.name} agent</span>
          <span className={s.ripple} data-ripple />
        </div>
      ))}
    </div>
  );
}

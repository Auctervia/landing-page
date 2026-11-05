// The x-ray card: three layers, after headroom.com. The checked card underneath (FaceB), an x-ray band
// showing what the action is made of, and the unverified card on top (FaceA), uncovered from above as the
// band moves down. The band position is the CSS variable --scan on [data-subject] (its top edge, in %).
import { Mark } from '../Logo';
import s from './Xray.module.css';

type X = { label: string; title: string; meta: string; bubble?: boolean; wave?: boolean };
// What the x-ray sees inside one agent action: the raw pieces Auctervia checks and seals.
const xray: X[] = [
  { label: 'Tool call', title: 'payments.refund(480.00)', meta: 'Support agent' },
  { label: 'Prompt', title: 'Customer asked for a refund on order 88213', meta: 'Chat · 2:41 PM', bubble: true },
  { label: 'Policy', title: 'refunds.require_approval', meta: 'Version 12' },
  { label: 'Approvals', title: 'No match for this order', meta: 'Approval log' },
  { label: 'Model', title: 'v4.1', meta: 'Temperature 0.2' },
  { label: 'Ticket', title: '#99812 · Damaged item', meta: 'Helpdesk' },
  { label: 'Trace', title: 'Step 14 of 22', meta: 'Run 7f2c' },
  { label: 'Call', title: 'Voice note from customer', meta: '0:48', wave: true },
  { label: 'Order', title: '88213 · $480.00', meta: 'Card ending 4417' },
  { label: 'Previous record', title: '#0411 · 41b7…08d2', meta: 'Evidence chain' },
  { label: 'Limit', title: 'Refunds over $100 need a person', meta: 'Policy rule 3', bubble: true },
  { label: 'Tool result', title: 'Not executed', meta: 'Held at the gate' },
];

export function XraySubject() {
  return (
    <div className={s.subject} data-subject>
      <div className={`${s.layer} ${s.checked}`}>
        <FaceB />
      </div>
      <div className={`${s.layer} ${s.xray}`} aria-hidden="true">
        <div className={s.xrayCols}>
          {/* repeated, so the masonry fills the whole card height */}
          {[...xray, ...xray.slice(6), ...xray.slice(0, 6)].map((x, i) => (
            <div key={i} className={s.xcard}>
              <span className={s.xlabel}>{x.label}</span>
              {x.bubble ? <span className={s.xbubble}>{x.title}</span> : <span className={s.xtitle}>{x.title}</span>}
              <span className={s.xmeta}>{x.meta}</span>
              {x.wave && (
                <span className={s.xwave}>
                  {Array.from({ length: 22 }, (_, k) => (
                    <i key={k} style={{ height: 3 + ((k * 7) % 11) }} />
                  ))}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
      <div className={`${s.layer} ${s.grey}`} aria-hidden="true">
        <FaceA />
      </div>
      <div className={s.edgeClip} aria-hidden="true" data-edges>
        <div className={s.edges}>
          <span />
          <span />
        </div>
      </div>
    </div>
  );
}

/** Reduced motion: the two faces side by side, no scan. */
export function StillCard({ checked }: { checked?: boolean }) {
  return <div className={s.stillCard}>{checked ? <FaceB sealed /> : <FaceA />}</div>;
}

function FaceA() {
  return (
    <div className={s.cardA}>
      <div className={s.cardHead}>
        <span className={s.chipA}>Ran 3 minutes ago</span>
        <span>Support agent</span>
      </div>
      <p className={s.cardTitle}>Refund $480.00</p>
      <dl className={s.fieldsA}>
        {[
          ['Approved by', '—'],
          ['Policy', 'Unknown'],
          ['Evidence', 'Not recorded'],
          ['Verified by', 'No one'],
        ].map(([k, v]) => (
          <div key={k}>
            <dt>{k}</dt>
            <dd>{v}</dd>
          </div>
        ))}
      </dl>
      <p className={s.footA}>Only in the trace logs</p>
    </div>
  );
}

function FaceB({ sealed = false }: { sealed?: boolean }) {
  return (
    <div className={s.cardB}>
      <div className={s.cardHead}>
        <span className={s.brandB}>
          <Mark size={14} /> Checked by Auctervia
        </span>
      </div>
      <p className={s.cardTitle}>Refund $480.00</p>
      <ul className={s.sources}>
        {['Model v4.1', 'Policy v12', 'payments.refund', 'Approvals', 'Order 88213'].map((t) => (
          <li key={t} data-src={sealed ? undefined : ''}>
            {t}
          </li>
        ))}
      </ul>
      <dl className={s.fieldsB}>
        {[
          ['Approval', 'None found'],
          ['Decision', 'Denied before it ran'],
          ['Record', '#0412 · sealed'],
          ['Verified by', 'Anyone you share it with'],
        ].map(([k, v]) => (
          <div key={k}>
            <dt>{k}</dt>
            <dd data-val={sealed ? undefined : ''}>{v}</dd>
          </div>
        ))}
      </dl>
      <p className={s.footB}>
        {!sealed && (
          <span data-checking>
            <span className={s.pulseDot} /> Checking
          </span>
        )}
        {sealed ? (
          <span>Sealed · 0x9f3a…c21e</span>
        ) : (
          <span data-sealed className={s.sealed}>
            Sealed · 0x9f3a…c21e
          </span>
        )}
      </p>
    </div>
  );
}

// Platform bento, after spara.com: titled cards, each with a slice of product UI rising from its lower edge.
// Brings together what the connect, prove, test, release and comparison sections used to say.
import type { ReactNode } from 'react';
import { CheckCircle2, CircleAlert, Link2, ShieldCheck, WifiOff } from 'lucide-react';
import { Mark } from './Logo';
import s from './Bento.module.css';

const MONO = new Set(['anthropic', 'openai']);
const Logo = ({ name, size = 14 }: { name: string; size?: number }) => (
  // eslint-disable-next-line @next/next/no-img-element
  <img src={`/logos/${name}.svg`} alt="" width={size} height={size} data-mono={MONO.has(name) ? '' : undefined} />
);

function Card({ title, text, wide, children, glow }: { title: string; text: string; wide?: boolean; glow?: 'violet' | 'peach' | 'mint'; children: ReactNode }) {
  return (
    <article className={`${s.card} ${wide ? s.wide : ''}`} data-reveal="up">
      <h3>{title}</h3>
      <p>{text}</p>
      <div className={`${s.stageArea} ${glow ? s[glow] : ''}`} aria-hidden="true">
        {children}
      </div>
    </article>
  );
}

export function Bento() {
  return (
    <section id="platform" className={`section ruled ${s.bento}`} aria-labelledby="bento-title">
      <div className={s.inner}>
        <header className={s.head}>
          <h2 id="bento-title" data-shimmer>
            Everything you need to trust agents in production.
          </h2>
          <p className="lede" data-reveal="fade">
            Connect the agents you already run, prove every action, re-test every change and ship with a sign-off.
          </p>
        </header>

        <div className={s.grid}>
          <Card title="Works with the agents you already run" text="An MCP server or SDK adapter puts every tool call behind the gateway, whatever model is underneath." glow="violet">
            <div className={`${s.panel} ${s.agentsPanel}`}>
              <p className={s.panelTitle}>Your agents</p>
              {[
                ['anthropic', 'Support agent', 'MCP server'],
                ['openai', 'Billing agent', 'SDK adapter'],
                ['googlegemini', 'Sales agent', 'MCP server'],
                ['meta', 'Ops agent', 'SDK adapter'],
              ].map(([logo, name, via]) => (
                <div key={name} className={s.agentRow}>
                  <span className={s.tile}>
                    <Logo name={logo} />
                  </span>
                  <b>{name}</b>
                  <span className={s.via}>
                    <span className={s.dot} /> {via}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          <Card wide title="Evidence no one can quietly edit" text="Every decision is written as a hash-linked, append-only record, in an open format your assessors can read without us." glow="peach">
            <div className={`${s.panel} ${s.ledger}`}>
              {[
                ['#0412', 'Refund $480.00', 'Denied', '9f3a…c21e'],
                ['#0411', 'Merge to main', 'Allowed', '41b7…08d2'],
                ['#0410', 'Issue credit $60.00', 'Allowed', 'c80e…77a1'],
                ['#0409', 'Edit account email', 'Allowed', '2d19…e6ae'],
              ].map(([id, what, d, h]) => (
                <div key={id} className={s.rec}>
                  <span className={s.id}>{id}</span>
                  <b>{what}</b>
                  <span className={d === 'Denied' ? s.deny : s.allow}>{d}</span>
                  <span className={s.hash}>
                    <Link2 size={11} /> {h}
                  </span>
                </div>
              ))}
              <span className={s.verified}>
                <ShieldCheck size={13} /> Chain verified · 4 of 4
              </span>
            </div>
          </Card>

          <Card wide title="Every change is tested again" text="A new model, prompt, tool or policy re-runs the suite in a sandbox before release. Our support suite runs 26 adversarial scenarios end to end." glow="mint">
            <div className={`${s.panel} ${s.sandbox}`}>
              <div className={s.sbHead}>
                <span>Sandbox run · model changed</span>
                <span className={s.off}>
                  <WifiOff size={12} /> Network off
                </span>
              </div>
              {[
                ['Allowed action', true],
                ['Denied action', true],
                ['Mismatched approval', true],
                ['Prompt injection', false],
                ['Tool failure', true],
              ].map(([name, ok]) => (
                <div key={name as string} className={s.case}>
                  {ok ? <CheckCircle2 size={14} className={s.pass} /> : <CircleAlert size={14} className={s.find} />}
                  <span>{name}</span>
                  <span className={ok ? s.passText : s.findText}>{ok ? 'Pass' : 'Finding · blocked at the gate'}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Security signs off, then you ship" text="Each release ends in a versioned report and a clear decision. The history stays for your audits." glow="violet">
            <div className={`${s.panel} ${s.report}`}>
              <p className={s.repHead}>
                <Mark size={14} /> Release report v13
              </p>
              {['Tests passed in sandbox', 'No network calls recorded', 'Evidence chain verified'].map((t) => (
                <p key={t} className={s.repRow}>
                  <CheckCircle2 size={14} className={s.pass} /> {t}
                </p>
              ))}
              <span className={s.stamp}>Approved for release</span>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}

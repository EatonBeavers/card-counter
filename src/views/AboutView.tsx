import { useState } from 'react';

/**
 * About / support screen — fully self-contained (own styles + icons + links) so
 * it needs no changes to the IPC layer, global CSS, or icon set. Crypto addresses
 * copy to the clipboard.
 */

const CRYPTO = [
  { name: 'Bitcoin', ticker: 'BTC', address: 'bc1qj8v3p05xwjtue93uhjv4pq8g5dqauhuhevj6uh' },
  { name: 'Ethereum', ticker: 'ETH', address: '0x5c430BEa591dd67F2C6dB8E805F5Cc64B4Fb13Af' },
  { name: 'Solana', ticker: 'SOL', address: 'GnG1fTWFZozh65LCcM3jPoYrxrvnmkx2PvFjaCw3CuJM' },
];

const STYLES = `
.sup-dedication { display:flex; flex-direction:column; align-items:center; text-align:center; gap:8px; padding:26px 16px 22px; }
.sup-dedication .heart { font-size:46px; line-height:1; color:var(--neg); filter:drop-shadow(0 0 14px rgba(248,114,114,0.35)); }
.sup-dedication .names { font-size:19px; font-weight:700; margin:6px 0 0; }
.sup-dedication .line { font-size:14px; color:var(--text-dim); margin:0; max-width:420px; }

.sup-hero { display:flex; flex-direction:column; align-items:center; text-align:center; gap:6px; padding:18px 0 6px; }
.sup-badge { width:56px; height:56px; border-radius:var(--radius); background:var(--accent); color:#fff; display:grid; place-items:center; margin-bottom:8px; box-shadow:var(--shadow); }
.sup-hero h3 { font-size:17px; margin:0; }
.sup-hero p { color:var(--text-dim); max-width:460px; margin:2px 0 0; font-size:13px; }

.sup-opt-row { display:flex; justify-content:center; margin-top:14px; }
.sup-opt { display:flex; flex-direction:column; align-items:center; justify-content:center; gap:8px; padding:22px 28px; background:var(--bg-elev); border:1px solid var(--border); border-radius:var(--radius); cursor:pointer; text-align:center; color:inherit; text-decoration:none; transition:background .12s ease, border-color .12s ease, box-shadow .12s ease, transform .06s ease; min-width:200px; }
.sup-opt:hover { background:var(--bg-elev-2); border-color:var(--accent); box-shadow:var(--shadow); }
.sup-opt:active { transform:scale(0.985); }
.sup-opt.on { background:var(--bg-elev-2); border-color:var(--accent); }
.sup-emoji { font-size:30px; line-height:1; }
.sup-title { font-weight:600; color:var(--text); }
.sup-sub { font-size:11px; color:var(--text-faint); }

.sup-row { display:flex; align-items:center; justify-content:space-between; gap:12px; background:var(--bg-elev); border:1px solid var(--border); border-radius:var(--radius-sm); padding:10px 12px; margin-bottom:8px; }
.sup-row .s-name { font-size:13px; font-weight:600; }
.sup-row .s-name .tk { color:var(--text-faint); font-weight:500; }
.sup-addr { font-family:var(--mono); font-size:11px; color:var(--text-dim); word-break:break-all; margin-top:2px; }

.sup-note { display:flex; align-items:flex-start; gap:10px; background:var(--bg-elev); border:1px solid var(--border); border-radius:var(--radius); padding:12px 14px; color:var(--text-dim); font-size:12.5px; margin-top:16px; }
.sup-note .n-ico { color:var(--accent); flex:0 0 auto; margin-top:1px; }
`;

const HEART_PATH = 'M19.5 4.8a5 5 0 0 0-7.5.6 5 5 0 0 0-7.5-.6 5 5 0 0 0 0 7.1L12 19l7.5-7.1a5 5 0 0 0 0-7.1Z';

export function AboutView(): JSX.Element {
  const [showCrypto, setShowCrypto] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const copy = async (addr: string): Promise<void> => {
    try {
      await navigator.clipboard.writeText(addr);
      setCopied(addr);
      setTimeout(() => setCopied((c) => (c === addr ? null : c)), 1800);
    } catch {
      // Clipboard may be unavailable; the address is selectable as a fallback.
    }
  };

  return (
    <div>
      <style>{STYLES}</style>

      <div className="view-header">
        <div>
          <h2>About</h2>
          <div className="sub">Card Counter · local-first blackjack trainer & live-session assistant</div>
        </div>
        <span className="badge">v0.2.0</span>
      </div>

      <div className="panel">
        <div className="sup-dedication">
          <span className="heart">♥</span>
          <p className="names">for Jen and Bri</p>
          <p className="line">two degens that hold a very special place in my heart.</p>
        </div>
      </div>

      <div className="panel" style={{ marginTop: 16 }}>
        <div className="sup-hero">
          <span className="sup-badge">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d={HEART_PATH} />
            </svg>
          </span>
          <h3>Support this software</h3>
          <p>
            Card Counter is independent and free. If it earned its keep at the tables, crypto donations
            help keep it growing — thank you.
          </p>
        </div>

        <div className="sup-opt-row">
          <button
            className={`sup-opt${showCrypto ? ' on' : ''}`}
            onClick={() => setShowCrypto((s) => !s)}
          >
            <span className="sup-emoji">{'₿'}</span>
            <div className="sup-title">Send crypto</div>
            <div className="sup-sub">BTC / ETH / SOL</div>
          </button>
        </div>
      </div>

      {showCrypto && (
        <div className="panel" style={{ marginTop: 16 }}>
          <div className="panel-title">Crypto donations</div>
          {CRYPTO.map((c) => (
            <div className="sup-row" key={c.ticker}>
              <div style={{ minWidth: 0 }}>
                <div className="s-name">
                  {c.name} <span className="tk">({c.ticker})</span>
                </div>
                <div className="sup-addr">{c.address}</div>
              </div>
              <button className="btn ghost sm" onClick={() => copy(c.address)}>
                {copied === c.address ? '✓ Copied' : 'Copy'}
              </button>
            </div>
          ))}
          <p className="text-faint" style={{ fontSize: 11, textAlign: 'center', marginTop: 12, marginBottom: 0 }}>
            Please double-check the address before sending. Crypto transfers are final.
          </p>
        </div>
      )}

      <div className="sup-note">
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="n-ico"
          aria-hidden="true"
        >
          <path d={HEART_PATH} />
        </svg>
        <div>
          Prefer not to donate? Sharing Card Counter or reporting bugs on GitHub helps just as much.
          Thank you for supporting independent development.
        </div>
      </div>
    </div>
  );
}

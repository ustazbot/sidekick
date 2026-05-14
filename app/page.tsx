'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'

export default function LandingPage() {
  const [count74, setCount74] = useState(0)
  const [count7, setCount7] = useState(0)
  const [countRM, setCountRM] = useState(0)
  const statsRef = useRef<HTMLDivElement>(null)
  const statsAnimated = useRef(false)

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach(e => {
        if (e.isIntersecting) e.target.classList.add('lp-on')
      }),
      { threshold: 0.08 }
    )
    document.querySelectorAll('.lp-fade').forEach(el => io.observe(el))

    const so = new IntersectionObserver(
      (entries) => {
        entries.forEach(e => {
          if (e.isIntersecting && !statsAnimated.current) {
            statsAnimated.current = true
            animateCount(setCount74, 74, 1400)
            animateCount(setCount7, 7, 1000)
            animateCount(setCountRM, 75, 1200)
          }
        })
      },
      { threshold: 0.4 }
    )
    if (statsRef.current) so.observe(statsRef.current)

    return () => { io.disconnect(); so.disconnect() }
  }, [])

  return (
    <>
      <style>{`
        :root {
          --ink:       #0C1117;
          --gold:      #F0A500;
          --gold-dim:  rgba(240,165,0,0.12);
          --gold-line: rgba(240,165,0,0.28);
          --moss:      #1A7A5E;
          --moss-dim:  rgba(26,122,94,0.10);
          --moss-line: rgba(26,122,94,0.22);
          --cream:     #FAF9F6;
          --cream2:    #F2F0EB;
          --white:     #FFFFFF;
          --text-dark: #0F1923;
          --text-mid:  #4A5568;
          --text-soft: #8A9AB0;
          --border:    rgba(0,0,0,0.08);
        }
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body {
          background: var(--cream) !important;
          font-family: var(--font-jakarta, 'Plus Jakarta Sans', sans-serif);
          -webkit-font-smoothing: antialiased;
        }

        /* Fade in */
        .lp-fade { opacity:0; transform:translateY(24px); transition:opacity .65s cubic-bezier(.16,1,.3,1), transform .65s cubic-bezier(.16,1,.3,1); }
        .lp-fade.d1{transition-delay:.08s} .lp-fade.d2{transition-delay:.16s}
        .lp-fade.d3{transition-delay:.24s} .lp-fade.d4{transition-delay:.32s}
        .lp-on { opacity:1 !important; transform:translateY(0) !important; }

        /* Hero */
        .hero { background:var(--ink); position:relative; overflow:hidden; padding:48px 24px 44px; text-align:center; }
        .hero-grid { position:absolute; inset:0; background-image:repeating-linear-gradient(-48deg,transparent,transparent 36px,rgba(240,165,0,0.04) 36px,rgba(240,165,0,0.04) 37px); pointer-events:none; }
        .hero-orb-tr { position:absolute; top:-90px; right:-90px; width:280px; height:280px; border-radius:50%; background:radial-gradient(circle,rgba(240,165,0,.2) 0%,transparent 68%); pointer-events:none; }
        .hero-orb-bl { position:absolute; bottom:-60px; left:-60px; width:200px; height:200px; border-radius:50%; background:radial-gradient(circle,rgba(26,122,94,.16) 0%,transparent 68%); pointer-events:none; }
        .hero-inner { position:relative; z-index:1; }

        @keyframes badge-pulse { 0%,100%{box-shadow:0 0 0 0 rgba(240,165,0,.5)} 60%{box-shadow:0 0 0 7px rgba(240,165,0,0)} }
        .hero-badge { display:inline-flex; align-items:center; gap:8px; background:var(--gold-dim); border:1px solid var(--gold-line); border-radius:50px; padding:7px 16px; font-size:10px; font-weight:700; color:var(--gold); letter-spacing:1.2px; text-transform:uppercase; margin-bottom:22px; }
        .badge-dot { width:7px; height:7px; border-radius:50%; background:var(--gold); flex-shrink:0; animation:badge-pulse 2.2s ease infinite; }

        .hero-h1 { font-size:clamp(30px,8.5vw,48px); font-weight:800; line-height:1.12; letter-spacing:-1.2px; color:#F0EDE8; margin-bottom:18px; }
        .hero-h1 .gold { color:var(--gold); }
        .hero-h1 .moss { color:#3EC99A; }
        .hero-h1 .ul { position:relative; display:inline-block; }
        .hero-h1 .ul::after { content:''; position:absolute; bottom:-3px; left:0; right:0; height:3px; background:linear-gradient(90deg,var(--gold),rgba(240,165,0,.15)); border-radius:2px; }

        .hero-sub { font-size:14px; color:rgba(240,237,232,.6); line-height:1.78; margin-bottom:30px; max-width:380px; margin-left:auto; margin-right:auto; }
        .hero-sub strong { color:rgba(240,237,232,.9); font-weight:600; }

        .hero-cta { display:inline-flex; align-items:center; gap:8px; background:var(--gold); color:var(--ink); text-decoration:none; border-radius:12px; padding:15px 28px; font-size:15px; font-weight:800; box-shadow:0 8px 28px rgba(240,165,0,.38); transition:transform .18s,box-shadow .18s; margin-bottom:20px; }
        .hero-cta:active { transform:scale(.97); }

        .trust-strip { display:flex; gap:16px; flex-wrap:wrap; justify-content:center; }
        .trust-item { display:flex; align-items:center; gap:5px; font-size:11.5px; color:rgba(240,237,232,.45); }
        .trust-check { color:var(--gold); font-weight:700; }

        /* Stats */
        .stats-row { display:grid; grid-template-columns:1fr 1fr 1fr; background:var(--white); border-bottom:1px solid var(--border); }
        .stat-cell { padding:20px 12px; text-align:center; border-right:1px solid var(--border); }
        .stat-cell:last-child { border-right:none; }
        .stat-num { font-size:30px; font-weight:800; color:var(--moss); letter-spacing:-1.5px; line-height:1; }
        .stat-num.gold { color:var(--gold); }
        .stat-label { font-size:10px; color:var(--text-soft); margin-top:5px; line-height:1.4; }

        /* Sections */
        .section { padding:48px 22px 0; max-width:680px; margin-left:auto; margin-right:auto; }
        .section-last { padding-bottom:60px; }
        .s-label { display:inline-flex; align-items:center; gap:7px; font-size:10px; font-weight:700; letter-spacing:1.4px; text-transform:uppercase; color:var(--moss); margin-bottom:12px; }
        .s-label::before { content:''; display:block; width:16px; height:2px; background:var(--moss); border-radius:2px; }
        .h2 { font-size:clamp(20px,5.5vw,26px); font-weight:800; line-height:1.2; letter-spacing:-0.6px; color:var(--text-dark); margin-bottom:14px; }
        .h2 .m { color:var(--moss); }
        .body-text { font-size:14px; color:var(--text-mid); line-height:1.78; margin-bottom:18px; }
        .body-text strong { color:var(--text-dark); font-weight:600; }

        .divider { height:1px; margin:44px auto 0; max-width:636px; background:linear-gradient(90deg,transparent,var(--border) 25%,var(--border) 75%,transparent); }

        /* Scene cards */
        .scene-card { background:var(--white); border:1px solid var(--border); border-radius:14px; padding:20px 18px; margin-bottom:12px; position:relative; overflow:hidden; box-shadow:0 2px 10px rgba(0,0,0,.04); transition:transform .2s,box-shadow .2s; }
        .scene-card:hover { transform:translateY(-2px); box-shadow:0 6px 22px rgba(0,0,0,.08); }
        .scene-card::before { content:''; position:absolute; left:0; top:0; bottom:0; width:3px; background:linear-gradient(180deg,var(--gold),rgba(240,165,0,.1)); border-radius:3px 0 0 3px; }
        .scene-emoji { font-size:26px; margin-bottom:8px; display:block; }
        .scene-time { font-size:10px; font-weight:700; letter-spacing:1.1px; text-transform:uppercase; color:var(--text-soft); margin-bottom:7px; }
        .scene-text { font-size:13.5px; color:var(--text-mid); line-height:1.7; }
        .scene-text strong { color:var(--text-dark); font-weight:600; }
        .scene-text .ms { color:var(--moss); font-weight:600; }

        /* Quote */
        .quote-block { border-left:3px solid var(--moss); padding:15px 18px; margin:22px 0; background:var(--white); border-radius:0 12px 12px 0; box-shadow:0 2px 10px rgba(26,122,94,.06); }
        .quote-block p { font-size:13.5px; color:var(--text-mid); line-height:1.78; font-style:italic; }
        .quote-block strong { color:var(--text-dark); font-style:normal; font-weight:600; }

        /* Steps */
        .step-wrap { position:relative; margin-top:26px; }
        .step-line { position:absolute; left:19px; top:40px; bottom:0; width:1.5px; background:linear-gradient(180deg,var(--moss) 0%,rgba(26,122,94,.05) 100%); }
        .step-row { display:flex; gap:18px; padding-bottom:28px; position:relative; }
        .step-row:last-child { padding-bottom:0; }
        .step-num { width:40px; height:40px; flex-shrink:0; border-radius:50%; background:var(--white); border:2px solid var(--moss); display:flex; align-items:center; justify-content:center; font-size:14px; font-weight:800; color:var(--moss); position:relative; z-index:1; box-shadow:0 0 0 5px rgba(26,122,94,.07); }
        .step-body { padding-top:8px; flex:1; }
        .step-title { font-size:14px; font-weight:700; color:var(--text-dark); margin-bottom:4px; }
        .step-desc { font-size:13px; color:var(--text-mid); line-height:1.65; }

        /* Module grid */
        .module-grid { display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-top:8px; }
        @media(min-width:600px){ .module-grid { grid-template-columns:1fr 1fr 1fr; } }
        .module-card { background:var(--white); border:1px solid var(--border); border-radius:14px; padding:17px 14px; position:relative; overflow:hidden; transition:transform .2s,box-shadow .2s,border-color .2s; box-shadow:0 1px 4px rgba(0,0,0,.04); }
        .module-card:hover { transform:translateY(-3px); box-shadow:0 8px 24px rgba(26,122,94,.11); border-color:var(--moss-line); }
        .module-card::after { content:''; position:absolute; bottom:0; left:0; right:0; height:2px; background:linear-gradient(90deg,var(--moss),transparent); opacity:0; transition:opacity .2s; }
        .module-card:hover::after { opacity:1; }
        .module-icon { width:34px; height:34px; border-radius:9px; background:var(--moss-dim); display:flex; align-items:center; justify-content:center; font-size:17px; margin-bottom:10px; }
        .module-name { font-size:12px; font-weight:700; color:var(--text-dark); margin-bottom:4px; }
        .module-desc { font-size:11px; color:var(--text-soft); line-height:1.5; }

        /* Compare */
        .compare-wrap { border:1px solid var(--border); border-radius:16px; overflow:hidden; margin-top:20px; box-shadow:0 2px 14px rgba(0,0,0,.05); }
        .compare-head { display:grid; grid-template-columns:1fr 1fr 1fr; background:var(--ink); }
        .ch { padding:12px 8px; font-size:9.5px; font-weight:700; letter-spacing:.9px; text-align:center; text-transform:uppercase; }
        .ch-a { text-align:left; padding-left:14px; color:rgba(255,255,255,.28); }
        .ch-s { color:var(--gold); border-left:1px solid rgba(240,165,0,.18); border-right:1px solid rgba(240,165,0,.18); }
        .ch-o { color:rgba(255,255,255,.22); }
        .compare-row { display:grid; grid-template-columns:1fr 1fr 1fr; border-bottom:1px solid var(--cream2); background:var(--white); }
        .compare-row:last-child { border-bottom:none; }
        .cc { padding:13px 8px; font-size:11.5px; text-align:center; display:flex; align-items:center; justify-content:center; line-height:1.4; }
        .cc-a { text-align:left; justify-content:flex-start; padding-left:14px; color:var(--text-dark); font-weight:500; }
        .cc-s { background:rgba(26,122,94,.04); border-left:1px solid var(--moss-line); border-right:1px solid var(--moss-line); color:var(--moss); font-weight:700; font-size:10.5px; }
        .cc-o { color:#D1D5DB; }

        /* Dark blocks */
        .dark-block { background:var(--ink); border-radius:20px; padding:32px 24px; text-align:center; position:relative; overflow:hidden; }
        .db-grid { position:absolute; inset:0; background-image:repeating-linear-gradient(-48deg,transparent,transparent 32px,rgba(240,165,0,.03) 32px,rgba(240,165,0,.03) 33px); pointer-events:none; }
        .db-orb-tr { position:absolute; top:-55px; right:-55px; width:180px; height:180px; border-radius:50%; background:radial-gradient(circle,rgba(240,165,0,.16) 0%,transparent 70%); pointer-events:none; }
        .db-orb-bl { position:absolute; bottom:-45px; left:-45px; width:160px; height:160px; border-radius:50%; background:radial-gradient(circle,rgba(26,122,94,.18) 0%,transparent 70%); pointer-events:none; }
        .db-content { position:relative; z-index:1; }

        .int-emoji { font-size:38px; margin-bottom:12px; display:block; }
        .int-title { font-size:19px; font-weight:800; color:#F0EDE8; letter-spacing:-.3px; margin-bottom:12px; }
        .int-body { font-size:13.5px; color:rgba(240,237,232,.58); line-height:1.8; }
        .int-body strong { color:var(--gold); font-weight:600; }

        .price-label { font-size:9px; font-weight:700; letter-spacing:1.6px; text-transform:uppercase; color:rgba(240,237,232,.35); display:block; margin-bottom:18px; }
        .price-row { display:flex; align-items:flex-start; justify-content:center; gap:4px; margin-bottom:5px; }
        .price-rm { font-size:20px; font-weight:700; color:var(--gold); margin-top:14px; }
        .price-num { font-size:72px; font-weight:800; color:var(--gold); letter-spacing:-5px; line-height:1; }
        .price-sub { font-size:11.5px; color:rgba(240,237,232,.3); margin-bottom:26px; }
        .price-h2 { font-size:20px; font-weight:800; color:#F0EDE8; letter-spacing:-.4px; margin-bottom:9px; }
        .price-body { font-size:13.5px; color:rgba(240,237,232,.5); line-height:1.65; }

        .final-cta { display:block; width:100%; text-align:center; background:var(--gold); color:var(--ink); text-decoration:none; border-radius:13px; padding:18px 22px; font-size:16px; font-weight:800; box-shadow:0 8px 30px rgba(240,165,0,.42); transition:transform .18s,box-shadow .18s; margin-top:22px; }
        .final-cta:active { transform:scale(.98); }

        .trust2 { display:flex; flex-direction:column; gap:8px; align-items:center; margin-top:20px; }
        .trust2-item { font-size:12px; color:rgba(240,237,232,.4); display:flex; align-items:center; gap:6px; }
        .trust2-check { color:var(--gold); font-weight:700; }

        .lp-footer { text-align:center; padding:24px 22px 52px; font-size:11px; color:var(--text-soft); letter-spacing:.3px; }

        @media(min-width:768px){
          .hero { padding:72px 40px 60px; }
          .hero-h1 { font-size:52px; }
          .hero-cta { font-size:16px; padding:17px 36px; }
        }
      `}</style>

      <main style={{ background: 'var(--cream)', minHeight: '100vh' }}>

        {/* ── HERO ── */}
        <section className="hero">
          <div className="hero-grid" />
          <div className="hero-orb-tr" />
          <div className="hero-orb-bl" />
          <div className="hero-inner">

            <div className="lp-fade" style={{ marginBottom: 20, display: 'flex', justifyContent: 'center' }}>
              <Image
                src="/logo.png"
                alt="SIDEKICK"
                width={220}
                height={90}
                style={{ objectFit: 'contain' }}
                priority
              />
            </div>

            <div className="lp-fade d1">
              <span className="hero-badge">
                <span className="badge-dot" />
                Untuk Seller Malaysia
              </span>
            </div>

            <h1 className="hero-h1 lp-fade d2">
              AI dah ada.<br />
              Tapi <span className="gold"><span className="ul">ayat yang betul</span></span><br />
              tu yang <span className="moss">susah.</span>
            </h1>

            <p className="hero-sub lp-fade d3">
              Ramai seller dah cuba AI. Masalahnya —{' '}
              <strong>tak tahu macam mana nak tanya AI dengan betul</strong>{' '}
              supaya dapat ayat yang boleh convert.
            </p>

            <div className="lp-fade d4">
              <a href="/checkout" className="hero-cta">Lihat Apa Yang Ada →</a>
            </div>

            <div className="trust-strip lp-fade">
              {['74 Prompt Siap Guna', 'Sekali Bayar RM75', 'Bahasa Melayu'].map(t => (
                <span key={t} className="trust-item">
                  <span className="trust-check">✓</span> {t}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ── STATS ── */}
        <div ref={statsRef} className="stats-row">
          <div className="stat-cell">
            <div className="stat-num">{count74}</div>
            <div className="stat-label">Prompt<br />Berstruktur</div>
          </div>
          <div className="stat-cell">
            <div className="stat-num">{count7}</div>
            <div className="stat-label">Modul<br />Jualan</div>
          </div>
          <div className="stat-cell">
            <div className="stat-num gold">RM{countRM}</div>
            <div className="stat-label">Sekali<br />Bayar</div>
          </div>
        </div>

        {/* ── PAIN POINTS ── */}
        <section className="section lp-fade">
          <span className="s-label">Situasi Biasa</span>
          <h2 className="h2">Kenal tak situasi <span className="m">ni?</span></h2>
          <div className="scene-card">
            <span className="scene-emoji">😮‍💨</span>
            <div className="scene-time">Pukul 11 malam</div>
            <p className="scene-text">Ada customer tanya harga. Dah penat. Nak reply tapi <strong>tak tahu nak tulis apa</strong> yang kedengaran natural, tak desperate, tapi boleh buat dia berminat.</p>
          </div>
          <div className="scene-card">
            <span className="scene-emoji">🤦</span>
            <div className="scene-time">Esoknya</div>
            <p className="scene-text">Customer dah senyap. Padahal kalau ada ayat yang <span className="ms">betul-betul kena</span> — mungkin dia dah bayar semalam.</p>
          </div>
          <div className="scene-card">
            <span className="scene-emoji">💭</span>
            <div className="scene-time">Dah cuba AI tapi...</div>
            <p className="scene-text">Dapat ayat yang <strong>terlalu formal, terlalu panjang, atau langsung tak rasa macam kita yang tulis.</strong> Buang masa edit balik.</p>
          </div>
        </section>

        <div className="divider" />

        {/* ── SOLUTION ── */}
        <section className="section lp-fade">
          <span className="s-label">Penyelesaian</span>
          <h2 className="h2">Masuk <span className="m">SIDEKICK.</span></h2>
          <p className="body-text">SIDEKICK bukan satu lagi app AI. SIDEKICK adalah <strong>koleksi 74 prompt berstruktur</strong> — arahan yang dah dihasilkan khas untuk seller Malaysia, yang boleh terus dimasukkan ke dalam AI pilihan anda.</p>
          <div className="quote-block">
            <p>Bayangkan ada <strong>jurulatih jualan berpengalaman</strong> yang dah tulis arahan yang sempurna untuk AI — dan anda hanya perlu isi nama produk anda, tekan hantar.</p>
          </div>
          <p className="body-text">Dalam masa <strong style={{ color: 'var(--moss)' }}>bawah seminit</strong>, anda dapat ayat closing, caption, balas komen, atau mesej WhatsApp yang natural, berkesan, dan sesuai dengan situasi anda.</p>
        </section>

        <div className="divider" />

        {/* ── STEPS ── */}
        <section className="section lp-fade">
          <span className="s-label">Sangat Mudah</span>
          <h2 className="h2">3 langkah, <span className="m">siap.</span></h2>
          <div className="step-wrap">
            <div className="step-line" />
            {[
              { n: '1', title: 'Pilih situasi anda', desc: 'Nak buat caption? Nak balas komen? Nak close customer? Pilih modul yang sesuai.' },
              { n: '2', title: 'Jawab 2–3 soalan ringkas', desc: 'Nama produk anda apa? Customer anda siapa? Jawab je — sistem isi sendiri ke dalam prompt.' },
              { n: '3', title: 'Hantar ke AI, copy hasilnya', desc: 'Tekan hantar ke ChatGPT, Claude, atau Gemini. Dalam saat, ayat yang anda perlukan dah siap.' },
            ].map((s, i) => (
              <div key={i} className="step-row">
                <div className="step-num">{s.n}</div>
                <div className="step-body">
                  <div className="step-title">{s.title}</div>
                  <div className="step-desc">{s.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="divider" />

        {/* ── MODULES ── */}
        <section className="section lp-fade">
          <span className="s-label">Kandungan</span>
          <h2 className="h2">74 prompt, <span className="m">7 modul</span> situasi jualan.</h2>
          <p className="body-text">Setiap prompt direka untuk satu situasi jualan yang seller Malaysia hadapi setiap hari.</p>
          <div className="module-grid">
            {[
              { emoji: '🎯', name: 'Avatar Pelanggan', desc: 'Kenali pelanggan anda dengan lebih mendalam' },
              { emoji: '✍️', name: 'Buat Konten', desc: 'Hook, caption, post yang menarik perhatian' },
              { emoji: '💬', name: 'Balas Komen', desc: 'Respons FB, IG, TikTok yang convert' },
              { emoji: '📱', name: 'Mesej WhatsApp', desc: 'Follow-up, DM, broadcast yang natural' },
              { emoji: '🤝', name: 'Skrip Closing', desc: 'Ayat closing yang lembut dan berkesan' },
              { emoji: '🛡️', name: 'Handle Bantahan', desc: '"Mahal la", "nak fikir" — semua ada jawapan' },
              { emoji: '🎨', name: 'Buat Iklan', desc: 'Prompt edit gambar produk dengan AI' },
            ].map((m, i) => (
              <div key={i} className="module-card">
                <div className="module-icon">{m.emoji}</div>
                <div className="module-name">{m.name}</div>
                <div className="module-desc">{m.desc}</div>
              </div>
            ))}
          </div>
        </section>

        <div className="divider" />

        {/* ── COMPARE ── */}
        <section className="section lp-fade">
          <span className="s-label">Kenapa SIDEKICK</span>
          <h2 className="h2">Beza dengan <span className="m">produk lain.</span></h2>
          <p className="body-text">Ada tools jualan lain di luar sana. Tapi ada beberapa perkara yang buat SIDEKICK berbeza.</p>
          <div className="compare-wrap">
            <div className="compare-head">
              <div className="ch ch-a">Aspek</div>
              <div className="ch ch-s">SIDEKICK</div>
              <div className="ch ch-o">Produk Lain</div>
            </div>
            {[
              ['Bayaran', '✓ Sekali bayar, milik selamanya', '✗ Bulanan / langganan'],
              ['AI digunakan', '✓ Pilihan anda sendiri', '✗ Terikat platform mereka'],
              ['Bahasa', '✓ Melayu Malaysia', '✗ Kebanyakan English'],
              ['Integriti konten', '✓ Tiada klaim melampau', '✗ Tidak dijamin'],
              ['Khusus untuk', '✓ Seller Malaysia', '✗ Umum / global'],
            ].map(([a, s, o]) => (
              <div key={a} className="compare-row">
                <div className="cc cc-a">{a}</div>
                <div className="cc cc-s">{s}</div>
                <div className="cc cc-o">{o}</div>
              </div>
            ))}
          </div>
        </section>

        <div className="divider" />

        {/* ── INTEGRITY ── */}
        <section className="section lp-fade" style={{ paddingBottom: 0 }}>
          <div className="dark-block">
            <div className="db-grid" /><div className="db-orb-tr" /><div className="db-orb-bl" />
            <div className="db-content">
              <span className="int-emoji">🕌</span>
              <div className="int-title">Jual dengan Jujur.</div>
              <p className="int-body">Semua prompt dalam SIDEKICK dibina dengan satu prinsip — <strong>tiada testimoni rekaan, tiada urgency palsu, tiada klaim yang tidak berasas.</strong><br /><br />Anda boleh jual dengan yakin, tanpa rasa bersalah. Sebab cara kita jual mencerminkan siapa kita.</p>
            </div>
          </div>
        </section>

        {/* ── PRICING CTA ── */}
        <section className="section section-last lp-fade" style={{ paddingTop: 24 }}>
          <div className="dark-block">
            <div className="db-grid" /><div className="db-orb-tr" /><div className="db-orb-bl" />
            <div className="db-content">
              <span className="price-label">Harga One-Time</span>
              <div className="price-row">
                <span className="price-rm">RM</span>
                <span className="price-num">75</span>
              </div>
              <div className="price-sub">Tiada bayaran bulanan. Milik anda selamanya.</div>
              <h2 className="price-h2">Sedia jadi seller yang lebih bijak?</h2>
              <p className="price-body">74 prompt. Sekali bayar. Guna selama-lamanya dengan AI pilihan anda.</p>
              <a href="/checkout" className="final-cta">Dapatkan SIDEKICK Sekarang →</a>
              <div className="trust2">
                {['Akses segera selepas bayar', 'Guna dengan ChatGPT, Claude atau Gemini', 'Milik anda selamanya'].map(t => (
                  <span key={t} className="trust2-item"><span className="trust2-check">✓</span> {t}</span>
                ))}
              </div>
            </div>
          </div>
        </section>

        <div className="lp-footer">sidekick101.com · Dibina untuk Seller Malaysia</div>

      </main>
    </>
  )
}

function animateCount(setter: (v: number) => void, target: number, duration: number) {
  const start = performance.now()
  const tick = (now: number) => {
    const p = Math.min((now - start) / duration, 1)
    setter(Math.round((1 - Math.pow(1 - p, 3)) * target))
    if (p < 1) requestAnimationFrame(tick)
  }
  requestAnimationFrame(tick)
}

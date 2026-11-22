export const CSS = `
:root{--bg:#f6f8f7;--card:#fff;--ink:#14231f;--mute:#5b6b66;--line:#e2e9e6;--brand:#0b7a5f;--brand-d:#085c48;--good:#e3f6ea;--warn:#fff3d6;--bad:#fde0e0;--r:14px}
*{box-sizing:border-box}
body{margin:0;font:16px/1.6 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;color:var(--ink);background:var(--bg)}
a{color:var(--brand-d)}
.wrap{max-width:960px;margin:0 auto;padding:0 18px}
header.site{background:#fff;border-bottom:1px solid var(--line)}
header.site .wrap{display:flex;align-items:center;justify-content:space-between;height:60px}
.logo{font-weight:800;font-size:20px;text-decoration:none;color:var(--ink)}.logo b{color:var(--brand)}
nav a{margin-left:18px;text-decoration:none;color:var(--mute);font-weight:600}nav a:hover{color:var(--brand)}
.hero{background:linear-gradient(135deg,#0b7a5f,#0f9d7a);color:#fff;padding:46px 0 54px}
.hero h1{font-size:clamp(28px,5vw,42px);line-height:1.15;margin:0 0 10px}
.hero p{margin:0;max-width:620px;opacity:.95;font-size:18px}
.crumbs{font-size:14px;color:var(--mute);padding:14px 0 0}.crumbs a{color:var(--mute)}
h1.pg{font-size:clamp(26px,4.5vw,36px);line-height:1.2;margin:10px 0 6px}
h2{font-size:22px;margin:0 0 10px}
.lead{color:var(--mute);margin:0 0 18px}
.card{background:var(--card);border:1px solid var(--line);border-radius:var(--r);padding:20px;margin:18px 0;box-shadow:0 1px 2px rgba(0,0,0,.03)}
.hero+.wrap .card:first-child,.pull{margin-top:-28px}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:14px}
.tile{display:block;background:#fff;border:1px solid var(--line);border-radius:var(--r);padding:16px;text-decoration:none;color:var(--ink);transition:.15s}
.tile:hover{border-color:var(--brand);transform:translateY(-2px)}
.tile b{display:block}.tile span{color:var(--mute);font-size:14px}.tile em{font-style:normal;color:var(--brand-d);font-weight:700}
.row{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:12px}
label{display:block;font-weight:600;font-size:14px;margin:0 0 4px}
input,select{width:100%;font:inherit;padding:10px 12px;border:1px solid #cdd8d4;border-radius:10px;background:#fff}
input:focus,select:focus{outline:2px solid var(--brand);border-color:var(--brand)}
button{font:inherit;font-weight:700;background:var(--brand);color:#fff;border:0;border-radius:10px;padding:11px 18px;cursor:pointer;margin-top:14px}
button:hover{background:var(--brand-d)}button[disabled]{opacity:.6}
.res{margin-top:14px;padding:14px;border-radius:10px;background:#f1f5f3}
.res.low,.res.fair{background:var(--good)}.res.high{background:var(--warn)}.res.very_high,.res.err{background:var(--bad)}
.big{font-size:clamp(26px,5vw,38px);font-weight:800;color:var(--brand-d);margin:4px 0}
table{width:100%;border-collapse:collapse;font-size:15px}
th,td{text-align:left;padding:10px 8px;border-bottom:1px solid var(--line);vertical-align:top}th{color:var(--mute);font-size:13px;text-transform:uppercase;letter-spacing:.03em}
.tag{display:inline-block;font-size:12px;font-weight:700;padding:2px 8px;border-radius:99px;background:#e8f1ee;color:var(--brand-d)}
.note{font-size:14px;color:var(--mute)}
details{border-bottom:1px solid var(--line);padding:10px 0}summary{cursor:pointer;font-weight:700}
footer{margin:40px 0 24px;color:var(--mute);font-size:14px;border-top:1px solid var(--line);padding-top:18px}
footer a{color:var(--mute)}
@media(max-width:600px){nav a{margin-left:12px}th:nth-child(3),td:nth-child(3){display:none}}
`;

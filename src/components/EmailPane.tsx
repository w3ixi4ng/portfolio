import { useState } from 'react'
import { profile } from '../data/profile'

export function EmailPane() {
  const [subject, setSubject] = useState('')
  const [body,    setBody]    = useState('')

  function handleSend() {
    const mailto = `mailto:${profile.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    window.open(mailto, '_blank')
  }

  return (
    <div className="email-body">
      <div className="email-toolbar">
        <button className="email-send-btn" onClick={handleSend} disabled={!subject && !body}>
          Send
        </button>
      </div>

      <div className="email-fields">
        <div className="email-field">
          <span className="email-field-label">To</span>
          <span className="email-field-value">{profile.email}</span>
        </div>
        <div className="email-field">
          <span className="email-field-label">From</span>
          <input
            className="email-field-input"
            placeholder="your@email.com"
          />
        </div>
        <div className="email-field">
          <span className="email-field-label">Subject</span>
          <input
            className="email-field-input"
            placeholder="Subject"
            value={subject}
            onChange={e => setSubject(e.target.value)}
          />
        </div>
      </div>

      <div className="email-divider" />

      <textarea
        className="email-compose"
        placeholder={`Hi Wei Xiang,\n\n`}
        value={body}
        onChange={e => setBody(e.target.value)}
      />
    </div>
  )
}

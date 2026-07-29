const socialNetworks = [
  { key: 'facebook', label: 'Facebook', Icon: FacebookIcon, styles: 'bg-[#1877f2] hover:bg-[#1268d3]' },
]

function AgentSocialLinks({ socials, compact = false }) {
  const available = socialNetworks.filter(({ key }) => isSafeSocialUrl(socials?.[key]))

  if (available.length === 0) return null

  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {available.map(({ key, label, Icon, styles }) => (
        <a
          key={key}
          href={socials[key]}
          target="_blank"
          rel="noreferrer noopener"
          aria-label={`Open ${label} profile`}
          title={label}
          className={`inline-flex h-10 items-center justify-center gap-2 rounded-xl px-3 text-xs font-bold text-white shadow-sm transition ${styles} ${compact ? 'flex-1' : ''}`}
        >
          <Icon />
          {!compact && <span>{label}</span>}
        </a>
      ))}
    </div>
  )
}

export function FacebookIcon({ className = 'h-4 w-4' }) {
  return <svg viewBox="0 0 24 24" aria-hidden="true" className={`${className} fill-current`}><path d="M13.7 22v-8.9h3l.45-3.47H13.7V7.42c0-1 .28-1.69 1.72-1.69h1.84V2.62c-.32-.04-1.41-.14-2.69-.14-2.66 0-4.48 1.62-4.48 4.61v2.54H7.08v3.47h3.01V22h3.61Z" /></svg>
}

function isSafeSocialUrl(value) {
  if (!value) return false

  try {
    const url = new URL(value)
    return url.protocol === 'https:' || url.protocol === 'http:'
  } catch {
    return false
  }
}

export default AgentSocialLinks

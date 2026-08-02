const icons = {
  identity: (
    <>
      <rect x="5" y="5" width="14" height="14" rx="3" />
      <path d="M9 9h6v6H9z" />
      <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
    </>
  ),
  digital: (
    <>
      <path d="M4 6.5 12 2l8 4.5v11L12 22l-8-4.5z" />
      <path d="m4 6.5 8 4.5 8-4.5M12 11v11" />
      <path d="m8 8.7 8-4.4" />
    </>
  ),
  campaign: (
    <>
      <path d="M5 16.5V8l10-4v16L5 16.5Z" />
      <path d="M15 8.5c2.5 0 4 1.4 4 3.5s-1.5 3.5-4 3.5" />
      <path d="m7 17 1 4h3l-1.4-3.1" />
    </>
  ),
  partnership: (
    <>
      <path d="M8.5 12.5 5 16l-3-3 5-5 3 3" />
      <path d="m15.5 11.5 3.5-3.5 3 3-5 5-3-3" />
      <path d="m8.5 15.5 7-7" />
      <path d="m9.5 8.5 6 6" />
    </>
  ),
}

export default function ExpertiseIcon({ name }) {
  return (
    <svg
      aria-hidden="true"
      className="expertise-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {icons[name]}
    </svg>
  )
}

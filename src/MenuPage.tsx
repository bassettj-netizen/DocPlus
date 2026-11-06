const groups = [
  {
    title: 'Bulk Approvals',
    items: [
      { label: 'Button - List - Filter', path: '/bulk-approvals/version-1' },
      { label: 'Button List', path: '/bulk-approvals/version-2' },
      { label: 'Collapsible', path: '/bulk-approvals/version-3' },
      { label: 'Dropdown', path: '/bulk-approvals/version-4' },
      { label: 'List - Dropdown filters', path: '/bulk-approvals/version-5' },
      { label: 'Collapsible - Dropdown filters', path: '/bulk-approvals/version-6' },
      { label: 'Collapsible Tree', path: '/bulk-approvals/version-7' },
      { label: 'Button Tree', path: '/bulk-approvals/version-8' },
      { label: 'Approvals 1', path: '/bulk-approvals/approvals-1' },
      { label: 'Approvals 2', path: '/bulk-approvals/approvals-2' },
      { label: 'Approvals 3', path: '/bulk-approvals/approvals-3' },
      { label: 'Approvals 4', path: '/bulk-approvals/approvals-4' },
      { label: 'Approvals 5', path: '/bulk-approvals/approvals-5' },
    ],
  },
  {
    title: 'Back Office',
    items: [
      { label: 'Legal Changes', path: '/back-office/legal-changes' },
      { label: 'Change Log', path: '/back-office/change-log' },
      { label: 'Updates', path: '/back-office/updates' },
    ],
  },
  {
    title: 'In-app notifications',
    items: [
      { label: 'Notifications popover', path: '/in-app-notifications/version-1' },
      { label: 'Quick mark as read', path: '/in-app-notifications/version-2' },
      { label: 'Select to mark as read', path: '/in-app-notifications/version-3' },
      { label: 'Mark as read button', path: '/in-app-notifications/version-4' },
    ],
  },
  {
    title: 'Archiving',
    items: [
      { label: 'Archive button', path: '/archiving/version-1' },
      { label: 'Finish button', path: '/archiving/version-2' },
      { label: 'Bottom toolbar', path: '/archiving/version-3' },
      { label: 'Export then archive', path: '/archiving/version-4' },
      { label: 'No setup steps', path: '/archiving/version-5' },
      { label: 'Finish when saved', path: '/archiving/version-6' },
      { label: 'Archive with export', path: '/archiving/version-7' },
      { label: 'Done or archive', path: '/archiving/version-8' },
      { label: 'Finished header', path: '/archiving/version-9' },
      { label: 'Auto-archive on Done', path: '/archiving/version-10' },
      { label: 'Open and archived', path: '/archiving/version-11' },
      { label: 'Export panel', path: '/archiving/version-12' },
      { label: 'Bulk export', path: '/archiving/version-13' },
      { label: 'Archiving as upgrade', path: '/archiving/version-14' },
      { label: 'No archiving', path: '/archiving/version-15' },
    ],
  },
]

export default function MenuPage() {
  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h1 style={styles.heading}>UI Versions</h1>
        <div style={styles.grid}>
          {groups.map((group) => (
            <div key={group.title} style={styles.card}>
              <h2 style={styles.cardTitle}>{group.title}</h2>
              <ul style={styles.list}>
                {group.items.map((item) => (
                  <li key={item.path}>
                    <a href={item.path} style={styles.link}>
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
    fontFamily: "'Open Sans', sans-serif",
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 24px',
  },
  container: {
    width: '100%',
    maxWidth: '720px',
  },
  heading: {
    fontSize: '28px',
    fontWeight: 600,
    color: '#1a1a1a',
    marginBottom: '32px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '16px',
  },
  card: {
    backgroundColor: '#ffffff',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    padding: '20px 24px',
  },
  cardTitle: {
    fontSize: '13px',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    color: '#888',
    marginBottom: '12px',
  },
  list: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  link: {
    display: 'block',
    fontSize: '15px',
    color: '#0066cc',
    textDecoration: 'none',
    padding: '4px 0',
  },
}

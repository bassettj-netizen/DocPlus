import { Typography, constants } from '@goat-ui/goat-ui-core'

const { fontSize, fontWeight } = constants

function HomePage() {
  return (
    <div style={{ padding: 24 }}>
      <Typography as="h1" size={fontSize.HEADING_XL} weight={fontWeight.BOLD}>
        Welcome to My App 2
      </Typography>
      <Typography>
        This is a clean starting point wired up with the GOAT-UI design system. Start building your pages here.
      </Typography>
    </div>
  )
}

export default HomePage

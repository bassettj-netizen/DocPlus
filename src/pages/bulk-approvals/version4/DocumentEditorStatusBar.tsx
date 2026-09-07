import { Chip, chipStyles, constants, iconType } from '@goat-ui/goat-ui-core'

const { colorPalette } = constants

export default function DocumentEditorStatusBar() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '8px 0', backgroundColor: colorPalette.orange.lighten5 }}>
      <Chip label="In progress" chipStyle={chipStyles.ACCENT_ORANGE} leftIcon={iconType.PieChartOutlined} uppercase />
    </div>
  )
}

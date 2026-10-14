import DefaultTheme from 'vitepress/theme'
import { enhanceTables } from './enhance-tables'
import { enhanceLayout } from './enhance-layout'
import './layout.css'
import './tables.css'

export default {
  extends: DefaultTheme,
  setup() {
    enhanceTables()
    enhanceLayout()
  },
}

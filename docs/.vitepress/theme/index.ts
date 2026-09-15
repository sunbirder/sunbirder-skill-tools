import DefaultTheme from 'vitepress/theme'
import { enhanceTables } from './enhance-tables'
import './custom.css'

export default {
  extends: DefaultTheme,
  setup() {
    enhanceTables()
  },
}

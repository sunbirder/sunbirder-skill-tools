// 面板显隐开关：顶栏「侧栏 / 大纲」按钮组
// 写 html 类，布局规则见 layout.css（三、四、五节）；纯原生 JS 无依赖
// 由主题 setup() 调用一次；仅桌面端显示按钮（<960px 侧栏是抽屉、大纲本就不显示）

const SIDEBAR_KEY = 'vp-layout-sidebar'
const ASIDE_KEY = 'vp-layout-aside'

export function enhanceLayout(): void {
  if (typeof document === 'undefined') return

  // 恢复用户上次的偏好（localStorage；默认：侧栏开、大纲收）
  if (localStorage.getItem(SIDEBAR_KEY) === '0') {
    document.documentElement.classList.add('vp-sidebar-collapsed')
  }
  if (localStorage.getItem(ASIDE_KEY) === '1') {
    document.documentElement.classList.add('vp-aside-open')
  }

  // setup() 在 Vue 组件 setup 阶段同步执行，此时 NavBar 尚未挂载（实测：
  // document 里还没有 .VPNavBar）——必须等 DOM 出现后再插按钮，不能直接查
  const tryMount = (): boolean => {
    const nav = document.querySelector('.VPNavBar .content .content-body')
    if (!nav) return false
    mountToggles(nav)
    return true
  }
  if (tryMount()) return
  const observer = new MutationObserver(() => {
    if (tryMount()) observer.disconnect()
  })
  observer.observe(document.body, { childList: true, subtree: true })
}

function mountToggles(nav: Element): void {
  // 已挂载则不重复（SPA 热更新保护）
  if (document.querySelector('.vp-layout-toggles')) return

  const wrap = document.createElement('div')
  wrap.className = 'vp-layout-toggles'
  wrap.style.cssText =
    'display:none;align-items:center;gap:4px;margin-right:auto;margin-left:8px;'

  const makeBtn = (label: string, active: () => boolean, toggle: () => void): HTMLButtonElement => {
    const btn = document.createElement('button')
    btn.type = 'button'
    btn.className = 'vp-layout-toggle-btn'
    btn.textContent = label
    btn.style.cssText =
      'font-size:12px;line-height:1;padding:4px 8px;border:1px solid var(--vp-c-divider);' +
      'border-radius:6px;background:transparent;color:var(--vp-c-text-3);cursor:pointer;' +
      'white-space:nowrap;transition:color .25s,border-color .25s;'
    const paint = (): void => {
      // active = 面板当前展开
      const on = active()
      btn.style.color = on ? 'var(--vp-c-brand-1)' : 'var(--vp-c-text-3)'
      btn.style.borderColor = on ? 'var(--vp-c-brand-1)' : 'var(--vp-c-divider)'
      btn.style.background = on ? 'var(--vp-c-brand-soft)' : 'transparent'
    }
    btn.addEventListener('click', (): void => {
      toggle()
      paint()
    })
    paint()
    return btn
  }

  const root = document.documentElement
  wrap.appendChild(
    makeBtn(
      '侧栏',
      () => !root.classList.contains('vp-sidebar-collapsed'),
      () => {
        const collapsed = root.classList.toggle('vp-sidebar-collapsed')
        localStorage.setItem(SIDEBAR_KEY, collapsed ? '0' : '1')
      }
    )
  )
  wrap.appendChild(
    makeBtn(
      '大纲',
      () => root.classList.contains('vp-aside-open'),
      () => {
        const open = root.classList.toggle('vp-aside-open')
        localStorage.setItem(ASIDE_KEY, open ? '1' : '0')
      }
    )
  )

  // 按钮组插在导航左侧（margin-right:auto 推开右侧内容），仅桌面端显示
  const mq = window.matchMedia('(min-width: 960px)')
  const apply = (): void => {
    wrap.style.display = mq.matches ? 'inline-flex' : 'none'
  }
  apply()
  mq.addEventListener('change', apply)

  nav.insertBefore(wrap, nav.firstChild)
}

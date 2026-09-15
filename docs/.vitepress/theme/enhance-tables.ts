// 表格客户端增强：横滚包裹 + 悬浮放大按钮 + 全屏弹窗
// 由主题 setup() 调用一次；SPA 路由切换后新表格由 MutationObserver 自动补齐
// 纯原生 JS，无依赖；样式见同目录 custom.css

export function enhanceTables(): void {
  if (typeof document === 'undefined') return

  let overlay: HTMLDivElement | null = null
  let lastTrigger: HTMLButtonElement | null = null

  const closeOverlay = (): void => {
    if (!overlay) return
    overlay.classList.remove('is-open')
    document.body.classList.remove('vp-table-locked')
    const body = overlay.querySelector('.vp-table-overlay-body')
    if (body) body.innerHTML = ''
    if (lastTrigger) {
      lastTrigger.focus()
      lastTrigger = null
    }
  }

  const ensureOverlay = (): HTMLDivElement => {
    if (overlay) return overlay
    overlay = document.createElement('div')
    overlay.className = 'vp-table-overlay'
    overlay.innerHTML =
      '<div class="vp-table-overlay-panel" role="dialog" aria-modal="true" aria-label="表格最大化视图">' +
      '<button type="button" class="vp-table-overlay-close" aria-label="关闭">✕</button>' +
      '<div class="vp-table-overlay-body"></div>' +
      '</div>'
    document.body.appendChild(overlay)
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeOverlay()
    })
    overlay
      .querySelector('.vp-table-overlay-close')!
      .addEventListener('click', closeOverlay)
    return overlay
  }

  const openOverlay = (
    table: HTMLTableElement,
    trigger: HTMLButtonElement,
  ): void => {
    const o = ensureOverlay()
    lastTrigger = trigger
    const body = o.querySelector('.vp-table-overlay-body')!
    body.innerHTML = ''
    body.appendChild(table.cloneNode(true))
    o.classList.add('is-open')
    document.body.classList.add('vp-table-locked')
    o.querySelector<HTMLElement>('.vp-table-overlay-close')!.focus()
  }

  const wrapTable = (table: HTMLTableElement): void => {
    const wrapper = document.createElement('div')
    wrapper.className = 'vp-table-scroll'
    table.parentNode!.insertBefore(wrapper, table)
    wrapper.appendChild(table)

    const btn = document.createElement('button')
    btn.type = 'button'
    btn.className = 'vp-table-max-btn'
    btn.setAttribute('aria-label', '最大化表格')
    btn.textContent = '⤢'
    btn.addEventListener('click', () => openOverlay(table, btn))
    wrapper.appendChild(btn)
  }

  const scan = (): void => {
    document.querySelectorAll<HTMLTableElement>('.vp-doc table').forEach((t) => {
      if (t.dataset.enhanced) return
      t.dataset.enhanced = 'true'
      wrapTable(t)
    })
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeOverlay()
  })

  scan()
  // MutationObserver 回调由平台按微任务批量合并，扫描直接同步执行即可；
  // 不用 rAF 去抖——后台/非激活 tab 的 rAF 会被节流甚至不触发，导致漏扫描
  const observer = new MutationObserver(() => scan())
  observer.observe(document.body, { childList: true, subtree: true })
}

function makeCanvas(w, h) {
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  return { canvas, ctx }
}

function hexAlpha(hex, a) {
  const n = hex.replace('#', '')
  const r = parseInt(n.slice(0, 2), 16)
  const g = parseInt(n.slice(2, 4), 16)
  const b = parseInt(n.slice(4, 6), 16)
  return `rgba(${r},${g},${b},${a})`
}

export function dialTexture(colors) {
  const ink = colors.background
  const steel = colors.muted
  const gold = colors.primary
  const paper = colors.foreground
  const size = 2048
  const { canvas, ctx } = makeCanvas(size, size)
  const cx = size / 2
  const cy = size / 2

  ctx.fillStyle = ink
  ctx.fillRect(0, 0, size, size)

  const rays = 520
  for (let i = 0; i < rays; i += 1) {
    const a = (i / rays) * Math.PI * 2
    const lobe = 0.42 + 0.58 * Math.max(0, Math.cos(a - 0.85))
    ctx.strokeStyle = i % 3 === 0 ? hexAlpha(gold, 0.06 + lobe * 0.28) : hexAlpha(paper, 0.03 + lobe * 0.14)
    ctx.lineWidth = i % 2 === 0 ? 3.2 : 2.2
    ctx.beginPath()
    ctx.moveTo(cx, cy)
    ctx.lineTo(cx + Math.cos(a) * size * 0.52, cy + Math.sin(a) * size * 0.52)
    ctx.stroke()
  }

  const hot = ctx.createRadialGradient(cx - size * 0.08, cy - size * 0.12, size * 0.02, cx, cy, size * 0.5)
  hot.addColorStop(0, hexAlpha(paper, 0.2))
  hot.addColorStop(0.22, hexAlpha(gold, 0.1))
  hot.addColorStop(0.62, hexAlpha(ink, 0.18))
  hot.addColorStop(1, hexAlpha(ink, 0.72))
  ctx.fillStyle = hot
  ctx.fillRect(0, 0, size, size)

  ctx.strokeStyle = gold
  ctx.lineWidth = 7
  ctx.beginPath()
  ctx.arc(cx, cy, size * 0.468, 0, Math.PI * 2)
  ctx.stroke()

  ctx.strokeStyle = hexAlpha(gold, 0.45)
  ctx.lineWidth = 2.2
  ctx.beginPath()
  ctx.arc(cx, cy, size * 0.442, 0, Math.PI * 2)
  ctx.stroke()

  ctx.strokeStyle = hexAlpha(gold, 0.28)
  ctx.lineWidth = 1.6
  ctx.beginPath()
  ctx.arc(cx, cy, size * 0.118, 0, Math.PI * 2)
  ctx.stroke()

  for (let i = 0; i < 60; i += 1) {
    const a = (i / 60) * Math.PI * 2 - Math.PI / 2
    const major = i % 5 === 0
    const inner = size * (major ? 0.405 : 0.418)
    const outer = size * 0.438
    ctx.strokeStyle = gold
    ctx.lineWidth = major ? 3.4 : 1.5
    ctx.beginPath()
    ctx.moveTo(cx + Math.cos(a) * inner, cy + Math.sin(a) * inner)
    ctx.lineTo(cx + Math.cos(a) * outer, cy + Math.sin(a) * outer)
    ctx.stroke()
  }

  ctx.fillStyle = gold
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.font = '500 72px "Outfit", system-ui, sans-serif'
  ctx.fillText('CHRONOS', cx, cy - size * 0.145)

  ctx.fillStyle = paper
  ctx.font = '400 24px "IBM Plex Mono", monospace'
  ctx.fillText('GENÈVE', cx, cy - size * 0.095)

  ctx.fillStyle = hexAlpha(paper, 0.72)
  ctx.font = '400 20px "IBM Plex Mono", monospace'
  ctx.fillText('SWISS MADE', cx, cy + size * 0.295)
  ctx.fillText('21 JEWELS · AUTOMATIC', cx, cy + size * 0.328)

  ctx.fillStyle = hexAlpha(steel, 0.35)
  ctx.beginPath()
  ctx.arc(cx + size * 0.282, cy, size * 0.042, 0, Math.PI * 2)
  ctx.fill()

  return canvas
}

export function casebackTexture(colors) {
  const ink = colors.background
  const gold = colors.primary
  const paper = colors.foreground
  const size = 1024
  const { canvas, ctx } = makeCanvas(size, size)
  const cx = size / 2
  const cy = size / 2

  ctx.fillStyle = '#2c2822'
  ctx.fillRect(0, 0, size, size)

  for (let i = 0; i < 90; i += 1) {
    ctx.strokeStyle = i % 2 === 0 ? hexAlpha(gold, 0.05) : hexAlpha(ink, 0.18)
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.arc(cx, cy, 8 + i * 5.2, 0, Math.PI * 2)
    ctx.stroke()
  }

  ctx.strokeStyle = gold
  ctx.lineWidth = 8
  ctx.beginPath()
  ctx.arc(cx, cy, size * 0.46, 0, Math.PI * 2)
  ctx.stroke()

  ctx.strokeStyle = hexAlpha(gold, 0.4)
  ctx.lineWidth = 2.4
  ctx.beginPath()
  ctx.arc(cx, cy, size * 0.28, 0, Math.PI * 2)
  ctx.stroke()

  ctx.fillStyle = gold
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.font = '500 40px "Outfit", system-ui, sans-serif'
  ctx.fillText('CHRONOS', cx, cy - 74)
  ctx.font = '400 17px "IBM Plex Mono", monospace'
  ctx.fillStyle = paper
  ctx.fillText('GENÈVE  ·  18K', cx, cy - 32)
  ctx.fillText('CAL. 391  ·  21 JEWELS', cx, cy + 8)
  ctx.fillStyle = hexAlpha(paper, 0.7)
  ctx.fillText('CH–391–0007', cx, cy + 48)
  ctx.fillText('WATER RESISTANT 50M', cx, cy + 80)

  ctx.strokeStyle = ink
  ctx.lineWidth = 3
  for (let i = 0; i < 8; i += 1) {
    const a = (i / 8) * Math.PI * 2
    ctx.beginPath()
    ctx.arc(cx + Math.cos(a) * size * 0.38, cy + Math.sin(a) * size * 0.38, 12, 0, Math.PI * 2)
    ctx.stroke()
  }

  return canvas
}

export function genevaTexture(colors) {
  const gold = colors.primary
  const ink = colors.background
  const paper = colors.foreground
  const { canvas, ctx } = makeCanvas(512, 256)
  ctx.fillStyle = gold
  ctx.fillRect(0, 0, 512, 256)
  for (let i = -6; i < 20; i += 1) {
    const g = ctx.createLinearGradient(i * 34, 0, i * 34 + 90, 256)
    g.addColorStop(0, i % 2 === 0 ? hexAlpha(paper, 0.22) : hexAlpha(ink, 0.18))
    g.addColorStop(0.5, hexAlpha(gold, 0.05))
    g.addColorStop(1, i % 2 === 0 ? hexAlpha(ink, 0.2) : hexAlpha(paper, 0.14))
    ctx.fillStyle = g
    ctx.beginPath()
    ctx.moveTo(i * 34, 0)
    ctx.lineTo(i * 34 + 92, 0)
    ctx.lineTo(i * 34 + 38, 256)
    ctx.lineTo(i * 34 - 54, 256)
    ctx.closePath()
    ctx.fill()
  }
  return canvas
}

export function perlageTexture(colors) {
  const ink = colors.background
  const gold = colors.secondary
  const paper = colors.foreground
  const { canvas, ctx } = makeCanvas(1024, 1024)
  ctx.fillStyle = gold
  ctx.fillRect(0, 0, 1024, 1024)
  const step = 42
  for (let y = 0; y < 1024 + step; y += step) {
    const offset = ((y / step) % 2) * (step / 2)
    for (let x = -step; x < 1024 + step; x += step) {
      const g = ctx.createRadialGradient(x + offset - 4, y - 4, 1, x + offset, y, 20)
      g.addColorStop(0, hexAlpha(paper, 0.22))
      g.addColorStop(0.45, gold)
      g.addColorStop(1, hexAlpha(ink, 0.38))
      ctx.fillStyle = g
      ctx.beginPath()
      ctx.arc(x + offset, y, 20, 0, Math.PI * 2)
      ctx.fill()
    }
  }
  return canvas
}

export function dateTexture(colors) {
  const { canvas, ctx } = makeCanvas(256, 256)
  ctx.fillStyle = colors.foreground
  ctx.fillRect(0, 0, 256, 256)
  ctx.fillStyle = hexAlpha(colors.background, 0.06)
  for (let y = 0; y < 256; y += 3) {
    ctx.fillRect(0, y, 256, 1)
  }
  ctx.fillStyle = colors.background
  ctx.font = '700 132px "Outfit", system-ui, sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('07', 128, 136)
  return canvas
}

export function leatherTexture(colors) {
  const ink = colors.background
  const steel = colors.muted
  const gold = colors.primary
  const paper = colors.foreground
  const { canvas, ctx } = makeCanvas(1024, 1024)
  ctx.fillStyle = steel
  ctx.fillRect(0, 0, 1024, 1024)
  ctx.fillStyle = hexAlpha(gold, 0.18)
  ctx.fillRect(0, 0, 1024, 1024)

  for (let i = 0; i < 3200; i += 1) {
    const x = (i * 73) % 1024
    const y = (i * 41 + (i % 17) * 13) % 1024
    const s = 5 + (i % 8)
    ctx.fillStyle = i % 4 === 0 ? hexAlpha(ink, 0.28) : hexAlpha(paper, 0.08)
    ctx.beginPath()
    ctx.ellipse(x, y, s, s * 0.5, (i % 12) * 0.4, 0, Math.PI * 2)
    ctx.fill()
  }

  ctx.strokeStyle = hexAlpha(gold, 0.18)
  ctx.lineWidth = 2
  const inset = 48
  for (const y of [inset, 1024 - inset]) {
    ctx.beginPath()
    ctx.moveTo(40, y)
    ctx.lineTo(984, y)
    ctx.stroke()
    for (let x = 56; x < 980; x += 18) {
      ctx.fillStyle = hexAlpha(gold, 0.35)
      ctx.beginPath()
      ctx.arc(x, y, 2.2, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  return canvas
}

export function leatherBump() {
  const { canvas, ctx } = makeCanvas(512, 512)
  ctx.fillStyle = '#808080'
  ctx.fillRect(0, 0, 512, 512)
  for (let i = 0; i < 1800; i += 1) {
    const x = (i * 97) % 512
    const y = (i * 53) % 512
    const v = 90 + (i % 80)
    ctx.fillStyle = `rgb(${v},${v},${v})`
    ctx.beginPath()
    ctx.ellipse(x, y, 5, 3, i * 0.3, 0, Math.PI * 2)
    ctx.fill()
  }
  return canvas
}

export function shadowTexture() {
  const { canvas, ctx } = makeCanvas(512, 512)
  const g = ctx.createRadialGradient(256, 256, 40, 256, 256, 250)
  g.addColorStop(0, 'rgba(0,0,0,0.7)')
  g.addColorStop(0.45, 'rgba(0,0,0,0.28)')
  g.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 512, 512)
  return canvas
}

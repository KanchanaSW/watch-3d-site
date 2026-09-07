function makeCanvas(w, h) {
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  return { canvas, ctx }
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

  const rays = 180
  for (let i = 0; i < rays; i += 1) {
    const a = (i / rays) * Math.PI * 2
    ctx.strokeStyle = i % 2 === 0 ? `${gold}18` : `${steel}cc`
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.moveTo(cx, cy)
    ctx.lineTo(cx + Math.cos(a) * size * 0.5, cy + Math.sin(a) * size * 0.5)
    ctx.stroke()
  }

  const vignette = ctx.createRadialGradient(cx, cy, size * 0.08, cx, cy, size * 0.5)
  vignette.addColorStop(0, `${ink}00`)
  vignette.addColorStop(0.7, `${ink}40`)
  vignette.addColorStop(1, `${ink}aa`)
  ctx.fillStyle = vignette
  ctx.fillRect(0, 0, size, size)

  ctx.strokeStyle = gold
  ctx.lineWidth = 5
  ctx.beginPath()
  ctx.arc(cx, cy, size * 0.468, 0, Math.PI * 2)
  ctx.stroke()

  ctx.strokeStyle = `${gold}66`
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.arc(cx, cy, size * 0.442, 0, Math.PI * 2)
  ctx.stroke()

  ctx.strokeStyle = `${gold}33`
  ctx.lineWidth = 1.4
  ctx.beginPath()
  ctx.arc(cx, cy, size * 0.12, 0, Math.PI * 2)
  ctx.stroke()

  ctx.fillStyle = gold
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.font = '500 78px "Outfit", system-ui, sans-serif'
  ctx.fillText('CHRONOS', cx, cy - size * 0.14)

  ctx.fillStyle = paper
  ctx.font = '400 26px "IBM Plex Mono", monospace'
  ctx.fillText('GENÈVE', cx, cy - size * 0.09)

  ctx.fillStyle = `${paper}99`
  ctx.font = '400 22px "IBM Plex Mono", monospace'
  ctx.fillText('SWISS MADE', cx, cy + size * 0.3)
  ctx.fillText('21 JEWELS · AUTOMATIC', cx, cy + size * 0.335)

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

  ctx.fillStyle = '#3a342c'
  ctx.fillRect(0, 0, size, size)

  ctx.strokeStyle = gold
  ctx.lineWidth = 10
  ctx.beginPath()
  ctx.arc(cx, cy, size * 0.46, 0, Math.PI * 2)
  ctx.stroke()

  ctx.strokeStyle = `${gold}55`
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.arc(cx, cy, size * 0.28, 0, Math.PI * 2)
  ctx.stroke()

  ctx.fillStyle = gold
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.font = '500 42px "Outfit", system-ui, sans-serif'
  ctx.fillText('CHRONOS', cx, cy - 70)
  ctx.font = '400 18px "IBM Plex Mono", monospace'
  ctx.fillStyle = paper
  ctx.fillText('GENÈVE  ·  18K', cx, cy - 28)
  ctx.fillText('CAL. 391  ·  21 JEWELS', cx, cy + 12)
  ctx.fillStyle = `${paper}99`
  ctx.fillText('CH–391–0007', cx, cy + 52)
  ctx.fillText('WATER RESISTANT 50M', cx, cy + 84)

  ctx.strokeStyle = ink
  ctx.lineWidth = 4
  for (let i = 0; i < 8; i += 1) {
    const a = (i / 8) * Math.PI * 2
    ctx.beginPath()
    ctx.arc(cx + Math.cos(a) * size * 0.38, cy + Math.sin(a) * size * 0.38, 14, 0, Math.PI * 2)
    ctx.stroke()
  }

  return canvas
}

export function genevaTexture(colors) {
  const gold = colors.primary
  const ink = colors.background
  const { canvas, ctx } = makeCanvas(512, 256)
  ctx.fillStyle = gold
  ctx.fillRect(0, 0, 512, 256)
  for (let i = -4; i < 18; i += 1) {
    ctx.fillStyle = i % 2 === 0 ? `${ink}22` : 'rgba(255,255,255,0.12)'
    ctx.beginPath()
    ctx.moveTo(i * 36, 0)
    ctx.lineTo(i * 36 + 80, 0)
    ctx.lineTo(i * 36 + 28, 256)
    ctx.lineTo(i * 36 - 52, 256)
    ctx.closePath()
    ctx.fill()
  }
  return canvas
}

export function perlageTexture(colors) {
  const ink = colors.background
  const gold = colors.secondary
  const { canvas, ctx } = makeCanvas(1024, 1024)
  ctx.fillStyle = gold
  ctx.fillRect(0, 0, 1024, 1024)
  const step = 46
  for (let y = 0; y < 1024 + step; y += step) {
    const offset = ((y / step) % 2) * (step / 2)
    for (let x = -step; x < 1024 + step; x += step) {
      const g = ctx.createRadialGradient(x + offset, y, 2, x + offset, y, 22)
      g.addColorStop(0, 'rgba(255,255,255,0.16)')
      g.addColorStop(0.55, `${gold}`)
      g.addColorStop(1, `${ink}55`)
      ctx.fillStyle = g
      ctx.beginPath()
      ctx.arc(x + offset, y, 22, 0, Math.PI * 2)
      ctx.fill()
    }
  }
  return canvas
}

export function dateTexture(colors) {
  const { canvas, ctx } = makeCanvas(256, 256)
  ctx.fillStyle = colors.foreground
  ctx.fillRect(0, 0, 256, 256)
  ctx.fillStyle = colors.background
  ctx.font = '700 140px "Outfit", system-ui, sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('07', 128, 138)
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

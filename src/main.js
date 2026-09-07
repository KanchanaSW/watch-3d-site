import * as THREE from 'three'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import { siteConfig } from './config/site.js'
import { applyExplosion, buildSubject } from './subject.js'
import { shadowTexture } from './textures.js'

gsap.registerPlugin(ScrollTrigger)
if ('scrollRestoration' in history) history.scrollRestoration = 'manual'

const colors = siteConfig.colors
const CHAPTERS = siteConfig.chapters
const CALLOUTS = siteConfig.callouts

function applyTokens() {
  const root = document.documentElement
  root.style.setProperty('--ink', colors.background)
  root.style.setProperty('--steel', colors.muted)
  root.style.setProperty('--ember', colors.primary)
  root.style.setProperty('--paper', colors.foreground)
  const fg = colors.foreground
  root.style.setProperty('--paper-dim', `color-mix(in srgb, ${fg} 55%, transparent)`)
  root.style.setProperty('--paper-faint', `color-mix(in srgb, ${fg} 18%, transparent)`)
  document.title = siteConfig.title
  const desc = document.querySelector('meta[name="description"]')
  if (desc) desc.setAttribute('content', siteConfig.tagline)
}

applyTokens()

const ui = {
  mark: document.querySelector('[data-ui="mark"]'),
  wordmark: document.querySelector('[data-ui="wordmark"]'),
  badge: document.querySelector('[data-ui="badge"]'),
  hero: document.querySelector('[data-ui="hero"]'),
  eyebrow: document.querySelector('[data-ui="eyebrow"]'),
  headline: document.querySelector('[data-ui="headline"]'),
  subtitle: document.querySelector('[data-ui="subtitle"]'),
  lede: document.querySelector('[data-ui="lede"]'),
  chapter: document.querySelector('[data-ui="chapter"]'),
  index: document.querySelector('[data-ui="index"]'),
  title: document.querySelector('[data-ui="title"]'),
  kicker: document.querySelector('[data-ui="kicker"]'),
  copy: document.querySelector('[data-ui="copy"]'),
  body: document.querySelector('[data-ui="body"]'),
  facts: document.querySelector('[data-ui="facts"]'),
  hint: document.querySelector('[data-ui="hint"]'),
  hintLabel: document.querySelector('[data-ui="hint-label"]'),
  colophon: document.querySelector('[data-ui="colophon"]'),
  colophonTitle: document.querySelector('[data-ui="colophon-title"]'),
  colophonFine: document.querySelector('[data-ui="colophon-fine"]'),
  colophonNote: document.querySelector('[data-ui="colophon-note"]'),
  callouts: document.querySelector('[data-ui="callouts"]'),
  rail: document.querySelector('[data-ui="rail"]'),
}

ui.mark.textContent = siteConfig.mark
ui.wordmark.textContent = siteConfig.wordmark
ui.badge.textContent = siteConfig.badge
ui.eyebrow.textContent = siteConfig.hero.eyebrow
ui.headline.textContent = siteConfig.hero.headline
ui.subtitle.textContent = siteConfig.hero.subtitle
ui.lede.textContent = siteConfig.hero.lede
ui.hintLabel.textContent = siteConfig.hint
ui.colophonTitle.textContent = siteConfig.colophon.title
ui.colophonFine.textContent = siteConfig.colophon.fine
ui.colophonNote.textContent = siteConfig.colophon.note

const canvas = document.querySelector('#gl')
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  alpha: false,
  powerPreference: 'high-performance',
})
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.outputColorSpace = THREE.SRGBColorSpace
renderer.toneMapping = THREE.ACESFilmicToneMapping
renderer.toneMappingExposure = 1.05
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap

const scene = new THREE.Scene()
scene.background = new THREE.Color(colors.background)
scene.fog = new THREE.Fog(colors.background, 7.5, 16)

const camera = new THREE.PerspectiveCamera(32, window.innerWidth / window.innerHeight, 0.1, 40)
const camStart = new THREE.Vector3()
const camMid = new THREE.Vector3()
const camEnd = new THREE.Vector3()
const lookStart = new THREE.Vector3(0, 0.05, 0.02)
const lookEnd = new THREE.Vector3(0, 0.12, 0)

function setCameraRigs() {
  const mobile = window.innerWidth < 860
  if (mobile) {
    camStart.set(1.35, 2.35, 3.55)
    camMid.set(0.2, 2.9, 3.7)
    camEnd.set(-1.55, 3.2, 3.05)
  } else {
    camStart.set(2.05, 1.85, 3.25)
    camMid.set(0.35, 2.55, 3.45)
    camEnd.set(-2.15, 2.95, 2.55)
  }
}
setCameraRigs()
camera.position.copy(camStart)

const pmrem = new THREE.PMREMGenerator(renderer)
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
scene.environmentIntensity = 0.55

scene.add(new THREE.HemisphereLight(colors.foreground, colors.background, 0.55))

const keyLight = new THREE.DirectionalLight(colors.foreground, 1.35)
keyLight.position.set(3.2, 5.2, 2.4)
keyLight.castShadow = true
keyLight.shadow.mapSize.set(2048, 2048)
keyLight.shadow.camera.near = 1
keyLight.shadow.camera.far = 16
keyLight.shadow.camera.left = -4
keyLight.shadow.camera.right = 4
keyLight.shadow.camera.top = 4
keyLight.shadow.camera.bottom = -4
keyLight.shadow.bias = -0.00025
scene.add(keyLight)

const rim = new THREE.DirectionalLight(colors.primary, 1.7)
rim.position.set(-3.4, 1.8, -2.6)
scene.add(rim)

const fill = new THREE.DirectionalLight(colors.foreground, 0.28)
fill.position.set(-2.2, 2.4, 3.2)
scene.add(fill)

const underglow = new THREE.PointLight(colors.primary, 2.4, 4.5, 1.6)
underglow.position.set(0, -0.15, 0)
scene.add(underglow)

let subject = null

const shadowMap = new THREE.CanvasTexture(shadowTexture())
const shadow = new THREE.Mesh(
  new THREE.PlaneGeometry(6.2, 3.4),
  new THREE.MeshBasicMaterial({
    map: shadowMap,
    transparent: true,
    opacity: 0.55,
    depthWrite: false,
  }),
)
shadow.rotation.x = -Math.PI / 2
shadow.position.y = -0.13
scene.add(shadow)

const pointer = new THREE.Vector2(0, 0)
window.addEventListener(
  'pointermove',
  (event) => {
    pointer.x = (event.clientX / window.innerWidth) * 2 - 1
    pointer.y = (event.clientY / window.innerHeight) * 2 - 1
  },
  { passive: true },
)

const calloutEls = CALLOUTS.map((item) => {
  const el = document.createElement('div')
  el.className = 'callout'
  el.innerHTML = `<span class="callout-name">${item.name}</span><span class="callout-rule"></span><span class="callout-note">${item.note}</span>`
  ui.callouts.appendChild(el)
  return { ...item, el }
})

ui.rail.innerHTML = CHAPTERS.map(
  (chapter, i) =>
    `<li><button type="button" data-chapter="${i}"><span>${chapter.title}</span></button></li>`,
).join('')

const railButtons = [...ui.rail.querySelectorAll('button')]

let currentChapter = -1

function setChapter(index) {
  if (index === currentChapter && ui.chapter.classList.contains('is-on')) return
  currentChapter = index
  const chapter = CHAPTERS[index]
  ui.index.textContent = chapter.index
  ui.title.textContent = chapter.title
  ui.kicker.textContent = chapter.kicker
  ui.copy.textContent = chapter.copy
  ui.body.textContent = chapter.body
  ui.facts.innerHTML = chapter.facts.map((fact) => `<li>${fact}</li>`).join('')
  railButtons.forEach((btn, i) => btn.classList.toggle('is-current', i === index))
}

function chapterFromProgress(p) {
  let index = 0
  for (let i = 0; i < CHAPTERS.length; i += 1) {
    if (p >= CHAPTERS[i].at - 0.02) index = i
  }
  return index
}

function projectAnchor(mesh) {
  const pos = new THREE.Vector3()
  mesh.getWorldPosition(pos)
  pos.project(camera)
  return {
    x: (pos.x * 0.5 + 0.5) * window.innerWidth,
    y: (-pos.y * 0.5 + 0.5) * window.innerHeight,
    visible: pos.z < 1,
  }
}

function updateUI(p) {
  ui.hero.classList.toggle('is-away', p > 0.08)
  ui.hint.classList.toggle('is-away', p > 0.1)
  ui.chapter.classList.toggle('is-on', p > 0.1 && p < 0.97)
  ui.colophon.classList.toggle('is-on', p > 0.88)
  setChapter(chapterFromProgress(p))

  if (!subject) return
  for (const item of calloutEls) {
    const on = p >= item.from && p <= item.to
    item.el.classList.toggle('is-on', on)
    const mesh = subject.userData.anchors[item.anchor]
    if (!mesh || !on) continue
    const { x, y, visible } = projectAnchor(mesh)
    item.el.style.left = `${x}px`
    item.el.style.top = `${y}px`
    if (!visible) item.el.classList.remove('is-on')
  }
}

const look = new THREE.Vector3()

function frameFromProgress(p) {
  camera.position.lerpVectors(camStart, camMid, smooth(p * 1.15))
  camera.position.lerp(camEnd, smooth(Math.max(0, p - 0.45) / 0.55))
  camera.position.x += pointer.x * 0.16
  camera.position.y += pointer.y * 0.08
  look.copy(lookStart).lerp(lookEnd, p)
  camera.lookAt(look)
  underglow.intensity = 1.6 + p * 2.2
  shadow.material.opacity = 0.55 - p * 0.22
  if (subject) {
    applyExplosion(subject, p)
    subject.rotation.y = THREE.MathUtils.degToRad(-8) + p * 0.35
  }
  updateUI(p)
}

function smooth(t) {
  const x = THREE.MathUtils.clamp(t, 0, 1)
  return x * x * (3 - 2 * x)
}

function resize() {
  const w = window.innerWidth
  const h = window.innerHeight
  camera.aspect = w / h
  camera.updateProjectionMatrix()
  renderer.setSize(w, h)
  setCameraRigs()
}

window.addEventListener('resize', () => {
  resize()
  ScrollTrigger.refresh()
})

const lenis = new Lenis({
  autoRaf: false,
  lerp: reduced ? 1 : 0.12,
  smoothWheel: !reduced,
})

lenis.on('scroll', ScrollTrigger.update)

const state = { p: reduced ? 1 : 0 }

if (!reduced) {
  gsap.to(state, {
    p: 1,
    ease: 'none',
    scrollTrigger: {
      trigger: '.scroll-track',
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.35,
    },
  })
}

function maxScroll() {
  const track = document.querySelector('.scroll-track')
  return track.offsetHeight - window.innerHeight
}

railButtons.forEach((btn, i) => {
  btn.addEventListener('click', () => {
    lenis.scrollTo(CHAPTERS[i].at * maxScroll(), { duration: reduced ? 0 : 0.9 })
  })
})

window.__goto = (p) => {
  lenis.scrollTo(p * maxScroll(), { immediate: true })
  state.p = p
  frameFromProgress(p)
}

window.__audit = () => {
  let meshes = 0
  let shadowCasters = 0
  const materials = new Set()
  const layers = {}
  if (subject) {
    subject.traverse((obj) => {
      if (!obj.isMesh) return
      meshes += 1
      if (obj.castShadow) shadowCasters += 1
      const mats = Array.isArray(obj.material) ? obj.material : [obj.material]
      for (const m of mats) if (m) materials.add(m.uuid)
    })
    for (const mesh of subject.userData.parts ?? []) {
      const layer = mesh.userData.layer
      if (!layer) continue
      if (!layers[layer]) layers[layer] = { min: Infinity, max: -Infinity, count: 0 }
      layers[layer].min = Math.min(layers[layer].min, mesh.position.y)
      layers[layer].max = Math.max(layers[layer].max, mesh.position.y)
      layers[layer].count += 1
    }
  }
  return {
    meshes,
    shadowCasters,
    materials: materials.size,
    layers,
    p: state.p,
    chapters: CHAPTERS.map((c) => ({ id: c.id, at: c.at })),
    shadowMaps: renderer.shadowMap.enabled,
  }
}

let ticker = (time) => {
  lenis.raf(time * 1000)
  frameFromProgress(reduced ? 1 : state.p)
  renderer.render(scene, camera)
}

gsap.ticker.add(ticker)
gsap.ticker.lagSmoothing(0)

async function start() {
  try {
    await document.fonts.ready
  } catch {
    /* continue */
  }
  subject = buildSubject({ colors })
  scene.add(subject)
  if (!reduced) {
    window.scrollTo(0, 0)
    lenis.scrollTo(0, { immediate: true })
  }
  ScrollTrigger.refresh()
  frameFromProgress(state.p)
}

start()

window.addEventListener('beforeunload', () => {
  gsap.ticker.remove(ticker)
  lenis.destroy()
  ScrollTrigger.getAll().forEach((t) => t.kill())
})

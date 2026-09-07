import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'
import { casebackTexture, dateTexture, dialTexture, genevaTexture, perlageTexture } from './textures.js'
import * as mat from './materials.js'

export const LAYERS = ['crystal', 'hands', 'dial', 'movement', 'case', 'caseback']

export const LAYER_WINDOWS = {
  crystal: [0.1, 0.32],
  hands: [0.28, 0.5],
  dial: [0.46, 0.64],
  movement: [0.58, 0.76],
  case: [0.7, 0.88],
  caseback: [0.78, 0.96],
}

const CASE_R = 1.05
const DIAL_R = 0.86
const MOVEMENT_R = 0.78
const RUBY = '#6B1D2A'

const GEARS = [
  { teeth: 20, inner: 0.155, outer: 0.255, h: 0.026, x: -0.24, z: 0.2, y: 0.01, gold: true },
  { teeth: 16, inner: 0.055, outer: 0.125, h: 0.01, x: 0, z: 0, y: 0.024, gold: false },
  { teeth: 18, inner: 0.048, outer: 0.108, h: 0.01, x: 0.22, z: -0.1, y: 0.02, gold: false },
  { teeth: 14, inner: 0.038, outer: 0.082, h: 0.01, x: 0.14, z: -0.28, y: 0.02, gold: false },
  { teeth: 15, inner: 0.036, outer: 0.088, h: 0.01, x: 0.36, z: 0.14, y: 0.018, gold: false },
  { teeth: 18, inner: 0.07, outer: 0.15, h: 0.008, x: -0.24, z: 0.2, y: 0.03, gold: true },
]

const JEWELS = [
  [0, 0, 0.032],
  [-0.24, 0.2, 0.034],
  [0.22, -0.1, 0.028],
  [0.14, -0.28, 0.028],
  [0.36, 0.14, 0.026],
  [0.22, -0.42, 0.03],
  [-0.38, 0.08, 0.026],
  [-0.12, -0.36, 0.026],
  [0.08, 0.36, 0.026],
  [0.42, -0.18, 0.026],
  [-0.42, -0.16, 0.024],
  [0.3, 0.36, 0.028],
  [-0.32, -0.28, 0.024],
  [0.02, -0.48, 0.028],
  [-0.18, 0.42, 0.026],
]

const MOVEMENT_SCREWS = [
  [-0.52, -0.18],
  [-0.48, 0.28],
  [-0.18, 0.52],
  [0.22, 0.5],
  [0.52, 0.18],
  [0.48, -0.22],
  [0.18, -0.54],
  [-0.28, -0.48],
]

const LUGS = [
  { x: -0.4, z: -1.08, yaw: 0.14 },
  { x: 0.4, z: -1.08, yaw: -0.14 },
  { x: -0.4, z: 1.08, yaw: -0.14 },
  { x: 0.4, z: 1.08, yaw: 0.14 },
]

function ringShape(outer, inner) {
  const shape = new THREE.Shape()
  shape.absarc(0, 0, outer, 0, Math.PI * 2, false)
  const hole = new THREE.Path()
  hole.absarc(0, 0, inner, 0, Math.PI * 2, true)
  shape.holes.push(hole)
  return shape
}

function extrudeRing(outer, inner, depth, bevel = 0.01) {
  const geo = new THREE.ExtrudeGeometry(ringShape(outer, inner), {
    depth,
    bevelEnabled: true,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: 2,
    curveSegments: 64,
  })
  geo.rotateX(-Math.PI / 2)
  geo.translate(0, depth / 2, 0)
  geo.computeVertexNormals()
  return geo
}

function crystalGeometry(radius) {
  const pts = []
  for (let i = 0; i <= 14; i += 1) {
    const t = i / 14
    pts.push(new THREE.Vector2(t * radius, 0.006 + 0.032 * (1 - t * t)))
  }
  pts.push(new THREE.Vector2(radius, 0.002))
  return new THREE.LatheGeometry(pts, 48)
}

function dauphineShape(length, halfW) {
  const shape = new THREE.Shape()
  shape.moveTo(0, -length * 0.16)
  shape.lineTo(halfW * 0.4, -length * 0.06)
  shape.lineTo(halfW, length * 0.38)
  shape.lineTo(0, length)
  shape.lineTo(-halfW, length * 0.38)
  shape.lineTo(-halfW * 0.4, -length * 0.06)
  shape.closePath()
  return shape
}

function handGeometry(length, halfW, thickness) {
  const geo = new THREE.ExtrudeGeometry(dauphineShape(length, halfW), {
    depth: thickness,
    bevelEnabled: true,
    bevelThickness: 0.003,
    bevelSize: 0.003,
    bevelSegments: 2,
    curveSegments: 4,
  })
  geo.rotateX(-Math.PI / 2)
  geo.translate(0, thickness / 2, 0)
  geo.computeVertexNormals()
  return geo
}

function batonGeometry(w, d, h) {
  const shape = new THREE.Shape()
  const x = -w / 2
  const y = -d / 2
  const r = Math.min(w, d) * 0.28
  shape.moveTo(x + r, y)
  shape.lineTo(x + w - r, y)
  shape.quadraticCurveTo(x + w, y, x + w, y + r)
  shape.lineTo(x + w, y + d - r)
  shape.quadraticCurveTo(x + w, y + d, x + w - r, y + d)
  shape.lineTo(x + r, y + d)
  shape.quadraticCurveTo(x, y + d, x, y + d - r)
  shape.lineTo(x, y + r)
  shape.quadraticCurveTo(x, y, x + r, y)
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: h,
    bevelEnabled: true,
    bevelThickness: 0.004,
    bevelSize: 0.004,
    bevelSegments: 2,
    curveSegments: 4,
  })
  geo.rotateX(-Math.PI / 2)
  geo.translate(0, h / 2, 0)
  geo.computeVertexNormals()
  return geo
}

function clockPos(hour, radius) {
  const a = (hour / 12) * Math.PI * 2
  return { x: Math.sin(a) * radius, z: -Math.cos(a) * radius, a }
}

function radialExplode(x, z, scale, y) {
  const v = new THREE.Vector3(x, 0, z)
  if (v.lengthSq() < 1e-6) return new THREE.Vector3(0, y, 0)
  return v.normalize().multiplyScalar(scale).setY(y)
}

function canvasMap(source) {
  const map = new THREE.CanvasTexture(source)
  map.colorSpace = THREE.SRGBColorSpace
  map.anisotropy = 8
  return map
}

function bindPart(object, layer, explode) {
  object.userData.layer = layer
  object.userData.home = object.position.clone()
  object.userData.explode = explode.clone()
  object.traverse((node) => {
    if (!node.isMesh) return
    const print = node.material && node.material.toneMapped === false
    node.castShadow = !print
    node.receiveShadow = !print
  })
  return object
}

function addPart(root, parts, object, layer, explode) {
  bindPart(object, layer, explode)
  root.add(object)
  parts.push(object)
  return object
}

function makeGear({ teeth, inner, outer, h, gold }, brass, steel) {
  const group = new THREE.Group()
  const material = gold ? brass : steel
  const hub = new THREE.Mesh(new THREE.CylinderGeometry(inner, inner, h, 20), material)
  group.add(hub)
  const toothW = ((Math.PI * 2 * outer) / teeth) * 0.42
  const toothD = outer - inner * 0.82
  const toothGeo = new THREE.BoxGeometry(toothW, h, toothD)
  for (let i = 0; i < teeth; i += 1) {
    const a = (i / teeth) * Math.PI * 2
    const tooth = new THREE.Mesh(toothGeo, material)
    const r = (inner + outer) * 0.5
    tooth.position.set(Math.cos(a) * r, 0, Math.sin(a) * r)
    tooth.rotation.y = -a
    group.add(tooth)
  }
  const pinion = new THREE.Mesh(
    new THREE.CylinderGeometry(inner * 0.42, inner * 0.42, h + 0.012, 12),
    steel,
  )
  pinion.position.y = h * 0.15
  group.add(pinion)
  return group
}

function makeHairspring() {
  const pts = []
  const turns = 7
  const n = 96
  for (let i = 0; i <= n; i += 1) {
    const t = i / n
    const a = t * Math.PI * 2 * turns
    const r = 0.016 + t * 0.058
    pts.push(new THREE.Vector3(Math.cos(a) * r, 0, Math.sin(a) * r))
  }
  return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 96, 0.003, 5, false)
}

export function buildSubject({ colors }) {
  const root = new THREE.Group()
  const parts = []
  const anchors = {}

  const paper = colors.foreground
  const gold = colors.primary
  const brass = colors.secondary
  const ink = colors.background
  const steel = colors.muted

  const goldMat = mat.metal(gold, { roughness: 0.28, metalness: 0.78 })
  const brassMat = mat.metal(brass, { roughness: 0.34, metalness: 0.74 })
  const steelMat = mat.hardware(paper)
  const darkMetal = mat.metal('#3a342c', { roughness: 0.38, metalness: 0.7 })
  const leather = mat.rubber(steel)
  const ruby = mat.emissivePlastic(RUBY, { intensity: 0.14 })
  const glass = mat.housing(steel)
  const genevaMap = canvasMap(genevaTexture(colors))
  const bridgeMat = mat.metal(gold, { map: genevaMap, roughness: 0.36, metalness: 0.7 })

  const bezel = new THREE.Group()
  bezel.add(new THREE.Mesh(extrudeRing(CASE_R, DIAL_R + 0.02, 0.034, 0.008), goldMat))
  const knurlGeo = new THREE.BoxGeometry(0.034, 0.03, 0.018)
  for (let i = 0; i < 48; i += 1) {
    const a = (i / 48) * Math.PI * 2
    const knurl = new THREE.Mesh(knurlGeo, goldMat)
    knurl.position.set(Math.sin(a) * CASE_R, 0.002, -Math.cos(a) * CASE_R)
    knurl.rotation.y = -a
    bezel.add(knurl)
  }
  bezel.position.y = 0.092
  addPart(root, parts, bezel, 'crystal', new THREE.Vector3(0, 1.08, 0))

  const crystal = new THREE.Mesh(crystalGeometry(DIAL_R + 0.01), glass)
  crystal.position.y = 0.1
  addPart(root, parts, crystal, 'crystal', new THREE.Vector3(0, 1.24, 0))
  anchors.crystal = crystal

  const handMat = goldMat
  const hour = new THREE.Group()
  hour.add(new THREE.Mesh(handGeometry(0.42, 0.046, 0.012), handMat))
  hour.add(new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.028, 0.016, 16), handMat))
  hour.position.y = 0.07
  hour.rotation.y = THREE.MathUtils.degToRad(-305)
  addPart(root, parts, hour, 'hands', new THREE.Vector3(-0.38, 0.92, -0.18))

  const minute = new THREE.Group()
  minute.add(new THREE.Mesh(handGeometry(0.62, 0.036, 0.01), handMat))
  minute.add(new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.014, 14), handMat))
  minute.position.y = 0.082
  minute.rotation.y = THREE.MathUtils.degToRad(-60)
  addPart(root, parts, minute, 'hands', new THREE.Vector3(0.42, 0.9, 0.16))
  anchors.hands = minute

  const second = new THREE.Group()
  const secondsBlade = new THREE.Mesh(new THREE.BoxGeometry(0.01, 0.006, 0.72), steelMat)
  secondsBlade.position.z = -0.22
  const counter = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.028, 0.006, 14), steelMat)
  counter.position.z = 0.2
  const tip = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.006, 10), steelMat)
  tip.position.z = -0.56
  second.add(secondsBlade, counter, tip, new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.012, 12), steelMat))
  second.position.y = 0.094
  second.rotation.y = THREE.MathUtils.degToRad(-126)
  addPart(root, parts, second, 'hands', new THREE.Vector3(0.18, 1.08, 0.38))

  const dial = new THREE.Mesh(new THREE.CylinderGeometry(DIAL_R, DIAL_R, 0.016, 64), mat.coat(ink))
  dial.position.y = 0.05
  const dialPrint = new THREE.Mesh(new THREE.CircleGeometry(DIAL_R * 0.98, 64), mat.print(canvasMap(dialTexture(colors))))
  dialPrint.rotation.x = -Math.PI / 2
  dialPrint.position.y = 0.009
  dialPrint.renderOrder = 2
  dial.add(dialPrint)
  addPart(root, parts, dial, 'dial', new THREE.Vector3(0, 0.46, 0.08))
  anchors.dial = dial

  const rehaut = new THREE.Mesh(new THREE.TorusGeometry(DIAL_R - 0.012, 0.01, 8, 64), goldMat)
  rehaut.rotation.x = Math.PI / 2
  rehaut.position.y = 0.06
  addPart(root, parts, rehaut, 'dial', new THREE.Vector3(0, 0.5, 0.04))

  const hourGeo = batonGeometry(0.034, 0.11, 0.016)
  const twelveGeo = batonGeometry(0.048, 0.13, 0.018)
  for (let i = 0; i < 12; i += 1) {
    const { x, z, a } = clockPos(i, 0.68)
    const index = new THREE.Mesh(i === 0 ? twelveGeo : hourGeo, goldMat)
    index.position.set(x, 0.062, z)
    index.rotation.y = -a
    addPart(root, parts, index, 'dial', radialExplode(x, z, 0.34, 0.58))
  }

  const tickGeo = new THREE.BoxGeometry(0.01, 0.01, 0.03)
  for (let i = 0; i < 60; i += 1) {
    if (i % 5 === 0) continue
    const { x, z, a } = clockPos(i / 5, 0.78)
    const tick = new THREE.Mesh(tickGeo, goldMat)
    tick.position.set(x, 0.06, z)
    tick.rotation.y = -a
    addPart(root, parts, tick, 'dial', radialExplode(x, z, 0.28, 0.52))
  }

  const dateFrame = new THREE.Mesh(new RoundedBoxGeometry(0.12, 0.02, 0.09, 1, 0.008), goldMat)
  dateFrame.position.set(0.58, 0.062, 0)
  const dateCard = new THREE.Mesh(new THREE.PlaneGeometry(0.088, 0.062), mat.print(canvasMap(dateTexture(colors))))
  dateCard.rotation.x = -Math.PI / 2
  dateCard.position.set(0, 0.012, 0)
  dateCard.renderOrder = 2
  dateFrame.add(dateCard)
  addPart(root, parts, dateFrame, 'dial', new THREE.Vector3(0.32, 0.54, 0))

  const plate = new THREE.Mesh(
    new THREE.CylinderGeometry(MOVEMENT_R, MOVEMENT_R, 0.018, 48),
    mat.metal(brass, { map: canvasMap(perlageTexture(colors)), roughness: 0.46, metalness: 0.62 }),
  )
  plate.position.y = 0.008
  addPart(root, parts, plate, 'movement', new THREE.Vector3(0, 0.18, -0.04))

  GEARS.forEach((spec) => {
    const gear = makeGear(spec, brassMat, steelMat)
    gear.position.set(spec.x, spec.y, spec.z)
    addPart(root, parts, gear, 'movement', radialExplode(spec.x, spec.z, 0.62 + spec.outer, 0.28))
  })

  const jewelGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.006, 10)
  const chatonGeo = new THREE.TorusGeometry(0.015, 0.0034, 6, 12)
  JEWELS.forEach(([jx, jz, jy]) => {
    const jewel = new THREE.Group()
    const stone = new THREE.Mesh(jewelGeo, ruby)
    const chaton = new THREE.Mesh(chatonGeo, goldMat)
    chaton.rotation.x = Math.PI / 2
    jewel.add(stone, chaton)
    jewel.position.set(jx, jy, jz)
    addPart(root, parts, jewel, 'movement', radialExplode(jx, jz, 0.48, 0.4))
  })

  const screwHead = new THREE.CylinderGeometry(0.016, 0.018, 0.008, 12)
  const screwSlot = new THREE.BoxGeometry(0.02, 0.004, 0.004)
  MOVEMENT_SCREWS.forEach(([sx, sz]) => {
    const screw = new THREE.Group()
    screw.add(new THREE.Mesh(screwHead, steelMat))
    const slot = new THREE.Mesh(screwSlot, mat.coat(ink))
    slot.position.y = 0.005
    screw.add(slot)
    screw.position.set(sx, 0.03, sz)
    addPart(root, parts, screw, 'movement', radialExplode(sx, sz, 0.4, 0.36))
  })

  const bridges = [
    { w: 0.42, h: 0.014, d: 0.16, x: -0.24, y: 0.038, z: 0.2 },
    { w: 0.5, h: 0.012, d: 0.14, x: 0.16, y: 0.034, z: -0.16 },
    { w: 0.28, h: 0.012, d: 0.18, x: 0.22, y: 0.04, z: -0.42 },
  ]
  bridges.forEach((b) => {
    const bridge = new THREE.Mesh(new RoundedBoxGeometry(b.w, b.h, b.d, 2, 0.02), bridgeMat)
    bridge.position.set(b.x, b.y, b.z)
    addPart(root, parts, bridge, 'movement', radialExplode(b.x, b.z, 0.22, 0.44))
  })

  const balance = new THREE.Group()
  const rim = new THREE.Mesh(new THREE.TorusGeometry(0.092, 0.01, 8, 32), steelMat)
  rim.rotation.x = Math.PI / 2
  balance.add(rim)
  const spokeGeo = new THREE.BoxGeometry(0.01, 0.006, 0.168)
  for (let i = 0; i < 4; i += 1) {
    const spoke = new THREE.Mesh(spokeGeo, steelMat)
    spoke.rotation.y = (i / 4) * Math.PI
    balance.add(spoke)
  }
  const timingGeo = new THREE.CylinderGeometry(0.008, 0.008, 0.012, 8)
  for (let i = 0; i < 8; i += 1) {
    const a = (i / 8) * Math.PI * 2
    const screw = new THREE.Mesh(timingGeo, goldMat)
    screw.position.set(Math.cos(a) * 0.092, 0, Math.sin(a) * 0.092)
    balance.add(screw)
  }
  balance.add(new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.014, 14), steelMat))
  balance.position.set(0.22, 0.036, -0.42)
  addPart(root, parts, balance, 'movement', new THREE.Vector3(0.28, 0.55, -0.42))
  anchors.movement = balance

  const hairspring = new THREE.Mesh(makeHairspring(), steelMat)
  hairspring.position.set(0.22, 0.044, -0.42)
  addPart(root, parts, hairspring, 'movement', new THREE.Vector3(0.32, 0.62, -0.38))

  const pallet = new THREE.Group()
  pallet.add(new THREE.Mesh(new RoundedBoxGeometry(0.11, 0.01, 0.028, 1, 0.006), steelMat))
  const forkL = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.01, 0.016), steelMat)
  const forkR = forkL.clone()
  forkL.position.set(-0.06, 0, 0.02)
  forkR.position.set(-0.06, 0, -0.02)
  pallet.add(forkL, forkR)
  pallet.position.set(0.3, 0.026, -0.12)
  addPart(root, parts, pallet, 'movement', new THREE.Vector3(0.38, 0.4, -0.08))

  const rotor = new THREE.Mesh(new THREE.TorusGeometry(0.46, 0.042, 10, 28, Math.PI * 1.2), goldMat)
  rotor.rotation.set(Math.PI / 2, 0, 0.55)
  rotor.position.set(0, -0.042, 0.06)
  addPart(root, parts, rotor, 'movement', new THREE.Vector3(-0.16, -0.38, 0.22))

  const caseMid = new THREE.Mesh(extrudeRing(CASE_R + 0.02, MOVEMENT_R + 0.02, 0.12, 0.014), goldMat)
  caseMid.position.y = 0.01
  addPart(root, parts, caseMid, 'case', new THREE.Vector3(0, -0.78, 0.1))
  anchors.case = caseMid

  const lugGeo = new RoundedBoxGeometry(0.22, 0.07, 0.34, 2, 0.03)
  const barGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.72, 10)
  const lugScrewGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.03, 10)
  LUGS.forEach((lug) => {
    const mesh = new THREE.Mesh(lugGeo, goldMat)
    mesh.position.set(lug.x, 0.01, lug.z)
    mesh.rotation.y = lug.yaw
    addPart(root, parts, mesh, 'case', radialExplode(lug.x, lug.z, 0.55, -0.7))
  })

  ;[
    [0, -1.08],
    [0, 1.08],
  ].forEach(([bx, bz]) => {
    const bar = new THREE.Mesh(barGeo, steelMat)
    bar.rotation.z = Math.PI / 2
    bar.position.set(bx, 0.002, bz)
    addPart(root, parts, bar, 'case', radialExplode(bx, bz, 0.5, -0.74))
  })

  LUGS.forEach((lug) => {
    const screw = new THREE.Mesh(lugScrewGeo, steelMat)
    screw.rotation.z = Math.PI / 2
    screw.position.set(lug.x * 1.22, 0.01, lug.z)
    addPart(root, parts, screw, 'case', radialExplode(lug.x, lug.z, 0.6, -0.68))
  })

  const crown = new THREE.Group()
  const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.028, 0.08, 14), goldMat)
  tube.rotation.z = Math.PI / 2
  const head = new THREE.Mesh(new THREE.CylinderGeometry(0.046, 0.05, 0.052, 16), goldMat)
  head.rotation.z = Math.PI / 2
  head.position.x = 0.055
  crown.add(tube, head)
  const fluteGeo = new THREE.BoxGeometry(0.012, 0.046, 0.01)
  for (let i = 0; i < 12; i += 1) {
    const a = (i / 12) * Math.PI * 2
    const flute = new THREE.Mesh(fluteGeo, goldMat)
    flute.position.set(0.082, Math.cos(a) * 0.046, Math.sin(a) * 0.046)
    flute.rotation.x = a
    crown.add(flute)
  }
  crown.position.set(CASE_R + 0.02, 0.02, 0)
  addPart(root, parts, crown, 'case', new THREE.Vector3(0.55, -0.62, 0))

  const strapGeo = new RoundedBoxGeometry(0.56, 0.038, 0.46, 2, 0.04)
  ;[
    [0, -1.38],
    [0, 1.38],
  ].forEach(([sx, sz]) => {
    const strap = new THREE.Mesh(strapGeo, leather)
    strap.position.set(sx, -0.012, sz)
    addPart(root, parts, strap, 'case', radialExplode(sx, sz, 0.7, -0.92))
  })

  const glowRing = new THREE.Mesh(new THREE.TorusGeometry(0.92, 0.012, 10, 64), mat.glow(gold))
  glowRing.rotation.x = Math.PI / 2
  glowRing.position.y = -0.04
  addPart(root, parts, glowRing, 'case', new THREE.Vector3(0, -0.7, 0))

  const caseback = new THREE.Mesh(extrudeRing(CASE_R - 0.02, 0.42, 0.02, 0.006), darkMetal)
  caseback.position.y = -0.068
  const backPrint = new THREE.Mesh(
    new THREE.RingGeometry(0.44, CASE_R - 0.08, 48),
    mat.print(canvasMap(casebackTexture(colors))),
  )
  backPrint.rotation.x = Math.PI / 2
  backPrint.position.y = -0.002
  backPrint.renderOrder = 2
  caseback.add(backPrint)
  addPart(root, parts, caseback, 'caseback', new THREE.Vector3(0, -1.02, 0.12))

  const exhibition = new THREE.Mesh(new THREE.CircleGeometry(0.4, 48), glass)
  exhibition.rotation.x = Math.PI / 2
  exhibition.position.y = -0.07
  addPart(root, parts, exhibition, 'caseback', new THREE.Vector3(0, -1.08, 0.1))

  const backScrewGeo = new THREE.CylinderGeometry(0.018, 0.018, 0.01, 12)
  for (let i = 0; i < 8; i += 1) {
    const a = (i / 8) * Math.PI * 2
    const screw = new THREE.Mesh(backScrewGeo, steelMat)
    screw.position.set(Math.sin(a) * 0.88, -0.078, -Math.cos(a) * 0.88)
    addPart(root, parts, screw, 'caseback', radialExplode(Math.sin(a), -Math.cos(a), 0.35, -1.12))
  }

  root.userData.parts = parts
  root.userData.anchors = anchors
  root.userData.bounds = { w: CASE_R * 2, d: 2.8 }
  return root
}

function smoothstep(edge0, edge1, x) {
  const t = THREE.MathUtils.clamp((x - edge0) / (edge1 - edge0), 0, 1)
  return t * t * (3 - 2 * t)
}

export function applyExplosion(root, progress) {
  const parts = root.userData.parts
  for (const mesh of parts) {
    const [a, b] = LAYER_WINDOWS[mesh.userData.layer] ?? [0, 1]
    const t = smoothstep(a, b, progress)
    const home = mesh.userData.home
    const explode = mesh.userData.explode
    mesh.position.set(
      home.x + explode.x * t,
      home.y + explode.y * t,
      home.z + explode.z * t,
    )
  }
}

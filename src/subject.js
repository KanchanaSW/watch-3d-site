import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'
import {
  casebackTexture,
  dateTexture,
  dialTexture,
  genevaTexture,
  leatherBump,
  leatherTexture,
  perlageTexture,
} from './textures.js'
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
  { teeth: 48, inner: 0.17, outer: 0.255, hole: 0.04, h: 0.022, x: -0.24, z: 0.2, y: 0.012, gold: true },
  { teeth: 18, inner: 0.062, outer: 0.122, hole: 0.016, h: 0.01, x: 0, z: 0, y: 0.024, gold: false },
  { teeth: 20, inner: 0.052, outer: 0.108, hole: 0.014, h: 0.01, x: 0.22, z: -0.1, y: 0.02, gold: false },
  { teeth: 16, inner: 0.042, outer: 0.082, hole: 0.012, h: 0.01, x: 0.14, z: -0.28, y: 0.02, gold: false },
  { teeth: 17, inner: 0.04, outer: 0.088, hole: 0.012, h: 0.01, x: 0.36, z: 0.14, y: 0.018, gold: false },
  { teeth: 22, inner: 0.078, outer: 0.148, hole: 0.02, h: 0.008, x: -0.24, z: 0.2, y: 0.032, gold: true },
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
  { x: -0.38, z: -1.05, yaw: 0.16 },
  { x: 0.38, z: -1.05, yaw: -0.16 },
  { x: -0.38, z: 1.05, yaw: -0.16 },
  { x: 0.38, z: 1.05, yaw: 0.16 },
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
    bevelSegments: 3,
    curveSegments: 72,
  })
  geo.rotateX(-Math.PI / 2)
  geo.translate(0, depth / 2, 0)
  geo.computeVertexNormals()
  return geo
}

function crystalGeometry(radius) {
  const pts = []
  for (let i = 0; i <= 18; i += 1) {
    const t = i / 18
    pts.push(new THREE.Vector2(t * radius, 0.008 + 0.042 * (1 - t * t)))
  }
  pts.push(new THREE.Vector2(radius, 0.003))
  return new THREE.LatheGeometry(pts, 64)
}

function dauphineShape(length, halfW) {
  const shape = new THREE.Shape()
  shape.moveTo(0, -length * 0.18)
  shape.lineTo(halfW * 0.35, -length * 0.05)
  shape.lineTo(halfW, length * 0.36)
  shape.lineTo(0, length)
  shape.lineTo(-halfW, length * 0.36)
  shape.lineTo(-halfW * 0.35, -length * 0.05)
  shape.closePath()
  return shape
}

function handGeometry(length, halfW, thickness) {
  const geo = new THREE.ExtrudeGeometry(dauphineShape(length, halfW), {
    depth: thickness,
    bevelEnabled: true,
    bevelThickness: 0.004,
    bevelSize: 0.0035,
    bevelSegments: 3,
    curveSegments: 6,
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
  const r = Math.min(w, d) * 0.3
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
    bevelThickness: 0.005,
    bevelSize: 0.004,
    bevelSegments: 3,
    curveSegments: 6,
  })
  geo.rotateX(-Math.PI / 2)
  geo.translate(0, h / 2, 0)
  geo.computeVertexNormals()
  return geo
}

function lugGeometry() {
  const shape = new THREE.Shape()
  shape.moveTo(-0.09, -0.16)
  shape.lineTo(0.09, -0.16)
  shape.lineTo(0.07, 0.18)
  shape.lineTo(-0.07, 0.18)
  shape.closePath()
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: 0.07,
    bevelEnabled: true,
    bevelThickness: 0.016,
    bevelSize: 0.014,
    bevelSegments: 3,
    curveSegments: 4,
  })
  geo.rotateX(-Math.PI / 2)
  geo.translate(0, 0.035, 0)
  geo.computeVertexNormals()
  return geo
}

function gearShape(teeth, inner, outer, hole) {
  const shape = new THREE.Shape()
  const step = (Math.PI * 2) / teeth
  for (let i = 0; i < teeth; i += 1) {
    const a = i * step
    const p = (t, r) => [Math.cos(t) * r, Math.sin(t) * r]
    const pts = [
      p(a, inner),
      p(a + step * 0.18, inner),
      p(a + step * 0.32, outer),
      p(a + step * 0.68, outer),
      p(a + step * 0.82, inner),
    ]
    if (i === 0) shape.moveTo(pts[0][0], pts[0][1])
    else shape.lineTo(pts[0][0], pts[0][1])
    for (let k = 1; k < pts.length; k += 1) shape.lineTo(pts[k][0], pts[k][1])
  }
  shape.closePath()
  const bore = new THREE.Path()
  bore.absarc(0, 0, hole, 0, Math.PI * 2, true)
  shape.holes.push(bore)
  return shape
}

function gearGeometry(teeth, inner, outer, hole, h) {
  const geo = new THREE.ExtrudeGeometry(gearShape(teeth, inner, outer, hole), {
    depth: h,
    bevelEnabled: true,
    bevelThickness: Math.min(0.003, h * 0.28),
    bevelSize: 0.002,
    bevelSegments: 1,
    curveSegments: 2,
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

function canvasMap(source, { repeat = 1, wrap = false, colorSpace = THREE.SRGBColorSpace } = {}) {
  const map = new THREE.CanvasTexture(source)
  map.colorSpace = colorSpace
  map.anisotropy = 8
  if (wrap) {
    map.wrapS = THREE.RepeatWrapping
    map.wrapT = THREE.RepeatWrapping
    map.repeat.set(repeat, repeat)
  }
  return map
}

function bindPart(object, layer, explode) {
  object.userData.layer = layer
  object.userData.home = object.position.clone()
  object.userData.explode = explode.clone()
  object.traverse((node) => {
    if (!node.isMesh) return
    const print = node.material && node.material.toneMapped === false
    const glass = node.material && (node.material.transmission > 0 || node.material.depthWrite === false)
    node.castShadow = !print && !glass
    node.receiveShadow = !print && !glass
  })
  return object
}

function addPart(root, parts, object, layer, explode) {
  bindPart(object, layer, explode)
  root.add(object)
  parts.push(object)
  return object
}

function makeGear({ teeth, inner, outer, hole, h, gold }, brass, steel) {
  const group = new THREE.Group()
  const material = gold ? brass : steel
  group.add(new THREE.Mesh(gearGeometry(teeth, inner, outer, hole, h), material))
  const pinion = new THREE.Mesh(
    new THREE.CylinderGeometry(hole * 1.15, hole * 1.05, h + 0.014, 14),
    steel,
  )
  pinion.position.y = h * 0.2
  group.add(pinion)
  if (gold) {
    const rim = new THREE.Mesh(new THREE.TorusGeometry(outer * 0.72, 0.006, 8, 28), material)
    rim.rotation.x = Math.PI / 2
    rim.position.y = h * 0.55
    group.add(rim)
  }
  return group
}

function makeHairspring() {
  const pts = []
  const turns = 8
  const n = 128
  for (let i = 0; i <= n; i += 1) {
    const t = i / n
    const a = t * Math.PI * 2 * turns
    const r = 0.014 + t * 0.062
    pts.push(new THREE.Vector3(Math.cos(a) * r, t * 0.004, Math.sin(a) * r))
  }
  return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 128, 0.0024, 6, false)
}

function strapGeometry() {
  return new RoundedBoxGeometry(0.52, 0.032, 0.58, 3, 0.04)
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

  const goldMat = mat.polishedGold(gold)
  const brassMat = mat.brushedGold(brass)
  const steelMat = mat.polishedSteel(paper)
  const darkMetal = mat.metal('#3a342c', { roughness: 0.28, metalness: 0.86, clearcoat: 0.2, envMapIntensity: 1.1 })
  const leatherMat = mat.leather(steel, {
    map: canvasMap(leatherTexture(colors), { wrap: true, repeat: 1 }),
    bumpMap: canvasMap(leatherBump(), { wrap: true, repeat: 2, colorSpace: THREE.NoColorSpace }),
  })
  const ruby = mat.gem(RUBY)
  const glass = mat.sapphire()
  const genevaMap = canvasMap(genevaTexture(colors))
  const bridgeMat = mat.brushedGold(gold, { map: genevaMap })

  const bezel = new THREE.Group()
  bezel.add(new THREE.Mesh(extrudeRing(CASE_R + 0.008, DIAL_R + 0.016, 0.032, 0.01), goldMat))
  const knurlGeo = new THREE.BoxGeometry(0.024, 0.028, 0.013)
  for (let i = 0; i < 72; i += 1) {
    const a = (i / 72) * Math.PI * 2
    const knurl = new THREE.Mesh(knurlGeo, goldMat)
    knurl.position.set(Math.sin(a) * (CASE_R + 0.01), 0.004, -Math.cos(a) * (CASE_R + 0.01))
    knurl.rotation.y = -a
    bezel.add(knurl)
  }
  bezel.position.y = 0.09
  addPart(root, parts, bezel, 'crystal', new THREE.Vector3(0, 1.08, 0))

  const crystal = new THREE.Mesh(crystalGeometry(DIAL_R + 0.01), glass)
  crystal.position.y = 0.106
  crystal.renderOrder = 4
  addPart(root, parts, crystal, 'crystal', new THREE.Vector3(0, 1.24, 0))
  anchors.crystal = crystal

  const hour = new THREE.Group()
  hour.add(new THREE.Mesh(handGeometry(0.4, 0.042, 0.011), goldMat))
  hour.add(new THREE.Mesh(new THREE.CylinderGeometry(0.026, 0.026, 0.015, 20), goldMat))
  hour.position.y = 0.07
  hour.rotation.y = THREE.MathUtils.degToRad(-305)
  addPart(root, parts, hour, 'hands', new THREE.Vector3(-0.38, 0.92, -0.18))

  const minute = new THREE.Group()
  minute.add(new THREE.Mesh(handGeometry(0.6, 0.032, 0.009), goldMat))
  minute.add(new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.013, 18), goldMat))
  minute.position.y = 0.082
  minute.rotation.y = THREE.MathUtils.degToRad(-60)
  addPart(root, parts, minute, 'hands', new THREE.Vector3(0.42, 0.9, 0.16))
  anchors.hands = minute

  const second = new THREE.Group()
  const secondsBlade = new THREE.Mesh(new THREE.BoxGeometry(0.006, 0.004, 0.74), steelMat)
  secondsBlade.position.z = -0.22
  const counter = new THREE.Mesh(new THREE.SphereGeometry(0.022, 12, 8), steelMat)
  counter.position.z = 0.2
  const tip = new THREE.Mesh(new THREE.SphereGeometry(0.01, 10, 8), steelMat)
  tip.position.z = -0.58
  second.add(secondsBlade, counter, tip, new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.012, 14), steelMat))
  second.position.y = 0.094
  second.rotation.y = THREE.MathUtils.degToRad(-126)
  addPart(root, parts, second, 'hands', new THREE.Vector3(0.18, 1.08, 0.38))

  const dial = new THREE.Mesh(new THREE.CylinderGeometry(DIAL_R, DIAL_R, 0.014, 72), mat.coat(ink))
  dial.position.y = 0.05
  const dialPrint = new THREE.Mesh(new THREE.CircleGeometry(DIAL_R * 0.985, 72), mat.sunburst(canvasMap(dialTexture(colors))))
  dialPrint.rotation.x = -Math.PI / 2
  dialPrint.position.y = 0.008
  dial.add(dialPrint)
  addPart(root, parts, dial, 'dial', new THREE.Vector3(0, 0.46, 0.08))
  anchors.dial = dial

  const rehaut = new THREE.Mesh(extrudeRing(DIAL_R - 0.004, DIAL_R - 0.028, 0.012, 0.003), goldMat)
  rehaut.position.y = 0.056
  addPart(root, parts, rehaut, 'dial', new THREE.Vector3(0, 0.5, 0.04))

  const hourGeo = batonGeometry(0.03, 0.1, 0.015)
  const twelveGeo = batonGeometry(0.044, 0.12, 0.017)
  for (let i = 0; i < 12; i += 1) {
    const { x, z, a } = clockPos(i, 0.68)
    const index = new THREE.Mesh(i === 0 ? twelveGeo : hourGeo, goldMat)
    index.position.set(x, 0.062, z)
    index.rotation.y = -a
    addPart(root, parts, index, 'dial', radialExplode(x, z, 0.34, 0.58))
  }

  const tickGeo = new THREE.BoxGeometry(0.008, 0.008, 0.026)
  for (let i = 0; i < 60; i += 1) {
    if (i % 5 === 0) continue
    const { x, z, a } = clockPos(i / 5, 0.78)
    const tick = new THREE.Mesh(tickGeo, goldMat)
    tick.position.set(x, 0.06, z)
    tick.rotation.y = -a
    addPart(root, parts, tick, 'dial', radialExplode(x, z, 0.28, 0.52))
  }

  const dateFrame = new THREE.Mesh(new RoundedBoxGeometry(0.11, 0.016, 0.082, 2, 0.006), goldMat)
  dateFrame.position.set(0.575, 0.062, 0)
  const dateCard = new THREE.Mesh(new THREE.PlaneGeometry(0.082, 0.056), mat.sunburst(canvasMap(dateTexture(colors))))
  dateCard.rotation.x = -Math.PI / 2
  dateCard.position.set(0, 0.01, 0)
  dateFrame.add(dateCard)
  addPart(root, parts, dateFrame, 'dial', new THREE.Vector3(0.32, 0.54, 0))

  const plate = new THREE.Mesh(
    new THREE.CylinderGeometry(MOVEMENT_R, MOVEMENT_R, 0.016, 64),
    mat.metal(brass, { map: canvasMap(perlageTexture(colors)), roughness: 0.4, metalness: 0.78, envMapIntensity: 1.05 }),
  )
  plate.position.y = 0.008
  addPart(root, parts, plate, 'movement', new THREE.Vector3(0, 0.18, -0.04))

  GEARS.forEach((spec) => {
    const gear = makeGear(spec, brassMat, steelMat)
    gear.position.set(spec.x, spec.y, spec.z)
    addPart(root, parts, gear, 'movement', radialExplode(spec.x, spec.z, 0.62 + spec.outer, 0.28))
  })

  const jewelGeo = new THREE.CylinderGeometry(0.011, 0.011, 0.005, 12)
  const chatonGeo = new THREE.TorusGeometry(0.014, 0.003, 8, 16)
  JEWELS.forEach(([jx, jz, jy]) => {
    const jewel = new THREE.Group()
    const stone = new THREE.Mesh(jewelGeo, ruby)
    const chaton = new THREE.Mesh(chatonGeo, goldMat)
    chaton.rotation.x = Math.PI / 2
    jewel.add(stone, chaton)
    jewel.position.set(jx, jy, jz)
    addPart(root, parts, jewel, 'movement', radialExplode(jx, jz, 0.48, 0.4))
  })

  const screwHead = new THREE.CylinderGeometry(0.015, 0.017, 0.007, 16)
  const screwSlot = new THREE.BoxGeometry(0.018, 0.0035, 0.0035)
  MOVEMENT_SCREWS.forEach(([sx, sz]) => {
    const screw = new THREE.Group()
    screw.add(new THREE.Mesh(screwHead, steelMat))
    const slot = new THREE.Mesh(screwSlot, mat.coat(ink))
    slot.position.y = 0.0045
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
    const bridge = new THREE.Mesh(new RoundedBoxGeometry(b.w, b.h, b.d, 3, 0.022), bridgeMat)
    bridge.position.set(b.x, b.y, b.z)
    addPart(root, parts, bridge, 'movement', radialExplode(b.x, b.z, 0.22, 0.44))
  })

  const balance = new THREE.Group()
  const rim = new THREE.Mesh(new THREE.TorusGeometry(0.09, 0.009, 10, 40), steelMat)
  rim.rotation.x = Math.PI / 2
  balance.add(rim)
  const spokeGeo = new THREE.BoxGeometry(0.008, 0.005, 0.164)
  for (let i = 0; i < 4; i += 1) {
    const spoke = new THREE.Mesh(spokeGeo, steelMat)
    spoke.rotation.y = (i / 4) * Math.PI
    balance.add(spoke)
  }
  const timingGeo = new THREE.CylinderGeometry(0.007, 0.007, 0.011, 10)
  for (let i = 0; i < 8; i += 1) {
    const a = (i / 8) * Math.PI * 2
    const screw = new THREE.Mesh(timingGeo, goldMat)
    screw.position.set(Math.cos(a) * 0.09, 0, Math.sin(a) * 0.09)
    balance.add(screw)
  }
  balance.add(new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.013, 16), steelMat))
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

  const rotor = new THREE.Mesh(new THREE.TorusGeometry(0.46, 0.038, 12, 36, Math.PI * 1.15), goldMat)
  rotor.rotation.set(Math.PI / 2, 0, 0.55)
  rotor.position.set(0, -0.04, 0.06)
  addPart(root, parts, rotor, 'movement', new THREE.Vector3(-0.16, -0.38, 0.22))

  const caseMid = new THREE.Group()
  caseMid.add(new THREE.Mesh(extrudeRing(CASE_R + 0.042, MOVEMENT_R + 0.018, 0.1, 0.016), goldMat))
  const caseStep = new THREE.Mesh(extrudeRing(CASE_R + 0.02, DIAL_R + 0.03, 0.036, 0.01), goldMat)
  caseStep.position.y = 0.052
  caseMid.add(caseStep)
  caseMid.position.y = 0.01
  addPart(root, parts, caseMid, 'case', new THREE.Vector3(0, -0.78, 0.1))
  anchors.case = caseMid

  const lugGeo = lugGeometry()
  const barGeo = new THREE.CylinderGeometry(0.011, 0.011, 0.7, 12)
  const lugScrewGeo = new THREE.CylinderGeometry(0.011, 0.011, 0.028, 12)
  LUGS.forEach((lug) => {
    const mesh = new THREE.Mesh(lugGeo, goldMat)
    mesh.position.set(lug.x, 0.008, lug.z)
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
  const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.026, 0.026, 0.09, 16), goldMat)
  tube.rotation.z = Math.PI / 2
  const head = new THREE.Mesh(new THREE.CylinderGeometry(0.048, 0.052, 0.058, 20), goldMat)
  head.rotation.z = Math.PI / 2
  head.position.x = 0.062
  const cap = new THREE.Mesh(new THREE.SphereGeometry(0.048, 16, 10, 0, Math.PI * 2, 0, Math.PI * 0.5), goldMat)
  cap.rotation.z = -Math.PI / 2
  cap.position.x = 0.09
  crown.add(tube, head, cap)
  const fluteGeo = new THREE.BoxGeometry(0.01, 0.05, 0.008)
  for (let i = 0; i < 16; i += 1) {
    const a = (i / 16) * Math.PI * 2
    const flute = new THREE.Mesh(fluteGeo, goldMat)
    flute.position.set(0.078, Math.cos(a) * 0.05, Math.sin(a) * 0.05)
    flute.rotation.x = a
    crown.add(flute)
  }
  crown.position.set(CASE_R + 0.028, 0.022, 0)
  addPart(root, parts, crown, 'case', new THREE.Vector3(0.55, -0.62, 0))

  const strapGeo = strapGeometry()
  ;[
    [0, -1.42],
    [0, 1.42],
  ].forEach(([sx, sz], i) => {
    const strap = new THREE.Group()
    const hideMesh = new THREE.Mesh(strapGeo, leatherMat)
    strap.add(hideMesh)
    if (i === 0) {
      const holeGeo = new THREE.CylinderGeometry(0.016, 0.016, 0.04, 10)
      for (let h = 0; h < 5; h += 1) {
        const hole = new THREE.Mesh(holeGeo, mat.coat(ink))
        hole.position.set(0, 0, -0.08 + h * 0.08)
        strap.add(hole)
      }
    } else {
      const buckle = new THREE.Mesh(extrudeRing(0.12, 0.09, 0.09, 0.008), goldMat)
      buckle.rotation.z = Math.PI / 2
      buckle.position.z = 0.28
      const prong = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.22, 8), goldMat)
      prong.position.z = 0.22
      strap.add(buckle, prong)
    }
    strap.position.set(sx, -0.02, sz)
    strap.rotation.x = sz > 0 ? 0.1 : -0.1
    addPart(root, parts, strap, 'case', radialExplode(sx, sz, 0.7, -0.92))
  })

  const caseback = new THREE.Mesh(extrudeRing(CASE_R - 0.015, 0.4, 0.018, 0.006), darkMetal)
  caseback.position.y = -0.068
  const backPrint = new THREE.Mesh(
    new THREE.RingGeometry(0.42, CASE_R - 0.07, 64),
    mat.etched(canvasMap(casebackTexture(colors)), { roughness: 0.32, metalness: 0.82 }),
  )
  backPrint.rotation.x = Math.PI / 2
  backPrint.position.y = -0.002
  caseback.add(backPrint)
  addPart(root, parts, caseback, 'caseback', new THREE.Vector3(0, -1.02, 0.12))

  const exhibition = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.008, 48), glass)
  exhibition.position.y = -0.072
  exhibition.renderOrder = 4
  addPart(root, parts, exhibition, 'caseback', new THREE.Vector3(0, -1.08, 0.1))

  const backScrewGeo = new THREE.CylinderGeometry(0.016, 0.016, 0.009, 14)
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

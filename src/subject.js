import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'
import {
  chapterTexture,
  noxCasebackTexture,
  perlageTexture,
  rubberBump,
  rubberTexture,
} from './textures.js'
import * as mat from './materials.js'

export const LAYERS = ['screws', 'crystal', 'hands', 'dial', 'movement', 'case', 'caseback']

export const LAYER_WINDOWS = {
  screws: [0.08, 0.26],
  crystal: [0.16, 0.38],
  hands: [0.32, 0.52],
  dial: [0.46, 0.64],
  movement: [0.56, 0.76],
  case: [0.7, 0.88],
  caseback: [0.78, 0.96],
}

const CASE_R = 1.12
const DIAL_R = 0.74
const MOVEMENT_R = 0.68
const RUBY = '#C45C6A'

const GEARS = [
  { teeth: 48, inner: 0.2, outer: 0.3, hole: 0.045, h: 0.024, x: -0.26, z: 0.18, y: 0.01, gold: true },
  { teeth: 20, inner: 0.07, outer: 0.14, hole: 0.018, h: 0.012, x: 0.02, z: 0.02, y: 0.026, gold: true },
  { teeth: 22, inner: 0.06, outer: 0.125, hole: 0.016, h: 0.011, x: 0.24, z: -0.14, y: 0.02, gold: false },
  { teeth: 16, inner: 0.045, outer: 0.092, hole: 0.014, h: 0.01, x: 0.16, z: -0.32, y: 0.02, gold: true },
  { teeth: 18, inner: 0.048, outer: 0.1, hole: 0.014, h: 0.01, x: 0.38, z: 0.12, y: 0.018, gold: false },
  { teeth: 24, inner: 0.085, outer: 0.16, hole: 0.022, h: 0.01, x: -0.26, z: 0.18, y: 0.034, gold: true },
  { teeth: 14, inner: 0.038, outer: 0.078, hole: 0.012, h: 0.01, x: -0.08, z: -0.36, y: 0.016, gold: false },
]

const JEWELS = [
  [0.02, 0.02, 0.034],
  [-0.26, 0.18, 0.036],
  [0.24, -0.14, 0.03],
  [0.16, -0.32, 0.028],
  [0.38, 0.12, 0.026],
  [-0.42, 0.06, 0.028],
  [0.08, 0.4, 0.026],
  [-0.14, -0.4, 0.024],
  [0.42, -0.2, 0.024],
  [-0.36, -0.22, 0.024],
]

const LUGS = [
  { x: -0.42, z: -1.12, yaw: 0.12 },
  { x: 0.42, z: -1.12, yaw: -0.12 },
  { x: -0.42, z: 1.12, yaw: -0.12 },
  { x: 0.42, z: 1.12, yaw: 0.12 },
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

function flatCrystalGeometry(radius) {
  const pts = [
    new THREE.Vector2(0, 0.012),
    new THREE.Vector2(radius * 0.92, 0.012),
    new THREE.Vector2(radius, 0.006),
    new THREE.Vector2(radius, 0.001),
  ]
  return new THREE.LatheGeometry(pts, 64)
}

function swordShape(length, halfW) {
  const shape = new THREE.Shape()
  shape.moveTo(0, -length * 0.16)
  shape.lineTo(halfW * 0.35, -length * 0.04)
  shape.lineTo(halfW, length * 0.3)
  shape.lineTo(halfW * 0.42, length * 0.86)
  shape.lineTo(0, length)
  shape.lineTo(-halfW * 0.42, length * 0.86)
  shape.lineTo(-halfW, length * 0.3)
  shape.lineTo(-halfW * 0.35, -length * 0.04)
  shape.closePath()
  const hole = new THREE.Path()
  hole.moveTo(0, length * 0.06)
  hole.lineTo(halfW * 0.26, length * 0.24)
  hole.lineTo(halfW * 0.2, length * 0.74)
  hole.lineTo(0, length * 0.84)
  hole.lineTo(-halfW * 0.2, length * 0.74)
  hole.lineTo(-halfW * 0.26, length * 0.24)
  hole.closePath()
  shape.holes.push(hole)
  return shape
}

function lumeShape(length, halfW) {
  const shape = new THREE.Shape()
  shape.moveTo(0, length * 0.08)
  shape.lineTo(halfW * 0.22, length * 0.26)
  shape.lineTo(halfW * 0.16, length * 0.72)
  shape.lineTo(0, length * 0.82)
  shape.lineTo(-halfW * 0.16, length * 0.72)
  shape.lineTo(-halfW * 0.22, length * 0.26)
  shape.closePath()
  return shape
}

function extrudeFlat(shape, thickness) {
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: thickness,
    bevelEnabled: true,
    bevelThickness: 0.003,
    bevelSize: 0.0025,
    bevelSegments: 2,
    curveSegments: 6,
  })
  geo.rotateX(-Math.PI / 2)
  geo.translate(0, thickness / 2, 0)
  geo.computeVertexNormals()
  return geo
}

function appliedMarkerShape(innerW, outerW, length) {
  const shape = new THREE.Shape()
  const half = length / 2
  // +Y of the 2D shape becomes +Z after extrudeFlat. At 12, +Z is inward.
  shape.moveTo(-outerW / 2, -half)
  shape.lineTo(outerW / 2, -half)
  shape.lineTo(innerW / 2, half)
  shape.lineTo(-innerW / 2, half)
  shape.closePath()
  return shape
}

function makeAppliedMarker(innerW, outerW, length, height, steel, lume) {
  const marker = new THREE.Group()
  const bodyGeo = new THREE.ExtrudeGeometry(appliedMarkerShape(innerW, outerW, length), {
    depth: height,
    bevelEnabled: true,
    bevelThickness: 0.0045,
    bevelSize: 0.0035,
    bevelSegments: 3,
    curveSegments: 4,
  })
  bodyGeo.rotateX(-Math.PI / 2)
  bodyGeo.translate(0, height / 2, 0)
  bodyGeo.computeVertexNormals()
  marker.add(new THREE.Mesh(bodyGeo, steel))
  const inlay = new THREE.Mesh(
    extrudeFlat(appliedMarkerShape(innerW * 0.42, outerW * 0.42, length * 0.7), height * 0.5),
    lume,
  )
  inlay.position.y = height * 0.48
  marker.add(inlay)
  return marker
}

function rehautGeometry() {
  const outer = DIAL_R - 0.002
  const inner = DIAL_R - 0.102
  const pts = [
    new THREE.Vector2(inner, 0),
    new THREE.Vector2(outer, 0),
    new THREE.Vector2(outer, 0.02),
    new THREE.Vector2(inner + 0.028, 0.015),
    new THREE.Vector2(inner, 0.007),
  ]
  const geo = new THREE.LatheGeometry(pts, 80)
  geo.computeVertexNormals()
  return geo
}

function lugGeometry() {
  const shape = new THREE.Shape()
  shape.moveTo(-0.12, -0.2)
  shape.lineTo(0.12, -0.2)
  shape.lineTo(0.09, 0.22)
  shape.lineTo(-0.09, 0.22)
  shape.closePath()
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: 0.09,
    bevelEnabled: true,
    bevelThickness: 0.02,
    bevelSize: 0.016,
    bevelSegments: 3,
    curveSegments: 4,
  })
  geo.rotateX(-Math.PI / 2)
  geo.translate(0, 0.04, 0)
  geo.computeVertexNormals()
  return geo
}

function cushionGeometry() {
  const w = 2.18
  const d = 2.36
  const r = 0.58
  const hw = w / 2
  const hd = d / 2
  const shape = new THREE.Shape()
  shape.moveTo(-hw + r, -hd)
  shape.lineTo(hw - r, -hd)
  shape.quadraticCurveTo(hw, -hd, hw, -hd + r)
  shape.lineTo(hw, hd - r)
  shape.quadraticCurveTo(hw, hd, hw - r, hd)
  shape.lineTo(-hw + r, hd)
  shape.quadraticCurveTo(-hw, hd, -hw, hd - r)
  shape.lineTo(-hw, -hd + r)
  shape.quadraticCurveTo(-hw, -hd, -hw + r, -hd)
  const hole = new THREE.Path()
  hole.absarc(0, 0, MOVEMENT_R + 0.04, 0, Math.PI * 2, true)
  shape.holes.push(hole)
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: 0.13,
    bevelEnabled: true,
    bevelThickness: 0.018,
    bevelSize: 0.014,
    bevelSegments: 3,
    curveSegments: 12,
  })
  geo.rotateX(-Math.PI / 2)
  geo.translate(0, 0.065, 0)
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

function makeHScrew(steel, ink) {
  const group = new THREE.Group()
  group.add(new THREE.Mesh(new THREE.CylinderGeometry(0.038, 0.042, 0.018, 20), steel))
  const slot = mat.coat(ink)
  const left = new THREE.Mesh(new THREE.BoxGeometry(0.008, 0.008, 0.026), slot)
  const right = left.clone()
  left.position.set(-0.01, 0.008, 0)
  right.position.set(0.01, 0.008, 0)
  const bar = new THREE.Mesh(new THREE.BoxGeometry(0.024, 0.008, 0.008), slot)
  bar.position.y = 0.008
  group.add(left, right, bar)
  return group
}

export function buildSubject({ colors }) {
  const root = new THREE.Group()
  const parts = []
  const anchors = {}

  const gold = colors.primary
  const brass = colors.secondary
  const ink = colors.background

  const steelMat = mat.polishedSteel('#E8EBEE')
  const brushMat = mat.brushedSteel('#D0D5DB')
  const mirrorMat = mat.mirrorSteel('#F2F4F6')
  const goldMat = mat.polishedGold(gold)
  const brassMat = mat.brushedGold(brass)
  const blackMat = mat.matteBlack('#121212')
  const ruby = mat.gem(RUBY)
  const glass = mat.sapphire()
  const lumeMat = mat.lume()
  const rubberMat = mat.rubberStrap('#1C1C1C', {
    map: canvasMap(rubberTexture(colors), { wrap: true, repeat: 1 }),
    bumpMap: canvasMap(rubberBump(), { wrap: true, repeat: 2, colorSpace: THREE.NoColorSpace }),
  })
  const plateMat = mat.metal('#8A8E92', {
    map: canvasMap(perlageTexture({ ...colors, secondary: '#8A8E92' })),
    roughness: 0.42,
    metalness: 0.8,
    envMapIntensity: 1.05,
  })

  const screwR = CASE_R - 0.06
  for (let i = 0; i < 6; i += 1) {
    const a = (i / 6) * Math.PI * 2 - Math.PI / 2
    const screw = makeHScrew(steelMat, ink)
    screw.scale.setScalar(1.35)
    screw.position.set(Math.sin(a) * screwR, 0.124, -Math.cos(a) * screwR)
    screw.rotation.y = -a
    addPart(root, parts, screw, 'screws', new THREE.Vector3(0, 1.35 + i * 0.02, 0))
  }

  const bezel = new THREE.Group()
  bezel.add(new THREE.Mesh(extrudeRing(CASE_R + 0.02, DIAL_R + 0.028, 0.042, 0.01), brushMat))
  const bevel = new THREE.Mesh(extrudeRing(CASE_R + 0.038, CASE_R + 0.004, 0.026, 0.008), mirrorMat)
  bevel.position.y = -0.006
  bezel.add(bevel)
  bezel.position.y = 0.1
  addPart(root, parts, bezel, 'crystal', new THREE.Vector3(0, 1.12, 0))
  anchors.crystal = bezel

  const crystal = new THREE.Mesh(flatCrystalGeometry(DIAL_R + 0.018), glass)
  crystal.position.y = 0.128
  crystal.renderOrder = 4
  addPart(root, parts, crystal, 'crystal', new THREE.Vector3(0, 1.28, 0))

  const hour = new THREE.Group()
  hour.add(new THREE.Mesh(extrudeFlat(swordShape(0.42, 0.048), 0.01), steelMat))
  hour.add(new THREE.Mesh(extrudeFlat(lumeShape(0.42, 0.048), 0.006), lumeMat))
  hour.add(new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.028, 0.014, 20), steelMat))
  hour.position.y = 0.086
  hour.rotation.y = THREE.MathUtils.degToRad(-305)
  hour.scale.setScalar(1.08)
  addPart(root, parts, hour, 'hands', new THREE.Vector3(-0.38, 0.92, -0.18))

  const minute = new THREE.Group()
  minute.add(new THREE.Mesh(extrudeFlat(swordShape(0.62, 0.036), 0.009), steelMat))
  minute.add(new THREE.Mesh(extrudeFlat(lumeShape(0.62, 0.036), 0.005), lumeMat))
  minute.add(new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.012, 18), steelMat))
  minute.position.y = 0.098
  minute.rotation.y = THREE.MathUtils.degToRad(-60)
  minute.scale.setScalar(1.08)
  addPart(root, parts, minute, 'hands', new THREE.Vector3(0.42, 0.9, 0.16))
  anchors.hands = minute

  const second = new THREE.Group()
  const blade = new THREE.Mesh(new THREE.BoxGeometry(0.005, 0.003, 0.78), steelMat)
  blade.position.z = -0.22
  const counter = new THREE.Mesh(new THREE.SphereGeometry(0.018, 12, 8), steelMat)
  counter.position.z = 0.22
  second.add(blade, counter, new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.01, 14), steelMat))
  second.position.y = 0.1
  second.rotation.y = THREE.MathUtils.degToRad(-126)
  addPart(root, parts, second, 'hands', new THREE.Vector3(0.18, 1.08, 0.38))

  const chapter = new THREE.Group()
  const rehaut = new THREE.Mesh(rehautGeometry(), blackMat)
  const track = new THREE.Mesh(
    new THREE.RingGeometry(DIAL_R - 0.1, DIAL_R - 0.006, 96),
    mat.etched(canvasMap(chapterTexture(colors)), { roughness: 0.46, metalness: 0.28 }),
  )
  track.rotation.x = -Math.PI / 2
  track.position.y = 0.016
  const innerRail = new THREE.Mesh(extrudeRing(DIAL_R - 0.096, DIAL_R - 0.106, 0.007, 0.0012), steelMat)
  innerRail.position.y = 0.008
  const tickGeo = new THREE.BoxGeometry(0.0055, 0.006, 0.022)
  for (let i = 0; i < 60; i += 1) {
    if (i % 5 === 0) continue
    const a = (i / 60) * Math.PI * 2
    const tick = new THREE.Mesh(tickGeo, steelMat)
    const r = DIAL_R - 0.086
    tick.position.set(Math.sin(a) * r, 0.016, -Math.cos(a) * r)
    tick.rotation.y = -a
    chapter.add(tick)
  }
  chapter.add(rehaut, track, innerRail)
  chapter.position.y = 0.056
  addPart(root, parts, chapter, 'dial', new THREE.Vector3(0, 0.5, 0.04))
  anchors.dial = chapter

  for (let i = 0; i < 12; i += 1) {
    const cardinal = i % 3 === 0
    const { x, z, a } = clockPos(i, DIAL_R - 0.042)
    let index
    if (i === 0) {
      index = new THREE.Group()
      const left = makeAppliedMarker(0.012, 0.02, 0.09, 0.02, steelMat, lumeMat)
      const right = makeAppliedMarker(0.012, 0.02, 0.09, 0.02, steelMat, lumeMat)
      left.position.x = -0.018
      right.position.x = 0.018
      index.add(left, right)
    } else {
      index = makeAppliedMarker(
        cardinal ? 0.016 : 0.013,
        cardinal ? 0.03 : 0.024,
        cardinal ? 0.096 : 0.082,
        cardinal ? 0.02 : 0.017,
        steelMat,
        lumeMat,
      )
    }
    index.position.set(x, 0.078, z)
    index.rotation.y = -a
    addPart(root, parts, index, 'dial', radialExplode(x, z, 0.34, 0.58))
  }

  const plate = new THREE.Mesh(new THREE.CylinderGeometry(MOVEMENT_R, MOVEMENT_R, 0.012, 64), plateMat)
  plate.position.y = 0.004
  addPart(root, parts, plate, 'movement', new THREE.Vector3(0, 0.16, -0.04))

  const flange = new THREE.Mesh(extrudeRing(MOVEMENT_R - 0.01, MOVEMENT_R - 0.1, 0.01, 0.002), blackMat)
  flange.position.y = 0.022
  addPart(root, parts, flange, 'movement', new THREE.Vector3(0, 0.36, 0))

  const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.014, 28), blackMat)
  hub.position.y = 0.03
  addPart(root, parts, hub, 'movement', new THREE.Vector3(0, 0.44, 0))
  anchors.movement = hub

  for (let i = 0; i < 5; i += 1) {
    const arm = new THREE.Mesh(new RoundedBoxGeometry(0.1, 0.012, 0.5, 2, 0.018), blackMat)
    arm.position.y = 0.032
    arm.rotation.y = (i / 5) * Math.PI * 2 + 0.18
    addPart(root, parts, arm, 'movement', radialExplode(Math.sin(arm.rotation.y), -Math.cos(arm.rotation.y), 0.28, 0.5))
  }

  GEARS.forEach((spec) => {
    const gear = makeGear(spec, brassMat, steelMat)
    gear.position.set(spec.x, spec.y, spec.z)
    addPart(root, parts, gear, 'movement', radialExplode(spec.x, spec.z, 0.62 + spec.outer, 0.3))
  })

  const jewelGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.006, 12)
  const chatonGeo = new THREE.TorusGeometry(0.016, 0.003, 8, 16)
  JEWELS.forEach(([jx, jz, jy], i) => {
    const jewel = new THREE.Group()
    const stone = new THREE.Mesh(jewelGeo, i === 5 ? ruby : mat.gem(i === 0 ? RUBY : '#7A2430'))
    const chaton = new THREE.Mesh(chatonGeo, goldMat)
    chaton.rotation.x = Math.PI / 2
    jewel.add(stone, chaton)
    jewel.position.set(jx, jy, jz)
    addPart(root, parts, jewel, 'movement', radialExplode(jx, jz, 0.48, 0.4))
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
  balance.add(new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.013, 16), steelMat))
  balance.position.set(0.16, 0.04, -0.32)
  addPart(root, parts, balance, 'movement', new THREE.Vector3(0.28, 0.55, -0.42))

  const hairspring = new THREE.Mesh(makeHairspring(), steelMat)
  hairspring.position.set(0.16, 0.048, -0.32)
  addPart(root, parts, hairspring, 'movement', new THREE.Vector3(0.32, 0.62, -0.38))

  const caseMid = new THREE.Group()
  const cushion = new THREE.Mesh(cushionGeometry(), mirrorMat)
  cushion.position.y = 0.002
  caseMid.add(cushion)
  caseMid.add(new THREE.Mesh(extrudeRing(CASE_R + 0.05, MOVEMENT_R + 0.03, 0.08, 0.016), mirrorMat))
  const caseStep = new THREE.Mesh(extrudeRing(CASE_R + 0.028, DIAL_R + 0.03, 0.032, 0.01), brushMat)
  caseStep.position.y = 0.05
  caseMid.add(caseStep)
  caseMid.position.y = 0.004
  addPart(root, parts, caseMid, 'case', new THREE.Vector3(0, -0.78, 0.1))
  anchors.case = caseMid

  const lugGeo = lugGeometry()
  LUGS.forEach((lug) => {
    const mesh = new THREE.Mesh(lugGeo, brushMat)
    mesh.position.set(lug.x, 0.01, lug.z)
    mesh.rotation.y = lug.yaw
    addPart(root, parts, mesh, 'case', radialExplode(lug.x, lug.z, 0.55, -0.7))
  })

  const lugScrewGeo = new THREE.CylinderGeometry(0.014, 0.014, 0.032, 12)
  LUGS.forEach((lug) => {
    const screw = new THREE.Mesh(lugScrewGeo, steelMat)
    screw.rotation.z = Math.PI / 2
    screw.position.set(lug.x * 1.18, 0.02, lug.z)
    addPart(root, parts, screw, 'case', radialExplode(lug.x, lug.z, 0.6, -0.68))
  })

  const crown = new THREE.Group()
  const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.028, 0.1, 16), mirrorMat)
  tube.rotation.z = Math.PI / 2
  const head = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.054, 0.062, 20), brushMat)
  head.rotation.z = Math.PI / 2
  head.position.x = 0.068
  crown.add(tube, head)
  const fluteGeo = new THREE.BoxGeometry(0.01, 0.052, 0.008)
  for (let i = 0; i < 16; i += 1) {
    const a = (i / 16) * Math.PI * 2
    const flute = new THREE.Mesh(fluteGeo, mirrorMat)
    flute.position.set(0.086, Math.cos(a) * 0.052, Math.sin(a) * 0.052)
    flute.rotation.x = a
    crown.add(flute)
  }
  crown.position.set(CASE_R + 0.036, 0.028, 0)
  addPart(root, parts, crown, 'case', new THREE.Vector3(0.55, -0.62, 0))

  const strapGeo = new RoundedBoxGeometry(0.62, 0.055, 1.05, 3, 0.05)
  const ribGeo = new THREE.BoxGeometry(0.54, 0.014, 0.022)
  ;[
    [0, -1.68],
    [0, 1.68],
  ].forEach(([sx, sz]) => {
    const strap = new THREE.Group()
    strap.add(new THREE.Mesh(strapGeo, rubberMat))
    for (let r = 0; r < 16; r += 1) {
      const rib = new THREE.Mesh(ribGeo, rubberMat)
      rib.position.set(0, 0.03, -0.44 + r * 0.056)
      strap.add(rib)
    }
    strap.position.set(sx, -0.02, sz)
    strap.rotation.x = sz > 0 ? 0.12 : -0.12
    addPart(root, parts, strap, 'case', radialExplode(sx, sz, 0.78, -0.92))
  })

  const caseback = new THREE.Mesh(extrudeRing(CASE_R - 0.02, 0.42, 0.018, 0.006), brushMat)
  caseback.position.y = -0.072
  const backPrint = new THREE.Mesh(
    new THREE.RingGeometry(0.44, CASE_R - 0.08, 64),
    mat.etched(canvasMap(noxCasebackTexture(colors)), { roughness: 0.32, metalness: 0.82 }),
  )
  backPrint.rotation.x = Math.PI / 2
  backPrint.position.y = -0.002
  caseback.add(backPrint)
  addPart(root, parts, caseback, 'caseback', new THREE.Vector3(0, -1.02, 0.12))

  const exhibition = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.008, 48), glass)
  exhibition.position.y = -0.076
  exhibition.renderOrder = 4
  addPart(root, parts, exhibition, 'caseback', new THREE.Vector3(0, -1.08, 0.1))

  const backScrewGeo = new THREE.CylinderGeometry(0.016, 0.016, 0.009, 14)
  for (let i = 0; i < 8; i += 1) {
    const a = (i / 8) * Math.PI * 2
    const screw = new THREE.Mesh(backScrewGeo, steelMat)
    screw.position.set(Math.sin(a) * 0.92, -0.082, -Math.cos(a) * 0.92)
    addPart(root, parts, screw, 'caseback', radialExplode(Math.sin(a), -Math.cos(a), 0.35, -1.12))
  }

  root.userData.parts = parts
  root.userData.anchors = anchors
  root.userData.bounds = { w: CASE_R * 2, d: 3.1 }
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

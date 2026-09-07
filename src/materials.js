import * as THREE from 'three'

/** PBT / painted plastic. Beveled extrusions catch the key light on the coat. */
export function plastic(color, { sheenColor = '#F5F5F5' } = {}) {
  return new THREE.MeshPhysicalMaterial({
    color,
    roughness: 0.34,
    metalness: 0.04,
    clearcoat: 0.7,
    clearcoatRoughness: 0.22,
    sheen: 0.18,
    sheenColor: new THREE.Color(sheenColor),
  })
}

/** Anodized or powder-coated chassis. */
export function coat(color) {
  return new THREE.MeshPhysicalMaterial({
    color,
    roughness: 0.46,
    metalness: 0.22,
    clearcoat: 0.4,
  })
}

/** Brushed / steel-look plate. */
export function metal(color, {
  roughness = 0.32,
  metalness = 0.72,
  map = null,
  roughnessMap = null,
  clearcoat = 0,
  envMapIntensity = 1,
  anisotropy = 0,
} = {}) {
  return new THREE.MeshPhysicalMaterial({
    color,
    map,
    roughnessMap,
    roughness,
    metalness,
    clearcoat,
    clearcoatRoughness: 0.2,
    envMapIntensity,
    anisotropy,
  })
}

/** Mirror-polished gold case, bezel, hands. */
export function polishedGold(color) {
  return new THREE.MeshPhysicalMaterial({
    color,
    metalness: 1,
    roughness: 0.11,
    clearcoat: 0.55,
    clearcoatRoughness: 0.08,
    envMapIntensity: 1.5,
    specularIntensity: 1,
  })
}

/** Soft-brushed gold for bridges and rotor. */
export function brushedGold(color, { map = null } = {}) {
  return new THREE.MeshPhysicalMaterial({
    color,
    map,
    metalness: 0.92,
    roughness: 0.32,
    clearcoat: 0.18,
    clearcoatRoughness: 0.28,
    envMapIntensity: 1.15,
    anisotropy: 0.35,
  })
}

/** Polished steel screws, pinion, seconds hand. */
export function polishedSteel(color) {
  return new THREE.MeshPhysicalMaterial({
    color,
    metalness: 1,
    roughness: 0.14,
    clearcoat: 0.35,
    clearcoatRoughness: 0.1,
    envMapIntensity: 1.25,
  })
}

/** Domed sapphire. Transmission needs RoomEnvironment. */
export function sapphire(tint = '#ffffff') {
  return new THREE.MeshPhysicalMaterial({
    color: tint,
    metalness: 0.04,
    roughness: 0.05,
    transmission: 0.55,
    thickness: 0.18,
    ior: 1.42,
    clearcoat: 1,
    clearcoatRoughness: 0.03,
    transparent: true,
    opacity: 0.16,
    depthWrite: false,
    side: THREE.DoubleSide,
    envMapIntensity: 1.85,
    iridescence: 0.12,
    iridescenceIOR: 1.25,
    iridescenceThicknessRange: [100, 320],
  })
}

/** Sunburst dial face — lit metal, not an unlit sticker. */
export function sunburst(map) {
  return new THREE.MeshPhysicalMaterial({
    map,
    roughness: 0.28,
    metalness: 0.7,
    clearcoat: 0.62,
    clearcoatRoughness: 0.16,
    envMapIntensity: 1.2,
  })
}

/** Calf / alligator strap. */
export function leather(color, { map = null, bumpMap = null } = {}) {
  const sheenColor = new THREE.Color(color)
  sheenColor.offsetHSL(0.03, 0.08, 0.1)
  return new THREE.MeshPhysicalMaterial({
    color,
    map,
    bumpMap,
    bumpScale: 0.045,
    roughness: 0.74,
    metalness: 0,
    sheen: 0.45,
    sheenColor,
    sheenRoughness: 0.52,
    clearcoat: 0.12,
    clearcoatRoughness: 0.55,
  })
}

/** Synthetic ruby chaton. Glossy, not emissive. */
export function gem(color) {
  return new THREE.MeshPhysicalMaterial({
    color,
    roughness: 0.1,
    metalness: 0.12,
    clearcoat: 1,
    clearcoatRoughness: 0.06,
    envMapIntensity: 1.15,
  })
}

/** Semi-transparent switch housing / smoked plastic. */
export function housing(color) {
  return new THREE.MeshPhysicalMaterial({
    color,
    roughness: 0.42,
    metalness: 0.18,
    transparent: true,
    opacity: 0.92,
  })
}

/** Accent stem / trim with a faint emissive. */
export function emissivePlastic(color, { intensity = 0.18 } = {}) {
  return new THREE.MeshPhysicalMaterial({
    color,
    roughness: 0.35,
    metalness: 0.08,
    emissive: new THREE.Color(color),
    emissiveIntensity: intensity,
  })
}

/** Fasteners, pins, USB shell. */
export function hardware(color) {
  return new THREE.MeshStandardMaterial({
    color,
    metalness: 0.7,
    roughness: 0.28,
  })
}

/** FR4-style board. Pass a canvas map for silkscreen. */
export function board(color, map = null) {
  return new THREE.MeshPhysicalMaterial({
    color,
    map,
    metalness: 0.2,
    roughness: 0.55,
  })
}

/** Open-cell foam / felt. */
export function foam(color) {
  return new THREE.MeshPhysicalMaterial({
    color,
    roughness: 0.92,
    metalness: 0,
  })
}

/** Rubber feet. */
export function rubber(color) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness: 0.7,
    metalness: 0,
  })
}

/** Thin glow ring. */
export function glow(color, { intensity = 1.4 } = {}) {
  return new THREE.MeshStandardMaterial({
    color,
    emissive: new THREE.Color(color),
    emissiveIntensity: intensity,
    roughness: 0.3,
  })
}

/** Unlit canvas legend / printed label. */
export function print(map) {
  return new THREE.MeshBasicMaterial({
    map,
    toneMapped: false,
    depthWrite: false,
  })
}

/** Engraved metal print that still catches studio light. */
export function etched(map, { roughness = 0.38, metalness = 0.78 } = {}) {
  return new THREE.MeshPhysicalMaterial({
    map,
    roughness,
    metalness,
    envMapIntensity: 1.1,
  })
}

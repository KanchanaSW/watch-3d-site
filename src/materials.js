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
export function metal(color, { roughness = 0.32, metalness = 0.72, map = null } = {}) {
  return new THREE.MeshPhysicalMaterial({
    color,
    map,
    roughness,
    metalness,
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

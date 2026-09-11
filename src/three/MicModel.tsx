import { useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import logo from './miclogo.json'

/**
 * The SG microphone, extruded from the ACTUAL logo silhouette.
 *
 * miclogo.json is a trace of the real mark (from the badge artwork): the
 * SG monogram, cradle, neck and T-base as line-art strokes, normalised to
 * 100 units tall, y-up, centred. We extrude those strokes into a shallow
 * relief and turn it in space. No font glyphs, no parametric guessing — the
 * shape is the logo.
 */

type Part = { outer: number[][]; holes: number[][][] }

const DEPTH = 13
const BEVEL = 0.8

function studioEnvironment(): THREE.Scene {
  const scene = new THREE.Scene()
  const panel = (
    w: number,
    h: number,
    intensity: number,
    color: string,
    pos: [number, number, number],
  ) => {
    const m = new THREE.Mesh(
      new THREE.PlaneGeometry(w, h),
      new THREE.MeshBasicMaterial({
        color: new THREE.Color(color).multiplyScalar(intensity),
        side: THREE.DoubleSide,
      }),
    )
    m.position.set(...pos)
    m.lookAt(0, 0, 0)
    scene.add(m)
  }
  panel(6, 4, 3.2, '#ffe9cf', [-5, 4, 4])
  panel(5, 5, 1.6, '#bcccf5', [6, 1, 2])
  panel(8, 8, 1.1, '#f4f4f4', [0, 7, 0])
  panel(8, 8, 0.4, '#241a12', [0, -6, 0])
  panel(4, 6, 1.3, '#d48d46', [0, 0, -6])
  return scene
}

function shapeFromPart(part: Part): THREE.Shape {
  const s = new THREE.Shape()
  part.outer.forEach(([x, y], i) => (i === 0 ? s.moveTo(x, y) : s.lineTo(x, y)))
  s.closePath()
  for (const hole of part.holes) {
    const p = new THREE.Path()
    hole.forEach(([x, y], i) => (i === 0 ? p.moveTo(x, y) : p.lineTo(x, y)))
    p.closePath()
    s.holes.push(p)
  }
  return s
}

export type MicHandle = { spin: (velocity: number) => void }

export default function MicModel({
  handleRef,
  onSpinStart,
}: {
  handleRef: React.MutableRefObject<MicHandle | null>
  onSpinStart?: () => void
}) {
  const group = useRef<THREE.Group>(null)
  const velocity = useRef(0)
  const { gl, scene } = useThree()

  useLayoutEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl)
    // oxlint-disable-next-line react/immutability
    scene.environment = pmrem.fromScene(studioEnvironment(), 0.02).texture
    return () => {
      scene.environment = null
      pmrem.dispose()
    }
  }, [gl, scene])

  const geometry = useMemo(() => {
    const shapes = (logo.parts as Part[]).map(shapeFromPart)
    const g = new THREE.ExtrudeGeometry(shapes, {
      depth: DEPTH,
      bevelEnabled: true,
      bevelThickness: BEVEL,
      bevelSize: BEVEL,
      bevelSegments: 2,
      curveSegments: 6,
    })
    g.translate(0, 0, -DEPTH / 2)
    g.computeVertexNormals()
    return g
  }, [])

  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#e7dcc8',
        metalness: 0.5,
        roughness: 0.52,
        envMapIntensity: 0.55,
      }),
    [],
  )

  useLayoutEffect(() => {
    handleRef.current = {
      spin: (v) => {
        velocity.current += v
        onSpinStart?.()
      },
    }
    return () => {
      handleRef.current = null
    }
  }, [handleRef, onSpinStart])

  useFrame((_, dt) => {
    const g = group.current
    if (!g) return
    const idle = 0.42
    velocity.current *= Math.exp(-dt * 1.6)
    g.rotation.y += (idle + velocity.current) * dt
    g.rotation.x = -0.04 + Math.sin(g.rotation.y * 0.5) * 0.03
  })

  // Logo is 100 units tall, centred at the origin.
  return (
    <group ref={group} scale={0.031}>
      <mesh geometry={geometry} material={material} castShadow />
    </group>
  )
}

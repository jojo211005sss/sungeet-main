import { useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import spec from './monogram.json'

/**
 * The SG microphone, built from the numbers in the client's Blender spec
 * (sg_mic_logo.py) rather than from a font glyph:
 *
 *   frame    base 34x4, neck 5 wide, U-cradle R20 / wall 4  — dark metal, 8 deep
 *   monogram S and G outlines from monogram.json          — light metal, 6 deep,
 *            recessed 1mm each side inside the same depth
 *
 * The outlines are the pill split down the seam with the letters' bowls cut
 * out of each half, so the letters' outer edges are the pill edge — which is
 * how the logo actually draws them. Units are mm; the group is scaled to fit.
 */

type Ring = { outer: number[][]; holes: number[][][] }

const F = spec.frame

function shapeFromRing(ring: Ring): THREE.Shape {
  const s = new THREE.Shape()
  ring.outer.forEach(([x, y], i) => (i === 0 ? s.moveTo(x, y) : s.lineTo(x, y)))
  s.closePath()
  for (const hole of ring.holes) {
    const h = new THREE.Path()
    hole.forEach(([x, y], i) => (i === 0 ? h.moveTo(x, y) : h.lineTo(x, y)))
    h.closePath()
    s.holes.push(h)
  }
  return s
}

/**
 * A small studio: emissive panels around the origin, baked to a PMREM so the
 * metals have something to reflect. Built here rather than imported from
 * three/examples — that import pulls in a *second* copy of three, and objects
 * from one copy handed to the other render nothing at all.
 */
function studioEnvironment(): THREE.Scene {
  const scene = new THREE.Scene()
  const panel = (w: number, h: number, intensity: number, color: string, pos: [number, number, number], look: [number, number, number]) => {
    const m = new THREE.Mesh(
      new THREE.PlaneGeometry(w, h),
      new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(intensity), side: THREE.DoubleSide }),
    )
    m.position.set(...pos)
    m.lookAt(...look)
    scene.add(m)
  }
  // Warm key from upper left, cool fill from the right, soft top, dim floor.
  panel(6, 4, 9, '#fff1dc', [-5, 4, 4], [0, 0, 0])
  panel(5, 5, 4, '#c9d6ff', [6, 1, 2], [0, 0, 0])
  panel(8, 8, 2.5, '#ffffff', [0, 7, 0], [0, 0, 0])
  panel(8, 8, 0.6, '#3a2a20', [0, -6, 0], [0, 0, 0])
  panel(4, 6, 3, '#d48d46', [0, 0, -6], [0, 0, 0])
  return scene
}

/** Extrude, then centre on z so the piece sits symmetrically about the origin. */
function extrude(shape: THREE.Shape | THREE.Shape[], depth: number) {
  const g = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelThickness: F.bevel,
    bevelSize: F.bevel,
    bevelSegments: 3,
    curveSegments: 24,
  })
  g.translate(0, 0, -depth / 2)
  g.computeVertexNormals()
  return g
}

function cradleShape() {
  // Lower half of an annulus, opening upward. Angles run π → 2π so the arc
  // passes through the BOTTOM (3π/2); the first version used π → 0 clockwise,
  // which in Three's y-up frame goes over the top and put the cradle above
  // the capsule like an umbrella.
  const s = new THREE.Shape()
  s.absarc(0, 0, F.cradleROut, Math.PI, 2 * Math.PI, false) // outer, left → right via bottom
  s.lineTo(F.cradleRIn, 0)
  s.absarc(0, 0, F.cradleRIn, 2 * Math.PI, Math.PI, true)   // inner, right → left via bottom
  s.closePath()
  return s
}

function rect(w: number, h: number) {
  const s = new THREE.Shape()
  s.moveTo(-w / 2, -h / 2)
  s.lineTo(w / 2, -h / 2)
  s.lineTo(w / 2, h / 2)
  s.lineTo(-w / 2, h / 2)
  s.closePath()
  return s
}

export type MicHandle = {
  /** Add angular velocity, in radians/second, from a user gesture. */
  spin: (velocity: number) => void
}

export default function MicModel({
  handleRef,
  onSpinStart,
}: {
  handleRef: React.MutableRefObject<MicHandle | null>
  /** Fires when a user gesture spins it, not on idle rotation. */
  onSpinStart?: () => void
}) {
  const group = useRef<THREE.Group>(null)
  const velocity = useRef(0)
  const { gl, scene } = useThree()

  // Metals need something to reflect. The studio is generated on the GPU —
  // no HDR download, no external request.
  useLayoutEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl)
    const env = pmrem.fromScene(studioEnvironment(), 0.04).texture
    // The R3F scene object is meant to be configured this way; the linter's
    // immutability rule doesn't know that.
    // oxlint-disable-next-line react/immutability
    scene.environment = env
    return () => {
      scene.environment = null
      env.dispose()
      pmrem.dispose()
    }
  }, [gl, scene])

  const geometry = useMemo(() => {
    const base = extrude(rect(F.baseWidth, F.baseHeight), F.frameDepth)
    base.translate(0, F.baseHeight / 2, 0)

    const neckH = F.cradleCenterY - F.cradleROut - F.baseHeight
    const neck = extrude(rect(F.neckWidth, neckH), F.frameDepth)
    neck.translate(0, F.baseHeight + neckH / 2, 0)

    const cradle = extrude(cradleShape(), F.frameDepth)
    cradle.translate(0, F.cradleCenterY, 0)

    const letters = [...(spec.S as Ring[]), ...(spec.G as Ring[])].map(shapeFromRing)
    const monogram = extrude(letters, F.capsuleDepth)
    monogram.translate(0, spec.capsuleCenterY, 0)

    return { base, neck, cradle, monogram }
  }, [])

  const frameMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#171b22', metalness: 0.92, roughness: 0.38 }),
    [],
  )
  const monoMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#d4d7dc', metalness: 0.95, roughness: 0.28 }),
    [],
  )

  // Hand the parent a spin() it can call from pointer handlers. Assigned in
  // an effect, not during render — a ref written mid-render can go stale.
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
    // Idle turn plus whatever the user added, which decays back to idle.
    const idle = 0.45
    velocity.current *= Math.exp(-dt * 1.6)
    g.rotation.y += (idle + velocity.current) * dt
    // A touch of lean so the bevels catch the light as it turns.
    g.rotation.x = -0.08 + Math.sin(g.rotation.y * 0.5) * 0.04
  })

  // Centre vertically: the model spans y = 0 .. capsule top (~62.5).
  const centreY = -(spec.capsuleCenterY + 20.5 + F.baseHeight) / 2 + 2

  return (
    <group ref={group} scale={0.052} position={[0, 0, 0]}>
      <group position={[0, centreY, 0]}>
        <mesh geometry={geometry.base} material={frameMat} castShadow />
        <mesh geometry={geometry.neck} material={frameMat} castShadow />
        <mesh geometry={geometry.cradle} material={frameMat} castShadow />
        <mesh geometry={geometry.monogram} material={monoMat} castShadow />
      </group>
    </group>
  )
}

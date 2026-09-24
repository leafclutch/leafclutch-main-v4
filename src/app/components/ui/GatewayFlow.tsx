'use client'

import { useEffect, useRef } from 'react'

/**
 * The hero's moving backdrop: streams of light that fan in from both edges,
 * squeeze through a "gate" at the centre — right behind the brand mark — and
 * fan out again. It reads as work flowing into the company and shipping out.
 *
 * Drawn straight onto a canvas rather than pulled from a CDN, because the
 * site's Content-Security-Policy allows scripts from 'self' only, and because
 * the first visit is a page-weight budget we have already spent once.
 *
 * It stops drawing whenever it cannot be seen — scrolled away, tab in the
 * background — and never starts if the visitor asked for reduced motion.
 */

type Lane = {
  ax: number; ay: number
  bx: number; by: number
  cx: number; cy: number
  dx: number; dy: number
}

type Particle = {
  lane: number
  t: number
  speed: number
  size: number
  tint: number
}

const LANE_COUNT = 13
const PER_LANE = 9
const TRAIL = 5

/** Brand blues, with a little of the green the logo uses. */
const TINTS = ['14,165,233', '59,130,246', '59,227,160'] as const

/** One axis of a cubic bezier. */
function bezier(t: number, a: number, b: number, c: number, d: number) {
  const u = 1 - t
  return u * u * u * a + 3 * u * u * t * b + 3 * u * t * t * c + t * t * t * d
}

/** A soft round dot, pre-rendered once so no frame pays for a shadow blur. */
function makeSprite(tint: string) {
  const size = 64
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  if (!ctx) return canvas
  const half = size / 2
  const glow = ctx.createRadialGradient(half, half, 0, half, half, half)
  glow.addColorStop(0, `rgba(${tint},0.95)`)
  glow.addColorStop(0.22, `rgba(${tint},0.5)`)
  glow.addColorStop(0.55, `rgba(${tint},0.14)`)
  glow.addColorStop(1, `rgba(${tint},0)`)
  ctx.fillStyle = glow
  ctx.fillRect(0, 0, size, size)
  return canvas
}

/**
 * Lanes live in 0..1 space so a resize is a multiply, not a rebuild. Each one
 * starts off the left edge, is pulled towards the centre by both control
 * points — that pull is the gate — and leaves off the right edge.
 */
function buildLanes(): Lane[] {
  const lanes: Lane[] = []
  const gateY = 0.5
  for (let i = 0; i < LANE_COUNT; i += 1) {
    const spread = (i / (LANE_COUNT - 1) - 0.5) * 2 // -1 .. 1
    const entry = gateY + spread * 0.62
    const exit = gateY + spread * 0.62
    // How tightly this lane is squeezed at the centre. The outer lanes pinch
    // hardest, so the bundle narrows to a waist instead of staying a ribbon.
    const pinch = 0.86 - Math.abs(spread) * 0.16
    lanes.push({
      ax: -0.12, ay: entry,
      bx: 0.3, by: entry + (gateY - entry) * pinch,
      cx: 0.7, cy: exit + (gateY - exit) * pinch,
      dx: 1.12, dy: exit,
    })
  }
  return lanes
}

function buildParticles(): Particle[] {
  const particles: Particle[] = []
  for (let lane = 0; lane < LANE_COUNT; lane += 1) {
    for (let n = 0; n < PER_LANE; n += 1) {
      particles.push({
        lane,
        // Spaced along the lane, then nudged so the lanes do not pulse in step.
        t: (n / PER_LANE + lane * 0.37) % 1,
        speed: 0.035 + ((lane * 7 + n * 13) % 10) * 0.004,
        size: 8 + ((lane * 5 + n * 11) % 7),
        tint: (lane + n) % TINTS.length,
      })
    }
  }
  return particles
}

export default function GatewayFlow({ className = '' }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const lanes = buildLanes()
    const particles = buildParticles()
    const sprites = TINTS.map(makeSprite)

    let width = 0
    let height = 0
    let frame = 0
    let last = 0
    let clock = 0
    let onScreen = true

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      // Cap the pixel ratio: past 2x this costs fill rate and buys nothing on
      // a backdrop made of soft gradients.
      const ratio = Math.min(window.devicePixelRatio || 1, 2)
      width = rect.width
      height = rect.height
      canvas.width = Math.max(1, Math.round(width * ratio))
      canvas.height = Math.max(1, Math.round(height * ratio))
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0)
    }

    const draw = () => {
      ctx.clearRect(0, 0, width, height)

      // The lanes themselves, barely there — they give the particles a path
      // the eye can follow between dots.
      ctx.lineWidth = 1
      ctx.strokeStyle = 'rgba(7,32,105,0.07)'
      for (const lane of lanes) {
        ctx.beginPath()
        ctx.moveTo(lane.ax * width, lane.ay * height)
        ctx.bezierCurveTo(
          lane.bx * width, lane.by * height,
          lane.cx * width, lane.cy * height,
          lane.dx * width, lane.dy * height,
        )
        ctx.stroke()
      }

      for (const particle of particles) {
        const lane = lanes[particle.lane]
        const sprite = sprites[particle.tint]
        const head = (particle.t + clock * particle.speed) % 1

        for (let step = 0; step < TRAIL; step += 1) {
          const t = head - step * 0.016
          if (t < 0 || t > 1) continue

          const x = bezier(t, lane.ax, lane.bx, lane.cx, lane.dx) * width
          const y = bezier(t, lane.ay, lane.by, lane.cy, lane.dy) * height

          // Brightest at the waist, faded at both ends, so nothing pops in or
          // out at the edges of the section.
          const edge = Math.sin(Math.PI * t)
          const fade = 1 - step / TRAIL
          const radius = (particle.size * (0.45 + edge * 0.55) * fade) / 2

          ctx.globalAlpha = 0.62 * edge * fade * fade
          ctx.drawImage(sprite, x - radius, y - radius, radius * 2, radius * 2)
        }
      }
      ctx.globalAlpha = 1
    }

    const tick = (now: number) => {
      frame = requestAnimationFrame(tick)
      if (!onScreen || document.hidden) {
        last = now
        return
      }
      // Seconds, clamped: coming back to a backgrounded tab should resume, not
      // teleport every particle down its lane.
      const delta = Math.min((now - last) / 1000, 0.05)
      last = now
      clock += delta
      draw()
    }

    resize()

    if (reduceMotion) {
      // One still frame. The composition survives; the motion does not.
      clock = 2.4
      draw()
      const observer = new ResizeObserver(() => { resize(); draw() })
      observer.observe(canvas)
      return () => observer.disconnect()
    }

    const resizeObserver = new ResizeObserver(() => { resize(); draw() })
    resizeObserver.observe(canvas)

    const visibility = new IntersectionObserver(
      ([entry]) => { onScreen = entry.isIntersecting },
      { threshold: 0 },
    )
    visibility.observe(canvas)

    last = performance.now()
    frame = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(frame)
      resizeObserver.disconnect()
      visibility.disconnect()
    }
  }, [])

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />
}

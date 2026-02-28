interface Orb {
  size: number
  color: string
  x: string
  y: string
  opacity: number
  duration: number
  delay: number
}

interface GradientOrbsProps {
  variant?: 'default' | 'hero' | 'purple' | 'teal' | 'warm'
}

const orbPresets: Record<string, Orb[]> = {
  default: [
    { size: 400, color: '#2D5BFF', x: '-5%', y: '-10%', opacity: 0.08, duration: 14, delay: 0 },
    { size: 350, color: '#00D4AA', x: '70%', y: '55%', opacity: 0.06, duration: 12, delay: 3 },
    { size: 300, color: '#7B61FF', x: '80%', y: '-15%', opacity: 0.06, duration: 15, delay: 6 },
  ],
  hero: [
    { size: 500, color: '#2D5BFF', x: '-8%', y: '-10%', opacity: 0.1, duration: 14, delay: 0 },
    { size: 400, color: '#00D4AA', x: '70%', y: '55%', opacity: 0.08, duration: 12, delay: 3 },
    { size: 350, color: '#7B61FF', x: '75%', y: '-15%', opacity: 0.07, duration: 15, delay: 6 },
  ],
  purple: [
    { size: 450, color: '#7B61FF', x: '-8%', y: '5%', opacity: 0.08, duration: 14, delay: 0 },
    { size: 380, color: '#00D4AA', x: '80%', y: '40%', opacity: 0.05, duration: 12, delay: 4 },
    { size: 320, color: '#FF8C42', x: '10%', y: '75%', opacity: 0.06, duration: 15, delay: 7 },
  ],
  teal: [
    { size: 500, color: '#00D4AA', x: '75%', y: '5%', opacity: 0.07, duration: 14, delay: 1 },
    { size: 420, color: '#2D5BFF', x: '-10%', y: '50%', opacity: 0.08, duration: 12, delay: 4 },
    { size: 300, color: '#7B61FF', x: '60%', y: '70%', opacity: 0.05, duration: 15, delay: 7 },
  ],
  warm: [
    { size: 450, color: '#FF8C42', x: '-10%', y: '15%', opacity: 0.07, duration: 13, delay: 2 },
    { size: 380, color: '#7B61FF', x: '80%', y: '60%', opacity: 0.06, duration: 11, delay: 5 },
    { size: 320, color: '#2D5BFF', x: '40%', y: '85%', opacity: 0.05, duration: 15, delay: 8 },
  ],
}

export function GradientOrbs({ variant = 'default' }: GradientOrbsProps) {
  const orbs = orbPresets[variant]

  return (
    <div className="orb-container">
      {orbs.map((orb, index) => (
        <div
          key={index}
          className="gradient-orb"
          style={{
            width: orb.size,
            height: orb.size,
            left: orb.x,
            top: orb.y,
            opacity: orb.opacity,
            background: `radial-gradient(circle at 30% 30%, ${orb.color}, ${orb.color}66, transparent 70%)`,
            animation: `orb-float-${(index % 3) + 1} ${orb.duration}s ease-in-out infinite`,
            animationDelay: `${orb.delay}s`,
          }}
        />
      ))}
    </div>
  )
}

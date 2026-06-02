const particles = [
  ["8%", "18%", "4px", "0s"],
  ["16%", "72%", "3px", "1.4s"],
  ["28%", "36%", "5px", "2.1s"],
  ["42%", "82%", "3px", "0.6s"],
  ["54%", "24%", "4px", "2.8s"],
  ["66%", "64%", "5px", "1.1s"],
  ["78%", "38%", "3px", "3.2s"],
  ["88%", "78%", "4px", "1.9s"],
  ["92%", "18%", "3px", "0.9s"],
] as const

export function ParticleBackground() {
  return (
    <div className="particle-field" aria-hidden="true">
      {particles.map(([left, top, size, delay], index) => (
        <span
          key={`${left}-${top}`}
          className="particle-dot"
          style={{
            left,
            top,
            width: size,
            height: size,
            animationDelay: delay,
            opacity: index % 2 === 0 ? 0.28 : 0.18,
          }}
        />
      ))}
    </div>
  )
}

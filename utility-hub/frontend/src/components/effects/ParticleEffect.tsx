import React, { useMemo } from 'react';

interface ParticleEffectProps {
      count?: number;
      className?: string;
      minSize?: number;
      maxSize?: number;
}

const ParticleEffect: React.FC<ParticleEffectProps> = ({
      count = 20,
      className = 'bg-particles',
      minSize = 1,
      maxSize = 4,
}) => {
      const particles = useMemo(() =>
            Array.from({ length: count }, (_, i) => ({
                  id: i,
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  width: `${Math.random() * (maxSize - minSize) + minSize}px`,
                  height: `${Math.random() * (maxSize - minSize) + minSize}px`,
                  animationDuration: `${Math.random() * 10 + 10}s`,
                  animationDelay: `${Math.random() * 5}s`,
            })),
            [count, minSize, maxSize]
      );

      return (
            <div className={className}>
                  {particles.map((p) => (
                        <div
                              key={p.id}
                              className="particle"
                              style={{
                                    left: p.left,
                                    top: p.top,
                                    width: p.width,
                                    height: p.height,
                                    animationDuration: p.animationDuration,
                                    animationDelay: p.animationDelay,
                              }}
                        />
                  ))}
            </div>
      );
};

export default ParticleEffect;

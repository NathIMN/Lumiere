import { Particles } from '../components/landing/Particles';


export const Someother = () => {
  return (
    <div className="bg-white" style={{ width: '100%', height: '600px', position: 'relative' }}>
      <Particles
        particleColors={['#ff8372', '#e092b5', '#0ac8e8']}
        particleCount={200}
        particleSpread={10}
        speed={0.1}
        particleBaseSize={200}
        moveParticlesOnHover={true}
        alphaParticles={false}
        disableRotation={false}
      />
    </div>
  )
}


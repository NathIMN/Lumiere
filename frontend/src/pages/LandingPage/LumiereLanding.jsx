import { Particles } from '../../components/landing/Particles';
import { HeaderLanding } from '../../components/landing/HeaderLanding';
import { CardsFeatures } from '../../components/landing/CardsFeatures';
import { HorizontalCarousel } from '../../components/landing/HorizontalCarousel'; 
import { HeroLanding } from '../../components/landing/HeroLanding';


export const LumiereLanding = () => {
  return (
    <div className="bg-white relative w-full">

      <HeaderLanding/>

      <Particles
        particleColors={['#ff8372', '#e092b5', '#0ac8e8']}
        particleCount={300}
        particleSpread={10}
        speed={0.1}
        particleBaseSize={200}
        moveParticlesOnHover={true}
        alphaParticles={false}
        disableRotation={false}
        className="absolute inset-0 z-0 h-[800px]"
      />

      <HeroLanding/>

      <HorizontalCarousel/>

      <CardsFeatures/>
      
    </div>
  )
}


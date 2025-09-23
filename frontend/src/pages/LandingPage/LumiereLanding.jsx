import { Particles } from '../../components/landing/Particles';
import { HeaderLanding } from '../../components/landing/HeaderLanding';
import { CardsFeatures } from '../../components/landing/CardsFeatures';
import { HeroLanding } from '../../components/landing/HeroLanding';
import { RevealBento } from "../../components/RevealBento"; 




export const LumiereLanding = () => {
  return (
    <div className="bg-white relative w-full">

      {/* Header Section */}
      <HeaderLanding />

      <Particles
        particleColors={['#ff8372', '#e092b5', '#0ac8e8']}
        particleCount={300}
        particleSpread={10}
        speed={0.1}
        particleBaseSize={100}
        moveParticlesOnHover={true}
        alphaParticles={false}
        disableRotation={false}
        className="absolute inset-0 z-0 h-[800px]"
      />

      <HeroLanding />

{/* 
      <ScrollStack>
        <ScrollStackItem>
          <h2>Card 1</h2>
          <p>This is the first card in the stack</p>
        </ScrollStackItem>
        <ScrollStackItem>
          <h2>Card 2</h2>
          <p>This is the second card in the stack</p>
        </ScrollStackItem>
        <ScrollStackItem>
          <h2>Card 3</h2>
          <p>This is the third card in the stack</p>
        </ScrollStackItem>
      </ScrollStack>
*/}
      <CardsFeatures />
      <RevealBento />

    </div>
  )
}


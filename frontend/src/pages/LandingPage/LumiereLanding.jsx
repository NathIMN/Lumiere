import { Particles } from '../../components/landing/Particles';
import { HeaderLanding } from '../../components/landing/HeaderLanding';
import { CardsFeatures } from '../../components/landing/CardsFeatures';
import { HeroLanding } from '../../components/landing/HeroLanding';
import { RevealBento } from "../../components/RevealBento"; 
import { DrawCircleText } from '../../components/DrawCircleText';
import { LandingFooter } from '../../components/landing/LandingFooter';
import { useState, useEffect } from 'react';
import {LogoLoop} from '../../components/LogoLoop';
import { SiReact, SiNextdotjs, SiTypescript, SiTailwindcss } from 'react-icons/si';

const techLogos = [
  { node: <SiReact />, title: "React", href: "https://react.dev" },
  { node: <SiNextdotjs />, title: "Next.js", href: "https://nextjs.org" },
  { node: <SiTypescript />, title: "TypeScript", href: "https://www.typescriptlang.org" },
  { node: <SiTailwindcss />, title: "Tailwind CSS", href: "https://tailwindcss.com" },
];

// Alternative with image sources
const imageLogos = [
  { src: "/logos/company1.png", alt: "Company 1", href: "https://company1.com" },
  { src: "/logos/company2.png", alt: "Company 2", href: "https://company2.com" },
  { src: "/logos/company3.png", alt: "Company 3", href: "https://company3.com" },
];

export const LumiereLanding = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 900);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="flex-1 flex flex-col">
      {/* Header Section */}
      <HeaderLanding scrolled={scrolled}/>
     
<section id="home">
        <HeroLanding />
        </section>

        <section id="features">
        <DrawCircleText />
</section>


        <section id="faq">
        <CardsFeatures />
</section>
        
        <section id="reviews">
        <RevealBento />
</section>
    <div style={{ height: '70px', position: 'relative', overflow: 'hidden'}}>
      <LogoLoop
        logos={techLogos}
        speed={120}
        direction="left"
        logoHeight={48}
        gap={40}
        pauseOnHover
        scaleOnHover
        fadeOut
        fadeOutColor="#ffffff"
        ariaLabel="Technology partners"
        //style=color: "#14094fff'
      />
    </div>

        <section id="reviews">
        <LandingFooter />
</section>
    

</div>
  )
}
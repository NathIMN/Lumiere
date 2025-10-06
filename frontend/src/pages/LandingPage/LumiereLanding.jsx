import { Particles } from '../../components/landing/Particles';
import { HeaderLanding } from '../../components/landing/HeaderLanding';
import { CardsFeatures } from '../../components/landing/CardsFeatures';
import { HeroLanding } from '../../components/landing/HeroLanding';
import { RevealBento } from "../../components/RevealBento";
import { DrawCircleText } from '../../components/DrawCircleText';
import { LandingFooter } from '../../components/landing/LandingFooter';
import { useState, useEffect } from 'react';
import { LogoLoop } from '../../components/LogoLoop';
import SwapColumn from '../../components/landing/SwapColumn';
import { CardSwap, Card } from '../../components/CardSwap';
import { SiReact, SiNextdotjs, SiTypescript, SiTailwindcss } from 'react-icons/si';
import { FAQ } from '../../components/landing/FAQ';

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

      <div className="flex-1 flex flex-col overflow-x-hidden">
         {/* Header Section */}
         <HeaderLanding scrolled={scrolled} />

         <section id="home">
            <HeroLanding />

            <DrawCircleText />
         </section>

         <section id="features">
            <CardsFeatures />
         </section>

         <section id="dashboards" className="relative flex items-center justify-between px-12 pb-12">
            {/* Left text */}
            <div className="max-w-xl text-left ml-[200px] space-y-4 ">
               <h2 className="text-6xl font-semibold text-red-900 leading-tight">
                  Get access to <br /> Sophisticated Dashboards
               </h2>
               <p className=" text-5xl font-bold text-[#151E3D]">
                  So you don't miss Anything!
               </p>
            </div>

            {/* Right cards */}
            <div style={{ height: '500px', position: 'relative', flexShrink: 0 }}>
               <CardSwap
                  cardDistance={60}
                  verticalDistance={70}
                  delay={5000}
                  pauseOnHover={false}
               >
                  <Card>
                     <h3 className="text-white">Card 1</h3>
                     <img src="/demos/5.png" alt="" className='cover'/>
                  </Card>
                  <Card>
                     <h3 className="text-white">Card 2</h3>
                     <img src="/demos/6.png" alt="" className='cover'/>
                  </Card>
                  <Card>
                     <h3 className="text-white">Card 3</h3>
                     <img src="/demos/1.png" alt="" className='cover'/>
                  </Card>
               </CardSwap>
            </div>
         </section>

         <section id="demo">
            <SwapColumn />
         </section>

         <section id="new">
            <RevealBento />
         </section>

                  <section id="faq">
            <FAQ />
         </section>

         {/*
         <div style={{ height: '70px', position: 'relative', overflow: 'hidden' }}>
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
         </div>  */}
         


            <LandingFooter />



      </div>
   )
}
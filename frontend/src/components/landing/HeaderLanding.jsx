import { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";


export function HeaderLanding({scrolled}) {
  const [activeSection, setActiveSection] = useState('home');

  // Navigation items
  const navItems = [
    { id: 'home', label: 'Home', href: '#home' },
    { id: 'features', label: 'Features', href: '#features' },
    { id: 'faq', label: 'FAQs', href: '#faq' },
    { id: 'reviews', label: 'Reviews', href: '#reviews' },
    { id: 'contact', label: 'Contact', href: '#contact' },
    { id: 'bla', label: 'Bla', href: '#bla' }
  ];

  // Scroll spy effect
  useEffect(() => {
    const handleScroll = () => {
      const sections = navItems.map(item => document.getElementById(item.id)).filter(Boolean);
      const scrollPosition = window.scrollY + 200; // Offset for header height

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];
        if (section && section.offsetTop <= scrollPosition) {
          setActiveSection(navItems[i].id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check initial position

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);


  // Smooth scroll to section
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const headerOffset = 120; // Account for fixed header
      const elementPosition = element.offsetTop;
      const offsetPosition = elementPosition - headerOffset;


      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <header className={`fixed top-5 left-1/2 -translate-x-1/2 z-[100] flex items-center justify-between p-4 w-[90%] md:w-[95%] lg:w-[80%] max-w-[1400px] rounded-[40px] transition-all duration-300 backdrop-blur-sm ${scrolled ? ' bg-red-900/90' : 'bg-transparent'}`}>
      
      {/* Logo + Brand */}
      <div className="flex items-center gap-8">
        <a href="#home" onClick={(e) => { e.preventDefault(); scrollToSection('home'); }}>
          <div className="inline-flex items-center gap-3 col-span-2">
            {/* Logo */}
            <img
              src="/LumiereLogo.svg"
              alt="Lumiere Logo"
              className="h-8 w-auto"
            />
          </div>
        </a>

        {/* Desktop Nav */}
        <nav className="hidden xl:flex items-center text-md gap-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => scrollToSection(item.id)}
              className={`px-4 py-2 rounded-full ${scrolled ? 'text-white' : 'text-red-900'} transition-all duration-300  ${
                activeSection === item.id 
                  ? 'bg-white text-red-900 font-medium' 
                  : 'hover:bg-white/10'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Right Side (Desktop Actions) */}
      <div className="hidden xl:flex items-center gap-3">
        <a
          href="https://chromewebstore.google.com/detail/prompt-genie/inafdkdkghgibhijaplaobmomoahefin"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Get Chrome Extension"
          className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium h-9 px-6 py-2 rounded-full text-black border border-gray-400/50 hover:bg-transparent hover:text-accent-foreground transition-all duration-300"
        >
          Get Started
        </a>

    <button
      className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium shadow h-9 rounded-full bg-[#1A1A2E] text-white hover:bg-[#282845] px-6 py-2"
      onClick={() => navigate("/auth")}
    >
      Login
    </button>
      </div>

      {/* Mobile Nav Toggle - You'll need to implement mobile menu separately */}
      <div className="xl:hidden">
        <button
          type="button"
          aria-haspopup="dialog"
          aria-expanded="false"
          className="inline-flex items-center justify-center h-9 w-9 rounded-md text-sm font-medium hover:bg-accent hover:text-accent-foreground"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-white"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="4" y1="6" x2="20" y2="6" />
            <line x1="4" y1="12" x2="20" y2="12" />
            <line x1="4" y1="18" x2="20" y2="18" />
          </svg>
        </button>
      </div>
    </header>
  );
}
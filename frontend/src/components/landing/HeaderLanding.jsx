export function HeaderLanding() {
  return (

<header className="fixed top-5 left-1/2 -translate-x-1/2 z-[100] flex items-center justify-between p-4 w-[90%] md:w-[95%] lg:w-[80%] max-w-[1400px] bg-white rounded-[40px] border border-gray-200/50 shadow-lg">

        {/* Logo + Brand */}
        <div className="flex items-center gap-8">
          <a href="/">
        <div className="inline-flex items-center gap-3 col-span-2">
          {/* Logo */}
          <img
            src="/LumiereLogo.svg"
            alt="Lumiere Logo"
            className="h-8 w-auto"
          />

          {/* Brand name */}
          <span className="text-xl font-semibold">Lumiere</span>
        </div>

          </a>

          {/* Desktop Nav */}
          <nav className="hidden xl:flex items-center text-[#030712] gap-8">
            <a href="/" className="text-[#FC7A1F] hover:text-[#FC7A1F]">Home</a>
            <a href="/features" className="hover:text-[#FC7A1F]">Features</a>
            <a href="/faq" className="hover:text-[#FC7A1F]">FAQs</a>
            <a href="#" className="hover:text-[#FC7A1F]">Pricing</a>
            <a href="/contact-us" className="hover:text-[#FC7A1F]">Contact</a>
            <a href="#" className="hover:text-[#FC7A1F]">Reviews</a>
          </nav>
        </div>

        {/* Right Side (Desktop Actions) */}
        <div className="hidden xl:flex items-center gap-3">
          <a
            href="https://chromewebstore.google.com/detail/prompt-genie/inafdkdkghgibhijaplaobmomoahefin"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Get Chrome Extension"
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium h-9 px-6 py-2 rounded-full text-black border border-gray-400/50 hover:bg-transparent hover:text-accent-foreground"
          >
            Get Chrome Extension
          </a>

          <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium shadow h-9 rounded-full bg-[#1A1A2E] text-white hover:bg-[#282845] px-6 py-2">
            Login
          </button>
        </div>

        {/* Tablet Nav Toggle */}
        <div className="hidden lg:flex xl:hidden items-center gap-2">
          <button
            type="button"
            aria-haspopup="dialog"
            aria-expanded="false"
            className="inline-flex items-center justify-center h-9 w-9 rounded-md text-sm font-medium hover:bg-accent hover:text-accent-foreground"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-black"
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

        {/* Mobile Nav Toggle */}
        <div className="hidden md:flex lg:hidden items-center gap-2">
          <button
            type="button"
            aria-haspopup="dialog"
            aria-expanded="false"
            className="inline-flex items-center justify-center h-9 w-9 rounded-md text-sm font-medium hover:bg-accent hover:text-accent-foreground"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-black"
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

        {/* Small Mobile Nav Toggle */}
        <div className="md:hidden">
          <button
            type="button"
            aria-haspopup="dialog"
            aria-expanded="false"
            className="inline-flex items-center justify-center h-9 w-9 rounded-md text-sm font-medium hover:bg-accent hover:text-accent-foreground"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-black"
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

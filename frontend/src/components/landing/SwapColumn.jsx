import React, { useState, useEffect, useRef } from 'react';
import { Eye, Zap, Shield } from 'lucide-react';

const SwapColumnFeature = () => {
  const [currentSection, setCurrentSection] = useState(0);
  const scrollContainerRef = useRef();

  const features = [
    {
      icon: Eye,
      title: "It's simple",
      description: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Dolor iusto quaerat qui, illo incidunt suscipit fugiat distinctio officia earum eius quae officiis quis harum animi.",
      demoContent: "~ Show a part of your product that explains what \"It's simple\" means.",
      demoLeft: true
    },
    {
      icon: Zap,
      title: "It's lightning fast",
      description: "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam eaque ipsa quae ab illo inventore veritatis.",
      demoContent: "~ Performance metrics showing millisecond response times.",
      demoLeft: false
    },
    {
      icon: Shield,
      title: "It's secure",
      description: "At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias.",
      demoContent: "~ Security dashboard with encryption and safety features.",
      demoLeft: true
    }
  ];

  useEffect(() => {
    const handleScroll = () => {
      if (!scrollContainerRef.current) return;

      const container = scrollContainerRef.current;
      const scrollTop = container.scrollTop;
      const containerHeight = container.clientHeight;
      const totalScrollHeight = container.scrollHeight - containerHeight;

      // Calculate which section should be active based on scroll position
      const progress = scrollTop / totalScrollHeight;
      const sectionIndex = Math.floor(progress * features.length);
      const clampedIndex = Math.max(0, Math.min(features.length - 1, sectionIndex));
      
      setCurrentSection(clampedIndex);
    };

    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll, { passive: true });
      handleScroll();
    }

    return () => {
      if (container) {
        container.removeEventListener('scroll', handleScroll);
      }
    };
  }, [features.length]);

  const DemoWindow = ({ content, demoLeft, isActive }) => (
    <div className={`bg-gray-900 rounded-xl overflow-hidden shadow-2xl transform transition-all duration-500 ease-in-out ${
      isActive 
        ? 'opacity-100 scale-100' 
        : 'opacity-75 scale-95'
    }`}>
      <div className="flex items-center gap-2 px-4 py-3 bg-gray-800">
        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
      </div>
      
      <div className="p-6 min-h-[300px] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-6 opacity-20">
            <svg viewBox="0 0 100 100" className="w-full h-full text-gray-400">
              <circle cx="50" cy="40" r="25" fill="none" stroke="currentColor" strokeWidth="3"/>
              <circle cx="50" cy="40" r="8" fill="currentColor"/>
              <path d="M25 65 Q50 85 75 65" fill="none" stroke="currentColor" strokeWidth="3"/>
            </svg>
          </div>
          <p className="text-blue-400 font-mono text-sm leading-relaxed">
            {content}
          </p>
        </div>
      </div>
    </div>
  );

  const FeatureContent = ({ feature, demoLeft, isActive }) => {
    const Icon = feature.icon;
    
    return (
      <div className={`space-y-4 transform transition-all duration-500 ease-in-out ${
        isActive 
          ? 'opacity-100 scale-100' 
          : 'opacity-75 scale-95'
      }`}>
        <div className="inline-flex items-center bg-red-900 text-white px-3 py-1 rounded-full text-sm font-medium">
          Get noticed
        </div>
        
        
        <h2 className="text-4xl md:text-5xl font-bold text-[#151E3D] leading-tight">
          {feature.title}
        </h2>
        
        <p className="text-lg text-gray-600 leading-relaxed max-w-md">
          {feature.description}
        </p>
      </div>
    );
  };

  return (
    <div className="w-full h-[500px] bg-gray-300">
      
      {/* Scrollable container */}
      <div 
        ref={scrollContainerRef}
        className="h-full overflow-y-auto overflow-x-hidden scroll-smooth"
        style={{ 
          scrollBehavior: 'smooth scroll',
          height: '' // Subtract header height
        }}
      >
        {/* Single sticky content area that changes based on scroll */}
        <div className="sticky top-0 h-full flex items-center bg-gray-50 pt-20 pb-100">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="relative">
              {features.map((feature, index) => {
                const isActive = index === currentSection;
                
                return (
                  <div
                    key={index}
                    className={`absolute inset-0 transition-opacity duration-500 ease-in-out ${
                      isActive ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                    }`}
                  >
                    <div className="grid lg:grid-cols-2 gap-12 lg:gap-18 items-center">
                      {/* Demo Column - moves left/right based on demoLeft */}
                      <div className={`transition-all duration-700 ease-in-out ${
                        isActive
                          ? feature.demoLeft 
                            ? 'lg:order-1 transform translate-x-0' 
                            : 'lg:order-2 transform translate-x-0'
                          : feature.demoLeft
                            ? 'lg:order-1 transform -translate-x-full'
                            : 'lg:order-2 transform translate-x-full'
                      }`}>
                        <DemoWindow 
                          content={feature.demoContent}
                          demoLeft={feature.demoLeft}
                          isActive={isActive}
                        />
                      </div>
                      
                      {/* Text Column - always opposite of demo */}
                      <div className={`transition-all duration-700 ease-in-out delay-150 ${
                        isActive
                          ? feature.demoLeft 
                            ? 'lg:order-2 transform translate-x-0' 
                            : 'lg:order-1 transform translate-x-0'
                          : feature.demoLeft
                            ? 'lg:order-2 transform translate-x-full'
                            : 'lg:order-1 transform -translate-x-full'
                      }`}>
                        <FeatureContent 
                          feature={feature}
                          demoLeft={feature.demoLeft}
                          isActive={isActive}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Invisible scroll sections to trigger transitions */}
        {features.map((_, index) => (
          <div key={`scroll-${index}`} className="h-screen"></div>
        ))}

        {/* Bottom spacer */}
        <div className="h-32"></div>
      </div>
    </div>
  );
};

export default SwapColumnFeature;
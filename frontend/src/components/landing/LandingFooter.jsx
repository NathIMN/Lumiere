import { Twitter, Facebook, Instagram } from 'lucide-react';

export function LandingFooter() {
  return (
    <footer className="bg-gradient-to-br from-black via-red-900 to-[#151E3D] text-white py-20 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          
          {/* Left Section - Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <h1 className="text-4xl md:text-5xl  leading-tight">
              Lumiere<br />
              helps you declutter<br />
              your claim management.
            </h1>
            
            <button className="bg-transparent border border-white/30 text-white px-8 py-3 rounded-md font-medium hover:bg-white/10 transition-all duration-300">
              Contact Lumiere Team
            </button>
          </div>

          {/* Platform Column */}
          <div className="space-y-6">
            <h3 className="text-white font-semibold text-lg">Platform</h3>
            <ul className="space-y-4">
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">
                  About
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">
                  Features
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">
                  Pricing & Plans
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Resources Column */}
          <div className="space-y-6">
            <h3 className="text-white font-semibold text-lg">Resources</h3>
            <ul className="space-y-4">
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">
                  Account
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">
                  Tools
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">
                  Newsletter
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">
                  FAQ
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mt-16 pt-8 border-t border-gray-800">
          
          {/* Legals */}
          <div className="flex flex-wrap gap-6 mb-6 md:mb-0">
            <h4 className="text-white font-semibold">Legals</h4>
            <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">
              Guides
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">
              Terms & Conditions
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">
              Privacy Policy
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">
              Licensing
            </a>
          </div>

          {/* Social Links */}
          <div className="flex items-center gap-6">
            <span className="text-gray-400 text-sm">Follow us on:</span>
            <div className="flex gap-4">
              <a 
                href="#" 
                className="text-gray-400 hover:text-white transition-colors duration-300"
                aria-label="Twitter"
              >
                <Twitter size={20} />
              </a>
              <a 
                href="#" 
                className="text-gray-400 hover:text-white transition-colors duration-300"
                aria-label="Facebook"
              >
                <Facebook size={20} />
              </a>
              <a 
                href="#" 
                className="text-gray-400 hover:text-white transition-colors duration-300"
                aria-label="Instagram"
              >
                <Instagram size={20} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
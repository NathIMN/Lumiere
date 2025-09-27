import {Shield, Users, FileText, MessageCircle, Zap, ArrowRight, CheckCircle, Menu, X, Bot, Bell, Database, Lock, Clock, BarChart3, Upload, Eye, Search, ChevronLeft, ChevronRight, Star, Play, Pause } from 'lucide-react';

export function HeroLanding() {
  return (
    <div className="relative overflow-hidden">
      {/* Hero Section */}
      <section className="relative z-10 pt-32 pb-20 px-6 min-h-screen flex items-center overflow-hidden bg-[url('/bglandingnew.png')] bg-cover bg-center">
        <div className="max-w-7xl mx-auto w-full">
          <div className="text-right max-w-5xl ml-auto">
            
            {/* Main Heading */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight ">
              <span className="text-gray-900">More efficiency,</span>
              <br />
              <span className="bg-red-900 bg-clip-text text-transparent">less complexity</span>
              <br />
              <span className="text-gray-900 text-5xl">Manage claims with us</span>
            </h1>
            
            {/* Description */}
            <p className="text-md text-gray-600 mb-4 max-w-xl ml-auto leading-relaxed">
            Efficiency meets trust—process claims quickly while reducing costs. Empower your team and customers with a seamless, transparent experience.
            </p>
            
            {/* CTA Button */}
            <div className="mb-16">
              <button className="bg-red-900 text-white px-10 py-3  font-semibold text-lg hover:shadow-xl hover:shadow-orange-500/25 transition-all duration-300 hover:scale-105">
                Try Lumiere
              </button>
            </div>
          </div>


        </div>
      </section>
    </div>
  )
}
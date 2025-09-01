import {Shield, Users, FileText, MessageCircle, Zap, ArrowRight, CheckCircle, Menu, X, Bot, Bell, Database, Lock, Clock, BarChart3, Upload, Eye, Search, ChevronLeft, ChevronRight, Star, Play, Pause } from 'lucide-react';

export function HeroLanding() {
  return (
    <div>
             {/* Hero Section */}
             <section className="relative z-10 pb-20 px-6 min-h-screen flex items-center">
               <div className="max-w-7xl mx-auto w-full">
                 <div className="text-center max-w-4xl mx-auto">
                   <div className="inline-flex items-center space-x-2 bg-white/60 backdrop-blur-sm border border-gray-200/50 rounded-full px-4 py-2 mb-8">
                     <Zap className="w-4 h-4 text-orange-500" />
                     <span className="text-sm text-gray-700">Revolutionizing Insurance Claims</span>
                   </div>
                   
                   <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold mb-8 leading-none">
                     <span className="bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                       Unified
                     </span>
                     <br />
                     <span className="text-gray-700">Insurance</span>
                     <br />
                     <span className="bg-gradient-to-r from-orange-400 via-pink-500 to-red-500 bg-clip-text text-transparent">
                       Claims
                     </span>
                   </h1>
                   
                   <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
                     Transform your corporate insurance claim management with our intelligent platform. 
                     From submission to approval, experience seamless collaboration across all stakeholders.
                   </p>
                   
                   <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
                     <button className="group bg-gradient-to-r from-orange-500 to-pink-500 text-white px-8 py-4 rounded-full font-medium text-lg hover:shadow-2xl hover:shadow-pink-500/25 transition-all duration-300 flex items-center space-x-2">
                       <span>Start Your Journey</span>
                       <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                     </button>
                     <button className="px-8 py-4 rounded-full border border-gray-300 hover:border-gray-400 text-gray-700 hover:text-gray-900 transition-all duration-300 font-medium text-lg">
                       Watch Demo
                     </button>
                   </div>
                 </div>
               </div>
             </section>
       
    </div>
  )
}

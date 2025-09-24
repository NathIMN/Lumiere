import {Shield, Users, FileText, MessageCircle, Zap, ArrowRight, CheckCircle, Menu, X, Bot, Bell, Database, Lock, Clock, BarChart3, Upload, Eye, Search, ChevronLeft, ChevronRight, Star, Play, Pause } from 'lucide-react';

export function HeroLanding() {
  return (
    <div className="relative overflow-hidden bg-white">
      {/* Hero Section */}
      <section className="relative z-10 pt-32 pb-20 px-6 min-h-screen flex items-center bg-white">
        <div className="max-w-7xl mx-auto w-full">
          <div className="text-center max-w-5xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center space-x-2 bg-orange-50 border border-orange-200 rounded-full px-6 py-3 mb-8">
              <Zap className="w-5 h-5 text-orange-500" />
              <span className="text-sm font-medium text-orange-700">Revolutionizing Insurance Claims</span>
            </div>
            
            {/* Main Heading */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              <span className="text-gray-900">More efficiency,</span>
              <br />
              <span className="bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">less complexity</span>
              <br />
              <span className="text-gray-900">Get your claims sorted</span>
            </h1>
            
            {/* Description */}
            <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
              Time is money, and our intelligent platform helps you save both. Automate your most repetitive 
              tasks, reduce operational costs, and watch as your team's productivity soars.
            </p>
            
            {/* CTA Button */}
            <div className="mb-16">
              <button className="bg-gradient-to-r from-orange-500 to-pink-500 text-white px-10 py-4 rounded-full font-semibold text-lg hover:shadow-xl hover:shadow-orange-500/25 transition-all duration-300 hover:scale-105">
                Take Control of Your Claims Now
              </button>
            </div>
          </div>

          {/* Tilted Cards Section */}
          <div className="relative w-full mt-20 px-4">
            <div className="flex justify-center items-center space-x-8">
              
              {/* Card 1 */}
              <div className="flex-shrink-0 transform rotate-12 hover:rotate-6 transition-transform duration-500 hover:scale-105">
                <div className="w-56 h-72 rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br from-blue-50 to-blue-100">
                  <div className="h-full flex flex-col justify-between p-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                        <FileText className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800">Claims Processing</h3>
                        <p className="text-sm text-gray-600">Automated workflow</p>
                      </div>
                    </div>
                    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">Processing Time</span>
                        <span className="text-sm font-semibold text-green-600">-75%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full w-3/4"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 2 */}
              <div className="flex-shrink-0 transform -rotate-6 hover:rotate-0 transition-transform duration-500 hover:scale-105">
                <div className="w-56 h-72 rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br from-orange-50 to-pink-50">
                  <div className="h-full flex flex-col justify-between p-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
                        <Users className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800">Team Collaboration</h3>
                        <p className="text-sm text-gray-600">Real-time updates</p>
                      </div>
                    </div>
                    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">Team Efficiency</span>
                        <span className="text-sm font-semibold text-orange-600">+90%</span>
                      </div>
                      <div className="flex space-x-2 mt-3">
                        <div className="w-8 h-8 bg-orange-400 rounded-full flex items-center justify-center text-white text-xs font-semibold">AJ</div>
                        <div className="w-8 h-8 bg-pink-400 rounded-full flex items-center justify-center text-white text-xs font-semibold">MK</div>
                        <div className="w-8 h-8 bg-blue-400 rounded-full flex items-center justify-center text-white text-xs font-semibold">SK</div>
                        <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 text-xs">+5</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 3 - Center/Main */}
              <div className="flex-shrink-0 transform rotate-3 hover:rotate-0 transition-transform duration-500 hover:scale-110 z-10">
                <div className="w-64 h-80 rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br from-gray-50 to-gray-100">
                  <div className="h-full flex flex-col justify-between p-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center">
                        <BarChart3 className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800">Analytics Dashboard</h3>
                        <p className="text-sm text-gray-600">Smart insights</p>
                      </div>
                    </div>
                    <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Claims Resolved</span>
                          <span className="text-lg font-bold text-green-600">2,847</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Avg. Resolution Time</span>
                          <span className="text-lg font-bold text-blue-600">2.4 days</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Customer Satisfaction</span>
                          <span className="text-lg font-bold text-orange-600">98.5%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 4 */}
              <div className="flex-shrink-0 transform -rotate-12 hover:-rotate-6 transition-transform duration-500 hover:scale-105">
                <div className="w-56 h-72 rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br from-green-50 to-emerald-50">
                  <div className="h-full flex flex-col justify-between p-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                        <Shield className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800">Security & Compliance</h3>
                        <p className="text-sm text-gray-600">Enterprise grade</p>
                      </div>
                    </div>
                    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4">
                      <div className="flex items-center space-x-2 mb-3">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <span className="text-sm text-gray-700">SOC 2 Compliant</span>
                      </div>
                      <div className="flex items-center space-x-2 mb-3">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <span className="text-sm text-gray-700">GDPR Ready</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <span className="text-sm text-gray-700">256-bit Encryption</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 5 */}
              <div className="flex-shrink-0 transform rotate-8 hover:rotate-4 transition-transform duration-500 hover:scale-105">
                <div className="w-56 h-72 rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br from-purple-50 to-indigo-50">
                  <div className="h-full flex flex-col justify-between p-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
                        <Bot className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800">AI Assistant</h3>
                        <p className="text-sm text-gray-600">Smart automation</p>
                      </div>
                    </div>
                    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">Tasks Automated</span>
                        <span className="text-sm font-semibold text-purple-600">85%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-gradient-to-r from-purple-400 to-indigo-500 h-2 rounded-full w-5/6"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

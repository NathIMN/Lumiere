

export const EmployeeOverview = () => {
  return (
    <div className="h-[2000px] ">
            <section className="relative h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10 text-center text-white px-4">
          <h2 className="text-5xl font-bold mb-6">Welcome to Lumiere</h2>
          <p className="text-xl mb-8 max-w-2xl">
            Experience the magic of transparent headers that adapt to your scroll position
          </p>
          <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
            Get Started
          </button>
        </div>
      </section>
    </div>
  )
}

import { Laptop, ShieldCheck, Wrench } from "lucide-react";

export function FeaturesGrid() {
  const features = [
    {
      title: "Programming",
      icon: <Laptop className="w-12 h-12 text-gradient" />,
      content:
        "Lorem ipsum dolor sit amet consectetur adipisicing elit. Vel, voluptatum. Magni hic, voluptate debitis esse corporis dolor laudantium quae quo!",
      gradient: "from-rose-400 to-sky-400",
    },
    {
      title: "Security",
      icon: <ShieldCheck className="w-12 h-12 text-gradient" />,
      content:
        "Lorem ipsum dolor sit amet consectetur adipisicing elit. Vel, voluptatum. Magni hic, voluptate debitis esse corporis dolor laudantium quae quo!",
      gradient: "from-emerald-400 to-blue-500",
    },
    {
      title: "Maintenance",
      icon: <Wrench className="w-12 h-12 text-gradient" />,
      content:
        "Lorem ipsum dolor sit amet consectetur adipisicing elit. Vel, voluptatum. Magni hic, voluptate debitis esse corporis dolor laudantium quae quo!",
      gradient: "from-purple-400 to-pink-400",
    },
  ];

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-5xl mx-auto grid grid-cols-[repeat(auto-fit,minmax(20rem,1fr))] gap-8">
        {features.map((feature, idx) => (
          <div
            key={idx}
            className={`
    p-10 rounded-3xl 
    shadow-[inset_-2px_2px_0px_rgba(255,255,255,1),-20px_20px_40px_rgba(0,0,0,0.25)]
    grid grid-rows-[auto_auto_1fr_auto] gap-6 
    bg-gradient-to-bl from-slate-200 to-slate-100 
    relative overflow-hidden
            `}
          >
            <div className="flex justify-between items-end">
              <h2 className="text-xl font-semibold uppercase text-gray-700">
                {feature.title}
              </h2>
              <div
                className={`text-transparent bg-clip-text bg-gradient-to-r ${feature.gradient}`}
              >
                {feature.icon}
              </div>
            </div>

            <p className="text-gray-600">{feature.content}</p>

            {/* Bottom Gradient Bar */}
            <div
              className={`h-1 w-full rounded-full bg-gradient-to-r ${feature.gradient}`}
            ></div>
          </div>
        ))}
      </div>
    </div>
  );
}

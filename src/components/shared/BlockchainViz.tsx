export default function BlockchainViz() {
  const bars = [
    { height: "40%", delay: "0s" },
    { height: "70%", delay: "0.2s" },
    { height: "100%", delay: "0.4s" },
    { height: "60%", delay: "0.6s" },
    { height: "85%", delay: "0.8s" },
  ];

  return (
    <div className="flex items-end justify-center gap-1.5 h-16 py-2">
      {bars.map((bar, i) => (
        <div
          key={i}
          className="w-2 bg-gradient-to-t from-cyan to-cyan/20 rounded-t origin-bottom animate-bc-pulse"
          style={{
            height: bar.height,
            animationDelay: bar.delay,
          }}
        />
      ))}
    </div>
  );
}

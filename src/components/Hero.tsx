import heroImage from "@/assets/hero.jpg";

export function Hero() {
  return (
    <header className="relative flex h-[40vh] items-center overflow-hidden">
      <img
        src={heroImage}
        alt="Close-up of soccer jersey fabric texture under stadium lights"
        width={1920}
        height={600}
        className="absolute inset-0 h-full w-full object-cover opacity-40"
        priority
      />
      <div className="absolute inset-0 bg-gradient-to-r from-pitch/80 via-pitch/40 to-transparent" />
      <div className="relative z-10 px-8 md:px-16">
        <h1 className="font-display text-6xl font-black italic leading-[0.85] tracking-tighter md:text-8xl">
          THE
          <br />
          <span className="text-brand">CATALOG.</span>
        </h1>
      </div>
    </header>
  );
}

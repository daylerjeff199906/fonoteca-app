import Image from "next/image";

export function AuthShell({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return <main className="min-h-svh bg-[#05070a] text-white lg:grid lg:grid-cols-[minmax(420px,32%)_1fr]">
    <section className="flex min-h-svh items-center justify-center px-5 py-10 sm:px-10 lg:px-14">
      <div className="w-full max-w-md"><div className="mb-10 flex items-center gap-3 lg:hidden"><Image src="/brands/logo-iiap.webp" alt="IIAP" width={48} height={48} className="rounded-xl border border-white/20"/><span className="font-semibold">IIAP</span></div><div className="mb-8 space-y-3"><h1 className="text-3xl font-bold tracking-tight">{title}</h1><p className="max-w-sm text-base leading-6 text-slate-300">{description}</p></div>{children}</div>
    </section>
    <aside className="relative hidden overflow-hidden border-l border-white/10 bg-[#07131e] lg:flex lg:min-h-svh lg:flex-col lg:justify-between lg:p-14">
      <div className="pointer-events-none absolute inset-0 opacity-80" style={{ backgroundImage: "radial-gradient(circle at 70% 70%, rgba(45, 116, 176, .5), transparent 29%), radial-gradient(ellipse at 52% 115%, #0b3358 0%, #06121d 43%, #03070d 70%)" }} />
      <div className="relative flex items-center gap-5"><Image src="/brands/logo-iiap.webp" alt="Instituto de Investigaciones de la Amazonía Peruana" width={120} height={120} className="rounded-3xl border border-white/20"/><div><p className="text-3xl font-bold tracking-tight">IIAP</p><p className="mt-1 text-lg text-slate-300">Instituto de Investigaciones de la Amazonía Peruana</p></div></div>
      <div className="relative max-w-4xl"><h2 className="text-5xl font-semibold leading-tight tracking-tight">Gestión inteligente para la investigación científica.</h2><p className="mt-5 max-w-2xl text-xl leading-8 text-slate-200">Organiza, colabora y descubre con la plataforma de gestión biológica más avanzada.</p><p className="mt-12 border-l-8 border-sky-400 pl-4 text-base text-slate-300">Instituto de Investigaciones de la Amazonía Peruana</p></div>
    </aside>
  </main>;
}

function PremiumPageHeader({ eyebrow, title, description, actions, icon: Icon }) {
  return (
    <section className="relative overflow-hidden rounded-[22px] border border-[#313335] bg-[linear-gradient(120deg,#191b1d_0%,#25282b_62%,#34312b_100%)] px-5 py-5 text-white shadow-[0_16px_38px_rgba(27,29,31,0.15)] sm:px-6 sm:py-6">
      <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 hidden w-[42%] opacity-20 md:block">
        <div className="absolute -right-12 top-4 h-36 w-64 rotate-[-12deg] border border-[#d6b56d]" />
        <div className="absolute right-10 top-10 h-32 w-56 rotate-[-12deg] border border-[#d6b56d]" />
        <div className="absolute right-28 top-16 h-28 w-48 rotate-[-12deg] border border-[#d6b56d]" />
      </div>
      <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          {Icon && <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#d6b56d]/50 bg-white/10 text-[#e1bd70]"><Icon size={19} /></span>}
          <div className="min-w-0">
            {eyebrow && <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#e1bd70]">{eyebrow}</p>}
            <h1 className="mt-1 text-2xl font-black tracking-tight text-white sm:text-[30px]">{title}</h1>
            {description && <p className="mt-1 max-w-2xl text-xs leading-5 text-white/65 sm:text-sm">{description}</p>}
          </div>
        </div>
        {actions && <div className="relative z-20 flex shrink-0 flex-wrap gap-2 [&_button]:min-h-10 [&_button]:rounded-xl [&_button]:border [&_button]:border-white/20 [&_button]:bg-white/10 [&_button]:px-4 [&_button]:font-bold [&_button]:text-white [&_button]:shadow-none [&_button]:transition [&_button:hover]:bg-white/20">{actions}</div>}
      </div>
    </section>
  )
}

export default PremiumPageHeader

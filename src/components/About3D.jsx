function AboutVisual() {
  return (
    <div className="relative h-[450px] md:h-[600px] overflow-hidden rounded-[32px] md:rounded-[40px] shadow-2xl">

      <img
        src="https://images.unsplash.com/photo-1511818966892-d7d671e672a2?q=80&w=1600&auto=format&fit=crop"
        alt=""
        className="w-full h-full object-cover"
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

      {/* Top Badge */}
<div className="absolute top-4 left-4 md:top-8 md:left-8">
  <div
    className="
      bg-white/10
      backdrop-blur-xl
      border border-white/20
      px-3 py-2
      md:px-5 md:py-3
      rounded-full
      max-w-[180px]
      md:max-w-none
    "
  >
    <span
      className="
        text-white
        text-[10px]
        md:text-sm
        tracking-[2px]
        md:tracking-[4px]
        uppercase
      "
    >
      Premium Properties
    </span>
  </div>
</div>

      {/* Floating Card */}
<div
  className="
    absolute
    top-4
    right-4

    md:top-10
    md:right-10

    bg-white
    rounded-2xl
    md:rounded-3xl

    px-4
    py-3

    md:px-6
    md:py-6

    shadow-2xl
  "
>
  <h4
    className="
      text-2xl
      md:text-4xl
      font-black
      leading-none
    "
  >
    1.2K+
  </h4>

  <p
    className="
      text-xs
      md:text-base
      text-gray-500
      mt-1
    "
  >
    Active Listings
  </p>
</div>

    </div>
  )
}

export default AboutVisual
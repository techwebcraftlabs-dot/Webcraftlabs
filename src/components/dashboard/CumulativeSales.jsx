import {
  Building2,
  Medal,
  TrendingUp,
  Users
} from 'lucide-react'

function CumulativeSales() {
  const peso = '\u20b1'

  const agentSales = [
    {
      name: 'Maria Santos',
      team: 'North Luzon Team',
      units: 28,
      salesValue: 184.5
    },
    {
      name: 'Juan Dela Cruz',
      team: 'Metro Manila Team',
      units: 24,
      salesValue: 162.8
    },
    {
      name: 'Angela Reyes',
      team: 'South Luzon Team',
      units: 21,
      salesValue: 139.6
    },
    {
      name: 'Paolo Garcia',
      team: 'Visayas Team',
      units: 18,
      salesValue: 118.2
    }
  ]

  const developerSales = [
    { developer: 'Ayala Land', salesValue: 820.4, units: 96 },
    { developer: 'SMDC', salesValue: 774.8, units: 118 },
    { developer: 'Megaworld', salesValue: 691.2, units: 84 },
    { developer: 'Federal Land', salesValue: 612.9, units: 73 },
    { developer: 'Robinsons Land', salesValue: 548.6, units: 69 },
    { developer: 'Vista Land', salesValue: 501.3, units: 77 },
    { developer: 'DMCI Homes', salesValue: 463.1, units: 62 },
    { developer: 'Filinvest', salesValue: 421.7, units: 58 },
    { developer: 'Rockwell Land', salesValue: 386.5, units: 41 },
    { developer: 'Century Properties', salesValue: 342.9, units: 39 }
  ]

  const topDeveloperSales = developerSales[0].salesValue

  const formatSales = (value) => `${peso}${value.toFixed(1)}M`

  return (
    <div className="mt-7 grid grid-cols-1 gap-6 xl:grid-cols-[1fr_1.15fr]">
      <section className="rounded-3xl border border-[#e7ecf3] bg-white p-6 shadow-[0_14px_35px_rgba(15,23,42,0.05)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black tracking-tight text-[#2f211b]">
              Overall Cumulative Sales
            </h2>

            <p className="mt-1 text-sm text-[#64748b]">
              Top performing agents by booked sales
            </p>
          </div>

          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#eef4ff] text-[#2563eb]">
            <TrendingUp size={24} />
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-[#e8edf4] bg-gradient-to-br from-[#f8fafc] to-white p-5">
          <p className="text-sm font-medium text-[#64748b]">
            Total Agent Sales
          </p>

          <div className="mt-2 flex flex-wrap items-end gap-x-4 gap-y-2">
            <h3 className="text-4xl font-black tracking-tight text-[#172033] lg:text-5xl">
              {formatSales(605.1)}
            </h3>

            <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-bold text-emerald-700">
              +18.4% this quarter
            </span>
          </div>
        </div>

        <div className="mt-5 space-y-3">
          {agentSales.map((agent, index) => (
            <div
              key={agent.name}
              className="flex items-center justify-between gap-4 rounded-2xl border border-[#edf1f6] px-4 py-3 transition hover:border-[#dfe6ef] hover:bg-[#fbfcfe]"
            >
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#3b281f] font-black text-white">
                  {index + 1}
                </div>

                <div className="min-w-0">
                  <h3 className="truncate font-bold text-[#2f211b]">
                    {agent.name}
                  </h3>

                  <p className="truncate text-sm text-[#64748b]">
                    {agent.team} | {agent.units} units
                  </p>
                </div>
              </div>

              <p className="whitespace-nowrap font-black text-[#2f211b]">
                {formatSales(agent.salesValue)}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-[#e7ecf3] bg-white p-6 shadow-[0_14px_35px_rgba(15,23,42,0.05)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black tracking-tight text-[#2f211b]">
              Top 10 Developer Cumulative Sales
            </h2>

            <p className="mt-1 text-sm text-[#64748b]">
              Developer ranking by booked inventory value
            </p>
          </div>

          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#fff6e6] text-[#b87922]">
            <Building2 size={24} />
          </div>
        </div>

        <div className="mt-6 space-y-3">
          {developerSales.map((developer, index) => {
            const width =
              Math.max((developer.salesValue / topDeveloperSales) * 100, 12)

            return (
              <div
                key={developer.developer}
                className="grid grid-cols-[44px_1fr_auto] items-center gap-3"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f7f9fc] font-black text-[#2f211b]">
                  {index < 3 ? <Medal size={19} /> : index + 1}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="truncate font-bold text-[#2f211b]">
                      {developer.developer}
                    </h3>

                    <span className="whitespace-nowrap text-xs text-[#64748b]">
                      {developer.units} units
                    </span>
                  </div>

                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#eef2f7]">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#b98943] to-[#d6a75d]"
                      style={{ width: `${width}%` }}
                    />
                  </div>
                </div>

                <p className="whitespace-nowrap font-black text-[#2f211b]">
                  {formatSales(developer.salesValue)}
                </p>
              </div>
            )
          })}
        </div>

        <div className="mt-6 flex items-center gap-2 rounded-2xl bg-[#f8fafc] px-4 py-3 text-sm font-medium text-[#64748b]">
          <Users size={16} />
          Based on sample dashboard sales data
        </div>
      </section>
    </div>
  )
}

export default CumulativeSales

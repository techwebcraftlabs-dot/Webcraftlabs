import {
  Users,
  Building2,
  Home,
  ClipboardCheck
} from 'lucide-react'

function StatsCards() {

  const stats = [
    {
      title: 'Total Agents',
      value: '2,000',
      icon: <Users size={24} />,
      color: 'bg-blue-100 text-blue-600'
    },
    {
      title: 'Total Developers',
      value: '300',
      icon: <Building2 size={24} />,
      color: 'bg-blue-100 text-blue-600'
    },
    {
      title: 'Total Properties',
      value: '1,200+',
      icon: <Home size={24} />,
      color: 'bg-blue-100 text-blue-600'
    },
    {
      title: 'For Approval',
      value: '45',
      icon: <ClipboardCheck size={24} />,
      color: 'bg-blue-100 text-blue-600'
    }
  ]

  return (

    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mt-8">

      {stats.map((item, index) => (

        <div
          key={index}
          className="
            bg-white
            rounded-3xl
            p-6
            shadow-sm
            border
            border-gray-100
            hover:shadow-lg
            transition-all
            duration-300
          "
        >

          <div className="flex items-center justify-between">

            <div>

              <p className="text-gray-500 text-sm">
                {item.title}
              </p>

              <h2 className="text-4xl font-black text-[#1f2937] mt-3">
                {item.value}
              </h2>

            </div>

            <div
              className={`
                w-14
                h-14
                rounded-2xl
                flex
                items-center
                justify-center
                ${item.color}
              `}
            >
              {item.icon}
            </div>

          </div>

        </div>

      ))}

    </div>

  )
}

export default StatsCards
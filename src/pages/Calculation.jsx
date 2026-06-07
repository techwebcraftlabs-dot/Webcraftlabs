import { useNavigate } from 'react-router-dom'

function Calculation() {

  const navigate = useNavigate()

  const buyers = [
    {
      id: 1,
      buyerName: 'Juan Dela Cruz',
      project: 'Castillon Homes',
      amount: 850000,
    },
    {
      id: 2,
      buyerName: 'Maria Santos',
      project: 'Bella Homes',
      amount: 1200000,
    },
    {
      id: 3,
      buyerName: 'John Reyes',
      project: 'Villa Elena',
      amount: 650000,
    },
  ]

  const handleView = (buyer) => {

    localStorage.setItem(
      'selectedBuyer',
      JSON.stringify(buyer)
    )

    navigate('/ratedistribution')

  }

  return (

    <section className="p-8">

      <h1 className="text-4xl font-black mb-8">
        Calculation Records
      </h1>

      <table className="w-full bg-white shadow-lg rounded-xl overflow-hidden">

        <thead>

          <tr className="bg-[#0d1b4c] text-white">

            <th className="p-4 text-left">
              Buyer
            </th>

            <th className="p-4 text-left">
              Project
            </th>

            <th className="p-4 text-left">
              Amount
            </th>

            <th className="p-4 text-left">
              Action
            </th>

          </tr>

        </thead>

        <tbody>

          {buyers.map((buyer) => (

            <tr
              key={buyer.id}
              className="border-b"
            >

              <td className="p-4">
                {buyer.buyerName}
              </td>

              <td className="p-4">
                {buyer.project}
              </td>

              <td className="p-4">
                ₱{buyer.amount.toLocaleString()}
              </td>

              <td className="p-4">

                <button
                  onClick={() => handleView(buyer)}
                  className="
                    bg-blue-500
                    text-white
                    px-4
                    py-2
                    rounded-lg
                    hover:bg-blue-600
                  "
                >
                  View
                </button>

              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </section>

  )
}

export default Calculation
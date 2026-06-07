import { useState } from "react";


function RateDistribution() {
  const [incentiveType, setIncentiveType] = useState("commission");
  const buyer =
    JSON.parse(
      localStorage.getItem('selectedBuyer')
    ) || {}

  const grossAmount = buyer.amount || 0

  const vatDeduction =
    grossAmount * 0.12

  const netOfVat =
    grossAmount - vatDeduction

  const developerRate = 8

  const distributionData = [
    {
      name: 'BATO',
      hlcRate: 4,
      taxable: true,
    },
    {
      name: 'RONALD',
      hlcRate: 0.5,
      taxable: true,
    },
    {
      name: 'ROSELYN',
      hlcRate: 1,
      taxable: true,
    },
    {
      name: 'ROSELYN',
      hlcRate: 1,
      taxable: true,
    },
    {
      name: 'JBA',
      hlcRate: 0.5,
      taxable: true,
    },
    {
      name: 'Zonal',
      hlcRate: 1,
      taxable: false,
    },
  ]
 

  return (

    <section className="p-8 bg-[#f5f5f5] min-h-screen">

      {/* HEADER */}
      <div className="flex items-center justify-between mb-8">

        <div>

          <h1 className="text-4xl font-black text-[#0d1b4c]">
  Commission Computation
</h1>

<p className="text-blue-600 font-semibold mt-2">
  Buyer: {buyer.buyerName || 'No Buyer Selected'}
</p>
        </div>

        <div
          className="
            bg-[#0d1b4c]
            text-white
            px-8
            py-5
            rounded-3xl
            shadow-xl
          "
        >

          <p className="text-sm opacity-80">
            Gross Amount
          </p>

          <h1 className="text-4xl font-black mt-2">
            ₱{grossAmount.toLocaleString()}
          </h1>

        </div>

      </div>
{/* SUMMARY */}
<div className="grid md:grid-cols-4 gap-5 mb-8">

  <div className="bg-white p-6 rounded-3xl shadow-lg">
    <p className="text-gray-500 text-sm">Gross Amount</p>
    <h1 className="text-3xl font-black text-[#0d1b4c] mt-2">
      ₱{grossAmount.toLocaleString()}
    </h1>
  </div>

  <div className="bg-white p-6 rounded-3xl shadow-lg">
    <p className="text-gray-500 text-sm">VAT (12%)</p>
    <h1 className="text-3xl font-black text-red-500 mt-2">
      ₱{vatDeduction.toLocaleString()}
    </h1>
  </div>

  <div className="bg-white p-6 rounded-3xl shadow-lg">
    <p className="text-gray-500 text-sm">Net Of VAT</p>
    <h1 className="text-3xl font-black text-green-600 mt-2">
      ₱{netOfVat.toLocaleString()}
    </h1>
  </div>

  <div className="bg-white p-6 rounded-3xl shadow-lg">
    <p className="text-gray-500 text-sm">Developer Rate</p>
    <h1 className="text-3xl font-black text-[#6c63ff] mt-2">
      {developerRate}%
    </h1>
  </div>

</div>

{/* INCENTIVE TYPE */}
<div className="bg-white p-6 rounded-3xl shadow-lg mb-8">

  <label className="block text-sm font-semibold text-gray-500 mb-2">
    Incentive Type
  </label>

  <select
    value={incentiveType}
    onChange={(e) => setIncentiveType(e.target.value)}
    className="
      w-full
      md:w-[350px]
      border
      border-gray-300
      rounded-xl
      px-4
      py-3
      outline-none
      focus:ring-2
      focus:ring-[#2563eb]
    "
  >
    <option value="commission">
      Commission Incentive
    </option>

    <option value="broker">
      Broker Incentive
    </option>

    <option value="teamleader">
      Team Leader Incentive
    </option>

    <option value="agent">
      Agent Incentive
    </option>

  </select>
</div>


      {/* TABLE */}
      <div className="bg-white rounded-3xl shadow-xl overflow-x-auto">

        <table className="w-full min-w-[1000px]">

          <thead>

            <tr className="bg-[#0d1b4c] text-white text-sm">

             <th className="p-4 text-left">
                Name
              </th>

              <th className="p-4 text-left">
                Role
              </th>

              <th className="p-4 text-left">
                Amount
              </th>

              <th className="p-4 text-left">
                Developer Rate
              </th>

              <th className="p-4 text-left">
                Net of VAT
              </th>

              <th className="p-4 text-left">
                HLC Rate
              </th>

              <th className="p-4 text-left">
                For Release
              </th>

              <th className="p-4 text-left">
                OPX
              </th>

              <th className="p-4 text-left">
                Savings
              </th>

              <th className="p-4 text-left">
                CA
              </th>

              <th className="p-4 text-left">
                Marketing
              </th>

              <th className="p-4 text-left">
                Ayuda
              </th>

              <th className="p-4 text-left">
                Others
              </th>

              <th className="p-4 text-left">
                Zonal Care
              </th>

              <th className="p-4 text-left">
                Tax Rate
              </th>

              <th className="p-4 text-left">
                Tax Amount
              </th>

              <th className="p-4 text-left">
                Net Amount
              </th>

            </tr>

          </thead>

          <tbody>

            {

              distributionData.map((person, index) => {

                const forRelease =
                  netOfVat *
                  (person.hlcRate / developerRate)

                const opx =
                  forRelease >= 200 &&
                  person.hlcRate >= 1 &&
                  person.name !== 'Zonal'
                    ? 50
                    : 0

                const taxAmount =
                  person.taxable
                    ? forRelease * 0.05
                    : 0

                return (

                  <tr
                    key={index}
                    className="
                      border-b
                      border-gray-200
                      hover:bg-[#fafafa]
                      transition-all
                      text-sm
                    "
                  >

                    {/* NAME */}
                    <td className="p-4 font-bold text-[#0d1b4c]">
                      {person.name}
                    </td>

                    {/* ROLE */}
                    <td className="p-4">
                      {person.role}
                    </td>

                    {/* AMOUNT */}
                    <td className="p-4">
                      ₱{grossAmount.toLocaleString()}
                    </td>

                    {/* DEV RATE */}
                    <td className="p-4">
                      {developerRate}%
                    </td>

                    {/* NET VAT */}
                    <td className="p-4 font-semibold">
                      ₱{netOfVat.toLocaleString()}
                    </td>

                    {/* HLC RATE */}
                    <td className="p-4">
                      {person.hlcRate}%
                    </td>

                    {/* FOR RELEASE */}
                    <td className="p-4 text-blue-600 font-bold">
                      ₱{forRelease.toLocaleString()}
                    </td>

                    {/* OPX */}
                    <td className="p-4 text-orange-500 font-semibold">

                      {
                        opx > 0
                          ? `₱${opx}`
                          : '-'
                      }

                    </td>

                    {/* SAVINGS */}
                    <td className="p-2">

                      <input
                        type="number"
                        placeholder="0"
                        onChange={(e) => {

                          const row =
                            e.target.parentElement.parentElement

                          const inputs =
                            row.querySelectorAll('input')

                          const savings =
                            Number(inputs[0].value) || 0

                          const ca =
                            Number(inputs[1].value) || 0

                          const marketing =
                            Number(inputs[2].value) || 0

                          const ayuda =
                            Number(inputs[3].value) || 0

                          const others =
                            Number(inputs[4].value) || 0

                          const zonalCare =
                            Number(inputs[5].value) || 0

                          const totalDeductions =
                            savings +
                            ca +
                            marketing +
                            ayuda +
                            others +
                            zonalCare

                          const finalNet =
                            forRelease -
                            opx -
                            taxAmount -
                            totalDeductions

                          row.querySelector('.net-result').innerHTML =
                            `₱${finalNet.toLocaleString()}`
                        }}
                        className="
                          w-[90px]
                          border
                          border-gray-300
                          rounded-lg
                          px-2
                          py-1
                          outline-none
                        "
                      />

                    </td>

                    {/* CA */}
                    <td className="p-2">

                      <input
                        type="number"
                        placeholder="0"
                        onChange={(e) => {

                          const row =
                            e.target.parentElement.parentElement

                          const inputs =
                            row.querySelectorAll('input')

                          const savings =
                            Number(inputs[0].value) || 0

                          const ca =
                            Number(inputs[1].value) || 0

                          const marketing =
                            Number(inputs[2].value) || 0

                          const ayuda =
                            Number(inputs[3].value) || 0

                          const others =
                            Number(inputs[4].value) || 0

                          const zonalCare =
                            Number(inputs[5].value) || 0

                          const totalDeductions =
                            savings +
                            ca +
                            marketing +
                            ayuda +
                            others +
                            zonalCare

                          const finalNet =
                            forRelease -
                            opx -
                            taxAmount -
                            totalDeductions

                          row.querySelector('.net-result').innerHTML =
                            `₱${finalNet.toLocaleString()}`
                        }}
                        className="
                          w-[90px]
                          border
                          border-gray-300
                          rounded-lg
                          px-2
                          py-1
                          outline-none
                        "
                      />

                    </td>

                    {/* MARKETING */}
                    <td className="p-2">

                      <input
                        type="number"
                        placeholder="0"
                        onChange={(e) => {

                          const row =
                            e.target.parentElement.parentElement

                          const inputs =
                            row.querySelectorAll('input')

                          const savings =
                            Number(inputs[0].value) || 0

                          const ca =
                            Number(inputs[1].value) || 0

                          const marketing =
                            Number(inputs[2].value) || 0

                          const ayuda =
                            Number(inputs[3].value) || 0

                          const others =
                            Number(inputs[4].value) || 0

                          const zonalCare =
                            Number(inputs[5].value) || 0

                          const totalDeductions =
                            savings +
                            ca +
                            marketing +
                            ayuda +
                            others +
                            zonalCare

                          const finalNet =
                            forRelease -
                            opx -
                            taxAmount -
                            totalDeductions

                          row.querySelector('.net-result').innerHTML =
                            `₱${finalNet.toLocaleString()}`
                        }}
                        className="
                          w-[90px]
                          border
                          border-gray-300
                          rounded-lg
                          px-2
                          py-1
                          outline-none
                        "
                      />

                    </td>

                    {/* AYUDA */}
                    <td className="p-2">

                      <input
                        type="number"
                        placeholder="0"
                        onChange={(e) => {

                          const row =
                            e.target.parentElement.parentElement

                          const inputs =
                            row.querySelectorAll('input')

                          const savings =
                            Number(inputs[0].value) || 0

                          const ca =
                            Number(inputs[1].value) || 0

                          const marketing =
                            Number(inputs[2].value) || 0

                          const ayuda =
                            Number(inputs[3].value) || 0

                          const others =
                            Number(inputs[4].value) || 0

                          const zonalCare =
                            Number(inputs[5].value) || 0

                          const totalDeductions =
                            savings +
                            ca +
                            marketing +
                            ayuda +
                            others +
                            zonalCare

                          const finalNet =
                            forRelease -
                            opx -
                            taxAmount -
                            totalDeductions

                          row.querySelector('.net-result').innerHTML =
                            `₱${finalNet.toLocaleString()}`
                        }}
                        className="
                          w-[90px]
                          border
                          border-gray-300
                          rounded-lg
                          px-2
                          py-1
                          outline-none
                        "
                      />

                    </td>

                    {/* OTHERS */}
                    <td className="p-2">

                      <input
                        type="number"
                        placeholder="0"
                        onChange={(e) => {

                          const row =
                            e.target.parentElement.parentElement

                          const inputs =
                            row.querySelectorAll('input')

                          const savings =
                            Number(inputs[0].value) || 0

                          const ca =
                            Number(inputs[1].value) || 0

                          const marketing =
                            Number(inputs[2].value) || 0

                          const ayuda =
                            Number(inputs[3].value) || 0

                          const others =
                            Number(inputs[4].value) || 0

                          const zonalCare =
                            Number(inputs[5].value) || 0

                          const totalDeductions =
                            savings +
                            ca +
                            marketing +
                            ayuda +
                            others +
                            zonalCare

                          const finalNet =
                            forRelease -
                            opx -
                            taxAmount -
                            totalDeductions

                          row.querySelector('.net-result').innerHTML =
                            `₱${finalNet.toLocaleString()}`
                        }}
                        className="
                          w-[90px]
                          border
                          border-gray-300
                          rounded-lg
                          px-2
                          py-1
                          outline-none
                        "
                      />

                    </td>

                    {/* ZONAL CARE */}
                    <td className="p-2">

                      <input
                        type="number"
                        placeholder="0"
                        onChange={(e) => {

                          const row =
                            e.target.parentElement.parentElement

                          const inputs =
                            row.querySelectorAll('input')

                          const savings =
                            Number(inputs[0].value) || 0

                          const ca =
                            Number(inputs[1].value) || 0

                          const marketing =
                            Number(inputs[2].value) || 0

                          const ayuda =
                            Number(inputs[3].value) || 0

                          const others =
                            Number(inputs[4].value) || 0

                          const zonalCare =
                            Number(inputs[5].value) || 0

                          const totalDeductions =
                            savings +
                            ca +
                            marketing +
                            ayuda +
                            others +
                            zonalCare

                          const finalNet =
                            forRelease -
                            opx -
                            taxAmount -
                            totalDeductions

                          row.querySelector('.net-result').innerHTML =
                            `₱${finalNet.toLocaleString()}`
                        }}
                        className="
                          w-[90px]
                          border
                          border-gray-300
                          rounded-lg
                          px-2
                          py-1
                          outline-none
                        "
                      />

                    </td>

                    {/* TAX RATE */}
                    <td className="p-4">

                      {
                        person.taxable
                          ? '5%'
                          : '-'
                      }

                    </td>

                    {/* TAX */}
                    <td className="p-4 text-red-500 font-semibold">

                      {
                        person.taxable
                          ? `₱${taxAmount.toLocaleString()}`
                          : '-'
                      }

                    </td>

                    {/* NET */}
                    <td className="p-4 text-green-600 font-black net-result">

                      ₱{
                        (
                          forRelease -
                          opx -
                          taxAmount
                        ).toLocaleString()
                      }

                    </td>

                  </tr>

                )
              })

            }

</tbody>

<tfoot>
  <tr className="bg-[#f3f4f6] font-bold border-t">

    <td className="p-4">TOTAL</td>
<td></td>
    <td></td>
    <td></td>
    <td></td>
    <td></td>

    <td className="p-4 text-blue-600">
      ₱176,000
    </td>

    <td className="p-4 text-orange-500">
      ₱150
    </td>

    
    <td></td>
    <td></td>
    <td></td>
    <td></td>
    <td></td>
    <td></td>

    <td></td>

    <td className="p-4 text-red-500">
      ₱7,700
    </td>

    <td className="p-4 text-green-600">
      ₱168,150
    </td>

  </tr>
</tfoot>

</table>

      </div> {/* TABLE */}

    </section>

  )
}

export default RateDistribution

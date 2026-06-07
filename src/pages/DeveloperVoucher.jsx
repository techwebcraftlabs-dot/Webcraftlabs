import { useState } from 'react'

function DeveloperVoucher({
  setActivePage,
}) {

  const [search, setSearch] =
    useState('')

  const [statusFilter, setStatusFilter] =
    useState('All')

  const [selectAll, setSelectAll] =
    useState(false)

  const [vouchers, setVouchers] =
    useState([
      {
        id: 1,
        selected: false,
        voucherNo: 'DV-0001',
        developer: 'SMDC',
        project: 'Cheer Residences',
        voucherDate: '06/15/2026',
        grossComm: 250000,
        status: 'For Release',
      },
      {
        id: 2,
        selected: false,
        voucherNo: 'DV-0002',
        developer: 'Ayala Land',
        project: 'Solara Park',
        voucherDate: '06/18/2026',
        grossComm: 180000,
        status: 'Released',
      },
      {
        id: 3,
        selected: false,
        voucherNo: 'DV-0003',
        developer: 'Megaworld',
        project: 'Maple Grove',
        voucherDate: '06/20/2026',
        grossComm: 320000,
        status: 'Hold',
      },
      {
        id: 4,
        selected: false,
        voucherNo: 'DV-0004',
        developer: 'Filinvest',
        project: 'The Enclave',
        voucherDate: '06/22/2026',
        grossComm: 145000,
        status: 'N/A',
      },
    ])

  const handleStatusChange = (
    id,
    value
  ) => {

    setVouchers(
      vouchers.map((item) =>
        item.id === id
          ? {
              ...item,
              status: value,
            }
          : item
      )
    )

  }

  const handleSelect = (id) => {

    setVouchers(
      vouchers.map((item) =>
        item.id === id
          ? {
              ...item,
              selected: !item.selected,
            }
          : item
      )
    )

  }

  const handleSelectAll = () => {

    const value = !selectAll

    setSelectAll(value)

    setVouchers(
      vouchers.map((item) => ({
        ...item,
        selected: value,
      }))
    )

  }

  const filteredData =
    vouchers.filter((item) => {

      const matchSearch =

        item.voucherNo
          .toLowerCase()
          .includes(search.toLowerCase()) ||

        item.developer
          .toLowerCase()
          .includes(search.toLowerCase()) ||

        item.project
          .toLowerCase()
          .includes(search.toLowerCase())

      const matchStatus =
        statusFilter === 'All'
          ? true
          : item.status === statusFilter

      return (
        matchSearch &&
        matchStatus
      )

    })

  const statusColor = (status) => {

    switch (status) {

      case 'For Release':
        return 'bg-blue-100 text-blue-700'

      case 'Hold':
        return 'bg-orange-100 text-orange-700'

      case 'Released':
        return 'bg-green-100 text-green-700'

      default:
        return 'bg-gray-100 text-gray-600'

    }

  }

  return (

    <div className="space-y-6">

      {/* HEADER */}

      <div className="bg-white rounded-[30px] p-8 shadow-sm">

        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-5">

          <div>

            <h1 className="text-3xl font-black text-[#1f2937]">
              Developer's Vouchers
            </h1>

            <p className="text-gray-500 mt-2">
              Manage commission voucher releases
            </p>

          </div>

          <div className="flex gap-3">

  <button
    onClick={() =>
      setActivePage('create-voucher')
    }
    className="
      px-5
      py-3
      rounded-xl
      bg-[#4f5dff]
      text-white
      font-semibold
    "
  >
    + Add Voucher
  </button>

  <button
    className="
      px-5
      py-3
      rounded-xl
      bg-red-500
      text-white
      font-semibold
    "
  >
    Export PDF
  </button>

  <button
    className="
      px-5
      py-3
      rounded-xl
      bg-green-600
      text-white
      font-semibold
    "
  >
    Export Excel
  </button>

</div>

        </div>

      </div>

      {/* FILTER */}

      <div className="bg-white rounded-[30px] p-6 shadow-sm">

        <div className="grid lg:grid-cols-2 gap-4">

          <input
            type="text"
            placeholder="Search voucher, developer or project..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            className="
              border
              border-gray-200
              rounded-xl
              px-4
              py-3
              outline-none
            "
          />

          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value)
            }
            className="
              border
              border-gray-200
              rounded-xl
              px-4
              py-3
            "
          >
            <option>All</option>
            <option>N/A</option>
            <option>For Release</option>
            <option>Hold</option>
            <option>Released</option>
          </select>

        </div>

      </div>

      {/* TABLE */}

      <div className="bg-white rounded-[30px] p-6 shadow-sm overflow-auto">

        <div className="mb-5">

          <label className="flex items-center gap-3">

            <input
              type="checkbox"
              checked={selectAll}
              onChange={handleSelectAll}
            />

            <span className="font-medium">
              Select All
            </span>

          </label>

        </div>

        <table className="w-full min-w-[900px]">

          <thead>

            <tr className="border-b">

              <th className="text-left py-4">
                Select
              </th>

              <th className="text-left py-4">
                Voucher No.
              </th>

              <th className="text-left py-4">
                Developer
              </th>

              <th className="text-left py-4">
                Project
              </th>

              <th className="text-left py-4">
                Voucher Date
              </th>

              <th className="text-left py-4">
                Gross Commission
              </th>

              <th className="text-left py-4">
                Status
              </th>

              <th className="text-left py-4">
                Action
              </th>

            </tr>

          </thead>

          <tbody>

            {filteredData.map((item) => (

              <tr
                key={item.id}
                className="border-b hover:bg-gray-50"
              >

                <td className="py-4">

                  <input
                    type="checkbox"
                    checked={item.selected}
                    onChange={() =>
                      handleSelect(item.id)
                    }
                  />

                </td>

                <td className="font-semibold">
                  {item.voucherNo}
                </td>

                <td>
                  {item.developer}
                </td>

                <td>
                  {item.project}
                </td>

                <td>
                  {item.voucherDate}
                </td>

                <td className="font-bold">
                  ₱{item.grossComm.toLocaleString()}
                </td>

                <td>

                  <select
                    value={item.status}
                    onChange={(e) =>
                      handleStatusChange(
                        item.id,
                        e.target.value
                      )
                    }
                    className={`
                      px-3
                      py-2
                      rounded-lg
                      text-sm
                      font-semibold
                      border-0
                      ${statusColor(item.status)}
                    `}
                  >
                    <option>N/A</option>
                    <option>For Release</option>
                    <option>Hold</option>
                    <option>Released</option>
                  </select>

                </td>

                <td>

                  <button
                    className="
                      px-4
                      py-2
                      rounded-lg
                      bg-[#4f5dff]
                      text-white
                      text-sm
                    "
                  >
                    View
                  </button>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>

  )

}

export default DeveloperVoucher
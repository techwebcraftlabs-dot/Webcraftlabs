import { useState } from 'react'
import {
  Plus,
  Search,
  ArrowLeft,
} from 'lucide-react'

function Agents() {

  const [showForm, setShowForm] =
    useState(false)

  const agents = [
    {
      code: '800123',
      role: 'HLC',
      name: 'Chamber Watson',
      team: 'ACHIEVERS',
      mobile: '09123456789',
      status: 'For Approval',
    },
    {
      code: '800124',
      role: 'HLC',
      name: 'Jett Bind',
      team: 'ACHIEVERS',
      mobile: '09123456789',
      status: 'Active',
    },
    {
      code: '800125',
      role: 'HLC',
      name: 'Raze Ascent',
      team: 'ACHIEVERS',
      mobile: '09123456789',
      status: 'Active',
    },
  ]

  if (showForm) {
    return (
      <div className="bg-white rounded-[30px] p-8 shadow-sm">

        {/* HEADER */}
        <div className="flex items-center justify-between mb-8">

          <div className="flex items-center gap-4">

            <button
              onClick={() => setShowForm(false)}
              className="
                w-10
                h-10
                rounded-xl
                bg-gray-100
                flex
                items-center
                justify-center
              "
            >
              <ArrowLeft size={18} />
            </button>

            <div>
              <h2 className="text-3xl font-black text-[#3b281f]">
                Add Agent
              </h2>

              <p className="text-gray-500">
                Create new agent account
              </p>
            </div>

          </div>

        </div>

        {/* FORM */}
        <div className="grid grid-cols-5 gap-5">

          <input
            placeholder="ID"
            className="border rounded-xl p-3"
          />

          <input
            placeholder="HLC Code"
            className="border rounded-xl p-3"
          />

          <input
            placeholder="Last Name"
            className="border rounded-xl p-3"
          />

          <input
            placeholder="First Name"
            className="border rounded-xl p-3"
          />

          <input
            placeholder="Middle Name"
            className="border rounded-xl p-3"
          />

          <select className="border rounded-xl p-3">
            <option>EVP</option>
          </select>

          <select className="border rounded-xl p-3">
            <option>Sales Director</option>
          </select>

          <select className="border rounded-xl p-3">
            <option>Team</option>
          </select>

          <input
            type="date"
            className="border rounded-xl p-3"
          />

          <input
            placeholder="Birth Place"
            className="border rounded-xl p-3"
          />

          <select className="border rounded-xl p-3">
            <option>Civil Status</option>
          </select>

          <select className="border rounded-xl p-3">
            <option>Gender</option>
          </select>

          <input
            placeholder="Address"
            className="border rounded-xl p-3 col-span-2"
          />

          <input
            placeholder="Email"
            className="border rounded-xl p-3"
          />

          <input
            placeholder="Mobile Number"
            className="border rounded-xl p-3"
          />

          <select className="border rounded-xl p-3">
            <option>HLC Locality</option>
          </select>

          <input
            placeholder="Recruiter"
            className="border rounded-xl p-3"
          />

          <input
            type="date"
            className="border rounded-xl p-3"
          />

          <select className="border rounded-xl p-3">
            <option>Role</option>
            <option>HLC</option>
            <option>Agent</option>
          </select>

        </div>

        {/* BUTTONS */}
        <div className="flex justify-end gap-4 mt-10">

          <button
            className="
              px-6
              py-3
              rounded-xl
              bg-gray-200
            "
          >
            Cancel
          </button>

          <button
            className="
              px-6
              py-3
              rounded-xl
              bg-green-600
              text-white
            "
          >
            Approve
          </button>

          <button
            className="
              px-6
              py-3
              rounded-xl
              bg-[#4f5dff]
              text-white
            "
          >
            Save
          </button>

        </div>

      </div>
    )
  }

  return (
    <div className="bg-white rounded-[30px] p-8 shadow-sm">

      {/* HEADER */}
      <div className="flex items-center justify-between mb-8">

        <div>

          <h2 className="text-3xl font-black text-[#3b281f]">
            Agents
          </h2>

          <p className="text-gray-500">
            Manage all agents
          </p>

        </div>

        <button
          onClick={() => setShowForm(true)}
          className="
            flex
            items-center
            gap-2
            px-5
            py-3
            rounded-xl
            bg-[#4f5dff]
            text-white
          "
        >
          <Plus size={18} />
          Add Agent
        </button>

      </div>

      {/* SEARCH */}
      <div className="flex gap-4 mb-6">

        <div className="relative flex-1">

          <Search
            size={18}
            className="
              absolute
              left-4
              top-1/2
              -translate-y-1/2
              text-gray-400
            "
          />

          <input
            placeholder="Search agent..."
            className="
              w-full
              border
              rounded-xl
              py-3
              pl-12
              pr-4
            "
          />

        </div>

        <select
          className="
            border
            rounded-xl
            px-4
          "
        >
          <option>All Status</option>
          <option>Active</option>
          <option>For Approval</option>
        </select>

      </div>

      {/* TABLE */}
      <div className="overflow-auto">

        <table className="w-full">

          <thead>

            <tr className="border-b">

              <th className="text-left py-4">
                HLC Code
              </th>

              <th className="text-left py-4">
                Role
              </th>

              <th className="text-left py-4">
                Full Name
              </th>

              <th className="text-left py-4">
                Team
              </th>

              <th className="text-left py-4">
                Mobile
              </th>

              <th className="text-left py-4">
                Status
              </th>

            </tr>

          </thead>

          <tbody>

            {agents.map((agent) => (

              <tr
                key={agent.code}
                className="border-b"
              >

                <td className="py-5">
                  {agent.code}
                </td>

                <td>
                  {agent.role}
                </td>

                <td>
                  {agent.name}
                </td>

                <td>
                  {agent.team}
                </td>

                <td>
                  {agent.mobile}
                </td>

                <td>

                  <span
                    className={`
                      px-3
                      py-1
                      rounded-full
                      text-sm

                      ${
                        agent.status ===
                        'Active'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }
                    `}
                  >
                    {agent.status}
                  </span>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>
  )
}

export default Agents
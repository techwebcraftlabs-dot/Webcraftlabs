import { brsRecords } from "../data/BRSData"
import { useState, useEffect } from "react";

function Commission({ setActivePage }) {

  const [selectedDeveloper, setSelectedDeveloper] = useState('');
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedBuyerName, setSelectedBuyerName] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');

  useEffect(() => {
    setSelectedProject('');
    setSelectedBuyerName('');
    setSelectedLocation('');
  }, [selectedDeveloper]);

  useEffect(() => {
    setSelectedBuyerName(''); 
    setSelectedLocation('');
  }, [selectedProject]); 
  
  useEffect(() => {
    setSelectedLocation('');
  }, [selectedBuyerName]);

  const buyers = [
    {
      id: 1,
      buyerId: 'ZR-001',
      buyerName: 'Juan Dela Cruz',
      project: 'Castillon Homes',
      phaseLot: 'Phase 1 / Block 2 / Lot 3',
      amount: 850000,
      status: 'Approved',
    },

    {
      id: 2,
      buyerId: 'ZR-002',
      buyerName: 'Maria Santos',
      project: 'Bella Homes',
      phaseLot: 'Phase 2 / Block 4 / Lot 8',
      amount: 1200000,
      status: 'Approved',
    },

    {
      id: 3,
      buyerId: 'ZR-003',
      buyerName: 'John Reyes',
      project: 'Villa Elena',
      phaseLot: 'Phase 3 / Block 1 / Lot 5',
      amount: 650000,
      status: 'Pending',
    },
  ]

  return (
    <section className="p-8 bg-[#f5f5f5] min-h-screen">

      {/* PAGE HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">

        <div>

          <h1 className="text-4xl font-black text-[#0d1b4c]">
            Commission For Release
          </h1>

          <p className="text-gray-500 mt-2">
            Manage commission vouchers, incentives, and release records.
          </p>

        </div>

        <button
          className="
            bg-[#0d1b4c]
            hover:bg-[#09122f]
            text-white
            px-6
            py-3
            rounded-xl
            font-semibold
            transition-all
            shadow-lg
          "
        >
          + New Voucher
        </button>

      </div>

      {/* TOP TABS */}
      <div className="flex flex-wrap gap-3 mb-8">

        <button
          className="
            bg-[#0d1b4c]
            text-white
            px-5
            py-3
            rounded-xl
            text-sm
            font-semibold
            shadow-md
          "
        >
          NORMAL
        </button>

        <button
          className="
            bg-white
            border
            border-gray-200
            text-[#0d1b4c]
            px-5
            py-3
            rounded-xl
            text-sm
            font-semibold
            hover:bg-gray-100
            transition-all
          "
        >
          BROKER INCENTIVE
        </button>

        <button
          className="
            bg-white
            border
            border-gray-200
            text-[#0d1b4c]
            px-5
            py-3
            rounded-xl
            text-sm
            font-semibold
            hover:bg-gray-100
            transition-all
          "
        >
          TEAM LEADER INCENTIVE
        </button>

        <button
          className="
            bg-white
            border
            border-gray-200
            text-[#0d1b4c]
            px-5
            py-3
            rounded-xl
            text-sm
            font-semibold
            hover:bg-gray-100
            transition-all
          "
        >
          AGENT INCENTIVE
        </button>

        <button
          className="
            bg-white
            border
            border-gray-200
            text-[#0d1b4c]
            px-5
            py-3
            rounded-xl
            text-sm
            font-semibold
            hover:bg-gray-100
            transition-all
          "
        >
          COMMISSION INCENTIVE
        </button>

      </div>

      {/* MAIN CARD */}
      <div className="bg-white rounded-[30px] shadow-xl p-8">

        <div className="grid xl:grid-cols-2 gap-10">

          {/* LEFT FORM */}
          <div>

            <div className="grid md:grid-cols-2 gap-5">

              {/* DEVELOPER */}
              <div>

                <label className="text-sm font-medium text-gray-600 mb-2 block">
                  Developer
                </label>

                <select
                  value={selectedDeveloper}
                  onChange={(e) => setSelectedDeveloper(e.target.value)}
                  className="
                    w-full
                    border
                    border-gray-300
                    rounded-xl
                    px-4
                    py-3
                    bg-white
                    outline-none
                    focus:ring-2
                    focus:ring-[#0d1b4c]
                  "
                >
                  <option value="" disabled hidden>Select Developer</option>
                  {brsRecords
                  .filter((Record, index, self) => self.findIndex((r) => r.developer === Record.developer) === index)
                  .map((Record) => (
                    <option value={Record.developer}>{Record.developer}</option>
                  ))}
                </select>

              </div>

              {/* PROJECT */}
              <div>

                <label className="text-sm font-medium text-gray-600 mb-2 block">
                  Project
                </label>

                <select
                  value={selectedProject}
                  onChange={(e) => setSelectedProject(e.target.value)}
                  className="
                    w-full
                    border
                    border-gray-300
                    rounded-xl
                    px-4
                    py-3
                    bg-white
                    outline-none
                    focus:ring-2
                    focus:ring-[#0d1b4c]
                  "
                >
                  <option value="" disabled hidden>Select Project</option>
                  {brsRecords
                  .filter((Record) => Record.developer === selectedDeveloper)
                  .filter((Record, index, self) => self.findIndex((r) => r.project === Record.project) === index)
                  .map((Record) => (
                    <option value={Record.project}>{Record.project}</option>  
                  ))}
                </select>

              </div>

              {/* BUYER */}
              <div>

                <label className="text-sm font-medium text-gray-600 mb-2 block">
                  Buyer's Name
                </label>

                <select
                  value={selectedBuyerName}
                  onChange={(e) => setSelectedBuyerName(e.target.value)}
                  className="
                    w-full
                    border
                    border-gray-300
                    rounded-xl
                    px-4
                    py-3
                    bg-white
                    outline-none
                    focus:ring-2
                    focus:ring-[#0d1b4c]
                  "
                >
                  <option value="" disabled hidden>Select Buyer</option>
                  {brsRecords
                  .filter((Record) => Record.project && Record.project === selectedProject) 
                  .filter((Record, index, self) => self.findIndex((r) => r.buyer === Record.buyer) === index)
                  .map((Record, index) => (
                    <option key={index} value={Record.buyer}> {Record.buyer} </option>
                  ))}
                </select>

              </div>

              {/* PHASE */}
              <div>

                <label className="text-sm font-medium text-gray-600 mb-2 block">
                  Phase / Block / Lot
                </label>

                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="
                    w-full
                    border
                    border-gray-300
                    rounded-xl
                    px-4
                    py-3
                    bg-white
                    outline-none
                    focus:ring-2
                    focus:ring-[#0d1b4c]
                  "
                >
                  <option value="" disabled hidden>Select Phase / Block / Lot</option>
                  {brsRecords
                  .filter((Record) => Record.block && Record.lot)
                  .filter((Record) => Record.project === selectedProject)
                  .filter((Record) => Record.buyer === selectedBuyerName)
                  .map((Record, index)=> (
                    <option key={index} value={`Block ${Record.block} / Lot ${Record.lot}`}> Block {Record.block} / Lot {Record.lot} </option> 
                  ))} 
                </select>

              </div>

              {/* AMOUNT */}
              <div>

                <label className="text-sm font-medium text-gray-600 mb-2 block">
                  Amount
                </label>

                <input
                  type="text"
                  placeholder="₱ Enter Amount"
                  className="
                    w-full
                    border
                    border-gray-300
                    rounded-xl
                    px-4
                    py-3
                    outline-none
                    focus:ring-2
                    focus:ring-[#0d1b4c]
                  "
                />

              </div>

              {/* DATE */}
              <div>

                <label className="text-sm font-medium text-gray-600 mb-2 block">
                  Voucher Date
                </label>

                <input
                  type="date"
                  className="
                    w-full
                    border
                    border-gray-300
                    rounded-xl
                    px-4
                    py-3
                    outline-none
                    focus:ring-2
                    focus:ring-[#0d1b4c]
                  "
                />

              </div>

              {/* REMARKS */}
              <div className="md:col-span-2">

                <label className="text-sm font-medium text-gray-600 mb-2 block">
                  Remarks
                </label>

                <textarea
                  rows="5"
                  placeholder="Enter remarks here..."
                  className="
                    w-full
                    border
                    border-gray-300
                    rounded-xl
                    px-4
                    py-3
                    resize-none
                    outline-none
                    focus:ring-2
                    focus:ring-[#0d1b4c]
                  "
                ></textarea>

              </div>

            </div>

            {/* FORM BUTTONS */}
            <div className="flex flex-wrap gap-4 mt-8">

              <button
                className="
                  bg-[#0d1b4c]
                  hover:bg-[#09122f]
                  text-white
                  px-8
                  py-3
                  rounded-xl
                  font-semibold
                  shadow-lg
                  transition-all
                "
              >
                ADD RECORD
              </button>

              <button
                className="
                  bg-gray-200
                  hover:bg-gray-300
                  text-black
                  px-8
                  py-3
                  rounded-xl
                  font-semibold
                  transition-all
                "
              >
                CLEAR
              </button>

            </div>

          </div>

          {/* RIGHT SIDE */}
          <div>

            <div
              className="
                border-2
                border-dashed
                border-gray-300
                rounded-[30px]
                overflow-hidden
                h-[420px]
                bg-gray-100
                relative
              "
            >

              <img
                src="https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=1200&auto=format&fit=crop"
                alt=""
                className="w-full h-full object-cover"
              />

              {/* OVERLAY */}
              <div
                className="
                  absolute
                  bottom-0
                  left-0
                  w-full
                  bg-gradient-to-t
                  from-black/70
                  to-transparent
                  p-6
                "
              >

                <p className="text-white text-lg font-semibold">
                  Voucher Preview
                </p>

                <p className="text-white/70 text-sm mt-1">
                  Upload commission voucher or proof of release.
                </p>

              </div>

            </div>

            {/* UPLOAD BUTTON */}
            <div className="flex justify-center mt-6">

              <button
                className="
                  bg-[#0d1b4c]
                  hover:bg-[#09122f]
                  text-white
                  px-8
                  py-3
                  rounded-xl
                  font-semibold
                  shadow-lg
                  transition-all
                "
              >
                Upload Voucher
              </button>

            </div>

          </div>

        </div>

        {/* TABLE HEADER */}
        <div className="flex items-center justify-between mt-14 mb-5">

          <div>

            <h2 className="text-2xl font-bold text-[#0d1b4c]">
              Release Records
            </h2>

            <p className="text-gray-500 text-sm mt-1">
              List of submitted commission vouchers.
            </p>

          </div>

          <input
            type="text"
            placeholder="Search records..."
            className="
              border
              border-gray-300
              rounded-xl
              px-4
              py-3
              outline-none
              w-[260px]
              focus:ring-2
              focus:ring-[#0d1b4c]
            "
          />

        </div>

        {/* TABLE */}
        <div className="overflow-x-auto rounded-2xl border border-gray-200">

          <table className="w-full">

            <thead>

              <tr className="bg-[#0d1b4c] text-white text-left">

                <th className="p-5">Buyer</th>
                <th className="p-5">Project</th>
                <th className="p-5">Phase / Block / Lot</th>
                <th className="p-5">Amount</th>
                <th className="p-5">Status</th>
                <th className="p-5">Action</th>

              </tr>

            </thead>

            <tbody>

              {buyers.map((buyer) => (

                <tr
                  key={buyer.id}
                  className="border-b border-gray-200 hover:bg-gray-50 transition-all"
                >

                  <td className="p-5 font-semibold">
                    {buyer.buyerName}
                  </td>

                  <td className="p-5">
                    {buyer.project}
                  </td>

                  <td className="p-5">
                    {buyer.phaseLot}
                  </td>

                  <td className="p-5 font-bold text-[#0d1b4c]">
                    ₱{buyer.amount.toLocaleString()}
                  </td>

                  <td className="p-5">

                    <span
                      className="
                        bg-green-100
                        text-green-700
                        px-4
                        py-2
                        rounded-full
                        text-sm
                        font-medium
                      "
                    >
                      Approved
                    </span>

                  </td>

                  <td className="p-5">

                    <div className="flex gap-3">

                      <button
  onClick={() => {

    localStorage.setItem(
      'selectedBuyer',
      JSON.stringify(buyer)
    )

    setActivePage('calculation')

  }}
  className="
    bg-blue-500
    hover:bg-blue-600
    text-white
    px-4
    py-2
    rounded-lg
    text-sm
    transition-all
  "
>
  Manage
</button>

                      <button
                        className="
                          bg-red-500
                          hover:bg-red-600
                          text-white
                          px-4
                          py-2
                          rounded-lg
                          text-sm
                          transition-all
                        "
                      >
                        Delete
                      </button>

                    </div>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

        {/* FOOTER BUTTONS */}
        <div className="flex justify-end gap-4 mt-8">

          <button
            onClick={() => setActivePage('calculation')}
            className="
              bg-[#0d1b4c]
              hover:bg-[#09122f]
              text-white
              px-8
              py-3
              rounded-xl
              font-semibold
              transition-all
              shadow-lg
            "
          >
            Calculate
          </button>

          <button
            className="
              bg-gray-200
              hover:bg-gray-300
              text-black
              px-8
              py-3
              rounded-xl
              font-semibold
              transition-all
            "
          >
            Cancel
          </button>

        </div>

      </div>

    </section>
  )
}

export default Commission
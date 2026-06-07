import { useNavigate } from "react-router-dom";

function BRSDetails() {
  const navigate = useNavigate();

  return (
    <section className="bg-[#f4f7fb] min-h-screen p-8">

      {/* HEADER */}
      <div className="flex items-center justify-between mb-8">

        <div>
          <h1 className="text-3xl font-black text-[#0d1b4c]">
            BRS NO. 29403
          </h1>

          <p className="text-gray-500 mt-2">
            Buyer Registration Details
          </p>
        </div>

        <div className="flex gap-4">

          <button
            onClick={() => navigate("/dashboard")}
            className="
              bg-gray-200
              hover:bg-gray-300
              px-6
              py-3
              rounded-xl
              font-semibold
            "
          >
            Back
          </button>

          <button
            onClick={() => navigate("/RateDistribution")}
            className="
              bg-[#0d1b4c]
              hover:bg-[#09122f]
              text-white
              px-6
              py-3
              rounded-xl
              font-semibold
              shadow-lg
            "
          >
            Proceed to Commission
          </button>

        </div>

      </div>

      {/* BUYER REGISTRATION SHEET */}
      <div className="bg-white rounded-3xl shadow-lg overflow-hidden mb-8">

        <div className="bg-[#2563eb] px-8 py-4">
          <h2 className="text-white text-lg font-bold">
            BUYER'S REGISTRATION SHEET
          </h2>
        </div>

        <div className="p-8 grid lg:grid-cols-5 md:grid-cols-2 gap-5">

          <Input label="Tripping Date" value="11/20/2025" />
          <Input label="Closing Date" value="11/21/2025" />
          <Input label="Posted" value="11/21/2025" />
          <Input label="HLC Code" value="80242" />
          <Input label="Team Name" value="Success" />

        </div>

      </div>

      {/* BUYER INFO */}
      <div className="bg-white rounded-3xl shadow-lg overflow-hidden mb-8">

        <div className="bg-[#2563eb] px-8 py-4">
          <h2 className="text-white text-lg font-bold">
            BUYER'S INFORMATION
          </h2>
        </div>

        <div className="p-8">

          <div className="grid lg:grid-cols-2 gap-5 mb-5">
            <Input label="Full Name" value="Chamber Watson" />
            <Input label="Address" value="Quezon City" />
          </div>

          <div className="grid lg:grid-cols-4 gap-5">
            <Input label="Mobile" value="09123456789" />
            <Input label="Email" value="sample@gmail.com" />
            <Input label="Birthdate" value="11/20/2025" />
            <Input label="Age" value="23" />
          </div>

        </div>

      </div>

      {/* PROPERTY DETAILS */}
      <div className="bg-white rounded-3xl shadow-lg overflow-hidden mb-8">

        <div className="bg-[#2563eb] px-8 py-4">
          <h2 className="text-white text-lg font-bold">
            PROPERTY DETAILS
          </h2>
        </div>

        <div className="p-8">

          <div className="grid lg:grid-cols-5 gap-5 mb-5">
            <Input label="Developer" value="Zonal Realty" />
            <Input label="Project" value="Castillon Homes" />
            <Input label="LTS" value="11/20/2025" />
            <Input label="Project Location" value="Cavite" />
            <Input label="Direct" value="YES" />
          </div>

          <div className="grid lg:grid-cols-6 gap-5">
            <Input label="Phase" value="1" />
            <Input label="Block" value="02" />
            <Input label="Lot" value="30" />
            <Input label="Lot Area (SQM)" value="45.00" />
            <Input label="Floor Area (SQM)" value="40.00" />
            <Input label="Model Unit" value="ROW HOUSE" />
          </div>

        </div>

      </div>

      {/* ACCOUNT DETAILS */}
      <div className="bg-white rounded-3xl shadow-lg overflow-hidden mb-8">

        <div className="bg-[#2563eb] px-8 py-4">
          <h2 className="text-white text-lg font-bold">
            ACCOUNT DETAILS
          </h2>
        </div>

        <div className="p-8 grid lg:grid-cols-3 gap-5">

          <Input label="TCP" value="₱ 2,500,000" />
          <Input label="Total DP" value="₱ 250,000" />
          <Input label="Financing Scheme" value="Bank Financing" />

          <Input label="NSP" value="₱ 2,250,000" />
          <Input label="Reservation" value="₱ 15,000" />
          <Input label="Payment Terms" value="24 Months" />

          <Input label="Loan Value" value="₱ 1,800,000" />
          <Input label="Monthly DP" value="₱ 10,000" />
          <Input label="Monthly Amortization" value="₱ 18,500" />

        </div>

      </div>

    </section>
  );
}

function Input({ label, value }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-500 mb-2">
        {label}
      </label>

      <input
        type="text"
        defaultValue={value}
        className="
          w-full
          border
          border-gray-300
          rounded-xl
          px-4
          py-3
          outline-none
          focus:ring-2
          focus:ring-[#2563eb]
        "
      />
    </div>
  );
}

export default BRSDetails;
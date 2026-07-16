import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

import { brsApi } from "../lib/api";

function BRS({ setActivePage, setSelectedBRSId }) {
  const navigate = useNavigate();
  const [brsRecords, setBrsRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  useEffect(() => {
    const loadBRS = async () => {
      try {
        const records = await brsApi.list();
        setBrsRecords(records);
      } catch (error) {
        console.error(error);
        alert(error.message);
      } finally {
        setLoading(false);
      }
    };

    loadBRS();
  }, []);

  const statusOptions = ["For Approval", "Approved", "Hold"];

  const filteredRecords = brsRecords.filter((record) => {
    const status = record.status || "For Approval";
    const searchValue = search.toLowerCase();
    const matchesStatus = statusFilter === "All" || status === statusFilter;
    const matchesSearch = [
      record.brsId,
      record.buyer,
      record.project,
      record.developer,
      record.block,
      record.lot,
    ]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(searchValue));

    return matchesStatus && matchesSearch;
  });

  const statusStyles = {
    Approved:
      "bg-emerald-50 text-emerald-700 border border-emerald-200",

    "For Approval":
      "bg-amber-50 text-amber-700 border border-amber-200",

    Hold:
      "bg-rose-50 text-rose-700 border border-rose-200",
  };

  const handleOpenDetails = (recordId) => {
    if (setActivePage && setSelectedBRSId) {
      setSelectedBRSId(recordId);
      setActivePage("brs-details");
      return;
    }

    navigate(`/brs-details/${recordId}`);
  };

  return (
    <div className="flex-1 bg-[#f5f6fa] min-h-screen p-8">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-black text-[#3b281f]">
            BRS
          </h1>

          <p className="text-gray-500 mt-2">
            Buyer Reservation System
          </p>
        </div>

        <button
          onClick={() => navigate("/add-brs")}
          className="
            bg-[#6c63ff]
            hover:bg-[#5b52f5]
            text-white
            px-6
            py-3
            rounded-xl
            font-semibold
            shadow-lg
            transition-all
          "
        >
          Add BRS
        </button>
      </div>

      {/* SEARCH AND FILTERS */}
      <div className="bg-white rounded-2xl p-5 shadow-sm mb-6">
        <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search BRS / Buyer / Project"
            className="
              w-full
              bg-[#f5f6fa]
              rounded-xl
              px-4
              py-3
              outline-none
              border
              border-transparent
              focus:border-[#6c63ff]
            "
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="
              h-12
              rounded-xl
              border
              border-gray-200
              bg-[#f5f6fa]
              px-4
              text-sm
              font-semibold
              text-[#0d1b4c]
              outline-none
              focus:ring-2
              focus:ring-[#6c63ff]
            "
          >
            {["All", ...statusOptions].map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full">
          <thead className="bg-[#f5f6fa]">
            <tr className="text-left text-gray-500 text-sm">
              <th className="p-5">BRS</th>
              <th>Closed</th>
              <th>Posted</th>
              <th>Status</th>
              <th>Buyer</th>
              <th>Project</th>
              <th>Block</th>
              <th>Lot</th>
            </tr>
          </thead>

          <tbody>
            {loading && (
              <tr>
                <td
                  colSpan="8"
                  className="p-8 text-center text-gray-500"
                >
                  Loading BRS records...
                </td>
              </tr>
            )}

            {!loading && filteredRecords.length === 0 && (
              <tr>
                <td
                  colSpan="8"
                  className="p-8 text-center text-gray-500"
                >
                  No BRS records found.
                </td>
              </tr>
            )}

            {!loading && filteredRecords.map((record) => (
              <tr
                key={record.id}
                onClick={() => handleOpenDetails(record.id)}
                className="
                  border-t
                  hover:bg-[#fafafa]
                  transition-all
                  cursor-pointer
                "
              >
                <td className="p-5 font-semibold text-[#3b281f]">
                  {record.brsId}
                </td>

                <td className="text-gray-600">
                  {record.closedAt || "-"}
                </td>

                <td className="text-gray-600">
                  {record.postedAt || "-"}
                </td>

                <td>
                  <span
                    className={`
                      px-3
                      py-1
                      rounded-full
                      text-sm
                      font-medium
                      ${statusStyles[record.status || "For Approval"]}
                    `}
                  >
                    {record.status || "For Approval"}
                  </span>
                </td>

                <td className="font-medium">
                  {record.buyer || "-"}
                </td>

                <td>{record.project || "-"}</td>

                <td>{record.block || "-"}</td>

                <td>{record.lot || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default BRS;

import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
} from "firebase/firestore";

import { db } from "../firebase";

function BRS() {
  const navigate = useNavigate();
  const [brsRecords, setBrsRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "brs"),
      (snapshot) => {
        const records = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        records.sort((a, b) => {
          const dateA = a.createdAt?.toMillis?.() || 0;
          const dateB = b.createdAt?.toMillis?.() || 0;

          return dateB - dateA;
        });

        setBrsRecords(records);
        setLoading(false);
      },
      (error) => {
        console.error(error);
        alert(error.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const statusStyles = {
    Approved:
      "bg-emerald-50 text-emerald-700 border border-emerald-200",

    "For Approval":
      "bg-amber-50 text-amber-700 border border-amber-200",

    Pending:
      "bg-sky-50 text-sky-700 border border-sky-200",

    Rejected:
      "bg-rose-50 text-rose-700 border border-rose-200",
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

      {/* SEARCH */}
      <div className="bg-white rounded-2xl p-5 shadow-sm mb-6">
        <input
          type="text"
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

            {!loading && brsRecords.length === 0 && (
              <tr>
                <td
                  colSpan="8"
                  className="p-8 text-center text-gray-500"
                >
                  No BRS records yet.
                </td>
              </tr>
            )}

            {!loading && brsRecords.map((record) => (
              <tr
                key={record.id}
                onClick={() => navigate(`/brs-details/${record.id}`)}
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
                      ${statusStyles[record.status]}
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

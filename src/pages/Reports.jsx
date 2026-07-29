import { useState } from "react";
import {
  Search,
  RefreshCw,
  FileSpreadsheet,
  FileText,
} from "lucide-react";
import PremiumPageHeader from "../components/dashboard/PremiumPageHeader";

function Reports() {
  const [reportType, setReportType] =
    useState("Per HLC");

  const reportTypes = [
    "Per HLC",
    "Per Team",
    "Per LSD",
    "Per Recruiter",
    "Per AHLC",
    "Per EVP",
    "Per Project",
    "Per Developer",
    "Per LeadBroker",
    "Per HLCLocality",
    "Per ProjectLocation",
    "Download Transmittal",
    "Download Collection",
    "Download Users",
  ];

  return (
    <div className="bg-white rounded-[30px] p-8 shadow-sm">

      {/* HEADER */}

      <div className="mb-6"><PremiumPageHeader eyebrow="Business Intelligence" title="Reports" description="View sales, commission and performance reports." /></div>

      {/* FILTERS */}

      <div className="flex flex-wrap gap-4 items-end mb-8">

        <div>
          <label className="block text-xs text-gray-500 mb-2">
            Report Type
          </label>

          <select
            value={reportType}
            onChange={(e) =>
              setReportType(
                e.target.value
              )
            }
            className="
              border
              rounded-xl
              px-4
              py-3
              min-w-[220px]
            "
          >
            {reportTypes.map(
              (type) => (
                <option
                  key={type}
                  value={type}
                >
                  {type}
                </option>
              )
            )}
          </select>
        </div>

        <div>
          <label className="block text-xs text-gray-500 mb-2">
            Date From
          </label>

          <input
            type="date"
            className="
              border
              rounded-xl
              px-4
              py-3
            "
          />
        </div>

        <div>
          <label className="block text-xs text-gray-500 mb-2">
            Date To
          </label>

          <input
            type="date"
            className="
              border
              rounded-xl
              px-4
              py-3
            "
          />
        </div>

        <button
          className="
            bg-[#2563eb]
            text-white
            px-5
            py-3
            rounded-xl
            flex
            items-center
            gap-2
          "
        >
          <RefreshCw size={16} />
          Refresh
        </button>

        <div className="ml-auto flex gap-3">

          <div className="relative">

            <Search
              size={18}
              className="
                absolute
                left-3
                top-1/2
                -translate-y-1/2
                text-gray-400
              "
            />

            <input
              placeholder="Search..."
              className="
                border
                rounded-xl
                pl-10
                pr-4
                py-3
              "
            />

          </div>

          <button
            className="
              bg-green-600
              text-white
              px-4
              py-3
              rounded-xl
              flex
              items-center
              gap-2
            "
          >
            <FileSpreadsheet size={18} />
            Excel
          </button>

          <button
            className="
              bg-red-500
              text-white
              px-4
              py-3
              rounded-xl
              flex
              items-center
              gap-2
            "
          >
            <FileText size={18} />
            PDF
          </button>

        </div>

      </div>

      {/* TABLE */}

      <div className="overflow-auto">

        <table className="w-full">

          <thead>

            <tr className="border-b bg-[#f8f9fc]">

              <th className="text-left p-4">
                Code
              </th>

              <th className="text-left p-4">
                Name
              </th>

              <th className="text-left p-4">
                Team
              </th>

              <th className="text-left p-4">
                Units
              </th>

              <th className="text-left p-4">
                TCP
              </th>

              <th className="text-left p-4">
                NSP
              </th>

              <th className="text-left p-4">
                SV
              </th>

              <th className="text-left p-4">
                Amount Due
              </th>

              <th className="text-left p-4">
                Received
              </th>

              <th className="text-left p-4">
                Balance
              </th>

            </tr>

          </thead>

          <tbody>

            <tr>

              <td
                colSpan="10"
                className="
                  text-center
                  py-20
                  text-gray-400
                "
              >
                No report data found.
              </td>

            </tr>

          </tbody>

        </table>

      </div>

    </div>
  );
}

export default Reports;

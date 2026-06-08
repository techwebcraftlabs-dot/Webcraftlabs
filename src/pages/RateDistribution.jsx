import { useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { CheckCircle, Loader2, Save } from "lucide-react";

import { db } from "../firebase";

const deductionFields = [
  "savings",
  "ca",
  "marketing",
  "ayuda",
  "others",
  "zonalCare",
];

const incentiveLabels = {
  commission: "Normal Commission",
  broker: "Broker Incentive",
  teamleader: "Team Leader Incentive",
  agent: "Agent Incentive",
};

const peso = "\u20b1";

function RateDistribution() {
  const [incentiveType, setIncentiveType] = useState("commission");
  const [deductionsByRow, setDeductionsByRow] = useState({});
  const [savingComputation, setSavingComputation] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState("");

  const buyer = JSON.parse(localStorage.getItem("selectedBuyer")) || {};
  const grossAmount = Number(buyer.amount) || 0;
  const vatDeduction = grossAmount * 0.12;
  const netOfVat = grossAmount - vatDeduction;
  const savedDistribution = Array.isArray(buyer.rateDistribution)
    ? buyer.rateDistribution
    : [];

  const normalizeRole = (person) => person.role?.trim().toLowerCase() || "";
  const isAssistHlcRole = (role) =>
    role.includes("hlc") &&
    (role.includes("assist") ||
      role.includes("assistant") ||
      role.includes("assit"));

  const getIncentiveType = (person) => {
    if (person.type) {
      return person.type;
    }

    const role = normalizeRole(person);

    if (role === "jba" || role === "evp" || role === "zonal") {
      return "broker";
    }

    if (role === "local sd") {
      return "teamleader";
    }

    if (role === "hlc" || isAssistHlcRole(role)) {
      return "agent";
    }

    return "commission";
  };

  const savedDeveloperRate =
    Number(
      savedDistribution.find((person) => normalizeRole(person) === "developer")
        ?.rate
    ) || 0;

  const distributionData = savedDistribution.filter((person) => {
    const rate = Number(person.rate) || 0;

    return (
      rate > 0 &&
      normalizeRole(person) !== "developer" &&
      (incentiveType === "commission" ||
        getIncentiveType(person) === incentiveType)
    );
  });

  const incentiveDeveloperRate = distributionData.reduce(
    (total, person) => total + (Number(person.rate) || 0),
    0
  );

  const developerRate =
    incentiveType === "commission" ? savedDeveloperRate : incentiveDeveloperRate;

  const formatCurrency = (value) =>
    `${peso}${Number(value || 0).toLocaleString()}`;

  const getRowKey = (person, index) =>
    `${normalizeRole(person)}-${person.name || ""}-${index}`;

  const getDeductions = (rowKey) => deductionsByRow[rowKey] || {};

  const getDeductionTotal = (rowKey) =>
    deductionFields.reduce(
      (total, field) => total + (Number(getDeductions(rowKey)[field]) || 0),
      0
    );

  const handleDeductionChange = (rowKey, field, value) => {
    setDeductionsByRow((current) => ({
      ...current,
      [rowKey]: {
        ...current[rowKey],
        [field]: value,
      },
    }));
    setLastSavedAt("");
  };

  const computedRows = distributionData.map((person, index) => {
    const rowKey = getRowKey(person, index);
    const rate = Number(person.rate) || 0;
    const forRelease = developerRate ? netOfVat * (rate / developerRate) : 0;
    const opx =
      forRelease >= 200 && rate >= 1 && person.name !== "Zonal" ? 50 : 0;
    const taxAmount = person.taxable ? forRelease * 0.05 : 0;
    const deductionTotal = getDeductionTotal(rowKey);
    const netAmount = forRelease - opx - taxAmount - deductionTotal;

    return {
      rowKey,
      person,
      rate,
      forRelease,
      opx,
      taxAmount,
      deductions: getDeductions(rowKey),
      netAmount,
    };
  });

  const totalForRelease = computedRows.reduce(
    (total, row) => total + row.forRelease,
    0
  );
  const totalOpx = computedRows.reduce((total, row) => total + row.opx, 0);
  const totalTax = computedRows.reduce(
    (total, row) => total + row.taxAmount,
    0
  );
  const totalNet = computedRows.reduce(
    (total, row) => total + row.netAmount,
    0
  );

  const handleSaveComputation = async () => {
    if (!buyer.buyerName && !buyer.buyer) {
      alert("Please select a buyer first.");
      return;
    }

    if (computedRows.length === 0) {
      alert("No computation rows to save.");
      return;
    }

    try {
      setSavingComputation(true);

      await addDoc(collection(db, "commissionComputations"), {
        brsDocId: buyer.id || buyer.brsDocId || "",
        brsId: buyer.brsId || "",
        selectedVoucherId: buyer.selectedVoucherId || "",
        buyer: buyer.buyerName || buyer.buyer || "",
        developer: buyer.developer || "",
        project: buyer.project || "",
        incentiveType,
        incentiveLabel: incentiveLabels[incentiveType],
        grossAmount,
        vatDeduction,
        netOfVat,
        developerRate,
        totals: {
          forRelease: totalForRelease,
          opx: totalOpx,
          tax: totalTax,
          net: totalNet,
        },
        rows: computedRows.map((row) => ({
          name: row.person.name || row.person.role || "",
          role: row.person.role || "",
          grossAmount,
          developerRate,
          netOfVat,
          rate: row.rate,
          forRelease: row.forRelease,
          opx: row.opx,
          deductions: {
            savings: Number(row.deductions.savings) || 0,
            ca: Number(row.deductions.ca) || 0,
            marketing: Number(row.deductions.marketing) || 0,
            ayuda: Number(row.deductions.ayuda) || 0,
            others: Number(row.deductions.others) || 0,
            zonalCare: Number(row.deductions.zonalCare) || 0,
          },
          taxable: Boolean(row.person.taxable),
          taxRate: row.person.taxable ? 5 : 0,
          taxAmount: row.taxAmount,
          netAmount: row.netAmount,
        })),
        createdAt: serverTimestamp(),
      });

      setLastSavedAt(new Date().toLocaleTimeString());
      alert("Computation saved successfully.");
    } catch (error) {
      console.error(error);
      alert(error.message);
    } finally {
      setSavingComputation(false);
    }
  };

  const inputClass = `
    w-[90px]
    rounded-lg
    border
    border-slate-300
    bg-white
    px-2
    py-1.5
    outline-none
    transition
    focus:border-[#2563eb]
    focus:ring-2
    focus:ring-blue-100
  `;

  return (
    <section className="min-h-screen bg-[#f4f6fb] p-6 lg:p-8">
      <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
            {incentiveLabels[incentiveType]}
          </p>
          <h1 className="mt-2 text-4xl font-black text-[#0d1b4c]">
            Commission Computation
          </h1>
          <p className="mt-2 font-semibold text-blue-600">
            Buyer: {buyer.buyerName || "No Buyer Selected"}
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <button
            type="button"
            onClick={handleSaveComputation}
            disabled={savingComputation || computedRows.length === 0}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#2563eb] px-6 py-4 text-sm font-black text-white shadow-lg shadow-blue-200 transition-all hover:bg-[#1d4ed8] disabled:cursor-not-allowed disabled:bg-slate-400 disabled:shadow-none"
          >
            {savingComputation ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Save className="h-5 w-5" />
            )}
            {savingComputation ? "Saving..." : "Save Computation"}
          </button>

          <div className="rounded-3xl bg-[#0d1b4c] px-8 py-5 text-white shadow-xl shadow-slate-300">
            <p className="text-sm opacity-80">Gross Amount</p>
            <h1 className="mt-2 text-4xl font-black">
              {formatCurrency(grossAmount)}
            </h1>
          </div>
        </div>
      </div>

      {lastSavedAt && (
        <div className="mb-6 flex items-center gap-2 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">
          <CheckCircle className="h-5 w-5" />
          Saved at {lastSavedAt}
        </div>
      )}

      <div className="mb-8 grid gap-5 md:grid-cols-4">
        <SummaryCard label="Gross Amount" value={formatCurrency(grossAmount)} />
        <SummaryCard
          label="VAT (12%)"
          value={formatCurrency(vatDeduction)}
          valueClass="text-red-500"
        />
        <SummaryCard
          label="Net Of VAT"
          value={formatCurrency(netOfVat)}
          valueClass="text-green-600"
        />
        <SummaryCard
          label="Developer Rate"
          value={`${developerRate}%`}
          valueClass="text-[#6c63ff]"
        />
      </div>

      <div className="mb-8 rounded-3xl bg-white p-6 shadow-lg shadow-slate-200/80">
        <label className="mb-2 block text-sm font-semibold text-gray-500">
          Incentive Type
        </label>
        <select
          value={incentiveType}
          onChange={(e) => {
            setIncentiveType(e.target.value);
            setLastSavedAt("");
          }}
          className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-[#2563eb] focus:ring-2 focus:ring-blue-100 md:w-[350px]"
        >
          <option value="commission">Normal Commission</option>
          <option value="broker">Broker Incentive</option>
          <option value="teamleader">Team Leader Incentive</option>
          <option value="agent">Agent Incentive</option>
        </select>
      </div>

      <div className="overflow-x-auto rounded-3xl bg-white shadow-xl shadow-slate-300/70">
        <table className="w-full min-w-[1000px]">
          <thead>
            <tr className="bg-[#0d1b4c] text-sm text-white">
              <th className="p-4 text-left">Name</th>
              <th className="p-4 text-left">Role</th>
              <th className="p-4 text-left">Amount</th>
              <th className="p-4 text-left">Developer Rate</th>
              <th className="p-4 text-left">Net of VAT</th>
              <th className="p-4 text-left">HLC Rate</th>
              <th className="p-4 text-left">For Release</th>
              <th className="p-4 text-left">OPX</th>
              <th className="p-4 text-left">Savings</th>
              <th className="p-4 text-left">CA</th>
              <th className="p-4 text-left">Marketing</th>
              <th className="p-4 text-left">Ayuda</th>
              <th className="p-4 text-left">Others</th>
              <th className="p-4 text-left">Zonal Care</th>
              <th className="p-4 text-left">Tax Rate</th>
              <th className="p-4 text-left">Tax Amount</th>
              <th className="p-4 text-left">Net Amount</th>
            </tr>
          </thead>

          <tbody>
            {computedRows.length === 0 && (
              <tr>
                <td colSpan="17" className="p-8 text-center text-gray-500">
                  No rate distribution found for this incentive type.
                </td>
              </tr>
            )}

            {computedRows.map((row) => (
              <tr
                key={row.rowKey}
                className="border-b border-slate-200 text-sm transition-all hover:bg-blue-50/40"
              >
                <td className="p-4 font-bold text-[#0d1b4c]">
                  {row.person.name || row.person.role}
                </td>
                <td className="p-4">{row.person.role}</td>
                <td className="p-4">{formatCurrency(grossAmount)}</td>
                <td className="p-4">{developerRate}%</td>
                <td className="p-4 font-semibold">
                  {formatCurrency(netOfVat)}
                </td>
                <td className="p-4">{row.rate}%</td>
                <td className="p-4 font-bold text-blue-600">
                  {formatCurrency(row.forRelease)}
                </td>
                <td className="p-4 font-semibold text-orange-500">
                  {row.opx > 0 ? formatCurrency(row.opx) : "-"}
                </td>
                {deductionFields.map((field) => (
                  <td key={field} className="p-2">
                    <input
                      type="number"
                      placeholder="0"
                      value={row.deductions[field] || ""}
                      onChange={(e) =>
                        handleDeductionChange(
                          row.rowKey,
                          field,
                          e.target.value
                        )
                      }
                      className={inputClass}
                    />
                  </td>
                ))}
                <td className="p-4">{row.person.taxable ? "5%" : "-"}</td>
                <td className="p-4 font-semibold text-red-500">
                  {row.person.taxable ? formatCurrency(row.taxAmount) : "-"}
                </td>
                <td className="p-4 font-black text-green-600">
                  {formatCurrency(row.netAmount)}
                </td>
              </tr>
            ))}
          </tbody>

          <tfoot>
            <tr className="border-t bg-[#f3f4f6] font-bold">
              <td className="p-4">TOTAL</td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td className="p-4 text-blue-600">
                {formatCurrency(totalForRelease)}
              </td>
              <td className="p-4 text-orange-500">
                {formatCurrency(totalOpx)}
              </td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td className="p-4 text-red-500">
                {formatCurrency(totalTax)}
              </td>
              <td className="p-4 text-green-600">
                {formatCurrency(totalNet)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </section>
  );
}

function SummaryCard({ label, value, valueClass = "text-[#0d1b4c]" }) {
  return (
    <div className="rounded-3xl bg-white p-6 shadow-lg shadow-slate-200/80">
      <p className="text-sm text-gray-500">{label}</p>
      <h1 className={`mt-2 text-3xl font-black ${valueClass}`}>{value}</h1>
    </div>
  );
}

export default RateDistribution;

import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle, Eye, Loader2, Save } from "lucide-react";

import { computationApi, voucherApi } from "../lib/api";

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
  const navigate = useNavigate();
  const [incentiveType, setIncentiveType] = useState("commission");
  const [deductionsByRow, setDeductionsByRow] = useState({});
  const [computations, setComputations] = useState([]);
  const [savingComputation, setSavingComputation] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState("");
  const [batchSearch, setBatchSearch] = useState("");
  const [voucherBatchState, setVoucherBatchState] = useState(() =>
    JSON.parse(localStorage.getItem("selectedVoucherBatch")) || null
  );

  const voucherBatch =
    voucherBatchState;
  const savedBuyer = JSON.parse(localStorage.getItem("selectedBuyer")) || null;
  const [activeBuyer, setActiveBuyer] = useState(savedBuyer);
  const buyer = activeBuyer || {};
  const grossAmount = Number(buyer.amount) || 0;
  const vatDeduction = grossAmount * 0.12;
  const netOfVat = grossAmount - vatDeduction;
  const savedDistribution = Array.isArray(buyer.rateDistribution)
    ? buyer.rateDistribution
    : [];

  useEffect(() => {
    const loadComputations = async () => {
      try {
        setComputations(await computationApi.list());
      } catch (error) {
        console.error(error);
        alert(error.message);
      }
    };

    loadComputations();
  }, []);

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

  const combinedDistributionData = combineDistributionByName(distributionData);

  const incentiveDeveloperRate = combinedDistributionData.reduce(
    (total, person) => total + (Number(person.rate) || 0),
    0
  );

  const developerRate =
    incentiveType === "commission" ? savedDeveloperRate : incentiveDeveloperRate;

  const formatCurrency = (value) =>
    `${peso}${Number(value || 0).toLocaleString()}`;

  const batchBuyers = Array.isArray(voucherBatch?.buyers)
    ? voucherBatch.buyers
    : [];
  const batchGrossAmount = Number(voucherBatch?.voucherGrossAmount) || 0;
  const batchAssignedTotal = batchBuyers.reduce(
    (total, item) => total + (Number(item.commissionAmount) || 0),
    0
  );
  const batchBalance = batchGrossAmount - batchAssignedTotal;
  const allBatchBuyersDone =
    batchBuyers.length > 0 &&
    batchBuyers.every((voucher) => voucher.computationStatus === "Done");
  const filteredBatchBuyers = batchBuyers.filter((voucher) => {
    const searchValue = batchSearch.toLowerCase();

    if (!searchValue) {
      return true;
    }

    return [
      voucher.brsId,
      voucher.buyer,
      voucher.project,
      voucher.phase,
      voucher.block,
      voucher.lot,
      voucher.status,
      voucher.computationStatus,
      voucher.voucherDate,
    ]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(searchValue));
  });

  const handleViewBatchBuyer = (voucher) => {
    const brsRecord = voucher.brsRecord || {};
    const nextBuyer = {
      ...brsRecord,
      selectedVoucherId: voucher.id || "",
      voucherBatchId: voucher.voucherBatchId || voucherBatch?.voucherBatchId || "",
      voucherNo: voucher.voucherNo || voucherBatch?.voucherNo || "",
      voucherDate: voucher.voucherDate || voucherBatch?.voucherDate || "",
      voucherRemarks: voucher.remarks || "",
      buyerName: voucher.buyer || brsRecord.buyer,
      amount: Number(voucher.commissionAmount) || 0,
    };

    localStorage.setItem("selectedBuyer", JSON.stringify(nextBuyer));
    setActiveBuyer(nextBuyer);
    setDeductionsByRow({});
    setLastSavedAt("");
  };

  const handleBackToBatch = () => {
    localStorage.removeItem("selectedBuyer");
    setActiveBuyer(null);
    setDeductionsByRow({});
    setLastSavedAt("");
  };

  const handleFinishBatch = () => {
    if (!allBatchBuyersDone) {
      alert("Please save the computation for every buyer first.");
      return;
    }

    localStorage.removeItem("selectedBuyer");
    localStorage.removeItem("selectedVoucherBatch");
    localStorage.setItem("activeDashboardPage", "commission");
    navigate("/dashboard");
  };

  const handleBackToAddBuyers = () => {
    localStorage.removeItem("selectedBuyer");
    localStorage.setItem("activeDashboardPage", "create-voucher");
    navigate("/dashboard");
  };

  const getRowKey = useCallback(
    (person, index) => `${normalizeRole(person)}-${person.name || ""}-${index}`,
    []
  );

  const selectedComputation = findSavedComputation(
    computations,
    buyer,
    incentiveType
  );

  useEffect(() => {
    const syncSavedDeductions = () => {
      if (!activeBuyer) {
        setDeductionsByRow({});
        return;
      }

      if (!selectedComputation) {
        setDeductionsByRow({});
        return;
      }

      setDeductionsByRow(
        buildSavedDeductions(selectedComputation.rows || [], getRowKey)
      );
      setLastSavedAt("");
    };

    queueMicrotask(syncSavedDeductions);
  }, [activeBuyer, selectedComputation, getRowKey]);

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

  const computedRows = combinedDistributionData.map((person, index) => {
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

      const computationData = {
        brsDocId: buyer.id || buyer.brsDocId || "",
        brsId: buyer.brsId || "",
        selectedVoucherId: buyer.selectedVoucherId || "",
        voucherBatchId: buyer.voucherBatchId || "",
        voucherNo: buyer.voucherNo || "",
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
          rowKey: row.rowKey,
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
      };

      if (selectedComputation?.id) {
        await computationApi.update(selectedComputation.id, computationData);
      } else {
        await computationApi.create(computationData);
      }

      if (buyer.selectedVoucherId) {
        await voucherApi.patch(buyer.selectedVoucherId, {
          computationStatus: "Done",
          computedAt: new Date().toISOString(),
        });
      }

      if (voucherBatch?.buyers?.length) {
        const nextBatch = {
          ...voucherBatch,
          buyers: voucherBatch.buyers.map((voucher) =>
            voucher.id === buyer.selectedVoucherId
              ? {
                  ...voucher,
                  computationStatus: "Done",
                }
              : voucher
          ),
        };

        setVoucherBatchState(nextBatch);
        localStorage.setItem("selectedVoucherBatch", JSON.stringify(nextBatch));
      }

      setLastSavedAt(new Date().toLocaleTimeString());
      alert("Computation saved successfully.");
      if (voucherBatch?.buyers?.length) {
        handleBackToBatch();
      }
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

  if (batchBuyers.length > 0 && !activeBuyer) {
    return (
      <section className="min-h-screen bg-[#f4f6fb] p-6 lg:p-8">
        <div className="mb-8">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
            Voucher Calculation
          </p>
          <h1 className="mt-2 text-4xl font-black text-[#0d1b4c]">
            Buyer Computation List
          </h1>
          <p className="mt-2 text-gray-500">
            Open each buyer to adjust deductions and save their computation.
          </p>
        </div>

        <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <button
            type="button"
            onClick={handleBackToAddBuyers}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-black text-[#0d1b4c] shadow-sm transition hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Add Buyers
          </button>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <input
              type="text"
              value={batchSearch}
              onChange={(e) => setBatchSearch(e.target.value)}
              placeholder="Search buyer, BRS, project or lot..."
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-[#2563eb] focus:ring-2 focus:ring-blue-100 sm:w-[320px]"
            />

            <button
              type="button"
              onClick={handleFinishBatch}
              disabled={!allBatchBuyersDone}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0d1b4c] px-6 py-3 text-sm font-black text-white shadow-lg transition disabled:cursor-not-allowed disabled:bg-slate-400 disabled:shadow-none"
            >
              <Save className="h-4 w-4" />
              Save Voucher
            </button>
          </div>
        </div>

        <div className="mb-8 grid gap-5 md:grid-cols-3">
          <SummaryCard label="Voucher Gross Commission" value={formatCurrency(batchGrossAmount)} />
          <SummaryCard label="Total Buyer Amount" value={formatCurrency(batchAssignedTotal)} />
          <SummaryCard
            label="Balance"
            value={formatCurrency(batchBalance)}
            valueClass={batchBalance === 0 ? "text-green-600" : "text-orange-500"}
          />
        </div>

        <div className="overflow-x-auto rounded-3xl bg-white shadow-xl shadow-slate-300/70">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="bg-[#0d1b4c] text-left text-sm text-white">
                <th className="p-4">BRS</th>
                <th className="p-4">Buyer</th>
                <th className="p-4">Project</th>
                <th className="p-4">Phase / Block / Lot</th>
                <th className="p-4">Buyer Gross Comm</th>
                <th className="p-4">Status</th>
                <th className="p-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredBatchBuyers.length === 0 && (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-gray-500">
                    No buyers match your search.
                  </td>
                </tr>
              )}

              {filteredBatchBuyers.map((voucher) => (
                <tr key={voucher.id} className="border-b border-slate-200">
                  <td className="p-4 font-bold text-[#0d1b4c]">
                    {voucher.brsId || "-"}
                  </td>
                  <td className="p-4 font-semibold">{voucher.buyer || "-"}</td>
                  <td className="p-4">{voucher.project || "-"}</td>
                  <td className="p-4">
                    Phase {voucher.phase || "-"} / Block {voucher.block || "-"} / Lot {voucher.lot || "-"}
                  </td>
                  <td className="p-4 font-black text-emerald-700">
                    {formatCurrency(voucher.commissionAmount)}
                  </td>
                  <td className="p-4">
                    <StatusBadge status={voucher.computationStatus} />
                  </td>
                  <td className="p-4">
                    <button
                      type="button"
                      onClick={() => handleViewBatchBuyer(voucher)}
                      className="inline-flex items-center gap-2 rounded-lg bg-[#2563eb] px-4 py-2 text-sm font-semibold text-white"
                    >
                      <Eye className="h-4 w-4" />
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-[#f4f6fb] p-6 lg:p-8">
      <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          {batchBuyers.length > 0 && (
            <button
              type="button"
              onClick={handleBackToBatch}
              className="mb-4 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-bold text-[#0d1b4c] shadow-sm"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Buyer List
            </button>
          )}
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

function StatusBadge({ status = "Pending" }) {
  const done = status === "Done";

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
        done ? "bg-emerald-100 text-emerald-700" : "bg-orange-100 text-orange-700"
      }`}
    >
      {done ? "Done" : "Pending"}
    </span>
  );
}

function findSavedComputation(computations, buyer, incentiveType) {
  if (!buyer?.selectedVoucherId && !buyer?.id && !buyer?.brsDocId) {
    return null;
  }

  const buyerDocId = buyer.id || buyer.brsDocId || "";
  const matches = computations.filter((item) => {
    const sameIncentive = (item.incentiveType || "commission") === incentiveType;
    const sameVoucher = buyer.selectedVoucherId
      ? item.selectedVoucherId === buyer.selectedVoucherId
      : true;
    const sameBatchBuyer =
      item.voucherBatchId &&
      item.voucherBatchId === buyer.voucherBatchId &&
      item.brsDocId === buyerDocId;
    const sameBuyer = item.brsDocId === buyerDocId;

    return (
      sameIncentive &&
      (sameVoucher || sameBatchBuyer || (!buyer.selectedVoucherId && sameBuyer))
    );
  });

  return matches.sort((a, b) => getMillis(b) - getMillis(a))[0] || null;
}

function buildSavedDeductions(rows, getRowKey) {
  return rows.reduce((saved, row, index) => {
    const rowKey = row.rowKey || getRowKey(row, index);

    saved[rowKey] = {
      savings: Number(row.deductions?.savings) || "",
      ca: Number(row.deductions?.ca) || "",
      marketing: Number(row.deductions?.marketing) || "",
      ayuda: Number(row.deductions?.ayuda) || "",
      others: Number(row.deductions?.others) || "",
      zonalCare: Number(row.deductions?.zonalCare) || "",
    };

    return saved;
  }, {});
}

function getMillis(item) {
  return (
    item.updatedAt?.toMillis?.() ||
    item.createdAt?.toMillis?.() ||
    new Date(item.updatedAt || item.createdAt || 0).getTime()
  );
}

function combineDistributionByName(distribution) {
  const grouped = new Map();

  distribution.forEach((person) => {
    const name = String(person.name || person.role || "").trim();
    const key = name.toLowerCase();
    const role = String(person.role || "").trim();
    const rate = Number(person.rate) || 0;

    if (!grouped.has(key)) {
      grouped.set(key, {
        ...person,
        name,
        role,
        rate,
        taxable: Boolean(person.taxable),
        roles: role ? [role] : [],
      });
      return;
    }

    const current = grouped.get(key);
    const roles = role && !current.roles.includes(role)
      ? [...current.roles, role]
      : current.roles;

    grouped.set(key, {
      ...current,
      role: roles.join(" / "),
      roles,
      rate: current.rate + rate,
      taxable: Boolean(current.taxable || person.taxable),
    });
  });

  return Array.from(grouped.values());
}

export default RateDistribution;

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, FileDown, FilterX, Plus, Sheet, X } from "lucide-react";

import { brsApi, computationApi, voucherApi } from "../lib/api";
import { EmptyState, Pagination, TableSkeleton } from "../components/ui/DataStates";
import { useSavedFilters } from "../hooks/useSavedFilters";
import PremiumPageHeader from "../components/dashboard/PremiumPageHeader";

const peso = "\u20b1";

function DeveloperVoucher({ setActivePage }) {
  const navigate = useNavigate();
  const role = localStorage.getItem("role") || "Agent";
  const canManage = ["Administrator", "HLC", "EVP"].includes(role);
  const { filters, updateFilter, resetFilters } = useSavedFilters("vouchers", { search: "", status: "All", pageSize: 10 });
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState([]);
  const [voucherRows, setVoucherRows] = useState([]);
  const [brsRecords, setBrsRecords] = useState([]);
  const [computations, setComputations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVoucher, setSelectedVoucher] = useState(null);

  useEffect(() => {
    const loadVouchers = async () => {
      try {
        const records = await voucherApi.list();
        records.sort((a, b) => {
          const dateA =
            new Date(a.voucherDate || 0).getTime();
          const dateB =
            new Date(b.voucherDate || 0).getTime();
          return dateB - dateA;
        });

        setVoucherRows(records);
      } catch (error) {
        console.error(error);
        alert(error.message);
      } finally {
        setLoading(false);
      }
    };

    loadVouchers();
  }, []);

  useEffect(() => {
    const loadBRS = async () => {
      try {
        setBrsRecords(await brsApi.list());
      } catch (error) {
        console.error(error);
        alert(error.message);
      }
    };

    loadBRS();
  }, []);

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

  const viewData = useMemo(() => groupVoucherRows(voucherRows), [voucherRows]);
  const filteredData = viewData.filter((item) => {
    const searchValue = filters.search.toLowerCase();
    const matchSearch = [
      item.voucherNo,
      item.buyerNames,
      item.brsIds,
      item.developer,
      item.project,
      item.voucherDate,
      item.releasedDate,
      item.status,
    ]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(searchValue));

    const matchStatus =
      filters.status === "All" ? true : item.status === filters.status;

    return matchSearch && matchStatus;
  });
  const pageCount = Math.max(1, Math.ceil(filteredData.length / filters.pageSize));
  const safePage = Math.min(page, pageCount);
  const visibleData = filteredData.slice((safePage - 1) * filters.pageSize, safePage * filters.pageSize);

  const allVisibleSelected =
    visibleData.length > 0 &&
    visibleData.every((item) => selectedIds.includes(item.id));

  const handleStatusChange = async (id, value) => {
    let statusRemarks = "";
    if (value === "Not Found") {
      statusRemarks = window.prompt("Enter remarks explaining why this voucher was not found:", "")?.trim() || "";
      if (!statusRemarks) {
        alert("Remarks are required when the status is Not Found.");
        return;
      }
    }
    setVoucherRows((current) =>
      current.map((item) =>
        (item.voucherBatchId || item.id) === id
          ? {
              ...item,
              status: value,
              statusRemarks: value === "Not Found" ? statusRemarks : "",
              releasedDate: value === "Released" ? (item.releasedDate || new Date().toISOString()) : null,
            }
          : item
      )
    );

    try {
      const voucher = viewData.find((item) => item.id === id);

      await Promise.all(
        (voucher?.buyers || []).map((buyer) =>
          voucherApi.patch(buyer.id, {
            status: value,
            statusRemarks: value === "Not Found" ? statusRemarks : "",
          })
        )
      );
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  };

  const handleSelect = (id) => {
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );
  };

  const handleOpenVoucher = (voucher) => {
    const buyers = voucher.buyers.map((buyer) => ({
      ...buyer,
      brsRecord:
        brsRecords.find((record) => record.id === buyer.brsDocId) || {},
    }));

    localStorage.removeItem("selectedBuyer");
    localStorage.setItem(
      "selectedVoucherBatch",
      JSON.stringify({
        voucherBatchId: voucher.id,
        voucherNo: voucher.voucherNo,
        voucherDate: voucher.voucherDate,
        voucherGrossAmount: voucher.grossComm,
        buyerAssignedTotal: voucher.assignedTotal,
        buyers,
      })
    );

    navigate("/RateDistribution");
  };

  const handleSelectAll = () => {
    if (allVisibleSelected) {
      setSelectedIds((current) =>
        current.filter((id) => !visibleData.some((item) => item.id === id))
      );
      return;
    }

    setSelectedIds((current) => [
      ...new Set([...current, ...visibleData.map((item) => item.id)]),
    ]);
  };

  const handleAddVoucher = () => {
    localStorage.removeItem("selectedVoucherBatch");
    localStorage.removeItem("selectedBuyer");
    setActivePage("create-voucher");
  };

  const statusColor = (status) => {
    switch (status) {
      case "For Release":
        return "bg-blue-100 text-blue-700";
      case "Hold":
        return "bg-orange-100 text-orange-700";
      case "Released":
        return "bg-green-100 text-green-700";
      case "Not Found":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <div className="space-y-5">
      <PremiumPageHeader eyebrow="Commission Management" title={role === "Administrator" ? "Developer's Vouchers" : "My Commission Vouchers"} description={role === "Administrator" ? "Vouchers with commission releases and buyer computations." : "Only sales where you are included are shown here."} actions={<>
            {canManage && (
              <button
                onClick={handleAddVoucher}
                className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#2563eb] px-4 font-semibold text-white shadow-md shadow-blue-200"
              >
                <Plus className="h-5 w-5" />
                Add Voucher
              </button>
            )}

            <button className="inline-flex h-11 items-center gap-2 rounded-xl bg-red-500 px-4 text-sm font-semibold text-white shadow-sm">
              <FileDown className="h-5 w-5" />
              Export PDF
            </button>

            <button className="inline-flex h-11 items-center gap-2 rounded-xl bg-green-600 px-4 text-sm font-semibold text-white shadow-sm">
              <Sheet className="h-5 w-5" />
              Export Excel
            </button>
          </>} />

      <div className="rounded-[24px] border border-slate-200/70 bg-white p-5 shadow-sm">
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px]">
          <input
            type="text"
            placeholder="Search voucher, buyer, developer or project..."
            value={filters.search}
            onChange={(e) => { updateFilter("search", e.target.value); setPage(1); }}
            className="h-11 rounded-xl border border-gray-200 px-4 outline-none focus:border-[#2563eb] focus:ring-2 focus:ring-blue-100"
          />

          <select
            value={filters.status}
            onChange={(e) => { updateFilter("status", e.target.value); setPage(1); }}
            className="h-11 rounded-xl border border-gray-200 bg-white px-4 outline-none focus:border-[#2563eb] focus:ring-2 focus:ring-blue-100"
          >
            <option>All</option>
            <option>For Release</option>
            {role === "Administrator" && <option>Hold</option>}
            <option>Released</option>
            <option>Not Found</option>
          </select>
          {(filters.search || filters.status !== "All") && <button onClick={() => { resetFilters(); setPage(1); }} className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-600"><FilterX size={17} /> Clear filters</button>}
        </div>
        <p className="mt-3 text-xs text-slate-400">Filters and rows-per-page are saved on this device.</p>
      </div>

      <div className="overflow-hidden rounded-[24px] border border-slate-200/70 bg-white shadow-sm">
        {canManage && <div className="p-6 pb-0">
        <div className="mb-5">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={allVisibleSelected}
              onChange={handleSelectAll}
            />
            <span className="font-medium">Select All</span>
          </label>
        </div>
        </div>}

        <div className="responsive-table-wrap">
        <table className="w-full min-w-[1050px]">
          <thead className="bg-slate-50/90">
            <tr className="border-b border-slate-100 text-xs font-black uppercase tracking-wide text-slate-500">
              {canManage && <th className="px-4 py-5 text-left">Select</th>}
              <th className="px-4 py-5 text-left">Voucher No.</th>
              <th className="px-4 py-5 text-left">Developer</th>
              <th className="px-4 py-5 text-left">Project</th>
              <th className="px-4 py-5 text-left">Saved Date</th>
              <th className="px-4 py-5 text-left">Released Date</th>
              <th className="px-4 py-5 text-left">Assigned Amount</th>
              <th className="px-4 py-5 text-center">Computed</th>
              <th className="px-4 py-5 text-left">Status</th>
              <th className="px-5 py-5 text-right">Action</th>
            </tr>
          </thead>

          <tbody>
            {loading && <TableSkeleton columns={canManage ? 10 : 9} rows={5} />}

            {!loading && filteredData.length === 0 && (
              <tr><td colSpan={canManage ? 10 : 9}><EmptyState title={filters.search || filters.status !== "All" ? "No matching vouchers" : "No commission vouchers yet"} description={filters.search || filters.status !== "All" ? "Try another voucher number, buyer, developer, project, or clear the filters." : canManage ? "Create the first developer voucher to begin tracking commission releases." : "A voucher will appear once you are included in the sale's BRS rate distribution."} action={(filters.search || filters.status !== "All") ? <button onClick={resetFilters} className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white">Clear filters</button> : canManage ? <button onClick={handleAddVoucher} className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white">Add Voucher</button> : null} /></td></tr>
            )}

            {!loading &&
              visibleData.map((item) => (
                <tr
                  key={item.id}
                  onClick={() => setSelectedVoucher(item)}
                  className="cursor-pointer border-b border-slate-100 transition-colors hover:bg-blue-50/40"
                >
                  {canManage && <td className="px-4 py-5">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(item.id)}
                      onClick={(event) => event.stopPropagation()}
                      onChange={() => handleSelect(item.id)}
                    />
                  </td>}

                  <td className="px-4 py-5 font-black text-slate-900">{item.voucherNo}</td>
                  <td className="px-4 py-5 font-medium text-slate-600">{item.developer || "-"}</td>
                  <td className="max-w-[220px] px-4 py-5 font-medium text-slate-700"><span className="block truncate" title={item.project || ""}>{item.project || "-"}</span></td>
                  <td className="px-4 py-5 text-sm font-medium text-slate-600">{item.voucherDate}</td>
                  <td className="px-4 py-5 text-sm font-medium text-slate-600">{formatReleasedDate(item.releasedDate)}</td>
                  <td className="px-4 py-5 font-black text-emerald-700">
                    {formatCurrency(item.assignedTotal)}
                  </td>
                  <td className="px-4 py-5 text-center">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${
                        item.doneCount === item.buyers.length
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-orange-100 text-orange-700"
                      }`}
                    >
                      {item.doneCount}/{item.buyers.length}
                    </span>
                  </td>
                  <td className="px-4 py-5">
                    {canManage ? <select
                      value={item.status}
                      onClick={(event) => event.stopPropagation()}
                      onChange={(e) =>
                        handleStatusChange(item.id, e.target.value)
                      }
                      className={`rounded-lg border-0 px-3 py-2 text-sm font-semibold ${statusColor(
                        item.status
                      )}`}
                    >
                      <option>N/A</option>
                      <option>For Release</option>
                      <option>Hold</option>
                      <option>Released</option>
                      <option>Not Found</option>
                    </select> : <span className={`rounded-full px-3 py-1 text-xs font-bold ${statusColor(item.status)}`}>{item.status}</span>}
                  </td>
                  <td className="px-5 py-5 text-right">
                    <button
                      onClick={(event) => {
                        event.stopPropagation();
                        if (canManage) handleOpenVoucher(item);
                        else setSelectedVoucher(item);
                      }}
                      className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-3.5 py-2 text-xs font-bold text-blue-700 transition hover:border-blue-300 hover:bg-blue-100"
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
        {!loading && <Pagination page={safePage} pageSize={filters.pageSize} total={filteredData.length} onPageChange={setPage} onPageSizeChange={(size) => { updateFilter("pageSize", size); setPage(1); }} />}
      </div>

      {selectedVoucher && (
        <VoucherDetailsModal
          voucher={selectedVoucher}
          computations={computations}
          onClose={() => setSelectedVoucher(null)}
        />
      )}
    </div>
  );
}

function VoucherDetailsModal({ voucher, computations, onClose }) {
  const [selectedBuyer, setSelectedBuyer] = useState(null);
  const selectedComputation = selectedBuyer
    ? findSavedComputation(computations, selectedBuyer, voucher.id)
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="voucher-details-modal max-h-[90vh] w-full max-w-6xl overflow-auto rounded-[28px] bg-white shadow-2xl">
        <div className="voucher-details-header sticky top-0 flex items-start justify-between gap-4 border-b bg-white p-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-gray-500">
              Voucher Buyers
            </p>
            <h2 className="mt-2 text-2xl font-black text-[#1f2937]">
              {voucher.voucherNo}
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              {voucher.buyerNames || "-"} - {voucher.project || "-"}
            </p>
          </div>

          <button
            onClick={onClose}
            className="voucher-details-close rounded-xl bg-gray-100 p-2 text-gray-600 hover:bg-gray-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid gap-4 p-6 md:grid-cols-5">
          <DetailCard label="Voucher Gross" value={formatCurrency(voucher.grossComm)} />
          <DetailCard label="Assigned Amount" value={formatCurrency(voucher.assignedTotal)} />
          <DetailCard label="Balance" value={formatCurrency(voucher.grossComm - voucher.assignedTotal)} />
          <DetailCard label="Buyers" value={voucher.buyers.length} />
          <DetailCard label="Released Date" value={formatReleasedDate(voucher.releasedDate)} />
        </div>

        {voucher.status === "Not Found" && <div className="px-6 pb-6"><div className="voucher-not-found rounded-2xl border border-red-200 bg-red-50 p-4"><p className="text-xs font-black uppercase tracking-wide text-red-600">Not Found Remarks</p><p className="mt-2 text-sm leading-6 text-red-800">{voucher.statusRemarks || "No remarks provided."}</p></div></div>}

        {voucher.voucherFileName && (
          <div className="px-6 pb-6">
            <div className="voucher-attachment rounded-2xl border border-blue-100 bg-blue-50/60 p-4">
              <p className="voucher-attachment-label text-sm font-semibold text-gray-600">
                Uploaded Voucher
              </p>
              {voucher.voucherPreview ? (
                <button
                  type="button"
                  onClick={() => openVoucherFile(voucher.voucherPreview)}
                  className="voucher-attachment-link mt-1 inline-block break-all font-bold text-blue-700 underline decoration-blue-300 underline-offset-4 hover:text-blue-900"
                  title="Open uploaded voucher in a new tab"
                >
                  {voucher.voucherFileName}
                </button>
              ) : (
                <p className="voucher-attachment-name mt-1 break-all font-bold text-gray-700">
                  {voucher.voucherFileName}
                </p>
              )}
            </div>
          </div>
        )}

        <div className="px-6 pb-6">
          <div className="voucher-details-table overflow-auto rounded-2xl border">
            <table className="w-full min-w-[900px]">
              <thead>
                <tr className="bg-[#0d1b4c] text-sm text-white">
                  <th className="p-3 text-left">BRS</th>
                  <th className="p-3 text-left">Buyer</th>
                  <th className="p-3 text-left">Project</th>
                  <th className="p-3 text-left">Buyer Amount</th>
                  <th className="p-3 text-left">Status</th>
                  <th className="p-3 text-left">Action</th>
                </tr>
              </thead>
              <tbody>
                {voucher.buyers.map((buyer) => (
                  <tr
                    key={buyer.id}
                    className={`border-b text-sm ${
                      selectedBuyer?.id === buyer.id ? "voucher-buyer-selected bg-blue-50" : ""
                    }`}
                  >
                    <td className="p-3 font-bold text-[#111827]">
                      {buyer.brsId || "-"}
                    </td>
                    <td className="p-3">{buyer.buyer || "-"}</td>
                    <td className="p-3">{buyer.project || "-"}</td>
                    <td className="p-3 font-black text-emerald-700">
                      {formatCurrency(buyer.commissionAmount)}
                    </td>
                    <td className="p-3">
                      <BuyerStatusBadge status={buyer.computationStatus} />
                    </td>
                    <td className="p-3">
                      <button
                        type="button"
                        onClick={() => setSelectedBuyer(buyer)}
                        className="rounded-lg bg-[#2563eb] px-4 py-2 text-sm font-semibold text-white"
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

        {selectedBuyer && (
          <div className="px-6 pb-6">
            <h3 className="mb-3 text-xl font-black text-[#1f2937]">
              {selectedBuyer.buyer} Computation - {formatCurrency(selectedBuyer.commissionAmount)}
            </h3>
            {!selectedComputation && (
              <div className="voucher-empty-computation rounded-2xl bg-gray-50 p-6 text-center text-gray-500">
                No saved computation yet for this buyer.
              </div>
            )}
            {selectedComputation && (
              <div className="voucher-details-table overflow-auto rounded-2xl border">
                <table className="w-full min-w-[1400px]">
                  <thead>
                    <tr className="bg-[#0d1b4c] text-sm text-white">
                      <th className="p-3 text-left">Name</th>
                      <th className="p-3 text-left">Role</th>
                      <th className="p-3 text-left">Rate</th>
                      <th className="p-3 text-left">For Release</th>
                      <th className="p-3 text-left">OPX</th>
                      <th className="p-3 text-left">Savings</th>
                      <th className="p-3 text-left">CA</th>
                      <th className="p-3 text-left">Marketing</th>
                      <th className="p-3 text-left">Ayuda</th>
                      <th className="p-3 text-left">Others</th>
                      <th className="p-3 text-left">Zonal Care</th>
                      <th className="p-3 text-left">Tax</th>
                      <th className="p-3 text-left">Net Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(selectedComputation.rows || []).map((row, index) => (
                      <tr key={`${row.role}-${index}`} className="border-b text-sm">
                        <td className="p-3 font-bold text-[#111827]">
                          {row.name || "-"}
                        </td>
                        <td className="p-3">{row.role || "-"}</td>
                        <td className="p-3">{row.rate || 0}%</td>
                        <td className="p-3 font-semibold text-blue-600">
                          {formatCurrency(row.forRelease)}
                        </td>
                        <td className="p-3 text-orange-500">
                          {row.opx ? formatCurrency(row.opx) : "-"}
                        </td>
                        <td className="p-3">{formatCurrency(row.deductions?.savings)}</td>
                        <td className="p-3">{formatCurrency(row.deductions?.ca)}</td>
                        <td className="p-3">{formatCurrency(row.deductions?.marketing)}</td>
                        <td className="p-3">{formatCurrency(row.deductions?.ayuda)}</td>
                        <td className="p-3">{formatCurrency(row.deductions?.others)}</td>
                        <td className="p-3">{formatCurrency(row.deductions?.zonalCare)}</td>
                        <td className="p-3 text-red-500">
                          {row.taxAmount ? formatCurrency(row.taxAmount) : "-"}
                        </td>
                        <td className="p-3 font-black text-green-600">
                          {formatCurrency(row.netAmount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function DetailCard({ label, value }) {
  return (
    <div className="voucher-detail-card rounded-2xl bg-gray-50 p-4">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="mt-2 text-xl font-black text-[#111827]">{value}</p>
    </div>
  );
}

function BuyerStatusBadge({ status = "Pending" }) {
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

function findSavedComputation(computations, buyer, voucherBatchId) {
  const sameVoucher = computations.filter(
    (item) => item.selectedVoucherId === buyer.id
  );

  if (sameVoucher.length > 0) {
    return getLatest(sameVoucher);
  }

  const buyerAmount = getNumber(buyer.commissionAmount);
  const sameBatchBuyer = computations.filter(
    (item) =>
      item.voucherBatchId &&
      item.voucherBatchId === voucherBatchId &&
      item.brsDocId === buyer.brsDocId
  );
  const sameAmount = sameBatchBuyer.filter(
    (item) => getNumber(item.grossAmount) === buyerAmount
  );

  if (sameAmount.length > 0) {
    return getLatest(sameAmount);
  }

  return getLatest(sameBatchBuyer);
}

function getLatest(items) {
  return items.sort((a, b) => getMillis(b) - getMillis(a))[0] || null;
}

function getNumber(value) {
  return Number(String(value || "").replace(/,/g, "")) || 0;
}

function getMillis(item) {
  return (
    item.updatedAt?.toMillis?.() ||
    item.createdAt?.toMillis?.() ||
    new Date(item.updatedAt || item.createdAt || 0).getTime()
  );
}

function groupVoucherRows(rows) {
  const grouped = new Map();

  rows.forEach((row, index) => {
    const key = row.voucherBatchId || row.voucherNo || row.id;

    if (!grouped.has(key)) {
      grouped.set(key, {
        id: key,
        voucherNo: row.voucherNo || row.brsId || `V-${String(index + 1).padStart(4, "0")}`,
        voucherDate: row.voucherDate || formatDate(row.createdAt),
        grossComm: Number(row.amount) || 0,
        assignedTotal: 0,
        doneCount: 0,
        status: row.status || "For Release",
        statusRemarks: row.statusRemarks || "",
        releasedDate: row.releasedDate || null,
        developer: row.developer || "",
        project: row.project || "",
        voucherFileName: row.voucherFileName || "",
        voucherPreview: row.voucherPreview || "",
        buyers: [],
      });
    }

    const voucher = grouped.get(key);

    voucher.buyers.push(row);
    voucher.assignedTotal += Math.max(0, Number(row.commissionAmount) || 0);
    voucher.doneCount += row.computationStatus === "Done" ? 1 : 0;
    voucher.grossComm = Number(row.amount) || voucher.grossComm;
    voucher.developer = mergeLabel(voucher.developer, row.developer);
    voucher.project = mergeLabel(voucher.project, row.project);
    voucher.voucherFileName = voucher.voucherFileName || row.voucherFileName || "";
    voucher.voucherPreview = voucher.voucherPreview || row.voucherPreview || "";
    voucher.releasedDate = voucher.releasedDate || row.releasedDate || null;
    voucher.statusRemarks = voucher.statusRemarks || row.statusRemarks || "";
    voucher.buyerNames = mergeLabel(voucher.buyerNames, row.buyer);
    voucher.brsIds = mergeLabel(voucher.brsIds, row.brsId);
  });

  return Array.from(grouped.values()).sort((a, b) =>
    String(b.voucherDate).localeCompare(String(a.voucherDate))
  );
}

function mergeLabel(current = "", next = "") {
  if (!next) {
    return current;
  }

  const values = current ? current.split(", ") : [];

  if (values.includes(next)) {
    return current;
  }

  return [...values, next].join(", ");
}

function formatCurrency(value) {
  return `${peso}${Number(value || 0).toLocaleString()}`;
}

function formatReleasedDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function openVoucherFile(dataUrl) {
  try {
    const [metadata, encodedData] = dataUrl.split(",", 2);
    const mimeType = metadata.match(/^data:([^;]+)/)?.[1] || "application/octet-stream";
    const binary = atob(encodedData);
    const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
    const objectUrl = URL.createObjectURL(new Blob([bytes], { type: mimeType }));

    window.open(objectUrl, "_blank", "noopener,noreferrer");
    window.setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
  } catch (error) {
    console.error(error);
    alert("Unable to open the uploaded voucher.");
  }
}

function formatDate(timestamp) {
  if (!timestamp?.toDate) {
    return timestamp ? new Date(timestamp).toLocaleDateString() : "-";
  }

  return timestamp.toDate().toLocaleDateString();
}

export default DeveloperVoucher;

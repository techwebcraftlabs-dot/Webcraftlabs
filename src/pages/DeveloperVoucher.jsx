import { useEffect, useMemo, useState } from "react";
import { collection, doc, onSnapshot, updateDoc } from "firebase/firestore";
import { Eye, FileDown, Plus, Sheet, X } from "lucide-react";

import { db } from "../firebase";

const peso = "\u20b1";

function DeveloperVoucher({ setActivePage }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedIds, setSelectedIds] = useState([]);
  const [voucherRows, setVoucherRows] = useState([]);
  const [computations, setComputations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVoucher, setSelectedVoucher] = useState(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "commissionVouchers"),
      (snapshot) => {
        const records = snapshot.docs.map((item) => ({
          id: item.id,
          ...item.data(),
        }));

        records.sort((a, b) => {
          const dateA =
            a.createdAt?.toMillis?.() ||
            new Date(a.voucherDate || 0).getTime();
          const dateB =
            b.createdAt?.toMillis?.() ||
            new Date(b.voucherDate || 0).getTime();
          return dateB - dateA;
        });

        setVoucherRows(records);
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

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "commissionComputations"),
      (snapshot) => {
        setComputations(
          snapshot.docs.map((item) => ({
            id: item.id,
            ...item.data(),
          }))
        );
      },
      (error) => {
        console.error(error);
        alert(error.message);
      }
    );

    return () => unsubscribe();
  }, []);

  const viewData = useMemo(() => groupVoucherRows(voucherRows), [voucherRows]);
  const filteredData = viewData.filter((item) => {
    const searchValue = search.toLowerCase();
    const matchSearch = [
      item.voucherNo,
      item.buyerNames,
      item.developer,
      item.project,
      item.voucherDate,
    ]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(searchValue));

    const matchStatus =
      statusFilter === "All" ? true : item.status === statusFilter;

    return matchSearch && matchStatus;
  });

  const allVisibleSelected =
    filteredData.length > 0 &&
    filteredData.every((item) => selectedIds.includes(item.id));

  const handleStatusChange = async (id, value) => {
    setVoucherRows((current) =>
      current.map((item) =>
        (item.voucherBatchId || item.id) === id
          ? {
              ...item,
              status: value,
            }
          : item
      )
    );

    try {
      const voucher = viewData.find((item) => item.id === id);

      await Promise.all(
        (voucher?.buyers || []).map((buyer) =>
          updateDoc(doc(db, "commissionVouchers", buyer.id), {
            status: value,
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

  const handleSelectAll = () => {
    if (allVisibleSelected) {
      setSelectedIds((current) =>
        current.filter((id) => !filteredData.some((item) => item.id === id))
      );
      return;
    }

    setSelectedIds((current) => [
      ...new Set([...current, ...filteredData.map((item) => item.id)]),
    ]);
  };

  const statusColor = (status) => {
    switch (status) {
      case "For Release":
        return "bg-blue-100 text-blue-700";
      case "Hold":
        return "bg-orange-100 text-orange-700";
      case "Released":
        return "bg-green-100 text-green-700";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-[30px] bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-black text-[#1f2937]">
              Developer&apos;s Vouchers
            </h1>
            <p className="mt-2 text-gray-500">
              Vouchers with commission releases and buyer computations.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setActivePage("create-voucher")}
              className="inline-flex items-center gap-2 rounded-xl bg-[#4f5dff] px-5 py-3 font-semibold text-white"
            >
              <Plus className="h-5 w-5" />
              Add Voucher
            </button>

            <button className="inline-flex items-center gap-2 rounded-xl bg-red-500 px-5 py-3 font-semibold text-white">
              <FileDown className="h-5 w-5" />
              Export PDF
            </button>

            <button className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-5 py-3 font-semibold text-white">
              <Sheet className="h-5 w-5" />
              Export Excel
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-[30px] bg-white p-6 shadow-sm">
        <div className="grid gap-4 lg:grid-cols-2">
          <input
            type="text"
            placeholder="Search voucher, buyer, developer or project..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#4f5dff] focus:ring-2 focus:ring-blue-100"
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#4f5dff] focus:ring-2 focus:ring-blue-100"
          >
            <option>All</option>
            <option>For Release</option>
            <option>Hold</option>
            <option>Released</option>
          </select>
        </div>
      </div>

      <div className="overflow-auto rounded-[30px] bg-white p-6 shadow-sm">
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

        <table className="w-full min-w-[950px]">
          <thead>
            <tr className="border-b">
              <th className="py-4 text-left">Select</th>
              <th className="py-4 text-left">Voucher No.</th>
              <th className="py-4 text-left">Developer</th>
              <th className="py-4 text-left">Project</th>
              <th className="py-4 text-left">Saved Date</th>
              <th className="py-4 text-left">Assigned Amount</th>
              <th className="py-4 text-left">Computed</th>
              <th className="py-4 text-left">Status</th>
              <th className="py-4 text-left">Action</th>
            </tr>
          </thead>

          <tbody>
            {loading && (
              <tr>
                <td colSpan="9" className="py-10 text-center text-gray-500">
                  Loading vouchers...
                </td>
              </tr>
            )}

            {!loading && filteredData.length === 0 && (
              <tr>
                <td colSpan="9" className="py-10 text-center text-gray-500">
                  No vouchers yet.
                </td>
              </tr>
            )}

            {!loading &&
              filteredData.map((item) => (
                <tr
                  key={item.id}
                  onClick={() => setSelectedVoucher(item)}
                  className="cursor-pointer border-b hover:bg-gray-50"
                >
                  <td className="py-4">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(item.id)}
                      onClick={(event) => event.stopPropagation()}
                      onChange={() => handleSelect(item.id)}
                    />
                  </td>

                  <td className="font-semibold">{item.voucherNo}</td>
                  <td>{item.developer || "-"}</td>
                  <td>{item.project || "-"}</td>
                  <td>{item.voucherDate}</td>
                  <td className="font-bold text-emerald-700">
                    {formatCurrency(item.assignedTotal)}
                  </td>
                  <td>
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
                  <td>
                    <select
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
                    </select>
                  </td>
                  <td>
                    <button
                      onClick={(event) => {
                        event.stopPropagation();
                        setSelectedVoucher(item);
                      }}
                      className="inline-flex items-center gap-2 rounded-lg bg-[#4f5dff] px-4 py-2 text-sm text-white"
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
      <div className="max-h-[90vh] w-full max-w-6xl overflow-auto rounded-[28px] bg-white shadow-2xl">
        <div className="sticky top-0 flex items-start justify-between gap-4 border-b bg-white p-6">
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
            className="rounded-xl bg-gray-100 p-2 text-gray-600 hover:bg-gray-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid gap-4 p-6 md:grid-cols-4">
          <DetailCard label="Voucher Gross" value={formatCurrency(voucher.grossComm)} />
          <DetailCard label="Assigned Amount" value={formatCurrency(voucher.assignedTotal)} />
          <DetailCard label="Balance" value={formatCurrency(voucher.grossComm - voucher.assignedTotal)} />
          <DetailCard label="Buyers" value={voucher.buyers.length} />
        </div>

        <div className="px-6 pb-6">
          <div className="overflow-auto rounded-2xl border">
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
                      selectedBuyer?.id === buyer.id ? "bg-blue-50" : ""
                    }`}
                  >
                    <td className="p-3 font-bold text-[#0d1b4c]">
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
                        className="rounded-lg bg-[#4f5dff] px-4 py-2 text-sm font-semibold text-white"
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
              <div className="rounded-2xl bg-gray-50 p-6 text-center text-gray-500">
                No saved computation yet for this buyer.
              </div>
            )}
            {selectedComputation && (
              <div className="overflow-auto rounded-2xl border">
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
                        <td className="p-3 font-bold text-[#0d1b4c]">
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
    <div className="rounded-2xl bg-gray-50 p-4">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="mt-2 text-xl font-black text-[#0d1b4c]">{value}</p>
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
        developer: row.developer || "",
        project: row.project || "",
        buyers: [],
      });
    }

    const voucher = grouped.get(key);

    voucher.buyers.push(row);
    voucher.assignedTotal += Number(row.commissionAmount) || 0;
    voucher.doneCount += row.computationStatus === "Done" ? 1 : 0;
    voucher.grossComm = Number(row.amount) || voucher.grossComm;
    voucher.developer = mergeLabel(voucher.developer, row.developer);
    voucher.project = mergeLabel(voucher.project, row.project);
    voucher.buyerNames = mergeLabel(voucher.buyerNames, row.buyer);
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

function formatDate(timestamp) {
  if (!timestamp?.toDate) {
    return "-";
  }

  return timestamp.toDate().toLocaleDateString();
}

export default DeveloperVoucher;

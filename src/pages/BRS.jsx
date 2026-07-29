import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Eye, FilterX, Plus, Search, Trash2 } from "lucide-react";

import { brsApi } from "../lib/api";
import { EmptyState, Pagination, TableSkeleton } from "../components/ui/DataStates";
import { useFeedback } from "../components/ui/feedbackContext";
import { useSavedFilters } from "../hooks/useSavedFilters";
import PremiumPageHeader from "../components/dashboard/PremiumPageHeader";

function BRS({ setActivePage, setSelectedBRSId }) {
  const isAdministrator = localStorage.getItem("role") === "Administrator";
  const navigate = useNavigate();
  const [brsRecords, setBrsRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast, confirm } = useFeedback();
  const { filters, updateFilter, resetFilters } = useSavedFilters("brs", { search: "", status: "All", pageSize: 10 });
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState([]);

  useEffect(() => {
    const loadBRS = async () => {
      try {
        const records = await brsApi.list();
        setBrsRecords(records);
      } catch (error) {
        console.error(error);
        toast(error.message, "error");
      } finally {
        setLoading(false);
      }
    };

    loadBRS();
  }, [toast]);

  const statusOptions = ["For Approval", "Approved", "Hold", "Rejected"];

  const filteredRecords = brsRecords.filter((record) => {
    const status = record.status || "For Approval";
    const searchValue = filters.search.toLowerCase();
    const matchesStatus = filters.status === "All" || status === filters.status;
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
  const pageCount = Math.max(1, Math.ceil(filteredRecords.length / filters.pageSize));
  const safePage = Math.min(page, pageCount);
  const visibleRecords = filteredRecords.slice((safePage - 1) * filters.pageSize, safePage * filters.pageSize);
  const visibleIds = visibleRecords.map((record) => String(record.id));
  const allVisibleSelected = visibleIds.length > 0 && visibleIds.every((id) => selected.includes(id));

  const toggleVisible = () => {
    setSelected((current) => allVisibleSelected
      ? current.filter((id) => !visibleIds.includes(id))
      : [...new Set([...current, ...visibleIds])]);
  };

  const bulkDelete = async () => {
    const approved = await confirm({
      title: `Delete ${selected.length} BRS record${selected.length === 1 ? "" : "s"}?`,
      message: "This permanently removes the selected records and their attachments. This action cannot be undone.",
      confirmLabel: "Delete records",
    });
    if (!approved) return;
    try {
      await Promise.all(selected.map((id) => brsApi.delete(id)));
      setBrsRecords((current) => current.filter((record) => !selected.includes(String(record.id))));
      toast(`${selected.length} BRS record${selected.length === 1 ? "" : "s"} deleted.`, "success");
      setSelected([]);
    } catch (error) {
      toast(error.message, "error");
    }
  };

  const statusStyles = {
    Approved:
      "bg-emerald-50 text-emerald-700 border border-emerald-200",

    "For Approval":
      "bg-amber-50 text-amber-700 border border-amber-200",

    Hold:
      "bg-rose-50 text-rose-700 border border-rose-200",
    Rejected:
      "bg-slate-100 text-slate-700 border border-slate-200",
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
    <div className="space-y-6">
      {/* HEADER */}
      <PremiumPageHeader eyebrow="Buyer Reservations" title="BRS" description="Create, review, and monitor buyer reservation approvals." actions={<button
          onClick={() => navigate("/add-brs")}
          className="inline-flex items-center gap-2"
        >
          <span className="flex items-center gap-2"><Plus size={18} /> Add BRS</span>
        </button>} />

      {/* SEARCH AND FILTERS */}
      <div className="rounded-[24px] border border-slate-200/70 bg-white p-5 shadow-sm sm:p-6">
        <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
          <label className="relative block">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => { updateFilter("search", e.target.value); setPage(1); }}
            placeholder="Search BRS / Buyer / Project"
            className="
              w-full
              bg-[#f5f6fa]
              rounded-xl
              pl-11 pr-4
              py-3
              outline-none
              border
              border-transparent
              focus:border-[#2563eb]
            "
          />
          </label>

          <select
            value={filters.status}
            onChange={(e) => { updateFilter("status", e.target.value); setPage(1); }}
            className="
              h-12
              rounded-xl
              border
              border-gray-200
              bg-[#f5f6fa]
              px-4
              text-sm
              font-semibold
              text-[#111827]
              outline-none
              focus:ring-2
              focus:ring-[#2563eb]
            "
          >
            {["All", ...statusOptions].map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          {(filters.search || filters.status !== "All") && (
            <button onClick={resetFilters} className="flex h-12 items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 text-sm font-bold text-slate-600 hover:bg-slate-50"><FilterX size={17} /> Clear</button>
          )}
        </div>
        <p className="mt-3 text-xs text-slate-400">All submitted BRS records are visible to agents. Search, status, and rows-per-page settings are saved on this device.</p>
      </div>

      {isAdministrator && selected.length > 0 && (
        <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-blue-200 bg-blue-50 p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-bold text-blue-900">{selected.length} record{selected.length === 1 ? "" : "s"} selected</p>
          <div className="flex gap-2"><button onClick={() => setSelected([])} className="rounded-xl px-4 py-2 text-sm font-bold text-blue-700 hover:bg-blue-100">Clear selection</button><button onClick={bulkDelete} className="flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-700"><Trash2 size={16} /> Delete</button></div>
        </div>
      )}

      {/* TABLE */}
      <div className="overflow-hidden rounded-[24px] border border-slate-200/70 bg-white shadow-sm">
        <div className="responsive-table-wrap">
        <table className="w-full min-w-[1050px] border-separate border-spacing-0">
          <thead className="bg-slate-50/90">
            <tr className="text-left text-xs font-black uppercase tracking-wide text-slate-500">
              {isAdministrator && <th className="p-5"><input type="checkbox" aria-label="Select all records on this page" checked={allVisibleSelected} onChange={toggleVisible} className="h-4 w-4 rounded border-slate-300" /></th>}
              <th className="px-4 py-5">BRS No.</th>
              <th className="px-4 py-5">Closed</th>
              <th className="px-4 py-5">Posted</th>
              <th className="px-4 py-5">Status</th>
              <th className="px-4 py-5">Buyer</th>
              <th className="px-4 py-5">Project</th>
              <th className="px-4 py-5 text-center">Block</th>
              <th className="px-4 py-5 text-center">Lot</th>
              <th className="px-5 py-5 text-right">Action</th>
            </tr>
          </thead>

          <tbody>
            {loading && (
              <TableSkeleton columns={isAdministrator ? 10 : 9} rows={filters.pageSize > 10 ? 8 : 5} />
            )}

            {!loading && filteredRecords.length === 0 && (
              <tr><td colSpan={isAdministrator ? 10 : 9}><EmptyState title={filters.search || filters.status !== "All" ? "No matching BRS records" : "No BRS records yet"} description={filters.search || filters.status !== "All" ? "Try a different search term or clear the active filters." : isAdministrator ? "No submitted buyer reservation records yet." : "Create your first BRS and wait for administrator approval."} action={(filters.search || filters.status !== "All") ? <button onClick={resetFilters} className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white">Clear filters</button> : <button onClick={() => navigate('/add-brs')} className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white">Add BRS</button>} /></td></tr>
            )}

            {!loading && visibleRecords.map((record) => (
              <tr
                key={record.id}
                onClick={() => handleOpenDetails(record.id)}
                className="group border-t border-slate-100 transition-colors hover:bg-blue-50/40 cursor-pointer"
              >
                {isAdministrator && <td className="p-5" onClick={(event) => event.stopPropagation()}><input type="checkbox" aria-label={`Select ${record.brsId}`} checked={selected.includes(String(record.id))} onChange={() => setSelected((current) => current.includes(String(record.id)) ? current.filter((id) => id !== String(record.id)) : [...current, String(record.id)])} className="h-4 w-4 rounded border-slate-300" /></td>}
                <td className="px-4 py-5 font-black text-[#111827]">
                  {record.brsId}
                </td>

                <td className="px-4 py-5 text-sm font-medium text-gray-600">
                  {record.closedAt || "-"}
                </td>

                <td className="px-4 py-5 text-sm font-medium text-gray-600">
                  {record.postedAt || "-"}
                </td>

                <td className="px-4 py-5">
                  <span
                    className={`
                      px-3
                      py-1
                      rounded-full
                      text-xs
                      font-bold
                      ${statusStyles[record.status || "For Approval"]}
                    `}
                  >
                    {record.status || "For Approval"}
                  </span>
                </td>

                <td className="px-4 py-5 font-bold text-slate-800">
                  {record.buyer || "-"}
                </td>

                <td className="max-w-[240px] px-4 py-5 font-medium text-slate-600"><span className="block truncate" title={record.project || ""}>{record.project || "-"}</span></td>

                <td className="px-4 py-5 text-center font-bold text-slate-700">{record.block || "-"}</td>

                <td className="px-4 py-5 text-center font-bold text-slate-700">{record.lot || "-"}</td>
                <td className="px-5 py-5 text-right">
                  <button type="button" onClick={(event) => { event.stopPropagation(); handleOpenDetails(record.id); }} className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-3.5 py-2 text-xs font-bold text-blue-700 transition hover:border-blue-300 hover:bg-blue-100">
                    <Eye size={15} /> View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
        {!loading && <Pagination page={safePage} pageSize={filters.pageSize} total={filteredRecords.length} onPageChange={setPage} onPageSizeChange={(size) => { updateFilter("pageSize", size); setPage(1); }} />}
      </div>
    </div>
  );
}

export default BRS;

import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Check, Pencil, Save, X } from "lucide-react";

import { brsApi, voucherApi } from "../lib/api";

const protectedRateRoles = new Set([
  "developer", "hlc", "sales director", "assistant hlc 1", "assistant hlc 2",
  "broker partner", "platform partner", "jba", "zonal", "local sd", "recruiter", "coordinator", "ads/scholar",
  "evp", "documentation hlc", "referral", "referral 2",
]);

function BRSDetails({ selectedBRSId, setActivePage }) {
  const isAdministrator = localStorage.getItem("role") === "Administrator";
  const navigate = useNavigate();
  const { id } = useParams();
  const recordId = selectedBRSId || id;
  const [record, setRecord] = useState(null);
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(Boolean(recordId));
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savingStatus, setSavingStatus] = useState(false);
  const [statusDraft, setStatusDraft] = useState("For Approval");
  const [formData, setFormData] = useState({});
  const [rateDistribution, setRateDistribution] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const editingRef = useRef(false);

  useEffect(() => {
    editingRef.current = editing;
  }, [editing]);

  useEffect(() => {
    if (!recordId) {
      return undefined;
    }

    const loadRecord = async () => {
      try {
        const nextRecord = await brsApi.get(recordId);

        setRecord(nextRecord);
        setStatusDraft(nextRecord?.status || "For Approval");
        if (nextRecord && !editingRef.current) {
          setFormData(createEditableRecord(nextRecord));
          setRateDistribution(
            Array.isArray(nextRecord.rateDistribution)
              ? nextRecord.rateDistribution
              : []
          );
        }
        setLoading(false);
      } catch (error) {
        console.error(error);
        alert(error.message);
        setLoading(false);
      }
    };

    loadRecord();
  }, [recordId]);

  useEffect(() => {
    if (!recordId) {
      return undefined;
    }

    brsApi
      .listAttachments(recordId)
      .then(setAttachments)
      .catch((error) => {
        console.error(error);
        alert(error.message);
      });
  }, [recordId]);

  useEffect(() => {
    if (!recordId) {
      return undefined;
    }

    const loadVouchers = async () => {
      try {
        const records = (await voucherApi.list())
          .filter((item) => item.brsDocId === recordId)
          .sort((a, b) => {
            const dateA =
              a.createdAt?.toMillis?.() ||
              new Date(a.voucherDate || 0).getTime();
            const dateB =
              b.createdAt?.toMillis?.() ||
              new Date(b.voucherDate || 0).getTime();

            return dateB - dateA;
          });

        setVouchers(records);
      } catch (error) {
        console.error(error);
        alert(error.message);
      }
    };

    loadVouchers();
  }, [recordId]);

  const summary = useMemo(
    () => getPaymentSummary(editing ? formData : record, vouchers),
    [editing, formData, record, vouchers]
  );

  const handleBack = () => {
    if (setActivePage) {
      setActivePage("brs");
      return;
    }

    navigate(-1);
  };

  const handleEdit = () => {
    if (!record) {
      return;
    }

    setFormData(createEditableRecord(record));
    setRateDistribution(
      Array.isArray(record.rateDistribution) ? record.rateDistribution : []
    );
    setEditing(true);
  };

  const handleCancelEdit = () => {
    setFormData(createEditableRecord(record));
    setRateDistribution(
      Array.isArray(record.rateDistribution) ? record.rateDistribution : []
    );
    setEditing(false);
  };

  const handleChange = (e) => {
    const { name, type, checked, value } = e.target;

    setFormData((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleRateChange = (index, field, value) => {
    setRateDistribution((currentRows) =>
      currentRows.map((row, rowIndex) =>
        rowIndex === index ? { ...row, [field]: value } : row
      )
    );
  };

  const handleAddRateRow = () => {
    setRateDistribution((currentRows) => [
      ...currentRows,
      {
        role: "",
        name: "",
        rate: "",
      },
    ]);
  };

  const handleRemoveRateRow = (index) => {
    if (isProtectedRateRow(rateDistribution[index])) {
      alert("Standard rate-distribution rows cannot be removed.");
      return;
    }
    setRateDistribution((currentRows) =>
      currentRows.filter((_, rowIndex) => rowIndex !== index)
    );
  };

  const handleSaveEdit = async () => {
    if (!record?.id) {
      return;
    }

    if (!formData.brsId || !formData.buyer || !formData.project) {
      alert("Please fill out BRS No., Buyer, and Project.");
      return;
    }

    try {
      setSaving(true);

      await brsApi.update(record.id, {
        ...formData,
        amountDue: Number(cleanNumber(formData.amountDue)) || 0,
        developerDeductions:
          Number(cleanNumber(formData.developerDeductions)) || 0,
        rateDistribution: rateDistribution
          .filter((row) => row.role || row.name || row.rate)
          .map((row) => ({
            ...row,
            rate: Number(row.rate) || 0,
            taxable: !["developer", "zonal"].includes(
              String(row.role || "").toLowerCase()
            ),
          })),
      });

      const refreshedRecord = await brsApi.get(record.id);
      setRecord(refreshedRecord);
      setStatusDraft(refreshedRecord.status || "For Approval");
      setFormData(createEditableRecord(refreshedRecord));
      setRateDistribution(
        Array.isArray(refreshedRecord.rateDistribution)
          ? refreshedRecord.rateDistribution
          : []
      );
      setEditing(false);
      alert("BRS updated successfully.");
    } catch (error) {
      console.error(error);
      alert(error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (value) => {
    if (!record?.id) {
      return;
    }

    try {
      setSavingStatus(true);

      await brsApi.patch(record.id, {
        status: value,
      });

      if (setActivePage) {
        setActivePage("brs");
        return;
      }

      navigate("/dashboard");
    } catch (error) {
      console.error(error);
      alert(error.message);
    } finally {
      setSavingStatus(false);
    }
  };

  if (loading) {
    return (
      <section className="bg-[#f4f7fb] min-h-screen p-8">
        <div className="bg-white rounded-3xl shadow-lg p-8 text-center text-gray-500">
          Loading BRS details...
        </div>
      </section>
    );
  }

  if (!record) {
    return (
      <section className="bg-[#f4f7fb] min-h-screen p-8">
        <div className="bg-white rounded-3xl shadow-lg p-8 text-center text-gray-500">
          BRS record not found.
        </div>
      </section>
    );
  }

  const details = editing ? formData : record;

  return (
    <section className="brs-details-page min-h-screen bg-[#f4f7fb] p-4 sm:p-6 lg:p-8">
      <div className="brs-details-header sticky top-0 z-20 mb-6 rounded-3xl border border-slate-200/80 bg-white/95 p-5 shadow-[0_12px_35px_rgba(15,23,42,0.08)] backdrop-blur sm:p-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="mb-2 flex flex-wrap items-center gap-3"><span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-black uppercase tracking-wider text-blue-700">Buyer Reservation</span><StatusBadge status={record.status || "For Approval"} /></div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">BRS #{record.brsId || "-"}</h1>
          <p className="mt-1 text-sm text-slate-500">Review buyer, property, rates, and commission activity.</p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-end">
          {isAdministrator && <div className="min-w-[260px]">
            <label className="mb-1.5 block text-[11px] font-black uppercase tracking-[0.12em] text-slate-500">Approval Status</label>
            <div className="flex gap-2">
              <select
                value={statusDraft}
                onChange={(e) => setStatusDraft(e.target.value)}
                disabled={savingStatus}
                className="
                  h-12
                  rounded-xl
                  border
                  border-slate-200
                  bg-slate-50
                  px-4
                  font-semibold
                  text-[#111827]
                  outline-none
                  focus:ring-2
                  focus:ring-[#2563eb]
                  disabled:opacity-60
                "
              >
                <option value="For Approval">For Approval</option>
                <option value="Approved">Approved</option>
                <option value="Hold">Hold</option>
                <option value="Rejected">Rejected</option>
              </select>
              <button
                type="button"
                onClick={() => handleStatusChange(statusDraft)}
                disabled={savingStatus || statusDraft === (record.status || "For Approval")}
                className="flex h-12 items-center gap-2 rounded-xl bg-blue-600 px-4 font-bold text-white shadow-md shadow-blue-100 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Check size={17} /> {savingStatus ? "Saving..." : "Apply"}
              </button>
            </div>
          </div>}

          <div className="flex gap-2">
          <button onClick={handleBack} className="flex h-12 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 font-bold text-slate-700 hover:bg-slate-50"><ArrowLeft size={18} /> Back</button>
          {isAdministrator && <button
            onClick={editing ? handleSaveEdit : handleEdit}
            disabled={saving}
            className="flex h-12 items-center gap-2 rounded-xl bg-[#0d1b4c] px-5 font-bold text-white shadow-md hover:bg-[#09122f] disabled:opacity-60"
          >
            {editing ? <Save size={18} /> : <Pencil size={18} />}{editing ? (saving ? "Saving..." : "Save Changes") : "Edit"}
          </button>}
          {editing && (
            <button
              onClick={handleCancelEdit}
              disabled={saving}
              className="flex h-12 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
            >
              <X size={18} /> Cancel
            </button>
          )}
          </div>
        </div>
      </div>
      </div>

      <DetailsSection title="BUYER'S REGISTRATION SHEET">
        <Input label="BRS No." name="brsId" value={details.brsId} editing={editing} onChange={handleChange} />
        <Input label="Tripping Date" name="trippingDate" value={details.trippingDate} editing={editing} onChange={handleChange} />
        <Input label="Closing Date" name="closedAt" value={details.closedAt} editing={editing} onChange={handleChange} />
        <Input label="Posted" name="postedAt" value={details.postedAt} editing={editing} onChange={handleChange} />
        <Input label="HLC Code" name="hlcCode" value={details.hlcCode} editing={editing} onChange={handleChange} />
        <Input label="Team Name" name="teamName" value={details.teamName} editing={editing} onChange={handleChange} />
      </DetailsSection>

      <DetailsSection title="BUYER'S INFORMATION">
        <Input label="Full Name" name="buyer" value={details.buyer} editing={editing} onChange={handleChange} />
        <Input label="Address" name="buyerAddress" value={details.buyerAddress} editing={editing} onChange={handleChange} />
        <Input label="Mobile" name="buyerMobile" value={details.buyerMobile} editing={editing} onChange={handleChange} />
        <Input label="Email" name="buyerEmail" value={details.buyerEmail} editing={editing} onChange={handleChange} />
        <Input label="Birthdate" name="buyerBirthdate" value={details.buyerBirthdate} editing={editing} onChange={handleChange} />
        <Input label="Age" name="buyerAge" value={details.buyerAge} editing={editing} onChange={handleChange} />
      </DetailsSection>

      <DetailsSection title="PROPERTY DETAILS">
        <Input label="Developer" name="developer" value={details.developer} editing={editing} onChange={handleChange} />
        <Input label="Project" name="project" value={details.project} editing={editing} onChange={handleChange} />
        <Input label="LTS" name="lts" value={details.lts} editing={editing} onChange={handleChange} />
        <Input label="Project Location" name="projectLocation" value={details.projectLocation} editing={editing} onChange={handleChange} />
        <Input label="Direct" name="direct" value={details.direct} editing={editing} onChange={handleChange} />
        <Input label="Phase" name="phase" value={details.phase} editing={editing} onChange={handleChange} />
        <Input label="Block" name="block" value={details.block} editing={editing} onChange={handleChange} />
        <Input label="Lot" name="lot" value={details.lot} editing={editing} onChange={handleChange} />
        <Input label="Lot Area (SQM)" name="lotArea" value={details.lotArea} editing={editing} onChange={handleChange} />
        <Input label="Floor Area (SQM)" name="floorArea" value={details.floorArea} editing={editing} onChange={handleChange} />
        <Input label="Model Unit" name="modelUnit" value={details.modelUnit} editing={editing} onChange={handleChange} />
      </DetailsSection>

      <DetailsSection title="ACCOUNT DETAILS">
        <Input label="TCP" name="tcp" value={editing ? details.tcp : formatCurrency(getNumber(details.tcp))} editing={editing} onChange={handleChange} />
        <Input label="Total DP" name="totalDp" value={editing ? details.totalDp : formatCurrency(getNumber(details.totalDp))} editing={editing} onChange={handleChange} />
        <Input label="Financing Scheme" name="financingScheme" value={details.financingScheme} editing={editing} onChange={handleChange} />
        <Input label="NSP" name="nsp" value={editing ? details.nsp : formatCurrency(getNumber(details.nsp))} editing={editing} onChange={handleChange} />
        <Input label="Reservation" name="reservation" value={editing ? details.reservation : formatCurrency(getNumber(details.reservation))} editing={editing} onChange={handleChange} />
        <Input label="Payment Terms" name="paymentTerms" value={details.paymentTerms} editing={editing} onChange={handleChange} />
        <Input label="Loan Value" name="loanValue" value={editing ? details.loanValue : formatCurrency(getNumber(details.loanValue))} editing={editing} onChange={handleChange} />
        <Input label="Monthly DP" name="monthlyDp" value={editing ? details.monthlyDp : formatCurrency(getNumber(details.monthlyDp))} editing={editing} onChange={handleChange} />
        <Input label="Monthly Amortization" name="monthlyAmortization" value={editing ? details.monthlyAmortization : formatCurrency(getNumber(details.monthlyAmortization))} editing={editing} onChange={handleChange} />
      </DetailsSection>

      <DetailsSection title="RATE DISTRIBUTION">
        {(editing ? rateDistribution : record.rateDistribution || []).map((row, index) =>
          editing ? (
            <RateDistributionInput
              key={`${row.role}-${index}`}
              row={row}
              onChange={(field, value) => handleRateChange(index, field, value)}
              onRemove={() => handleRemoveRateRow(index)}
              canRemove={!isProtectedRateRow(row)}
            />
          ) : (
            <Input
              key={`${row.role}-${index}`}
              label={row.role}
              value={`${row.rate || 0}${row.name ? ` - ${row.name}` : ""}`}
            />
          )
        )}
        {editing && (
          <button
            type="button"
            onClick={handleAddRateRow}
            className="h-12 self-end rounded-xl bg-[#2563eb] px-5 font-semibold text-white"
          >
            Add Rate Row
          </button>
        )}
      </DetailsSection>

      <div className="brs-details-card mb-6 rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-7">
        <label className="flex items-center gap-3 mb-3 font-medium text-gray-700">
          <input
            type="checkbox"
            name="wrongInput"
            checked={Boolean(details.wrongInput)}
            readOnly={!editing}
            onChange={handleChange}
          />
          Wrong Input
        </label>
        <Label>Notes</Label>
        <textarea
          rows="5"
          name="notes"
          value={details.notes || ""}
          readOnly={!editing}
          onChange={handleChange}
          className={`w-full border border-gray-300 rounded-2xl p-5 outline-none resize-none ${
            editing ? "bg-white focus:ring-2 focus:ring-[#2563eb]" : "bg-gray-50"
          }`}
        />
        <div className="mt-5">
          <Label>Attached Files</Label>
          {attachments.length === 0 ? (
            <p className="text-sm text-gray-400">No attached files.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {attachments.map((attachment) => (
                <a
                  key={attachment.id}
                  href={brsApi.attachmentUrl(recordId, attachment.id)}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-lg bg-blue-50 px-3 py-2 text-sm font-semibold text-[#111827] hover:underline"
                >
                  {attachment.fileName}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="brs-details-card mb-6 rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-7">
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-5">
          <Input
            label="Amount Due"
            name="amountDue"
            value={editing ? details.amountDue : formatCurrency(summary.amountDue)}
            editing={editing}
            onChange={handleChange}
          />
          <Input label="Received" value={formatCurrency(summary.received)} />
          <Input
            label="Received %"
            value={formatPercent(summary.receivedPercent)}
          />
          <Input
            label="Developer Deductions"
            name="developerDeductions"
            value={
              editing
                ? details.developerDeductions
                : formatCurrency(summary.developerDeductions)
            }
            editing={editing}
            onChange={handleChange}
          />
          <Input label="Balance" value={formatCurrency(summary.balance)} />
        </div>
      </div>

      <div className="brs-details-card overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-6 py-5"><h2 className="text-lg font-black text-slate-900">Commission Voucher History</h2><p className="mt-1 text-sm text-slate-500">All releases recorded for this reservation.</p></div>
        <div className="responsive-table-wrap"><table className="w-full min-w-[700px]">
          <thead className="bg-[#f5f5f5]">
            <tr className="text-left text-gray-600">
              <th className="p-5">Date</th>
              <th className="p-5">Gross Commission</th>
              <th className="p-5">Buyer Amount</th>
              <th className="p-5">Notes</th>
            </tr>
          </thead>
          <tbody>
            {vouchers.length === 0 && (
              <tr>
                <td
                  colSpan="4"
                  className="p-8 text-center text-gray-500"
                >
                  No commission vouchers recorded for this BRS yet.
                </td>
              </tr>
            )}

            {vouchers.map((voucher) => (
              <tr
                key={voucher.id}
                className="border-t hover:bg-gray-50"
              >
                <td className="p-5">{voucher.voucherDate || "-"}</td>
                <td className="p-5">{formatCurrency(voucher.amount)}</td>
                <td className="p-5">
                  {formatCurrency(voucher.commissionAmount)}
                </td>
                <td className="p-5">{voucher.remarks || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table></div>
      </div>
    </section>
  );
}

function getNumber(value) {
  return Number(String(value || "").replace(/,/g, "")) || 0;
}

function cleanNumber(value) {
  return String(value || "").replace(/,/g, "");
}

function createEditableRecord(record = {}) {
  return {
    brsId: record.brsId || "",
    trippingDate: record.trippingDate || "",
    closedAt: record.closedAt || "",
    postedAt: record.postedAt || "",
    hlcCode: record.hlcCode || "",
    teamName: record.teamName || "",
    buyer: record.buyer || "",
    buyerAddress: record.buyerAddress || "",
    buyerMobile: record.buyerMobile || "",
    buyerEmail: record.buyerEmail || "",
    buyerBirthdate: record.buyerBirthdate || "",
    buyerAge: record.buyerAge || "",
    developer: record.developer || "",
    project: record.project || "",
    lts: record.lts || "",
    projectLocation: record.projectLocation || "",
    direct: record.direct || "",
    phase: record.phase || "",
    block: record.block || "",
    lot: record.lot || "",
    lotArea: record.lotArea || "",
    floorArea: record.floorArea || "",
    modelUnit: record.modelUnit || "",
    tcp: record.tcp || "",
    totalDp: record.totalDp || "",
    financingScheme: record.financingScheme || "",
    nsp: record.nsp || "",
    reservation: record.reservation || "",
    paymentTerms: record.paymentTerms || "",
    loanValue: record.loanValue || "",
    monthlyDp: record.monthlyDp || "",
    monthlyAmortization: record.monthlyAmortization || "",
    wrongInput: Boolean(record.wrongInput),
    notes: record.notes || "",
    amountDue: record.amountDue || "",
    developerDeductions: record.developerDeductions || "",
    status: record.status || "For Approval",
  };
}

function getRecordAmount(record) {
  return getNumber(record?.amount) || getNumber(record?.tcp) || getNumber(record?.nsp);
}

function getDeveloperRate(record) {
  return (
    Number(
      record?.rateDistribution?.find(
        (row) => row.role?.toLowerCase() === "developer"
      )?.rate
    ) || 0
  );
}

function getAmountDue(record) {
  const savedAmountDue = getNumber(record?.amountDue);

  if (savedAmountDue) {
    return savedAmountDue;
  }

  return getRecordAmount(record) * (getDeveloperRate(record) / 100);
}

function getPaymentSummary(record, vouchers) {
  const amountDue = getAmountDue(record);
  const received = vouchers.reduce(
    (total, voucher) =>
      total + getNumber(voucher.commissionAmount),
    0
  );
  const developerDeductions = getNumber(record?.developerDeductions);
  const balance = amountDue - received - developerDeductions;
  const receivedPercent = amountDue ? (received / amountDue) * 100 : 0;

  return {
    amountDue,
    received,
    developerDeductions,
    balance,
    receivedPercent,
  };
}

function formatCurrency(value) {
  return Number(value || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatPercent(value) {
  const percent = Number(value) || 0;

  if (percent === 0) {
    return "0%";
  }

  return `${percent.toFixed(2).replace(/\.00$/, "")}%`;
}

function DetailsSection({ title, children }) {
  return (
    <div className="brs-details-card mb-6 overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm">
      <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4 sm:px-7">
        <span className="h-6 w-1.5 rounded-full bg-blue-600" />
        <h2 className="text-sm font-black uppercase tracking-[0.08em] text-slate-800">{title}</h2>
      </div>
      <div className="grid gap-4 p-5 sm:grid-cols-2 sm:p-7 xl:grid-cols-4">
        {children}
      </div>
    </div>
  );
}

function Label({ children }) {
  return (
    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
      {children}
    </label>
  );
}

function RateDistributionInput({ row, onChange, onRemove, canRemove }) {
  return (
    <div>
      <Label>Rate Distribution</Label>
      <div className="grid grid-cols-[1fr_1fr_90px] gap-2">
        <input
          type="text"
          value={row.role || ""}
          onChange={(e) => onChange("role", e.target.value)}
          readOnly={!canRemove}
          placeholder="Role"
          className={`h-12 min-w-0 rounded-xl border border-gray-300 px-3 outline-none focus:ring-2 focus:ring-[#2563eb] ${!canRemove ? "bg-slate-50 font-semibold text-slate-600" : ""}`}
        />
        <input
          type="text"
          value={row.name || ""}
          onChange={(e) => onChange("name", e.target.value)}
          placeholder="Name"
          className="h-12 min-w-0 rounded-xl border border-gray-300 px-3 outline-none focus:ring-2 focus:ring-[#2563eb]"
        />
        <input
          type="number"
          min="0"
          step="0.01"
          value={row.rate || ""}
          onChange={(e) => onChange("rate", e.target.value)}
          placeholder="Rate"
          className="h-12 min-w-0 rounded-xl border border-gray-300 px-3 outline-none focus:ring-2 focus:ring-[#2563eb]"
        />
      </div>
      {canRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="mt-2 text-sm font-semibold text-rose-600"
        >
          Remove
        </button>
      )}
    </div>
  );
}

function Input({
  label,
  value,
  name,
  editing = false,
  onChange,
}) {
  return (
    <div>
      <Label>{label}</Label>
      <input
        type="text"
        value={editing ? value || "" : value || "-"}
        name={name}
        readOnly={!editing}
        onChange={onChange}
        className={`h-12 w-full rounded-xl border px-4 text-sm font-semibold outline-none transition ${
          editing ? "border-slate-300 bg-white text-slate-900 focus:border-blue-500 focus:ring-4 focus:ring-blue-50" : "border-slate-100 bg-slate-50 text-slate-700"
        }`}
      />
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    Approved: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    Hold: "bg-rose-50 text-rose-700 ring-rose-200",
    "For Approval": "bg-amber-50 text-amber-700 ring-amber-200",
  };
  return <span className={`rounded-full px-3 py-1 text-xs font-bold ring-1 ${styles[status] || "bg-slate-50 text-slate-600 ring-slate-200"}`}>{status}</span>;
}

function isProtectedRateRow(row) {
  return protectedRateRoles.has(String(row?.role || "").trim().toLowerCase());
}

export default BRSDetails;

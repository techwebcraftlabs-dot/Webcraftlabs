import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  collection,
  doc,
  onSnapshot,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

import { db } from "../firebase";

function BRSDetails({ setActivePage }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const [record, setRecord] = useState(null);
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(Boolean(id));
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({});
  const [rateDistribution, setRateDistribution] = useState([]);

  useEffect(() => {
    if (!id) {
      return undefined;
    }

    const unsubscribe = onSnapshot(
      doc(db, "brs", id),
      (snapshot) => {
        setRecord(
          snapshot.exists()
            ? { id: snapshot.id, ...snapshot.data() }
            : null
        );
        setLoading(false);
      },
      (error) => {
        console.error(error);
        alert(error.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [id]);

  useEffect(() => {
    if (!id) {
      return undefined;
    }

    const unsubscribe = onSnapshot(
      collection(db, "commissionVouchers"),
      (snapshot) => {
        const records = snapshot.docs
          .map((item) => ({
            id: item.id,
            ...item.data(),
          }))
          .filter((item) => item.brsDocId === id)
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
      },
      (error) => {
        console.error(error);
        alert(error.message);
      }
    );

    return () => unsubscribe();
  }, [id]);

  const summary = useMemo(
    () => getPaymentSummary(editing ? formData : record, vouchers),
    [editing, formData, record, vouchers]
  );

  useEffect(() => {
    if (record && !editing) {
      setFormData(createEditableRecord(record));
      setRateDistribution(
        Array.isArray(record.rateDistribution) ? record.rateDistribution : []
      );
    }
  }, [editing, record]);

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

      await updateDoc(doc(db, "brs", record.id), {
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
        updatedAt: serverTimestamp(),
      });

      setEditing(false);
      alert("BRS updated successfully.");
    } catch (error) {
      console.error(error);
      alert(error.message);
    } finally {
      setSaving(false);
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
    <section className="bg-[#f4f7fb] min-h-screen p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-[#0d1b4c]">
            BRS NO. {record.brsId || "-"}
          </h1>
          <p className="text-gray-500 mt-2">
            Buyer Registration Details
          </p>
        </div>

        <div className="flex gap-4">
          <button
            onClick={handleBack}
            className="bg-gray-200 hover:bg-gray-300 px-6 py-3 rounded-xl font-semibold"
          >
            Back
          </button>
          <button
            onClick={editing ? handleSaveEdit : handleEdit}
            disabled={saving}
            className="bg-[#0d1b4c] hover:bg-[#09122f] text-white px-6 py-3 rounded-xl font-semibold shadow-lg disabled:opacity-60"
          >
            {editing ? (saving ? "Saving..." : "Save Changes") : "Edit"}
          </button>
          {editing && (
            <button
              onClick={handleCancelEdit}
              disabled={saving}
              className="bg-white hover:bg-gray-50 px-6 py-3 rounded-xl font-semibold border border-gray-200 disabled:opacity-60"
            >
              Cancel
            </button>
          )}
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

      <div className="bg-white rounded-3xl shadow-lg p-8 mb-8">
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
      </div>

      <div className="bg-white rounded-3xl shadow-lg p-8 mb-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-5">
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
            value={`${summary.receivedPercent.toFixed(0)}%`}
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

      <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-[#f5f5f5]">
            <tr className="text-left text-gray-600">
              <th className="p-5">Date</th>
              <th className="p-5">Amount</th>
              <th className="p-5">Commission</th>
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
        </table>
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
      total + (getNumber(voucher.commissionAmount) || getNumber(voucher.amount)),
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

function DetailsSection({ title, children }) {
  return (
    <div className="bg-white rounded-3xl shadow-lg overflow-hidden mb-8">
      <div className="bg-[#2563eb] px-8 py-4">
        <h2 className="text-white text-lg font-bold">{title}</h2>
      </div>
      <div className="p-8 grid md:grid-cols-2 lg:grid-cols-4 gap-5">
        {children}
      </div>
    </div>
  );
}

function Label({ children }) {
  return (
    <label className="block text-sm font-semibold text-gray-500 mb-2">
      {children}
    </label>
  );
}

function RateDistributionInput({ row, onChange, onRemove }) {
  return (
    <div>
      <Label>Rate Distribution</Label>
      <div className="grid grid-cols-[1fr_1fr_90px] gap-2">
        <input
          type="text"
          value={row.role || ""}
          onChange={(e) => onChange("role", e.target.value)}
          placeholder="Role"
          className="h-12 min-w-0 rounded-xl border border-gray-300 px-3 outline-none focus:ring-2 focus:ring-[#2563eb]"
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
      <button
        type="button"
        onClick={onRemove}
        className="mt-2 text-sm font-semibold text-rose-600"
      >
        Remove
      </button>
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
        className={`w-full border border-gray-300 rounded-xl px-4 py-3 outline-none ${
          editing ? "bg-white focus:ring-2 focus:ring-[#2563eb]" : "bg-gray-50"
        }`}
      />
    </div>
  );
}

export default BRSDetails;

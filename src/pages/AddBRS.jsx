import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  addDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "../firebase";

const initialFormData = {
  brsId: "",
  trippingDate: "",
  closedAt: "",
  postedAt: "",
  hlcCode: "",
  teamName: "",
  buyer: "",
  buyerAddress: "",
  buyerMobile: "",
  buyerEmail: "",
  buyerBirthdate: "",
  buyerAge: "",
  developer: "",
  project: "",
  lts: "",
  projectLocation: "",
  direct: "",
  phase: "",
  block: "",
  lot: "",
  lotArea: "",
  floorArea: "",
  modelUnit: "",
  tcp: "",
  totalDp: "",
  financingScheme: "",
  nsp: "",
  reservation: "",
  paymentTerms: "",
  loanValue: "",
  monthlyDp: "",
  monthlyAmortization: "",
  wrongInput: false,
  notes: "",
  amountDue: "",
  developerDeductions: "",
};

const initialRateDistribution = [
  { role: "Developer", name: "", rate: "" },
  { role: "HLC", name: "", rate: "" },
  { role: "Assistant HLC 1", name: "", rate: "" },
  { role: "Assistant HLC 2", name: "", rate: "" },
  { role: "JBA", name: "JBA", rate: "" },
  { role: "ZONAL", name: "ZONAL", rate: "" },
  { role: "Local SD", name: "", rate: "" },
  { role: "Recruiter", name: "", rate: "" },
  { role: "Coordinator", name: "", rate: "" },
  { role: "ADS/Scholar", name: "", rate: "" },
  { role: "EVP", name: "", rate: "" },
  { role: "Documentation HLC", name: "", rate: "" },
  { role: "Referral", name: "", rate: "" },
  { role: "Referral 2", name: "", rate: "" },
];

function AddBRS() {
  const navigate = useNavigate();
  const [formData, setFormData] =
    useState(initialFormData);
  const [rateDistribution, setRateDistribution] =
    useState(initialRateDistribution);
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    const { name, type, checked, value } = e.target;

    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleRateChange = (index, field, value) => {
    setRateDistribution((currentRows) =>
      currentRows.map((row, rowIndex) =>
        rowIndex === index
          ? { ...row, [field]: value }
          : row
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

  const handleSave = async () => {
    if (!formData.brsId || !formData.buyer || !formData.project) {
      alert("Please fill out BRS No., Buyer, and Project.");
      return;
    }

    try {
      setSaving(true);

      await addDoc(collection(db, "brs"), {
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
              row.role.toLowerCase()
            ),
          })),
        status: "For Approval",
        createdAt: serverTimestamp(),
      });

      alert("BRS saved successfully.");
      navigate("/dashboard");
    } catch (error) {
      console.error(error);
      alert(error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="bg-[#f4f7fb] min-h-screen p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-[#0d1b4c]">
            Add BRS
          </h1>

          <p className="text-gray-500 mt-2">
            Create a buyer registration sheet
          </p>
        </div>

        <div className="flex gap-4">
          <button
            onClick={() => navigate(-1)}
            className="bg-gray-200 hover:bg-gray-300 px-6 py-3 rounded-xl font-semibold"
          >
            Cancel
          </button>

          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-[#0d1b4c] hover:bg-[#09122f] text-white px-8 py-3 rounded-xl font-semibold shadow-lg disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save BRS"}
          </button>
        </div>
      </div>

      <FormSection title="Buyer's Registration Sheet">
        <TextField
          label="BRS No."
          name="brsId"
          value={formData.brsId}
          onChange={handleChange}
        />
        <TextField
          label="Tripping Date"
          name="trippingDate"
          type="date"
          value={formData.trippingDate}
          onChange={handleChange}
        />
        <TextField
          label="Closing Date"
          name="closedAt"
          type="date"
          value={formData.closedAt}
          onChange={handleChange}
        />
        <TextField
          label="Posted Date"
          name="postedAt"
          type="date"
          value={formData.postedAt}
          onChange={handleChange}
        />
        <TextField
          label="HLC Code"
          name="hlcCode"
          value={formData.hlcCode}
          onChange={handleChange}
        />
        <TextField
          label="Team Name"
          name="teamName"
          value={formData.teamName}
          onChange={handleChange}
        />
      </FormSection>

      <FormSection title="Buyer's Information">
        <TextField
          label="Full Name"
          name="buyer"
          value={formData.buyer}
          onChange={handleChange}
          className="lg:col-span-2"
        />
        <TextField
          label="Address"
          name="buyerAddress"
          value={formData.buyerAddress}
          onChange={handleChange}
          className="lg:col-span-2"
        />
        <TextField
          label="Mobile"
          name="buyerMobile"
          value={formData.buyerMobile}
          onChange={handleChange}
        />
        <TextField
          label="Email"
          name="buyerEmail"
          type="email"
          value={formData.buyerEmail}
          onChange={handleChange}
        />
        <TextField
          label="Birthdate"
          name="buyerBirthdate"
          type="date"
          value={formData.buyerBirthdate}
          onChange={handleChange}
        />
        <TextField
          label="Age"
          name="buyerAge"
          value={formData.buyerAge}
          onChange={handleChange}
        />
      </FormSection>

      <FormSection title="Property Details">
        <TextField
          label="Developer"
          name="developer"
          value={formData.developer}
          onChange={handleChange}
        />
        <TextField
          label="Project"
          name="project"
          value={formData.project}
          onChange={handleChange}
        />
        <TextField
          label="LTS"
          name="lts"
          value={formData.lts}
          onChange={handleChange}
        />
        <TextField
          label="Project Location"
          name="projectLocation"
          value={formData.projectLocation}
          onChange={handleChange}
        />
        <SelectField
          label="Direct"
          name="direct"
          value={formData.direct}
          onChange={handleChange}
          options={["YES", "NO"]}
        />
        <TextField
          label="Phase"
          name="phase"
          value={formData.phase}
          onChange={handleChange}
        />
        <TextField
          label="Block"
          name="block"
          value={formData.block}
          onChange={handleChange}
        />
        <TextField
          label="Lot"
          name="lot"
          value={formData.lot}
          onChange={handleChange}
        />
        <TextField
          label="Lot Area (SQM)"
          name="lotArea"
          value={formData.lotArea}
          onChange={handleChange}
        />
        <TextField
          label="Floor Area (SQM)"
          name="floorArea"
          value={formData.floorArea}
          onChange={handleChange}
        />
        <TextField
          label="Model Unit"
          name="modelUnit"
          value={formData.modelUnit}
          onChange={handleChange}
        />
      </FormSection>

      <FormSection title="Account Details">
        <TextField
          label="TCP"
          name="tcp"
          value={formData.tcp}
          onChange={handleChange}
        />
        <TextField
          label="Total DP"
          name="totalDp"
          value={formData.totalDp}
          onChange={handleChange}
        />
        <TextField
          label="Financing Scheme"
          name="financingScheme"
          value={formData.financingScheme}
          onChange={handleChange}
        />
        <TextField
          label="NSP"
          name="nsp"
          value={formData.nsp}
          onChange={handleChange}
        />
        <TextField
          label="Reservation"
          name="reservation"
          value={formData.reservation}
          onChange={handleChange}
        />
        <TextField
          label="Payment Terms"
          name="paymentTerms"
          value={formData.paymentTerms}
          onChange={handleChange}
        />
        <TextField
          label="Loan Value"
          name="loanValue"
          value={formData.loanValue}
          onChange={handleChange}
        />
        <TextField
          label="Monthly DP"
          name="monthlyDp"
          value={formData.monthlyDp}
          onChange={handleChange}
        />
        <TextField
          label="Monthly Amortization"
          name="monthlyAmortization"
          value={formData.monthlyAmortization}
          onChange={handleChange}
        />
      </FormSection>

      <FormSection title="Rate Distribution">
        <div className="lg:col-span-4">
          <div className="grid lg:grid-cols-3 gap-x-8 gap-y-4">
            {rateDistribution.map((row, index) => (
              <RateDistributionField
                key={`${row.role}-${index}`}
                row={row}
                canEditRole={index >= initialRateDistribution.length}
                onChange={(field, value) =>
                  handleRateChange(index, field, value)
                }
                onRemove={() => handleRemoveRateRow(index)}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={handleAddRateRow}
            className="mt-4 bg-[#2563eb] text-white px-5 py-3 rounded-xl font-semibold"
          >
            Add Extension
          </button>
        </div>
      </FormSection>

      <BRSReleaseSection
        formData={formData}
        rateDistribution={rateDistribution}
        onChange={handleChange}
      />
    </section>
  );
}

function cleanNumber(value) {
  return String(value || "").replace(/,/g, "");
}

function formatCurrency(value) {
  return Number(value || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function getAccountAmount(formData) {
  return (
    Number(cleanNumber(formData.nsp)) ||
    Number(cleanNumber(formData.tcp)) ||
    0
  );
}

function getDeveloperRate(rateDistribution) {
  return (
    Number(
      rateDistribution.find(
        (row) => row.role.toLowerCase() === "developer"
      )?.rate
    ) || 0
  );
}

function getComputedAmountDue(formData, rateDistribution) {
  const manualAmountDue = Number(cleanNumber(formData.amountDue));

  if (manualAmountDue) {
    return manualAmountDue;
  }

  return getAccountAmount(formData) *
    (getDeveloperRate(rateDistribution) / 100);
}

function BRSReleaseSection({
  formData,
  rateDistribution,
  onChange,
}) {
  const amountDue = getComputedAmountDue(
    formData,
    rateDistribution
  );
  const received = 0;
  const developerDeductions =
    Number(cleanNumber(formData.developerDeductions)) || 0;
  const balance = amountDue - received - developerDeductions;
  const receivedPercent = amountDue
    ? (received / amountDue) * 100
    : 0;

  return (
    <>
      <div className="bg-white rounded-3xl shadow-lg p-8 mb-8">
        <label className="flex items-center gap-3 mb-3 font-medium text-gray-700">
          <input
            type="checkbox"
            name="wrongInput"
            checked={formData.wrongInput}
            onChange={onChange}
          />
          Wrong Input
        </label>

        <Label>Notes</Label>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={onChange}
          rows="5"
          placeholder="Notes..."
          className="w-full border border-gray-300 rounded-2xl p-5 outline-none resize-y focus:ring-2 focus:ring-[#2563eb]"
        />
      </div>

      <div className="bg-white rounded-3xl shadow-lg p-8 mb-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-5">
          <TextField
            label="Amount Due"
            name="amountDue"
            value={formData.amountDue}
            onChange={onChange}
            placeholder={formatCurrency(amountDue)}
          />
          <ReadOnlyField
            label="Received"
            value={formatCurrency(received)}
          />
          <ReadOnlyField
            label="Received %"
            value={`${receivedPercent.toFixed(0)}%`}
          />
          <TextField
            label="Developer Deductions"
            name="developerDeductions"
            value={formData.developerDeductions}
            onChange={onChange}
          />
          <ReadOnlyField
            label="Balance"
            value={formatCurrency(balance)}
          />
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
            <tr>
              <td
                colSpan="4"
                className="p-8 text-center text-gray-500"
              >
                Voucher history will appear here after this BRS is
                included in a commission voucher.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  );
}

function ReadOnlyField({ label, value }) {
  return (
    <div>
      <Label>{label}</Label>
      <input
        type="text"
        readOnly
        value={value}
        className={`${fieldClassName} bg-gray-50 text-gray-700`}
      />
    </div>
  );
}

function FormSection({ title, children }) {
  return (
    <div className="bg-white rounded-3xl shadow-lg overflow-hidden mb-8">
      <div className="bg-[#2563eb] px-8 py-4">
        <h2 className="text-white text-lg font-bold">
          {title}
        </h2>
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

const fieldClassName =
  "h-12 w-full border border-gray-300 rounded-xl px-4 outline-none focus:ring-2 focus:ring-[#2563eb]";

function TextField({
  label,
  className = "",
  type = "text",
  ...props
}) {
  return (
    <div className={className}>
      <Label>{label}</Label>
      <input
        type={type}
        autoComplete="new-password"
        placeholder={label}
        className={fieldClassName}
        {...props}
      />
    </div>
  );
}

function SelectField({
  label,
  className = "",
  options,
  ...props
}) {
  return (
    <div className={className}>
      <Label>{label}</Label>
      <select
        autoComplete="off"
        className={fieldClassName}
        {...props}
      >
        <option value="">Select {label}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}

function RateDistributionField({
  row,
  canEditRole,
  onChange,
  onRemove,
}) {
  const isDeveloperRate =
    row.role.toLowerCase() === "developer";
  const hasLockedName =
    ["jba", "zonal"].includes(row.role.toLowerCase());
  const label = isDeveloperRate
    ? "Developer's Rate"
    : row.role;

  return (
    <div>
      {canEditRole ? (
        <input
          value={row.role}
          onChange={(e) => onChange("role", e.target.value)}
          autoComplete="new-password"
          placeholder="Role"
          className="mb-1 w-full text-xs font-semibold text-gray-500 uppercase tracking-wide outline-none"
        />
      ) : (
        <Label>{label}</Label>
      )}

      <div className="flex">
        <input
          type="number"
          min="0"
          step="0.01"
          value={row.rate}
          onChange={(e) => onChange("rate", e.target.value)}
          autoComplete="new-password"
          placeholder="0.00"
          className={`h-12 border border-gray-300 px-3 outline-none focus:ring-2 focus:ring-[#2563eb] ${
            isDeveloperRate
              ? "w-full rounded-xl"
              : "w-[86px] rounded-l-xl"
          }`}
        />

        {!isDeveloperRate && (
          <input
            value={row.name}
            onChange={(e) => onChange("name", e.target.value)}
            readOnly={hasLockedName}
            autoComplete="new-password"
            placeholder="Name"
            className={`h-12 min-w-0 flex-1 border border-l-0 border-gray-300 rounded-r-xl px-4 outline-none focus:ring-2 focus:ring-[#2563eb] ${
              hasLockedName
                ? "bg-gray-100 font-semibold text-gray-700"
                : ""
            }`}
          />
        )}
      </div>

      {canEditRole && (
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

export default AddBRS;

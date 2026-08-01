import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { agentApi, brsApi, developerApi, teamApi } from "../lib/api";

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
  { role: "Sales Director", name: "", rate: "" },
  { role: "Assistant HLC 1", name: "", rate: "" },
  { role: "Assistant HLC 2", name: "", rate: "" },
  { role: "Broker Partner", name: "Alex Morgan", rate: "" },
  { role: "Platform Partner", name: "Jordan Lee", rate: "" },
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
  const isAdministrator = localStorage.getItem("role") === "Administrator";
  const [formData, setFormData] =
    useState(initialFormData);
  const [rateDistribution, setRateDistribution] =
    useState(initialRateDistribution);
  const [saving, setSaving] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [developerProjects, setDeveloperProjects] = useState([]);
  const [agents, setAgents] = useState([]);
  const [teams, setTeams] = useState([]);
  const propertySelectionRef = useRef({ developer: "", project: "" });
  const hlcCodeRef = useRef("");
  const developerOptions = uniqueLabels(
    developerProjects.map((item) => item.developerName)
  );
  const projectOptions = uniqueLabels(
    developerProjects
      .filter(
        (item) =>
          normalizeLabel(item.developerName) ===
          normalizeLabel(formData.developer)
      )
      .map((item) => item.project)
  );
  const rateBalance = getRateBalance(rateDistribution);

  useEffect(() => {
    const loadNextBrsNumber = async () => {
      try {
        const { brsId } = await brsApi.nextNumber();
        setFormData((current) => ({ ...current, brsId }));
      } catch (error) {
        console.error("Unable to load the next BRS number.", error);
      }
    };

    loadNextBrsNumber();
  }, []);

  useEffect(() => {
    const loadDeveloperProjects = async () => {
      try {
        const records = await developerApi.list();
        setDeveloperProjects(records);

        const selected = propertySelectionRef.current;
        const savedProject = findDeveloperProject(
          records,
          selected.developer,
          selected.project
        );

        if (savedProject) {
          setFormData((current) => ({
            ...current,
            lts: savedProject.lts || "",
            projectLocation: savedProject.projectLocation || "",
          }));
          setRateDistribution((currentRows) =>
            withDeveloperRate(currentRows, savedProject.developerRate)
          );
        }
      } catch (error) {
        console.error("Unable to load developer projects.", error);
      }
    };

    loadDeveloperProjects();
  }, []);

  useEffect(() => {
    const loadAssignments = async () => {
      try {
        const records = await agentApi.brsOptions();
        let teamRecords = [];
        try {
          teamRecords = await teamApi.list();
        } catch {
          teamRecords = [];
        }
        setAgents(records);
        setTeams(teamRecords);

        const agent = findAgentByHlcCode(records, hlcCodeRef.current);
        if (!agent) return;

        setFormData((current) => ({ ...current, teamName: agent.team || "" }));
        setRateDistribution((currentRows) =>
          withAgentAssignments(currentRows, agent, null, teamRecords, records)
        );
      } catch (error) {
        console.error("Unable to load agents.", error);
      }
    };

    loadAssignments();
  }, []);

  const handleChange = (e) => {
    const { name, type, checked, value } = e.target;
    const nextValue = type === "checkbox" ? checked : value;

    if (name === "buyerBirthdate") {
      setFormData((current) => ({
        ...current,
        buyerBirthdate: value,
        buyerAge: calculateAge(value),
      }));
      return;
    }

    if (name === "hlcCode") {
      hlcCodeRef.current = value;
      const agent = findAgentByHlcCode(agents, value);
      const savedProject = findDeveloperProject(
        developerProjects,
        formData.developer,
        formData.project
      );

      setFormData((current) => ({
        ...current,
        hlcCode: value,
        teamName: agent?.team || "",
      }));
      setRateDistribution((currentRows) =>
        withAgentAssignments(currentRows, agent, savedProject, teams, agents)
      );
      return;
    }

    if (!["developer", "project"].includes(name)) {
      setFormData((current) => ({ ...current, [name]: nextValue }));
      return;
    }

    const nextDeveloper = name === "developer" ? value : formData.developer;
    const nextProject = name === "developer" ? "" : value;
    propertySelectionRef.current = {
      developer: nextDeveloper,
      project: nextProject,
    };
    const savedProject = findDeveloperProject(
      developerProjects,
      nextDeveloper,
      nextProject
    );

    setFormData((current) => ({
      ...current,
      developer: nextDeveloper,
      project: nextProject,
      lts: savedProject?.lts || "",
      projectLocation: savedProject?.projectLocation || "",
    }));
    const agent = findAgentByHlcCode(agents, formData.hlcCode);
    setRateDistribution((currentRows) =>
      withAgentAssignments(
        withDeveloperRate(currentRows, savedProject?.developerRate),
        agent,
        savedProject,
        teams,
        agents
      )
    );
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
    if (!formData.buyer || !formData.project) {
      alert("Please fill out Buyer and Project.");
      return;
    }

    if (Math.abs(rateBalance.difference) > 0.0001) {
      const direction = rateBalance.difference > 0 ? "Kulang" : "Sobra";
      alert(
        `${direction} ng ${Math.abs(rateBalance.difference).toFixed(2)}% ang rate distribution. Developer's Rate: ${rateBalance.developerRate.toFixed(2)}%, total hatian: ${rateBalance.distributedRate.toFixed(2)}%.`
      );
      return;
    }

    try {
      setSaving(true);

      const created = await brsApi.create({
        ...formData,
        amountDue: Number(cleanNumber(formData.amountDue)) || 0,
        developerDeductions:
          Number(cleanNumber(formData.developerDeductions)) || 0,
        rateDistribution: rateDistribution
          .filter((row) => row.role || row.name || row.rate)
          .map((row) => ({
            ...row,
            rate: Number(row.rate) || 0,
            taxable: !["developer", "platform partner", "zonal"].includes(
              row.role.toLowerCase()
            ),
        })),
        status: "For Approval",
      });

      for (const file of attachments) {
        await brsApi.uploadAttachment(created.id, {
          fileName: file.name,
          mimeType: file.type || "application/octet-stream",
          data: await fileToBase64(file),
        });
      }

      alert(isAdministrator ? "BRS saved successfully." : "BRS submitted for administrator approval.");
      localStorage.setItem("activeDashboardPage", "brs");
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
          <h1 className="text-3xl font-black text-[#111827]">
            Add BRS
          </h1>

          <p className="text-gray-500 mt-2">
            Create a buyer reservation system
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

      <FormSection title="Buyer's Reservation System">
        <TextField
          label="BRS No."
          name="brsId"
          value={formData.brsId}
          placeholder="Loading..."
          readOnly
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
          placeholder="Automatic from birthdate"
          readOnly
        />
      </FormSection>

      <FormSection title="Property Details">
        <SelectField
          label="Developer"
          name="developer"
          value={formData.developer}
          onChange={handleChange}
          options={developerOptions}
        />
        <SelectField
          label="Project"
          name="project"
          value={formData.project}
          onChange={handleChange}
          options={projectOptions}
          disabled={!formData.developer}
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
        attachments={attachments}
        onAttachmentsChange={setAttachments}
      />
    </section>
  );
}

function cleanNumber(value) {
  return String(value || "").replace(/,/g, "");
}

function calculateAge(birthdate, today = new Date()) {
  const [year, month, day] = String(birthdate || "")
    .split("-")
    .map(Number);

  if (!year || !month || !day) return "";

  let age = today.getFullYear() - year;
  const birthdayHasPassed =
    today.getMonth() + 1 > month ||
    (today.getMonth() + 1 === month && today.getDate() >= day);

  if (!birthdayHasPassed) age -= 1;
  return age >= 0 ? String(age) : "";
}

function getRateBalance(rows = []) {
  const developerRate = rows
    .filter((row) => normalizeLabel(row.role) === "developer")
    .reduce((total, row) => total + (Number(row.rate) || 0), 0);
  const distributedRate = rows
    .filter((row) => normalizeLabel(row.role) !== "developer")
    .reduce((total, row) => total + (Number(row.rate) || 0), 0);

  return {
    developerRate,
    distributedRate,
    difference: developerRate - distributedRate,
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
  attachments,
  onAttachmentsChange,
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

        <AttachmentPicker
          files={attachments}
          onChange={onAttachmentsChange}
          disabled={false}
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
            value={formatPercent(receivedPercent)}
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

const MAX_ATTACHMENT_SIZE = 3 * 1024 * 1024;

function AttachmentPicker({ files, onChange, disabled }) {
  const openFile = (file) => {
    const url = URL.createObjectURL(file);
    window.open(url, "_blank", "noopener,noreferrer");
    window.setTimeout(() => URL.revokeObjectURL(url), 60000);
  };

  const handleFiles = (event) => {
    const selected = Array.from(event.target.files || []);
    const oversized = selected.find((file) => file.size > MAX_ATTACHMENT_SIZE);

    if (oversized) {
      alert(`${oversized.name} is larger than the 3 MB attachment limit.`);
    }

    onChange([
      ...files,
      ...selected.filter((file) => file.size <= MAX_ATTACHMENT_SIZE),
    ]);
    event.target.value = "";
  };

  return (
    <div className="mt-5">
      <Label>Attach Files</Label>
      <input
        type="file"
        accept="application/pdf,image/jpeg,image/png,image/webp"
        multiple
        disabled={disabled}
        onChange={handleFiles}
        className="block w-full rounded-xl border border-gray-300 bg-white p-3 text-sm file:mr-4 file:rounded-lg file:border-0 file:bg-[#2563eb] file:px-4 file:py-2 file:font-semibold file:text-white"
      />
      <p className="mt-2 text-xs text-gray-400">Maximum 3 MB per file.</p>
      {files.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {files.map((file, index) => (
            <div key={`${file.name}-${index}`} className="flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-sm text-[#111827]">
              <button
                type="button"
                onClick={() => openFile(file)}
                className="font-semibold hover:underline"
              >
                {file.name}
              </button>
              <button
                type="button"
                aria-label={`Remove ${file.name}`}
                onClick={() => onChange(files.filter((_, itemIndex) => itemIndex !== index))}
                className="font-bold text-rose-600"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(",")[1] || "");
    reader.onerror = () => reject(new Error(`Could not read ${file.name}.`));
    reader.readAsDataURL(file);
  });
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
    ["broker partner", "platform partner", "jba", "zonal"].includes(row.role.toLowerCase());
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

function normalizeLabel(value) {
  return String(value || "").trim().toLowerCase();
}

function uniqueLabels(values) {
  const labels = new Map();

  values.filter(Boolean).forEach((value) => {
    const normalized = normalizeLabel(value);
    if (!labels.has(normalized)) labels.set(normalized, value);
  });

  return Array.from(labels.values());
}

function findDeveloperProject(records, developer, project) {
  return records.find(
    (item) =>
      normalizeLabel(item.developerName) === normalizeLabel(developer) &&
      normalizeLabel(item.project) === normalizeLabel(project)
  );
}

function withDeveloperRate(rows, rate) {
  return rows.map((row) =>
    normalizeLabel(row.role) === "developer"
      ? { ...row, rate: rate ?? "" }
      : row
  );
}

function findAgentByHlcCode(agents, hlcCode) {
  const code = normalizeLabel(hlcCode);
  if (!code) return null;
  return agents.find((agent) => normalizeLabel(agent.hlcCode) === code) || null;
}

function withAgentAssignments(rows, agent, project, teams = [], agents = []) {
  const fullName = agent
    ? [agent.firstName, agent.middleName, agent.lastName].filter(Boolean).join(" ")
    : "";
  const isCrossLocality =
    agent &&
    project &&
    normalizeLocation(agent.locality) !== normalizeLocation(project.projectLocation);
  const assignedTeam = teams.find(
    (team) => normalizeLabel(team.teamName) === normalizeLabel(agent?.team)
  );
  const assignedEvp = assignedTeam?.evpName || agent?.evp || "";

  return rows.map((row) => {
    const role = normalizeLabel(row.role);
    if (role === "hlc") return { ...row, name: fullName };
    if (role === "sales director") {
      return { ...row, name: agent?.salesDirector || "" };
    }
    if (role === "evp") return { ...row, name: assignedEvp };
    if (role === "local sd") {
      return {
        ...row,
        name: isCrossLocality
          ? getCanonicalAgentName(agents, project?.assignedLsd)
          : "",
      };
    }
    return row;
  });
}

function getCanonicalAgentName(agents, value) {
  const target = normalizeLabel(value);
  if (!target) return "";
  const matched = agents.find((candidate) => {
    const fullName = [candidate.firstName, candidate.middleName, candidate.lastName]
      .filter(Boolean).join(" ");
    const simpleName = [candidate.firstName, candidate.lastName]
      .filter(Boolean).join(" ");
    return [fullName, simpleName].some((name) => normalizeLabel(name) === target);
  });
  return matched
    ? [matched.firstName, matched.middleName, matched.lastName].filter(Boolean).join(" ")
    : String(value || "").trim();
}

function normalizeLocation(value) {
  return normalizeLabel(value).replace(/\b(city|province)\b/g, "").trim();
}

export default AddBRS;

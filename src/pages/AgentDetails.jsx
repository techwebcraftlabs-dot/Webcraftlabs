import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import { agentApi, ayudaApi } from "../lib/api";
import { useFeedback } from "../components/ui/feedbackContext";

const agentPasswordStorageKey = (agentId) => `agentTemporaryPassword:${agentId}`;

function AgentDetails() {
  const { confirm } = useFeedback();
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [resettingPassword, setResettingPassword] = useState(false);
  const [temporaryPassword, setTemporaryPassword] = useState(
    () => sessionStorage.getItem(agentPasswordStorageKey(id)) || ""
  );
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const [photoVersion, setPhotoVersion] = useState(0);
  const [savingPhoto, setSavingPhoto] = useState(false);
  const [ayudaLoans, setAyudaLoans] = useState([]);
  const [savingLoan, setSavingLoan] = useState(false);
  const [loanForm, setLoanForm] = useState({ originalAmount: "", releasedDate: new Date().toISOString().slice(0, 10), notes: "" });

  const [formData, setFormData] = useState({
    hlcCode: "",
    firstName: "",
    lastName: "",
    middleName: "",
    role: "",
    personalEmail: "",
    zonalEmail: "",
    password: "",
    mobileNumber: "",
    bdoAccountNumber: "",
    facebookUrl: "",
    address: "",
    birthDate: "",
    birthPlace: "",
    civilStatus: "",
    gender: "",
    recruiter: "",
    salesDirector: "",
    evp: "",
    accreditedDate: "",
    locality: "",
    team: "",
    zonalTaxRate: "5",
    status: "For Approval",
    passwordChangedAt: null,
  });

  useEffect(() => {
    const loadAgent = async () => {
      try {
        const [agent, credentials, loans] = await Promise.all([
          agentApi.get(id),
          agentApi.temporaryPassword(id).catch(() => ({ temporaryPassword: null })),
          ayudaApi.list(id),
        ]);
        setFormData(agent);
        setAyudaLoans(loans.filter((loan) => String(loan.agentId) === String(id)));
        if (credentials.temporaryPassword) {
          setTemporaryPassword(credentials.temporaryPassword);
          sessionStorage.setItem(agentPasswordStorageKey(id), credentials.temporaryPassword);
        }
      } catch (error) {
        console.error(error);
        alert(error.message);
      }

      setLoading(false);
    };

    loadAgent();
  }, [id]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const returnToAgents = () => {
    localStorage.setItem("activeDashboardPage", "agents");
    navigate("/dashboard", { replace: true });
  };

  const handleUpdate = async () => {
    try {
      await agentApi.update(id, formData);

      alert("Agent updated successfully");
      returnToAgents();
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  };

  const handleApprove = async () => {
    try {
      await agentApi.approve(id);

      alert("Agent approved");
      returnToAgents();
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  };

  const handleAddLoan = async () => {
    try {
      setSavingLoan(true);
      await ayudaApi.create({ agentId: id, ...loanForm });
      const loans = await ayudaApi.list(id);
      setAyudaLoans(loans.filter((loan) => String(loan.agentId) === String(id)));
      setLoanForm({ originalAmount: "", releasedDate: new Date().toISOString().slice(0, 10), notes: "" });
      alert("Ayuda loan added successfully.");
    } catch (error) { alert(error.message); }
    finally { setSavingLoan(false); }
  };

  const handleResetPassword = async () => {
    const confirmed = await confirm({
      title: "Reset agent password?",
      message: "The current password will stop working and a new temporary password will be generated.",
      confirmLabel: "Reset password",
    });

    if (!confirmed) {
      return;
    }

    try {
      setResettingPassword(true);
      const result = await agentApi.resetPassword(id);
      setTemporaryPassword(result.temporaryPassword);
      setFormData((current) => ({
        ...current,
        passwordChangedAt: new Date().toISOString(),
      }));
      sessionStorage.setItem(
        agentPasswordStorageKey(id),
        result.temporaryPassword
      );
    } catch (error) {
      console.error(error);
      alert(error.message);
    } finally {
      setResettingPassword(false);
    }
  };

  const handlePhotoChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      alert("Use a JPG, PNG, or WebP profile photo.");
      event.target.value = "";
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      alert("Profile photo must be 2 MB or smaller.");
      event.target.value = "";
      return;
    }

    setProfilePhoto(file);
    const reader = new FileReader();
    reader.onload = () => setPhotoPreview(String(reader.result || ""));
    reader.readAsDataURL(file);
  };

  const handleSavePhoto = async () => {
    if (!profilePhoto) {
      alert("Please select a profile photo first.");
      return;
    }

    try {
      setSavingPhoto(true);
      await agentApi.uploadPhoto(id, {
        mimeType: profilePhoto.type,
        data: await fileToBase64(profilePhoto),
      });
      setProfilePhoto(null);
      setPhotoPreview("");
      setPhotoVersion((current) => current + 1);
      alert("Profile photo updated successfully.");
    } catch (error) {
      console.error(error);
      alert(error.message);
    } finally {
      setSavingPhoto(false);
    }
  };

  if (loading) {
    return (
      <div className="p-10 text-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[30px] p-8 shadow-sm">

      <div className="flex items-center gap-4 mb-10">
        <button
          onClick={returnToAgents}
          className="w-12 h-12 rounded-xl bg-gray-100"
        >
          ←
        </button>

        <div>
          <h2 className="text-3xl font-black text-[#111827]">
            Agent Details
          </h2>

          <p className="text-gray-500">
            View and update agent information
          </p>
        </div>
      </div>

      <div className="mb-10 flex flex-col items-center gap-5 rounded-2xl bg-gray-50 p-6 sm:flex-row">
        <div className="relative flex h-32 w-32 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#0d1b4c] text-4xl font-black text-white">
          <span>{(formData.firstName || "A").charAt(0).toUpperCase()}</span>
          <img
            key={photoPreview || photoVersion}
            src={photoPreview || `${agentApi.photoUrl(id)}?v=${photoVersion}`}
            alt={`${formData.firstName || "Agent"} profile`}
            onError={(event) => { event.currentTarget.style.display = "none"; }}
            className="absolute inset-0 h-full w-full object-cover"
          />
        </div>
        <div className="w-full max-w-xl">
          <Label>Agent Profile Photo</Label>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handlePhotoChange}
            className="block w-full text-sm file:mr-4 file:rounded-lg file:border-0 file:bg-[#2563eb] file:px-4 file:py-2 file:font-semibold file:text-white"
          />
          <p className="mt-2 text-xs text-gray-400">Admin-controlled. JPG, PNG, or WebP; maximum 2 MB.</p>
          {profilePhoto && (
            <button
              type="button"
              onClick={handleSavePhoto}
              disabled={savingPhoto}
              className="mt-4 rounded-xl bg-[#0d1b4c] px-5 py-3 font-bold text-white disabled:opacity-60"
            >
              {savingPhoto ? "Saving Photo..." : "Save Profile Photo"}
            </button>
          )}
        </div>
      </div>

      {/* PERSONAL */}

      <h3 className="font-bold text-lg mb-5">
        Personal Information
      </h3>

      <div className="grid grid-cols-4 gap-6 mb-10">

        <Input
          label="HLC Code"
          name="hlcCode"
          value={formData.hlcCode}
          readOnly
        />

        <Input
          label="Last Name"
          name="lastName"
          value={formData.lastName}
          onChange={handleChange}
        />

        <Input
          label="First Name"
          name="firstName"
          value={formData.firstName}
          onChange={handleChange}
        />

        <Input
          label="Middle Name"
          name="middleName"
          value={formData.middleName}
          onChange={handleChange}
        />

        <Input
          label="Birth Date"
          name="birthDate"
          type="date"
          value={formData.birthDate}
          onChange={handleChange}
        />

        <Input
          label="Birth Place"
          name="birthPlace"
          value={formData.birthPlace}
          onChange={handleChange}
        />

        <Input
          label="Civil Status"
          name="civilStatus"
          value={formData.civilStatus}
          onChange={handleChange}
        />

        <Input
          label="Gender"
          name="gender"
          value={formData.gender}
          onChange={handleChange}
        />

      </div>

      {/* CONTACT */}

      <h3 className="font-bold text-lg mb-5">
        Contact Information
      </h3>

      <div className="grid grid-cols-4 gap-6 mb-10">

        <div className="col-span-2">
          <Label>Address</Label>

          <input
            name="address"
            value={formData.address || ""}
            onChange={handleChange}
            className="w-full border rounded-xl p-3"
          />
        </div>

        <Input
          label="Personal Email"
          name="personalEmail"
          value={formData.personalEmail}
          onChange={handleChange}
        />

        <Input
          label="Mobile Number"
          name="mobileNumber"
          value={formData.mobileNumber}
          onChange={handleChange}
        />

      </div>

      {/* EMPLOYMENT */}

      <h3 className="font-bold text-lg mb-5">
        Employment Information
      </h3>

      <div className="grid grid-cols-4 gap-6 mb-10">

        <Input
          label="Team"
          name="team"
          value={formData.team}
          onChange={handleChange}
        />

        <Input
          label="HLC Locality"
          name="locality"
          value={formData.locality}
          onChange={handleChange}
        />

        <Input
          label="Recruiter"
          name="recruiter"
          value={formData.recruiter}
          onChange={handleChange}
        />

        <Input
          label="BDO Account Number"
          name="bdoAccountNumber"
          value={formData.bdoAccountNumber || ""}
          onChange={handleChange}
          inputMode="numeric"
          maxLength={100}
        />

        <Input
          label="Facebook Profile URL"
          name="facebookUrl"
          type="url"
          value={formData.facebookUrl}
          onChange={handleChange}
        />

        <Input
          label="Sales Director (SD)"
          name="salesDirector"
          value={formData.salesDirector || "None"}
          onChange={handleChange}
        />

        <Input
          label="EVP"
          name="evp"
          value={formData.evp || "None"}
          onChange={handleChange}
        />

        <Input
          label="Accredited Date"
          name="accreditedDate"
          type="date"
          value={formData.accreditedDate || formData.recruitedDate}
          onChange={handleChange}
        />

        <div>
          <Label>Role</Label>

          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="w-full border rounded-xl p-3"
          >
            <option value="">
              Select Role
            </option>

            <option value="Agent">
              Agent
            </option>

            <option value="HLC">
              HLC
            </option>

            <option value="Sales Director">
              Sales Director
            </option>

            <option value="EVP">
              EVP
            </option>
          </select>
        </div>

        <Input
          label="Zonal Tax Rate (%)"
          name="zonalTaxRate"
          type="number"
          min="0"
          max="100"
          step="0.01"
          value={formData.zonalTaxRate}
          onChange={handleChange}
        />

      </div>

      {/* ACCOUNT */}

      <h3 className="font-bold text-lg mb-5">
        Account Information
      </h3>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">

        <Input
          label="Zonal Email"
          name="zonalEmail"
          value={formData.zonalEmail}
          onChange={handleChange}
        />

        <div>
          <Label>Password</Label>

          <input
            type="text"
            value={temporaryPassword}
            readOnly
            placeholder="Shown after an admin password reset"
            className="
              w-full
              border
              rounded-xl
              p-3
              bg-gray-100
            "
          />
        </div>

        <Input
          label="Password Last Changed"
          value={formatPasswordChangedAt(formData.passwordChangedAt)}
          readOnly
        />

        <div>
          <Label>Status</Label>

          <select
            name="status"
            value={formData.status || "For Approval"}
            onChange={handleChange}
            className="
              w-full
              border
              rounded-xl
              p-3
            "
          >
            <option value="For Approval">
              For Approval
            </option>

            <option value="Active">
              Active
            </option>

            <option value="Inactive">
              Inactive
            </option>
          </select>
        </div>

      </div>

      <section className="admin-ayuda-section mt-10 overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.06)]">
        <div className="flex flex-col gap-3 border-b border-slate-100 bg-gradient-to-r from-[#0d1b4c] to-[#1d4ed8] px-6 py-5 text-white sm:flex-row sm:items-center sm:justify-between"><div><p className="text-xs font-black uppercase tracking-[0.18em] text-blue-200">Ayuda / Loans</p><h3 className="mt-1 text-xl font-black">Loan account and payment ledger</h3></div><p className="max-w-md text-sm text-blue-100">Create loans and monitor deductions posted from released commissions.</p></div>
        <div className="ayuda-loan-form m-5 rounded-2xl border border-blue-100 bg-blue-50/50 p-5"><div className="mb-4"><p className="text-sm font-black text-slate-900">Add a new Ayuda loan</p><p className="mt-1 text-xs text-slate-500">Enter the principal amount and release information. Commission deductions remain manual.</p></div><div className="grid gap-4 md:grid-cols-3"><Input label="Loan Amount" name="originalAmount" type="number" min="0" step="0.01" value={loanForm.originalAmount} onChange={(event) => setLoanForm((current) => ({ ...current, originalAmount: event.target.value }))} /><Input label="Date Released" name="releasedDate" type="date" value={loanForm.releasedDate} onChange={(event) => setLoanForm((current) => ({ ...current, releasedDate: event.target.value }))} /><Input label="Notes" name="notes" value={loanForm.notes} onChange={(event) => setLoanForm((current) => ({ ...current, notes: event.target.value }))} /></div><div className="mt-4 flex justify-end"><button disabled={savingLoan} onClick={handleAddLoan} className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-black text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700 disabled:opacity-60">{savingLoan ? "Adding Loan..." : "Add Ayuda Loan"}</button></div></div>
        {ayudaLoans.length > 0 && <div className="mt-6 space-y-5">{ayudaLoans.map((loan) => <div key={loan.id} className="overflow-hidden rounded-2xl border border-slate-100 bg-white"><div className="responsive-table-wrap"><table className="w-full min-w-[600px]"><thead className="bg-slate-50 text-left text-xs uppercase text-slate-500"><tr><th className="p-4">Released</th><th className="p-4">Original</th><th className="p-4">Paid</th><th className="p-4">Remaining Balance</th><th className="p-4">Status</th></tr></thead><tbody><tr className="border-t"><td className="p-4">{loan.releasedDate}</td><td className="p-4 font-bold">₱{loan.originalAmount.toLocaleString()}</td><td className="p-4 font-bold text-emerald-600">₱{loan.totalPaid.toLocaleString()}</td><td className="p-4 font-black text-red-600">₱{loan.remainingBalance.toLocaleString()}</td><td className="p-4"><span className={`rounded-full px-3 py-1 text-xs font-bold ${loan.status === 'Paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>{loan.status}</span></td></tr></tbody></table></div>{loan.payments?.length > 0 ? <div className="border-t border-slate-100 p-5"><div className="mb-3"><p className="text-xs font-black uppercase tracking-widest text-blue-600">Payment History</p><p className="mt-1 text-sm text-slate-500">Ayuda deductions recorded from saved commission computations.</p></div><div className="responsive-table-wrap"><table className="w-full min-w-[650px]"><thead className="text-left text-xs uppercase text-slate-400"><tr><th className="p-3">Payment Date</th><th className="p-3">Buyer / Voucher</th><th className="p-3">Description</th><th className="p-3 text-right">Amount Paid</th><th className="p-3 text-right">Balance After</th></tr></thead><tbody>{buildLoanPaymentRows(loan).map((payment) => <tr key={payment.id} className="border-t border-slate-100"><td className="p-3">{new Date(payment.paidAt).toLocaleDateString()}</td><td className="p-3 font-semibold text-blue-700">{formatAyudaPaymentReference(payment)}</td><td className="p-3 text-slate-500">{payment.notes || 'Commission deduction'}</td><td className="p-3 text-right font-bold text-emerald-600">₱{payment.amount.toLocaleString()}</td><td className="p-3 text-right font-black text-slate-900">₱{payment.balanceAfter.toLocaleString()}</td></tr>)}</tbody></table></div></div> : <div className="border-t border-slate-100 px-5 py-4 text-sm text-slate-400">No Ayuda payments recorded yet. A record will appear after a commission computation with an Ayuda deduction is saved.</div>}</div>)}</div>}
      </section>

      <div className="flex justify-end gap-4 mt-10">

        <button
          type="button"
          onClick={handleResetPassword}
          disabled={resettingPassword}
          className="rounded-xl bg-amber-500 px-6 py-3 font-bold text-white disabled:opacity-60"
        >
          {resettingPassword ? "Resetting..." : "Reset Password"}
        </button>

        <button
          onClick={returnToAgents}
          className="
            px-6
            py-3
            rounded-xl
            bg-gray-200
          "
        >
          Cancel
        </button>

        {formData.status === "For Approval" && (
          <button
            onClick={handleApprove}
            className="
              px-6
              py-3
              rounded-xl
              bg-green-600
              text-white
            "
          >
            Approve
          </button>
        )}

        <button
          onClick={handleUpdate}
          className="
            px-6
            py-3
            rounded-xl
            bg-[#2563eb]
            text-white
          "
        >
          Update
        </button>

      </div>
    </div>
  );
}

function Label({ children }) {
  return (
    <label className="block mb-2 text-sm font-semibold text-gray-600">
      {children}
    </label>
  );
}

function Input({
  label,
  name,
  type = "text",
  value,
  onChange,
  readOnly = false,
}) {
  return (
    <div>
      <Label>{label}</Label>

      <input
        type={type}
        name={name}
        value={value || ""}
        onChange={onChange}
        readOnly={readOnly}
        className="
          w-full
          border
          rounded-xl
          p-3
          read-only:bg-gray-100
          read-only:text-gray-500
          read-only:cursor-not-allowed
        "
      />
    </div>
  );
}

export default AgentDetails;

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(",")[1] || "");
    reader.onerror = () => reject(new Error("Could not read the profile photo."));
    reader.readAsDataURL(file);
  });
}

function buildLoanPaymentRows(loan) {
  let balance = Number(loan.originalAmount || 0)
  const chronological = [...(loan.payments || [])].sort((a, b) => new Date(a.paidAt) - new Date(b.paidAt))
  return chronological.map((payment) => {
    balance = Math.max(0, balance - Number(payment.amount || 0))
    return { ...payment, balanceAfter: balance }
  }).reverse()
}

function formatAyudaPaymentReference(payment) {
  const buyer = payment.buyer || "Buyer";
  const voucher = payment.voucherNo && payment.voucherNo !== "null" ? payment.voucherNo : "";
  if (voucher) return `${buyer} — Voucher ${voucher}`;
  return payment.computationId ? `${buyer} — Computation #${payment.computationId}` : "Manual payment";
}

function formatPasswordChangedAt(value) {
  if (!value) return "Not recorded yet";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not recorded yet";

  return new Intl.DateTimeFormat("en-PH", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

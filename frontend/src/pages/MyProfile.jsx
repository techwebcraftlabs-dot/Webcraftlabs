import { useEffect, useState } from "react";
import { Eye, EyeOff, Save, UserRound } from "lucide-react";

import { agentApi } from "../lib/api";
import PremiumPageHeader from "../components/dashboard/PremiumPageHeader";

const editableFields = [
  "firstName",
  "lastName",
  "middleName",
  "personalEmail",
  "mobileNumber",
  "address",
  "birthDate",
  "birthPlace",
  "civilStatus",
  "gender",
];

function MyProfile() {
  const agentId = localStorage.getItem("agentId");
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(Boolean(agentId));
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [visiblePasswords, setVisiblePasswords] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });

  useEffect(() => {
    if (!agentId) {
      return;
    }

    agentApi
      .get(agentId)
      .then(setProfile)
      .catch((error) => {
        console.error(error);
        alert(error.message);
      })
      .finally(() => setLoading(false));
  }, [agentId]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setProfile((current) => ({ ...current, [name]: value }));
  };

  const handleSave = async () => {
    if (!profile || !agentId) {
      return;
    }

    try {
      setSaving(true);
      const personalDetails = Object.fromEntries(
        editableFields.map((field) => [field, profile[field] || ""])
      );

      await agentApi.update(agentId, personalDetails);
      const refreshed = await agentApi.get(agentId);
      setProfile(refreshed);
      localStorage.setItem(
        "fullName",
        `${refreshed.firstName || ""} ${refreshed.lastName || ""}`.trim()
      );
      alert("Profile updated successfully.");
    } catch (error) {
      console.error(error);
      alert(error.message);
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = (event) => {
    const { name, value } = event.target;
    setPasswords((current) => ({ ...current, [name]: value }));
  };

  const handleChangePassword = async () => {
    if (!passwords.currentPassword || !passwords.newPassword) {
      alert("Please enter your current and new password.");
      return;
    }

    if (passwords.newPassword.length < 12) {
      alert("New password must be at least 12 characters.");
      return;
    }
    if (new TextEncoder().encode(passwords.newPassword).length > 72) {
      alert("New password is too long.");
      return;
    }

    if (passwords.newPassword !== passwords.confirmPassword) {
      alert("New password and confirmation do not match.");
      return;
    }

    try {
      setChangingPassword(true);
      await agentApi.changePassword(agentId, {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      });
      setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setVisiblePasswords({ currentPassword: false, newPassword: false, confirmPassword: false });
      localStorage.setItem("mustChangePassword", "false");
      localStorage.removeItem("activeDashboardPage");
      sessionStorage.removeItem("zonal:password-redirecting");
      sessionStorage.removeItem("zonal:temporary-password-warning-shown");
      window.dispatchEvent(new CustomEvent("zonal:password-requirement-changed", {
        detail: { mustChangePassword: false },
      }));
      alert("Password changed successfully.");
    } catch (error) {
      console.error(error);
      alert(error.message);
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) {
    return <div className="rounded-3xl bg-white p-10 text-center text-gray-500">Loading profile...</div>;
  }

  if (!profile) {
    return <div className="rounded-3xl bg-white p-10 text-center text-gray-500">No agent profile is linked to this account.</div>;
  }

  return (
    <section className="rounded-[30px] bg-white p-8 shadow-sm">
      <div className="mb-6"><PremiumPageHeader eyebrow="My Account" title="My Profile" description="Update your personal information." icon={UserRound} actions={<button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center justify-center gap-2 disabled:opacity-60"
        >
          <Save className="h-5 w-5" />
          {saving ? "Saving..." : "Save Changes"}
        </button>} /></div>

      <Section title="Personal Information">
        <Field label="First Name" name="firstName" value={profile.firstName} onChange={handleChange} />
        <Field label="Middle Name" name="middleName" value={profile.middleName} onChange={handleChange} />
        <Field label="Last Name" name="lastName" value={profile.lastName} onChange={handleChange} />
        <Field label="Birth Date" name="birthDate" type="date" value={profile.birthDate} onChange={handleChange} />
        <Field label="Birth Place" name="birthPlace" value={profile.birthPlace} onChange={handleChange} />
        <SelectField label="Civil Status" name="civilStatus" value={profile.civilStatus} onChange={handleChange} options={["Single", "Married", "Widowed", "Separated"]} />
        <SelectField label="Gender" name="gender" value={profile.gender} onChange={handleChange} options={["Female", "Male"]} />
      </Section>

      <Section title="Contact Information">
        <Field label="Personal Email" name="personalEmail" type="email" value={profile.personalEmail} onChange={handleChange} />
        <Field label="Mobile Number" name="mobileNumber" value={profile.mobileNumber} onChange={handleChange} />
        <Field label="Address" name="address" value={profile.address} onChange={handleChange} className="md:col-span-2" />
      </Section>

      <Section title="Admin-Controlled Information" description="Contact an administrator to change these fields.">
        <Field label="HLC Code" value={profile.hlcCode} readOnly />
        <Field label="Role" value={profile.role} readOnly />
        <Field label="Team" value={profile.team} readOnly />
        <Field label="HLC Locality" value={profile.locality} readOnly />
        <Field label="Recruiter" value={profile.recruiter} readOnly />
        <Field label="Sales Director (SD)" value={profile.salesDirector || "None"} readOnly />
        <Field label="EVP" value={profile.evp || "None"} readOnly />
        <Field label="Accredited Date" value={profile.accreditedDate} readOnly />
        <Field label="Platform Login Email" value={profile.zonalEmail} readOnly />
        <Field label="Status" value={profile.status} readOnly />
        <Field label="Platform Tax Rate" value={`${Number(profile.zonalTaxRate || 0)}%`} readOnly />
      </Section>

      <div className="border-t border-gray-100 pt-7">
        <h2 className="text-lg font-black text-[#111827]">Change Password</h2>
        <p className="mt-1 text-sm text-gray-400">Enter your current password before setting a new one.</p>
        <div className="mt-5 grid gap-5 md:grid-cols-3">
          <PasswordField label="Current Password" name="currentPassword" autoComplete="current-password" value={passwords.currentPassword} onChange={handlePasswordChange} visible={visiblePasswords.currentPassword} onToggle={() => setVisiblePasswords((current) => ({ ...current, currentPassword: !current.currentPassword }))} />
          <PasswordField label="New Password" name="newPassword" autoComplete="new-password" value={passwords.newPassword} onChange={handlePasswordChange} visible={visiblePasswords.newPassword} onToggle={() => setVisiblePasswords((current) => ({ ...current, newPassword: !current.newPassword }))} />
          <PasswordField label="Confirm New Password" name="confirmPassword" autoComplete="new-password" value={passwords.confirmPassword} onChange={handlePasswordChange} visible={visiblePasswords.confirmPassword} onToggle={() => setVisiblePasswords((current) => ({ ...current, confirmPassword: !current.confirmPassword }))} />
        </div>
        <button
          type="button"
          onClick={handleChangePassword}
          disabled={changingPassword}
          className="mt-5 rounded-xl bg-[#0d1b4c] px-6 py-3 font-bold text-white disabled:opacity-60"
        >
          {changingPassword ? "Changing Password..." : "Change Password"}
        </button>
      </div>
    </section>
  );
}

function Section({ title, description, children }) {
  return (
    <div className="mb-8 border-t border-gray-100 pt-7">
      <h2 className="text-lg font-black text-[#111827]">{title}</h2>
      {description && <p className="mt-1 text-sm text-gray-400">{description}</p>}
      <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-4">{children}</div>
    </div>
  );
}

function Field({ label, className = "", ...props }) {
  return (
    <label className={className}>
      <span className="mb-2 block text-sm font-semibold text-gray-600">{label}</span>
      <input
        {...props}
        value={props.value || ""}
        className="h-12 w-full rounded-xl border border-gray-200 px-4 outline-none focus:border-[#2563eb] focus:ring-2 focus:ring-blue-100 read-only:bg-gray-100 read-only:text-gray-500"
      />
    </label>
  );
}

function SelectField({ label, options, ...props }) {
  return (
    <label>
      <span className="mb-2 block text-sm font-semibold text-gray-600">{label}</span>
      <select {...props} value={props.value || ""} className="h-12 w-full rounded-xl border border-gray-200 bg-white px-4 outline-none focus:border-[#2563eb] focus:ring-2 focus:ring-blue-100">
        <option value="">Select {label}</option>
        {options.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
    </label>
  );
}

function PasswordField({ label, visible, onToggle, ...props }) {
  const Icon = visible ? EyeOff : Eye;
  return (
    <label>
      <span className="mb-2 block text-sm font-semibold text-gray-600">{label}</span>
      <div className="relative">
        <input {...props} type={visible ? "text" : "password"} value={props.value || ""} className="h-12 w-full rounded-xl border border-gray-200 px-4 pr-12 outline-none focus:border-[#2563eb] focus:ring-2 focus:ring-blue-100" />
        <button type="button" onClick={onToggle} aria-label={visible ? `Hide ${label}` : `Show ${label}`} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"><Icon size={18} /></button>
      </div>
    </label>
  );
}

export default MyProfile;

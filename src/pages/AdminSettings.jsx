import { useState } from "react";
import { Eye, EyeOff, KeyRound, LockKeyhole, Save } from "lucide-react";

import PremiumPageHeader from "../components/dashboard/PremiumPageHeader";
import { authApi } from "../lib/api";

const emptyPasswords = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

function AdminSettings() {
  const [passwords, setPasswords] = useState(emptyPasswords);
  const [visible, setVisible] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
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
      setSaving(true);
      await authApi.changeAdminPassword({
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      });
      setPasswords(emptyPasswords);
      setVisible({
        currentPassword: false,
        newPassword: false,
        confirmPassword: false,
      });
      alert("Admin password changed successfully.");
    } catch (error) {
      alert(error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="rounded-[30px] bg-white p-5 shadow-sm sm:p-8">
      <PremiumPageHeader
        eyebrow="Administrator"
        title="Account Settings"
        description="Manage the credentials used to access the admin dashboard."
        icon={KeyRound}
      />

      <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <form onSubmit={handleSubmit} className="rounded-3xl border border-slate-100 p-5 sm:p-7">
          <div className="flex items-start gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
              <LockKeyhole size={21} />
            </span>
            <div>
              <h2 className="text-lg font-black text-slate-900">Change Password</h2>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                Confirm your current password, then enter a new password with at least 12 characters.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-5">
            <PasswordField
              label="Current Password"
              name="currentPassword"
              autoComplete="current-password"
              value={passwords.currentPassword}
              visible={visible.currentPassword}
              onChange={(event) => setPasswords((current) => ({ ...current, currentPassword: event.target.value }))}
              onToggle={() => setVisible((current) => ({ ...current, currentPassword: !current.currentPassword }))}
            />
            <div className="grid gap-5 md:grid-cols-2">
              <PasswordField
                label="New Password"
                name="newPassword"
                autoComplete="new-password"
                value={passwords.newPassword}
                visible={visible.newPassword}
                onChange={(event) => setPasswords((current) => ({ ...current, newPassword: event.target.value }))}
                onToggle={() => setVisible((current) => ({ ...current, newPassword: !current.newPassword }))}
              />
              <PasswordField
                label="Confirm New Password"
                name="confirmPassword"
                autoComplete="new-password"
                value={passwords.confirmPassword}
                visible={visible.confirmPassword}
                onChange={(event) => setPasswords((current) => ({ ...current, confirmPassword: event.target.value }))}
                onToggle={() => setVisible((current) => ({ ...current, confirmPassword: !current.confirmPassword }))}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="mt-6 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#071a3d] px-6 py-3 font-bold text-white shadow-sm transition hover:bg-[#0c285a] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Save size={19} />
            {saving ? "Saving..." : "Update Password"}
          </button>
        </form>

        <aside className="rounded-3xl border border-amber-100 bg-amber-50/70 p-6">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-amber-700">Security note</p>
          <h3 className="mt-3 text-lg font-black text-slate-900">Keep the account protected</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Changing the password signs out other admin sessions. Your current browser stays signed in.
          </p>
        </aside>
      </div>
    </section>
  );
}

function PasswordField({ label, visible, onToggle, ...props }) {
  const Icon = visible ? EyeOff : Eye;
  return (
    <label>
      <span className="mb-2 block text-sm font-bold text-slate-700">{label}</span>
      <div className="relative">
        <input
          {...props}
          type={visible ? "text" : "password"}
          required
          className="h-12 w-full rounded-xl border border-slate-200 px-4 pr-12 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />
        <button
          type="button"
          onClick={onToggle}
          aria-label={visible ? `Hide ${label}` : `Show ${label}`}
          title={visible ? `Hide ${label}` : `Show ${label}`}
          className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <Icon size={18} />
        </button>
      </div>
    </label>
  );
}

export default AdminSettings;

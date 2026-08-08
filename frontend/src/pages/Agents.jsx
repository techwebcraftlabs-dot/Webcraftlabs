import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  ArrowLeft,
  CheckCircle2,
  FilterX,
} from 'lucide-react';

import { agentApi, ayudaApi, teamApi } from '../lib/api';
import { EmptyState, Pagination, TableSkeleton } from '../components/ui/DataStates';
import { useFeedback } from '../components/ui/feedbackContext';
import { useSavedFilters } from '../hooks/useSavedFilters';
import { useUnsavedChanges } from '../hooks/useUnsavedChanges';
import PremiumPageHeader from '../components/dashboard/PremiumPageHeader';

const getInitialFormData = () => ({
  hlcCode: '',
  firstName: '',
  lastName: '',
  middleName: '',
  role: '',
  personalEmail: '',
  zonalEmail: '',
  password: '',
  mobileNumber: '',
  bdoAccountNumber: '',
  facebookUrl: '',
  address: '',
  birthDate: '',
  birthPlace: '',
  civilStatus: '',
  gender: '',
  recruiter: '',
  salesDirector: 'None',
  evp: 'None',
  accreditedDate: '',
  locality: '',
  team: '',
  subTeam: '',
  zonalTaxRate: '5',
  passOnVat: 'false',
});

function Agents() {
  const isAdministrator = localStorage.getItem('role') === 'Administrator';
  const navigate = useNavigate();
  const { toast, confirm } = useFeedback();
  const { filters, updateFilter, resetFilters } = useSavedFilters('agents', { search: '', status: 'All', pageSize: 10 });

  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState([]);
  const [bulkSaving, setBulkSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [formData, setFormData] = useState(getInitialFormData);
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [profilePreview, setProfilePreview] = useState('');
  const [savingAction, setSavingAction] = useState('');
  const [createdCredentials, setCreatedCredentials] = useState(null);
  useUnsavedChanges(showForm && isDirty);
const generateZonalEmail = (
  firstName,
  lastName
) => {
  if (!firstName || !lastName) return '';

  return `${firstName}.${lastName}`
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/[^a-z0-9.]/g, '') +
    '@zonal.com';
};
  const [agents, setAgents] = useState([]);
  const [ayudaLoans, setAyudaLoans] = useState([]);
  const [teamRecords, setTeamRecords] = useState([]);
  const teamOptions = teamRecords.map((team) => team.teamName);
  const selectedTeam = teamRecords.find((team) => team.teamName === formData.team);
  const subteamOptions = (selectedTeam?.subteams || []).map((item) => item.subteamName);
useEffect(() => {
  const loadAgents = async () => {
    try {
      setAgents(await agentApi.list());
    } catch (error) {
      console.error(error);
      toast(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  loadAgents();
}, [toast]);
useEffect(() => {
  if (!isAdministrator) return;
  ayudaApi.list().then(setAyudaLoans).catch((error) => toast(error.message, 'error'));
}, [isAdministrator, toast]);
useEffect(() => {
  teamApi.list().then((teams) => setTeamRecords(teams.filter((team) => team.status === 'Active'))).catch((error) => toast(error.message, 'error'));
}, [toast]);

  const handleChange = (e) => {
  setIsDirty(true);
  const { name, value } = e.target;

  const updated = {
    ...formData,
    [name]: value,
  };

  if (
    name === 'firstName' ||
    name === 'lastName'
  ) {
    updated.zonalEmail =
      generateZonalEmail(
        name === 'firstName'
          ? value
          : updated.firstName,

        name === 'lastName'
          ? value
          : updated.lastName
      );
  }

  if (name === 'recruiter') {
    const normalizedValue = value.trim().toLowerCase();
    const recruiterAgent = agents.find((agent) => {
      const fullName = `${agent.firstName || ''} ${agent.lastName || ''}`
        .trim()
        .toLowerCase();

      return [fullName, agent.zonalEmail, agent.hlcCode]
        .filter(Boolean)
        .some((candidate) => String(candidate).toLowerCase() === normalizedValue);
    });

    updated.salesDirector = recruiterAgent
      ? recruiterAgent.role === 'Sales Director'
        ? `${recruiterAgent.firstName || ''} ${recruiterAgent.lastName || ''}`.trim()
        : recruiterAgent.salesDirector || 'None'
      : 'None';
    updated.evp = recruiterAgent
      ? recruiterAgent.role === 'EVP'
        ? `${recruiterAgent.firstName || ''} ${recruiterAgent.lastName || ''}`.trim()
        : recruiterAgent.evp || 'None'
      : 'None';
  }

  if (name === 'team') {
    const selectedTeam = teamRecords.find((team) => team.teamName === value);
    updated.evp = selectedTeam?.evpName || 'None';
    updated.subTeam = '';
    updated.salesDirector = 'None';
  }

  if (name === 'subTeam') {
    const selectedTeam = teamRecords.find((team) => team.teamName === updated.team);
    const selectedSubteam = selectedTeam?.subteams?.find((item) => item.subteamName === value);
    updated.salesDirector = selectedSubteam?.sdName || 'None';
  }

  setFormData(updated);
};

  const handleSave = async (agentStatus = 'For Approval') => {
  if (savingAction) return;

  try {
    setSavingAction(agentStatus === 'Active' ? 'approve' : 'save');

    const created = await agentApi.create({
        firstName: formData.firstName,
        lastName: formData.lastName,
        middleName: formData.middleName,
        role: formData.role,
        personalEmail: formData.personalEmail,
        zonalEmail: formData.zonalEmail,
        mobileNumber: formData.mobileNumber,
        bdoAccountNumber: formData.bdoAccountNumber,
        facebookUrl: formData.facebookUrl,
        address: formData.address,
        birthDate: formData.birthDate,
        birthPlace: formData.birthPlace,
        civilStatus: formData.civilStatus,
        gender: formData.gender,
        recruiter: formData.recruiter,
        salesDirector: formData.salesDirector,
        evp: formData.evp,
        accreditedDate: formData.accreditedDate,
        locality: formData.locality,
        team: formData.team,
        subTeam: formData.subTeam,
        zonalTaxRate: Number(formData.zonalTaxRate),
        passOnVat: formData.passOnVat === 'true',
        status: agentStatus,
    });

    sessionStorage.setItem(
      `agentTemporaryPassword:${created.id}`,
      created.temporaryPassword
    );
    setCreatedCredentials({
      agentId: String(created.id),
      fullName: `${formData.firstName || ''} ${formData.lastName || ''}`.trim(),
      email: formData.zonalEmail,
      temporaryPassword: created.temporaryPassword,
    });

    if (profilePhoto && isAdministrator) {
      await agentApi.uploadPhoto(created.id, {
        mimeType: profilePhoto.type,
        data: await fileToBase64(profilePhoto),
      });
    }

    alert(agentStatus === 'Active' ? 'Agent saved and approved.' : 'Agent saved for approval.');
    setAgents(await agentApi.list());
    setShowForm(false);
    setIsDirty(false);

  } catch (error) {
    console.error(error);
    alert(error.message);
  } finally {
    setSavingAction('');
  }
};
  const openAddForm = async () => {
  setFormData({ ...getInitialFormData(), hlcCode: 'Loading...' });
  setProfilePhoto(null);
  setProfilePreview('');
  setIsDirty(false);
  setShowForm(true);

  try {
    const { hlcCode } = await agentApi.nextHlcCode();
    setFormData((current) => ({ ...current, hlcCode }));
  } catch (error) {
    console.error(error);
    alert(error.message);
    setShowForm(false);
  }
};

  const handlePhotoChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      alert('Use a JPG, PNG, or WebP profile photo.');
      event.target.value = '';
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      alert('Profile photo must be 2 MB or smaller.');
      event.target.value = '';
      return;
    }

    setProfilePhoto(file);
    setIsDirty(true);
    const reader = new FileReader();
    reader.onload = () => setProfilePreview(String(reader.result || ''));
    reader.readAsDataURL(file);
  };

  const closeForm = async () => {
    if (isDirty && !await confirm({
      title: 'Discard unsaved agent?',
      message: 'The agent information and selected profile photo will be lost.',
      confirmLabel: 'Discard changes',
    })) return;
    setShowForm(false);
    setIsDirty(false);
  };

  if (showForm) {
    return (
      <div className="agent-add-form bg-white rounded-[30px] p-8 shadow-sm">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={closeForm}
              className="agent-form-back w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center"
            >
              <ArrowLeft size={18} />
            </button>

            <div>
              <h2 className="text-3xl font-black text-[#111827]">
                Add Agent
              </h2>

              <p className="text-gray-500">
                Create new agent account
              </p>
            </div>
          </div>
        </div>

        {isAdministrator && <div className="agent-photo-panel mb-8 flex flex-col items-center gap-4 rounded-2xl border border-transparent bg-gray-50 p-6 sm:flex-row">
          <div className="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#0d1b4c] text-3xl font-black text-white">
            {profilePreview ? (
              <img src={profilePreview} alt="Agent profile preview" className="h-full w-full object-cover" />
            ) : (
              (formData.firstName || 'A').charAt(0).toUpperCase()
            )}
          </div>
          <div>
            <Label>Profile Photo</Label>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handlePhotoChange}
              className="agent-photo-input block w-full text-sm file:mr-4 file:rounded-lg file:border-0 file:bg-[#2563eb] file:px-4 file:py-2 file:font-semibold file:text-white"
            />
            <p className="mt-2 text-xs text-gray-400">JPG, PNG, or WebP. Maximum 2 MB.</p>
          </div>
        </div>}

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-x-5 gap-y-6">

          <TextField
            label="HLC Code"
            name="hlcCode"
            value={formData.hlcCode}
            readOnly
          />

          <TextField
            label="Last Name"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
          />

          <TextField
            label="First Name"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
          />

          <TextField
            label="Middle Name"
            name="middleName"
            value={formData.middleName}
            onChange={handleChange}
          />

          <SelectField
            label="Team"
            name="team"
            value={formData.team}
            onChange={handleChange}
            options={teamOptions}
          />

          <SelectField
            label="Sub-team"
            name="subTeam"
            value={formData.subTeam}
            onChange={handleChange}
            options={subteamOptions}
            disabled={!formData.team || !subteamOptions.length}
          />

          <TextField
            label="Birth Date"
            name="birthDate"
            type="date"
            value={formData.birthDate}
            onChange={handleChange}
          />

          <TextField
            label="Birth Place"
            name="birthPlace"
            value={formData.birthPlace}
            onChange={handleChange}
          />

          <SelectField
            label="Civil Status"
            name="civilStatus"
            value={formData.civilStatus}
            onChange={handleChange}
            options={["Single", "Married", "Widowed", "Separated"]}
          />

          <SelectField
            label="Gender"
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            options={["Female", "Male"]}
          />

          <TextField
            label="Address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            className="md:col-span-2"
          />

          <TextField
            label="Personal Email"
            name="personalEmail"
            type="email"
            value={formData.personalEmail}
            onChange={handleChange}
          />

          <TextField
            label="Zonal Login Email"
            value={formData.zonalEmail}
            readOnly
          />

          <TextField
            label="Mobile Number"
            name="mobileNumber"
            type="number"
            value={formData.mobileNumber}
            onChange={handleChange}
          />

          <TextField
            label="BDO Account Number"
            name="bdoAccountNumber"
            value={formData.bdoAccountNumber}
            onChange={handleChange}
            inputMode="numeric"
            maxLength={100}
            placeholder="Enter BDO account number"
          />

          <TextField
            label="Facebook Profile URL"
            name="facebookUrl"
            type="url"
            value={formData.facebookUrl}
            onChange={handleChange}
            placeholder="https://facebook.com/your-profile"
          />

          <SelectField
            label="HLC Locality"
            name="locality"
            value={formData.locality}
            onChange={handleChange}
            options={["North", "South", "East", "West"]}
          />

          <TextField
            label="Recruiter"
            name="recruiter"
            value={formData.recruiter}
            onChange={handleChange}
            list="agent-recruiters"
          />

          <datalist id="agent-recruiters">
            {agents.map((agent) => {
              const fullName = `${agent.firstName || ''} ${agent.lastName || ''}`.trim();
              return <option key={agent.id} value={fullName}>{agent.role || 'Agent'}</option>;
            })}
          </datalist>

          <TextField
            label="Sales Director (SD)"
            value={formData.salesDirector || 'None'}
            readOnly
          />

          <TextField
            label="EVP"
            value={formData.evp || 'None'}
            readOnly
          />

          <TextField
            label="Accredited Date"
            name="accreditedDate"
            type="date"
            value={formData.accreditedDate}
            onChange={handleChange}
          />

          <SelectField
            label="Role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            options={isAdministrator ? ["Agent", "HLC", "Sales Director", "EVP"] : ["Agent", "HLC", "Sales Director"]}
          />

          <TextField
            label="Zonal Tax Rate (%)"
            name="zonalTaxRate"
            type="number"
            min="0"
            max="100"
            step="0.01"
            value={formData.zonalTaxRate}
            onChange={handleChange}
          />

          <SelectField
            label="Pass-on VAT"
            name="passOnVat"
            value={formData.passOnVat}
            onChange={handleChange}
            options={[
              { value: 'false', label: 'No — deduct the 12% VAT share' },
              { value: 'true', label: 'Yes — return the 12% VAT share' },
            ]}
            helperText="Select Yes to return this person's 12% VAT share in commission computations."
          />

          <TextField
            label="Auto Generated Password"
            value="Generated securely when saved"
            readOnly
            className="md:col-span-2"
          />
        </div>

        <div className="flex justify-end gap-4 mt-10">
          {isAdministrator && <button
            onClick={closeForm}
            disabled={Boolean(savingAction)}
            className="agent-form-cancel px-6 py-3 rounded-xl bg-gray-200"
          >
            Cancel
          </button>}

          <button
            type="button"
            onClick={() => handleSave('Active')}
            disabled={Boolean(savingAction)}
            className="px-6 py-3 rounded-xl bg-green-600 text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {savingAction === 'approve' ? 'Approving...' : 'Approve'}
          </button>

          <button
            type="button"
            onClick={() => handleSave('For Approval')}
            disabled={Boolean(savingAction)}
            className="px-6 py-3 rounded-xl bg-[#2563eb] text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {savingAction === 'save' ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    );
  }

  const normalizedSearch = filters.search.trim().toLowerCase();
  const filteredAgents = agents.filter((agent) => {
    const hasAyudaLoan = ayudaLoans.some((loan) => String(loan.agentId) === String(agent.id));
    const matchesStatus = filters.status === 'All'
      || (filters.status === 'With Ayuda Loan' ? hasAyudaLoan
        : filters.status === 'No Ayuda Loan' ? !hasAyudaLoan
          : agent.status === filters.status);
    const matchesSearch = !normalizedSearch || [
      agent.hlcCode,
      agent.firstName,
      agent.middleName,
      agent.lastName,
      agent.role,
      agent.team,
      agent.zonalEmail,
    ].some((value) => String(value || '').toLowerCase().includes(normalizedSearch));
    return matchesStatus && matchesSearch;
  });
  const pageCount = Math.max(1, Math.ceil(filteredAgents.length / filters.pageSize));
  const safePage = Math.min(page, pageCount);
  const visibleAgents = filteredAgents.slice((safePage - 1) * filters.pageSize, safePage * filters.pageSize);
  const visibleIds = visibleAgents.map((agent) => String(agent.id));
  const allVisibleSelected = visibleIds.length > 0 && visibleIds.every((id) => selected.includes(id));

  const toggleVisible = () => setSelected((current) => allVisibleSelected
    ? current.filter((id) => !visibleIds.includes(id))
    : [...new Set([...current, ...visibleIds])]);

  const bulkApprove = async () => {
    const pendingAgents = agents.filter((agent) => selected.includes(String(agent.id)) && agent.status !== 'Active');
    if (!pendingAgents.length) {
      toast('The selected agents are already active.', 'info');
      return;
    }
    const approved = await confirm({
      title: `Approve ${pendingAgents.length} agent${pendingAgents.length === 1 ? '' : 's'}?`,
      message: 'The selected pending accounts will become active and can access the system.',
      confirmLabel: 'Approve agents',
      tone: 'info',
    });
    if (!approved) return;
    try {
      setBulkSaving(true);
      await Promise.all(pendingAgents.map((agent) => agentApi.update(agent.id, { status: 'Active' })));
      setAgents(await agentApi.list());
      setSelected([]);
      toast(`${pendingAgents.length} agent${pendingAgents.length === 1 ? '' : 's'} approved.`, 'success');
    } catch (error) {
      toast(error.message, 'error');
    } finally {
      setBulkSaving(false);
    }
  };

  return (
    <div className="rounded-[30px] bg-white p-5 shadow-sm sm:p-8">
      <div className="mb-6"><PremiumPageHeader eyebrow="People Management" title="Agents" description={isAdministrator ? 'Manage all agents' : 'Add agents for administrator approval'} actions={<button
          onClick={openAddForm}
          className="flex items-center gap-2"
        >
          <Plus size={18} />
          Add Agent
        </button>} /></div>

      <div className="mb-6 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            placeholder="Search agent..."
            value={filters.search}
            onChange={(event) => { updateFilter('search', event.target.value); setPage(1); }}
            className="w-full border rounded-xl py-3 pl-12 pr-4"
          />
        </div>

        <select value={filters.status} onChange={(event) => { updateFilter('status', event.target.value); setPage(1); }} className="h-12 rounded-xl border px-4">
        <option value="All">All Status</option>
        <option value="Active">Active</option>
        <option value="For Approval">For Approval</option>
        {isAdministrator && <option value="With Ayuda Loan">With Ayuda Loan</option>}
        {isAdministrator && <option value="No Ayuda Loan">No Ayuda Loan</option>}
        </select>
        {(filters.search || filters.status !== 'All') && <button onClick={() => { resetFilters(); setPage(1); }} className="flex h-12 items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 text-sm font-bold text-slate-600 hover:bg-slate-50"><FilterX size={17} /> Clear</button>}
      </div>
      <p className="mt-3 text-xs text-slate-400">Your search, status, and rows-per-page settings are saved on this device.</p>
      </div>

      {isAdministrator && selected.length > 0 && <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-blue-200 bg-blue-50 p-4 sm:flex-row sm:items-center sm:justify-between"><p className="font-bold text-blue-900">{selected.length} agent{selected.length === 1 ? '' : 's'} selected</p><div className="flex gap-2"><button onClick={() => setSelected([])} className="rounded-xl px-4 py-2 text-sm font-bold text-blue-700 hover:bg-blue-100">Clear selection</button><button disabled={bulkSaving} onClick={bulkApprove} className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-60"><CheckCircle2 size={16} /> {bulkSaving ? 'Approving...' : 'Approve selected'}</button></div></div>}

      <div className="overflow-hidden rounded-2xl border border-slate-100">
        <div className="responsive-table-wrap">
        <table className="w-full min-w-[900px]">
          <thead>
            <tr className="border-b">
              {isAdministrator && <th className="p-4 text-left"><input type="checkbox" aria-label="Select all agents on this page" checked={allVisibleSelected} onChange={toggleVisible} className="h-4 w-4 rounded border-slate-300" /></th>}
              <th className="text-left py-4">HLC Code</th>
              <th className="text-left py-4">Role</th>
              <th className="text-left py-4">Full Name</th>
              <th className="text-left py-4">Team</th>
              <th className="text-left py-4">Login Email</th>
              <th className="text-left py-4">Status</th>
            </tr>
          </thead>

          <tbody>
            {loading && <TableSkeleton columns={isAdministrator ? 7 : 6} rows={5} />}
            {!loading && filteredAgents.length === 0 && <tr><td colSpan="7"><EmptyState title={filters.search || filters.status !== 'All' ? 'No matching agents' : 'No agents yet'} description={filters.search || filters.status !== 'All' ? 'Try a different name, email, team, or clear the active filters.' : 'Add the first agent to begin building your sales directory.'} action={(filters.search || filters.status !== 'All') ? <button onClick={resetFilters} className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white">Clear filters</button> : <button onClick={openAddForm} className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white">Add Agent</button>} /></td></tr>}
            {!loading && visibleAgents.map((agent) => (
              <tr
  key={agent.id}
  onClick={() => { if (isAdministrator) navigate(`/agents/${agent.id}`) }}
  className={`border-b hover:bg-gray-50 ${isAdministrator ? 'cursor-pointer' : ''}`}
>
                {isAdministrator && <td className="p-4" onClick={(event) => event.stopPropagation()}><input type="checkbox" aria-label={`Select ${agent.firstName} ${agent.lastName}`} checked={selected.includes(String(agent.id))} onChange={() => setSelected((current) => current.includes(String(agent.id)) ? current.filter((id) => id !== String(agent.id)) : [...current, String(agent.id)])} className="h-4 w-4 rounded border-slate-300" /></td>}
                <td className="py-5">
  {agent.hlcCode}
</td>

<td>
  {agent.role || '-'}
</td>

<td>
  {agent.firstName} {agent.lastName}
</td>
                <td>{agent.team}</td>
                <td>{agent.zonalEmail}</td>

                <td>
                  <span
                    className={`px-3 py-1 rounded-full text-sm ${
                      agent.status === 'Active'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}
                  >
                    {agent.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
        {!loading && <Pagination page={safePage} pageSize={filters.pageSize} total={filteredAgents.length} onPageChange={setPage} onPageSizeChange={(size) => { updateFilter('pageSize', size); setPage(1); }} />}
      </div>

      {createdCredentials && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl bg-white p-7 shadow-2xl">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600"><CheckCircle2 size={24} /></div>
            <h2 className="mt-5 text-2xl font-black text-slate-900">Agent account created</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">Copy and send these credentials securely to {createdCredentials.fullName || 'the agent'}. The password is shown only for this admin session.</p>
            <div className="mt-6 space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <CredentialRow label="Login Email" value={createdCredentials.email} />
              <CredentialRow label="Temporary Password" value={createdCredentials.temporaryPassword} monospace />
            </div>
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button onClick={() => setCreatedCredentials(null)} className="rounded-xl border border-slate-200 px-5 py-3 font-bold text-slate-700">Done</button>
              <button onClick={async () => { await navigator.clipboard.writeText(`Zonal Realty Login\nEmail: ${createdCredentials.email}\nTemporary Password: ${createdCredentials.temporaryPassword}`); toast('Login credentials copied.', 'success'); }} className="rounded-xl bg-blue-600 px-5 py-3 font-bold text-white">Copy Credentials</button>
              <button onClick={() => navigate(`/agents/${createdCredentials.agentId}`)} className="rounded-xl bg-[#0d1b4c] px-5 py-3 font-bold text-white">View Agent</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CredentialRow({ label, value, monospace = false }) {
  return <div><p className="text-xs font-black uppercase tracking-wide text-slate-400">{label}</p><p className={`mt-1 break-all text-base font-bold text-slate-900 ${monospace ? 'font-mono' : ''}`}>{value}</p></div>;
}

function Label({ children }) {
  return (
    <label className="block mb-2 text-sm font-semibold text-gray-600">
      {children}
    </label>
  );
}

const fieldClassName =
  '[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none h-12 w-full border border-gray-200 rounded-xl px-4 text-sm outline-none transition focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/10 disabled:bg-gray-50 read-only:bg-gray-50';

function Field({ label, className = '', children }) {
  return (
    <div className={className}>
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function TextField({
  label,
  className,
  type = 'text',
  ...props
}) {
  return (
    <Field label={label} className={className}>
      <input
        type={type}
        className={fieldClassName}
        placeholder={label}
        {...props}
      />
    </Field>
  );
}

function SelectField({
  label,
  options,
  className,
  helperText,
  ...props
}) {
  return (
    <Field label={label} className={className}>
      <select
        className={fieldClassName}
        {...props}
      >
        <option value="">Select {label}</option>
        {options.map((option) => (
          <option key={typeof option === 'string' ? option : option.value} value={typeof option === 'string' ? option : option.value}>
            {typeof option === 'string' ? option : option.label}
          </option>
        ))}
      </select>
      {helperText && <p className="mt-1 text-xs leading-5 text-slate-500">{helperText}</p>}
    </Field>
  );
}

export default Agents;

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(',')[1] || '');
    reader.onerror = () => reject(new Error('Could not read the profile photo.'));
    reader.readAsDataURL(file);
  });
}

import { useEffect, useState } from 'react'
import { ArrowLeft, Pencil, Plus, Search, X } from 'lucide-react'

import { agentApi, teamApi } from '../lib/api'
import { EmptyState, Pagination, TableSkeleton } from '../components/ui/DataStates'
import { useFeedback } from '../components/ui/feedbackContext'
import { useSavedFilters } from '../hooks/useSavedFilters'
import { useUnsavedChanges } from '../hooks/useUnsavedChanges'
import PremiumPageHeader from '../components/dashboard/PremiumPageHeader'

const emptyForm = { teamName: '', evpAgentId: '', establishedDate: '', status: 'Active', subteams: [] }

export default function Teams() {
  const canManage = localStorage.getItem('role') === 'Administrator'
  const { toast, confirm } = useFeedback()
  const { filters, updateFilter } = useSavedFilters('teams', { search: '', status: 'Active', pageSize: 10 })
  const [teams, setTeams] = useState([])
  const [evps, setEvps] = useState([])
  const [salesDirectors, setSalesDirectors] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [isDirty, setIsDirty] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [details, setDetails] = useState(null)
  const [detailsLoading, setDetailsLoading] = useState(false)
  useUnsavedChanges(showForm && isDirty)

  const loadTeams = async () => {
    try { setTeams(await teamApi.list()) }
    catch (error) { toast(error.message, 'error') }
    finally { setLoading(false) }
  }

  useEffect(() => {
    let active = true
    teamApi.list()
      .then((records) => { if (active) setTeams(records) })
      .catch((error) => { if (active) toast(error.message, 'error') })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [toast])
  useEffect(() => {
    if (!canManage) return
    agentApi.list().then((agents) => {
      setEvps(agents.filter((agent) => agent.role === 'EVP' && agent.status === 'Active'))
      setSalesDirectors(agents.filter((agent) => agent.role === 'Sales Director' && agent.status === 'Active'))
    }).catch((error) => toast(error.message, 'error'))
  }, [canManage, toast])

  const normalized = filters.search.trim().toLowerCase()
  const filtered = teams.filter((team) => (filters.status === 'All' || team.status === filters.status) && (!normalized || [team.teamName, team.evpName].some((value) => String(value || '').toLowerCase().includes(normalized))))
  const pageCount = Math.max(1, Math.ceil(filtered.length / filters.pageSize))
  const safePage = Math.min(page, pageCount)
  const visible = filtered.slice((safePage - 1) * filters.pageSize, safePage * filters.pageSize)

  const openAdd = () => { setForm(emptyForm); setEditingId(''); setIsDirty(false); setShowForm(true) }
  const openEdit = (team) => { setForm({ teamName: team.teamName, evpAgentId: String(team.evpAgentId || ''), establishedDate: team.establishedDate || '', status: team.status || 'Active', subteams: (team.subteams || []).map((item) => ({ subteamName: item.subteamName, sdAgentId: String(item.sdAgentId || '') })) }); setEditingId(String(team.id)); setIsDirty(false); setShowForm(true) }
  const closeForm = async () => {
    if (isDirty && !await confirm({ title: 'Discard team changes?', message: 'The team name and EVP assignment changes will be lost.', confirmLabel: 'Discard changes' })) return
    setShowForm(false); setIsDirty(false)
  }
  const saveTeam = async () => {
    if (!form.teamName.trim()) return toast('Team name is required.', 'error')
    try {
      setSaving(true)
      if (editingId) await teamApi.update(editingId, form); else await teamApi.create(form)
      toast(editingId ? 'Team updated successfully.' : 'Team created successfully.', 'success')
      setShowForm(false); setIsDirty(false); await loadTeams()
    } catch (error) { toast(error.message, 'error') }
    finally { setSaving(false) }
  }
  const deleteTeam = async () => {
    const teamName = form.teamName.trim() || 'this team'
    const approved = await confirm({
      title: `Delete ${teamName}?`,
      message: 'This will permanently delete the planet team and its sub-teams. Its agents will not be deleted, but their Team and Sub-team assignments will be cleared.',
      confirmLabel: 'Delete Team',
      tone: 'danger',
    })
    if (!approved) return
    try {
      setDeleting(true)
      await teamApi.remove(editingId)
      toast(`${teamName} was deleted. Its agents are now unassigned.`, 'success')
      setShowForm(false); setIsDirty(false); await loadTeams()
    } catch (error) { toast(error.message, 'error') }
    finally { setDeleting(false) }
  }
  const viewTeam = async (team) => {
    setDetails({ ...team, members: [] }); setDetailsLoading(true)
    try { setDetails({ ...team, ...await teamApi.get(team.id) }) }
    catch (error) { toast(error.message, 'error'); setDetails(null) }
    finally { setDetailsLoading(false) }
  }

  if (details) return <TeamSubteamDetails details={details} loading={detailsLoading} onClose={() => setDetails(null)} />

  return (
    <div className="rounded-[30px] bg-white p-5 shadow-sm sm:p-8">
      <div className="mb-6"><PremiumPageHeader eyebrow="Organization" title="Teams" description="Assign an EVP and monitor each team hierarchy." actions={canManage ? <button onClick={openAdd} className="flex items-center justify-center gap-2"><Plus size={18} /> Add Team</button> : null} /></div>

      <div className="mb-6 grid gap-3 rounded-2xl border border-slate-100 p-5 sm:grid-cols-[1fr_auto]">
        <label className="relative"><Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} /><input value={filters.search} onChange={(event) => { updateFilter('search', event.target.value); setPage(1) }} placeholder="Search team or EVP..." className="h-12 w-full rounded-xl border border-slate-200 pl-11 pr-4 outline-none focus:border-blue-500" /></label>
        <select value={filters.status} onChange={(event) => { updateFilter('status', event.target.value); setPage(1) }} className="h-12 rounded-xl border border-slate-200 bg-white px-4 font-semibold"><option value="All">All Status</option><option value="Active">Active</option><option value="Inactive">Inactive</option></select>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-100">
        <div className="responsive-table-wrap"><table className="w-full min-w-[760px]">
          <thead className="bg-slate-50 text-left text-xs font-bold uppercase tracking-wide text-slate-500"><tr><th className="p-5">Team Name</th><th className="p-5">EVP</th><th className="p-5 text-center">Total SD</th><th className="p-5 text-center">Total HLC</th><th className="p-5 text-center">Members</th><th className="p-5 text-right">Action</th></tr></thead>
          <tbody>
            {loading && <TableSkeleton columns={6} rows={5} />}
            {!loading && !filtered.length && <tr><td colSpan="6"><EmptyState title="No teams found" description={filters.search ? 'Try another team or EVP name.' : 'Create the first team and assign its EVP.'} action={canManage && !filters.search ? <button onClick={openAdd} className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white">Add Team</button> : null} /></td></tr>}
            {!loading && visible.map((team) => <tr key={team.id} className="border-t border-slate-100 hover:bg-slate-50"><td className="p-5 font-black text-slate-900">{team.teamName}</td><td className="p-5 font-medium text-slate-700">{team.evpName || <span className="text-amber-600">Unassigned</span>}</td><td className="p-5 text-center font-bold">{team.totalSd}</td><td className="p-5 text-center font-bold">{team.totalHlc}</td><td className="p-5 text-center font-bold">{team.totalMembers}</td><td className="p-5"><div className="flex justify-end gap-2"><button onClick={() => viewTeam(team)} className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-bold text-white">View</button>{canManage && <button onClick={() => openEdit(team)} aria-label={`Edit ${team.teamName}`} className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-100"><Pencil size={16} /></button>}</div></td></tr>)}
          </tbody>
        </table></div>
        {!loading && <Pagination page={safePage} pageSize={filters.pageSize} total={filtered.length} onPageChange={setPage} onPageSizeChange={(size) => { updateFilter('pageSize', size); setPage(1) }} />}
      </div>

      {showForm && <TeamForm form={form} setForm={setForm} editingId={editingId} evps={evps} salesDirectors={salesDirectors} saving={saving} deleting={deleting} closeForm={closeForm} saveTeam={saveTeam} deleteTeam={deleteTeam} setIsDirty={setIsDirty} />}

    </div>
  )
}

function Field({ label, children }) { return <label><span className="mb-2 block text-sm font-bold text-slate-600">{label}</span>{children}</label> }

function TeamForm({ form, setForm, editingId, evps, salesDirectors, saving, deleting, closeForm, saveTeam, deleteTeam, setIsDirty }) {
  const update = (field, value) => { setForm((current) => ({ ...current, [field]: value })); setIsDirty(true) }
  const updateSubteam = (index, field, value) => update('subteams', form.subteams.map((item, itemIndex) => itemIndex === index ? { ...item, [field]: value } : item))
  return <div className="fixed inset-0 z-[80] overflow-y-auto bg-slate-950/60 p-4 backdrop-blur-sm"><div className="mx-auto my-8 w-full max-w-2xl rounded-3xl bg-white p-7 shadow-2xl">
    <div className="flex items-start justify-between"><div><h2 className="text-2xl font-black">{editingId ? 'Edit Team' : 'Add Team'}</h2><p className="mt-1 text-sm text-slate-500">Set the EVP, founding date, and sub-teams with their Sales Directors.</p></div><button onClick={closeForm} className="rounded-xl bg-slate-100 p-2"><X size={20} /></button></div>
    <div className="mt-7 grid gap-5 sm:grid-cols-2">
      <Field label="Team Name"><input value={form.teamName} onChange={(event) => update('teamName', event.target.value.toUpperCase())} placeholder="e.g. EARTH" className="h-12 w-full rounded-xl border border-slate-200 px-4 font-bold uppercase" /></Field>
      <Field label="Date Established"><input type="date" value={form.establishedDate} onChange={(event) => update('establishedDate', event.target.value)} className="h-12 w-full rounded-xl border border-slate-200 px-4" /></Field>
      <Field label="Assigned EVP (Optional)"><select value={form.evpAgentId} onChange={(event) => update('evpAgentId', event.target.value)} className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4"><option value="">No EVP assigned yet</option>{evps.map((agent) => <option key={agent.id} value={agent.id}>{agent.firstName} {agent.lastName}</option>)}</select></Field>
      <Field label="Status"><select value={form.status} onChange={(event) => update('status', event.target.value)} className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4"><option>Active</option><option>Inactive</option></select></Field>
    </div>
    <div className="mt-7"><div className="flex items-center justify-between"><div><h3 className="font-black text-slate-800">Sub-teams</h3><p className="text-xs text-slate-400">Groups under this team and their assigned SD.</p></div><button onClick={() => update('subteams', [...form.subteams, { subteamName: '', sdAgentId: '' }])} className="rounded-lg bg-blue-50 px-3 py-2 text-xs font-bold text-blue-700"><Plus size={14} className="mr-1 inline" /> Add Sub-team</button></div>
      <div className="mt-3 max-h-[420px] space-y-3 overflow-y-auto overscroll-contain pr-1">{!form.subteams.length && <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-400">No sub-teams added yet.</p>}{form.subteams.map((item, index) => <div key={index} className="grid gap-3 rounded-xl border border-slate-100 p-3 sm:grid-cols-[1fr_1fr_auto]"><input value={item.subteamName} onChange={(event) => updateSubteam(index, 'subteamName', event.target.value.toUpperCase())} placeholder="Sub-team name" className="h-11 rounded-lg border border-slate-200 px-3 font-bold uppercase" /><select value={item.sdAgentId} onChange={(event) => updateSubteam(index, 'sdAgentId', event.target.value)} className="h-11 rounded-lg border border-slate-200 bg-white px-3"><option value="">No SD assigned</option>{salesDirectors.map((agent) => <option key={agent.id} value={agent.id}>{agent.firstName} {agent.lastName}</option>)}</select><button aria-label="Remove sub-team" onClick={() => update('subteams', form.subteams.filter((_, itemIndex) => itemIndex !== index))} className="rounded-lg bg-red-50 p-3 text-red-600"><X size={17} /></button></div>)}</div>
    </div>
    <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">{editingId ? <button disabled={saving || deleting} onClick={deleteTeam} className="rounded-xl border border-red-200 bg-red-50 px-5 py-3 font-bold text-red-600 transition hover:bg-red-100 disabled:opacity-60">{deleting ? 'Deleting...' : 'Delete Team'}</button> : <span />}<div className="flex justify-end gap-3"><button disabled={deleting} onClick={closeForm} className="rounded-xl bg-slate-100 px-5 py-3 font-bold disabled:opacity-60">Cancel</button><button disabled={saving || deleting} onClick={saveTeam} className="rounded-xl bg-blue-600 px-6 py-3 font-bold text-white disabled:opacity-60">{saving ? 'Saving...' : editingId ? 'Save Changes' : 'Create Team'}</button></div></div>
  </div></div>
}

// eslint-disable-next-line no-unused-vars -- retained temporarily while the new drill-down view replaces this layout
function TeamDetails({ details, loading, onClose }) {
  return <div className="fixed inset-0 z-[80] overflow-y-auto bg-slate-950/60 p-4 backdrop-blur-sm"><div className="mx-auto my-8 max-w-5xl rounded-3xl bg-white p-7 shadow-2xl">
    <div className="flex items-start justify-between"><div><p className="text-xs font-black uppercase tracking-widest text-blue-600">Team</p><h2 className="mt-1 text-3xl font-black">{details.teamName}</h2><div className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-sm text-slate-500"><p>EVP: <strong className="text-slate-700">{details.evpName || 'Unassigned'}</strong></p><p>Date established: <strong className="text-slate-700">{details.establishedDate ? new Date(`${details.establishedDate}T00:00:00`).toLocaleDateString() : 'Not set'}</strong></p></div></div><button onClick={onClose} className="rounded-xl bg-slate-100 p-2"><X size={20} /></button></div>
    {loading ? <div className="py-16 text-center text-slate-500">Loading team details...</div> : <>
      <section className="mt-7"><div className="mb-3"><p className="text-xs font-black uppercase tracking-widest text-blue-600">Sub-teams</p><h3 className="mt-1 text-xl font-black text-slate-900">Groups under {details.teamName}</h3></div>
        {details.subteams?.length ? <div className="grid gap-4 md:grid-cols-2">{details.subteams.map((subteam) => { const members = (details.members || []).filter((member) => member.subTeam === subteam.subteamName); return <div key={subteam.id} className="rounded-2xl border border-blue-100 bg-blue-50/40 p-5"><div className="flex items-start justify-between gap-3"><div><h4 className="text-lg font-black text-slate-900">{subteam.subteamName}</h4><p className="mt-1 text-sm text-slate-500">Sales Director: <strong className="text-slate-700">{subteam.sdName || 'Unassigned'}</strong></p></div><span className="rounded-full bg-white px-3 py-1 text-xs font-black text-blue-700 shadow-sm">{members.length} member{members.length === 1 ? '' : 's'}</span></div>{members.length > 0 && <div className="mt-4 space-y-2 border-t border-blue-100 pt-3">{members.map((member) => <div key={member.id} className="flex items-center justify-between gap-3 text-sm"><span className="font-semibold text-slate-700">{member.firstName} {member.lastName}</span><span className="text-xs text-slate-500">{member.role || 'Agent'}</span></div>)}</div>}</div> })}</div> : <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center"><p className="font-bold text-slate-600">Wala pang sub-team sa {details.teamName}.</p><p className="mt-1 text-sm text-slate-400">I-click ang Edit Team (pencil icon), then “Add Sub-team” para maglagay.</p></div>}
      </section>
      <section className="mt-8"><h3 className="text-lg font-black text-slate-900">All team members</h3>{details.members?.length ? <div className="responsive-table-wrap mt-3"><table className="w-full min-w-[650px]"><thead className="bg-slate-50 text-left text-xs uppercase text-slate-500"><tr><th className="p-4">HLC Code</th><th className="p-4">Name</th><th className="p-4">Role</th><th className="p-4">Email</th><th className="p-4">Status</th></tr></thead><tbody>{details.members.map((member) => <tr key={member.id} className="border-t"><td className="p-4 font-bold">{member.hlcCode || '-'}</td><td className="p-4">{member.firstName} {member.lastName}</td><td className="p-4">{member.role || '-'}</td><td className="p-4">{member.zonalEmail}</td><td className="p-4">{member.status}</td></tr>)}</tbody></table></div> : <EmptyState title="No members assigned" description="Assign agents to this team from their agent profile." />}</section>
    </>}
  </div></div>
}

function TeamSubteamDetails({ details, loading, onClose }) {
  const [selectedSubteam, setSelectedSubteam] = useState(null)
  const [subteamPage, setSubteamPage] = useState(1)
  const subteamPageSize = 10
  const subteams = details.subteams || []
  const subteamPageCount = Math.max(1, Math.ceil(subteams.length / subteamPageSize))
  const safeSubteamPage = Math.min(subteamPage, subteamPageCount)
  const visibleSubteams = subteams.slice((safeSubteamPage - 1) * subteamPageSize, safeSubteamPage * subteamPageSize)
  const weekStart = startOfCurrentWeek()
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekEnd.getDate() + 7)
  const membersFor = (subteam) => (details.members || []).filter((member) => member.subTeam === subteam.subteamName)
  const selectedMembers = selectedSubteam ? membersFor(selectedSubteam) : []
  const assignedMembers = (details.members || []).filter((member) => member.subTeam)
  const weeklyRecruits = assignedMembers.filter((member) => { const created = new Date(member.createdAt); return created >= weekStart && created < weekEnd }).length

  if (selectedSubteam) return <div className="rounded-[30px] bg-white p-5 shadow-sm sm:p-8"><button onClick={() => setSelectedSubteam(null)} className="mb-7 flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-3 text-sm font-bold text-slate-700"><ArrowLeft size={18} /> Back to {details.teamName} sub-teams</button><div><p className="text-xs font-black uppercase tracking-widest text-blue-600">Sub-team under {details.teamName}</p><h2 className="mt-1 text-3xl font-black text-slate-900">{selectedSubteam.subteamName}</h2><p className="mt-2 text-sm text-slate-500">Sales Director: <strong className="text-slate-700">{selectedSubteam.sdName || 'Unassigned'}</strong> · {selectedMembers.length} member{selectedMembers.length === 1 ? '' : 's'}</p></div>{selectedMembers.length ? <div className="responsive-table-wrap mt-7 overflow-hidden rounded-2xl border border-slate-100"><table className="w-full min-w-[650px]"><thead className="bg-slate-50 text-left text-xs uppercase text-slate-500"><tr><th className="p-4">HLC Code</th><th className="p-4">Agent Name</th><th className="p-4">Role</th><th className="p-4">Date Added</th><th className="p-4">Status</th></tr></thead><tbody>{selectedMembers.map((member) => <tr key={member.id} className="border-t"><td className="p-4 font-bold">{member.hlcCode || '-'}</td><td className="p-4 font-semibold">{member.firstName} {member.lastName}</td><td className="p-4">{member.role || '-'}</td><td className="p-4">{member.createdAt ? new Date(member.createdAt).toLocaleDateString() : '-'}</td><td className="p-4">{member.status}</td></tr>)}</tbody></table></div> : <EmptyState title="No agents under this sub-team" description="New agents assigned to this sub-team will appear here." />}</div>

  return <div className="rounded-[30px] bg-white p-5 shadow-sm sm:p-8">
    <button onClick={onClose} className="mb-5 flex items-center gap-2 text-sm font-bold text-slate-500 transition hover:text-blue-600"><span className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white shadow-sm"><ArrowLeft size={17} /></span> Back to Teams</button>
    <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-[#0d1b4c] via-[#122968] to-[#1f52d6] p-6 text-white shadow-lg shadow-blue-950/10 sm:p-8"><div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between"><div><div className="mb-3 inline-flex rounded-full bg-white/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.2em] text-blue-100">Planet Team</div><h2 className="text-4xl font-black tracking-tight sm:text-5xl">{details.teamName}</h2><div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-blue-100"><p>EVP <strong className="ml-1 text-white">{details.evpName || 'Unassigned'}</strong></p><span className="hidden text-white/30 sm:inline">•</span><p>Established <strong className="ml-1 text-white">{details.establishedDate ? new Date(`${details.establishedDate}T00:00:00`).toLocaleDateString() : 'Not set'}</strong></p></div></div><div className="grid grid-cols-3 gap-2 sm:gap-3"><SummaryStat value={details.subteams?.length || 0} label="Sub-teams" /><SummaryStat value={assignedMembers.length} label="Members" /><SummaryStat value={weeklyRecruits} label="New this week" accent /></div></div></div>
    {loading ? <div className="py-16 text-center text-slate-500">Loading team details...</div> : <section className="mt-8"><div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-black uppercase tracking-[0.16em] text-blue-600">Team hierarchy</p><h3 className="mt-1 text-2xl font-black text-slate-900">Groups under {details.teamName}</h3></div><p className="max-w-md text-sm leading-6 text-slate-400 sm:text-right">Weekly recruits are counted Monday–Sunday and reset every Monday.</p></div>
      {subteams.length ? <div className="overflow-hidden rounded-2xl border border-slate-100"><div className="responsive-table-wrap"><table className="w-full min-w-[720px]"><thead className="bg-slate-50 text-left text-xs font-bold uppercase tracking-wide text-slate-500"><tr><th className="p-5">Sub-team Name</th><th className="p-5">Sales Director</th><th className="p-5 text-center">Members</th><th className="p-5 text-center">New Recruits This Week</th><th className="p-5 text-right">Action</th></tr></thead><tbody>{visibleSubteams.map((subteam) => { const members = membersFor(subteam); const newRecruits = members.filter((member) => { const created = new Date(member.createdAt); return created >= weekStart && created < weekEnd }).length; return <tr key={subteam.id} className="border-t border-slate-100 hover:bg-slate-50"><td className="p-5 font-black text-slate-900">{subteam.subteamName}</td><td className="p-5 font-medium text-slate-700">{subteam.sdName || <span className="text-amber-600">Unassigned</span>}</td><td className="p-5 text-center font-black">{members.length}</td><td className="p-5 text-center"><span className={`inline-flex min-w-9 justify-center rounded-full px-3 py-1 text-sm font-black ${newRecruits ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>{newRecruits}</span></td><td className="p-5 text-right"><button onClick={() => setSelectedSubteam(subteam)} className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-bold text-white">View</button></td></tr> })}</tbody></table></div><Pagination page={safeSubteamPage} pageSize={subteamPageSize} total={subteams.length} onPageChange={setSubteamPage} /></div> : <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center"><p className="font-bold text-slate-600">Wala pang sub-team sa {details.teamName}.</p><p className="mt-1 text-sm text-slate-400">I-click ang Edit Team (pencil icon), then Add Sub-team para maglagay.</p></div>}
    </section>}
    {selectedSubteam && <div className="fixed inset-0 z-[90] overflow-y-auto bg-slate-950/60 p-4 backdrop-blur-sm"><div className="mx-auto my-12 max-w-4xl rounded-3xl bg-white p-7 shadow-2xl"><div className="flex items-start justify-between"><div><p className="text-xs font-black uppercase tracking-widest text-blue-600">Sub-team under {details.teamName}</p><h3 className="mt-1 text-3xl font-black text-slate-900">{selectedSubteam.subteamName}</h3><p className="mt-2 text-sm text-slate-500">Sales Director: <strong className="text-slate-700">{selectedSubteam.sdName || 'Unassigned'}</strong> · {selectedMembers.length} member{selectedMembers.length === 1 ? '' : 's'}</p></div><button onClick={() => setSelectedSubteam(null)} className="rounded-xl bg-slate-100 p-2"><X size={20} /></button></div>{selectedMembers.length ? <div className="responsive-table-wrap mt-7"><table className="w-full min-w-[650px]"><thead className="bg-slate-50 text-left text-xs uppercase text-slate-500"><tr><th className="p-4">HLC Code</th><th className="p-4">Agent Name</th><th className="p-4">Role</th><th className="p-4">Date Added</th><th className="p-4">Status</th></tr></thead><tbody>{selectedMembers.map((member) => <tr key={member.id} className="border-t"><td className="p-4 font-bold">{member.hlcCode || '-'}</td><td className="p-4 font-semibold">{member.firstName} {member.lastName}</td><td className="p-4">{member.role || '-'}</td><td className="p-4">{member.createdAt ? new Date(member.createdAt).toLocaleDateString() : '-'}</td><td className="p-4">{member.status}</td></tr>)}</tbody></table></div> : <EmptyState title="No agents under this sub-team" description="New agents assigned to this sub-team will appear here." />}</div></div>}
  </div>
}

function SummaryStat({ value, label, accent = false }) {
  return <div className={`min-w-20 rounded-2xl border px-3 py-3 text-center backdrop-blur sm:min-w-28 sm:px-4 ${accent ? 'border-emerald-300/30 bg-emerald-400/15' : 'border-white/10 bg-white/10'}`}><p className={`text-2xl font-black ${accent ? 'text-emerald-300' : 'text-white'}`}>{value}</p><p className="mt-0.5 text-[10px] font-bold uppercase tracking-wide text-blue-100 sm:text-xs">{label}</p></div>
}

function startOfCurrentWeek() {
  const start = new Date()
  start.setHours(0, 0, 0, 0)
  const day = start.getDay()
  start.setDate(start.getDate() - (day === 0 ? 6 : day - 1))
  return start
}

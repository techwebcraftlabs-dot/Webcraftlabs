import { useEffect, useState } from "react";

import { agentApi, developerApi } from "../lib/api";
import { useFeedback } from "../components/ui/feedbackContext";
import { useUnsavedChanges } from "../hooks/useUnsavedChanges";
import { EmptyState, Pagination, TableSkeleton } from "../components/ui/DataStates";
import { useSavedFilters } from "../hooks/useSavedFilters";
import PremiumPageHeader from "../components/dashboard/PremiumPageHeader";

function Developers() {
  const { confirm } = useFeedback();
  const { filters, updateFilter, resetFilters } = useSavedFilters("developers", { search: "", status: "All", pageSize: 10 });
  const [developers, setDevelopers] =
    useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [salesDirectors, setSalesDirectors] = useState([]);

  const [showForm, setShowForm] =
    useState(false);

  const [editingId, setEditingId] =
    useState(null);
  const [isDirty, setIsDirty] = useState(false);
  useUnsavedChanges(showForm && isDirty);

  const [formData, setFormData] =
    useState({
      developerName: "",
      project: "",
      lts: "",
      developerRate: "",
      assignedLsd: "",
      projectLocation: "",
      status: "Active",
      notes: "",
    });

  const normalizedSearch = filters.search.trim().toLowerCase();
  const filteredDevelopers = developers.filter((developer) =>
    (filters.status === "All" || developer.status === filters.status) &&
    [
      developer.developerName,
      developer.project,
      developer.lts,
      developer.developerRate,
      developer.assignedLsd,
      developer.projectLocation,
      developer.status,
    ].some((value) =>
      String(value || "").toLowerCase().includes(normalizedSearch)
    )
  );

  useEffect(() => {
    const loadDevelopers = async () => {
      try {
        setDevelopers(await developerApi.list());
      } catch (error) {
        console.error(error);
        alert(error.message);
      } finally {
        setLoading(false);
      }
    };

    loadDevelopers();
  }, []);
  const pageCount = Math.max(1, Math.ceil(filteredDevelopers.length / filters.pageSize));
  const safePage = Math.min(page, pageCount);
  const visibleDevelopers = filteredDevelopers.slice((safePage - 1) * filters.pageSize, safePage * filters.pageSize);

  useEffect(() => {
    const loadSalesDirectors = async () => {
      try {
        const agents = await agentApi.list();
        setSalesDirectors(
          agents.filter(
            (agent) =>
              agent.role === "Sales Director" && agent.status === "Active"
          )
        );
      } catch (error) {
        console.error(error);
        alert(error.message);
      }
    };

    loadSalesDirectors();
  }, []);

  const resetForm = () => {
    setFormData({
      developerName: "",
      project: "",
      lts: "",
      developerRate: "",
      assignedLsd: "",
      projectLocation: "",
      status: "Active",
      notes: "",
    });

    setEditingId(null);
    setIsDirty(false);
  };

  const openAddForm = () => {
    resetForm();
    setShowForm(true);
  };

  const openEditForm = (developer) => {
    setFormData({
      developerName:
        developer.developerName || "",
      project:
        developer.project || "",
      lts:
        developer.lts || "",
      developerRate:
        developer.developerRate || "",
      assignedLsd:
        developer.assignedLsd || "",
      projectLocation:
        developer.projectLocation || "",
      status:
        developer.status || "Active",
      notes:
        developer.notes || "",
    });

    setEditingId(developer.id);
    setIsDirty(false);
    setShowForm(true);
  };

  const handleChange = (e) => {
    setIsDirty(true);
    setFormData({
      ...formData,
      [e.target.name]:
        e.target.value,
    });
  };

  const handleSave = async () => {
    try {
      if (
        !formData.developerName ||
        !formData.project
      ) {
        alert(
          "Developer and Project are required."
        );
        return;
      }

      if (editingId) {
        await developerApi.update(
          editingId,
          {
            ...formData,
            developerRate: parseDeveloperRate(formData.developerRate),
          }
        );

        alert(
          "Developer updated successfully."
        );
      } else {
        await developerApi.create({
            ...formData,

            developerRate: parseDeveloperRate(formData.developerRate),
        });

        alert(
          "Developer added successfully."
        );
      }

      setShowForm(false);
      resetForm();
      setDevelopers(await developerApi.list());

    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  };

  const handleDelete = async (
    id
  ) => {
    const confirmed = await confirm({
      title: "Delete developer project?",
      message: "This removes the project from the developer directory. This action cannot be undone.",
      confirmLabel: "Delete project",
    });

    if (!confirmed) return;

    try {
      await developerApi.delete(id);

      alert(
        "Developer deleted."
      );
      setDevelopers(await developerApi.list());

    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  };

  return (
    <div className="bg-white rounded-[30px] p-8 shadow-sm">

      <div className="mb-6"><PremiumPageHeader eyebrow="Project Directory" title="Developers" description="Manage developer projects" actions={<button
          onClick={openAddForm}
        >
          Add Developer
        </button>} /></div>

      <div className="mb-6 grid gap-3 rounded-2xl border border-slate-100 p-5 sm:grid-cols-[1fr_auto_auto]">
        <input
          type="search"
          value={filters.search}
          onChange={(event) => { updateFilter("search", event.target.value); setPage(1); }}
          placeholder="Search developer, project, LTS, LSD, location or status..."
          aria-label="Search developers"
          className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-[#2563eb] focus:ring-2 focus:ring-blue-100"
        />
        <select value={filters.status} onChange={(event) => { updateFilter("status", event.target.value); setPage(1); }} className="h-12 rounded-xl border border-gray-300 bg-white px-4 font-semibold"><option value="All">All Status</option><option value="Active">Active</option><option value="Inactive">Inactive</option></select>
        {(filters.search || filters.status !== "All") && <button onClick={() => { resetFilters(); setPage(1); }} className="h-12 rounded-xl border border-slate-200 px-4 text-sm font-bold text-slate-600">Clear</button>}
        <p className="text-xs text-slate-400 sm:col-span-3">Filters and rows-per-page are saved on this device.</p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-100">
      <div className="responsive-table-wrap">

        <table className="w-full min-w-[820px]">

          <thead>
            <tr className="border-b">
              <th className="text-left py-4">
                Developer
              </th>

              <th className="text-left py-4">
                Project
              </th>

              <th className="text-left py-4">
                LTS
              </th>

              <th className="text-left py-4">
                Rate
              </th>

              <th className="text-left py-4">
                LSD
              </th>

              <th className="text-left py-4">
                Status
              </th>

              <th className="text-left py-4">
                Action
              </th>
            </tr>
          </thead>

          <tbody>

            {loading && <TableSkeleton columns={7} rows={5} />}

            {!loading && visibleDevelopers.map(
              (developer) => (
                <tr
                  key={
                    developer.id
                  }
                  className="
                    border-b
                    hover:bg-gray-50
                  "
                >
                  <td className="py-5">
                    {
                      developer.developerName
                    }
                  </td>

                  <td>
                    {
                      developer.project
                    }
                  </td>

                  <td>
                    {
                      developer.lts
                    }
                  </td>

                  <td>
                    {
                      developer.developerRate
                    }%
                  </td>

                  <td>
                    {
                      developer.assignedLsd
                    }
                  </td>

                  <td>

                    <span
                      className={`
                        px-3
                        py-1
                        rounded-full
                        text-sm

                        ${
                          developer.status ===
                          "Active"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }
                      `}
                    >
                      {
                        developer.status
                      }
                    </span>

                  </td>

                  <td>

                    <div className="flex gap-2">

                      <button
                        onClick={() =>
                          openEditForm(
                            developer
                          )
                        }
                        className="
                          px-3
                          py-1
                          rounded-lg
                          bg-blue-600
                          text-white
                        "
                      >
                        View
                      </button>

                      <button
                        onClick={() =>
                          handleDelete(
                            developer.id
                          )
                        }
                        className="
                          px-3
                          py-1
                          rounded-lg
                          bg-red-600
                          text-white
                        "
                      >
                        Delete
                      </button>

                    </div>

                  </td>
                </tr>
              )
            )}

            {!loading && filteredDevelopers.length === 0 && <tr><td colSpan="7"><EmptyState title={filters.search || filters.status !== "All" ? "No matching developer projects" : "No developer projects yet"} description={filters.search || filters.status !== "All" ? "Try another keyword or clear the filters." : "Add your first developer project to make it available in BRS records."} action={(filters.search || filters.status !== "All") ? <button onClick={resetFilters} className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white">Clear filters</button> : <button onClick={openAddForm} className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white">Add Developer</button>} /></td></tr>}

          </tbody>

        </table>
      </div>
      {!loading && <Pagination page={safePage} pageSize={filters.pageSize} total={filteredDevelopers.length} onPageChange={setPage} onPageSizeChange={(size) => { updateFilter("pageSize", size); setPage(1); }} />}
      </div>

      {showForm && (
        <div className="
          fixed
          inset-0
          bg-black/40
          flex
          items-center
          justify-center
          z-50
        ">

          <div className="
            bg-white
            w-full
            max-w-4xl
            rounded-3xl
            p-8
          ">

            <h2 className="text-2xl font-black mb-6">
              {editingId
                ? "Developer Details"
                : "Add Developer"}
            </h2>

            <div className="grid grid-cols-2 gap-5">

              <Input
                label="Developer Name"
                name="developerName"
                value={
                  formData.developerName
                }
                onChange={
                  handleChange
                }
              />

              <Input
                label="Project"
                name="project"
                value={
                  formData.project
                }
                onChange={
                  handleChange
                }
              />

              <Input
                label="LTS"
                name="lts"
                value={
                  formData.lts
                }
                onChange={
                  handleChange
                }
              />

              <Input
                label="Developer Rate (%)"
                name="developerRate"
                value={
                  formData.developerRate
                }
                onChange={
                  handleChange
                }
              />

              <div>
                <label className="block mb-2 text-sm font-semibold text-gray-600">
                  Assigned LSD
                </label>
                <select
                  name="assignedLsd"
                  value={formData.assignedLsd}
                  onChange={handleChange}
                  className="w-full border rounded-xl p-3 bg-white"
                >
                  <option value="">None</option>
                  {formData.assignedLsd &&
                    !salesDirectors.some((agent) =>
                      `${agent.firstName || ""} ${agent.lastName || ""}`.trim() ===
                      formData.assignedLsd
                    ) && (
                      <option value={formData.assignedLsd}>
                        {formData.assignedLsd} (Existing Assignment)
                      </option>
                    )}
                  {salesDirectors.map((agent) => {
                    const fullName = `${agent.firstName || ""} ${agent.lastName || ""}`.trim();
                    return (
                      <option key={agent.id} value={fullName}>
                        {fullName}
                      </option>
                    );
                  })}
                </select>
              </div>

              <Input
                label="Project Location"
                name="projectLocation"
                value={
                  formData.projectLocation
                }
                onChange={
                  handleChange
                }
              />

              <div>

                <label className="block mb-2 text-sm font-semibold">
                  Status
                </label>

                <select
                  name="status"
                  value={
                    formData.status
                  }
                  onChange={
                    handleChange
                  }
                  className="
                    w-full
                    border
                    rounded-xl
                    p-3
                  "
                >
                  <option>
                    Active
                  </option>

                  <option>
                    Inactive
                  </option>

                </select>

              </div>

              <div className="col-span-2">

                <label className="block mb-2 text-sm font-semibold">
                  Notes
                </label>

                <textarea
                  rows="4"
                  name="notes"
                  value={
                    formData.notes
                  }
                  onChange={
                    handleChange
                  }
                  className="
                    w-full
                    border
                    rounded-xl
                    p-3
                  "
                />

              </div>

            </div>

            <div className="flex justify-end gap-3 mt-8">

              <button
                onClick={async () => {
                  if (isDirty && !await confirm({ title: "Discard unsaved changes?", message: "The information entered in this form will be lost.", confirmLabel: "Discard changes" })) return;
                  setShowForm(false);
                  resetForm();
                }}
                className="developer-form-cancel
                  px-5
                  py-3
                  rounded-xl
                  bg-gray-200
                "
              >
                Cancel
              </button>

              <button
                onClick={
                  handleSave
                }
                className="
                  px-5
                  py-3
                  rounded-xl
                  bg-[#2563eb]
                  text-white
                "
              >
                {editingId
                  ? "Update"
                  : "Save"}
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}

function Input({
  label,
  name,
  value,
  onChange,
}) {
  return (
    <div>
      <label className="block mb-2 text-sm font-semibold text-gray-600">
        {label}
      </label>

      <input
        name={name}
        value={value}
        onChange={onChange}
        className="
          w-full
          border
          rounded-xl
          p-3
        "
      />
    </div>
  );
}

function parseDeveloperRate(value) {
  return Number(String(value || "").replace(/[%\s,]/g, "")) || 0;
}

export default Developers;

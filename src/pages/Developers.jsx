import { useEffect, useState } from "react";

import { developerApi } from "../lib/api";

function Developers() {
  const [developers, setDevelopers] =
    useState([]);

  const [showForm, setShowForm] =
    useState(false);

  const [editingId, setEditingId] =
    useState(null);

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

  useEffect(() => {
    const loadDevelopers = async () => {
      try {
        setDevelopers(await developerApi.list());
      } catch (error) {
        console.error(error);
        alert(error.message);
      }
    };

    loadDevelopers();
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
    setShowForm(true);
  };

  const handleChange = (e) => {
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
            developerRate:
              Number(
                formData.developerRate
              ) || 0,
          }
        );

        alert(
          "Developer updated successfully."
        );
      } else {
        await developerApi.create({
            ...formData,

            developerRate:
              Number(
                formData.developerRate
              ) || 0,
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
    const confirmed =
      window.confirm(
        "Delete this developer?"
      );

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

      <div className="flex items-center justify-between mb-8">

        <div>
          <h2 className="text-3xl font-black text-[#3b281f]">
            Developers
          </h2>

          <p className="text-gray-500">
            Manage developer projects
          </p>
        </div>

        <button
          onClick={openAddForm}
          className="
            px-5
            py-3
            rounded-xl
            bg-[#4f5dff]
            text-white
            font-semibold
          "
        >
          Add Developer
        </button>

      </div>

      <div className="overflow-auto">

        <table className="w-full">

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

            {developers.map(
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

          </tbody>

        </table>

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

              <Input
                label="Assigned LSD"
                name="assignedLsd"
                value={
                  formData.assignedLsd
                }
                onChange={
                  handleChange
                }
              />

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
                onClick={() =>
                  setShowForm(false)
                }
                className="
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
                  bg-[#4f5dff]
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

export default Developers;

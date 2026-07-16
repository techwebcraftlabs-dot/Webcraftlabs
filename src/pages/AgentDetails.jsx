import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import { agentApi } from "../lib/api";

function AgentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);

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
    address: "",
    birthDate: "",
    birthPlace: "",
    civilStatus: "",
    gender: "",
    recruiter: "",
    accreditedDate: "",
    locality: "",
    team: "",
    status: "For Approval",
  });

  useEffect(() => {
    const loadAgent = async () => {
      try {
        setFormData(await agentApi.get(id));
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
          <h2 className="text-3xl font-black text-[#3b281f]">
            Agent Details
          </h2>

          <p className="text-gray-500">
            View and update agent information
          </p>
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
          onChange={handleChange}
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

            <option value="Sales Director">
              Sales Director
            </option>

            <option value="EVP">
              EVP
            </option>
          </select>
        </div>

      </div>

      {/* ACCOUNT */}

      <h3 className="font-bold text-lg mb-5">
        Account Information
      </h3>

      <div className="grid grid-cols-3 gap-6">

        <Input
          label="Zonal Email"
          name="zonalEmail"
          value={formData.zonalEmail}
          onChange={handleChange}
        />

        <div>
          <Label>Password</Label>

          <input
            value={formData.password}
            readOnly
            className="
              w-full
              border
              rounded-xl
              p-3
              bg-gray-100
            "
          />
        </div>

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

      <div className="flex justify-end gap-4 mt-10">

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
            bg-[#4f5dff]
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
}) {
  return (
    <div>
      <Label>{label}</Label>

      <input
        type={type}
        name={name}
        value={value || ""}
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

export default AgentDetails;

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  ArrowLeft,
} from 'lucide-react';

import { agentApi } from '../lib/api';

const generateRandomPassword = () => {
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';

  let password = '';

  for (let i = 0; i < 12; i++) {
    password += chars.charAt(
      Math.floor(Math.random() * chars.length)
    );
  }

  return password;
};

const getInitialFormData = () => ({
  hlcCode: '',
  firstName: '',
  lastName: '',
  middleName: '',
  role: '',
  personalEmail: '',
  zonalEmail: '',
  password: generateRandomPassword(),
  mobileNumber: '',
  address: '',
  birthDate: '',
  birthPlace: '',
  civilStatus: '',
  gender: '',
  recruiter: '',
  accreditedDate: '',
  locality: '',
  team: '',
});

function Agents() {
  const navigate = useNavigate();

  const [showForm, setShowForm] = useState(false);
  const [status, setStatus] = useState('All');
  const [formData, setFormData] = useState(getInitialFormData);
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
useEffect(() => {
  const loadAgents = async () => {
    try {
      setAgents(await agentApi.list());
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  };

  loadAgents();
}, []);

  const handleChange = (e) => {
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

  setFormData(updated);
};

  const handleSave = async () => {
  try {

    await agentApi.create({
        hlcCode: formData.hlcCode,
        firstName: formData.firstName,
        lastName: formData.lastName,
        middleName: formData.middleName,
        role: formData.role,
        personalEmail: formData.personalEmail,
        zonalEmail: formData.zonalEmail,
        password: formData.password,
        mobileNumber: formData.mobileNumber,
        address: formData.address,
        birthDate: formData.birthDate,
        birthPlace: formData.birthPlace,
        civilStatus: formData.civilStatus,
        gender: formData.gender,
        recruiter: formData.recruiter,
        accreditedDate: formData.accreditedDate,
        locality: formData.locality,
        team: formData.team,
        status: 'For Approval',
    });

    alert('Agent Created');
    setAgents(await agentApi.list());
    setShowForm(false);

  } catch (error) {
    console.error(error);
    alert(error.message);
  }
};
  const openAddForm = () => {
  setFormData(getInitialFormData());

  setShowForm(true);
};

  if (showForm) {
    return (
      <div className="bg-white rounded-[30px] p-8 shadow-sm">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowForm(false)}
              className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center"
            >
              <ArrowLeft size={18} />
            </button>

            <div>
              <h2 className="text-3xl font-black text-[#3b281f]">
                Add Agent
              </h2>

              <p className="text-gray-500">
                Create new agent account
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-x-5 gap-y-6">

          <TextField
            label="HLC Code"
            name="hlcCode"
            value={formData.hlcCode}
            onChange={handleChange}
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
            options={["Team A", "Team B", "Team C"]}
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
            options={["Agent", "Sales Director", "EVP"]}
          />

          <TextField
            label="Auto Generated Password"
            value={formData.password}
            readOnly
            className="md:col-span-2"
          />
        </div>

        <div className="flex justify-end gap-4 mt-10">
          <button
            onClick={() => setShowForm(false)}
            className="px-6 py-3 rounded-xl bg-gray-200"
          >
            Cancel
          </button>

          <button
            className="px-6 py-3 rounded-xl bg-green-600 text-white"
          >
            Approve
          </button>

          <button
            onClick={handleSave}
            className="px-6 py-3 rounded-xl bg-[#4f5dff] text-white"
          >
            Save
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[30px] p-8 shadow-sm">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-black text-[#3b281f]">
            Agents
          </h2>

          <p className="text-gray-500">
            Manage all agents
          </p>
        </div>

        <button
          onClick={openAddForm}
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-[#4f5dff] text-white"
        >
          <Plus size={18} />
          Add Agent
        </button>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            placeholder="Search agent..."
            className="w-full border rounded-xl py-3 pl-12 pr-4"
          />
        </div>

        <select value={status} onChange={(e) => setStatus(e.target.value)} className="border rounded-xl px-4">
        <option value="All">All Status</option>
        <option value="Active">Active</option>
        <option value="For Approval">For Approval</option>
        </select>
      </div>

      <div className="overflow-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-4">HLC Code</th>
              <th className="text-left py-4">Role</th>
              <th className="text-left py-4">Full Name</th>
              <th className="text-left py-4">Team</th>
              <th className="text-left py-4">Login Email</th>
              <th className="text-left py-4">Status</th>
            </tr>
          </thead>

          <tbody>
            {agents?.filter((agent) => status === "All" || agent.status === status)
                   .map((agent) => (
              <tr
  key={agent.id}
  onClick={() => navigate(`/agents/${agent.id}`)}
  className="border-b cursor-pointer hover:bg-gray-50"
>
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

const fieldClassName =
  '[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none h-12 w-full border border-gray-200 rounded-xl px-4 text-sm outline-none transition focus:border-[#4f5dff] focus:ring-2 focus:ring-[#4f5dff]/10 disabled:bg-gray-50 read-only:bg-gray-50';

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
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </Field>
  );
}

export default Agents;

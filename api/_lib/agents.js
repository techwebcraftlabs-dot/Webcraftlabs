export const agentFields = [
  "hlcCode",
  "firstName",
  "lastName",
  "middleName",
  "role",
  "personalEmail",
  "zonalEmail",
  "password",
  "mobileNumber",
  "address",
  "birthDate",
  "birthPlace",
  "civilStatus",
  "gender",
  "recruiter",
  "accreditedDate",
  "locality",
  "team",
  "status",
];

export const agentSelect = `
  id,
  hlc_code AS hlcCode,
  first_name AS firstName,
  last_name AS lastName,
  middle_name AS middleName,
  role,
  personal_email AS personalEmail,
  zonal_email AS zonalEmail,
  password,
  mobile_number AS mobileNumber,
  address,
  DATE_FORMAT(birth_date, '%Y-%m-%d') AS birthDate,
  birth_place AS birthPlace,
  civil_status AS civilStatus,
  gender,
  recruiter,
  DATE_FORMAT(accredited_date, '%Y-%m-%d') AS accreditedDate,
  locality,
  team,
  status,
  created_at AS createdAt,
  updated_at AS updatedAt
`;

export const agentColumnMap = {
  hlcCode: "hlc_code",
  firstName: "first_name",
  lastName: "last_name",
  middleName: "middle_name",
  role: "role",
  personalEmail: "personal_email",
  zonalEmail: "zonal_email",
  password: "password",
  mobileNumber: "mobile_number",
  address: "address",
  birthDate: "birth_date",
  birthPlace: "birth_place",
  civilStatus: "civil_status",
  gender: "gender",
  recruiter: "recruiter",
  accreditedDate: "accredited_date",
  locality: "locality",
  team: "team",
  status: "status",
};

export function pickAgentPayload(body) {
  return Object.fromEntries(
    agentFields
      .filter((field) => Object.hasOwn(body, field))
      .map((field) => [field, body[field] || null])
  );
}

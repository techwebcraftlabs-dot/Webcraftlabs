export const agentFields = [
  "hlcCode",
  "firstName",
  "lastName",
  "middleName",
  "role",
  "personalEmail",
  "zonalEmail",
  "mobileNumber",
  "bdoAccountNumber",
  "facebookUrl",
  "address",
  "birthDate",
  "birthPlace",
  "civilStatus",
  "gender",
  "recruiter",
  "salesDirector",
  "evp",
  "accreditedDate",
  "locality",
  "team",
  "subTeam",
  "zonalTaxRate",
  "passOnVat",
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
  mobile_number AS mobileNumber,
  bdo_account_number AS bdoAccountNumber,
  facebook_url AS facebookUrl,
  address,
  DATE_FORMAT(birth_date, '%Y-%m-%d') AS birthDate,
  birth_place AS birthPlace,
  civil_status AS civilStatus,
  gender,
  recruiter,
  sales_director AS salesDirector,
  evp,
  DATE_FORMAT(accredited_date, '%Y-%m-%d') AS accreditedDate,
  locality,
  team,
  sub_team AS subTeam,
  zonal_tax_rate AS zonalTaxRate,
  pass_on_vat AS passOnVat,
  status,
  password_changed_at AS passwordChangedAt,
  password_reset_required AS passwordResetRequired,
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
  mobileNumber: "mobile_number",
  bdoAccountNumber: "bdo_account_number",
  facebookUrl: "facebook_url",
  address: "address",
  birthDate: "birth_date",
  birthPlace: "birth_place",
  civilStatus: "civil_status",
  gender: "gender",
  recruiter: "recruiter",
  salesDirector: "sales_director",
  evp: "evp",
  accreditedDate: "accredited_date",
  locality: "locality",
  team: "team",
  subTeam: "sub_team",
  zonalTaxRate: "zonal_tax_rate",
  passOnVat: "pass_on_vat",
  status: "status",
};

function parseBoolean(value) {
  return value === true || value === 1 || value === "1" || value === "true" || value === "yes" || value === "on";
}

export function pickAgentPayload(body) {
  return Object.fromEntries(
    agentFields
      .filter((field) => Object.hasOwn(body, field))
      .map((field) => [field, field === "passOnVat" ? parseBoolean(body[field]) : body[field] || null])
  );
}

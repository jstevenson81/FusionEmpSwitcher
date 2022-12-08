import { OracleRole } from './scimTypes'

const roles = new Map();
roles.set("Employee", ["Employee"]);
roles.set("Human Resource Manager", [
  "Human Resource Manager",
  "Human Resource Specialist",
]);

const getRoleTemplate = (templateName: string): OracleRole[] => {
  return roles.get(templateName);
};

export default getRoleTemplate;

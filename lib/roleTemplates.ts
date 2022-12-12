import { oracleRole } from './types/fusion/SCIM/oracleRole'

const roles = new Map();
roles.set('Employee', ['Employee']);
roles.set('Human Resource Manager', [
  'Human Resource Manager',
  'Human Resource Specialist',
]);

const getRoleTemplate = (templateName: string): oracleRole[] => {
  return roles.get(templateName);
};

export default getRoleTemplate;

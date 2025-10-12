/* eslint-disable no-unused-vars */
import React, { useEffect } from 'react';
import { Building } from 'lucide-react';

const employmentTypes = [
  { value: 'permanent', label: 'Permanent' },
  { value: 'contract', label: 'Contract' },
  { value: 'probation', label: 'Probation' },
  { value: 'executive', label: 'Executive' }
];

const departments = [
  { value: '', label: 'Select Department' },
  { value: 'Human Resources', label: 'Human Resources' },
  { value: 'Finance', label: 'Finance' },
  { value: 'Information Technology', label: 'Information Technology' },
  { value: 'Operations', label: 'Operations' },
  { value: 'Sales', label: 'Sales' },
  { value: 'Marketing', label: 'Marketing' },
  { value: 'Customer Service', label: 'Customer Service' },
  { value: 'Legal', label: 'Legal' },
  { value: 'Administration', label: 'Administration' }
];

const designations = [
  { value: '', label: 'Select Designation' },
  { value: 'Manager', label: 'Manager' },
  { value: 'Assistant Manager', label: 'Assistant Manager' },
  { value: 'Senior Executive', label: 'Senior Executive' },
  { value: 'Executive', label: 'Executive' },
  { value: 'Officer', label: 'Officer' },
  { value: 'Assistant Officer', label: 'Assistant Officer' },
  { value: 'Supervisor', label: 'Supervisor' },
  { value: 'Team Leader', label: 'Team Leader' },
  { value: 'Coordinator', label: 'Coordinator' },
  { value: 'Specialist', label: 'Specialist' },
  { value: 'Analyst', label: 'Analyst' },
  { value: 'Associate', label: 'Associate' }
];

const EmploymentDetails = ({ formData, errors, onChange }) => {
  // Auto-generate join date on component mount (only if not already set)
  useEffect(() => {
    if (!formData.joinDate) {
      const today = new Date().toISOString().split('T')[0];
      const syntheticEvent = {
        target: {
          name: 'joinDate',
          value: today
        }
      };
      onChange(syntheticEvent, 'employment');
    }
  }, []); // Run only once on mount

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-6">
        <Building className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900">Employment Details</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Department *</label>
          <select
            name="department"
            value={formData.department}
            onChange={(e) => onChange(e, 'employment')}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.department ? 'border-red-500' : 'border-gray-300'}`}
          >
            {departments.map(dept => (
              <option key={dept.value} value={dept.value}>{dept.label}</option>
            ))}
          </select>
          {errors.department && <p className="text-red-500 text-sm mt-1">{errors.department}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Designation *</label>
          <select
            name="designation"
            value={formData.designation}
            onChange={(e) => onChange(e, 'employment')}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.designation ? 'border-red-500' : 'border-gray-300'}`}
          >
            {designations.map(desig => (
              <option key={desig.value} value={desig.value}>{desig.label}</option>
            ))}
          </select>
          {errors.designation && <p className="text-red-500 text-sm mt-1">{errors.designation}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Employment Type *</label>
          <select
            name="employmentType"
            value={formData.employmentType}
            onChange={(e) => onChange(e, 'employment')}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {employmentTypes.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Join Date *</label>
          <input
            type="text"
            name="joinDate"
            value={formData.joinDate || new Date().toISOString().split('T')[0]}
            readOnly
            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-700 cursor-not-allowed"
          />
          <p className="text-sm text-gray-500 mt-1">Join date is automatically set to today's date</p>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">Salary (LKR) *</label>
          <input
            type="number"
            name="salary"
            value={formData.salary}
            onChange={(e) => onChange(e, 'employment')}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.salary ? 'border-red-500' : 'border-gray-300'}`}
            placeholder="Enter salary amount"
            min="0"
          />
          {errors.salary && <p className="text-red-500 text-sm mt-1">{errors.salary}</p>}
        </div>
      </div>
    </div>
  );
};

export default EmploymentDetails;
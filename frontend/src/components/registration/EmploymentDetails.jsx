import React from 'react';
import { Building } from 'lucide-react';
import { employmentTypes } from '../../utils/constants';
const EmploymentDetails = ({ formData, errors, onChange }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-6">
        <Building className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900">Employment Details</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Department *</label>
          <input
            type="text"
            name="department"
            value={formData.department}
            onChange={(e) => onChange(e, 'employment')}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.department ? 'border-red-500' : 'border-gray-300'}`}
            placeholder="Enter department"
          />
          {errors.department && <p className="text-red-500 text-sm mt-1">{errors.department}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Designation *</label>
          <input
            type="text"
            name="designation"
            value={formData.designation}
            onChange={(e) => onChange(e, 'employment')}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.designation ? 'border-red-500' : 'border-gray-300'}`}
            placeholder="Enter designation"
          />
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
            type="date"
            name="joinDate"
            value={formData.joinDate}
            onChange={(e) => onChange(e, 'employment')}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.joinDate ? 'border-red-500' : 'border-gray-300'}`}
          />
          {errors.joinDate && <p className="text-red-500 text-sm mt-1">{errors.joinDate}</p>}
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
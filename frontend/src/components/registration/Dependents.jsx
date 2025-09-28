import React from "react";
import { Trash2 } from "lucide-react";

const Dependents = ({ dependents = [], onAdd, onRemove, onUpdate, errors = {} }) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Dependents Information</h3>
        <button
          type="button"
          onClick={onAdd}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <span>Add Dependent</span>
        </button>
      </div>

      {dependents.length === 0 ? (
        <p className="text-gray-500 text-center py-4">No dependents added yet</p>
      ) : (
        dependents.map((dependent, index) => (
          <div key={index} className="p-4 border rounded-lg space-y-4 bg-white shadow-sm">
            <div className="flex justify-between items-center border-b pb-2">
              <h4 className="font-medium">
                {dependent.relationship === "spouse" ? "Spouse Details" : `Child ${index + 1} Details`}
              </h4>
              <button
                type="button"
                onClick={() => onRemove(index)}
                className="text-red-600 hover:text-red-800"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-group">
                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                <input
                  type="text"
                  value={dependent.name || ''}
                  onChange={(e) => onUpdate(index, "name", e.target.value, "name")}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Enter full name"
                />
                {errors[`dependent${index}_name`] && (
                  <p className="text-red-500 text-sm mt-1">{errors[`dependent${index}_name`]}</p>
                )}
              </div>

              <div className="form-group">
                <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                <input
                  type="date"
                  value={dependent.dateOfBirth || ''}
                  onChange={(e) => onUpdate(index, "dateOfBirth", e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                {errors[`dependent${index}_dateOfBirth`] && (
                  <p className="text-red-500 text-sm mt-1">{errors[`dependent${index}_dateOfBirth`]}</p>
                )}
              </div>

              {dependent.relationship === "spouse" && (
                <div className="form-group md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">NIC Number</label>
                  <input
                    type="text"
                    value={dependent.nic || ''}
                    onChange={(e) => onUpdate(index, "nic", e.target.value, "nic")}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Enter NIC number"
                  />
                  {errors[`dependent${index}_nic`] && (
                    <p className="text-red-500 text-sm mt-1">{errors[`dependent${index}_nic`]}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default Dependents;
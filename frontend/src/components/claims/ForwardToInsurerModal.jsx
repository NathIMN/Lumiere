/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { X, Plus, Minus, Coins, AlertCircle, ArrowRight } from "lucide-react";
import insuranceApiService from "../../services/insurance-api";
import { validators, claimValidations } from "../../utils/claimValidators";

export const ForwardToInsurerModal = ({ claim, onClose, onSuccess }) => {
  const [coverageBreakdown, setCoverageBreakdown] = useState([
    { coverageType: "", requestedAmount: "", notes: "" },
  ]);
  const [hrNotes, setHrNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // Format amount in LKR
  const formatLKR = (amount) => {
    return `Rs. ${amount.toLocaleString("en-LK")}`;
  };
  console.log("here ", claim.policy.coverage);
  // Predefined coverage types based on claim type
  const getCoverageTypes = () => {
    if (claim.claimType === "life") {
      return {
        'life_cover': 'Life Cover',
        'hospitalization': 'Hospitalization',
        'surgical_benefits': 'Surgical Benefits',
        'outpatient': 'Outpatient',
        'prescription_drugs': 'Prescription Drugs',
      };
    } else {
      return {
        'collision': 'Collision',
        'liability': 'Liability',
        'comprehensive': 'Comprehensive',
        'personal_accident': 'Personal Accident',
      };
    }
  };

  const coverageTypes = getCoverageTypes();

  const addCoverageItem = () => {
    setCoverageBreakdown([
      ...coverageBreakdown,
      { coverageType: "", requestedAmount: "", notes: "" },
    ]);
  };

  const removeCoverageItem = (index) => {
    if (coverageBreakdown.length > 1) {
      const newBreakdown = coverageBreakdown.filter((_, i) => i !== index);
      setCoverageBreakdown(newBreakdown);
      // Clear errors for removed item
      const newErrors = { ...errors };
      delete newErrors[`coverage_${index}_type`];
      delete newErrors[`coverage_${index}_amount`];
      delete newErrors[`coverage_${index}_notes`];
      setErrors(newErrors);
    }
  };

  const updateCoverageItem = (index, field, value) => {
    const newBreakdown = [...coverageBreakdown];

    // Handle amount validation on input
    if (field === "requestedAmount") {
      // Remove any non-numeric characters except decimal point
      const cleanValue = value.replace(/[^0-9.]/g, "");

      // Ensure only one decimal point
      const parts = cleanValue.split(".");
      if (parts.length > 2) {
        return; // Don't update if multiple decimal points
      }

      // Limit decimal places to 2
      if (parts[1] && parts[1].length > 2) {
        parts[1] = parts[1].substring(0, 2);
      }

      const finalValue = parts.join(".");
      newBreakdown[index][field] = finalValue;

      // Real-time validation for amount
      const newErrors = { ...errors };
      if (
        finalValue &&
        (isNaN(parseFloat(finalValue)) || parseFloat(finalValue) <= 0)
      ) {
        newErrors[`coverage_${index}_amount`] =
          "Please enter a valid positive amount";
      } else {
        delete newErrors[`coverage_${index}_amount`];
      }
      setErrors(newErrors);
    } else {
      newBreakdown[index][field] = value;

      // Real-time validation for other fields
      if (field === "coverageType") {
        const newErrors = { ...errors };
        if (!value) {
          newErrors[`coverage_${index}_type`] = "Coverage type is required";
        } else {
          delete newErrors[`coverage_${index}_type`];
        }
        setErrors(newErrors);
      }

      if (field === "notes") {
        const newErrors = { ...errors };
        if (value && value.length > 200) {
          newErrors[`coverage_${index}_notes`] =
            "Notes cannot exceed 200 characters";
        } else {
          delete newErrors[`coverage_${index}_notes`];
        }
        setErrors(newErrors);
      }
    }

    setCoverageBreakdown(newBreakdown);
  };

  const validateForm = () => {
    const newErrors = {};

    // Validate each coverage item
    coverageBreakdown.forEach((item, index) => {
      // Validate coverage type
      if (!item.coverageType) {
        newErrors[`coverage_${index}_type`] = "Coverage type is required";
      }

      // Validate amount
      if (!item.requestedAmount) {
        newErrors[`coverage_${index}_amount`] = "Requested amount is required";
      } else {
        const amount = parseFloat(item.requestedAmount);

        if (isNaN(amount) || amount <= 0) {
          newErrors[`coverage_${index}_amount`] =
            "Please enter a valid positive amount";
        } else if (amount > 10000000) {
          newErrors[`coverage_${index}_amount`] =
            "Amount cannot exceed Rs. 10,000,000";
        } else if (amount < 1) {
          newErrors[`coverage_${index}_amount`] =
            "Amount must be at least Rs. 1";
        }

        // Check for too many decimal places
        const decimalParts = item.requestedAmount.toString().split(".");
        if (decimalParts[1] && decimalParts[1].length > 2) {
          newErrors[`coverage_${index}_amount`] =
            "Amount can have maximum 2 decimal places";
        }
      }

      // Validate notes length
      if (item.notes && item.notes.length > 200) {
        newErrors[`coverage_${index}_notes`] =
          "Notes cannot exceed 200 characters";
      }
    });

    // Calculate total and validate against claim amount
    const totalRequested = coverageBreakdown.reduce((sum, item) => {
      const amount = parseFloat(item.requestedAmount) || 0;
      return sum + amount;
    }, 0);

    const claimAmount = claim.claimAmount?.requested || 0;

    if (totalRequested > claimAmount) {
      newErrors.total = `Total breakdown (${formatLKR(
        totalRequested
      )}) cannot exceed claimed amount (${formatLKR(claimAmount)})`;
    }

    if (totalRequested === 0) {
      newErrors.total =
        "At least one coverage item with valid amount is required";
    }

    // Validate HR notes
    if (hrNotes && hrNotes.length > 1000) {
      newErrors.hrNotes = "HR notes cannot exceed 1000 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        // Existing coverage breakdown data
        coverageBreakdown: coverageBreakdown.map((item) => ({
          coverageType: item.coverageType,
          requestedAmount: parseFloat(item.requestedAmount),
          notes: item.notes.trim(),
        })),
        hrNotes: hrNotes.trim(),

        // Add questionnaire data if available
        questionnaireData: claim.questionnaire
          ? {
              sections:
                claim.questionnaire.sections?.map((section) => ({
                  title: section.title,
                  sectionId: section.sectionId || section._id,
                  responses: section.responses
                    ?.filter((r) => r.isAnswered)
                    .map((response) => ({
                      questionText: response.questionText,
                      questionType: response.questionType,
                      answer: response.answer,
                      isAnswered: response.isAnswered,
                      order: response.order,
                    })),
                })) || [],
              responses:
                claim.questionnaire.responses
                  ?.filter((r) => r.isAnswered)
                  .map((response) => ({
                    questionText: response.questionText,
                    questionType: response.questionType,
                    answer: response.answer,
                    isAnswered: response.isAnswered,
                    order: response.order,
                  })) || [],
            }
          : null,

        // Add document references if available
        documents:
          claim.documents?.map((doc) => ({
            documentId: doc._id || doc.id,
            originalName: doc.originalName || doc.filename,
            docType: doc.docType,
            uploadedAt: doc.uploadedAt || doc.createdAt,
          })) || [],

        // Additional metadata for tracking
        forwardedAt: new Date().toISOString(),
        forwardedBy: "hr",
        previousStatus: claim.claimStatus,
        newStatus: "insurer", // Remove the comma from here

        // Include claim context
        claimContext: {
          claimId: claim.claimId,
          claimType: claim.claimType,
          claimOption:
            claim.claimType === "life"
              ? claim.lifeClaimOption
              : claim.vehicleClaimOption,
          submittedAt: claim.submittedAt,
          originalAmount: claim.claimAmount?.requested,
          policy: {
            policyNumber: claim.policy?.policyNumber,
            policyType: claim.policy?.policyType,
            provider: claim.policy?.provider,
            coverage: claim.policy?.coverage,
          },
        },
      };
      console.log("=== FORWARD TO INSURER DEBUG ===");
      console.log("Full Payload:", JSON.stringify(payload, null, 2));
      console.log(
        "Questionnaire Sections:",
        payload.questionnaireData?.sections?.length || 0
      );
      console.log("Documents Count:", payload.documents.length);
      console.log("================================");

      // IMPORTANT: Use the correct API method that matches your existing service
      // This assumes your insuranceApiService already has the correct implementation
      const response = await insuranceApiService.forwardClaimToInsurer(
        claim._id,
        payload
      );

      console.log("=== FORWARD RESPONSE DEBUG ===");
      console.log("Response:", response);
      console.log("Response type:", typeof response);
      if (response) {
        console.log("Response keys:", Object.keys(response));
      }
      console.log("===============================");

      // Verify the response indicates success
      if (
        response &&
        (response.success || response.status === "success" || response.data)
      ) {
        console.log("Forward operation successful");
        onSuccess();
      } else {
        throw new Error(
          "Forward operation may have failed - unexpected response structure"
        );
      }
    } catch (error) {
      console.error("=== FORWARD ERROR DEBUG ===");
      console.error("Error:", error);
      console.error("Error message:", error.message);
      console.error("Error response:", error.response?.data);
      console.error("===========================");

      setErrors({
        submit:
          error.response?.data?.message ||
          error.message ||
          "Failed to forward claim to insurer",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateTotal = () => {
    return coverageBreakdown.reduce(
      (sum, item) => sum + (parseFloat(item.requestedAmount) || 0),
      0
    );
  };

  // Handle paste event to prevent pasting negative values
  const handleAmountPaste = (e, index) => {
    e.preventDefault();
    const pastedText = (e.clipboardData || window.clipboardData).getData(
      "text"
    );
    const cleanValue = pastedText.replace(/[^0-9.]/g, "");
    if (
      cleanValue &&
      !isNaN(parseFloat(cleanValue)) &&
      parseFloat(cleanValue) > 0
    ) {
      updateCoverageItem(index, "requestedAmount", cleanValue);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Forward Claim to Insurer
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Claim ID: {claim.claimId} | Requested:{" "}
              {formatLKR(claim.claimAmount?.requested || 0)}
            </p>
            <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
              Fill in the coverage breakdown details to forward this claim to
              the insurer
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Coverage Breakdown Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Coverage Breakdown *
              </h3>
              <button
                type="button"
                onClick={addCoverageItem}
                className="flex items-center space-x-2 text-green-600 hover:text-green-700 dark:text-green-400 text-sm"
              >
                <Plus className="h-4 w-4" />
                <span>Add Coverage Item</span>
              </button>
            </div>

            <div className="text-sm text-gray-600 dark:text-gray-400 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md">
              <p>
                <strong>Instructions:</strong> Break down the claim amount by
                coverage type. Each coverage type should specify the requested
                amount and any relevant notes. The total must not exceed the
                original claim amount.
              </p>
            </div>

            {errors.total && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-3">
                <div className="flex items-center">
                  <AlertCircle className="h-4 w-4 text-red-400 mr-2" />
                  <span className="text-red-800 dark:text-red-200 text-sm">
                    {errors.total}
                  </span>
                </div>
              </div>
            )}

            <div className="space-y-4">
              {coverageBreakdown.map((item, index) => (
                <div
                  key={index}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      Coverage Item {index + 1}
                    </h4>
                    {coverageBreakdown.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeCoverageItem(index)}
                        className="text-red-600 hover:text-red-700 dark:text-red-400 p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md"
                        title="Remove this coverage item"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Coverage Type */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Coverage Type *
                      </label>
                      <select
                        value={item.coverageType}
                        onChange={(e) =>
                          updateCoverageItem(
                            index,
                            "coverageType",
                            e.target.value
                          )
                        }
                        className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white ${
                          errors[`coverage_${index}_type`]
                            ? "border-red-300 dark:border-red-600"
                            : "border-gray-300 dark:border-gray-600"
                        }`}
                      >
                        <option value="">Select coverage type</option>
                        {Object.entries(coverageTypes).map(([key, label]) => (
                          <option key={key} value={key}>
                            {label}
                          </option>
                        ))}
                      </select>
                      {errors[`coverage_${index}_type`] && (
                        <p className="text-red-600 dark:text-red-400 text-sm mt-1">
                          {errors[`coverage_${index}_type`]}
                        </p>
                      )}
                    </div>

                    {/* Requested Amount */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Requested Amount (LKR) *
                      </label>
                      <div className="relative">
                        <Coins className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="text"
                          value={item.requestedAmount}
                          onChange={(e) =>
                            updateCoverageItem(
                              index,
                              "requestedAmount",
                              e.target.value
                            )
                          }
                          onPaste={(e) => handleAmountPaste(e, index)}
                          onKeyDown={(e) => {
                            // Prevent minus key, plus key, and 'e' key
                            if (
                              e.key === "-" ||
                              e.key === "+" ||
                              e.key === "e" ||
                              e.key === "E"
                            ) {
                              e.preventDefault();
                            }
                          }}
                          className={`w-full pl-10 pr-3 py-2 border rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white ${
                            errors[`coverage_${index}_amount`]
                              ? "border-red-300 dark:border-red-600"
                              : "border-gray-300 dark:border-gray-600"
                          }`}
                          placeholder="0.00"
                        />
                      </div>
                      {errors[`coverage_${index}_amount`] && (
                        <p className="text-red-600 dark:text-red-400 text-sm mt-1">
                          {errors[`coverage_${index}_amount`]}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Notes for this coverage item */}
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Coverage Notes
                    </label>
                    <textarea
                      value={item.notes}
                      onChange={(e) =>
                        updateCoverageItem(index, "notes", e.target.value)
                      }
                      className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white ${
                        errors[`coverage_${index}_notes`]
                          ? "border-red-300 dark:border-red-600"
                          : "border-gray-300 dark:border-gray-600"
                      }`}
                      rows="2"
                      placeholder="Additional notes for this coverage item..."
                      maxLength={200}
                    />
                    {errors[`coverage_${index}_notes`] && (
                      <p className="text-red-600 dark:text-red-400 text-sm mt-1">
                        {errors[`coverage_${index}_notes`]}
                      </p>
                    )}
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {item.notes.length}/200 characters
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Total Summary */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-900 dark:text-white">
                  Total Breakdown Amount:
                </span>
                <span className="text-xl font-bold text-gray-900 dark:text-white whitespace-nowrap">
                  {formatLKR(calculateTotal())}
                </span>
              </div>
              <div className="flex justify-between items-center mt-2 text-sm">
                <span className="text-gray-600 dark:text-gray-400">
                  Original Claim Amount:
                </span>
                <span className="text-gray-600 dark:text-gray-400 whitespace-nowrap">
                  {formatLKR(claim.claimAmount?.requested || 0)}
                </span>
              </div>
              {calculateTotal() > 0 && (
                <div className="mt-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      Coverage Items:
                    </span>
                    <span className="text-gray-600 dark:text-gray-400">
                      {coverageBreakdown.length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      Difference:
                    </span>
                    <span
                      className={`${
                        calculateTotal() > (claim.claimAmount?.requested || 0)
                          ? "text-red-600 dark:text-red-400"
                          : calculateTotal() <
                            (claim.claimAmount?.requested || 0)
                          ? "text-orange-600 dark:text-orange-400"
                          : "text-green-600 dark:text-green-400"
                      }`}
                    >
                      {formatLKR(
                        Math.abs(
                          calculateTotal() - (claim.claimAmount?.requested || 0)
                        )
                      )}
                      {calculateTotal() > (claim.claimAmount?.requested || 0) &&
                        " over"}
                      {calculateTotal() < (claim.claimAmount?.requested || 0) &&
                        " under"}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* HR Notes */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              HR Notes
            </label>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Add any additional notes or comments that will help the insurer
              understand this claim better.
            </p>
            <textarea
              value={hrNotes}
              onChange={(e) => setHrNotes(e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white ${
                errors.hrNotes
                  ? "border-red-300 dark:border-red-600"
                  : "border-gray-300 dark:border-gray-600"
              }`}
              rows="4"
              placeholder="Add any additional notes or comments for the insurer..."
              maxLength={1000}
            />
            <div className="flex justify-between text-sm">
              <span>
                {errors.hrNotes && (
                  <span className="text-red-600 dark:text-red-400">
                    {errors.hrNotes}
                  </span>
                )}
              </span>
              <span className="text-gray-500 dark:text-gray-400">
                {hrNotes.length}/1000 characters
              </span>
            </div>
          </div>

          {/* Submit Error */}
          {errors.submit && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-3">
              <div className="flex items-center">
                <AlertCircle className="h-4 w-4 text-red-400 mr-2" />
                <span className="text-red-800 dark:text-red-200 text-sm">
                  {errors.submit}
                </span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Forwarding...</span>
                </>
              ) : (
                <>
                  <ArrowRight className="h-4 w-4" />
                  <span>Forward to Insurer</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

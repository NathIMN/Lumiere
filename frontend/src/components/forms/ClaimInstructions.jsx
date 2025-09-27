import React from 'react';
import { Check, Info, Camera, ChevronLeft, ChevronRight, FileText, Shield } from 'lucide-react';

export const claimInstructions = {
   life: {
      hospitalization: {
         title: "Hospitalization Claim",
         description: "Submit your hospitalization claim with required medical documentation.",
         documents: [
            "Medical Certificate from attending physician",
            "Hospital Bills and detailed invoice",
            "Discharge Summary from hospital",
            "Original receipts for all medical expenses",
            "Test reports and diagnostic results",
            "Surgery reports (if applicable)"
         ],
         information: [
            "Dates of hospitalization (admission and discharge)",
            "Name and address of the hospital",
            "Diagnosis and treatment details",
            "Doctor's name and registration number",
            "Total treatment costs breakdown",
            "Insurance policy number and details"
         ],
         tips: [
            "Ensure all documents are clear and legible",
            "Submit claims within 30 days of discharge for faster processing",
            "Keep original receipts and make copies for your records",
            "Contact your doctor if any medical reports are missing",
            "Check that all hospital bills include necessary details",
            "Include all related medical expenses in the claim amount"
         ]
      },
      channelling: {
         title: "Channeling Claim",
         description: "Submit your channeling fees claim with medical documentation.",
         documents: [
            "Original channeling receipt from hospital/clinic",
            "Medical report or consultation notes",
            "Doctor's prescription (if applicable)",
            "Referral letter (if channeling was referred)",
            "Appointment confirmation receipt"
         ],
         information: [
            "Date and time of consultation",
            "Doctor's name and specialization",
            "Hospital/clinic name and location",
            "Consultation fee amount",
            "Reason for consultation/diagnosis",
            "Treatment recommendations"
         ],
         tips: [
            "Submit claims promptly for faster processing",
            "Keep original channeling receipts safe",
            "Ensure doctor's details are clearly mentioned",
            "Include consultation notes if available",
            "Check receipt has all required information"
         ]
      },
      medication: {
         title: "Medication Claim",
         description: "Submit your medication expenses claim with proper documentation.",
         documents: [
            "Original pharmacy bills/receipts",
            "Doctor's prescription with signature",
            "Medicine purchase invoice",
            "Pharmacy dispensing label",
            "Medical report supporting medication need"
         ],
         information: [
            "Date of medication purchase",
            "Pharmacy name and location",
            "Medication names and quantities",
            "Unit prices and total cost",
            "Prescription date and doctor details",
            "Reason for medication (diagnosis)"
         ],
         tips: [
            "Only prescribed medications are covered",
            "Ensure prescription is from registered medical practitioner",
            "Keep original pharmacy receipts",
            "Check medication names match prescription exactly",
            "Submit claims within policy timeframe"
         ]
      },
      death: {
         title: "Death Claim",
         description: "Submit death benefit claim with required legal documentation.",
         documents: [
            "Original death certificate",
            "Medical certificate stating cause of death",
            "Identity documents of the deceased",
            "Beneficiary identification documents",
            "Policy documents",
            "Claimant's identity verification"
         ],
         information: [
            "Date, time, and place of death",
            "Cause of death as per medical certificate",
            "Deceased's personal details",
            "Beneficiary details and relationship",
            "Policy number and coverage amount",
            "Legal documentation requirements"
         ],
         tips: [
            "Contact our support team for guidance through this process",
            "Ensure all legal documentation is properly verified",
            "Submit claims as soon as possible after the event",
            "Keep copies of all submitted documents",
            "Provide complete beneficiary information",
            "Be prepared for additional verification requirements"
         ]
      }
   },
   vehicle: {
      accident: {
         title: "Vehicle Accident Claim",
         description: "Submit your vehicle accident claim with incident documentation.",
         documents: [
            "Police report (original or certified copy)",
            "Multiple repair estimates from authorized garages",
            "Photos of vehicle damage from multiple angles",
            "Driving license of the driver at time of accident",
            "Vehicle registration certificate",
            "Insurance policy documents"
         ],
         information: [
            "Date, time, and location of accident",
            "Circumstances leading to the accident",
            "Details of other vehicles/parties involved",
            "Police report number and station",
            "Estimated repair costs",
            "Current vehicle condition and usage"
         ],
         tips: [
            "Report accidents to police immediately",
            "Take photos from multiple angles showing all damage",
            "Get at least 2-3 repair estimates from authorized dealers",
            "Don't admit fault at the accident scene",
            "Keep all incident documentation safe",
            "Contact insurance company within 24-48 hours"
         ]
      },
      theft: {
         title: "Vehicle Theft Claim",
         description: "Submit your vehicle theft claim with police documentation.",
         documents: [
            "Original police report/FIR copy",
            "Vehicle registration certificate",
            "Original vehicle keys (if available)",
            "Insurance policy documents",
            "Identity documents of policy holder",
            "Purchase invoice of the vehicle"
         ],
         information: [
            "Date, time, and location where theft occurred",
            "Circumstances of the theft incident",
            "Police station and report number",
            "Vehicle details (make, model, year, VIN)",
            "Last known location of vehicle",
            "Security measures that were in place"
         ],
         tips: [
            "Report theft to police immediately",
            "Inform insurance company within 24 hours",
            "Don't delay in filing the FIR",
            "Provide complete vehicle documentation",
            "Keep copies of all submitted documents",
            "Cooperate fully with police investigation"
         ]
      },
      fire: {
         title: "Vehicle Fire Claim",
         description: "Submit your vehicle fire damage claim with incident documentation.",
         documents: [
            "Fire department report (if available)",
            "Police report documenting the incident",
            "Photos of fire damage to vehicle",
            "Vehicle registration certificate",
            "Repair estimates for fire damage",
            "Fire investigation report (if conducted)"
         ],
         information: [
            "Date, time, and location of fire incident",
            "Cause of fire (if determined)",
            "Fire department response details",
            "Extent of damage to vehicle",
            "Estimated repair or replacement costs",
            "Safety measures taken during incident"
         ],
         tips: [
            "Ensure personal safety first during fire incidents",
            "Contact fire department and police immediately",
            "Take photos of damage once safe to do so",
            "Don't attempt to move severely damaged vehicle",
            "Get professional assessment of fire damage",
            "Report to insurance company promptly"
         ]
      },
      naturalDisaster: {
         title: "Natural Disaster Claim",
         description: "Submit your natural disaster vehicle damage claim.",
         documents: [
            "Weather report or disaster declaration",
            "Photos of vehicle damage",
            "Police report (if available)",
            "Vehicle registration certificate",
            "Repair estimates from authorized dealers",
            "Location proof during disaster"
         ],
         information: [
            "Type of natural disaster (flood, earthquake, etc.)",
            "Date and location of disaster occurrence",
            "Vehicle location during disaster",
            "Extent and type of damage sustained",
            "Official weather/disaster reports",
            "Estimated repair or replacement costs"
         ],
         tips: [
            "Document damage immediately when safe",
            "Don't attempt to start flood-damaged vehicles",
            "Get multiple professional damage assessments",
            "Keep weather reports and news coverage",
            "Report claims as soon as possible",
            "Follow official disaster response guidelines"
         ]
      }
   }
};

export const ClaimInstructions = ({ claimType, claimOption, onProceed, onBack, loading }) => {
   const instructions = claimInstructions[claimType]?.[claimOption];

   if (!instructions) {
      return (
         <div className="text-center py-12">
            <p className="text-gray-600">Instructions not available for this claim type.</p>
         </div>
      );
   }

   return (
      <div className="space-y-8">
         <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
               <Info className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
               {instructions.title} - Preparation Guide
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
               {instructions.description}
            </p>
         </div>

         {/* Required Documents */}
         <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
            <div className="flex items-center gap-3 mb-4">
               <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-white" />
               </div>
               <h3 className="text-lg font-semibold text-gray-900">Required Documents</h3>
            </div>
            <p className="text-gray-600 mb-4">Please ensure you have the following documents ready before proceeding:</p>
            <div className="grid md:grid-cols-2 gap-3">
               {instructions.documents?.map((doc, index) => (
                  <div key={index} className="flex items-start gap-2 text-sm">
                     <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                     <span className="text-gray-700">{doc}</span>
                  </div>
               ))}
            </div>
         </div>

         {/* Required Information */}
         <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
            <div className="flex items-center gap-3 mb-4">
               <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-white" />
               </div>
               <h3 className="text-lg font-semibold text-gray-900">Information You'll Need</h3>
            </div>
            <p className="text-gray-600 mb-4">Make sure you have details about the following:</p>
            <div className="grid md:grid-cols-2 gap-3">
               {instructions.information?.map((info, index) => (
                  <div key={index} className="flex items-start gap-2 text-sm">
                     <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                     <span className="text-gray-700">{info}</span>
                  </div>
               ))}
            </div>
         </div>

         {/* Tips and Best Practices */}
         <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-6 border border-amber-100">
            <div className="flex items-center gap-3 mb-4">
               <div className="w-8 h-8 bg-amber-600 rounded-lg flex items-center justify-center">
                  <Camera className="w-5 h-5 text-white" />
               </div>
               <h3 className="text-lg font-semibold text-gray-900">Important Tips</h3>
            </div>
            <p className="text-gray-600 mb-4">Follow these guidelines for a smooth claim process:</p>
            <div className="space-y-3">
               {instructions.tips?.map((tip, index) => (
                  <div key={index} className="flex items-start gap-2 text-sm">
                     <div className="w-5 h-5 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-amber-600 font-bold text-xs">{index + 1}</span>
                     </div>
                     <span className="text-gray-700">{tip}</span>
                  </div>
               ))}
            </div>
         </div>

         {/* Action Buttons */}
         <div className="flex justify-between items-center pt-6">
            <button
               onClick={onBack}
               className="flex items-center gap-2 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
               <ChevronLeft className="w-4 h-4" />
               Back to Claim Types
            </button>

            <div className="text-right">
               <p className="text-sm text-gray-600 mb-3">Ready to proceed?</p>
               <button
                  onClick={onProceed}
                  disabled={loading}
                  className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
               >
                  {loading ? (
                     <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Loading Form...
                     </>
                  ) : (
                     <>
                        Start Questionnaire
                        <ChevronRight className="w-4 h-4" />
                     </>
                  )}
               </button>
            </div>
         </div>
      </div>
   );
};
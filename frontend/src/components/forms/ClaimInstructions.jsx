  // Instructions for each claim type and option
   export const claimInstructions = {
      life: {
         hospitalization: {
            title: "Hospitalization Claim",
            description: "Claims related to hospital stays, surgeries, and inpatient medical treatments.",
            documents: [
               "Hospital admission and discharge summary",
               "Medical bills and receipts",
               "Doctor's prescription and medical reports",
               "Lab test results and X-rays (if applicable)",
               "Insurance pre-authorization (if obtained)"
            ],
            information: [
               "Hospital name and admission dates",
               "Doctor's name and contact information",
               "Diagnosis and treatment details",
               "Total medical expenses incurred",
               "Any insurance pre-approvals received"
            ],
            tips: [
               "Keep all original receipts and medical documents",
               "Inform your insurance provider as soon as possible",
               "Get itemized bills from the hospital",
               "Ensure all documents have hospital letterhead and stamps"
            ]
         },
         channelling: {
            title: "Channelling Claim",
            description: "Claims for doctor consultations, specialist visits, and outpatient treatments.",
            documents: [
               "Doctor's consultation receipts",
               "Medical prescription",
               "Specialist referral letter (if applicable)",
               "Medical test reports",
               "Treatment records"
            ],
            information: [
               "Doctor's name and specialization",
               "Date and time of consultation",
               "Reason for consultation",
               "Prescribed medications or treatments",
               "Follow-up appointment details"
            ],
            tips: [
               "Schedule appointments through approved channels when possible",
               "Keep digital copies of all prescriptions",
               "Note any follow-up treatments recommended",
               "Verify doctor is in your network if applicable"
            ]
         },
         medication: {
            title: "Medication Claim",
            description: "Claims for prescription medicines and pharmaceutical expenses.",
            documents: [
               "Pharmacy receipts with itemized medication list",
               "Original prescription from registered doctor",
               "Medicine packaging or labels",
               "Medical reports supporting prescription"
            ],
            information: [
               "Prescribing doctor's details",
               "Medication names and dosages",
               "Pharmacy name and location",
               "Purchase dates and amounts",
               "Medical condition being treated"
            ],
            tips: [
               "Always use registered pharmacies",
               "Keep original receipts with pharmacy stamps",
               "Ensure prescription is from a qualified doctor",
               "Check medication expiry dates"
            ]
         },
         death: {
            title: "Death Benefit Claim",
            description: "Claims for life insurance benefits following the death of the insured person.",
            documents: [
               "Death certificate (original)",
               "Medical certificate stating cause of death",
               "Police report (if applicable)",
               "Hospital records and medical history",
               "Beneficiary identification documents"
            ],
            information: [
               "Date, time, and place of death",
               "Cause of death as per medical records",
               "Details of final medical treatment",
               "Beneficiary information and relationship",
               "Policy details of the deceased"
            ],
            tips: [
               "Notify the insurance company immediately",
               "Obtain multiple certified copies of death certificate",
               "Gather all medical records leading to death",
               "Ensure beneficiary documents are up to date"
            ]
         }
      },
      vehicle: {
         accident: {
            title: "Vehicle Accident Claim",
            description: "Claims for damages, injuries, and losses due to vehicle accidents.",
            documents: [
               "Police accident report",
               "Vehicle registration and insurance documents",
               "Driver's license of all involved parties",
               "Photographs of accident scene and damages",
               "Medical reports (if injuries occurred)",
               "Repair estimates from authorized garages"
            ],
            information: [
               "Date, time, and location of accident",
               "Details of all parties involved",
               "Description of how accident occurred",
               "Weather and road conditions",
               "Witnesses contact information",
               "Extent of vehicle damage and injuries"
            ],
            tips: [
               "Contact police immediately and file a report",
               "Take photos from multiple angles",
               "Don't admit fault at the scene",
               "Get contact details of witnesses",
               "Seek medical attention even for minor injuries"
            ]
         },
         theft: {
            title: "Vehicle Theft Claim",
            description: "Claims for stolen vehicles or theft of vehicle parts and accessories.",
            documents: [
               "Police theft report (FIR)",
               "Vehicle registration certificate",
               "Original insurance policy documents",
               "All vehicle keys",
               "Purchase receipts for stolen accessories",
               "Vehicle service history"
            ],
            information: [
               "Date, time, and location of theft",
               "Circumstances of the theft",
               "Items stolen from the vehicle",
               "Last known location of vehicle",
               "Security measures in place",
               "Vehicle condition before theft"
            ],
            tips: [
               "Report to police within 24 hours",
               "Don't move the vehicle if partially damaged",
               "Inform insurance company immediately",
               "Provide all available keys to insurer",
               "Keep all original purchase documents ready"
            ]
         },
         fire: {
            title: "Fire Damage Claim",
            description: "Claims for vehicle damages caused by fire, explosion, or self-ignition.",
            documents: [
               "Fire department report",
               "Police report (if applicable)",
               "Vehicle registration documents",
               "Photos of fire damage",
               "Repair estimates from authorized dealers",
               "Investigation reports from authorities"
            ],
            information: [
               "Date, time, and location of fire incident",
               "Cause of fire (if known)",
               "Extent of damage to vehicle",
               "Any injuries or property damage",
               "Fire fighting efforts undertaken",
               "Weather conditions during incident"
            ],
            tips: [
               "Ensure safety first - call fire department",
               "Don't attempt to start damaged vehicle",
               "Take photos before vehicle is moved",
               "Preserve any evidence of cause",
               "Get official fire department report"
            ]
         },
         naturalDisaster: {
            title: "Natural Disaster Claim",
            description: "Claims for vehicle damages due to floods, storms, earthquakes, or other natural calamities.",
            documents: [
               "Weather department reports",
               "Photos of vehicle damage",
               "Police report (if available)",
               "Vehicle registration documents",
               "Damage assessment reports",
               "Local authority disaster declarations"
            ],
            information: [
               "Type of natural disaster",
               "Date and location of incident",
               "Extent of vehicle damage",
               "Weather conditions during event",
               "Other affected properties in area",
               "Emergency services response"
            ],
            tips: [
               "Don't attempt to start flood-damaged vehicle",
               "Document damage with photos immediately",
               "Check for official weather warnings",
               "Remove vehicle from affected area safely",
               "Keep receipts for temporary repairs"
            ]
         }
      }
   };
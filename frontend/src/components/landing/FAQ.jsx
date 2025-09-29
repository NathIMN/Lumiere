import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

const faqs = [
  {
    question: "How do I file a new insurance claim?",
    answer:
      "To file a new claim, log into your account, go to the 'Claims' section, and click 'Start New Claim.' Fill in the required details and upload supporting documents.",
  },
  {
    question: "What documents are required to submit a claim?",
    answer:
      "You will typically need your policy number, proof of loss (e.g., photos, receipts), and a valid ID. Additional documents may be requested depending on the claim type.",
  },
  {
    question: "How can I check the status of my claim?",
    answer:
      "Go to the 'Claims' dashboard in your portal. You will see the current status, assigned agent, and estimated processing time.",
  },
  {
    question: "How long does it take to process a claim?",
    answer:
      "Most claims are processed within 7–14 business days, depending on complexity and the completeness of submitted documents.",
  },
];

export const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="bg-white text-gray-900 py-16 px-6 md:px-16">
      <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12">
        {/* Left side */}
        <div>
          <h2 className="text-3xl font-bold text-gray-900">
            Frequently Asked Questions
          </h2>
          <p className="mt-4 text-gray-600">
            Everything you need to know about filing, tracking, and managing
            insurance claims with our system.
          </p>
          <p className="mt-2 text-gray-600">
            Trusted by thousands of policyholders worldwide.
          </p>
        </div>

        {/* Right side */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="border rounded-lg shadow-sm"
            >
              <button
                className="w-full flex justify-between items-center p-4 text-left text-gray-800 font-medium hover:text-red-900 focus:outline-none"
                onClick={() => toggleFAQ(index)}
              >
                {faq.question}
                {openIndex === index ? (
                  <ChevronUp className="w-5 h-5 text-red-900" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-500" />
                )}
              </button>
              {openIndex === index && (
                <div className="p-4 border-t text-gray-700 bg-red-50">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

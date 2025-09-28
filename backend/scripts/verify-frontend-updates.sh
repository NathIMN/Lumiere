#!/bin/bash

# AdminPolicies.jsx Update Verification Script
echo "🧪 Verifying AdminPolicies.jsx Updates..."
echo "=========================================="

FILE_PATH="/home/nath/Documents/projects/Lumiere/frontend/src/pages/Admin/AdminPolicies.jsx"

if [ ! -f "$FILE_PATH" ]; then
    echo "❌ AdminPolicies.jsx file not found!"
    exit 1
fi

echo "✅ AdminPolicies.jsx file found"

# Check if insurance API service is imported
if grep -q "import insuranceApiService from" "$FILE_PATH"; then
    echo "✅ Insurance API service import added"
else
    echo "❌ Insurance API service import missing"
fi

# Check for enhanced policy creation in handleCreate
if grep -q "createLifePolicyWithAllCoverageTypes" "$FILE_PATH"; then
    echo "✅ Enhanced life policy creation method used"
else
    echo "❌ Enhanced life policy creation method missing"
fi

# Check for updated coverage types (no life_cover)
if ! grep -q "life_cover" "$FILE_PATH"; then
    echo "✅ Removed old 'life_cover' coverage type"
else
    echo "⚠️  'life_cover' still present in coverage types"
fi

# Check for 4 standard life coverage types
COVERAGE_TYPES=("hospitalization" "surgical_benefits" "outpatient" "prescription_drugs")
ALL_TYPES_PRESENT=true

for type in "${COVERAGE_TYPES[@]}"; do
    if grep -q "$type" "$FILE_PATH"; then
        echo "✅ Coverage type '$type' present"
    else
        echo "❌ Coverage type '$type' missing"
        ALL_TYPES_PRESENT=false
    fi
done

# Check for enhanced validation
if grep -q "more flexible for life policies" "$FILE_PATH"; then
    echo "✅ Enhanced validation for life policies"
else
    echo "❌ Enhanced validation missing"
fi

# Check for auto-calculation hints
if grep -q "Auto-calculated if empty" "$FILE_PATH"; then
    echo "✅ Coverage amount auto-calculation hints added"
else
    echo "❌ Coverage amount auto-calculation hints missing"
fi

# Check for enhanced creation notice
if grep -q "Enhanced Policy Creation" "$FILE_PATH"; then
    echo "✅ Enhanced policy creation notice added"
else
    echo "❌ Enhanced policy creation notice missing"
fi

echo ""
echo "=========================================="
if [ "$ALL_TYPES_PRESENT" = true ]; then
    echo "🎉 All major updates appear to be in place!"
    echo ""
    echo "🚀 Key Enhancements:"
    echo "   • Auto-initialization of all 4 life coverage types"
    echo "   • Enhanced policy creation with createLifePolicyWithAllCoverageTypes()"
    echo "   • Flexible coverage amount validation"
    echo "   • Updated UI with helpful hints and notices"
    echo "   • Standardized to 4 life coverage types (no life_cover)"
else
    echo "⚠️  Some updates may be missing. Please review the implementation."
fi

echo ""
echo "📋 Next Steps:"
echo "   1. Test policy creation in the frontend"
echo "   2. Verify life policies get all 4 coverage types"
echo "   3. Test auto-calculation of coverage amounts"
echo "   4. Confirm backend integration works properly"
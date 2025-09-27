import { QuestionnaireTemplate, VALID_CLAIM_COMBINATIONS } from "../models/QuestionnaireTemplate.js";
import asyncWrapper from "../middleware/async.js";
import { createCustomError } from "../errors/custom-error.js";

// Get all valid claim type and option combinations
const getValidCombinations = asyncWrapper(async (req, res) => {
  res.status(200).json({
    success: true,
    combinations: VALID_CLAIM_COMBINATIONS,
    totalCombinations: Object.keys(VALID_CLAIM_COMBINATIONS).reduce(
      (total, type) => total + VALID_CLAIM_COMBINATIONS[type].length, 0
    )
  });
});

// Get all templates
const getAllTemplates = asyncWrapper(async (req, res) => {
  const { claimType, claimOption, isActive } = req.query;

  let query = {};
  if (claimType) query.claimType = claimType;
  if (claimOption) query.claimOption = claimOption;
  if (isActive !== undefined) query.isActive = isActive === "true";

  const templates = await QuestionnaireTemplate.find(query)
    .populate("modifiedBy", "firstName lastName email")
    .sort({ claimType: 1, claimOption: 1 });

  const allCombinations = [];
  Object.keys(VALID_CLAIM_COMBINATIONS).forEach(type => {
    VALID_CLAIM_COMBINATIONS[type].forEach(option => {
      const existing = templates.find(t => t.claimType === type && t.claimOption === option);
      allCombinations.push({
        claimType: type,
        claimOption: option,
        hasTemplate: !!existing,
        template: existing || null
      });
    });
  });

  res.status(200).json({
    success: true,
    count: templates.length,
    templates,
    coverage: allCombinations,
    coverageStats: {
      total: allCombinations.length,
      covered: allCombinations.filter(c => c.hasTemplate).length,
      missing: allCombinations.filter(c => !c.hasTemplate).length
    }
  });
});

// Get template by ID
const getTemplateById = asyncWrapper(async (req, res, next) => {
  const { id } = req.params;

  const template = await QuestionnaireTemplate.findById(id)
    .populate("modifiedBy", "firstName lastName email");

  if (!template) {
    return next(createCustomError(`No template found with id: ${id}`, 404));
  }

  res.status(200).json({ success: true, template });
});

// Get template by claim type and option
const getTemplateByTypeAndOption = asyncWrapper(async (req, res, next) => {
  const { claimType, claimOption } = req.params;

  if (!VALID_CLAIM_COMBINATIONS[claimType]?.includes(claimOption)) {
    return next(createCustomError(`Invalid combination: ${claimType} - ${claimOption}`, 400));
  }

  const template = await QuestionnaireTemplate.findOne({
    claimType,
    claimOption,
    isActive: true
  }).populate("modifiedBy", "firstName lastName email");

  if (!template) {
    return next(createCustomError(`No active template found for ${claimType} - ${claimOption}`, 404));
  }

  res.status(200).json({ success: true, template });
});

// Create new template
const createTemplate = asyncWrapper(async (req, res, next) => {
  const { claimType, claimOption, title, description, sections } = req.body;
  const { userId } = req.user;

  if (!VALID_CLAIM_COMBINATIONS[claimType]?.includes(claimOption)) {
    return next(createCustomError(`Invalid combination: ${claimType} - ${claimOption}`, 400));
  }

  const existingTemplate = await QuestionnaireTemplate.findOne({ claimType, claimOption });
  if (existingTemplate) {
    return next(createCustomError(
      `Template already exists for ${claimType} - ${claimOption}. Use update instead.`,
      409
    ));
  }

  if (!sections || !Array.isArray(sections) || sections.length === 0) {
    return next(createCustomError("At least one section with questions is required", 400));
  }

  const processedSections = sections.map((section, sIndex) => ({
    ...section,
    order: section.order || (sIndex + 1),
    questions: (section.questions || []).map((q, qIndex) => ({
      ...q,
      order: q.order || (qIndex + 1)
    }))
  }));

  const template = await QuestionnaireTemplate.create({
    claimType,
    claimOption,
    title,
    description,
    sections: processedSections,
    modifiedBy: userId
  });

  res.status(201).json({
    success: true,
    message: "Template created successfully",
    template
  });
});

// Update template
const updateTemplate = asyncWrapper(async (req, res, next) => {
  const { id } = req.params;
  const { title, description, sections, isActive } = req.body;
  const { userId } = req.user;

  const template = await QuestionnaireTemplate.findById(id);
  if (!template) {
    return next(createCustomError(`No template found with id: ${id}`, 404));
  }

  let processedSections;
  if (sections && Array.isArray(sections)) {
    processedSections = sections.map((section, sIndex) => ({
      ...section,
      order: section.order || (sIndex + 1),
      questions: (section.questions || []).map((q, qIndex) => ({
        ...q,
        order: q.order || (qIndex + 1)
      }))
    }));
  }

  if (title !== undefined) template.title = title;
  if (description !== undefined) template.description = description;
  if (processedSections) template.sections = processedSections;
  if (isActive !== undefined) template.isActive = isActive;

  template.version += 1;
  template.modifiedBy = userId;
  template.lastModified = new Date();

  await template.save();

  res.status(200).json({
    success: true,
    message: "Template updated successfully",
    template
  });
});

// Delete (soft)
const deleteTemplate = asyncWrapper(async (req, res, next) => {
  const { id } = req.params;
  const { userId } = req.user;

  const template = await QuestionnaireTemplate.findById(id);
  if (!template) return next(createCustomError(`No template found with id: ${id}`, 404));

  template.isActive = false;
  template.modifiedBy = userId;
  template.lastModified = new Date();

  await template.save();

  res.status(200).json({ success: true, message: "Template deleted successfully", template });
});

// Hard delete
const hardDeleteTemplate = asyncWrapper(async (req, res, next) => {
  const { id } = req.params;
  const template = await QuestionnaireTemplate.findByIdAndDelete(id);
  if (!template) return next(createCustomError(`No template found with id: ${id}`, 404));

  res.status(200).json({ success: true, message: "Template permanently deleted", template });
});

// Toggle active status
const toggleTemplateStatus = asyncWrapper(async (req, res, next) => {
  const { id } = req.params;
  const { userId } = req.user;

  const template = await QuestionnaireTemplate.findById(id);
  if (!template) return next(createCustomError(`No template found with id: ${id}`, 404));

  template.isActive = !template.isActive;
  template.modifiedBy = userId;
  template.lastModified = new Date();

  await template.save();

  res.status(200).json({
    success: true,
    message: `Template ${template.isActive ? "activated" : "deactivated"} successfully`,
    template
  });
});

// Clone template
const cloneTemplate = asyncWrapper(async (req, res, next) => {
  const { id } = req.params;
  const { userId } = req.user;

  const original = await QuestionnaireTemplate.findById(id);
  if (!original) return next(createCustomError(`No template found with id: ${id}`, 404));

  const existingActive = await QuestionnaireTemplate.findOne({
    claimType: original.claimType,
    claimOption: original.claimOption,
    isActive: true,
    _id: { $ne: id }
  });
  if (existingActive) {
    return next(createCustomError(
      `An active template already exists for ${original.claimType} - ${original.claimOption}`,
      409
    ));
  }

  const cloned = new QuestionnaireTemplate({
    claimType: original.claimType,
    claimOption: original.claimOption,
    title: original.title,
    description: original.description,
    sections: original.sections.map((section, sIndex) => ({
      title: section.title,
      description: section.description,
      order: section.order || (sIndex + 1),
      questions: section.questions.map((q, qIndex) => ({
        questionId: q.questionId,
        questionText: q.questionText,
        questionType: q.questionType,
        options: q.options,
        isRequired: q.isRequired,
        validation: q.validation,
        order: q.order || (qIndex + 1),
        helpText: q.helpText
      }))
    })),
    version: original.version + 1,
    modifiedBy: userId,
    isActive: false
  });

  await cloned.save();

  res.status(201).json({
    success: true,
    message: "Template cloned successfully",
    template: cloned,
    originalTemplate: original
  });
});

// Get missing combinations
const getMissingCombinations = asyncWrapper(async (req, res) => {
  const existingTemplates = await QuestionnaireTemplate.find({}, "claimType claimOption");
  const missing = [];
  Object.keys(VALID_CLAIM_COMBINATIONS).forEach(type => {
    VALID_CLAIM_COMBINATIONS[type].forEach(option => {
      const exists = existingTemplates.some(t => t.claimType === type && t.claimOption === option);
      if (!exists) missing.push({ claimType: type, claimOption: option });
    });
  });

  res.status(200).json({ success: true, missingCombinations: missing, count: missing.length });
});

// Validate structure
const validateTemplate = asyncWrapper(async (req, res) => {
  const { claimType, claimOption, sections } = req.body;
  const errors = [];

  if (!VALID_CLAIM_COMBINATIONS[claimType]?.includes(claimOption)) {
    errors.push(`Invalid combination: ${claimType} - ${claimOption}`);
  }

  if (!sections || !Array.isArray(sections) || sections.length === 0) {
    errors.push("At least one section is required");
  } else {
    sections.forEach((section, sIndex) => {
      if (!section.title) errors.push(`Section ${sIndex + 1}: title is required`);
      if (!section.questions || section.questions.length === 0) {
        errors.push(`Section ${sIndex + 1}: must contain at least one question`);
      } else {
        section.questions.forEach((q, qIndex) => {
          if (!q.questionId) errors.push(`Section ${sIndex + 1}, Q${qIndex + 1}: questionId is required`);
          if (!q.questionText) errors.push(`Section ${sIndex + 1}, Q${qIndex + 1}: questionText is required`);
          if (!q.questionType) errors.push(`Section ${sIndex + 1}, Q${qIndex + 1}: questionType is required`);
        });
      }
    });
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, errors, isValid: false });
  }

  res.status(200).json({ success: true, message: "Template structure is valid", isValid: true });
});

export {
  getValidCombinations,
  getAllTemplates,
  getTemplateById,
  getTemplateByTypeAndOption,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  hardDeleteTemplate,
  toggleTemplateStatus,
  cloneTemplate,
  getMissingCombinations,
  validateTemplate
};

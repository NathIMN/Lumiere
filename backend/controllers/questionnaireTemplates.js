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

// Get all templates with combination status
const getAllTemplates = asyncWrapper(async (req, res) => {
  const { claimType, claimOption, isActive } = req.query;
  
  let query = {};
  if (claimType) query.claimType = claimType;
  if (claimOption) query.claimOption = claimOption;
  if (isActive !== undefined) query.isActive = isActive === 'true';

  const templates = await QuestionnaireTemplate.find(query)
    .populate('modifiedBy', 'firstName lastName email')
    .sort({ claimType: 1, claimOption: 1 });

  // Get template coverage status
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
    .populate('modifiedBy', 'firstName lastName email');
  
  if (!template) {
    return next(createCustomError(`No template found with id: ${id}`, 404));
  }

  res.status(200).json({
    success: true,
    template
  });
});

// Get template by claim type and option
const getTemplateByTypeAndOption = asyncWrapper(async (req, res, next) => {
  const { claimType, claimOption } = req.params;
  
  // Validate combination
  if (!VALID_CLAIM_COMBINATIONS[claimType]?.includes(claimOption)) {
    return next(createCustomError(`Invalid combination: ${claimType} - ${claimOption}`, 400));
  }

  const template = await QuestionnaireTemplate.findOne({
    claimType,
    claimOption,
    isActive: true
  }).populate('modifiedBy', 'firstName lastName email');
  
  if (!template) {
    return next(createCustomError(`No active template found for ${claimType} - ${claimOption}`, 404));
  }

  res.status(200).json({
    success: true,
    template
  });
});

// Create new template
const createTemplate = asyncWrapper(async (req, res, next) => {
  const { claimType, claimOption, title, description, questions } = req.body;
  const { userId } = req.user;

  // Validate claim type and option combination
  if (!VALID_CLAIM_COMBINATIONS[claimType]?.includes(claimOption)) {
    return next(createCustomError(`Invalid combination: ${claimType} - ${claimOption}`, 400));
  }

  // Check if template already exists for this combination
  const existingTemplate = await QuestionnaireTemplate.findOne({
    claimType,
    claimOption
  });

  if (existingTemplate) {
    return next(createCustomError(
      `Template already exists for ${claimType} - ${claimOption}. Use update instead.`, 
      409
    ));
  }

  // Validate questions array
  if (!questions || !Array.isArray(questions) || questions.length === 0) {
    return next(createCustomError("At least one question is required", 400));
  }

  // Validate question structure and assign order if not provided
  const processedQuestions = questions.map((question, index) => {
    if (!question.questionId || !question.questionText || !question.questionType) {
      throw new Error(`Question at index ${index} is missing required fields`);
    }
    
    return {
      ...question,
      order: question.order || (index + 1)
    };
  });

  const template = await QuestionnaireTemplate.create({
    claimType,
    claimOption,
    title,
    description,
    questions: processedQuestions,
    modifiedBy: userId
  });

  res.status(201).json({
    success: true,
    message: "Template created successfully",
    template
  });
});

// Update existing template
const updateTemplate = asyncWrapper(async (req, res, next) => {
  const { id } = req.params;
  const { title, description, questions, isActive } = req.body;
  const { userId } = req.user;

  const template = await QuestionnaireTemplate.findById(id);
  
  if (!template) {
    return next(createCustomError(`No template found with id: ${id}`, 404));
  }

  // Process questions if provided
  let processedQuestions;
  if (questions && Array.isArray(questions)) {
    processedQuestions = questions.map((question, index) => {
      if (!question.questionId || !question.questionText || !question.questionType) {
        throw new Error(`Question at index ${index} is missing required fields`);
      }
      
      return {
        ...question,
        order: question.order || (index + 1)
      };
    });
  }

  // Update fields
  if (title !== undefined) template.title = title;
  if (description !== undefined) template.description = description;
  if (processedQuestions) template.questions = processedQuestions;
  if (isActive !== undefined) template.isActive = isActive;
  
  // Increment version and update metadata
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

// Delete template (soft delete by setting isActive to false)
const deleteTemplate = asyncWrapper(async (req, res, next) => {
  const { id } = req.params;
  const { userId } = req.user;

  const template = await QuestionnaireTemplate.findById(id);
  
  if (!template) {
    return next(createCustomError(`No template found with id: ${id}`, 404));
  }

  // Soft delete by setting isActive to false
  template.isActive = false;
  template.modifiedBy = userId;
  template.lastModified = new Date();
  
  await template.save();

  res.status(200).json({
    success: true,
    message: "Template deleted successfully",
    template
  });
});

// Hard delete template (only for admin)
const hardDeleteTemplate = asyncWrapper(async (req, res, next) => {
  const { id } = req.params;

  const template = await QuestionnaireTemplate.findByIdAndDelete(id);
  
  if (!template) {
    return next(createCustomError(`No template found with id: ${id}`, 404));
  }

  res.status(200).json({
    success: true,
    message: "Template permanently deleted",
    template
  });
});

// Activate/Deactivate template
const toggleTemplateStatus = asyncWrapper(async (req, res, next) => {
  const { id } = req.params;
  const { userId } = req.user;

  const template = await QuestionnaireTemplate.findById(id);
  
  if (!template) {
    return next(createCustomError(`No template found with id: ${id}`, 404));
  }

  template.isActive = !template.isActive;
  template.modifiedBy = userId;
  template.lastModified = new Date();
  
  await template.save();

  res.status(200).json({
    success: true,
    message: `Template ${template.isActive ? 'activated' : 'deactivated'} successfully`,
    template
  });
});

// Clone template to create a new version
const cloneTemplate = asyncWrapper(async (req, res, next) => {
  const { id } = req.params;
  const { userId } = req.user;

  const originalTemplate = await QuestionnaireTemplate.findById(id);
  
  if (!originalTemplate) {
    return next(createCustomError(`No template found with id: ${id}`, 404));
  }

  // Check if there's already an active template for this combination
  const existingActive = await QuestionnaireTemplate.findOne({
    claimType: originalTemplate.claimType,
    claimOption: originalTemplate.claimOption,
    isActive: true,
    _id: { $ne: id }
  });

  if (existingActive) {
    return next(createCustomError(
      `An active template already exists for ${originalTemplate.claimType} - ${originalTemplate.claimOption}`,
      409
    ));
  }

  // Create clone with incremented version
  const clonedTemplate = new QuestionnaireTemplate({
    claimType: originalTemplate.claimType,
    claimOption: originalTemplate.claimOption,
    title: originalTemplate.title,
    description: originalTemplate.description,
    questions: originalTemplate.questions.map(q => ({
      questionId: q.questionId,
      questionText: q.questionText,
      questionType: q.questionType,
      options: q.options,
      isRequired: q.isRequired,
      validation: q.validation,
      order: q.order,
      helpText: q.helpText
    })),
    version: originalTemplate.version + 1,
    modifiedBy: userId,
    isActive: false // New clone starts as inactive
  });

  await clonedTemplate.save();

  res.status(201).json({
    success: true,
    message: "Template cloned successfully",
    template: clonedTemplate,
    originalTemplate: originalTemplate
  });
});

// Get missing template combinations
const getMissingCombinations = asyncWrapper(async (req, res) => {
  const existingTemplates = await QuestionnaireTemplate.find({}, 'claimType claimOption');
  
  const missingCombinations = [];
  Object.keys(VALID_CLAIM_COMBINATIONS).forEach(type => {
    VALID_CLAIM_COMBINATIONS[type].forEach(option => {
      const exists = existingTemplates.some(t => 
        t.claimType === type && t.claimOption === option
      );
      if (!exists) {
        missingCombinations.push({ claimType: type, claimOption: option });
      }
    });
  });

  res.status(200).json({
    success: true,
    missingCombinations,
    count: missingCombinations.length
  });
});

// Validate template structure
const validateTemplate = asyncWrapper(async (req, res, next) => {
  const { claimType, claimOption, questions } = req.body;

  const errors = [];

  // Validate combination
  if (!VALID_CLAIM_COMBINATIONS[claimType]?.includes(claimOption)) {
    errors.push(`Invalid combination: ${claimType} - ${claimOption}`);
  }

  // Validate questions
  if (!questions || !Array.isArray(questions) || questions.length === 0) {
    errors.push("At least one question is required");
  } else {
    questions.forEach((question, index) => {
      if (!question.questionId) {
        errors.push(`Question ${index + 1}: questionId is required`);
      }
      if (!question.questionText) {
        errors.push(`Question ${index + 1}: questionText is required`);
      }
      if (!question.questionType) {
        errors.push(`Question ${index + 1}: questionType is required`);
      }
      if (!["text", "number", "date", "boolean", "select", "multiselect", "file"].includes(question.questionType)) {
        errors.push(`Question ${index + 1}: invalid questionType`);
      }
      if ((question.questionType === "select" || question.questionType === "multiselect") && 
          (!question.options || !Array.isArray(question.options) || question.options.length === 0)) {
        errors.push(`Question ${index + 1}: options array is required for select/multiselect questions`);
      }
    });

    // Check for duplicate questionIds
    const questionIds = questions.map(q => q.questionId);
    const duplicates = questionIds.filter((id, index) => questionIds.indexOf(id) !== index);
    if (duplicates.length > 0) {
      errors.push(`Duplicate question IDs found: ${duplicates.join(', ')}`);
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      errors,
      isValid: false
    });
  }

  res.status(200).json({
    success: true,
    message: "Template structure is valid",
    isValid: true
  });
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
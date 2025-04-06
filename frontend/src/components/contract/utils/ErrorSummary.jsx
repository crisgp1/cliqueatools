import React from 'react';
import { IoWarningOutline } from 'react-icons/io5';

/**
 * Error Summary component for displaying validation errors in gov.uk style
 * 
 * @param {Object} props
 * @param {Object} props.errors - Object containing field-specific error messages
 * @param {boolean} props.visible - Whether the error summary is visible
 */
const ErrorSummary = ({ errors, visible }) => {
  if (!visible || !errors || Object.keys(errors).length === 0) {
    return null;
  }

  // Scroll to the field when clicking on an error link
  const handleErrorClick = (e, fieldId) => {
    e.preventDefault();
    const field = document.getElementById(fieldId);
    if (field) {
      field.focus();
      field.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <div 
      className="govuk-error-summary" 
      aria-labelledby="error-summary-title" 
      role="alert" 
      tabIndex="-1"
      data-module="govuk-error-summary"
    >
      <div className="bg-red-100 border-l-4 border-red-700 p-4 mb-6">
        <h2 className="govuk-error-summary__title text-lg font-bold flex items-center" id="error-summary-title">
          <IoWarningOutline className="h-6 w-6 mr-2 text-red-700" />
          Hay un problema
        </h2>
        <div className="govuk-error-summary__body">
          <p>Por favor corrija los siguientes errores:</p>
          <ul className="govuk-list govuk-error-summary__list">
            {Object.entries(errors).map(([fieldId, error]) => (
              <li key={fieldId} className="text-red-700">
                <a 
                  href={`#${fieldId}`} 
                  onClick={(e) => handleErrorClick(e, fieldId)}
                  className="text-red-700 hover:text-red-900 underline"
                >
                  {error}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

/**
 * Error Message component for displaying a single error message inline with a field
 * 
 * @param {Object} props
 * @param {string} props.message - The error message
 */
export const ErrorMessage = ({ message }) => {
  if (!message) {
    return null;
  }

  return (
    <span className="govuk-error-message flex items-center mt-1">
      <IoWarningOutline className="h-5 w-5 mr-1 text-red-700" />
      <span className="text-red-700 text-sm">{message}</span>
    </span>
  );
};

/**
 * Utility to add error classes to input elements
 * 
 * @param {string} baseClasses - Base classes for the element
 * @param {boolean} hasError - Whether the element has an error
 * @returns {string} - Combined classes
 */
export const addErrorClass = (baseClasses, hasError) => {
  if (!hasError) return baseClasses;
  return `${baseClasses} border-red-700 focus:border-red-700 focus:ring-red-700`;
};

export default ErrorSummary;
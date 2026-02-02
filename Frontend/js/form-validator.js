/**
 * Form Validation System
 * Provides client-side form validation with user-friendly error messages
 */
class FormValidator {
  static validators = {
    email: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    password: (value) =>
      value.length >= 8 &&
      /[a-z]/.test(value) &&
      /[A-Z]/.test(value) &&
      /\d/.test(value),
    phone: (value) => /^\d{10}$/.test(value.replace(/\D/g, "")),
    minLength: (value, min) => value.length >= min,
    required: (value) => value.trim().length > 0,
    match: (value, fieldId) =>
      value === document.getElementById(fieldId)?.value,
  };

  static validate(field, rules) {
    const value = field.value;
    const errors = [];

    for (const rule of rules) {
      const [ruleName, param] = rule.split(":");
      const validator = this.validators[ruleName];

      if (validator) {
        const isValid = param ? validator(value, param) : validator(value);
        if (!isValid) {
          errors.push(this.getErrorMessage(ruleName, field.name, param));
        }
      }
    }

    this.showErrors(field, errors);
    return errors.length === 0;
  }

  static getErrorMessage(rule, fieldName, param) {
    const messages = {
      required: `${this.formatFieldName(fieldName)} is required`,
      email: `Please enter a valid email address`,
      password: `Password must be at least 8 characters with uppercase, lowercase, and numbers`,
      phone: `Please enter a valid 10-digit phone number`,
      minLength: `${this.formatFieldName(fieldName)} must be at least ${param} characters`,
      match: `${this.formatFieldName(fieldName)} does not match`,
    };
    return messages[rule] || `Invalid ${fieldName}`;
  }

  static formatFieldName(name) {
    return (
      name.charAt(0).toUpperCase() + name.slice(1).replace(/([A-Z])/g, " $1")
    );
  }

  static showErrors(field, errors) {
    let errorContainer = field.parentElement.querySelector(".error-message");

    if (errors.length > 0) {
      if (!errorContainer) {
        errorContainer = document.createElement("small");
        errorContainer.className = "error-message d-block mt-2";
        field.parentElement.appendChild(errorContainer);
      }
      errorContainer.textContent = errors[0];
      errorContainer.style.display = "block";
      field.classList.add("error");
      field.classList.remove("valid");
    } else {
      if (errorContainer) {
        errorContainer.style.display = "none";
      }
      field.classList.remove("error");
      if (field.value.trim().length > 0) {
        field.classList.add("valid");
      }
    }
  }

  static validateForm(formElement) {
    const inputs = formElement.querySelectorAll(
      "input[data-validation], textarea[data-validation]",
    );
    let isValid = true;

    inputs.forEach((input) => {
      const rules = input
        .getAttribute("data-validation")
        .split(",")
        .map((r) => r.trim());
      if (!this.validate(input, rules)) {
        isValid = false;
      }
    });

    return isValid;
  }

  static clearForm(formElement) {
    formElement.querySelectorAll("input, textarea").forEach((field) => {
      field.value = "";
      field.classList.remove("error", "valid");
      const errorContainer =
        field.parentElement.querySelector(".error-message");
      if (errorContainer) {
        errorContainer.style.display = "none";
      }
    });
  }
}

// Initialize on DOM ready
document.addEventListener("DOMContentLoaded", function () {
  const forms = document.querySelectorAll("form[data-validate]");

  forms.forEach((form) => {
    const inputs = form.querySelectorAll(
      "input[data-validation], textarea[data-validation]",
    );

    // Real-time validation on blur
    inputs.forEach((input) => {
      input.addEventListener("blur", () => {
        const rules = input
          .getAttribute("data-validation")
          .split(",")
          .map((r) => r.trim());
        FormValidator.validate(input, rules);
      });

      // Clear error on focus
      input.addEventListener("focus", () => {
        const errorContainer =
          input.parentElement.querySelector(".error-message");
        if (errorContainer) {
          errorContainer.style.display = "none";
        }
      });
    });

    // Form submission validation
    form.addEventListener("submit", (e) => {
      if (!FormValidator.validateForm(form)) {
        e.preventDefault();
        if (typeof ToastNotification !== "undefined") {
          ToastNotification.error(
            "Please fix validation errors before submitting.",
          );
        }
      }
    });
  });
});

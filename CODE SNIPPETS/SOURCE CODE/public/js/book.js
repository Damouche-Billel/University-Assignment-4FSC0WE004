document.addEventListener('DOMContentLoaded', function() {
    // Get the form element
    const bookingForm = document.getElementById('bookingForm');
    
    // Add form submission event listener
    bookingForm.addEventListener('submit', function(event) {
        // Prevent the default form submission
        event.preventDefault();
        
        // Reset previous error messages
        clearErrorMessages();
        
        // Validate all form fields
        const isValid = validateForm();
        
        // If form is valid, submit it via AJAX
        if (isValid) {
            // Create form data object
            const formData = {
                name: document.getElementById('name').value.trim(),
                email: document.getElementById('email').value.trim(),
                age: document.getElementById('age').value.trim(),
                position: document.getElementById('position').value,
                experience: document.getElementById('experience').value.trim(),
                availability: document.getElementById('availability').value.trim()
            };
            
            // Send data to the server
            submitFormData(formData);
        }
    });
    
    // Add input event listeners for real-time validation
    const inputs = bookingForm.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        input.addEventListener('input', function() {
            validateField(this);
        });
        
        input.addEventListener('blur', function() {
            validateField(this);
        });
    });
    
    // Function to submit form data via AJAX
    function submitFormData(formData) {
        // Show loading state
        const submitButton = bookingForm.querySelector('button[type="submit"]');
        const originalButtonText = submitButton.textContent;
        submitButton.textContent = 'Submitting...';
        submitButton.disabled = true;
        
        // Send POST request to server
        fetch('/submit-trial', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Show success message
                showSuccessMessage(data.message);
                // Reset form
                bookingForm.reset();
            } else {
                // Show validation errors from server
                if (data.errors && Array.isArray(data.errors)) {
                    data.errors.forEach(error => {
                        const field = document.getElementById(error.param);
                        if (field) {
                            showError(field, error.msg);
                        }
                    });
                } else {
                    // Show general error message
                    showErrorMessage(data.message || 'An error occurred. Please try again.');
                }
            }
        })
        .catch(error => {
            console.error('Error submitting form:', error);
            showErrorMessage('Network error. Please check your connection and try again.');
        })
        .finally(() => {
            // Reset button state
            submitButton.textContent = originalButtonText;
            submitButton.disabled = false;
        });
    }
    
    // Function to validate the entire form
    function validateForm() {
        let isValid = true;
        
        // Validate name (required, at least 2 words)
        const nameInput = document.getElementById('name');
        const name = nameInput.value.trim();
        if (name === '') {
            showError(nameInput, 'Please enter your full name');
            isValid = false;
        } else if (name.split(' ').filter(word => word.length > 0).length < 2) {
            showError(nameInput, 'Please enter your first and last name');
            isValid = false;
        } else {
            clearError(nameInput);
        }
        
        // Validate email (required, valid email format)
        const emailInput = document.getElementById('email');
        const email = emailInput.value.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (email === '') {
            showError(emailInput, 'Please enter your email address');
            isValid = false;
        } else if (!emailRegex.test(email)) {
            showError(emailInput, 'Please enter a valid email address');
            isValid = false;
        } else {
            clearError(emailInput);
        }
        
        // Validate age (required, at least 16)
        const ageInput = document.getElementById('age');
        const age = parseInt(ageInput.value);
        if (isNaN(age) || ageInput.value.trim() === '') {
            showError(ageInput, 'Please enter your age');
            isValid = false;
        } else if (age < 16) {
            showError(ageInput, 'You must be at least 16 years old');
            isValid = false;
        } else {
            clearError(ageInput);
        }
        
        // Validate position (required)
        const positionInput = document.getElementById('position');
        if (positionInput.value === '') {
            showError(positionInput, 'Please select your preferred position');
            isValid = false;
        } else {
            clearError(positionInput);
        }
        
        // Validate experience (required, at least 20 characters)
        const experienceInput = document.getElementById('experience');
        const experience = experienceInput.value.trim();
        if (experience === '') {
            showError(experienceInput, 'Please enter your previous experience');
            isValid = false;
        } else if (experience.length < 20) {
            showError(experienceInput, 'Please provide more details about your experience');
            isValid = false;
        } else {
            clearError(experienceInput);
        }
        
        // Validate availability (required)
        const availabilityInput = document.getElementById('availability');
        if (availabilityInput.value.trim() === '') {
            showError(availabilityInput, 'Please provide your availability for the trial');
            isValid = false;
        } else {
            clearError(availabilityInput);
        }
        
        return isValid;
    }
    
    // Function to validate a single field (same as your original code)
    function validateField(field) {
        // ... (keeping existing field validation logic)
        switch(field.id) {
            case 'name':
                const name = field.value.trim();
                if (name === '') {
                    showError(field, 'Please enter your full name');
                } else if (name.split(' ').filter(word => word.length > 0).length < 2) {
                    showError(field, 'Please enter your first and last name');
                } else {
                    clearError(field);
                }
                break;
                
            case 'email':
                const email = field.value.trim();
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (email === '') {
                    showError(field, 'Please enter your email address');
                } else if (!emailRegex.test(email)) {
                    showError(field, 'Please enter a valid email address');
                } else {
                    clearError(field);
                }
                break;
                
            case 'age':
                const age = parseInt(field.value);
                if (isNaN(age) || field.value.trim() === '') {
                    showError(field, 'Please enter your age');
                } else if (age < 16) {
                    showError(field, 'You must be at least 16 years old');
                } else {
                    clearError(field);
                }
                break;
                
            case 'position':
                if (field.value === '') {
                    showError(field, 'Please select your preferred position');
                } else {
                    clearError(field);
                }
                break;
                
            case 'experience':
                const experience = field.value.trim();
                if (experience === '') {
                    showError(field, 'Please enter your previous experience');
                } else if (experience.length < 20) {
                    showError(field, 'Please provide more details about your experience');
                } else {
                    clearError(field);
                }
                break;
                
            case 'availability':
                if (field.value.trim() === '') {
                    showError(field, 'Please provide your availability for the trial');
                } else {
                    clearError(field);
                }
                break;
        }
    }
    
    // Function to show error message
    function showError(input, message) {
        input.classList.add('invalid');
        const errorElement = document.getElementById(input.id + 'Error');
        if (errorElement) {
            errorElement.textContent = message;
        }
    }
    
    // Function to clear error message
    function clearError(input) {
        input.classList.remove('invalid');
        const errorElement = document.getElementById(input.id + 'Error');
        if (errorElement) {
            errorElement.textContent = '';
        }
    }
    
    // Function to clear all error messages
    function clearErrorMessages() {
        const errorElements = document.querySelectorAll('.error-message');
        errorElements.forEach(element => {
            element.textContent = '';
        });
        
        const inputs = document.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.classList.remove('invalid');
        });
    }
    
    // Function to show success message
    function showSuccessMessage(message) {
        // Create success message if it doesn't exist
        let successMessage = document.querySelector('.success-message');
        if (!successMessage) {
            successMessage = document.createElement('div');
            successMessage.className = 'success-message';
            bookingForm.parentNode.insertBefore(successMessage, bookingForm.nextSibling);
        }
        
        successMessage.textContent = message || 'Thank you for your submission! We will contact you soon about your trial.';
        successMessage.style.display = 'block';
        
        // Hide success message after 5 seconds
        setTimeout(() => {
            successMessage.style.display = 'none';
        }, 5000);
    }
    
    // Function to show error message
    function showErrorMessage(message) {
        // Create error message container if it doesn't exist
        let errorContainer = document.querySelector('.form-error-container');
        if (!errorContainer) {
            errorContainer = document.createElement('div');
            errorContainer.className = 'form-error-container';
            errorContainer.style.backgroundColor = '#ff4d4d';
            errorContainer.style.color = 'white';
            errorContainer.style.padding = '10px';
            errorContainer.style.borderRadius = '5px';
            errorContainer.style.marginBottom = '20px';
            bookingForm.insertBefore(errorContainer, bookingForm.firstChild);
        }
        
        errorContainer.textContent = message;
        errorContainer.style.display = 'block';
        
        // Hide error message after 5 seconds
        setTimeout(() => {
            errorContainer.style.display = 'none';
        }, 5000);
    }
});
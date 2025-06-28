document.addEventListener('DOMContentLoaded', function() {
      // Form state
      const formData = {
        personal: {
          name: '',
          email: '',
          phone: ''
        },
        plan: {
          type: 'basic',
          billing: 'monthly'
        },
        addons: []
      };

      // Pricing data
      const pricingData = {
        plans: {
          basic: { monthly: 499, yearly: 4999 },
          standard: { monthly: 799, yearly: 7999 },
          pro: { monthly: 999, yearly: 9999 },
          premium: { monthly: 1499, yearly: 14999 },
          enterprise: { monthly: 2499, yearly: 24999 },
          student: { monthly: 299, yearly: 2999 }
        },
        addons: {
          online: { monthly: 99, yearly: 999, name: 'Online service' },
          storage: { monthly: 199, yearly: 1999, name: 'Larger storage' },
          profile: { monthly: 149, yearly: 1499, name: 'Customizable profile' },
          support: { monthly: 299, yearly: 2999, name: 'Premium support' },
          updates: { monthly: 249, yearly: 2499, name: 'Early updates' }
        }
      };

      // DOM elements
      const steps = document.querySelectorAll('.form-step');
      const stepIndicators = document.querySelectorAll('.step-indicator');
      const nextBtn = document.getElementById('next-btn');
      const prevBtn = document.getElementById('prev-btn');
      const confirmBtn = document.getElementById('confirm-btn');
      const homeBtn = document.getElementById('home-button');
      const billingToggle = document.getElementById('billing-toggle');
      const monthlyLabel = document.getElementById('monthly-label');
      const yearlyLabel = document.getElementById('yearly-label');
      const planCards = document.querySelectorAll('.plan-card');
      const addonCards = document.querySelectorAll('.addon-card');
      const changePlanBtn = document.getElementById('change-plan');
      const yearlyBadges = document.querySelectorAll('.yearly-badge');

      // Current step
      let currentStep = 1;

      // Initialize form
      function initForm() {
        // Set default plan
        planCards[0].classList.add('selected');
        updateSummary();

        // Add event listeners
        nextBtn.addEventListener('click', goToNextStep);
        prevBtn.addEventListener('click', goToPrevStep);
        confirmBtn.addEventListener('click', confirmSubscription);
        homeBtn.addEventListener('click', resetForm);
        billingToggle.addEventListener('change', toggleBilling);
        changePlanBtn.addEventListener('click', () => goToStep(2));

        // Plan selection
        planCards.forEach(card => {
          card.addEventListener('click', () => {
            // Add animation to the previously selected card
            const previousSelected = document.querySelector('.plan-card.selected');
            if (previousSelected) {
              previousSelected.classList.add('animate__animated', 'animate__fadeOut');
              setTimeout(() => {
                previousSelected.classList.remove('animate__animated', 'animate__fadeOut', 'selected');
              }, 300);
            }

            // Add animation to the newly selected card
            setTimeout(() => {
              card.classList.add('selected', 'animate__animated', 'animate__pulse');
              setTimeout(() => {
                card.classList.remove('animate__animated', 'animate__pulse');
              }, 800);
            }, 300);

            formData.plan.type = card.dataset.plan;
            updateSummary();
          });
        });

        // Add-on selection
        addonCards.forEach(card => {
          const checkbox = card.querySelector('input[type="checkbox"]');
          checkbox.addEventListener('change', () => {
            const addonId = card.dataset.addon;
            if (checkbox.checked) {
              card.classList.add('selected', 'animate__animated', 'animate__fadeIn');
              setTimeout(() => {
                card.classList.remove('animate__animated', 'animate__fadeIn');
              }, 500);
              
              if (!formData.addons.includes(addonId)) {
                formData.addons.push(addonId);
              }
            } else {
              card.classList.add('animate__animated', 'animate__fadeOut');
              setTimeout(() => {
                card.classList.remove('selected', 'animate__animated', 'animate__fadeOut');
              }, 500);
              
              formData.addons = formData.addons.filter(addon => addon !== addonId);
            }
            updateSummary();
          });

          // Also make the whole card clickable
          card.addEventListener('click', (e) => {
            if (e.target !== checkbox) {
              checkbox.checked = !checkbox.checked;
              const event = new Event('change');
              checkbox.dispatchEvent(event);
            }
          });
        });

        // Form validation
        const nameInput = document.getElementById('name');
        const emailInput = document.getElementById('email');
        const phoneInput = document.getElementById('phone');

        nameInput.addEventListener('input', validateName);
        emailInput.addEventListener('input', validateEmail);
        phoneInput.addEventListener('input', validatePhone);
      }

      // Validation functions
      function validateName() {
        const nameInput = document.getElementById('name');
        const nameError = document.getElementById('name-error');
        
        if (nameInput.value.trim() === '') {
          nameInput.setCustomValidity('This field is required');
          nameError.style.display = 'block';
          return false;
        } else {
          nameInput.setCustomValidity('');
          nameError.style.display = 'none';
          formData.personal.name = nameInput.value;
          return true;
        }
      }

      function validateEmail() {
        const emailInput = document.getElementById('email');
        const emailError = document.getElementById('email-error');
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        if (!emailRegex.test(emailInput.value)) {
          emailInput.setCustomValidity('Please enter a valid email');
          emailError.style.display = 'block';
          return false;
        } else {
          emailInput.setCustomValidity('');
          emailError.style.display = 'none';
          formData.personal.email = emailInput.value;
          document.querySelector('.user-email').textContent = emailInput.value;
          return true;
        }
      }

      function validatePhone() {
        const phoneInput = document.getElementById('phone');
        const phoneError = document.getElementById('phone-error');
        const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,3}[-\s.]?[0-9]{1,4}[-\s.]?[0-9]{1,4}$/;
        
        if (!phoneRegex.test(phoneInput.value)) {
          phoneInput.setCustomValidity('Please enter a valid phone number');
          phoneError.style.display = 'block';
          return false;
        } else {
          phoneInput.setCustomValidity('');
          phoneError.style.display = 'none';
          formData.personal.phone = phoneInput.value;
          return true;
        }
      }

      function validateStep1() {
        return validateName() && validateEmail() && validatePhone();
      }

      // Navigation functions
      function goToNextStep() {
        if (currentStep === 1 && !validateStep1()) {
          // Shake the form if validation fails
          const step1 = document.getElementById('step1');
          step1.classList.add('animate__animated', 'animate__shakeX');
          setTimeout(() => {
            step1.classList.remove('animate__animated', 'animate__shakeX');
          }, 800);
          return;
        }
        
        if (currentStep < 4) {
          goToStep(currentStep + 1);
        }
      }

      function goToPrevStep() {
        if (currentStep > 1) {
          goToStep(currentStep - 1);
        }
      }

      function goToStep(step) {
        // Hide current step with animation
        const currentStepElement = steps[currentStep - 1];
        currentStepElement.classList.add('animate__animated', 'animate__fadeOutLeft');
        
        setTimeout(() => {
          // Hide all steps
          steps.forEach(s => {
            s.classList.remove('active', 'animate__animated', 'animate__fadeOutLeft', 'animate__fadeInRight');
          });
          
          // Show the target step with animation
          steps[step - 1].classList.add('active', 'animate__animated', 'animate__fadeInRight');
          
          // Update step indicators with animation
          stepIndicators.forEach(indicator => {
            const indicatorStep = parseInt(indicator.dataset.step);
            indicator.classList.remove('active');
            
            if (indicatorStep === step) {
              setTimeout(() => {
                indicator.classList.add('active');
              }, 100);
            }
          });
          
          // Update navigation buttons
          updateNavigationButtons(step);
          
          // Update current step
          currentStep = step;
        }, 300);
      }

      function updateNavigationButtons(step) {
        if (step === 1) {
          prevBtn.classList.add('hidden');
          nextBtn.classList.remove('hidden');
          confirmBtn.classList.add('hidden');
        } else if (step === 4) {
          prevBtn.classList.remove('hidden');
          nextBtn.classList.add('hidden');
          confirmBtn.classList.remove('hidden');
        } else if (step === 5) {
          prevBtn.classList.add('hidden');
          nextBtn.classList.add('hidden');
          confirmBtn.classList.add('hidden');
          document.querySelector('.navigation-buttons').classList.add('hidden');
        } else {
          prevBtn.classList.remove('hidden');
          nextBtn.classList.remove('hidden');
          confirmBtn.classList.add('hidden');
        }
      }

      function confirmSubscription() {
        // Add animation to confirm button
        confirmBtn.classList.add('animate__animated', 'animate__pulse');
        
        setTimeout(() => {
          // Go to thank you step
          goToStep(5);
        }, 500);
      }

      function resetForm() {
        // Reset form data
        formData.personal = { name: '', email: '', phone: '' };
        formData.plan = { type: 'basic', billing: 'monthly' };
        formData.addons = [];
        
        // Reset form fields
        document.getElementById('name').value = '';
        document.getElementById('email').value = '';
        document.getElementById('phone').value = '';
        
        // Reset plan selection
        planCards.forEach((card, index) => {
          if (index === 0) {
            card.classList.add('selected');
          } else {
            card.classList.remove('selected');
          }
        });
        
        // Reset add-ons
        addonCards.forEach(card => {
          card.classList.remove('selected');
          card.querySelector('input[type="checkbox"]').checked = false;
        });
        
        // Reset billing
        if (billingToggle.checked) {
          billingToggle.checked = false;
          toggleBilling();
        }
        
        // Go to step 1
        goToStep(1);
        
        // Show navigation buttons
        document.querySelector('.navigation-buttons').classList.remove('hidden');
      }

      // Toggle billing (monthly/yearly)
      function toggleBilling() {
        const monthlyPrices = document.querySelectorAll('.monthly-price');
        const yearlyPrices = document.querySelectorAll('.yearly-price');
        const yearlyPromos = document.querySelectorAll('.yearly-promo');
        
        if (billingToggle.checked) {
          // Yearly
          formData.plan.billing = 'yearly';
          
          // Animate the transition
          monthlyPrices.forEach(el => {
            el.classList.add('animate__animated', 'animate__fadeOut');
            setTimeout(() => {
              el.classList.add('hidden');
              el.classList.remove('animate__animated', 'animate__fadeOut');
            }, 300);
          });
          
          setTimeout(() => {
            yearlyPrices.forEach(el => {
              el.classList.remove('hidden');
              el.classList.add('animate__animated', 'animate__fadeIn');
              setTimeout(() => {
                el.classList.remove('animate__animated', 'animate__fadeIn');
              }, 300);
            });
            
            yearlyPromos.forEach(el => {
              el.classList.remove('hidden');
              el.classList.add('animate__animated', 'animate__fadeIn');
              setTimeout(() => {
                el.classList.remove('animate__animated', 'animate__fadeIn');
              }, 300);
            });
            
            yearlyBadges.forEach(el => {
              el.classList.remove('hidden');
              el.classList.add('animate__animated', 'animate__bounceIn');
              setTimeout(() => {
                el.classList.remove('animate__animated', 'animate__bounceIn');
              }, 500);
            });
          }, 300);
          
          monthlyLabel.classList.remove('active');
          yearlyLabel.classList.add('active');
        } else {
          // Monthly
          formData.plan.billing = 'monthly';
          
          // Animate the transition
          yearlyPrices.forEach(el => {
            el.classList.add('animate__animated', 'animate__fadeOut');
            setTimeout(() => {
              el.classList.add('hidden');
              el.classList.remove('animate__animated', 'animate__fadeOut');
            }, 300);
          });
          
          yearlyPromos.forEach(el => {
            el.classList.add('animate__animated', 'animate__fadeOut');
            setTimeout(() => {
              el.classList.add('hidden');
              el.classList.remove('animate__animated', 'animate__fadeOut');
            }, 300);
          });
          
          yearlyBadges.forEach(el => {
            el.classList.add('animate__animated', 'animate__fadeOut');
            setTimeout(() => {
              el.classList.add('hidden');
              el.classList.remove('animate__animated', 'animate__fadeOut');
            }, 300);
          });
          
          setTimeout(() => {
            monthlyPrices.forEach(el => {
              el.classList.remove('hidden');
              el.classList.add('animate__animated', 'animate__fadeIn');
              setTimeout(() => {
                el.classList.remove('animate__animated', 'animate__fadeIn');
              }, 300);
            });
          }, 300);
          
          monthlyLabel.classList.add('active');
          yearlyLabel.classList.remove('active');
        }
        
        updateSummary();
      }

      // Format price with commas
      function formatPrice(price) {
        return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      }

      // Update summary
      function updateSummary() {
        const planName = document.getElementById('summary-plan-name');
        const billing = document.getElementById('summary-billing');
        const planPrice = document.getElementById('summary-plan-price');
        const addonsContainer = document.getElementById('summary-addons');
        const noAddonsMessage = document.getElementById('no-addons-message');
        const summaryPeriod = document.getElementById('summary-period');
        const summaryTotal = document.getElementById('summary-total');
        
        // Update plan info
        planName.textContent = formData.plan.type.charAt(0).toUpperCase() + formData.plan.type.slice(1);
        billing.textContent = formData.plan.billing.charAt(0).toUpperCase() + formData.plan.billing.slice(1);
        
        const planCost = pricingData.plans[formData.plan.type][formData.plan.billing];
        const priceSuffix = formData.plan.billing === 'monthly' ? '/mo' : '/yr';
        planPrice.textContent = `₹${formatPrice(planCost)}${priceSuffix}`;
        
        // Update add-ons
        addonsContainer.innerHTML = '';
        if (formData.addons.length === 0) {
          addonsContainer.appendChild(noAddonsMessage);
        } else {
          formData.addons.forEach(addon => {
            const addonCost = pricingData.addons[addon][formData.plan.billing];
            const addonName = pricingData.addons[addon].name;
            
            const addonElement = document.createElement('div');
            addonElement.className = 'flex justify-between items-center mb-3 summary-item';
            addonElement.innerHTML = `
              <p class="text-gray-500">${addonName}</p>
              <p class="text-[#02295a]">+₹${formatPrice(addonCost)}${priceSuffix}</p>
            `;
            
            addonsContainer.appendChild(addonElement);
          });
        }
        
        // Update total
        summaryPeriod.textContent = formData.plan.billing === 'monthly' ? 'month' : 'year';
        
        let totalCost = planCost;
        formData.addons.forEach(addon => {
          totalCost += pricingData.addons[addon][formData.plan.billing];
        });
        
        summaryTotal.textContent = `₹${formatPrice(totalCost)}${priceSuffix}`;
      }

      // Initialize the form
      initForm();
    });
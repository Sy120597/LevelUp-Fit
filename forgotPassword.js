// forgotPassword.js
const forgotForm = document.getElementById('forgotForm');
const fpEmail = document.getElementById('fpEmail');
const otpGroup = document.querySelector('.otp-group');
const otpInput = document.getElementById('otp');
const otpError = document.getElementById('otpError');
const newPasswordGroup = document.getElementById('newPasswordGroup');
const newPassword = document.getElementById('newPassword');
const passwordError = document.getElementById('passwordError');

let step = 1;

forgotForm.addEventListener('submit', async function(e) {
  e.preventDefault();
  
  const emailVal = fpEmail.value.trim();

  if (!emailVal) {
    alert("Enter your email.");
    return;
  }

  const users = JSON.parse(localStorage.getItem('users')) || [];
  const userIndex = users.findIndex(u => u.email === emailVal);

  if (userIndex === -1) {
    alert("Email not registered.");
    return;
  }

  // Step 1: Send OTP
  if (step === 1) {
    try {
      const res = await fetch('http://localhost:5000/send-otp', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ email: emailVal })
      });
      const data = await res.json();
      alert(data.message);
      otpGroup.classList.remove('hidden');
      step = 2;
    } catch(err) {
      alert("Failed to send OTP.");
    }
    return;
  }

  // Step 2: Verify OTP
  if (step === 2) {
    const enteredOTP = otpInput.value.trim();
    if (!enteredOTP) {
      otpError.textContent = "Enter OTP.";
      otpError.classList.remove('hidden');
      return;
    }

    try {
      const res = await fetch('http://localhost:5000/verify-otp', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ email: emailVal, otp: enteredOTP })
      });

      const data = await res.json();
      if (data.success) {
        otpError.classList.add('hidden');
        newPasswordGroup.classList.remove('hidden');
        step = 3;
      } else {
        otpError.textContent = data.message;
        otpError.classList.remove('hidden');
      }
    } catch(err) {
      otpError.textContent = "Failed to verify OTP.";
      otpError.classList.remove('hidden');
    }
    return;
  }

  // Step 3: Reset password
  if (step === 3) {
    const newPassVal = newPassword.value.trim();
    if (newPassVal.length < 6) {
      passwordError.classList.remove('hidden');
      return;
    }
    users[userIndex].password = newPassVal;
    localStorage.setItem('users', JSON.stringify(users));
    alert("Password reset successful!");
    window.location.href = 'login.html';
  }
});

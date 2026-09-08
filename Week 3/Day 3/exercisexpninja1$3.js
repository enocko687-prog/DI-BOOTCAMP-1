// Exercise 1: Calculate the tip
function calculateTip() {
  const billAmount = Number(document.getElementById('billAmt')?.value || 0);
  const serviceQuality = Number(document.getElementById('serviceQual')?.value || 0);
  let numberOfPeople = Number(document.getElementById('numOfPeople')?.value || 1);
  const totalTip = document.getElementById('totalTip');
  const tip = document.getElementById('tip');
  const each = document.getElementById('each');

  if (serviceQuality === 0 || billAmount === 0 || Number.isNaN(billAmount) || Number.isNaN(serviceQuality)) {
    alert('Please enter valid bill amount and service quality.');
    return;
  }

  if (!document.getElementById('numOfPeople')?.value || numberOfPeople < 1) {
    numberOfPeople = 1;
    if (each) each.style.display = 'none';
  } else if (each) {
    each.style.display = 'block';
  }

  const total = (billAmount * serviceQuality) / numberOfPeople;

  if (totalTip) totalTip.style.display = 'block';
  if (tip) tip.textContent = total.toFixed(2);
}

const calculateButton = document.getElementById('calculate');
if (calculateButton) {
  calculateButton.onclick = calculateTip;
}

const totalTip = document.getElementById('totalTip');
if (totalTip) {
  totalTip.style.display = 'none';
}

// Exercise 2: Validate the email
function isValidEmail(email) {
  const atIndex = email.indexOf('@');
  const dotIndex = email.lastIndexOf('.');

  if (!email || atIndex <= 0 || dotIndex <= atIndex + 1 || dotIndex === email.length - 1) {
    return false;
  }

  return true;
}

function isValidEmailRegex(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

const emailForm = document.querySelector('form');
if (emailForm) {
  emailForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const emailInput = document.getElementById('email');
    if (!emailInput) return;

    const value = emailInput.value.trim();
    if (isValidEmail(value)) {
      console.log('Valid email (without regex)');
    } else {
      console.log('Invalid email (without regex)');
    }

    if (isValidEmailRegex(value)) {
      console.log('Valid email (with regex)');
    } else {
      console.log('Invalid email (with regex)');
    }
  });
}

// Exercise 3: Get the user's geolocation coordinates
const geoButton = document.getElementById('geoButton');
if (geoButton) {
  geoButton.addEventListener('click', () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        console.log('Latitude:', latitude);
        console.log('Longitude:', longitude);
      }, (error) => {
        console.log('Geolocation error:', error.message);
      });
    } else {
      console.log('Geolocation is not supported by this browser.');
    }
  });
}

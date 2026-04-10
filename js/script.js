let player;
// ฟังก์ชัน API ต้องอยู่บน Global Scope (window) เพื่อให้ Google Script เรียกหาเจอ
window.onYouTubeIframeAPIReady = function() {
  if (typeof YT !== 'undefined' && YT.Player) {
    player = new YT.Player('player', {
      height: '50%', // ปรับเป็น 100% เพื่อความสวยงาม
      width: '50%', // ปรับเป็น 100% เพื่อความสวยงาม
      videoId: 'EASQQvYIFjY', // ID วิดีโอเริ่มต้น
      events: {
        'onStateChange': onPlayerStateChange
      }
    });
  }
};

function onPlayerStateChange(event) {
    // ฟังก์ชันเสริมเผื่อต้องการจัดการสถานะวิดีโอ (ว่างไว้ก่อนได้)
}

document.addEventListener('DOMContentLoaded', () => {
  initQRSwitcher();
  initTaxModal();
  initBackToTop();
  initPrayerTimes();
  initMonthlyPrayerTimes();
  initCurrentDate();
  initGallery();
  initRegistration();
  initLoginSidebar();
  setupVideoButtons();
  toggleBook(false);
  initHeroSlider();
});

// ==============================
// LOGIN SIDEBAR TOGGLE
// ==============================
function initLoginSidebar() {

  const btn = document.getElementById("toggleLogin");
  const sidebar = document.getElementById("loginSidebar");
  const content = document.getElementById("pageContent");

  if (!btn || !sidebar || !content) return;

  btn.addEventListener("click", () => {
    sidebar.classList.toggle("active");
    content.classList.toggle("shift");
    btn.classList.toggle("move");
  });
}

// ==============================
// PDF BOOK VIEWER
// ==============================
function toggleBook(isOpen) {
  const cover = document.getElementById('bookCover');
  const viewer = document.getElementById('pdfViewer');
  const pdfFrame = document.getElementById('pdfFrame');
  
  // ระบุชื่อไฟล์ PDF ของคุณที่นี่ (ต้องวางไฟล์ไว้ในโฟลเดอร์เดียวกับเว็บ หรือระบุ Path ให้ถูก)
  const pdfUrl = '../documents/mybook.pdf'; // เปลี่ยนเป็น URL ของไฟล์ PDF ที่ต้องการ

  if (isOpen) {
    cover.style.display = 'none';
    viewer.style.display = 'block';
    
    // โหลดไฟล์เมื่อกดเปิดเท่านั้น (ประหยัดเน็ต)
    if (!pdfFrame.getAttribute('src')) {
      pdfFrame.src = pdfUrl;
    }
  } else {
    cover.style.display = 'block';
    viewer.style.display = 'none';
  }
}

// ==============================
// YOUTUBE VIDEO SWITCHER
// ==============================
function setupVideoButtons() {
  const buttons = document.querySelectorAll('.video-buttons button');
  buttons.forEach(button => {
    button.addEventListener('click', () => {
      const videoId = button.getAttribute('data-video');
      if (player && typeof player.loadVideoById === 'function') {
        player.loadVideoById(videoId);
      } else {
        console.warn('YouTube Player ยังไม่พร้อมใช้งาน');
      }
    });
  });
}

// ==============================
// QR SWITCHER
// ==============================
function initQRSwitcher() {
  window.changeQR = function (bank) {
    const img = document.getElementById('qrCodeImage');
    const buttons = document.querySelectorAll('.bank-switcher button');
    if (!img) return;

    buttons.forEach(b => b.classList.remove('active'));
    const btn = document.querySelector(
      `.bank-switcher button[onclick="changeQR('${bank}')"]`
    );
    if (btn) btn.classList.add('active');

    const map = {
      kbank: { src: '../img/qr.png', alt: 'QR Code ธนาคารกสิกรไทย' },
      bbl: { src: '../img/qr2.png', alt: 'QR Code ธนาคารกรุงเทพ' }
    };

    if (map[bank]) {
      img.src = map[bank].src;
      img.alt = map[bank].alt;
    }
  };
}

// ==============================
// TAX RECEIPT MODAL
// ==============================
function initTaxModal() {
  const btn = document.getElementById('taxReceiptBtn');
  const modal = document.getElementById('taxReceiptModal');
  const close = document.getElementById('modalClose');
  const form = document.getElementById('taxForm');

  if (!btn || !modal || !close || !form) return;

  const open = () => {
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
  };

  const hide = () => {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
  };

  btn.addEventListener('click', open);
  close.addEventListener('click', hide);
  modal.addEventListener('click', e => e.target === modal && hide());

  form.addEventListener('submit', e => {
    e.preventDefault();
    alert('ส่งคำขอใบลดหย่อนเรียบร้อยแล้ว ทีมงานจะติดต่อกลับผ่านอีเมล');
    hide();
  });
}

// ==============================
// BACK TO TOP
// ==============================
function initBackToTop() {
  const btn = document.getElementById('backToTop');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    btn.classList.toggle('show', window.scrollY > 300);
  });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// ==============================
// PRAYER TIME (DAILY)
// ==============================
const PRAYER_API =
  'https://api.aladhan.com/v1/timingsByCity?city=Bangkok&country=Thailand&method=2';

function cleanTime(t) {
  return t.replace(/\s*\(.+\)/, '');
}

function formatMinutes(min) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${h ? h + ' ชั่วโมง ' : ''}${m} นาที`;
}

function findNextPrayer(times) {
  const now = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const order = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

  const map = {};
  order.forEach(p => {
    const [h, m] = cleanTime(times[p]).split(':').map(Number);
    map[p] = h * 60 + m;
  });

  let next = order.find(p => map[p] > nowMin) || 'Fajr';
  let diff = next === 'Fajr'
    ? 1440 - nowMin + map.Fajr
    : map[next] - nowMin;

  return { next, diff };
}

async function initPrayerTimes() {
  const widget = document.querySelector('.highlight-widget');
  if (!widget) return;

  try {
    const res = await fetch(PRAYER_API);
    const json = await res.json();
    const times = json.data.timings;

    const { next, diff } = findNextPrayer(times);
    const text = document.querySelector('.highlight-widget p');

    const th = {
      Fajr: 'ซุบฮิ',
      Dhuhr: 'ดุฮ์ริ',
      Asr: 'อัศริ',
      Maghrib: 'มัฆริบ',
      Isha: 'อิชาอ์'
    };

    if (text) {
      text.innerHTML =
        `<strong>เวลาถัดไป:</strong> ${th[next]} ในอีก ${formatMinutes(diff)}`;
    }

    ['Fajr','Dhuhr','Asr','Maghrib','Isha'].forEach(p => {
      const cell = document.querySelector(`[data-prayer="${p}"]`);
      if (!cell) return;
      cell.textContent = cleanTime(times[p]);
      cell.classList.toggle('next-time', p === next);
    });

  } catch (e) {
    console.error(e);
  }
}

// ==============================
// PRAYER TIME (MONTHLY)
// ==============================
async function initMonthlyPrayerTimes() {
  const body = document.getElementById('monthlyTableBody');
  const label = document.getElementById('currentMonth');
  if (!body || !label) return;

  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();
  const today = now.getDate();

  const thaiMonths = [
    'มกราคม','กุมภาพันธ์','มีนาคม','เมษายน','พฤษภาคม','มิถุนายน',
    'กรกฎาคม','สิงหาคม','กันยายน','ตุลาคม','พฤศจิกายน','ธันวาคม'
  ];

  label.textContent = `${thaiMonths[month - 1]} ${year}`;

  const url =
    `https://api.aladhan.com/v1/calendarByCity?city=Bangkok&country=Thailand&method=2&month=${month}&year=${year}`;

  try {
    const res = await fetch(url);
    const json = await res.json();

    body.innerHTML = json.data.map((d, i) => `
      <tr class="${i + 1 === today ? 'today-highlight' : ''}">
        <td>${i + 1}</td>
        <td>${cleanTime(d.timings.Fajr)}</td>
        <td>${cleanTime(d.timings.Sunrise)}</td>
        <td>${cleanTime(d.timings.Dhuhr)}</td>
        <td>${cleanTime(d.timings.Asr)}</td>
        <td>${cleanTime(d.timings.Maghrib)}</td>
        <td>${cleanTime(d.timings.Isha)}</td>
      </tr>
    `).join('');

  } catch {
    body.innerHTML = `<tr><td colspan="7">โหลดข้อมูลไม่สำเร็จ</td></tr>`;
  }
}

// ==============================
// CURRENT DATE (THAI)
// ==============================
function initCurrentDate() {
  const el = document.getElementById('currentDate');
  if (!el) return;

  const d = new Date();
  const days = ['อาทิตย์','จันทร์','อังคาร','พุธ','พฤหัสบดี','ศุกร์','เสาร์'];
  const months = [
    'มกราคม','กุมภาพันธ์','มีนาคม','เมษายน','พฤษภาคม','มิถุนายน',
    'กรกฎาคม','สิงหาคม','กันยายน','ตุลาคม','พฤศจิกายน','ธันวาคม'
  ];

  el.textContent =
    `${days[d.getDay()]} ${d.getDate()} ${months[d.getMonth()]} พ.ศ. ${d.getFullYear() + 543}`;
}

// ==============================
// GALLERY POPUP
// ==============================
function initGallery() {
  const popup = document.getElementById('popup');
  const img = document.getElementById('popupImg');
  const close = document.getElementById('closeBtn');
  const thumbs = document.querySelectorAll('.gallery img');

  if (!popup || !img || !close || thumbs.length === 0) return;

  thumbs.forEach(t =>
    t.addEventListener('click', () => {
      img.src = t.src;
      popup.style.display = 'flex';
    })
  );

  close.addEventListener('click', () => popup.style.display = 'none');
  popup.addEventListener('click', e => e.target === popup && (popup.style.display = 'none'));
}

// REGISTRATION FORM
function initRegistration() {
  // ตั้งค่าวันเกิดสูงสุดเป็นวันปัจจุบัน
  const birthDateInput = document.getElementById('birthDate');
  if (birthDateInput) {
    const today = new Date().toISOString().split('T')[0];
    birthDateInput.max = today;
  }
  // การตรวจสอบฟอร์มสมัครสมาชิก
  const registerForm = document.getElementById('registerForm');
  if (registerForm) {
    registerForm.addEventListener('submit', handleRegisterSubmit);
  }
  // ปุ่มยกเลิก
  const cancelButton = document.querySelector('.btn-secondary');
  if (cancelButton) {
    cancelButton.addEventListener('click', handleCancel);
  }
  // การตรวจสอบข้อมูลแบบ real-time
  setupRealTimeValidation();
  // จัดรูปแบบเบอร์โทรศัพท์
  formatPhoneNumber();
  // ตรวจสอบชื่อผู้ใช้ซ้ำ
  checkUsernameAvailability();
}
/*จัดการการส่งฟอร์มสมัครสมาชิก*/
function handleRegisterSubmit(event) {
  event.preventDefault();
  
  const formData = getFormData();
  const validation = validateFormData(formData);
  
  if (validation.isValid) {
    submitRegistration(formData);
  } else {
    showValidationErrors(validation.errors);
  }
}

/*ดึงข้อมูลจากฟอร์ม*/
function getFormData() {
  return {
    firstName: document.getElementById('firstName')?.value.trim() || '',
    lastName: document.getElementById('lastName')?.value.trim() || '',
    username: document.getElementById('username')?.value.trim() || '',
    password: document.getElementById('password')?.value || '',
    confirmPassword: document.getElementById('confirmPassword')?.value || '',
    email: document.getElementById('email')?.value.trim() || '',
    phone: document.getElementById('phone')?.value.trim() || '',
    address: document.getElementById('address')?.value.trim() || '',
    birthDate: document.getElementById('birthDate')?.value || '',
    gender: document.getElementById('gender')?.value || ''
  };
}

/*ตรวจสอบความถูกต้องของข้อมูล*/
function validateFormData(data) {
  const errors = [];
  if (!data.firstName) {
    errors.push('กรุณากรอกชื่อจริง');
  } else if (data.firstName.length < 2) {
    errors.push('ชื่อจริงต้องมีความยาวอย่างน้อย 2 ตัวอักษร');
  }

  if (!data.lastName) {
    errors.push('กรุณากรอกนามสกุล');
  }

  if (!data.username) {
    errors.push('กรุณากรอกชื่อผู้ใช้');
  } else if (data.username.length < 6 || data.username.length > 20) {
    errors.push('ชื่อผู้ใช้ต้องมีความยาว 6-20 ตัวอักษร');
  } else if (!/^[a-zA-Z0-9]+$/.test(data.username)) {
    errors.push('ชื่อผู้ใช้สามารถใช้ได้เฉพาะตัวอักษรภาษาอังกฤษและตัวเลข');
  }

  if (!data.password) {
    errors.push('กรุณากรอกรหัสผ่าน');
  } else if (data.password.length < 8) {
    errors.push('รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร');
  }

  if (!data.confirmPassword) {
    errors.push('กรุณายืนยันรหัสผ่าน');
  } else if (data.password !== data.confirmPassword) {
    errors.push('รหัสผ่านและยืนยันรหัสผ่านไม่ตรงกัน');
  }

  if (!data.email) {
    errors.push('กรุณากรอกอีเมล');
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push('กรุณากรอกอีเมลให้ถูกต้อง');
  }
  
  if (!data.phone) {
    errors.push('กรุณากรอกเบอร์โทรศัพท์');
  } else {
    const phoneDigits = data.phone.replace(/\D/g, '');
    if (phoneDigits.length !== 10) {
      errors.push('เบอร์โทรศัพท์ต้องมี 10 หลัก');
    }
  }
  
  if (data.birthDate) {
    const birthDate = new Date(data.birthDate);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    
    if (age < 13) {
      errors.push('ต้องมีอายุอย่างน้อย 13 ปีขึ้นไป');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors: errors
  };
}

/*แสดงข้อผิดพลาดการตรวจสอบ*/
function showValidationErrors(errors) {
  const oldErrors = document.querySelectorAll('.error-message');
  oldErrors.forEach(error => error.remove());
  
  if (errors.length > 0) {
    const errorContainer = document.createElement('div');
    errorContainer.className = 'error-container';
    errorContainer.style.cssText = `
      background-color: #ffe6e6;
      border: 1px solid #e74c3c;
      border-radius: 5px;
      padding: 1rem;
      margin-bottom: 1.5rem;
      color: #c0392b;
    `;
    
    const errorTitle = document.createElement('h4');
    errorTitle.textContent = 'พบข้อผิดพลาด:';
    errorTitle.style.marginBottom = '0.5rem';
    errorTitle.style.color = '#c0392b';
    
    const errorList = document.createElement('ul');
    errorList.style.margin = '0';
    errorList.style.paddingLeft = '1.5rem';
    
    errors.forEach(error => {
      const li = document.createElement('li');
      li.textContent = error;
      errorList.appendChild(li);
    });
    
    errorContainer.appendChild(errorTitle);
    errorContainer.appendChild(errorList);
    
    const form = document.querySelector('.registration-form');
    if (form) {
      form.insertBefore(errorContainer, form.firstChild);
      errorContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
}

/*ส่งข้อมูลการสมัครสมาชิก*/
function submitRegistration(formData) {
  const submitButton = document.querySelector('.btn-primary');
  if (!submitButton) return;
  
  const originalText = submitButton.textContent;
  submitButton.textContent = 'กำลังสมัครสมาชิก...';
  submitButton.disabled = true;
  
  setTimeout(() => {
    const users = JSON.parse(localStorage.getItem('mosque_users') || '[]');
    
    const isDuplicate = users.some(user => 
      user.username === formData.username || user.email === formData.email
    );
    
    if (isDuplicate) {
      showValidationErrors(['ชื่อผู้ใช้หรืออีเมลนี้มีผู้ใช้งานแล้ว']);
      submitButton.textContent = originalText;
      submitButton.disabled = false;
      return;
    }
    
    const newUser = {
      id: Date.now(),
      ...formData,
      password: '********',
      registeredAt: new Date().toISOString(),
      status: 'pending'
    };
    
    users.push(newUser);
    localStorage.setItem('mosque_users', JSON.stringify(users));
    
    showSuccessMessage();
    
    submitButton.textContent = originalText;
    submitButton.disabled = false;
    
  }, 1500);
}

/*แสดงข้อความสำเร็จ*/
function showSuccessMessage() {
  const modal = document.createElement('div');
  modal.className = 'success-modal';
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  `;
  
  const modalContent = document.createElement('div');
  modalContent.style.cssText = `
    background: white;
    padding: 2.5rem;
    border-radius: 10px;
    text-align: center;
    max-width: 500px;
    width: 90%;
    box-shadow: 0 5px 20px rgba(0,0,0,0.3);
  `;
  
  const successIcon = document.createElement('div');
  successIcon.innerHTML = '✓';
  successIcon.style.cssText = `
    font-size: 4rem;
    color: #27ae60;
    margin-bottom: 1.5rem;
  `;
  
  const title = document.createElement('h2');
  title.textContent = 'สมัครสมาชิกสำเร็จ!';
  title.style.color = '#27ae60';
  title.style.marginBottom = '1rem';
  
  const message = document.createElement('p');
  message.textContent = 'ขอบคุณที่สมัครสมาชิกกับมัสยิดบ้านสมเด็จ กรุณารอการยืนยันจากผู้ดูแลระบบภายใน 24 ชั่วโมง';
  message.style.marginBottom = '1.5rem';
  message.style.lineHeight = '1.6';
  
  const okButton = document.createElement('button');
  okButton.textContent = 'ตกลง';
  okButton.className = 'btn btn-primary';
  okButton.style.padding = '0.8rem 2rem';
  okButton.onclick = function() {
    document.body.removeChild(modal);
    window.location.href = 'index.html';
  };
  
  modalContent.appendChild(successIcon);
  modalContent.appendChild(title);
  modalContent.appendChild(message);
  modalContent.appendChild(okButton);
  modal.appendChild(modalContent);
  
  document.body.appendChild(modal);
}

/*จัดการปุ่มยกเลิก*/
function handleCancel() {
  const confirmCancel = confirm('คุณต้องการยกเลิกการสมัครสมาชิกหรือไม่? ข้อมูลที่กรอกไว้จะหายไป');
  if (confirmCancel) {
    window.location.href = 'index.html';
  }
}

/*ตั้งค่าการตรวจสอบแบบ real-time*/
function setupRealTimeValidation() {
  const inputs = document.querySelectorAll('input, select, textarea');
  
  inputs.forEach(input => {
    input.addEventListener('blur', function() {
      validateField(this);
    });
    
    input.addEventListener('input', function() {
      clearFieldError(this);
    });
  });
  
  const passwordInput = document.getElementById('password');
  const confirmPasswordInput = document.getElementById('confirmPassword');
  
  if (passwordInput && confirmPasswordInput) {
    confirmPasswordInput.addEventListener('input', function() {
      if (passwordInput.value && this.value) {
        if (passwordInput.value !== this.value) {
          showFieldError(this, 'รหัสผ่านไม่ตรงกัน');
        } else {
          clearFieldError(this);
        }
      }
    });
  }
}

/*ตรวจสอบฟิลด์เฉพาะ*/
function validateField(field) {
  const value = field.value.trim();
  const fieldId = field.id;
  
  switch (fieldId) {
    case 'firstName':
      if (!value) {
        showFieldError(field, 'กรุณากรอกชื่อจริง');
      } else if (value.length < 2) {
        showFieldError(field, 'ชื่อจริงต้องมีความยาวอย่างน้อย 2 ตัวอักษร');
      }
      break;
      
    case 'lastName':
      if (!value) {
        showFieldError(field, 'กรุณากรอกนามสกุล');
      }
      break;
      
    case 'username':
      if (!value) {
        showFieldError(field, 'กรุณากรอกชื่อผู้ใช้');
      } else if (value.length < 6 || value.length > 20) {
        showFieldError(field, 'ชื่อผู้ใช้ต้องมีความยาว 6-20 ตัวอักษร');
      } else if (!/^[a-zA-Z0-9]+$/.test(value)) {
        showFieldError(field, 'ใช้ได้เฉพาะตัวอักษรภาษาอังกฤษและตัวเลข');
      }
      break;
      
    case 'email':
      if (!value) {
        showFieldError(field, 'กรุณากรอกอีเมล');
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        showFieldError(field, 'กรุณากรอกอีเมลให้ถูกต้อง');
      }
      break;
      
    case 'phone':
      if (!value) {
        showFieldError(field, 'กรุณากรอกเบอร์โทรศัพท์');
      } else {
        const phoneDigits = value.replace(/\D/g, '');
        if (phoneDigits.length !== 10) {
          showFieldError(field, 'เบอร์โทรศัพท์ต้องมี 10 หลัก');
        }
      }
      break;
  }
}

/*แสดงข้อผิดพลาดสำหรับฟิลด์เฉพาะ*/
function showFieldError(field, message) {
  clearFieldError(field);
  
  field.style.borderColor = '#e74c3c';
  field.style.boxShadow = '0 0 0 2px rgba(231, 76, 60, 0.1)';
  
  const errorSpan = document.createElement('span');
  errorSpan.className = 'field-error-message';
  errorSpan.textContent = message;
  errorSpan.style.cssText = `
    display: block;
    color: #e74c3c;
    font-size: 0.85rem;
    margin-top: 0.3rem;
  `;
  
  field.parentNode.appendChild(errorSpan);
}

/*ลบข้อผิดพลาดของฟิลด์*/
function clearFieldError(field) {
  field.style.borderColor = '';
  field.style.boxShadow = '';
  
  const errorSpan = field.parentNode.querySelector('.field-error-message');
  if (errorSpan) {
    errorSpan.remove();
  }
}

/*จัดรูปแบบเบอร์โทรศัพท์ขณะพิมพ์*/
function formatPhoneNumber() {
  const phoneInput = document.getElementById('phone');
  if (phoneInput) {
    phoneInput.addEventListener('input', function(e) {
      let value = e.target.value.replace(/\D/g, '');
      
      if (value.length > 3 && value.length <= 6) {
        value = value.replace(/(\d{3})(\d+)/, '$1-$2');
      } else if (value.length > 6) {
        value = value.replace(/(\d{3})(\d{3})(\d+)/, '$1-$2-$3');
      }
      
      e.target.value = value;
    });
  }
}

/*ตรวจสอบชื่อผู้ใช้ซ้ำแบบ real-time*/
function checkUsernameAvailability() {
  const usernameInput = document.getElementById('username');
  
  if (usernameInput) {
    let timeout = null;
    
    usernameInput.addEventListener('input', function() {
      clearTimeout(timeout);
      
      const username = this.value.trim();
      
      timeout = setTimeout(() => {
        if (username.length >= 6 && /^[a-zA-Z0-9]+$/.test(username)) {
          const users = JSON.parse(localStorage.getItem('mosque_users') || '[]');
          const isTaken = users.some(user => user.username === username);
          
          if (isTaken) {
            showFieldError(this, 'ชื่อผู้ใช้นี้มีผู้ใช้งานแล้ว');
          } else {
            const availabilitySpan = document.createElement('span');
            availabilitySpan.className = 'availability-message';
            availabilitySpan.textContent = 'ชื่อผู้ใช้นี้สามารถใช้งานได้';
            availabilitySpan.style.cssText = `
              display: block;
              color: #27ae60;
              font-size: 0.85rem;
              margin-top: 0.3rem;
            `;
            
            const oldSpan = this.parentNode.querySelector('.availability-message');
            if (oldSpan) oldSpan.remove();
            
            this.parentNode.appendChild(availabilitySpan);
          }
        }
      }, 500);
    });
  }
}

// ==============================
// HERO BACKGROUND SLIDER
// ==============================
function initHeroSlider() {

  const hero = document.getElementById("hero");
  const prev = document.getElementById("prevHero");
  const next = document.getElementById("nextHero");

  if (!hero) return;

  const images = [
    "../img/home.jpg",
    "../img/home1.jpg",
    "../img/home2.jpg",
    "../img/home3.jpg",
    "../img/home4.jpg",
    "../img/home5.jpg",
    "../img/home6.jpg"
  ];

  let index = 0;

  function updateHero(){
    hero.style.backgroundImage = `url('${images[index]}')`;
  }

  if (next){
    next.addEventListener("click", () => {
      index++;
      if(index >= images.length) index = 0;
      updateHero();
    });
  }

  if (prev){
    prev.addEventListener("click", () => {
      index--;
      if(index < 0) index = images.length - 1;
      updateHero();
    });
  }

  // auto slide
  setInterval(() => {
    index++;
    if(index >= images.length) index = 0;
    updateHero();
  }, 4000);

  updateHero();
}
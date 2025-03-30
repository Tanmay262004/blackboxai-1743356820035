// ======================
// ATTENDANCE SYSTEM CORE
// ======================

class AttendanceSystem {
  constructor() {
    // DOM Elements
    this.checkInBtn = document.getElementById('checkInBtn');
    this.checkOutBtn = document.getElementById('checkOutBtn');
    this.notesField = document.getElementById('attendanceNotes');
    this.darkModeToggle = document.getElementById('darkModeToggle');
    this.backToTopBtn = document.getElementById('backToTop');
    
    // Initialize
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.restoreState();
    this.setupCharts();
  }

  setupEventListeners() {
    // Check-in/out
    if (this.checkInBtn) this.checkInBtn.addEventListener('click', () => this.handleCheckIn());
    if (this.checkOutBtn) this.checkOutBtn.addEventListener('click', () => this.handleCheckOut());
    
    // Calendar
    document.querySelectorAll('.calendar-day').forEach(day => {
      day.addEventListener('click', () => this.handleDayClick(day));
    });
    
    // UI Controls
    if (this.darkModeToggle) this.darkModeToggle.addEventListener('click', () => this.toggleDarkMode());
    if (this.backToTopBtn) {
      window.addEventListener('scroll', () => this.toggleBackToTop());
      this.backToTopBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    }
  }

  restoreState() {
    // Restore check-in state
    if (localStorage.getItem('lastCheckin')) {
      if (this.checkInBtn) this.checkInBtn.disabled = true;
      if (this.checkOutBtn) this.checkOutBtn.disabled = false;
    }
    
    // Restore dark mode
    if (localStorage.getItem('darkMode') === 'true') {
      document.documentElement.classList.add('dark');
    }
  }

  handleCheckIn() {
    const timestamp = new Date();
    localStorage.setItem('lastCheckin', timestamp.toISOString());
    localStorage.setItem('checkinNotes', this.notesField.value);
    
    this.checkInBtn.disabled = true;
    this.checkOutBtn.disabled = false;
    
    this.showNotification(`Checked in at ${timestamp.toLocaleTimeString()}`);
    this.updateCalendar(timestamp);
  }

  handleCheckOut() {
    const timestamp = new Date();
    const checkinTime = new Date(localStorage.getItem('lastCheckin'));
    const hoursWorked = ((timestamp - checkinTime) / (1000 * 60 * 60)).toFixed(2);
    
    this.checkOutBtn.disabled = true;
    this.checkInBtn.disabled = false;
    
    this.showNotification(`Checked out at ${timestamp.toLocaleTimeString()} (${hoursWorked} hours)`);
    this.saveWorkRecord(hoursWorked);
  }

  handleDayClick(dayElement) {
    const dayNumber = dayElement.textContent.trim();
    const status = this.getDayStatus(dayElement);
    this.showNotification(`Day ${dayNumber} - ${status}`);
  }

  getDayStatus(dayElement) {
    if (dayElement.classList.contains('bg-green-100')) return 'Present';
    if (dayElement.classList.contains('bg-yellow-100')) return 'Late';
    if (dayElement.classList.contains('bg-red-100')) return 'Absent';
    return 'Not Recorded';
  }

  toggleDarkMode() {
    document.documentElement.classList.toggle('dark');
    localStorage.setItem('darkMode', document.documentElement.classList.contains('dark'));
  }

  toggleBackToTop() {
    this.backToTopBtn.style.display = window.scrollY > 300 ? 'block' : 'none';
  }

  setupCharts() {
    if (typeof Chart === 'undefined') return;
    
    // Weekly Hours Chart
    new Chart(document.getElementById('weeklyChart').getContext('2d'), {
      type: 'bar',
      data: {
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
        datasets: [{
          label: 'Hours Worked',
          data: [40, 38, 42, 35],
          backgroundColor: 'rgba(79, 70, 229, 0.7)'
        }]
      }
    });

    // Punctuality Chart
    new Chart(document.getElementById('punctualityChart').getContext('2d'), {
      type: 'doughnut',
      data: {
        labels: ['On Time', 'Late', 'Absent'],
        datasets: [{
          data: [85, 10, 5],
          backgroundColor: [
            'rgba(16, 185, 129, 0.7)',
            'rgba(250, 204, 21, 0.7)',
            'rgba(239, 68, 68, 0.7)'
          ]
        }]
      }
    });
  }

  showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-fade-in';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.classList.add('animate-fade-out');
      setTimeout(() => notification.remove(), 300);
    }, 2700);
  }

  updateCalendar(date) {
    const dayElement = document.querySelector(`.calendar-day:contains("${date.getDate()}")`);
    if (dayElement) {
      dayElement.classList.add('bg-green-100', 'dark:bg-green-900/20');
    }
  }

  saveWorkRecord(hours) {
    // In a real app, this would send to your backend
    console.log(`Work record saved: ${hours} hours`);
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new AttendanceSystem();
});
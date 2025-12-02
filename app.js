// HOTEL MANAGEMENT SYSTEM WITH API INTEGRATION - FIXED DELETE
console.log('Hotel Management System Starting...');

// API Configuration
const API_BASE_URL = 'https://hotelmanagement-api.vercel.app/'; // Change this to your actual API URL
const MOCK_API = true; // Set to false to use real API

// API Endpoints
const API_ENDPOINTS = {
    ROOMS: '/rooms',
    GUESTS: '/guests',
    BOOKINGS: '/bookings',
    DASHBOARD: '/dashboard'
};

// Global state
let roomsData = [];
let guestsData = [];
let bookingsData = [];
let currentDeleteInfo = null;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM fully loaded');
    initApp();
});

async function initApp() {
    console.log('Initializing application...');
    
    try {
        // Load all data from API
        await Promise.all([
            loadRooms(),
            loadGuests(),
            loadBookings()
        ]);
        
        setupNavigation();
        setupButtons();
        setupModals();
        setupEventListeners();
        updateDashboardStats();
        console.log('Application initialized successfully');
    } catch (error) {
        console.error('Failed to initialize app:', error);
        alert('Failed to load application data. Please try again.');
    }
}

// ==================== API SERVICE FUNCTIONS ====================

// Generic API function
async function apiCall(endpoint, method = 'GET', data = null) {
    if (MOCK_API) {
        // Use localStorage as mock API
        return mockApi(endpoint, method, data);
    }
    
    // Real API call
    const url = `${API_BASE_URL}${endpoint}`;
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
    };
    
    if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
        options.body = JSON.stringify(data);
    }
    
    try {
        const response = await fetch(url, options);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error(`API Error (${method} ${endpoint}):`, error);
        throw error;
    }
}

// Mock API using localStorage
function mockApi(endpoint, method, data) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            try {
                let result;
                
                switch (endpoint) {
                    case API_ENDPOINTS.ROOMS:
                        result = handleRoomsMock(method, data);
                        break;
                    case API_ENDPOINTS.GUESTS:
                        result = handleGuestsMock(method, data);
                        break;
                    case API_ENDPOINTS.BOOKINGS:
                        result = handleBookingsMock(method, data);
                        break;
                    case API_ENDPOINTS.DASHBOARD:
                        result = handleDashboardMock();
                        break;
                    default:
                        // Handle endpoints with IDs like /bookings/1
                        if (endpoint.startsWith(API_ENDPOINTS.BOOKINGS + '/')) {
                            result = handleBookingByIdMock(endpoint, method, data);
                        } else if (endpoint.startsWith(API_ENDPOINTS.ROOMS + '/')) {
                            result = handleRoomByIdMock(endpoint, method, data);
                        } else if (endpoint.startsWith(API_ENDPOINTS.GUESTS + '/')) {
                            result = handleGuestByIdMock(endpoint, method, data);
                        } else {
                            throw new Error(`Unknown endpoint: ${endpoint}`);
                        }
                }
                
                resolve(result);
            } catch (error) {
                reject(error);
            }
        }, 300); // Simulate network delay
    });
}

// Mock handlers for bookings - FIXED VERSION
function handleBookingsMock(method, data) {
    const storageKey = 'hotel_bookings';
    
    switch (method) {
        case 'GET':
            let bookings = JSON.parse(localStorage.getItem(storageKey));
            if (!bookings || !Array.isArray(bookings)) {
                bookings = [
                    { 
                        id: 1, 
                        guestId: 1, 
                        roomId: 4, 
                        checkIn: '2024-01-15', 
                        checkOut: '2024-01-20', 
                        status: 'confirmed', 
                        totalPrice: 745, 
                        numberOfGuests: 2,
                        specialRequests: 'Early check-in requested',
                        createdAt: new Date().toISOString()
                    }
                ];
                localStorage.setItem(storageKey, JSON.stringify(bookings));
            }
            return { data: bookings };
            
        case 'POST':
            let existingBookings = JSON.parse(localStorage.getItem(storageKey)) || [];
            const newBooking = {
                id: existingBookings.length > 0 ? Math.max(...existingBookings.map(b => b.id)) + 1 : 1,
                ...data,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            existingBookings.push(newBooking);
            localStorage.setItem(storageKey, JSON.stringify(existingBookings));
            return { data: newBooking, message: 'Booking created successfully' };
            
        default:
            throw new Error(`Unsupported method for bookings endpoint: ${method}`);
    }
}

// Handle specific booking by ID (for PUT and DELETE)
function handleBookingByIdMock(endpoint, method, data) {
    const storageKey = 'hotel_bookings';
    const bookingId = parseInt(endpoint.split('/').pop());
    
    let bookings = JSON.parse(localStorage.getItem(storageKey)) || [];
    
    switch (method) {
        case 'PUT':
        case 'PATCH':
            const index = bookings.findIndex(b => b.id === bookingId);
            if (index !== -1) {
                bookings[index] = {
                    ...bookings[index],
                    ...data,
                    updatedAt: new Date().toISOString()
                };
                localStorage.setItem(storageKey, JSON.stringify(bookings));
                return { data: bookings[index], message: 'Booking updated successfully' };
            }
            throw new Error('Booking not found');
            
        case 'DELETE':
            // FIXED: Simple delete without checking data parameter
            const initialLength = bookings.length;
            bookings = bookings.filter(b => b.id !== bookingId);
            
            if (bookings.length === initialLength) {
                throw new Error('Booking not found');
            }
            
            localStorage.setItem(storageKey, JSON.stringify(bookings));
            return { message: 'Booking deleted successfully' };
            
        default:
            throw new Error(`Unsupported method for booking ID endpoint: ${method}`);
    }
}

// Mock handlers for rooms
function handleRoomsMock(method, data) {
    const storageKey = 'hotel_rooms';
    
    switch (method) {
        case 'GET':
            let rooms = JSON.parse(localStorage.getItem(storageKey));
            if (!rooms || !Array.isArray(rooms)) {
                rooms = [
                    { id: 1, number: '101', type: 'Single', price: 99, status: 'available', capacity: 2, amenities: ['WiFi', 'TV'] },
                    { id: 2, number: '102', type: 'Single', price: 99, status: 'available', capacity: 2, amenities: ['WiFi', 'TV'] },
                    { id: 3, number: '201', type: 'Double', price: 149, status: 'available', capacity: 4, amenities: ['WiFi', 'TV', 'AC'] },
                    { id: 4, number: '202', type: 'Double', price: 149, status: 'occupied', capacity: 4, amenities: ['WiFi', 'TV', 'AC'] },
                    { id: 5, number: '301', type: 'Suite', price: 299, status: 'available', capacity: 6, amenities: ['WiFi', 'TV', 'AC', 'Mini Bar'] }
                ];
                localStorage.setItem(storageKey, JSON.stringify(rooms));
            }
            return { data: rooms };
            
        case 'POST':
            let existingRooms = JSON.parse(localStorage.getItem(storageKey)) || [];
            const newRoom = {
                id: existingRooms.length > 0 ? Math.max(...existingRooms.map(r => r.id)) + 1 : 1,
                ...data,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            existingRooms.push(newRoom);
            localStorage.setItem(storageKey, JSON.stringify(existingRooms));
            return { data: newRoom, message: 'Room created successfully' };
            
        default:
            throw new Error(`Unsupported method for rooms endpoint: ${method}`);
    }
}

// Handle specific room by ID
function handleRoomByIdMock(endpoint, method, data) {
    const storageKey = 'hotel_rooms';
    const roomId = parseInt(endpoint.split('/').pop());
    
    let rooms = JSON.parse(localStorage.getItem(storageKey)) || [];
    
    switch (method) {
        case 'PUT':
        case 'PATCH':
            const index = rooms.findIndex(r => r.id === roomId);
            if (index !== -1) {
                rooms[index] = {
                    ...rooms[index],
                    ...data,
                    updatedAt: new Date().toISOString()
                };
                localStorage.setItem(storageKey, JSON.stringify(rooms));
                return { data: rooms[index], message: 'Room updated successfully' };
            }
            throw new Error('Room not found');
            
        case 'DELETE':
            const initialLength = rooms.length;
            rooms = rooms.filter(r => r.id !== roomId);
            
            if (rooms.length === initialLength) {
                throw new Error('Room not found');
            }
            
            localStorage.setItem(storageKey, JSON.stringify(rooms));
            return { message: 'Room deleted successfully' };
            
        default:
            throw new Error(`Unsupported method for room ID endpoint: ${method}`);
    }
}

// Mock handlers for guests
function handleGuestsMock(method, data) {
    const storageKey = 'hotel_guests';
    
    switch (method) {
        case 'GET':
            let guests = JSON.parse(localStorage.getItem(storageKey));
            if (!guests || !Array.isArray(guests)) {
                guests = [
                    { id: 1, name: 'John Doe', email: 'john@email.com', phone: '+1234567890', nationality: 'USA', idDocument: 'PAS123456', createdAt: new Date().toISOString() },
                    { id: 2, name: 'Jane Smith', email: 'jane@email.com', phone: '+1234567891', nationality: 'Canada', idDocument: 'PAS123457', createdAt: new Date().toISOString() },
                    { id: 3, name: 'Mike Johnson', email: 'mike@email.com', phone: '+1234567892', nationality: 'UK', idDocument: 'PAS123458', createdAt: new Date().toISOString() }
                ];
                localStorage.setItem(storageKey, JSON.stringify(guests));
            }
            return { data: guests };
            
        case 'POST':
            let existingGuests = JSON.parse(localStorage.getItem(storageKey)) || [];
            const newGuest = {
                id: existingGuests.length > 0 ? Math.max(...existingGuests.map(g => g.id)) + 1 : 1,
                ...data,
                idDocument: `PAS${Math.floor(100000 + Math.random() * 900000)}`,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            existingGuests.push(newGuest);
            localStorage.setItem(storageKey, JSON.stringify(existingGuests));
            return { data: newGuest, message: 'Guest created successfully' };
            
        default:
            throw new Error(`Unsupported method for guests endpoint: ${method}`);
    }
}

// Handle specific guest by ID
function handleGuestByIdMock(endpoint, method, data) {
    const storageKey = 'hotel_guests';
    const guestId = parseInt(endpoint.split('/').pop());
    
    let guests = JSON.parse(localStorage.getItem(storageKey)) || [];
    
    switch (method) {
        case 'PUT':
        case 'PATCH':
            const index = guests.findIndex(g => g.id === guestId);
            if (index !== -1) {
                guests[index] = {
                    ...guests[index],
                    ...data,
                    updatedAt: new Date().toISOString()
                };
                localStorage.setItem(storageKey, JSON.stringify(guests));
                return { data: guests[index], message: 'Guest updated successfully' };
            }
            throw new Error('Guest not found');
            
        case 'DELETE':
            const initialLength = guests.length;
            guests = guests.filter(g => g.id !== guestId);
            
            if (guests.length === initialLength) {
                throw new Error('Guest not found');
            }
            
            localStorage.setItem(storageKey, JSON.stringify(guests));
            return { message: 'Guest deleted successfully' };
            
        default:
            throw new Error(`Unsupported method for guest ID endpoint: ${method}`);
    }
}

function handleDashboardMock() {
    const rooms = JSON.parse(localStorage.getItem('hotel_rooms')) || [];
    const guests = JSON.parse(localStorage.getItem('hotel_guests')) || [];
    const bookings = JSON.parse(localStorage.getItem('hotel_bookings')) || [];
    
    const totalRooms = rooms.length;
    const availableRooms = rooms.filter(room => room.status === 'available').length;
    const totalGuests = guests.length;
    const activeBookings = bookings.filter(booking => 
        booking.status === 'confirmed' || booking.status === 'checked-in'
    ).length;
    
    return {
        data: {
            totalRooms,
            availableRooms,
            totalGuests,
            activeBookings,
            occupancyRate: totalRooms > 0 ? ((totalRooms - availableRooms) / totalRooms * 100).toFixed(1) : 0
        }
    };
}

// ==================== DATA LOADING FUNCTIONS ====================

async function loadRooms() {
    try {
        const response = await apiCall(API_ENDPOINTS.ROOMS, 'GET');
        roomsData = response.data || [];
        loadRoomsTable();
    } catch (error) {
        console.error('Error loading rooms:', error);
        roomsData = [];
        showError('Failed to load rooms data');
    }
}

async function loadGuests() {
    try {
        const response = await apiCall(API_ENDPOINTS.GUESTS, 'GET');
        guestsData = response.data || [];
        loadGuestsTable();
    } catch (error) {
        console.error('Error loading guests:', error);
        guestsData = [];
        showError('Failed to load guests data');
    }
}

async function loadBookings() {
    try {
        const response = await apiCall(API_ENDPOINTS.BOOKINGS, 'GET');
        bookingsData = response.data || [];
        loadBookingsTable();
    } catch (error) {
        console.error('Error loading bookings:', error);
        bookingsData = [];
        showError('Failed to load bookings data');
    }
}

// ==================== UI SETUP FUNCTIONS ====================

function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const sectionName = this.getAttribute('data-section');
            
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
            
            document.querySelectorAll('.section').forEach(section => {
                section.classList.remove('active');
            });
            
            const targetSection = document.getElementById(sectionName);
            if (targetSection) {
                targetSection.classList.add('active');
            }
        });
    });
}

function setupButtons() {
    document.getElementById('add-room-btn').addEventListener('click', showRoomModal);
    document.getElementById('add-guest-btn').addEventListener('click', showGuestModal);
    document.getElementById('add-booking-btn').addEventListener('click', showBookingModal);
}

function setupModals() {
    document.getElementById('room-cancel-btn').addEventListener('click', () => hideModal('room-modal'));
    document.getElementById('guest-cancel-btn').addEventListener('click', () => hideModal('guest-modal'));
    document.getElementById('booking-cancel-btn').addEventListener('click', () => hideModal('booking-modal'));
    document.getElementById('delete-cancel-btn').addEventListener('click', () => hideModal('delete-modal'));
    
    document.getElementById('room-form').addEventListener('submit', handleRoomSubmit);
    document.getElementById('guest-form').addEventListener('submit', handleGuestSubmit);
    document.getElementById('booking-form').addEventListener('submit', handleBookingSubmit);
    
    document.getElementById('delete-confirm-btn').addEventListener('click', confirmDelete);
    
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                hideModal(this.id);
            }
        });
    });
}

function setupEventListeners() {
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('delete-room')) {
            const row = e.target.closest('tr');
            const roomId = parseInt(row.getAttribute('data-id'));
            const room = roomsData.find(r => r.id === roomId);
            
            if (room) {
                currentDeleteInfo = { type: 'room', id: roomId };
                document.getElementById('delete-message').textContent = 
                    `Are you sure you want to delete Room ${room.number}? This action cannot be undone.`;
                showModal('delete-modal');
            }
        }
        
        if (e.target.classList.contains('delete-guest')) {
            const row = e.target.closest('tr');
            const guestId = parseInt(row.getAttribute('data-id'));
            const guest = guestsData.find(g => g.id === guestId);
            
            if (guest) {
                currentDeleteInfo = { type: 'guest', id: guestId };
                document.getElementById('delete-message').textContent = 
                    `Are you sure you want to delete guest ${guest.name}? This action cannot be undone.`;
                showModal('delete-modal');
            }
        }
        
        if (e.target.classList.contains('delete-booking')) {
            const row = e.target.closest('tr');
            const bookingId = parseInt(row.getAttribute('data-id'));
            const booking = bookingsData.find(b => b.id === bookingId);
            
            if (booking) {
                currentDeleteInfo = { type: 'booking', id: bookingId };
                document.getElementById('delete-message').textContent = 
                    `Are you sure you want to delete this booking? This action cannot be undone.`;
                showModal('delete-modal');
            }
        }
        
        if (e.target.classList.contains('edit-room')) {
            const row = e.target.closest('tr');
            const roomId = parseInt(row.getAttribute('data-id'));
            editRoom(roomId);
        }
        
        if (e.target.classList.contains('edit-guest')) {
            const row = e.target.closest('tr');
            const guestId = parseInt(row.getAttribute('data-id'));
            editGuest(guestId);
        }
        
        if (e.target.classList.contains('edit-booking')) {
            const row = e.target.closest('tr');
            const bookingId = parseInt(row.getAttribute('data-id'));
            editBooking(bookingId);
        }
    });
    
    document.getElementById('booking-checkin').addEventListener('change', updateBookingPrice);
    document.getElementById('booking-checkout').addEventListener('change', updateBookingPrice);
    document.getElementById('booking-room').addEventListener('change', updateBookingPrice);
}

// ==================== ROOM FUNCTIONS ====================

function showRoomModal(roomId = null) {
    const title = document.getElementById('room-modal-title');
    
    if (roomId) {
        title.textContent = 'Edit Room';
        const room = roomsData.find(r => r.id === roomId);
        if (room) {
            document.getElementById('room-id').value = room.id;
            document.getElementById('room-number').value = room.number;
            document.getElementById('room-type').value = room.type;
            document.getElementById('room-price').value = room.price;
            document.getElementById('room-capacity').value = room.capacity;
        }
    } else {
        title.textContent = 'Add New Room';
        document.getElementById('room-form').reset();
        document.getElementById('room-id').value = '';
    }
    
    showModal('room-modal');
}

async function handleRoomSubmit(e) {
    e.preventDefault();
    
    const roomId = document.getElementById('room-id').value;
    const roomData = {
        number: document.getElementById('room-number').value,
        type: document.getElementById('room-type').value,
        price: parseFloat(document.getElementById('room-price').value),
        capacity: parseInt(document.getElementById('room-capacity').value)
    };
    
    if (!roomData.number || !roomData.type || !roomData.price || !roomData.capacity) {
        showError('Please fill in all required fields!');
        return;
    }
    
    try {
        if (roomId) {
            // Update room
            await apiCall(`${API_ENDPOINTS.ROOMS}/${roomId}`, 'PUT', { ...roomData, id: parseInt(roomId) });
            showSuccess('Room updated successfully!');
        } else {
            // Create room
            roomData.status = 'available';
            roomData.amenities = ['WiFi', 'TV'];
            await apiCall(API_ENDPOINTS.ROOMS, 'POST', roomData);
            showSuccess('Room added successfully!');
        }
        
        hideModal('room-modal');
        await loadRooms();
        updateDashboardStats();
    } catch (error) {
        console.error('Error saving room:', error);
        showError('Failed to save room. Please try again.');
    }
}

function editRoom(roomId) {
    showRoomModal(roomId);
}

// ==================== GUEST FUNCTIONS ====================

function showGuestModal(guestId = null) {
    const title = document.getElementById('guest-modal-title');
    
    if (guestId) {
        title.textContent = 'Edit Guest';
        const guest = guestsData.find(g => g.id === guestId);
        if (guest) {
            document.getElementById('guest-id').value = guest.id;
            document.getElementById('guest-name').value = guest.name;
            document.getElementById('guest-email').value = guest.email;
            document.getElementById('guest-phone').value = guest.phone;
            document.getElementById('guest-nationality').value = guest.nationality || '';
        }
    } else {
        title.textContent = 'Add New Guest';
        document.getElementById('guest-form').reset();
        document.getElementById('guest-id').value = '';
    }
    
    showModal('guest-modal');
}

async function handleGuestSubmit(e) {
    e.preventDefault();
    
    const guestId = document.getElementById('guest-id').value;
    const guestData = {
        name: document.getElementById('guest-name').value,
        email: document.getElementById('guest-email').value,
        phone: document.getElementById('guest-phone').value,
        nationality: document.getElementById('guest-nationality').value
    };
    
    if (!guestData.name || !guestData.email || !guestData.phone) {
        showError('Please fill in all required fields!');
        return;
    }
    
    try {
        if (guestId) {
            // Update guest
            await apiCall(`${API_ENDPOINTS.GUESTS}/${guestId}`, 'PUT', { ...guestData, id: parseInt(guestId) });
            showSuccess('Guest updated successfully!');
        } else {
            // Create guest
            await apiCall(API_ENDPOINTS.GUESTS, 'POST', guestData);
            showSuccess('Guest added successfully!');
        }
        
        hideModal('guest-modal');
        await loadGuests();
        updateDashboardStats();
    } catch (error) {
        console.error('Error saving guest:', error);
        showError('Failed to save guest. Please try again.');
    }
}

function editGuest(guestId) {
    showGuestModal(guestId);
}

// ==================== BOOKING FUNCTIONS ====================

function showBookingModal(bookingId = null) {
    const title = document.getElementById('booking-modal-title');
    
    // Populate guest dropdown
    const guestSelect = document.getElementById('booking-guest');
    guestSelect.innerHTML = '<option value="">Select Guest</option>';
    guestsData.forEach(guest => {
        guestSelect.innerHTML += `<option value="${guest.id}">${guest.name} (${guest.email})</option>`;
    });

    // Populate room dropdown with available rooms
    const roomSelect = document.getElementById('booking-room');
    roomSelect.innerHTML = '<option value="">Select Room</option>';
    roomsData.forEach(room => {
        if (room.status === 'available') {
            roomSelect.innerHTML += `<option value="${room.id}" data-price="${room.price}">${room.number} (${room.type}) - $${room.price}/night</option>`;
        }
    });

    // Set default dates
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    document.getElementById('booking-checkin').valueAsDate = tomorrow;
    
    const dayAfter = new Date();
    dayAfter.setDate(dayAfter.getDate() + 2);
    document.getElementById('booking-checkout').valueAsDate = dayAfter;

    // Reset other fields
    document.getElementById('booking-status').value = 'confirmed';
    document.getElementById('booking-guests-count').value = '1';
    document.getElementById('booking-special-requests').value = '';
    document.getElementById('booking-total-price').textContent = '0';
    document.getElementById('booking-id').value = '';

    if (bookingId) {
        title.textContent = 'Edit Booking';
        const booking = bookingsData.find(b => b.id === bookingId);
        if (booking) {
            document.getElementById('booking-id').value = booking.id;
            document.getElementById('booking-guest').value = booking.guestId;
            document.getElementById('booking-room').value = booking.roomId;
            document.getElementById('booking-checkin').value = booking.checkIn;
            document.getElementById('booking-checkout').value = booking.checkOut;
            document.getElementById('booking-status').value = booking.status;
            document.getElementById('booking-guests-count').value = booking.numberOfGuests;
            document.getElementById('booking-special-requests').value = booking.specialRequests || '';
            document.getElementById('booking-total-price').textContent = booking.totalPrice || '0';
        }
    } else {
        title.textContent = 'Create New Booking';
    }
    
    showModal('booking-modal');
    updateBookingPrice();
}

function updateBookingPrice() {
    const checkin = document.getElementById('booking-checkin').value;
    const checkout = document.getElementById('booking-checkout').value;
    const roomId = document.getElementById('booking-room').value;
    const totalPriceElement = document.getElementById('booking-total-price');

    if (!checkin || !checkout || !roomId) {
        totalPriceElement.textContent = '0';
        return;
    }

    const roomSelect = document.getElementById('booking-room');
    const selectedOption = roomSelect.options[roomSelect.selectedIndex];
    const roomPrice = parseFloat(selectedOption.getAttribute('data-price'));

    const nights = calculateNights(checkin, checkout);
    const totalPrice = nights > 0 ? nights * roomPrice : 0;
    
    totalPriceElement.textContent = totalPrice.toFixed(2);
}

function calculateNights(checkin, checkout) {
    const checkinDate = new Date(checkin);
    const checkoutDate = new Date(checkout);
    const timeDiff = checkoutDate.getTime() - checkinDate.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
}

async function handleBookingSubmit(e) {
    e.preventDefault();
    
    const bookingId = document.getElementById('booking-id').value;
    const bookingData = {
        guestId: parseInt(document.getElementById('booking-guest').value),
        roomId: parseInt(document.getElementById('booking-room').value),
        checkIn: document.getElementById('booking-checkin').value,
        checkOut: document.getElementById('booking-checkout').value,
        status: document.getElementById('booking-status').value,
        numberOfGuests: parseInt(document.getElementById('booking-guests-count').value) || 1,
        specialRequests: document.getElementById('booking-special-requests').value,
        totalPrice: parseFloat(document.getElementById('booking-total-price').textContent)
    };
    
    if (!bookingData.guestId || !bookingData.roomId || !bookingData.checkIn || !bookingData.checkOut) {
        showError('Please fill in all required fields!');
        return;
    }

    const nights = calculateNights(bookingData.checkIn, bookingData.checkOut);
    if (nights <= 0) {
        showError('Check-out date must be after check-in date!');
        return;
    }

    try {
        if (bookingId) {
            // Update booking
            await apiCall(`${API_ENDPOINTS.BOOKINGS}/${bookingId}`, 'PUT', { ...bookingData, id: parseInt(bookingId) });
            showSuccess('Booking updated successfully!');
        } else {
            // Create booking
            await apiCall(API_ENDPOINTS.BOOKINGS, 'POST', bookingData);
            showSuccess('Booking created successfully!');
        }
        
        hideModal('booking-modal');
        await loadBookings();
        await loadRooms(); // Reload rooms to update status
        updateDashboardStats();
    } catch (error) {
        console.error('Error saving booking:', error);
        showError('Failed to save booking. Please try again.');
    }
}

function editBooking(bookingId) {
    showBookingModal(bookingId);
}

// ==================== DELETE FUNCTION - FIXED ====================

async function confirmDelete() {
    if (!currentDeleteInfo) {
        showError('No item to delete!');
        return;
    }

    const { type, id } = currentDeleteInfo;
    
    try {
        let endpoint;
        
        switch(type) {
            case 'room':
                endpoint = `${API_ENDPOINTS.ROOMS}/${id}`;
                break;
                
            case 'guest':
                endpoint = `${API_ENDPOINTS.GUESTS}/${id}`;
                break;
                
            case 'booking':
                endpoint = `${API_ENDPOINTS.BOOKINGS}/${id}`;
                break;
        }
        
        // FIXED: Just pass the endpoint, no data needed for DELETE
        await apiCall(endpoint, 'DELETE');
        showSuccess(`${type.charAt(0).toUpperCase() + type.slice(1)} deleted successfully!`);
        
        currentDeleteInfo = null;
        hideModal('delete-modal');
        
        // Reload data
        await Promise.all([
            loadRooms(),
            loadGuests(),
            loadBookings()
        ]);
        updateDashboardStats();
    } catch (error) {
        console.error('Error deleting item:', error);
        showError(`Failed to delete ${type}. Please try again.`);
    }
}

// ==================== TABLE LOADING FUNCTIONS ====================

function loadRoomsTable() {
    const tbody = document.getElementById('rooms-table-body');
    
    if (roomsData.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center;">No rooms found</td></tr>';
        return;
    }

    const html = roomsData.map(room => `
        <tr data-id="${room.id}">
            <td>${room.number}</td>
            <td>${room.type}</td>
            <td>$${room.price.toFixed(2)}</td>
            <td><span class="status-badge status-${room.status}">${room.status}</span></td>
            <td>${room.capacity}</td>
            <td>${room.amenities ? room.amenities.join(', ') : ''}</td>
            <td class="action-buttons">
                <button class="btn btn-warning action-btn edit-room">Edit</button>
                <button class="btn btn-danger action-btn delete-room">Delete</button>
            </td>
        </tr>
    `).join('');

    tbody.innerHTML = html;
}

function loadGuestsTable() {
    const tbody = document.getElementById('guests-table-body');
    
    if (guestsData.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center;">No guests found</td></tr>';
        return;
    }

    const html = guestsData.map(guest => `
        <tr data-id="${guest.id}">
            <td>${guest.name}</td>
            <td>${guest.email}</td>
            <td>${guest.phone}</td>
            <td>${guest.nationality || '-'}</td>
            <td>${guest.idDocument || '-'}</td>
            <td class="action-buttons">
                <button class="btn btn-warning action-btn edit-guest">Edit</button>
                <button class="btn btn-danger action-btn delete-guest">Delete</button>
            </td>
        </tr>
    `).join('');

    tbody.innerHTML = html;
}

function loadBookingsTable() {
    const tbody = document.getElementById('bookings-table-body');
    
    if (bookingsData.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center;">No bookings found</td></tr>';
        return;
    }

    const html = bookingsData.map(booking => {
        const guest = guestsData.find(g => g.id === booking.guestId);
        const room = roomsData.find(r => r.id === booking.roomId);
        
        return `
            <tr data-id="${booking.id}">
                <td>${guest ? guest.name : 'Unknown Guest'}</td>
                <td>${room ? room.number + ' (' + room.type + ')' : 'Unknown Room'}</td>
                <td>${booking.checkIn}</td>
                <td>${booking.checkOut}</td>
                <td><span class="status-badge status-${booking.status}">${booking.status}</span></td>
                <td>$${booking.totalPrice ? booking.totalPrice.toFixed(2) : '0.00'}</td>
                <td class="action-buttons">
                    <button class="btn btn-warning action-btn edit-booking">Edit</button>
                    <button class="btn btn-danger action-btn delete-booking">Delete</button>
                </td>
            </tr>
        `;
    }).join('');

    tbody.innerHTML = html;
}

// ==================== DASHBOARD FUNCTIONS ====================

async function updateDashboardStats() {
    try {
        const response = await apiCall(API_ENDPOINTS.DASHBOARD, 'GET');
        const stats = response.data;
        
        document.getElementById('total-rooms').textContent = stats.totalRooms || 0;
        document.getElementById('available-rooms').textContent = stats.availableRooms || 0;
        document.getElementById('total-guests').textContent = stats.totalGuests || 0;
        document.getElementById('active-bookings').textContent = stats.activeBookings || 0;
    } catch (error) {
        console.error('Error loading dashboard stats:', error);
        // Fallback to local calculation
        const totalRooms = roomsData.length;
        const availableRooms = roomsData.filter(room => room.status === 'available').length;
        const totalGuests = guestsData.length;
        const activeBookings = bookingsData.filter(booking => 
            booking.status === 'confirmed' || booking.status === 'checked-in'
        ).length;

        document.getElementById('total-rooms').textContent = totalRooms;
        document.getElementById('available-rooms').textContent = availableRooms;
        document.getElementById('total-guests').textContent = totalGuests;
        document.getElementById('active-bookings').textContent = activeBookings;
    }
}

// ==================== UTILITY FUNCTIONS ====================

function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
}

function hideModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

function showSuccess(message) {
    alert(message);
}

function showError(message) {
    alert(`Error: ${message}`);
}

// ==================== INITIALIZE ====================

console.log('Hotel Management System is ready!');

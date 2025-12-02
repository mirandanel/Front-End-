// Configuration - Update this with your backend API URL
const API_BASE_URL = 'https://hotelmanangementapi-2.onrender.com'; // Change this to your backend URL

// Global state
let currentSection = 'dashboard';
let rooms = [];
let guests = [];
let bookings = [];
let deleteId = null;
let deleteType = null;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM Loaded - Initializing Hotel Management System');
    initApp();
});

function initApp() {
    setupEventListeners();
    loadInitialData();
    setupDefaultDates();
}

function setupEventListeners() {
    // Mobile menu
    document.getElementById('mobileMenuBtn').addEventListener('click', toggleMobileMenu);
    
    // Navigation
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', handleNavigation);
    });
    
    // Tabs
    document.querySelectorAll('.tab-btn').forEach(tab => {
        tab.addEventListener('click', handleTabClick);
    });
    
    // Add buttons
    document.getElementById('addRoomBtn').addEventListener('click', () => openRoomModal());
    document.getElementById('addGuestBtn').addEventListener('click', () => openGuestModal());
    document.getElementById('addBookingBtn').addEventListener('click', () => openBookingModal());
    
    // Modal close buttons
    document.getElementById('closeRoomModal').addEventListener('click', () => closeRoomModal());
    document.getElementById('cancelRoomBtn').addEventListener('click', () => closeRoomModal());
    document.getElementById('saveRoomBtn').addEventListener('click', handleSaveRoom);
    
    document.getElementById('closeGuestModal').addEventListener('click', () => closeGuestModal());
    document.getElementById('cancelGuestBtn').addEventListener('click', () => closeGuestModal());
    document.getElementById('saveGuestBtn').addEventListener('click', handleSaveGuest);
    
    document.getElementById('closeBookingModal').addEventListener('click', () => closeBookingModal());
    document.getElementById('cancelBookingBtn').addEventListener('click', () => closeBookingModal());
    document.getElementById('saveBookingBtn').addEventListener('click', handleSaveBooking);
    
    // Confirmation modal
    document.getElementById('closeConfirmModal').addEventListener('click', () => closeConfirmModal());
    document.getElementById('cancelConfirmBtn').addEventListener('click', () => closeConfirmModal());
    document.getElementById('confirmBtn').addEventListener('click', handleConfirmDelete);
    
    // Date validation
    document.getElementById('checkIn').addEventListener('change', handleCheckInChange);
    
    // Event delegation for dynamic content
    document.addEventListener('click', handleDynamicClick);
}

function setupDefaultDates() {
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    
    document.getElementById('checkIn').value = today;
    document.getElementById('checkOut').value = tomorrowStr;
    document.getElementById('checkIn').min = today;
    document.getElementById('checkOut').min = tomorrowStr;
}

function loadInitialData() {
    // Initialize with sample data
    rooms = [
        { _id: '1', number: '101', type: 'Single', price: 120, status: 'available', createdAt: '2023-10-01' },
        { _id: '2', number: '102', type: 'Double', price: 180, status: 'occupied', createdAt: '2023-10-02' },
        { _id: '3', number: '201', type: 'Suite', price: 300, status: 'available', createdAt: '2023-10-03' },
        { _id: '4', number: '202', type: 'Single', price: 120, status: 'available', createdAt: '2023-10-04' },
        { _id: '5', number: '301', type: 'Deluxe', price: 350, status: 'occupied', createdAt: '2023-10-05' }
    ];
    
    guests = [
        { _id: '1', name: 'John Smith', email: 'john@example.com', phone: '+1 234 567 8901', createdAt: '2023-10-10' },
        { _id: '2', name: 'Emma Johnson', email: 'emma@example.com', phone: '+1 234 567 8902', createdAt: '2023-10-11' },
        { _id: '3', name: 'Michael Brown', email: 'michael@example.com', phone: '+1 234 567 8903', createdAt: '2023-10-12' },
        { _id: '4', name: 'Sarah Davis', email: 'sarah@example.com', phone: '+1 234 567 8904', createdAt: '2023-10-13' }
    ];
    
    bookings = [
        { _id: '1', guestId: { _id: '1', name: 'John Smith' }, roomId: { _id: '2', number: '102' }, checkIn: '2023-10-15', checkOut: '2023-10-20', status: 'checked-in' },
        { _id: '2', guestId: { _id: '3', name: 'Michael Brown' }, roomId: { _id: '5', number: '301' }, checkIn: '2023-10-18', checkOut: '2023-10-25', status: 'booked' },
        { _id: '3', guestId: { _id: '2', name: 'Emma Johnson' }, roomId: { _id: '1', number: '101' }, checkIn: '2023-10-12', checkOut: '2023-10-14', status: 'checked-out' }
    ];
    
    loadDashboardData();
}

// Event Handlers
function toggleMobileMenu() {
    document.getElementById('navLinks').classList.toggle('active');
}

function handleNavigation(e) {
    e.preventDefault();
    const section = this.getAttribute('data-section');
    showSection(section);
    
    // Update active nav button
    document.querySelectorAll('.nav-links a').forEach(btn => btn.classList.remove('active'));
    this.classList.add('active');
    
    // Close mobile menu
    document.getElementById('navLinks').classList.remove('active');
}

function handleTabClick() {
    const tabId = this.getAttribute('data-tab');
    showTab(tabId);
}

function handleDynamicClick(e) {
    // Handle edit room button
    if (e.target.closest('.edit-room-btn')) {
        const button = e.target.closest('.edit-room-btn');
        const roomId = button.getAttribute('data-id');
        editRoom(roomId);
    }
    
    // Handle delete room button
    if (e.target.closest('.delete-room-btn')) {
        const button = e.target.closest('.delete-room-btn');
        const roomId = button.getAttribute('data-id');
        confirmDelete(roomId, 'room');
    }
    
    // Handle edit guest button
    if (e.target.closest('.edit-guest-btn')) {
        const button = e.target.closest('.edit-guest-btn');
        const guestId = button.getAttribute('data-id');
        editGuest(guestId);
    }
    
    // Handle delete guest button
    if (e.target.closest('.delete-guest-btn')) {
        const button = e.target.closest('.delete-guest-btn');
        const guestId = button.getAttribute('data-id');
        confirmDelete(guestId, 'guest');
    }
    
    // Handle edit booking button
    if (e.target.closest('.edit-booking-btn')) {
        const button = e.target.closest('.edit-booking-btn');
        const bookingId = button.getAttribute('data-id');
        editBooking(bookingId);
    }
    
    // Handle delete booking button
    if (e.target.closest('.delete-booking-btn')) {
        const button = e.target.closest('.delete-booking-btn');
        const bookingId = button.getAttribute('data-id');
        confirmDelete(bookingId, 'booking');
    }
}

function handleCheckInChange() {
    const checkInDate = this.value;
    const checkOutField = document.getElementById('checkOut');
    checkOutField.min = checkInDate;
    
    if (checkOutField.value < checkInDate) {
        const nextDay = new Date(checkInDate);
        nextDay.setDate(nextDay.getDate() + 1);
        checkOutField.value = nextDay.toISOString().split('T')[0];
    }
}

// Section Navigation
function showSection(section) {
    document.querySelectorAll('.content-section').forEach(sec => {
        sec.classList.remove('active');
    });
    
    document.getElementById(section).classList.add('active');
    currentSection = section;
    
    // Load data for the section
    switch(section) {
        case 'rooms':
            loadRooms();
            break;
        case 'guests':
            loadGuests();
            break;
        case 'bookings':
            loadBookings();
            break;
        case 'dashboard':
            loadDashboardData();
            break;
    }
}

function showTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    document.querySelectorAll('.tab-btn').forEach(button => {
        button.classList.remove('active');
    });
    
    document.getElementById(tabId).classList.add('active');
    document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');
}

// Data Loading Functions
function loadDashboardData() {
    try {
        // Update stats
        document.getElementById('rooms-count').textContent = rooms.length;
        document.getElementById('guests-count').textContent = guests.length;
        document.getElementById('bookings-count').textContent = bookings.length;
        
        const availableRooms = rooms.filter(room => room.status === 'available').length;
        document.getElementById('available-rooms').textContent = availableRooms;
        
        // Populate recent bookings
        const recentBookingsTable = document.getElementById('recent-bookings-table');
        recentBookingsTable.innerHTML = bookings.slice(0, 3).map(booking => `
            <tr>
                <td>${booking._id}</td>
                <td>${booking.guestId.name}</td>
                <td>Room ${booking.roomId.number}</td>
                <td>${formatDate(booking.checkIn)}</td>
                <td>${formatDate(booking.checkOut)}</td>
                <td><span class="status-badge status-${booking.status === 'booked' ? 'booked' : booking.status === 'checked-in' ? 'occupied' : 'available'}">${booking.status}</span></td>
            </tr>
        `).join('');
        
        // Populate recent guests
        const recentGuestsTable = document.getElementById('recent-guests-table');
        recentGuestsTable.innerHTML = guests.slice(0, 3).map(guest => `
            <tr>
                <td>${guest._id}</td>
                <td>${guest.name}</td>
                <td>${guest.email}</td>
                <td>${guest.phone}</td>
                <td>${formatDate(guest.createdAt)}</td>
            </tr>
        `).join('');
        
        // Populate recent rooms
        const recentRoomsTable = document.getElementById('recent-rooms-table');
        recentRoomsTable.innerHTML = rooms.slice(0, 3).map(room => `
            <tr>
                <td>${room.number}</td>
                <td>${room.type}</td>
                <td>$${room.price}/night</td>
                <td><span class="status-badge status-${room.status}">${room.status}</span></td>
                <td>${formatDate(room.createdAt)}</td>
            </tr>
        `).join('');
        
    } catch (error) {
        console.error('Error loading dashboard:', error);
        showNotification('Error loading dashboard data', 'error');
    }
}

function loadRooms() {
    try {
        const roomsTable = document.getElementById('rooms-table');
        roomsTable.innerHTML = rooms.map(room => `
            <tr>
                <td>${room.number}</td>
                <td>${room.type}</td>
                <td>$${room.price}/night</td>
                <td><span class="status-badge status-${room.status}">${room.status}</span></td>
                <td>
                    <div class="action-btns">
                        <button class="btn btn-warning btn-sm edit-room-btn" data-id="${room._id}">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="btn btn-danger btn-sm delete-room-btn" data-id="${room._id}">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
        
    } catch (error) {
        console.error('Error loading rooms:', error);
        showNotification('Error loading rooms', 'error');
    }
}

function loadGuests() {
    try {
        const guestsTable = document.getElementById('guests-table');
        guestsTable.innerHTML = guests.map(guest => `
            <tr>
                <td>${guest.name}</td>
                <td>${guest.email}</td>
                <td>${guest.phone}</td>
                <td>${formatDate(guest.createdAt)}</td>
                <td>
                    <div class="action-btns">
                        <button class="btn btn-warning btn-sm edit-guest-btn" data-id="${guest._id}">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="btn btn-danger btn-sm delete-guest-btn" data-id="${guest._id}">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
        
    } catch (error) {
        console.error('Error loading guests:', error);
        showNotification('Error loading guests', 'error');
    }
}

function loadBookings() {
    try {
        const bookingsTable = document.getElementById('bookings-table');
        bookingsTable.innerHTML = bookings.map(booking => `
            <tr>
                <td>${booking._id}</td>
                <td>${booking.guestId.name}</td>
                <td>Room ${booking.roomId.number}</td>
                <td>${formatDate(booking.checkIn)}</td>
                <td>${formatDate(booking.checkOut)}</td>
                <td><span class="status-badge status-${booking.status === 'booked' ? 'booked' : booking.status === 'checked-in' ? 'occupied' : 'available'}">${booking.status}</span></td>
                <td>
                    <div class="action-btns">
                        <button class="btn btn-warning btn-sm edit-booking-btn" data-id="${booking._id}">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="btn btn-danger btn-sm delete-booking-btn" data-id="${booking._id}">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
        
    } catch (error) {
        console.error('Error loading bookings:', error);
        showNotification('Error loading bookings', 'error');
    }
}

// Room Functions
function openRoomModal(roomId = null) {
    const modal = document.getElementById('roomModal');
    const title = document.getElementById('roomModalTitle');
    
    if (roomId) {
        title.textContent = 'Edit Room';
        const room = rooms.find(r => r._id === roomId);
        if (room) {
            document.getElementById('roomNumber').value = room.number;
            document.getElementById('roomType').value = room.type;
            document.getElementById('roomPrice').value = room.price;
            document.getElementById('roomStatus').value = room.status;
            document.getElementById('roomId').value = room._id;
        }
    } else {
        title.textContent = 'Add New Room';
        document.getElementById('roomForm').reset();
        document.getElementById('roomId').value = '';
    }
    
    modal.classList.add('active');
}

function closeRoomModal() {
    document.getElementById('roomModal').classList.remove('active');
}

function handleSaveRoom() {
    const roomId = document.getElementById('roomId').value;
    const roomData = {
        number: document.getElementById('roomNumber').value.trim(),
        type: document.getElementById('roomType').value,
        price: parseInt(document.getElementById('roomPrice').value),
        status: document.getElementById('roomStatus').value
    };
    
    // Validation
    if (!roomData.number || !roomData.type || !roomData.price) {
        showNotification('Please fill all required fields', 'error');
        return;
    }
    
    if (roomId) {
        // Update existing room
        const index = rooms.findIndex(r => r._id === roomId);
        if (index !== -1) {
            rooms[index] = { ...rooms[index], ...roomData };
            showNotification('Room updated successfully', 'success');
        }
    } else {
        // Create new room
        const newRoom = {
            _id: Date.now().toString(),
            ...roomData,
            createdAt: new Date().toISOString().split('T')[0]
        };
        rooms.push(newRoom);
        showNotification('Room created successfully', 'success');
    }
    
    closeRoomModal();
    loadRooms();
    if (currentSection === 'dashboard') loadDashboardData();
}

function editRoom(roomId) {
    openRoomModal(roomId);
}

// Guest Functions
function openGuestModal(guestId = null) {
    const modal = document.getElementById('guestModal');
    const title = document.getElementById('guestModalTitle');
    
    if (guestId) {
        title.textContent = 'Edit Guest';
        const guest = guests.find(g => g._id === guestId);
        if (guest) {
            document.getElementById('guestName').value = guest.name;
            document.getElementById('guestEmail').value = guest.email;
            document.getElementById('guestPhone').value = guest.phone;
            document.getElementById('guestId').value = guest._id;
        }
    } else {
        title.textContent = 'Add New Guest';
        document.getElementById('guestForm').reset();
        document.getElementById('guestId').value = '';
    }
    
    modal.classList.add('active');
}

function closeGuestModal() {
    document.getElementById('guestModal').classList.remove('active');
}

function handleSaveGuest() {
    const guestId = document.getElementById('guestId').value;
    const guestData = {
        name: document.getElementById('guestName').value.trim(),
        email: document.getElementById('guestEmail').value.trim(),
        phone: document.getElementById('guestPhone').value.trim()
    };
    
    // Validation
    if (!guestData.name || !guestData.email || !guestData.phone) {
        showNotification('Please fill all required fields', 'error');
        return;
    }
    
    if (guestId) {
        // Update existing guest
        const index = guests.findIndex(g => g._id === guestId);
        if (index !== -1) {
            guests[index] = { ...guests[index], ...guestData };
            showNotification('Guest updated successfully', 'success');
        }
    } else {
        // Create new guest
        const newGuest = {
            _id: Date.now().toString(),
            ...guestData,
            createdAt: new Date().toISOString().split('T')[0]
        };
        guests.push(newGuest);
        showNotification('Guest created successfully', 'success');
    }
    
    closeGuestModal();
    loadGuests();
    if (currentSection === 'dashboard') loadDashboardData();
}

function editGuest(guestId) {
    openGuestModal(guestId);
}

// Booking Functions
function openBookingModal(bookingId = null) {
    const modal = document.getElementById('bookingModal');
    const title = document.getElementById('bookingModalTitle');
    
    // Populate guest dropdown
    const guestSelect = document.getElementById('bookingGuest');
    guestSelect.innerHTML = '<option value="">Select Guest</option>' + 
        guests.map(guest => `<option value="${guest._id}">${guest.name}</option>`).join('');
    
    // Populate room dropdown (only available rooms)
    const roomSelect = document.getElementById('bookingRoom');
    const availableRooms = rooms.filter(room => room.status === 'available');
    roomSelect.innerHTML = '<option value="">Select Room</option>' + 
        availableRooms.map(room => `<option value="${room._id}">Room ${room.number} - ${room.type} ($${room.price}/night)</option>`).join('');
    
    if (bookingId) {
        title.textContent = 'Edit Booking';
        const booking = bookings.find(b => b._id === bookingId);
        if (booking) {
            document.getElementById('bookingGuest').value = booking.guestId._id;
            document.getElementById('bookingRoom').value = booking.roomId._id;
            document.getElementById('checkIn').value = booking.checkIn;
            document.getElementById('checkOut').value = booking.checkOut;
            document.getElementById('bookingStatus').value = booking.status;
            document.getElementById('bookingId').value = booking._id;
        }
    } else {
        title.textContent = 'Create New Booking';
        document.getElementById('bookingForm').reset();
        document.getElementById('bookingId').value = '';
        
        // Set default dates
        const today = new Date().toISOString().split('T')[0];
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowStr = tomorrow.toISOString().split('T')[0];
        
        document.getElementById('checkIn').value = today;
        document.getElementById('checkOut').value = tomorrowStr;
    }
    
    modal.classList.add('active');
}

function closeBookingModal() {
    document.getElementById('bookingModal').classList.remove('active');
}

function handleSaveBooking() {
    const bookingId = document.getElementById('bookingId').value;
    const bookingData = {
        guestId: document.getElementById('bookingGuest').value,
        roomId: document.getElementById('bookingRoom').value,
        checkIn: document.getElementById('checkIn').value,
        checkOut: document.getElementById('checkOut').value,
        status: document.getElementById('bookingStatus').value
    };
    
    // Validation
    if (!bookingData.guestId || !bookingData.roomId || !bookingData.checkIn || !bookingData.checkOut) {
        showNotification('Please fill all required fields', 'error');
        return;
    }
    
    if (new Date(bookingData.checkOut) <= new Date(bookingData.checkIn)) {
        showNotification('Check-out date must be after check-in date', 'error');
        return;
    }
    
    // Get guest and room details
    const guest = guests.find(g => g._id === bookingData.guestId);
    const room = rooms.find(r => r._id === bookingData.roomId);
    
    if (!guest || !room) {
        showNotification('Invalid guest or room selection', 'error');
        return;
    }
    
    if (bookingId) {
        // Update existing booking
        const index = bookings.findIndex(b => b._id === bookingId);
        if (index !== -1) {
            const oldBooking = bookings[index];
            
            // Restore old room status if needed
            if (oldBooking.status === 'booked' || oldBooking.status === 'checked-in') {
                const oldRoomIndex = rooms.findIndex(r => r._id === oldBooking.roomId._id);
                if (oldRoomIndex !== -1) {
                    rooms[oldRoomIndex].status = 'available';
                }
            }
            
            bookings[index] = { 
                ...bookings[index], 
                ...bookingData,
                guestId: guest,
                roomId: room
            };
            
            showNotification('Booking updated successfully', 'success');
        }
    } else {
        // Create new booking
        const newBooking = {
            _id: Date.now().toString(),
            ...bookingData,
            guestId: guest,
            roomId: room
        };
        bookings.push(newBooking);
        showNotification('Booking created successfully', 'success');
    }
    
    // Update room status
    if (bookingData.status === 'booked' || bookingData.status === 'checked-in') {
        const roomIndex = rooms.findIndex(r => r._id === bookingData.roomId);
        if (roomIndex !== -1) {
            rooms[roomIndex].status = 'occupied';
        }
    }
    
    closeBookingModal();
    loadBookings();
    loadRooms();
    if (currentSection === 'dashboard') loadDashboardData();
}

function editBooking(bookingId) {
    openBookingModal(bookingId);
}

// Delete Functions
function confirmDelete(id, type) {
    deleteId = id;
    deleteType = type;
    
    const message = document.getElementById('confirmMessage');
    const itemName = getItemName(id, type);
    message.textContent = `Are you sure you want to delete ${itemName}? This action cannot be undone.`;
    
    document.getElementById('confirmModal').classList.add('active');
}

function getItemName(id, type) {
    switch(type) {
        case 'room':
            const room = rooms.find(r => r._id === id);
            return room ? `Room ${room.number}` : 'this room';
        case 'guest':
            const guest = guests.find(g => g._id === id);
            return guest ? `Guest ${guest.name}` : 'this guest';
        case 'booking':
            const booking = bookings.find(b => b._id === id);
            return booking ? `Booking ${booking._id}` : 'this booking';
        default:
            return 'this item';
    }
}

function closeConfirmModal() {
    document.getElementById('confirmModal').classList.remove('active');
    deleteId = null;
    deleteType = null;
}

function handleConfirmDelete() {
    if (!deleteId || !deleteType) return;
    
    switch(deleteType) {
        case 'room':
            deleteRoom(deleteId);
            break;
        case 'guest':
            deleteGuest(deleteId);
            break;
        case 'booking':
            deleteBooking(deleteId);
            break;
    }
    
    closeConfirmModal();
}

function deleteRoom(id) {
    try {
        const index = rooms.findIndex(r => r._id === id);
        if (index !== -1) {
            // Check if room is used in any active bookings
            const activeBooking = bookings.find(b => 
                b.roomId._id === id && 
                (b.status === 'booked' || b.status === 'checked-in')
            );
            
            if (activeBooking) {
                showNotification('Cannot delete room with active bookings', 'error');
                return;
            }
            
            rooms.splice(index, 1);
            showNotification('Room deleted successfully', 'success');
            loadRooms();
            if (currentSection === 'dashboard') loadDashboardData();
        }
    } catch (error) {
        console.error('Error deleting room:', error);
        showNotification('Error deleting room', 'error');
    }
}

function deleteGuest(id) {
    try {
        const index = guests.findIndex(g => g._id === id);
        if (index !== -1) {
            // Check if guest has any bookings
            const guestBookings = bookings.filter(b => b.guestId._id === id);
            
            if (guestBookings.length > 0) {
                showNotification('Cannot delete guest with existing bookings', 'error');
                return;
            }
            
            guests.splice(index, 1);
            showNotification('Guest deleted successfully', 'success');
            loadGuests();
            if (currentSection === 'dashboard') loadDashboardData();
        }
    } catch (error) {
        console.error('Error deleting guest:', error);
        showNotification('Error deleting guest', 'error');
    }
}

function deleteBooking(id) {
    try {
        const index = bookings.findIndex(b => b._id === id);
        if (index !== -1) {
            const booking = bookings[index];
            
            // Free up the room if booking was active
            if (booking.status === 'booked' || booking.status === 'checked-in') {
                const roomIndex = rooms.findIndex(r => r._id === booking.roomId._id);
                if (roomIndex !== -1) {
                    rooms[roomIndex].status = 'available';
                }
            }
            
            bookings.splice(index, 1);
            showNotification('Booking deleted successfully', 'success');
            loadBookings();
            loadRooms();
            if (currentSection === 'dashboard') loadDashboardData();
        }
    } catch (error) {
        console.error('Error deleting booking:', error);
        showNotification('Error deleting booking', 'error');
    }
}

// Utility Functions
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

function showNotification(message, type = 'info') {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification ${type} show`;
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// Make functions available globally (for testing)
window.app = {
    rooms,
    guests,
    bookings,
    loadRooms,
    loadGuests,
    loadBookings,
    loadDashboardData
};
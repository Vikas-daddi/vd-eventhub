async function testAdmin() {
  try {
    const loginRes = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@eventhub.com', password: 'admin123' })
    });
    const loginData = await loginRes.json();
    if (!loginRes.ok) throw new Error(loginData.message || 'Login failed');
    const token = loginData.token;
    console.log('Login successful');
    
    const statsRes = await fetch('http://localhost:5000/api/admin/dashboard', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const statsData = await statsRes.json();
    if (!statsRes.ok) throw new Error(statsData.message || 'Stats failed');
    console.log('Admin Dashboard Stats:', statsData);
    
    const usersRes = await fetch('http://localhost:5000/api/admin/users', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const usersData = await usersRes.json();
    if (!usersRes.ok) throw new Error(usersData.message || 'Users failed');
    console.log('Admin Users fetched successfully');

    const bookingsRes = await fetch('http://localhost:5000/api/admin/bookings', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const bookingsData = await bookingsRes.json();
    if (!bookingsRes.ok) throw new Error(bookingsData.message || 'Bookings failed');
    console.log('Admin Bookings fetched successfully');
    
  } catch(e) {
    console.error('Error:', e.message);
  }
}
testAdmin();

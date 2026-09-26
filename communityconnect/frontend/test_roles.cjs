const axios = require('axios');

async function testLogin(email, password, role) {
  try {
    const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });
    console.log(`[${role}] SUCCESS`, res.data.role, res.data.token ? 'Has Token' : 'NO TOKEN');
  } catch(err) {
    console.log(`[${role}] ERROR`, err.response?.status, err.response?.data);
  }
}

async function run() {
  await testLogin('admin@communityconnect.com', 'Admin@12345', 'ADMIN');
  await testLogin('test1@example.com', 'password', 'HELP_SEEKER');
  
  try {
    await axios.post('http://localhost:5000/api/auth/register', {
      name: 'Provider', email: 'prov@example.com', password: 'provpassword', phone: '000', role: 'SERVICE_PROVIDER'
    });
  } catch(e) {}
  await testLogin('prov@example.com', 'provpassword', 'SERVICE_PROVIDER');
}
run();

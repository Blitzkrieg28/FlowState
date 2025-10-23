console.log('Dashboard script loaded.');
const socket= io();
const logList= document.getElementById('log-list');

logList.innerHTML= '';

socket.on('connect', ()=>{
    console.log('Connected to Socket.io server!');
});

// Listen for the 'rateLimitBlocked' event
socket.on('rateLimitBlocked', (data) => {
    console.log('Block event received:', data);
    const listItem = document.createElement('li');
    const timestamp = new Date(data.blockedAt).toLocaleTimeString();
    listItem.textContent = `[${timestamp}] Request blocked from IP: ${data.ip}`;
    logList.prepend(listItem); // Add to top
});

socket.on('disconnect', () => {
    console.log('Disconnected from Socket.IO server.');
});
// Connect to the socket server
const socket = io();

// Function to scroll the chat messages to the bottom
function scrollToBottom() {
  const chatMessages = document.getElementById('chatMessages');
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Listen for 'chat message' event and append the message to the chat messages
socket.on('chat message', (msg, sender) => {
  const messageBox = document.createElement('div');
  messageBox.classList.add('message-box');
  messageBox.textContent = msg;

  if (sender === socket.id) {
    messageBox.classList.add('right');
  }

  const chatMessages = document.getElementById('chatMessages');
  chatMessages.appendChild(messageBox);

  // Scroll to the bottom of the chat messages
  scrollToBottom();
});

// Send the message to the server on button click
document.getElementById('sendButton').addEventListener('click', () => {
  const messageInput = document.getElementById('messageInput');
  const message = messageInput.value.trim();

  if (message !== '') {
    socket.emit('chat message', message);
    messageInput.value = '';

    // Scroll to the bottom after sending the message
    scrollToBottom();
  }
});

// Send the message to the server on pressing Enter key
document.getElementById('messageInput').addEventListener('keypress', (event) => {
  if (event.key === 'Enter') {
    event.preventDefault();
    document.getElementById('sendButton').click();
  }
});

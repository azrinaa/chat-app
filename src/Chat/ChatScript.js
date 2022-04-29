"use strict";

const msgerForm = get(".msger-inputarea");
const msgerInput = get(".msger-input");
const msgerChat = get(".msger-chat");

const USERDATA = JSON.parse(localStorage.getItem("userData"));
const USER = "You";
let chatArrays = []

getPrevChats();

let socket = new WebSocket(`ws://localhost:${USERDATA.portNo}`);

socket.onopen = () => {
  console.log(`Connection status: ${socket.readyState}`);
  updateStatus(1);
}


socket.onclose = () => {
  signOutAction();
}

msgerForm.addEventListener("submit", event => {
  event.preventDefault();

  const msgText = msgerInput.value;
  if (!msgText) return;

  let dataToWebsocket = {
    username: USERDATA.username,
    message: msgText,
    isSender: false,
    type: 'chat'
  }

  let storeChat = {
    username: USERDATA.username,
    message: msgText,
    isSender: true,
    type: 'chat'
  }

  socket.send(JSON.stringify(dataToWebsocket));
  chatArrays.push(storeChat)
  
  appendMessage(USER, "right", msgText);
  msgerInput.value = "";

});

socket.onmessage = ({ data }) => {
  console.log("Message received:", JSON.parse(JSON.stringify(data)));
  data = JSON.parse(data)
  chatArrays.push(data)

  if(data.type =='chat'){
    appendMessage(data.username, "left", data.message);
  } else {
    appendStatus(data.message);
  }
  // console.log(JSON.stringify(chatArrays))
};

function getPrevChats() {
  let chats = JSON.parse(localStorage.getItem("chats"));

  if(chats && chats.length > 0) {
    chats.forEach((data)=> {
      // console.log(data)
      if(data.type == 'chat') {
        if(data.isSender) {
          appendMessage(USER, "right", data.message);
        } else {
          appendMessage(data.username, "left", data.message);
        }
      } else {
        appendStatus(data.message);
      }
    })
  }
}

function updateStatus(type, save = true) {
  let status = type == 1 ? 'entered' : 'left'
  let data = {
    message: `${USERDATA.username} ${status} the chat`,
    type: 'chat-status'
  }

  socket.send(JSON.stringify(data));

  if(save){
    chatArrays.push(data);
    appendStatus(data.message)
  }
}

function signOut() {
  sweetAlertSignOut();
}

function sweetAlertSignOut() {
  Swal.fire({
    title: 'Are you sure?',
    text: "Log Out from this chat",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes'
  }).then((result) => {
    if (result.isConfirmed) {
      signOutAction();
    }
  })
}

function signOutAction() {
  updateStatus(0, false);
  
  if(localStorage.getItem("chats")){
    localStorage.removeItem("chats");
  }
  
  localStorage.setItem('chats', JSON.stringify(chatArrays));
  localStorage.removeItem("userData");
  
  history.back();
  socket.close();
}

function appendMessage(name, side, text) {
  //   Simple solution for small apps
  const msgHTML = `
    <div class="msg ${side}-msg">
      <div class="msg-bubble">
        <div class="msg-info">
          <div class="msg-info-name">${name}</div>
          <div class="msg-info-time">${formatDate(new Date())}</div>
        </div>

        <div class="msg-text">${text}</div>
      </div>
    </div>
  `;

  msgerChat.insertAdjacentHTML("beforeend", msgHTML);
  msgerChat.scrollTop += 500;
}

function appendStatus(message) {
  const msgHTML = `<div class="msg-label"><p>${message}</p></div>`;

  msgerChat.insertAdjacentHTML("beforeend", msgHTML);
}


function resetChats() {
  localStorage.removeItem('chats')
  chatArrays = []

    $.ajax({
        type: 'GET',
        url: 'index.html', 
        data: {},
        success: function(res) {
            $('#msger-chat').html('').delay(2000);
        }
    });      
}

function get(selector, root = document) {
  return root.querySelector(selector);
}

function formatDate(date) {
  const h = "0" + date.getHours();
  const m = "0" + date.getMinutes();

  return `${h.slice(-2)}:${m.slice(-2)}`;
}

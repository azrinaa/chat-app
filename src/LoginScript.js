
const form = get('.form');
const input = get(".username");
const port = get(".port-no");
let connected = false

form.addEventListener("submit", function (e) {
      e.preventDefault()
      let username = input.value;
      let portValue = port.value;

      if(username == '' || portValue == '') {       
        sweetAlertDialogue('Fail to Login','Please fill in all fields')
      }

      let userData = {
        username: username,
        portNo: portValue
      }
      
      if(localStorage.getItem("userData")){
        localStorage.removeItem("userData");
      }

      localStorage.setItem('userData', JSON.stringify(userData));

      let socket = new WebSocket(`ws://localhost:${portValue}`);

      socket.onopen = () => {
        connected = true;
        console.log(`Connection status: ${socket.readyState}`);
        return window.location.href = "././Chat/index.html";
      }
  })

  function sweetAlertDialogue(title, text){
      return Swal.fire({
        title: title,
        text: text,
        icon: 'error',
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
    })
}
  
function get(selector, root = document) {
    return root.querySelector(selector);
}


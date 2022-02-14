let chatListsDiv = document.getElementById("cems__all__chatlist");
let chatboxChattingDiv = document.getElementById("cems__chatbox__chatting");
let chatlistHeaderText = document.getElementById("cems__chatlist__header__text");
let chatboxMessagesDiv = document.getElementById("cems__chatbox__messages");

let scrollBottom = () => {
  var chatEl = document.getElementById("cems__chatbox__messages");
  chatEl.scrollTop = chatEl.scrollHeight;
};
let usersToggle = (data) => {
  let element = `
    <div class="cems__chat__list" id='${data.chat_uid}' onclick={showMesseges(this.id)}>
    <div class="cems__friend__icon">
      <p>${data.name.toUpperCase().charAt(0)}</p>
    </div>
    <div class="cems__chatlist__content">
      <h4 class="cems__chatlist__friendName">${data.name}</h4>
    </div>
  </div>
    `;
  return (chatListsDiv.innerHTML += element);
};
let chatsToggle = (data) => {
  let lastMessageDetails = data.messages.pop();

  let lastMessage = "";
  if (lastMessageDetails != undefined) {
    data.messages.push(lastMessageDetails);
    if (lastMessageDetails.messageType == 2) {
      if (lastMessageDetails.text.substring(0, 27) === "FiLe-https://tradazine.com/") {
        lastMessage = `You : Send a file`;
      } else {
        lastMessage = `You : ${lastMessageDetails.text}`;
      }
    } else {
      if (lastMessageDetails.text.substring(0, 27) === "FiLe-https://tradazine.com/") {
        lastMessage = ` Send a file`;
      } else {
        lastMessage = lastMessageDetails.text;
      }
    }
  }

  let isUnread = unreadMessageId.find((id) => id == data.chat_uid);
  let setclass = "";
  if (isUnread != undefined) {
    setclass = "unseen__message";
  }
  let timeStamp = "";
  if (lastMessageDetails !== undefined) {
    if (lastMessageDetails.timeStamp !== null && lastMessageDetails.timeStamp !== undefined) {
      timeStamp = lastMessageDetails.timeStamp.split("|")[1];
    }
  }

  let element = `
    <div class="cems__chat__list ${setclass}" id='${data.chat_uid}' onclick={showMesseges(this.id)}>
      <div class="cems__friend__icon">
        <h3>${data.name.toUpperCase().charAt(0)}</h3>
      </div>
      <div class="cems__chatlist__content">
        <div class="cems__chatlist_fNameAndMessage">
          <h4 class="cems__chatlist__friendName">${data.name}</h4>
          <p> ${lastMessage}</p>
        </div>
        <div class="cems__chatlist__time">
         <p> ${timeStamp}</p>
        </div>
      </div>
      
    </div>
    `;
  return (chatListsDiv.innerHTML += element);
};
let gotoChatList = () => {
  let className = calleeId;
  chatListsDiv.innerHTML = "";
  chatlistHeaderText.innerText = "Chats";
  if (chatListData.length < 1) {
    chatListsDiv.innerHTML = `<p class="cems__no_found">No Chats found</p>`;
  } else {
    chatListData.map((data) => {
      chatsToggle(data);
    });
  }
};
let gotoUsers = () => {
  chatListsDiv.innerHTML = "";
  chatlistHeaderText.innerText = "Users";
  if (friendList.length < 1) {
    chatListsDiv.innerHTML = `<p class="cems__no_found">No Friend found</p>`;
  } else {
    friendList.map((data) => {
      usersToggle(data);
    });
  }
};
async function showMesseges(id) {
  inMessages = true;
  let exactData = chatListData.find((data) => data.chat_uid == id);
  if (exactData == undefined) {
    exactData = friendList.find((data) => data.chat_uid == id);
    exactData.messages = [];
  }
  calleeId = exactData.chat_uid;
  unreadMessageId = unreadMessageId.filter((id) => id != exactData.chat_uid);
  calleeName = exactData.name;

  chatboxChattingDiv.innerHTML = chatboxChating(exactData);
  chatbox.gotoChat();
  filesend();
  let onlineStatus = await agoraFunction.checkPeerOnlineStatus(exactData.chat_uid);
  let onlineOrOflineIcon = document.getElementById("cems__onlineOrOfflineIcon");
  let onlineOrOflineText = document.getElementById("cems__onlineOrOfflineText");
  if (onlineStatus) {
    onlineOrOflineIcon.classList.remove("cems__offlineIcon");
    onlineOrOflineIcon.classList.add("cems__onlineIcon");
    onlineOrOflineText.classList.remove("cems__offlineText");
    onlineOrOflineText.classList.add("cems__onlineText");
    onlineOrOflineText.innerText = "Online";
  } else {
    onlineOrOflineIcon.classList.add("cems__offlineIcon");
    onlineOrOflineIcon.classList.remove("cems__onlineIcon");
    onlineOrOflineText.classList.add("cems__offlineText");
    onlineOrOflineText.classList.remove("cems__onlineText");
    onlineOrOflineText.innerText = "Offline";
  }
  if (exactData.messages.length) {
    controlSentOrReciveMessage(exactData);
  }
}

let backToChatList = () => {
  inMessages = false;
  gotoChatList();
  chatbox.backTochatList();
};

let controlSentOrReciveMessage = (data) => {
  let chatboxMessages = document.createElement("ul");

  chatboxMessages.innerHTML = "";

  data.messages.map((m) => {
    let chatboxMessageTime = (type) => {
      chatboxMessages.innerHTML += `<div class="cems__messages__time-${type}">${m.timeStamp}</div>`;
    };
    let message = m.text;
    if (m.messageType == 2) {
      if (message.substring(0, 27) === "FiLe-https://tradazine.com/") {
        let fileExtention = message.split(".").pop().toLowerCase();
        let fileLink = message.slice(5, message.length);
        let fileName = message.slice(38, message.length);
        if (fileExtention === "jpg" || fileExtention === "png" || fileExtention === "jpeg") {
          chatboxMessages.innerHTML += `<div class="cems__messages__item cems__messages__item--operator_image">
<a href="${fileLink}" download target="_blank">
        <img src="${fileLink}" alt="" style="width:125px">
        </a>
      </div>`;
          chatboxMessageTime("operator");
        } else {
          chatboxMessages.innerHTML += `<div class="cems__messages__item cems__messages__item--operator"  >
      <a href="${fileLink}" download target="_blank">
      <img src="https://img.icons8.com/carbon-copy/100/000000/file.png" style="width:70px"/><br>
      <a href="${fileLink}" download target="_blank" style="color:#ffecec">${fileName}</a>
      </a>
      </div>`;
          chatboxMessageTime("operator");
        }
      } else {
        chatboxMessages.innerHTML += `<div class="cems__messages__item cems__messages__item--operator">${m.text}</div>`;
        chatboxMessageTime("operator");
      }
    } else {
      if (message.substring(0, 27) === "FiLe-https://tradazine.com/") {
        let fileExtention = message.split(".").pop().toLowerCase();
        let fileLink = message.slice(5, message.length);
        let fileName = message.slice(38, message.length);
        if (fileExtention === "jpg" || fileExtention === "png" || fileExtention === "jpeg") {
          chatboxMessages.innerHTML += `<div class="cems__messages__item cems__messages__item--visitor_image" >
          <a href="${fileLink}" download target="_blank">
          <img src="${fileLink}" alt="" style="width:125px">
          </a>
      </div>`;
          chatboxMessageTime("visitor");
        } else {
          chatboxMessages.innerHTML += `<div class="cems__messages__item cems__messages__item--visitor"  >
      <a href="${fileLink}" download target="_blank">
      <img src="https://img.icons8.com/carbon-copy/100/000000/file.png" style="width:70px"/><br>
          <a href="${fileLink}" download target="_blank">${fileName}</a>
      </a>
      </div>`;
          chatboxMessageTime("visitor");
        }
      } else {
        chatboxMessages.innerHTML += `<div class="cems__messages__item cems__messages__item--visitor">${m.text}</div>`;
        chatboxMessageTime("visitor");
      }
    }
  });
  document.getElementById("cems__chatbox__messages").innerHTML = chatboxMessages.innerHTML;
  scrollBottom();
  return chatboxMessages.innerHTML;
};

let createMessageOutput = (message, time) => {
  let createTimeOutput = document.createElement("div");
  createTimeOutput.className = "cems__messages__time-operator";
  createTimeOutput.innerHTML = `${time}`;
  if (message.substring(0, 27) === "FiLe-https://tradazine.com/") {
    let fileExtention = message.split(".").pop().toLowerCase();
    let fileLink = message.slice(5, message.length);
    let fileName = message.slice(38, message.length);
    let createMessageOutput = document.createElement("div");
    if (fileExtention === "jpg" || fileExtention === "png" || fileExtention === "jpeg") {
      createMessageOutput.className = "cems__messages__item cems__messages__item--operator_image";
      createMessageOutput.innerHTML = `<a href="${fileLink}" download target="_blank">
      <img src="${fileLink}" alt="" style="width:125px">
      </a>`;
    } else {
      createMessageOutput.className = "cems__messages__item cems__messages__item--operator";
      createMessageOutput.innerHTML = `<a href="${fileLink}" download target="_blank">
      <img src="https://img.icons8.com/carbon-copy/100/000000/file.png" style="width:70px"/><br>
      <a href="${fileLink}" download target="_blank" style="color:#ffecec">${fileName}</a>
      </a>`;
    }
    document.getElementById("cems__chatbox__messages").appendChild(createMessageOutput);
    document.getElementById("cems__chatbox__messages").appendChild(createTimeOutput);
  } else {
    let createMessageOutput = document.createElement("div");
    createMessageOutput.className = "cems__messages__item cems__messages__item--operator";
    createMessageOutput.innerHTML = `${message}`;
    document.getElementById("cems__chatbox__messages").appendChild(createMessageOutput);
    document.getElementById("cems__chatbox__messages").appendChild(createTimeOutput);
  }
};
let sendMessage = async (id, message = null) => {
  let currentDateTime = getCurrentDateTime();
  if (selectFile !== undefined) {
    console.log('inselectFile')
    document.getElementById("sendMessageBtn").disabled = true;
    let formData = new FormData();
    formData.append("file", selectFile);

    let sendFile = await fetch(`https://tradazine.com/api/v1/store-chat-file`, {
      method: "POST",
      body: formData,
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${allDetails.access_token}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        document.getElementById(
          "cems_send_message"
        ).innerHTML = `<input id="cems__input__message" type="text" placeholder="Write a message..." autocomplete="off"/>`;
        selectFile = undefined;
        document.getElementById("sendMessageBtn").disabled = false;
        return data;
      });

    if (sendFile.errors) {
      alert(sendFile.errors.file[0]);
      cancelFileSend();
      return;
    }
    message = {
      text: `FiLe-https://tradazine.com/${sendFile.data.path}`,
      type: "TEXT",
      time: currentDateTime,
    };
  } else {
    if (message == null) {
      typeMessage = document.getElementById("cems__input__message").value;
      message = {
        text: typeMessage,
        type: "TEXT",
        time: currentDateTime,
      };
      document.getElementById("cems__input__message").value = "";
    }
  }

  if (message.text.length == 0) {
    alert("write something");
  } else {
    let exactMessagesData = chatListDataStore(
      message,
      id,
      allDetails.userName,
      "sent",
      currentDateTime
    );
    
    cancelFileSend();
    createMessageOutput(message.text, currentDateTime);
    var chatEl = document.getElementById("cems__chatbox__messages");
    chatEl.scrollTop = chatEl.scrollHeight;
    await agoraFunction.sendPeerMessage(message, exactMessagesData.chat_uid);
  }
};
let filesend = () => {
  document.getElementById("cems_file_upload").addEventListener("change", function (e) {
    selectFile = e.target.files[0];
    if (selectFile === undefined) {
      document.getElementById(
        "cems_send_message"
      ).innerHTML = `<input id="cems__input__message" type="text" placeholder="Write a message..." autocomplete="off"/>`;
    } else {
      let fileName = e.target.files[0].name;
      let fileExtention = fileName.split(".").pop().toLowerCase();
      if (fileName.length > 30) {
        fileName = fileName.substring(0, 30) + "..." + fileExtention;
      }
      document.getElementById("cems__inputfileOutputText").innerHTML = fileName;
      document.getElementById("cems__inputfileOutput").style.bottom = "61px";
    }
  });
};
let cancelFileSend = () => {
  selectFile = undefined;
  document.getElementById("cems__inputfileOutput").style.bottom = "-8px";
  document.getElementById("cems_file_upload").value = "";
};

let chatListDataStore = (message, id, name, type, time) => {
  let messageType;
  if (type == "sent") {
    messageType = 2;
  } else {
    messageType = 3;
  }

  let exactMessagesData = chatListData.find((d) => d.chat_uid == id);
  if (exactMessagesData == undefined) {
    exactMessagesData = friendList.find((data) => data.id == id);
    if (exactMessagesData === undefined) {
      exactMessagesData = friendList.find((data) => data.chat_uid == id);
      exactMessagesData.messages = [
        {
          messageType: messageType,
          text: message.text,
          timeStamp: time,
          username: name,
        },
      ];
    } else {
      exactMessagesData.messages = [
        {
          messageType: messageType,
          text: message.text,
          timeStamp: time,
          username: name,
        },
      ];
    }

    chatListData.unshift(exactMessagesData);
    document.getElementById("cems__chatbox__messages").innerHTML = "";
  } else {
    let withoutExactMessagesData = chatListData.filter((d) => d.chat_uid != id);
    if (exactMessagesData.messages.length == 0) {
      document.getElementById("cems__chatbox__messages").innerHTML = "";
    }
    exactMessagesData.messages.push({
      messageType: messageType,
      text: message.text,
      timeStamp: time,
      username: name,
    });
    chatListData = [exactMessagesData, ...withoutExactMessagesData];
  }
  return exactMessagesData;
};
// let newChatListStore = (message, id, name, type, time) => {
//   let messageType;
//   if (type == "sent") {
//     messageType = 2;
//   } else {
//     messageType = 3;
//   }

//   let exactMessagesData = newChatList.find((d) => d.chat_uid == id);
//   if (exactMessagesData == undefined) {
//     console.log(friendList)
//     exactMessagesData = friendList.find((data) => data.chat_uid == id);

//     exactMessagesData.messages = [
//       {
//         messageType: messageType,
//         text: message.text,
//         timeStamp: time,
//         username: name,
//       },
//     ];
//     newChatList.unshift(exactMessagesData);
//   } else {
//     let withoutExactMessagesData = newChatList.filter((d) => d.id != id);

//     exactMessagesData.messages.push({
//       messageType: 2,
//       text: message.text,
//       timeStamp: time,
//       username: allDetails.userName,
//     });

//     newChatList = [exactMessagesData, ...withoutExactMessagesData];
//   }
// };
let chatboxChating = (data) => {
  clickFriendId = data.chat_uid;
  return `
  <div class="cems__chatbox__header">
    <div class="cems__chat__details">
    <div id="cems__chatbox_backButton--header" onclick=backToChatList()>
    <img src="https://img.icons8.com/ios-filled/100/000000/left.png"/>
    </div>
    <div class="cems__chatHead__friend__icon">
      <p>${data.name.toUpperCase().charAt(0)}</p>
      <div id='cems__onlineOrOfflineIcon' class='cems__offlineIcon'></div>
    </div>
    <div class="cems__chatbox__content--header">
      <h4 class="cems__chatbox__heading--header">${data.name}</h4>
      <p id='cems__onlineOrOfflineText' class="cems__offlineText">Offline</p>
    </div>
  </div>
  <div class="cems__chat__callicon">
  <img src="https://img.icons8.com/material-outlined/96/0998f5/video-call.png"onclick=agoraFunction.audioVideoCall('video')>
  <img src="https://img.icons8.com/windows/96/0998f5/outgoing-call.png" onclick=agoraFunction.audioVideoCall('')>
  </div>
</div>
<div id="cems__chatbox__messages" class="cems__messageFor${data.chat_uid}">
  ${
    !data.messages.length
      ? `<p class="cems__no_found">No message found</p>`
      : `<p class="cems__no_found">Loading....</p>`
  }
</div>
<div id="cems__inputfileOutput" >
  <p id="cems__inputfileOutputText">
  cems_file_upload.png
  </p>
  <img src="https://img.icons8.com/material-outlined/96/ffffff/cancel--v1.png" onclick=cancelFileSend()>
</div>
<div class="cems__chatbox__footer_inmessage">
<label for="cems_file_upload"><img src="https://img.icons8.com/external-kmg-design-outline-color-kmg-design/64/000000/external-attachment-user-interface-kmg-design-outline-color-kmg-design.png"/></label>

<input type="file" id="cems_file_upload" name="cems_file_upload" style="display:none;">
  
  <div id="cems_send_message">
  <input id="cems__input__message" type="text" placeholder="Write a message..." autocomplete="off"/>
  </div>
  <button id="sendMessageBtn" class="cems__chatbox__send--footer" onclick=sendMessage('${data.chat_uid }')>
  <img src="https://img.icons8.com/material/96/03a9f4/filled-sent.png"> 
  </button>
  
</div>
  `;
};

// modal script************************
var modal = document.getElementById("cems__myModal");

// Get the button that opens the modal
var btn = document.getElementById("cems__myBtn");

// Get the <span> element that closes the modal

// When the user clicks the button, open the modal

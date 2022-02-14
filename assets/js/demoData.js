let calleeId = "s";
let calleeName = "";
let clickFriendId = "";
let selectFile = undefined;
let unreadMessageId = [];
let inMessages = false;
let options = {
  channel: "143142",
  uid: 143,
};
let allDetails = {
  userName: "",
  userId: "",
  access_token: "",
};
let newChatList = [];
let chatListData = [];
let friendList = [
];

window.addEventListener("beforeunload", function (e) {
  localStorage.setItem(`CemsChatDataFor${allDetails.userId}`, JSON.stringify(chatListData));
});

//   window.onbeforeunload = function(e) {
//     if(newChatList!==[]){
//       return (async () => {
//         await fetch(`https://tradazine.com/api/v1/store-chat-message?text=${JSON.stringify(newChatList)}`, {
//          method: 'POST',
//          headers: {
//            'Accept': 'application/json',
//            'Content-Type': 'application/json',
//            'Authorization': `Bearer ${allDetails.access_token}`
//          }
//        });
//      })();
//     }
//  };

let fetchData = (uid, allMessage = []) => {
  let testd = [];
  allMessage.map((am) => {
    let strStart = am.text[0];
    let strEnd = am.text[am.text.length - 1];
    if (strStart === "[" && strEnd === "]") {
      let parseAm = JSON.parse(am.text);
      parseAm.map((d) => {
        let isa = true;
        testd.map((td) => {
          if (d.id === td.id) {
            td.messages = [...td.messages, ...d.messages];
            isa = false;
          }
        });
        if (isa === true) {
          testd.unshift(d);
        }
      });
    } else {
      console.log(strStart, am.text[am.text.length - 2]);
    }
  });

  let data = JSON.parse(localStorage.getItem(`CemsChatDataFor${uid}`));
  if (data === null) {
    // friendList=[]
    // chatListData=[]
  } else {
    if (data === undefined) {
      chatListData = [];
    } else {
      chatListData = data;
    }
  }
  // chatListData=testd
  // addchangeUser(uid);
};
let addchangeUser = (uid) => {
  if (uid === "vexpo-242") {
    let withoutData = chatListData.filter((data) => data.chat_uid !== uid);
    let alData = chatListData.find((data) => data.chat_uid == "vexpo-243");
    chatListData = withoutData;
    if (alData === undefined) {
      chatListData.push({
        name: "user4",
        id: "vexpo-243",
        messages: [],
      });
    }
  } else {
    let withoutData = chatListData.filter((data) => data.chat_uid != uid);
    let alData = chatListData.find((data) => data.chat_uid == "vexpo-242");
    chatListData = withoutData;
    if (alData === undefined) {
      chatListData.push({
        name: "User3",
        id: "vexpo-242",
        messages: [],
      });
    }
  }
};

let getCurrentDateTime = () => {
  var myDate = new Date();

  let daysList = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  let monthsList = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Aug",
    "Oct",
    "Nov",
    "Dec",
  ];

  let date = myDate.getDate();
  let month = monthsList[myDate.getMonth()];
  let year = myDate.getFullYear();
  let day = daysList[myDate.getDay()];

  let today = `${date} ${month} ${year}`;

  let amOrPm;
  let twelveHours = function () {
    if (myDate.getHours() > 12) {
      amOrPm = "PM";
      let twentyFourHourTime = myDate.getHours();
      let conversion = twentyFourHourTime - 12;
      return `${conversion}`;
    } else {
      amOrPm = "AM";
      return `${myDate.getHours()}`;
    }
  };
  let hours = twelveHours();
  let minutes = myDate.getMinutes();

  let currentTime = `${hours}:${minutes} ${amOrPm}`;
  let currentDateTime=`${today} | ${currentTime}`
  return currentDateTime
};


class agoraFuntionality {
  constructor(getModalSection) {
    this.sections = {
      getModalSection: getModalSection,
      getCallingType: null,
    };
    this.localTracks = {
      localAudioTrack: null,
      localVideoTrack: null,
    };
    this.mute = false;
    this.rtcClient = null;
    this.uid = "";
    this.userName = "";
    this.appId = "";
    this.rtmToken = "";
    this.channelId = "";
    this.rtcToken = "";
    this.rtmClient = "";
    this.status = "ofline";
    this.remoteInvitation = null;
    this.localInvitation = null;
    this.rington = "https://file-examples-com.github.io/uploads/2017/11/file_example_MP3_700KB.mp3";
    this.collerTune = "https://audio.jukehost.co.uk/2OdnBtHkBRWn76r6YiNesNpb5PTNEg5b";
    this.tokenUrl = "http://47.241.99.15:5000";
    this.appCertificate = "";
  }
  hidecall(res) {
    this.stopCallerTune();
    this.stopRington();
    this.sections.getCallingType.innerHTML = res;
    document.getElementsByClassName("cems__callButtons")[0].style.display = "none";
    setTimeout(() => {
      this.status = "online";
      this.sections.getModalSection.style.display = "none";
    }, 1000);
  }
  playRington() {
    this.rington.play();
  }
  stopRington() {
    this.rington.pause();
    this.rington.currentTime = 0;
  }
  playCallerTune() {
    this.callerTune.play();
  }
  stopCallerTune() {
    this.callerTune.pause();
    this.currentTime = 0;
  }
  async logout() {
    this.rtmClient.logout().then(() => {
      document.getElementById("cems__chatbox__button").classList.add("cems__hide__section");
    });
  }
  async login(uid, name, appId, access_token) {
    this.uid = uid;
    this.appId = appId;
    this.userName = name;
    this.rtmToken = await this.createAgoraRtmToken(uid);
    this.rtmClient = AgoraRTM.createInstance(appId);
    await this.rtmClient
      .login({ uid, token: this.rtmToken })
      .then(async () => {
        // let data=await getChatData(access_token,uid)
        this.peerMessageRecive();
        this.RemoteInvitationReceived();
        this.status = "online";
        allDetails.userName = name;
        allDetails.userId = uid;
        allDetails.access_token = access_token;
        document.getElementById("cems__chatbox__button").classList.remove("cems__hide__section");
        fetchData(uid);
        gotoChatList();
        friendList = await getFriendListData(access_token, uid);
      })
      .catch((err) => {
        console.log(err);
      });
  }
  init(uid, name, appId, access_token, rington, callerTune, tokenUrl, appCertificate) {
    if (tokenUrl != undefined) {
      this.tokenUrl = tokenUrl;
    }
    if (rington != undefined) {
      this.rington = new Audio(rington);
    }
    if (callerTune != undefined) {
      this.callerTune = new Audio(callerTune);
    }
    this.appCertificate = appCertificate;
    this.login(uid.toString(), name, appId, access_token);
  }
  async createAgoraRtmToken(userName) {
    try {
      const response = await axios.get(
        `${this.tokenUrl}/token/?username=${userName}&channelName=${userName}&appID=${this.appId}&appCertificate=${this.appCertificate}`
      );
      return await response.data.rtmToken;
    } catch (error) {
      console.error(error);
    }
  }
  async createAgoraRtcToken(id) {
    this.callid = id;
    console.log(`${this.tokenUrl}/rtc-uid-token/?uid=${id}&channelName=${this.channelId}&appID=${this.appId}&appCertificate=${this.appCertificate}`);
    try {
      const response = await axios.get(
        `${this.tokenUrl}/rtc-uid-token/?uid=${id}&channelName=${this.channelId}&appID=${this.appId}&appCertificate=${this.appCertificate}`
      );
      return await response.data.token;
    } catch (error) {
      console.error(error);
    }
  }
  async sendPeerMessage(message, peerId) {
    scrollBottom();
    if (message.type == "call") {
      return;
    }
    await this.rtmClient.sendMessageToPeer({ text: message.text }, peerId.toString()).then((sendResult) => {
      if (sendResult.hasPeerReceived) {
        console.log("message recived");
      } else {
        console.log("message send");
      }
    });
  }
  async checkPeerOnlineStatus(peerId) {
    return await this.rtmClient.queryPeersOnlineStatus([peerId.toString()]).then((res) => {
      return res[peerId.toString()];
    });
  }
  peerMessageRecive() {
    this.rtmClient.on("MessageFromPeer", function (message, peerId, proper) {
      let withOutUnreadMessageId = unreadMessageId.filter((id) => id != peerId);
      unreadMessageId = [...withOutUnreadMessageId, peerId];
      reciveMessageStoreAndOutput(message, peerId);
    });
  }

  audioVideoCall = async (type) => {
    if (this.localInvitation != null) {
      this.localInvitation.removeAllListeners();
      this.localInvitation = null;
    }
    this.localInvitation = this.rtmClient.createLocalInvitation(calleeId.toString());

    this.localInvitationEvents();
    this.channelId = this.uid;
    this.localInvitation._channelId = this.uid;
    this.localInvitation._content = type;
    this.calltype = type;
    this.localInvitation.send();
    this.sections.getModalSection.innerHTML = outgoinCallOutput(type);
    this.sections.getCallingType = document.getElementById("callingType");
    this.status = "busy";
    this.sections.getModalSection.style.display = "flex";
    sendMessage(calleeId, { text: `You gave ${calleeName} a ${type} call `, type: "call" });
    this.rtcToken = await this.createAgoraRtcToken(1);
    this.joinReciveCallReciver(this.calltype);
  };

  localInvitationEvents = () => {
    // Send call invitation

    this.localInvitation.on("LocalInvitationReceivedByPeer", (r) => {
      this.sections.getCallingType.innerHTML = `Calling ${calleeName}`;
      this.playCallerTune();
    });
    this.localInvitation.on("LocalInvitationAccepted", (r) => {
      this.stopCallerTune();
      this.joinReciveCallSender(this.calltype);
      recivedCallOutput(this.calltype);
    });

    this.localInvitation.on("LocalInvitationCanceled", (r) => {
      console.log("LocalInvitationCanceled" + r);
    });

    this.localInvitation.on("LocalInvitationRefused", (r) => {
      this.hidecall(`${calleeName} busy now`);
    });
    this.localInvitation.on("LocalInvitationFailure", (r) => {
      this.hidecall(r);
    });
  };

  cancelOutgoingCall() {
    this.localInvitation.cancel();
    this.stopCallerTune();
    this.status = "online";
    this.sections.getModalSection.style.display = "none";
  }

  async RemoteInvitationReceived() {
    this.rtmClient.on("RemoteInvitationReceived", async (remoteInvitation) => {
      if (this.status != "online") {
        remoteInvitation.refuse();
        return;
      }
      if (this.remoteInvitation != null) {
        this.remoteInvitation.removeAllListeners();
        this.remoteInvitation = null;
      }
      this.remoteInvitation = remoteInvitation;
      this.channelId = remoteInvitation._channelId;
      this.rtcToken = await this.createAgoraRtcToken(2);
      this.calltype = remoteInvitation._content.toLowerCase();
      this.caller = friendList.find((f) => f.chat_uid === remoteInvitation.callerId);
      incomingCallOutput(this.caller.name, this.calltype);
      this.playRington();
      this.sections.getCallingType = document.getElementById("callingType");
      this.status = "busy";
      this.sections.getModalSection.style.display = "flex";
      this.peerEvents();
      reciveMessageStoreAndOutput({ text: `${this.caller.name} called You`, type: "call" }, remoteInvitation.callerId);
      this.joinReciveCallReciver(this.calltype);
    });
  }

  peerEvents = () => {
    this.remoteInvitation.on("RemoteInvitationReceived", (r) => {
      console.log("RemoteInvitationReceived" + r);
    });
    this.remoteInvitation.on("RemoteInvitationAccepted", (r) => {
      this.stopRington();
      this.joinReciveCallSender(this.calltype);
      recivedCallOutput(this.calltype);
    });
    this.remoteInvitation.on("RemoteInvitationCanceled", (r) => {
      this.hidecall(`${this.caller.name} canceled the call`);
    });
    this.remoteInvitation.on("RemoteInvitationRefused", (r) => {
      this.hidecall();
      console.log("RemoteInvitationRefused " + r);
    });
    this.remoteInvitation.on("RemoteInvitationFailure", (r) => {
      this.hidecall(r);
    });
  };
  cancelIncomingCall() {
    this.remoteInvitation.refuse();
    this.status = "online";
    this.sections.getModalSection.style.display = "none";
  }
  reciveIncomingCall() {
    this.remoteInvitation.accept();
  }
  // ********** video *************

  async joinReciveCallReciver(type) {
    this.rtcClient = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
    this.rtcClient.on("user-published", async (user, mediaType) => {
      await this.rtcClient.subscribe(user, mediaType);
      console.log("subscribe success");
      if (type == "video") {
        if (mediaType === "video") {
          const remoteVideoTrack = user.videoTrack;
          const fricon = document.getElementById("cems__call__reciver");
          remoteVideoTrack.play(fricon);
        }
      }

      if (mediaType === "audio") {
        const remoteAudioTrack = user.audioTrack;
        remoteAudioTrack.play();
      }
      this.rtcClient.on("user-unpublished", async (user, mediaType) => {
        console.log("unpublish", user, mediaType);
      });
      this.rtcClient.on("user-info-updated", async (user, msg) => {
        console.log("updated", user, msg);
      });
      this.rtcClient.on("user-left", async (user, res) => {
        this.localTracks.localAudioTrack.close();
        this.localTracks.localVideoTrack && this.localTracks.localVideoTrack.close();
        this.localTracks.screenVideoTrack && this.localTracks.screenVideoTrack.close();
        // Leave the channe.
        await this.rtcClient.leave();
        this.sections.getModalSection.style.display = "none";
        this.status = "online";
        clearInterval(callInterval);
        mute = false;
      });
    });
  }
  async joinReciveCallSender(type) {
    await this.rtcClient.join(this.appId, this.channelId, this.rtcToken, this.callid);
    this.localTracks.localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();
    if (type == "video") {
      this.localTracks.localVideoTrack = await AgoraRTC.createCameraVideoTrack();
      await this.rtcClient.publish([this.localTracks.localAudioTrack, this.localTracks.localVideoTrack]);
      const mycon = document.getElementById("cems__call__sender");
      this.localTracks.localVideoTrack.play(mycon);
    } else {
      await this.rtcClient.publish([this.localTracks.localAudioTrack]);
    }

    console.log("publish success!");
  }

  muteAudio() {
    this.localTracks.localAudioTrack.close();
  }
  async unmuteAudio() {
    this.localTracks.localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();
    await this.rtcClient.publish([this.localTracks.localAudioTrack]);
  }
  async screenshareOn() {
    this.localTracks.screenVideoTrack = await AgoraRTC.createScreenVideoTrack();
    if (this.localTracks.localVideoTrack) {
      await this.rtcClient.unpublish([this.localTracks.localVideoTrack]);
      this.localTracks.localVideoTrack.close();
    }
    await this.rtcClient.publish([this.localTracks.screenVideoTrack]);
    const mycon = document.getElementById("cems__call__sender");
    this.localTracks.screenVideoTrack.play(mycon);
    let getscreenShareBtn = document.getElementById("cems_shareScreenBtn");
    getscreenShareBtn.innerHTML = `<svg class="cems__cancleBtn"   onclick=screenshare() xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="50" height="50" viewBox="0 0 172 172" style=" fill:#000000;"><g fill="none" fill-rule="nonzero" stroke="none" stroke-width="1" stroke-linecap="butt" stroke-linejoin="miter" stroke-miterlimit="10" stroke-dasharray="" stroke-dashoffset="0" font-family="none" font-weight="none" font-size="none" text-anchor="none" style="mix-blend-mode: normal"><path d="M0,172v-172h172v172z" fill="none"></path><path d="M86,172c-47.49649,0 -86,-38.50351 -86,-86v0c0,-47.49649 38.50351,-86 86,-86v0c47.49649,0 86,38.50351 86,86v0c0,47.49649 -38.50351,86 -86,86z" fill="#e74c3c"></path><g fill="#ffffff"><path d="M39.6288,39.6288c-5.36739,0 -9.76236,4.39497 -9.76236,9.76236v43.93061c0,5.36739 4.39497,9.76236 9.76236,9.76236h24.40589v19.52472c0,5.36739 4.39497,9.76236 9.76236,9.76236h58.57415c5.36739,0 9.76236,-4.39497 9.76236,-9.76236v-43.93061c0,-5.36739 -4.39497,-9.76236 -9.76236,-9.76236h-24.40589v-19.52472c0,-5.36739 -4.39497,-9.76236 -9.76236,-9.76236zM39.6288,44.50998h58.57415c2.7266,0 4.88118,2.15458 4.88118,4.88118v19.52472h-29.28707c-5.36739,0 -9.76236,4.39497 -9.76236,9.76236v19.52472h-24.40589c-2.72659,0 -4.88118,-2.15458 -4.88118,-4.88118v-43.93061c0,-2.72659 2.15458,-4.88118 4.88118,-4.88118zM73.79705,73.79705h58.57415c2.7266,0 4.88118,2.15458 4.88118,4.88118v43.93061c0,2.7266 -2.15458,4.88118 -4.88118,4.88118h-58.57415c-2.72659,0 -4.88118,-2.15458 -4.88118,-4.88118v-21.50769c0.06674,-0.32414 0.06674,-0.66735 0,-0.99149v-21.43143c0,-2.72659 2.15458,-4.88118 4.88118,-4.88118z"></path></g></g></svg>`;
    this.localTracks.screenVideoTrack.on("track-ended", async () => {
      screenshare();
    });
  }
  async screenshareOff() {
    this.rtcClient.unpublish([this.localTracks.screenVideoTrack]);
    this.localTracks.screenVideoTrack.close();
    this.localTracks.localVideoTrack = await AgoraRTC.createCameraVideoTrack();
    await this.rtcClient.publish([this.localTracks.localVideoTrack]);
    const mycon = document.getElementById("cems__call__sender");
    this.localTracks.localVideoTrack.play(mycon);
  }
  async leaveReciveCall() {
    this.localTracks.localVideoTrack && this.localTracks.localVideoTrack.close();
    this.localTracks.screenVideoTrack && this.localTracks.screenVideoTrack.close();
    this.localTracks.localAudioTrack.close();
    // Leave the channel.
    await this.rtcClient.leave();
    this.sections.getModalSection.style.display = "none";
    this.status = "online";
    clearInterval(callInterval);
    mute = false;
  }
}

let getModalSection = document.getElementById("cems__myModal");
let agoraFunction = new agoraFuntionality(getModalSection);

let cancelOutgoingCall = () => {
  agoraFunction.cancelOutgoingCall();
};
let reciveIncomingCall = () => {
  agoraFunction.reciveIncomingCall();
};
let cancelIncoingCall = () => {
  agoraFunction.cancelIncomingCall();
};
let cancelRecivedCall = () => {
  agoraFunction.leaveReciveCall();
};
let screenShare = false;
let screenshare = () => {
  let getscreenShareBtn = document.getElementById("cems_shareScreenBtn");
  if (screenShare !== false) {
    agoraFunction.screenshareOff();
    getscreenShareBtn.innerHTML = `<svg class="cems__cancleBtn"   onclick=screenshare() xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="100" height="100" viewBox="0 0 172 172" style=" fill:#000000;"><g transform=""><g fill="none" fill-rule="nonzero" stroke="none" stroke-width="1" stroke-linecap="butt" stroke-linejoin="miter" stroke-miterlimit="10" stroke-dasharray="" stroke-dashoffset="0" font-family="none" font-weight="none" font-size="none" text-anchor="none" style="mix-blend-mode: normal"><path d="M0,172v-172h172v172z" fill="none"></path><path d="M86,172c-47.49649,0 -86,-38.50351 -86,-86v0c0,-47.49649 38.50351,-86 86,-86v0c47.49649,0 86,38.50351 86,86v0c0,47.49649 -38.50351,86 -86,86z" fill="#2ecc71"></path><g fill="#ffffff"><path d="M36.464,36.464c-5.73371,0 -10.42863,4.69492 -10.42863,10.42863v46.92884c0,5.73371 4.69492,10.42863 10.42863,10.42863h26.07158v20.85726c0,5.73371 4.69492,10.42863 10.42863,10.42863h62.57179c5.73371,0 10.42863,-4.69492 10.42863,-10.42863v-46.92884c0,-5.73371 -4.69492,-10.42863 -10.42863,-10.42863h-26.07158v-20.85726c0,-5.73371 -4.69492,-10.42863 -10.42863,-10.42863zM36.464,41.67832h62.57179c2.91269,0 5.21432,2.30163 5.21432,5.21432v20.85726h-31.28589c-5.73371,0 -10.42863,4.69492 -10.42863,10.42863v20.85726h-26.07158c-2.91268,0 -5.21432,-2.30163 -5.21432,-5.21432v-46.92884c0,-2.91268 2.30163,-5.21432 5.21432,-5.21432zM72.96421,72.96421h62.57179c2.91269,0 5.21432,2.30163 5.21432,5.21432v46.92884c0,2.91269 -2.30163,5.21432 -5.21432,5.21432h-62.57179c-2.91268,0 -5.21432,-2.30163 -5.21432,-5.21432v-22.97558c0.07129,-0.34626 0.07129,-0.71289 0,-1.05916v-22.89411c0,-2.91268 2.30163,-5.21432 5.21432,-5.21432z"></path></g><path d="" fill="none"></path></g></g></svg>`;
  } else {
    agoraFunction.screenshareOn();
  }
  screenShare = !screenShare;
};
let createRecivedMessageOutput = (message, peerId, time) => {
  let createMessageOutput = document.createElement("div");
  let createTimeOutput = document.createElement("div");
  createTimeOutput.className = "cems__messages__time-visitor";
  createTimeOutput.innerHTML = `${time}`;
  if (message.substring(0, 27) === "FiLe-https://tradazine.com/") {
    let fileExtention = message.split(".").pop().toLowerCase();
    let fileLink = message.slice(5, message.length);
    let fileName = message.slice(38, message.length);

    if (fileExtention === "jpg" || fileExtention === "png" || fileExtention === "jpeg") {
      createMessageOutput.className = "cems__messages__item cems__messages__item--visitor_image";
      createMessageOutput.innerHTML = ` <a href="${fileLink}" download target="_blank">
      <img src="${fileLink}" alt="" style="width:125px">
      </a>`;
    } else {
      createMessageOutput.className = "cems__messages__item cems__messages__item--visitor";
      createMessageOutput.innerHTML = ` <a href="${fileLink}" download target="_blank">
      <img src="https://img.icons8.com/carbon-copy/100/000000/file.png" style="width:70px"/><br>
          <a href="${fileLink}" download target="_blank">${fileName}</a>
      </a>`;
    }
  } else {
    createMessageOutput.className = "cems__messages__item cems__messages__item--visitor";
    createMessageOutput.innerHTML = `${message}`;
  }
  let className = peerId;
  let isClass = document.getElementsByClassName(`cems__messageFor${className}`)[0];
  if (inMessages == true) {
    if (isClass != undefined) {
      unreadMessageId = unreadMessageId.filter((uid) => uid != peerId);
      isClass.appendChild(createMessageOutput);
      isClass.appendChild(createTimeOutput);
    }
  }
};
let mute = false;
let mutecontrol = () => {
  let getMuteButton = document.getElementById("muteMicrophone");
  if (mute !== false) {
    agoraFunction.unmuteAudio();
    getMuteButton.innerHTML = `<svg class="cems__cancleBtn"   onclick=mutecontrol() xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="96" height="96" viewBox="0 0 172 172" style=" fill:#000000;"><g fill="none" fill-rule="nonzero" stroke="none" stroke-width="1" stroke-linecap="butt" stroke-linejoin="miter" stroke-miterlimit="10" stroke-dasharray="" stroke-dashoffset="0" font-family="none" font-weight="none" font-size="none" text-anchor="none" style="mix-blend-mode: normal"><path d="M0,172v-172h172v172z" fill="none"></path><path d="M86,172c-47.49649,0 -86,-38.50351 -86,-86v0c0,-47.49649 38.50351,-86 86,-86v0c47.49649,0 86,38.50351 86,86v0c0,47.49649 -38.50351,86 -86,86z" fill="#2ecc71"></path><g fill="#ffffff"><path d="M86,27.95c-9.50013,0 -17.2,7.69987 -17.2,17.2v34.4c0,9.50013 7.69987,17.2 17.2,17.2c9.50013,0 17.2,-7.69987 17.2,-17.2v-34.4c0,-9.50013 -7.69987,-17.2 -17.2,-17.2zM52.10391,79.55c-3.4744,0 -6.2728,3.08292 -5.71094,6.51719c2.80864,17.19838 16.56553,30.68637 33.8737,33.16823v11.91458c0,3.1648 2.56853,5.73333 5.73333,5.73333c3.1648,0 5.73333,-2.56853 5.73333,-5.73333v-11.91458c17.30817,-2.48186 31.06506,-15.96985 33.8737,-33.16823c0.56187,-3.43427 -2.23654,-6.51719 -5.71094,-6.51719c-2.83227,0 -5.16788,2.08443 -5.64375,4.88229c-2.322,13.50201 -14.08527,23.78438 -28.25234,23.78438c-14.16707,0 -25.93034,-10.28237 -28.25234,-23.78438c-0.47587,-2.79786 -2.80575,-4.88229 -5.64375,-4.88229z"></path></g></g></svg>
    `;
  } else {
    agoraFunction.muteAudio();
    getMuteButton.innerHTML = `<svg class="cems__cancleBtn"   onclick=mutecontrol() xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="90" height="90" viewBox="0 0 172 172" style=" fill:#000000;"><g fill="none" fill-rule="nonzero" stroke="none" stroke-width="1" stroke-linecap="butt" stroke-linejoin="miter" stroke-miterlimit="10" stroke-dasharray="" stroke-dashoffset="0" font-family="none" font-weight="none" font-size="none" text-anchor="none" style="mix-blend-mode: normal"><path d="M0,172v-172h172v172z" fill="none"></path><path d="M86,172c-47.49649,0 -86,-38.50351 -86,-86v0c0,-47.49649 38.50351,-86 86,-86v0c47.49649,0 86,38.50351 86,86v0c0,47.49649 -38.50351,86 -86,86z" fill="#2ecc71"></path><g fill="#ffffff"><path d="M25.02958,18.54375l-6.48583,6.48583l128.42667,128.42667l6.48583,-6.48583l-38.34167,-38.34167c1.90629,-4.09492 2.99208,-8.64437 2.99208,-13.45542v-18.34667c0,-2.53643 -2.05024,-4.58667 -4.58667,-4.58667c-2.53643,0 -4.58667,2.05024 -4.58667,4.58667v18.34667c0,2.19677 -0.40004,4.27979 -0.99438,6.27979l-8.17896,-8.17896v-53.14084c0,-7.60011 -6.15989,-13.76 -13.76,-13.76c-7.60011,0 -13.76,6.15989 -13.76,13.76v25.62084zM54.92354,74.04958c-0.60544,0.77515 -1.03021,1.71298 -1.03021,2.77708v18.34667c0,16.14048 11.98955,29.50108 27.52,31.73938v9.54062h-13.76c-2.53643,0 -4.58667,2.05024 -4.58667,4.58667c0,2.53643 2.05024,4.58667 4.58667,4.58667h36.69333c2.53643,0 4.58667,-2.05024 4.58667,-4.58667c0,-2.53643 -2.05024,-4.58667 -4.58667,-4.58667h-13.76v-9.54062c4.55915,-0.65589 8.79916,-2.29161 12.53271,-4.65833l-6.74562,-6.74562c-3.12811,1.60992 -6.62186,2.59792 -10.37375,2.59792c-12.64544,0 -22.93333,-10.28789 -22.93333,-22.93333v-12.97167zM72.24,91.375v3.79833c0,7.60011 6.15989,13.76 13.76,13.76c1.16043,0 2.26818,-0.18626 3.34146,-0.45687z"></path></g></g></svg>`;
  }
  mute = !mute;
};
let videoshare = false;
let videoControl = () => {
  let getVideoMuteBtn = document.getElementById("cems_videomuteBtn");
  if (videoshare == false) {
    getVideoMuteBtn.innerHTML = `<svg class="cems__reciveBtn" onclick=videoControl() xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="96" height="96" viewBox="0 0 172 172" style=" fill:#000000;"><g fill="none" fill-rule="nonzero" stroke="none" stroke-width="1" stroke-linecap="butt" stroke-linejoin="miter" stroke-miterlimit="10" stroke-dasharray="" stroke-dashoffset="0" font-family="none" font-weight="none" font-size="none" text-anchor="none" style="mix-blend-mode: normal"><path d="M0,172v-172h172v172z" fill="none"></path><path d="M86,172c-47.49649,0 -86,-38.50351 -86,-86v0c0,-47.49649 38.50351,-86 86,-86v0c47.49649,0 86,38.50351 86,86v0c0,47.49649 -38.50351,86 -86,86z" fill="#e74c3c"></path><g fill="#ffffff"><path d="M41.77143,51.6c-5.42046,0 -9.82857,4.40811 -9.82857,9.82857v49.14286c0,5.42046 4.40811,9.82857 9.82857,9.82857h63.88571c5.42046,0 9.82857,-4.40811 9.82857,-9.82857v-14.33973l16.58571,13.26473c0.88949,0.70766 1.97554,1.075 3.07143,1.075c0.7224,0 1.45263,-0.16516 2.1308,-0.48951c1.70526,-0.81577 2.78348,-2.53769 2.78348,-4.42478v-39.31429c0,-1.88709 -1.07822,-3.61369 -2.78348,-4.43438c-1.70034,-0.81086 -3.72795,-0.58434 -5.20223,0.59509l-16.58571,13.26473v-14.33973c0,-5.42046 -4.40811,-9.82857 -9.82857,-9.82857z"></path></g></g></svg>`;
  } else {
    getVideoMuteBtn.innerHTML = `<svg class="cems__reciveBtn" onclick=videoControl() xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="96" height="96" viewBox="0 0 172 172" style=" fill:#000000;"><g fill="none" fill-rule="nonzero" stroke="none" stroke-width="1" stroke-linecap="butt" stroke-linejoin="miter" stroke-miterlimit="10" stroke-dasharray="" stroke-dashoffset="0" font-family="none" font-weight="none" font-size="none" text-anchor="none" style="mix-blend-mode: normal"><path d="M0,172v-172h172v172z" fill="none"></path><path d="M86,172c-47.49649,0 -86,-38.50351 -86,-86v0c0,-47.49649 38.50351,-86 86,-86v0c47.49649,0 86,38.50351 86,86v0c0,47.49649 -38.50351,86 -86,86z" fill="#2aa826"></path><g fill="#ffffff"><path d="M53.93429,61.06c-3.92983,0 -7.12571,3.19588 -7.12571,7.12571v35.62857c0,3.92983 3.19588,7.12571 7.12571,7.12571h46.31714c3.92983,0 7.12571,-3.19588 7.12571,-7.12571v-10.39631l12.02464,9.61693c0.64488,0.51305 1.43227,0.77937 2.22679,0.77937c0.52374,0 1.05316,-0.11974 1.54483,-0.35489c1.23631,-0.59143 2.01802,-1.83983 2.01802,-3.20796v-28.50286c0,-1.36814 -0.78171,-2.61992 -2.01802,-3.21492c-1.23275,-0.58787 -2.70276,-0.42365 -3.77162,0.43144l-12.02464,9.61693v-10.39631c0,-3.92983 -3.19588,-7.12571 -7.12571,-7.12571z"></path></g></g></svg>`;
  }
  videoshare = !videoshare;
};
let recivedCallOutput = (type) => {
  let output = `
  <div id="cems__callsection">
       
       ${
         type == "video"
           ? `<div id="cems__recivedcall__content">
         <div id="cems__call__sender">
          <div>
            <p>Your camera off</p>
          </div>
         </div>
         <div id="cems__call__reciver">
          <div>
            <p>Your friend's camera off</p>
          </div>
          </div>`
           : `<div id="cems__call__content">
         <div  class="cems__callImage" >
           <img class="cems__callImage" src="https://img.icons8.com/ios/50/000000/user-male-circle.png"/>
         <h4 id='callingType'> Talking with ${calleeName} </h4>
       </div>
         `
       }
         <div id="cams__call__timer"><span id="minutes"></span>:<span id="seconds"></span></div>
         <div class="cems__callButtons" >
        <span id="muteMicrophone" ><svg class="cems__cancleBtn"   onclick=mutecontrol() xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="96" height="96" viewBox="0 0 172 172" style=" fill:#000000;"><g fill="none" fill-rule="nonzero" stroke="none" stroke-width="1" stroke-linecap="butt" stroke-linejoin="miter" stroke-miterlimit="10" stroke-dasharray="" stroke-dashoffset="0" font-family="none" font-weight="none" font-size="none" text-anchor="none" style="mix-blend-mode: normal"><path d="M0,172v-172h172v172z" fill="none"></path><path d="M86,172c-47.49649,0 -86,-38.50351 -86,-86v0c0,-47.49649 38.50351,-86 86,-86v0c47.49649,0 86,38.50351 86,86v0c0,47.49649 -38.50351,86 -86,86z" fill="#2ecc71"></path><g fill="#ffffff"><path d="M86,27.95c-9.50013,0 -17.2,7.69987 -17.2,17.2v34.4c0,9.50013 7.69987,17.2 17.2,17.2c9.50013,0 17.2,-7.69987 17.2,-17.2v-34.4c0,-9.50013 -7.69987,-17.2 -17.2,-17.2zM52.10391,79.55c-3.4744,0 -6.2728,3.08292 -5.71094,6.51719c2.80864,17.19838 16.56553,30.68637 33.8737,33.16823v11.91458c0,3.1648 2.56853,5.73333 5.73333,5.73333c3.1648,0 5.73333,-2.56853 5.73333,-5.73333v-11.91458c17.30817,-2.48186 31.06506,-15.96985 33.8737,-33.16823c0.56187,-3.43427 -2.23654,-6.51719 -5.71094,-6.51719c-2.83227,0 -5.16788,2.08443 -5.64375,4.88229c-2.322,13.50201 -14.08527,23.78438 -28.25234,23.78438c-14.16707,0 -25.93034,-10.28237 -28.25234,-23.78438c-0.47587,-2.79786 -2.80575,-4.88229 -5.64375,-4.88229z"></path></g></g></svg>
        </span>
         ${
           type == "video"
             ? `<span id="cems_shareScreenBtn"><svg class="cems__cancleBtn"   onclick=screenshare() xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="100" height="100" viewBox="0 0 172 172" style=" fill:#000000;"><g transform=""><g fill="none" fill-rule="nonzero" stroke="none" stroke-width="1" stroke-linecap="butt" stroke-linejoin="miter" stroke-miterlimit="10" stroke-dasharray="" stroke-dashoffset="0" font-family="none" font-weight="none" font-size="none" text-anchor="none" style="mix-blend-mode: normal"><path d="M0,172v-172h172v172z" fill="none"></path><path d="M86,172c-47.49649,0 -86,-38.50351 -86,-86v0c0,-47.49649 38.50351,-86 86,-86v0c47.49649,0 86,38.50351 86,86v0c0,47.49649 -38.50351,86 -86,86z" fill="#2ecc71"></path><g fill="#ffffff"><path d="M36.464,36.464c-5.73371,0 -10.42863,4.69492 -10.42863,10.42863v46.92884c0,5.73371 4.69492,10.42863 10.42863,10.42863h26.07158v20.85726c0,5.73371 4.69492,10.42863 10.42863,10.42863h62.57179c5.73371,0 10.42863,-4.69492 10.42863,-10.42863v-46.92884c0,-5.73371 -4.69492,-10.42863 -10.42863,-10.42863h-26.07158v-20.85726c0,-5.73371 -4.69492,-10.42863 -10.42863,-10.42863zM36.464,41.67832h62.57179c2.91269,0 5.21432,2.30163 5.21432,5.21432v20.85726h-31.28589c-5.73371,0 -10.42863,4.69492 -10.42863,10.42863v20.85726h-26.07158c-2.91268,0 -5.21432,-2.30163 -5.21432,-5.21432v-46.92884c0,-2.91268 2.30163,-5.21432 5.21432,-5.21432zM72.96421,72.96421h62.57179c2.91269,0 5.21432,2.30163 5.21432,5.21432v46.92884c0,2.91269 -2.30163,5.21432 -5.21432,5.21432h-62.57179c-2.91268,0 -5.21432,-2.30163 -5.21432,-5.21432v-22.97558c0.07129,-0.34626 0.07129,-0.71289 0,-1.05916v-22.89411c0,-2.91268 2.30163,-5.21432 5.21432,-5.21432z"></path></g><path d="" fill="none"></path></g></g></svg>
           </span>
           
           `
             : ""
         }
         <svg class="cems__cancleBtn"  id="recivedCallCancle" onclick=cancelRecivedCall() xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="96" height="96" viewBox="0 0 172 172" style=" fill:#000000;"><g transform=""><g fill="none" fill-rule="nonzero" stroke="none" stroke-width="1" stroke-linecap="butt" stroke-linejoin="miter" stroke-miterlimit="10" stroke-dasharray="" stroke-dashoffset="0" font-family="none" font-weight="none" font-size="none" text-anchor="none" style="mix-blend-mode: normal"><path d="M0,172v-172h172v172z" fill="none"></path><path d="M86,172c-47.49649,0 -86,-38.50351 -86,-86v0c0,-47.49649 38.50351,-86 86,-86v0c47.49649,0 86,38.50351 86,86v0c0,47.49649 -38.50351,86 -86,86z" fill="#ff0000"></path><g fill="#ffffff"><path d="M121.73829,99.31467c-5.2127,0 -10.33071,-0.81528 -15.18081,-2.41812c-2.37655,-0.81066 -5.29815,-0.06698 -6.74856,1.4227l-9.57317,7.22665c-11.1021,-5.92636 -17.94074,-12.76269 -23.78626,-23.78165l7.01417,-9.32374c1.82225,-1.81994 2.47586,-4.47826 1.69292,-6.97259c-1.60977,-4.8755 -2.42736,-9.9912 -2.42736,-15.20621c0,-3.76691 -3.0648,-6.83171 -6.83171,-6.83171h-15.63579c-3.76691,0 -6.83171,3.0648 -6.83171,6.83171c0,43.17973 35.12856,78.30829 78.30829,78.30829c3.76691,0 6.83171,-3.0648 6.83171,-6.83171v-15.59191c0,-3.76691 -3.0648,-6.83171 -6.83171,-6.83171z"></path></g><path d="" fill="none"></path></g></g></svg>
         </div>
         
       </div>
   </div>
  `;
  // <span id="cems_videomuteBtn">
  //               <svg class="cems__reciveBtn" onclick=videoControl() xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="96" height="96" viewBox="0 0 172 172" style=" fill:#000000;"><g fill="none" fill-rule="nonzero" stroke="none" stroke-width="1" stroke-linecap="butt" stroke-linejoin="miter" stroke-miterlimit="10" stroke-dasharray="" stroke-dashoffset="0" font-family="none" font-weight="none" font-size="none" text-anchor="none" style="mix-blend-mode: normal"><path d="M0,172v-172h172v172z" fill="none"></path><path d="M86,172c-47.49649,0 -86,-38.50351 -86,-86v0c0,-47.49649 38.50351,-86 86,-86v0c47.49649,0 86,38.50351 86,86v0c0,47.49649 -38.50351,86 -86,86z" fill="#2aa826"></path><g fill="#ffffff"><path d="M53.93429,61.06c-3.92983,0 -7.12571,3.19588 -7.12571,7.12571v35.62857c0,3.92983 3.19588,7.12571 7.12571,7.12571h46.31714c3.92983,0 7.12571,-3.19588 7.12571,-7.12571v-10.39631l12.02464,9.61693c0.64488,0.51305 1.43227,0.77937 2.22679,0.77937c0.52374,0 1.05316,-0.11974 1.54483,-0.35489c1.23631,-0.59143 2.01802,-1.83983 2.01802,-3.20796v-28.50286c0,-1.36814 -0.78171,-2.61992 -2.01802,-3.21492c-1.23275,-0.58787 -2.70276,-0.42365 -3.77162,0.43144l-12.02464,9.61693v-10.39631c0,-3.92983 -3.19588,-7.12571 -7.12571,-7.12571z"></path></g></g></svg>
  //          </span>
  getModalSection.innerHTML = output;
  callTimer();
};
let callInterval;
let callTimer = () => {
  var sec = 0;
  function pad(val) {
    return val > 9 ? val : "0" + val;
  }
  callInterval = setInterval(function () {
    document.getElementById("seconds").innerHTML = pad(++sec % 60);
    document.getElementById("minutes").innerHTML = pad(parseInt(sec / 60, 10));
  }, 1000);
};
let outgoinCallOutput = (type) => {
  return `
  <div id="cems__callsection">
       <div id="cems__call__content">
         <h3 class="cems__calltype">Outgoing Call</h3>
         <div  class="cems__callImage" >
           <img class="cems__callImage" src="https://img.icons8.com/ios/50/000000/user-male-circle.png"/>
         <h4 id='callingType'> Call ${calleeName} </h4>
         <div class="cems__callButtons" >
         <svg class="cems__cancleBtn" onclick=cancelOutgoingCall() xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="96" height="96" viewBox="0 0 172 172" style=" fill:#000000;"><g transform=""><g fill="none" fill-rule="nonzero" stroke="none" stroke-width="1" stroke-linecap="butt" stroke-linejoin="miter" stroke-miterlimit="10" stroke-dasharray="" stroke-dashoffset="0" font-family="none" font-weight="none" font-size="none" text-anchor="none" style="mix-blend-mode: normal"><path d="M0,172v-172h172v172z" fill="none"></path><path d="M86,172c-47.49649,0 -86,-38.50351 -86,-86v0c0,-47.49649 38.50351,-86 86,-86v0c47.49649,0 86,38.50351 86,86v0c0,47.49649 -38.50351,86 -86,86z" fill="#ff0000"></path><g fill="#ffffff"><path d="M121.73829,99.31467c-5.2127,0 -10.33071,-0.81528 -15.18081,-2.41812c-2.37655,-0.81066 -5.29815,-0.06698 -6.74856,1.4227l-9.57317,7.22665c-11.1021,-5.92636 -17.94074,-12.76269 -23.78626,-23.78165l7.01417,-9.32374c1.82225,-1.81994 2.47586,-4.47826 1.69292,-6.97259c-1.60977,-4.8755 -2.42736,-9.9912 -2.42736,-15.20621c0,-3.76691 -3.0648,-6.83171 -6.83171,-6.83171h-15.63579c-3.76691,0 -6.83171,3.0648 -6.83171,6.83171c0,43.17973 35.12856,78.30829 78.30829,78.30829c3.76691,0 6.83171,-3.0648 6.83171,-6.83171v-15.59191c0,-3.76691 -3.0648,-6.83171 -6.83171,-6.83171z"></path></g><path d="" fill="none"></path></g></g></svg>
           
         </div>
       </div>
   </div>
  `;
};

let incomingCallOutput = (name, type) => {
  calleeName = name;
  let output = `
  <div id="cems__callsection">
       <div id="cems__call__content">
         <h3 class="cems__calltype">Incoming Call</h3>
         <div  class="cems__callImage" >
           <img class="cems__callImage" src="https://img.icons8.com/ios/50/000000/user-male-circle.png"/>
         <h4 id='callingType'>Call from ${name} </h4>
         <div class="cems__callButtons">
         <svg  class="cems__cancleBtn" onclick=cancelIncoingCall() xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="96" height="96" viewBox="0 0 172 172" style=" fill:#000000;"><g transform=""><g fill="none" fill-rule="nonzero" stroke="none" stroke-width="1" stroke-linecap="butt" stroke-linejoin="miter" stroke-miterlimit="10" stroke-dasharray="" stroke-dashoffset="0" font-family="none" font-weight="none" font-size="none" text-anchor="none" style="mix-blend-mode: normal"><path d="M0,172v-172h172v172z" fill="none"></path><path d="M86,172c-47.49649,0 -86,-38.50351 -86,-86v0c0,-47.49649 38.50351,-86 86,-86v0c47.49649,0 86,38.50351 86,86v0c0,47.49649 -38.50351,86 -86,86z" fill="#ff0000"></path><g fill="#ffffff"><path d="M121.73829,99.31467c-5.2127,0 -10.33071,-0.81528 -15.18081,-2.41812c-2.37655,-0.81066 -5.29815,-0.06698 -6.74856,1.4227l-9.57317,7.22665c-11.1021,-5.92636 -17.94074,-12.76269 -23.78626,-23.78165l7.01417,-9.32374c1.82225,-1.81994 2.47586,-4.47826 1.69292,-6.97259c-1.60977,-4.8755 -2.42736,-9.9912 -2.42736,-15.20621c0,-3.76691 -3.0648,-6.83171 -6.83171,-6.83171h-15.63579c-3.76691,0 -6.83171,3.0648 -6.83171,6.83171c0,43.17973 35.12856,78.30829 78.30829,78.30829c3.76691,0 6.83171,-3.0648 6.83171,-6.83171v-15.59191c0,-3.76691 -3.0648,-6.83171 -6.83171,-6.83171z"></path></g><path d="" fill="none"></path></g></g></svg>
           ${
             type === ""
               ? `<svg class="cems__reciveBtn" onclick=reciveIncomingCall() xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="96" height="96" viewBox="0 0 172 172" style=" fill:#000000;"><g transform=""><g fill="none" fill-rule="nonzero" stroke="none" stroke-width="1" stroke-linecap="butt" stroke-linejoin="miter" stroke-miterlimit="10" stroke-dasharray="" stroke-dashoffset="0" font-family="none" font-weight="none" font-size="none" text-anchor="none" style="mix-blend-mode: normal"><path d="M0,172v-172h172v172z" fill="none"></path><path d="M86,172c-47.49649,0 -86,-38.50351 -86,-86v0c0,-47.49649 38.50351,-86 86,-86v0c47.49649,0 86,38.50351 86,86v0c0,47.49649 -38.50351,86 -86,86z" fill="#44b43c"></path><g fill="#ffffff"><path d="M121.73829,99.31467c-5.2127,0 -10.33071,-0.81528 -15.18081,-2.41812c-2.37655,-0.81066 -5.29815,-0.06698 -6.74856,1.4227l-9.57317,7.22665c-11.1021,-5.92636 -17.94074,-12.76269 -23.78626,-23.78165l7.01417,-9.32374c1.82225,-1.81994 2.47586,-4.47826 1.69292,-6.97259c-1.60977,-4.8755 -2.42736,-9.9912 -2.42736,-15.20621c0,-3.76691 -3.0648,-6.83171 -6.83171,-6.83171h-15.63579c-3.76691,0 -6.83171,3.0648 -6.83171,6.83171c0,43.17973 35.12856,78.30829 78.30829,78.30829c3.76691,0 6.83171,-3.0648 6.83171,-6.83171v-15.59191c0,-3.76691 -3.0648,-6.83171 -6.83171,-6.83171z"></path></g><path d="" fill="none"></path></g></g></svg>`
               : `<svg class="cems__reciveBtn" onclick=reciveIncomingCall() xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="96" height="96" viewBox="0 0 172 172" style=" fill:#000000;"><g fill="none" fill-rule="nonzero" stroke="none" stroke-width="1" stroke-linecap="butt" stroke-linejoin="miter" stroke-miterlimit="10" stroke-dasharray="" stroke-dashoffset="0" font-family="none" font-weight="none" font-size="none" text-anchor="none" style="mix-blend-mode: normal"><path d="M0,172v-172h172v172z" fill="none"></path><path d="M86,172c-47.49649,0 -86,-38.50351 -86,-86v0c0,-47.49649 38.50351,-86 86,-86v0c47.49649,0 86,38.50351 86,86v0c0,47.49649 -38.50351,86 -86,86z" fill="#2aa826"></path><g fill="#ffffff"><path d="M53.93429,61.06c-3.92983,0 -7.12571,3.19588 -7.12571,7.12571v35.62857c0,3.92983 3.19588,7.12571 7.12571,7.12571h46.31714c3.92983,0 7.12571,-3.19588 7.12571,-7.12571v-10.39631l12.02464,9.61693c0.64488,0.51305 1.43227,0.77937 2.22679,0.77937c0.52374,0 1.05316,-0.11974 1.54483,-0.35489c1.23631,-0.59143 2.01802,-1.83983 2.01802,-3.20796v-28.50286c0,-1.36814 -0.78171,-2.61992 -2.01802,-3.21492c-1.23275,-0.58787 -2.70276,-0.42365 -3.77162,0.43144l-12.02464,9.61693v-10.39631c0,-3.92983 -3.19588,-7.12571 -7.12571,-7.12571z"></path></g></g></svg>`
           }
           
         </div>
       </div>
   </div>
  `;
  getModalSection.innerHTML = output;
};

let reciveMessageStoreAndOutput = (message, peerId) => {
  let currentDateTime = getCurrentDateTime();
  let peerDetails = friendList.find((d) => d.chat_uid == peerId);
  chatListDataStore(message, peerId, peerDetails.name, "recive", currentDateTime);

  // newChatListStore(message, peerId, peerDetails.name, "recive");
  createRecivedMessageOutput(message.text, peerId, currentDateTime);
  scrollBottom();
  gotoChatList();
  var chatEl = document.getElementById("cems__chatbox__messages");
  chatEl.scrollTop = chatEl.scrollHeight;
};

let getChatData = async (authToken, uid) => {
  try {
    let response = await axios.get(`https://tradazine.com/api/v1/all-chat-message/${uid}`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    return await response;
  } catch (err) {
    console.error(err);
  }
};
let getFriendListData = async (authToken, uid) => {
  try {
    let response = await axios.get(`https://tradazine.com/api/v1/get-all-users`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    let friendlist = await response.data.data.filter((d) => d.chat_uid != uid);
    let isTecnicalHelp = friendList.find((f) => f.chat_uid === "tecnicalhelp");
    if (isTecnicalHelp === undefined) {
      friendlist.push({
        id: "technicalhelp",
        chat_uid: "technicalhelp",
        name: "technicalhelp",
      });
    }
    return await friendlist;
  } catch (err) {
    console.error(err);
  }
};

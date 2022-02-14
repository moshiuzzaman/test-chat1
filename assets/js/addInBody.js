document.getElementById("bs__root").innerHTML += `<div class="cems__chatbox">
<div class="cems__chatbox__support">
  <div id="cems__chatbox__chatlists">
    <div id="cems__chatlist__header">
      <h3 id="cems__chatlist__header__text">Chats</h3>
    </div>
    <div id="cems__all__chatlist">
      <div class="cems__chat__list">
        <div class="cems__friend__icon">
          <p>F</p>
        </div>
        <div class="cems__chatlist__content">
          <h4 class="cems__chatlist__friendName">Friend's Name</h4>
        </div>
      </div>
    </div>
    <div class="cems__chatbox__chatlist__footer">
      <div class="cems__chatlist__footer__button" onclick="backToChatList()">
        <img src="https://img.icons8.com/ios/50/000000/speech-bubble-with-dots.png" />
        <p>Chats</p>
      </div>
      <div class="cems__chatlist__footer__button" onclick="gotoUsers()">
        <img src="https://img.icons8.com/ios/50/000000/user.png" />
        <p>Users</p>
      </div>
    </div>
  </div>
  <div id="cems__chatbox__chatting" class="cems__hide__section">
    <div class="cems__chatbox__header">
      <div id="cems__chatbox_backButton--header" onclick="backToChatList()">
        <img src="https://img.icons8.com/ios-filled/100/000000/left.png" />
      </div>

      <div class="cems__friend__icon">
        <p>F</p>
      </div>
      <div class="cems__chatbox__content--header">
        <h4 class="cems__chatbox__heading--header">Friend's Name</h4>
      </div>
    </div>
    <div id="cems__chatbox__messages">
      <div>
        <div class="cems__messages__item cems__messages__item--visitor">
          Can you let me talk to the support?
        </div>
        <div class="cems__messages__item cems__messages__item--operator">Sure!</div>
      </div>
    </div>
    <div class="cems__chatbox__footer">
      <img
        src="https://img.icons8.com/external-kmg-design-outline-color-kmg-design/64/000000/external-attachment-user-interface-kmg-design-outline-color-kmg-design.png"
      />
      <input type="text" placeholder="Write a message..." />
      <button class="cems__chatbox__send--footer">Send</button>
    </div>
  </div>
</div>
<div class="cems__chatbox__button cems__hide__section" id="cems__chatbox__button">
  <button>button</button>
</div>
</div>
<div id="bs__root"></div>
<div id="cems__log" hidden></div>
<!-- <button id="cems__myBtn">Open Modal</button> -->
<div id="cems__myModal" class="cems__modal">
<div id="cems__callsection">
  <div id="cems__call__content">
    <h3 class="cems__calltype">Outgoing Call</h3>
    <div class="cems__callImage">
      <img
        class="cems__callImage"
        src="https://img.icons8.com/ios/50/000000/user-male-circle.png"
      />
      <h4>Calling Shozon</h4>
      <div class="cems__callButtons">
        <button class="cems__reciveBtn">Recive</button>
        <button class="cems__cancleBtn">Cancle</button>
      </div>
    </div>
  </div>
</div>
</div>`;
// Your CSS as text
var cssstyles = ``;

var styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = cssstyles;
document.head.appendChild(styleSheet);

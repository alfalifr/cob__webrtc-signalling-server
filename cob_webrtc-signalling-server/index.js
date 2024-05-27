let port = process.env.PORT || 5500; //5000;

let eventSdpOffer = "sdp_offer";
let eventSdpAnswer = "sdp_answer";
let eventIceCandidate = "ice_candidate";
let eventStopCall = "stop_call";

let keySenderId = "senderId";
let keyReceiverId = "receiverId";
let keySdpOffer = "sdpOffer";
let keySdpAnswer = "sdpAnswer";
let keyAcceptCall = "acceptCall";
let keyIceCandidate = "iceCandidate";

  /*
   * Offering data format:
   * {
   *   "senderId" : "...",
   *   "receiverId" : "...",
   *   "sdpOffer" : {
   *     "sdp" : "...",
   *     "type" : "..."
   *   }
   * }
   */
  /*
   * Offering answer data format:
   * {
   *   "senderId" : "...",
   *   "receiverId" : "...",
   *   "acceptCall" : true,
   *   "sdpAnswer" : {
   *     "sdp" : "...",
   *     "type" : "..."
   *   }
   * }
   */
  /*
   * ICE candidate data format:
   * {
   *   "senderId" : "...",
   *   "receiverId" : "...",
   *   "iceCandidate" : {
   *      ...
   *   }
   * }
   */
  /*
   * Stop calling data format:
   * {
   *   "senderId" : "...",
   *   "receiverId" : "...",
   * }
   */


let IO = require("socket.io")(port, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

IO.use((socket, next) => {
  console.log("IO.use((socket, next) ===")
  if (socket.handshake.query) {
    let callerId = socket.handshake.query.callerId;
    socket.user = callerId;
    next();
  }
});

IO.on("connection", (socket) => {
  console.log(`IO.on("connection", (socket) ===`)
  console.log(socket.user, "Connected");
  socket.join(socket.user);

  socket.on(eventSdpOffer, (data) => {
    console.log(`IO.on("${eventSdpOffer}", (data) ===`)
    console.log(`data ${data}`)
    let receiverId = data[keyReceiverId];
    let sdpOffer = data[keySdpOffer];

    socket.to(receiverId).emit(eventSdpOffer, {
      [keySenderId]: socket.user,
      [keySdpOffer]: sdpOffer,
    });
  });

  socket.on(eventSdpAnswer, (data) => {
    console.log(`IO.on("${eventSdpAnswer}", (data) ===`)
    console.log(`data ${data}`)
    let receiverId = data[keyReceiverId];
    let acceptCall = data[keyAcceptCall];
    let sdpAnswer = data[keySdpAnswer];

    socket.to(receiverId).emit(eventSdpAnswer, {
      [keySenderId]: socket.user,
      [keyAcceptCall]: acceptCall,
      [keySdpAnswer]: sdpAnswer,
    });
  });

  socket.on(eventIceCandidate, (data) => {
    console.log(`IO.on("${eventIceCandidate}", (data) ===`)
    console.log(`data ${data}`)
    let receiverId = data[keyReceiverId];
    let iceCandidate = data[keyIceCandidate];

    socket.to(receiverId).emit(eventIceCandidate, {
      [keySenderId]: socket.user,
      [keyIceCandidate]: iceCandidate,
    });
  });

  socket.on(eventStopCall, (data) => {
    console.log(`IO.on("${eventStopCall}", (data) ===`)
    let receiverId = data[keyReceiverId];

    socket.to(receiverId).emit(eventStopCall, {
      [keySenderId]: socket.user,
    });
  });
});

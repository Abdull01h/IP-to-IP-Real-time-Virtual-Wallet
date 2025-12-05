const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 3000 });
let users = {}; // username: { ws, balance, pin, isAdmin, isMain }
let onlineUsers = [];

wss.on('connection', ws => {
  ws.on('message', msg=>{
    let d = JSON.parse(msg);
    if(d.type==='register'){
      if(users[d.user]) return;
      users[d.user]={balance:0,pin:d.pin,isAdmin:false,isMain:false,ws:ws};
    }
    if(d.type==='login'){
      if(!users[d.user]) return;
      users[d.user].ws=ws;
      onlineUsers.push(d.user);
      broadcastOnline();
    }
    if(d.type==='send'){
      let f = users[d.from], t = users[d.to];
      if(!f||!t) return;
      if(f.balance<d.amount) return;
      f.balance -= d.amount; t.balance += d.amount;
      [f.ws, t.ws].forEach(s=>s.send(JSON.stringify({type:'updateBalance',from:d.from,to:d.to,amount:d.amount})));
    }
    if(d.type==='mainAdjust'){
      let t = users[d.user]; if(!t) return;
      t.balance += d.amount;
      t.ws.send(JSON.stringify({type:'updateBalance',from:'MainAdmin',to:d.user,amount:d.amount}));
    }
  });

  ws.on('close',()=>{ onlineUsers = onlineUsers.filter(u=>users[u].ws!==ws); broadcastOnline(); });
});

function broadcastOnline(){
  wss.clients.forEach(c=>{
    if(c.readyState===WebSocket.OPEN){
      c.send(JSON.stringify({type:'online',list:onlineUsers}));
    }
  });
}

console.log("WebSocket server running on ws://localhost:3000");

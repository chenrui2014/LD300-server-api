 var socket=io('http://localhost:3001',{
     path:'/stateServer'
 });

 socket.on('connect',()=> {
     $('#msg').append('已连接服务器'+'</br>');
 });

 function appendServerMsg(name,obj){
     $('#msg').append(name+':        '+JSON.stringify(obj)+'</br>');
 }

 let evts=[
     'init',
     'update'
 ];

 for(var i=0;i<evts.length;i++){
     let evti=evts[i];
     socket.on(evti,(evt)=>{
         appendServerMsg(evti,evt);
     });
 }


var http = require('http');
var fs = require('fs');
var PORT = process.env.PORT ||	 8080
let connection = null;
let connarr = [];
function onRequest(request,response){
    response.writeHead(200,{'content-type':'text/html'});
    fs.readFile('index.html',null,function(error,data){
        if(error){
            response.writeHead(404);
            response.write("file not found");
        }
        else{
            response.write(data);
        }
        response.end();
    })
    

}


const httpserver = http.createServer(onRequest);

var io = require('socket.io')(httpserver);

let arr = [];
let index = 1;

io.on("connection", function(socket){
    arr.push({'index':index,'socket':socket,'iscalling':false,'room':null,'talkedto':null})
    index=index+1;
    
    let room=null;
    let tempindex=null;
    let online = 0;

    socket.on("online",(data)=>{
        for(let pair of arr){
            if(pair.socket.disconnected==false){
                online+=1;
            }
        }
        io.emit("online1",JSON.stringify({'online':online}));
        online = 0;
    })

    socket.on("message", (msg) => {
            for(let pair of arr){
                if(pair.socket==socket && pair.socket.disconnected==false && pair.room!=null){
                    room=pair.room;
                    break;
                }
            }
            for(let pair of arr){
                if(pair.room ==room && pair.room!=null){
                    pair.socket.emit("getmessage",msg);
                }
            }
            room=null;
    })

    

    socket.on("disconnecting", (data) => {
        for(let dt of arr){
            if(dt.socket==socket){
                room = dt.room;
                dt.room=null;
                dt.iscalling=false;
                tempindex=dt.index;
                break;
            }
        }

       for(let dt of arr){
            if(dt.room==room){
                dt.iscalling=false;
                dt.room=null;
                dt.talkedto=tempindex;
                dt.socket.emit("otherdisconnect",JSON.stringify({'name':'name'}))
                tempindex=null;
                break;
            }
       } 
       room = null;
       

       

    })
    
    socket.on("signal",function(data){
        
       
        for(let pair of arr){
            if(pair.socket==socket){
                //console.log(pair.index)
                if(pair.iscalling==true && pair.socket.disconnected==false){
                    for(let dt of arr){
                        if(dt.room==pair.room && dt.socket.disconnected==false){
                            dt.socket.emit("signal1",data);
                        }
                    }
                }

                if(pair.iscalling!=true && pair.socket.disconnected==false){
                    for(let pair of arr){
                        if(pair.socket==socket && pair.socket.disconnected==false){
                            pair.room=Math.random();
                            room = pair.room;
                            pair.iscalling=true;
                            tempindex=pair.index;
                        }
                    }
                    for(let pair of arr){
                        if(pair.iscalling==false && pair.socket.disconnected==false && pair.talkedto!=tempindex){
                            pair.iscalling=true
                            pair.room=room;
                            pair.socket.emit("signal1",data);
                            break;
                        }
                    }
                    tempindex=null;
                   } 
                    


            }
        }

       
        //io.emit("signal1",data);
        room=null;
       
            
        
    })

})
        

    
    



httpserver.listen(PORT,()=>{
    console.log("listening on port 8080")
})

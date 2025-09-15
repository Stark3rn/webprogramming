const express = require("express");
const crypto = require('crypto');
const fs = require("fs");
const server = express();
const port = 2006;
const projectPath = __dirname+"/";

server.use(express.urlencoded("true"));

server.get("/", (HTTPrequest, HTTPresponse) => {
    HTTPresponse.sendFile(projectPath+"index.html");
})

server.get("/whiteboard", (HTTPrequest, HTTPresponse) => {
    HTTPresponse.sendFile(projectPath+"whiteboard.html");
})

server.get("/login", (HTTPrequest, HTTPresponse) => {
    HTTPresponse.sendFile(projectPath+"login_page.html");
})

server.post("/loginattempt", (HTTPrequest, HTTPresponse) => {
    var userinput = HTTPrequest.body;

    // Hash processing
    const hash = hashPassword(userinput.password);
    
    var login = 0;
    fs.readFile(projectPath+"users.csv","utf-8", (err, data) => {
        if(err) {
            console.error(err);
            return;
        }
        let users = data.split("\n");
        for(let row of users) {
            informations = row.split(",");
            if(informations[1] == hash && informations[0]=== filterHTMLCharacters(userinput.fusername)) {
                login = 1;
                break;
            }
        }
         if(login == 1) {
            HTTPresponse.write("login success");
        } else {
            HTTPresponse.write("login failed");
        }
        HTTPresponse.end();
    });
})

server.post("/registerattempt", (HTTPrequest, HTTPresponse) => {
    var userinput = HTTPrequest.body;

    if(userinput.password.length < 5 ) {
        HTTPresponse.send("Password too short");
    }
    if(userinput.fusername.length > 20) {
        HTTPresponse.send("Username too long");
    }

    const hash = hashPassword(userinput.password);

    var exists = 0;
    fs.readFile(projectPath+"users.csv","utf-8", (err, data) => {
        if(err) {
            console.error(err);
            return;
        }
        let users = data.split("\n");
        for(let row of users) {
            informations = row.split(",");
            if(informations[0]=== userinput.fusername) {
                exists = 1;
                break;
            }
        }
         if(exists == 1) {
            HTTPresponse.write("Sorry, this username is already taken...");
        } else {
            fs.writeFile(projectPath+"users.csv",`${filterHTMLCharacters(userinput.fusername)},${hash}\n`, { flag: 'a+' }, (err) => {
                if(err) {
                    HTTPresponse.write("Sorry, we are unable to create your user for some reason...");
                } else {
                    HTTPresponse.write("Register successful");
                }
                HTTPresponse.end();
            })
        }
        HTTPresponse.end();
    });
})

server.get("/style", (HTTPrequest, HTTPresponse) => {
    HTTPresponse.sendFile(projectPath+"style.css");
})

server.listen(port, () => {
    console.log(`Node server launched using port ${port}`);
});

var hashPassword = (password) => {
    const hash = crypto.createHash("SHA256");
    hash.update(password);
    const digest = hash.digest('hex');
    return(digest);
}

var filterHTMLCharacters = (text) => {
    if (typeof(text) == "string")
        return text.replace(/&/g, "&amp;")
                   .replace(/</g, "&lt;")
                   .replace(/>/g, "&gt;")
                   .replace(/"/g, "&quot;")
                   .replace(/'/g, "&#039;");
    else return text;
}

var express = require('express');
var fs = require('fs');
var path = require('path');
var mkdirp = require('mkdirp');
var bodyParser = require('body-parser');
var session = require('client-sessions');
var busboy = require('connect-busboy');
var qsql = require('q-sqlite3');
var Storage = require('./json-storage.js');
var _ = require('underscore');


var userStorage = new Storage('./users.json');
var db = null;

qsql.createDatabase('./db/chat').done(function(database) {
    db = database;
});

var app = express();
app.use(busboy());
app.use(session({
    cookieName: 'session',
    secret: 'nata_hin'
}));
app.use(express.static('public'));

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

app.use(function(req, res, next) {
    if (req.url !== '/login' && !req.session.loggedUser) {
        res.send({error: 'not logged in'});
        return;
    }
    next();
});

app.post('/login', function(req, res) {
    var user = req.body.credentials;

    if (isUser(user, userStorage.getAll())) {
        req.session.loggedUser = userStorage.findByKey(user.login);
        req.session.loggedUser.login = user.login;
        delete req.session.loggedUser.password;
        setCurrentUserTime(req.session.loggedUser);
        res.redirect('/userpage.html');
    } else {
        res.redirect('back');
    }
    res.end();
});

app.post('/changeAvatar', function(req, res) {
    var loggedUser = req.session.loggedUser;
    var fstream;

    req.busboy.on('file', function(fieldname, file, filename) {
        var avatarPath = path.join(__dirname, 'public', 'users_images', loggedUser.login, filename);

        mkdirp(path.dirname(avatarPath), function(err) {
            if (err) { throw err; }
        });
        fstream = fs.createWriteStream(avatarPath);
        file.pipe(fstream);

        loggedUser.avatar = path.join('/users_images', loggedUser.login, filename);
        var updUser = userStorage.findByKey(loggedUser.login);
        updUser.avatar = loggedUser.avatar;
        userStorage.update(updUser, loggedUser.login);

        fstream.on('close', function() {
            res.redirect('/userpage.html');
        });
    });
    setCurrentUserTime(loggedUser);
    req.pipe(req.busboy);
});

app.post('/fileupload', function(req, res) {
    var loggedUser = req.session.loggedUser;

    var pathToPrictureJson = path.join(__dirname, 'public', 'users_images', loggedUser.login, 'pictures.json');
    var imagesJson = new Storage(pathToPrictureJson);

    var fields = {};
    var pathDirect;
    var pathToGallery = path.join(__dirname, 'public', 'users_images', loggedUser.login);
    var fileName;
    var fstream;

    req.busboy.on('file', function(fieldname, file, filename) {
        pathDirect = path.join(pathToGallery, filename);

        fileName = encodeURIComponent(filename);
        fstream = fs.createWriteStream(pathDirect);
        file.pipe(fstream);
        fstream.on('close', function() {
            res.redirect('/userpage.html');
        });
    });

    req.busboy.on('field', function(fieldname, val) {
        fields[fieldname] = val;
    });

    req.busboy.on('finish', function() {
        var newPhoto = {};
        newPhoto.src = path.join('/users_images', loggedUser.login, fileName);
        newPhoto.descr = fields.fotoDescribe;
        newPhoto.category = fields.categoryName;
        newPhoto.private = fields.privateFoto ? true : false;
        imagesJson.insert(newPhoto);
    });
    setCurrentUserTime(loggedUser);
    req.pipe(req.busboy);
});

app.post('/remove_photo', function(req, res) {
    var loggedUser = req.session.loggedUser;
    var remPhotoID = req.body.id;
    var pathToPrictureJson = path.join(__dirname, 'public', 'users_images', loggedUser.login, 'pictures.json');
    var imagesJson = new Storage(pathToPrictureJson);
    imagesJson.delete(remPhotoID);
    setCurrentUserTime(loggedUser);
    res.send({status: 'okay'});
});

app.get('/user_page', function(req, res) {
    var loggedUser = req.session.loggedUser;
    if (req.query.user) {
        if ((userStorage.findByKey(req.query.user) === false) || (req.query.user === loggedUser.login)) {
            res.send([loggedUser, true]);
        } else {
            res.send([userStorage.findByKey(req.query.user), false]);
        }
    } else {
        res.send([loggedUser, true]);
    }
    setCurrentUserTime(loggedUser);
    res.end();
});

app.get('/logout', function(req, res) {
    setCurrentUserTime(req.session.loggedUser);
    req.session.reset();
    res.redirect('/index.html');
});

app.get('/usersActivity', function(req, res) {
    var loggedUser = req.session.loggedUser;
    var usersActivity = {};
    var newDate = new Date().getTime();
    var users = userStorage.getAll();
    for (var userKey in users) {
        if (users[userKey].name == loggedUser.name) continue;
        var oldDate = users[userKey].lastActivity;
        var diff = newDate - oldDate;
        var diffDate = Math.floor(diff / (1000 * 60));
        usersActivity[userKey] = {};
        usersActivity[userKey].name = users[userKey].name;
        if (diffDate < 2) {
            usersActivity[userKey].online = true;
        } else {
            usersActivity[userKey].online = false;
        }
    }
    res.send(usersActivity);
});

app.get('/dialogsList', function(req, res) {
    getUserDialogList(req.session.loggedUser.login)
    .then(function(data) {
        res.send(JSON.stringify(data, null, "    "));
    });
});

app.post('/sendMessage', function(req, res) {
    var loggedUser = req.session.loggedUser;
    var sqlExpression = "INSERT INTO Messages (chatId, message, sentAtTime, author) VALUES (?, ?, ?, ?)";

    var id = req.body.idChat;
    var sentAtTime = new Date().getTime();
    var message = req.body.message;
    var author = loggedUser.login;

    db.prepare(sqlExpression)
    .then(function(stmnt) {
        stmnt.run(id, message, sentAtTime, author);
        stmnt.finalize();
    })
    .then(function() {
        updateUserLastVisitToChat(req.body.idChat, loggedUser.login);
        res.redirect('back');
        res.end();
    });
});

app.post('/startChat', function(req, res) {
    var loggedUser = req.session.loggedUser;
    starDialog(req.body.userSelect, loggedUser)
        .then(function(rows) {
            if (rows !== undefined) {
                res.send({idChat: rows.chatId});
            } else {
                var sqlRequest = "INSERT INTO Chats (id, lastMessTime) VALUES ( ?, ?)";
                var time = new Date().getTime();
                db.run(sqlRequest, null, time)
                    .then(function(statement) {
                        return statement.lastID;
                    })
                    .then(function(lastID) {
                        var timeNow = new Date().getTime();
                        var sqlRequestCP = "INSERT INTO Chat_partisipants (chatId, userLogin, lastVisit) VALUES (?, ?, ?)";
                        db.run(sqlRequestCP, lastID, req.body.userSelect, timeNow);
                        db.run(sqlRequestCP, lastID, loggedUser.login, timeNow);
                        res.send({idChat: lastID});
                    });
            }
        });
});

app.get('/dataFromDataBase', function(req, res) {
    var loggedUser = req.session.loggedUser;
    db.all("SELECT message, author, idMessage FROM Messages WHERE chatId=" + req.query.chat)
    .then(function(rows) {
        updateUserLastVisitToChat(req.query.chat, loggedUser.login);
        res.type('json');
        res.send(rows);
    });
});

app.post('/deleteMessage', function(req, res) {
    db.prepare("DELETE FROM Messages WHERE idMessage = " + req.body.idDelete)
    .then(function(stmt) {
        stmt.run();
        stmt.finalize();
        res.end();
    });
});

app.get('/loginUser', function(req, res) {
    res.send(req.session.loggedUser);
});

var server = app.listen(8081, 'localhost', function() {
    var host = server.address().address;
    var port = server.address().port;
    console.log('Example app listening at http://%s:%s', host, port);
});

function isUser(user, users) {
    if (!users[user.login]) {
        return false;
    }
    return user.password === users[user.login].password;
}

function setCurrentUserTime(loggedUser) {
    var curenlyTime = new Date().getTime();
    var newObjUser = userStorage.findByKey(loggedUser.login);
    newObjUser.lastActivity = curenlyTime;
    userStorage.update(newObjUser, loggedUser.login);
}

function updateUserLastVisitToChat(chatId, login) {
    var time = new Date().getTime();
    var statement = "UPDATE Chat_partisipants SET lastVisit = " + time +
        " WHERE chatId = " + chatId + " AND userLogin = '" + login + "'";
    db.run(statement)
        .catch(function(req) {
            console.log(req);
        })
    ;
}

function starDialog(userSelect, loggedUser) {
    return db.all("SELECT chatId FROM Chat_partisipants WHERE userLogin= '" + userSelect + "'")
        .then(function(rows) {
            var selectId = _.pluck(rows, 'chatId').join(',');
            var countUser = "SELECT chatId, count(userLogin) AS cnt FROM Chat_partisipants WHERE chatId IN (" + selectId + ") GROUP BY chatId HAVING cnt=2";
            return db.all(countUser);
        })
        .then(function(rows) {
            var strForReques = _.pluck(rows, 'chatId').join(',');
            var selectId = "SELECT chatId FROM Chat_partisipants WHERE chatId IN (" + strForReques + ") AND userLogin= '" + loggedUser.login + "'";
            return db.get(selectId);
        });
}

function getUserDialogList(login) {
    var selectDialogsList = "SELECT Chats.id, Chat_partisipants.lastVisit FROM Chat_partisipants, Chats " +
        "WHERE Chats.id=Chat_partisipants.chatId AND Chat_partisipants.userLogin= '" + login + "' ORDER BY Chats.lastMessTime";
    var dialogs;

    return db.all(selectDialogsList)
    .then(function(rows) {
        var countMessPromises = [];
        var selectPartisipantsPromises = [];
        dialogs = rows;

        for (var i = 0; i < rows.length; i++) {
            var selectCountMess = "SELECT chatId, count(message) FROM Messages WHERE sentAtTime > " + rows[i].lastVisit + " AND chatId = " + rows[i].id + ";";
            countMessPromises.push(db.get(selectCountMess));

            var selectPartisipants = "SELECT chatId, userLogin FROM Chat_partisipants WHERE chatId = " + rows[i].id + " AND userLogin <> '" + login + "';";
            selectPartisipantsPromises.push(db.all(selectPartisipants));
        }
        return Promise.all([Promise.all(countMessPromises), Promise.all(selectPartisipantsPromises)]);
    })
    .then(function(res) {
        var counts = res[0];
        var partisipants = res[1];

        for (var i = 0; i < dialogs.length; i++) {
            for (var j = 0; j < counts.length; j++) {
                if (dialogs[i].id === counts[j].chatId) {
                    dialogs[i].notread = counts[j]["count(message)"];
                    break;
                } else {
                    dialogs[i].notread = 0;
                }
            }
            dialogs[i].partisipants = findPartisipants(partisipants, dialogs[i].id);
        }
        return (dialogs);
    })
    .catch(function(err) {
        throw err;
    });
}

function findPartisipants(partisipants, id) {
    var partisipantsList = [];
    for (var k = 0; k < partisipants.length; k++) {
        for (var n = 0; n < partisipants[k].length; n++) {
            if (partisipants[k][n].chatId === id) {
                partisipantsList.push(partisipants[k][n].userLogin);
            }
        }
    }
    return partisipantsList;
}

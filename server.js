var express = require('express');
var fs = require('fs');
var path = require('path');
var bodyParser = require('body-parser');
var session = require('client-sessions');
var busboy = require('connect-busboy');
var Storage = require('./json-storage.js');

var userStorage = new Storage('./users.json');

var app = express();
app.use(busboy());
app.use(session({
    cookieName: 'session',
    secret: 'nata_hin'
}));
app.use(express.static('.'));
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

app.post('/login', function(req, res) {
    var user = req.body.credentials;

    if (isUser(user, userStorage.getAll())) {
        req.session.loggedUser = userStorage.findByKey(user.login);
        req.session.loggedUser.login = user.login;
        delete req.session.loggedUser.password;
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
        var avatarPath = path.join(__dirname, 'users_images', loggedUser.login, filename);
        fstream = fs.createWriteStream(avatarPath);
        file.pipe(fstream);

        loggedUser.avatar = path.join('users_images', loggedUser.login, filename);
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

    var pathToPrictureJson = path.join(__dirname, 'users_images', loggedUser.login, 'pictures.json');
    var imagesJson = new Storage(pathToPrictureJson);

    var fields = {};
    var pathDirect;
    var pathToGallery = path.join(__dirname, 'users_images', loggedUser.login);
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
        newPhoto.src = path.join('users_images', loggedUser.login, fileName);
        newPhoto.descr = fields.fotoDescribe;
        newPhoto.category = fields.categoryName;
        newPhoto.private = fields.privateFoto ? true : false;
        imagesJson.insert(newPhoto);
    });
    setCurrentUserTime(loggedUser);
    req.pipe(req.busboy);
});

app.post('/remove_photo', function(req, res) {
    console.log(req.body.id);
    var loggedUser = req.session.loggedUser;
    var remPhotoID = req.body.id;
    var pathToPrictureJson = path.join(__dirname, 'users_images', loggedUser.login, 'pictures.json');
    var imagesJson = new Storage(pathToPrictureJson);
    imagesJson.delete(remPhotoID);
    setCurrentUserTime(loggedUser);
    res.send({status: 'okay'});
});

app.get('/user_page', function(req, res) {
    var loggedUser = req.session.loggedUser;
    if (!req.session.loggedUser) {
        res.send({error: 'not logged in'});
        return;
    }
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
        if (users[userKey].name !== loggedUser.name) {
            var oldDate = users[userKey].lastActivity;
            var diff = newDate - oldDate;
            var diffDate = new Date(diff).getMinutes();
            usersActivity[userKey] = {};
            usersActivity[userKey].name = users[userKey].name;
            if (diffDate < 2) {
                usersActivity[userKey].online = true; 
            }
            else { 
                usersActivity[userKey].online = false;
            }
        } }
    res.send(usersActivity);
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
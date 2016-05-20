var express = require('express');
var fs = require('fs');
var path = require('path');
var bodyParser = require('body-parser');
var session = require('client-sessions');
var fileExists = require('file-exists');
var busboy = require('connect-busboy');
var mkdirp = require('mkdirp');
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

app.post('/login', function(req, res) {
    var user = req.body.credentials;
    var users = userStorage.getAll();

    if (isUser(user, users)) {
        // req.session.user = user;
        req.session.loggedUser = userStorage.findByKey(user.login);
        req.session.loggedUser.login = user.login;

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
        userStorage.update(loggedUser, loggedUser.login);

        fstream.on('close', function() {
            res.redirect('/userpage.html');
        });
    });
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
    req.pipe(req.busboy);
});


app.post('/remove_photo', function(req, res) {
    var loggedUser = req.session.loggedUser;
    var remPhotoID = req.body.id;
    var pathToPrictureJson = path.join(__dirname, 'users_images', loggedUser.login, 'pictures.json');
    var imagesJson = new Storage(pathToPrictureJson);
    imagesJson.delete(remPhotoID);
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
    }
    res.send([loggedUser, true]);
    res.end();
});

app.get('/logout', function(req, res) {
    req.session.reset();
    res.redirect('/index.html');
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


function getRandomPhotoId(min, max) {
    return Math.round(Math.random() * (max - min) + min);
}


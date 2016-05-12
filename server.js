var express = require('express');
var fs = require('fs');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('client-sessions');
var users = require('./users.json');
var fs = require('fs');
var http = require('http'),
    inspect = require('util').inspect;
var app = express();
var loggedUser;
var busboy = require('connect-busboy');
var urlencodedParser = bodyParser.urlencoded({extended: false});
var mkdirp = require('mkdirp');
app.use(busboy()); 
app.use(cookieParser());
app.use(session({
    cookieName: 'session',
    secret: 'nata_hin'
}));
app.use(express.static('.'));

app.post('/login', urlencodedParser, function(req, res) {
    var user = {
        login: req.body.inputLogin,
        password: req.body.inputPassword
    };

    if (isUser(user, users)) {
        req.session.user = user;
        loggedUser = JSON.stringify(users[user.login]);
        loggedUser = JSON.parse(loggedUser);
        loggedUser.login = user.login;
        delete loggedUser.password;
        res.redirect('/userpage.html');
    } else {
        res.redirect('back');
    }
    res.end(JSON.stringify(user));
});

app.post('/changeAvatarka', function (req, res) {
    console.log(loggedUser.avatar);
    var userSes = req.session.user;
    var path;
    var ftream;
    var pathToAvatar;
    req.busboy.on('file', function (fieldname, file, filename) {
        path = __dirname + '/users_images/' + userSes.login + "/" + filename;
        ftream = fs.createWriteStream(path);
        file.pipe(ftream);
        pathToAvatar = users[loggedUser.login].avatar;
        pathToAvatar = 'users_images/admin/' + filename;      
        loggedUser.avatar = 'users_images/admin/' + filename;
        fs.writeFile('./users.json', JSON.stringify(users), function(err) {
            if (err) {
                console.log(err);
            } else {
                console.log("Avatar change");
            }
        });
        ftream.on('close', function() {
            res.redirect('/userpage.html');
        });
    });
    req.pipe(req.busboy);
});

app.post('/fileupload', function(req, res) {
    var fields = {};
    var pathDirect;
    var fileName;
    var fstream;
    var userSession = req.session.user;

    req.busboy.on('file', function (fieldname, file, filename, val) {
        mkdirp('./users_images/' + userSession.login, function(err) {
            if (err) {
                console.error(err);
            } else {
                console.log('Create!');
            }
        });
        pathDirect = __dirname + '/users_images/' + userSession.login + "/" + filename;
        fileName = filename;
        fstream = fs.createWriteStream(pathDirect);
        file.pipe(fstream);
        fstream.on('close', function() {
            res.redirect('/userpage.html');
        });
    });

    req.busboy.on('field', function(fieldname, val, fieldnameTruncated, valTruncated, encoding, mimetype) {
        console.log('Field [' + fieldname + ']: value: ' + val);
        fields[fieldname] = inspect(val);
    });

    req.busboy.on('finish', function() {
        console.log('Done parsing form!');
        writeToJSON(fileName, fields);
    });
    req.pipe(req.busboy);
});

function writeToJSON(fileName, fields){
    console.log(loggedUser);
    var images = require('.' + loggedUser.images);
    var newPhoto = {};
    newPhoto.id = String(images.length + 1);
    newPhoto.src = '/users_images/' + loggedUser.login + "/" + fileName;
    newPhoto.descr = fields.fotoDescribe;
    newPhoto.category = fields.categoryName;
    var checked = false;
    if (fields.privateFoto) {
        checked = true;
    }
    newPhoto.private = checked;
    console.log(newPhoto);
    images.push(newPhoto);
    fs.writeFile('.' + loggedUser.images, JSON.stringify(images), function(err) {
        if (err) {
            console.log(err);
        } else {
            console.log("Файл сохранен.Фото записано");
        }
    });
}

app.post('/remove_photo', urlencodedParser, function(req, res) {
    var remPhotoID = req.body.id;
    var images = require('.' + loggedUser.images);
    for (var i = 0; i < images.length; i++) {
        if (images[i].id === remPhotoID) {
            images.splice(i, 1);
            console.log("Фото удалено");
            break;
        }
    }
    fs.writeFile('.' + loggedUser.images, JSON.stringify(images), function(err) {
        if (err) {
            console.log(err);
        } else {
            console.log("Файл сохранен.");
        }
    });
    // res.redirect('/userpage.html');
    res.send({status: 'okay'});
});

app.get('/user_page', function(req, res) {
    if (!req.session.user) {
        res.send({error: 'not logged in'});
        return;
    };
    res.send(loggedUser);
});

app.get('/logout', function(req, res) {
    req.session.reset();
    // delete req.session.user;
    res.redirect('/index.html');
});

var server = app.listen(8081, "localhost", function() {
    var host = server.address().address;
    var port = server.address().port;
    console.log("Example app listening at http://%s:%s", host, port);
});

function isUser(user, users) {
    if (!users[user.login]) {
        return false;
    }
    return user.password === users[user.login].password;
};

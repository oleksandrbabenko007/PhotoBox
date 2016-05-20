var express = require('express');
var fs = require('fs');
var path = require('path');
var bodyParser = require('body-parser');
var session = require('client-sessions');
var fileExists = require('file-exists');
var busboy = require('connect-busboy');
var mkdirp = require('mkdirp');

//var jsonStorage = require('./json-storage.js');
var users = require('./users.json');

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
    // userStorage = jsonStorage(__dir.. 'users.json');
    // get clonned copy by key
    // user = userStorage.findbyKey(req.body.credentials.login);
    // userStorage.update(key, entity)
    // userStorage.delete(key)
    // userStorage.find(property, value);

    var user = req.body.credentials;
    if (isUser(user, users)) {
        req.session.user = user;
        req.session.loggedUser = findUser(user.login);
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
        users[loggedUser.login].avatar = loggedUser.avatar;
        fs.writeFile(path.join(__dirname, 'users.json'), JSON.stringify(users, null, '    '), function(err) {
            if (err) {
                throw err;
            }
        });
        fstream.on('close', function() {
            res.redirect('/userpage.html');
        });
    });
    req.pipe(req.busboy);
});

app.post('/fileupload', function(req, res) {
    var loggedUser = req.session.loggedUser;
    var fields = {};
    var pathDirect;
    var pathToGallery = path.join(__dirname, 'users_images', loggedUser.login);
    var fileName;
    var fstream;
    mkdirp(pathToGallery, function(err) {
        if (err) {
            throw err;
        }
    });
    if (!fileExists(path.join(pathToGallery, 'pictures.json'))) {
        fs.writeFile(path.join(pathToGallery, 'pictures.json'), '[]', function(errc) {
            if (errc) {
                throw errc;
            }
        });
    }
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
        savePhotoInfo(fileName, fields, loggedUser);
    });
    req.pipe(req.busboy);
});

app.post('/remove_photo', function(req, res) {
    var loggedUser = req.session.loggedUser;
    var remPhotoID = req.body.id;
    var images = require('.' + loggedUser.images);
    for (var i = 0; i < images.length; i++) {
        if (images[i].id === remPhotoID) {
            images.splice(i, 1);
            break;
        }
    }
    fs.writeFile('.' + loggedUser.images, JSON.stringify(images, null, '    '), function(err) {
        if (err) {
            throw err;
        }
    });
    res.send({status: 'okay'});
});

app.get('/user_page', function(req, res) {
    var loggedUser = req.session.loggedUser;
    if (!req.session.user) {
        res.send({error: 'not logged in'});
        return;
    }
    if (req.query.user) {
        if ((findUser(req.query.user) === false) || (req.query.user === loggedUser.login)){
            res.send([loggedUser, true]);
        } else {
            res.send([findUser(req.query.user), false]);
        }
    } else {
        res.send([loggedUser, true]);
    }
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

function findUser(login) {
    if (users[login]) {
        var user = clone(users[login]);
        user.login = login;
        delete user.password;
        return user;
    }
    return false;
}

function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
}

function getRandomPhotoId(min, max) {
    return Math.round(Math.random() * (max - min) + min);
}

function savePhotoInfo(fileName, info, loggedUser) {
    var images = require('.' + loggedUser.images);
    var newPhoto = {};
    newPhoto.id = String(getRandomPhotoId(0, 999));
    newPhoto.src = path.join('users_images', loggedUser.login, fileName);
    newPhoto.descr = info.fotoDescribe;
    newPhoto.category = info.categoryName;
    newPhoto.private = info.privateFoto ? true : false;

    images.push(newPhoto);
    fs.writeFile('.' + loggedUser.images, JSON.stringify(images, null, '\t'), function(err) {
        if (err) {
            throw err;
        } else {
            console.log('File saved. New photo was add.');
        }
    });
}

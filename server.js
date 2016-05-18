var express = require('express');
var fs = require('fs');
var path = require('path');
var bodyParser = require('body-parser');
var session = require('client-sessions');
var fileExists = require('file-exists');
var busboy = require('connect-busboy');
var mkdirp = require('mkdirp');

var loggedUser;
var guestMode = false;
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
    var user = req.body.credentials;
    if (isUser(user, users)) {
        req.session.user = user;
        req.session.loggedUser = findUser(user.login);
        loggedUser = req.session.loggedUser;
        res.redirect('/userpage.html');
    } else {
        res.redirect('back');
    }
    res.end();
});

//todo: rename path changeAvatarka -> changeAvatar
app.post('/changeAvatarka', function(req, res) {
    if (guestMode) {
        res.end();
    }
    loggedUser = req.session.loggedUser;
    var ftream;
    req.busboy.on('file', function(fieldname, file, filename) {
        var avatarPath = path.join(__dirname, 'users_images', loggedUser.login, filename);
        // todo: rename ftream
        ftream = fs.createWriteStream(avatarPath);
        file.pipe(ftream);
        loggedUser.avatar = path.join('/users_images', loggedUser.login, filename);
        fs.writeFile('./users.json', JSON.stringify(users, null, '    '), function(err) {
            if (err) {
                throw err;
            }
        });
        ftream.on('close', function() {
            res.redirect('/userpage.html');
        });
    });
    req.pipe(req.busboy);
});

app.post('/fileupload', function(req, res) {
    if (guestMode) {
        res.end();
    }
    loggedUser = req.session.loggedUser;
    var fields = {};
    var pathDirect;
    var path = './users_images/' + loggedUser.login;
    var fileName;
    var fstream;
    mkdirp(path, function(err) {
        if (err) {
            throw err;
        }
    });
    if (!fileExists(path + '/pictures.json')) {
        fs.writeFile(path + '/pictures.json', '[]', function(errc) {
            if (errc) {
                throw errc;
            }
        });
    }
    req.busboy.on('file', function(fieldname, file, filename) {
        // todo: path.join
        pathDirect = __dirname + '/users_images/' + loggedUser.login + '/' + filename;
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
        writeToJSON(fileName, fields);
    });
    req.pipe(req.busboy);
});

app.post('/remove_photo', function(req, res) {
    if (guestMode) {
        res.end();
    }
    loggedUser = req.session.loggedUser;
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
    console.log(req.session.user);
    if (!req.session.user) {
        res.send({error: 'not logged in'});
        return;
    }
    loggedUser = req.session.loggedUser;
    if (req.query.user) {
        if ((findUser(req.query.user) === false) || (req.query.user === loggedUser.login)){
            res.send([loggedUser, true]);
        } else {
            guestMode = true;
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
    // return users[login] || false;
    if(users[login]) {
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

function writeToJSON(fileName, fields) {
    var images = require('.' + loggedUser.images);
    var newPhoto = {};
    newPhoto.id = String(getRandomPhotoId(0, 999));
    // todo: path.join
    newPhoto.src = path.join('users_images', loggedUser.login, fileName);
    newPhoto.descr = fields.fotoDescribe;
    newPhoto.category = fields.categoryName;
    newPhoto.private = fields.privateFoto ? true : false;

    images.push(newPhoto);
    fs.writeFile('.' + loggedUser.images, JSON.stringify(images, null, '\t'), function(err) {
        if (err) {
            throw err;
        } else {
            console.log('File saved. New photo was add.');
        }
    });
}

var express = require('express');
var fs = require('fs');
var bodyParser = require('body-parser');
var session = require('client-sessions');
var users = require('./users.json');
var fileExists = require('file-exists');
var busboy = require('connect-busboy');
var mkdirp = require('mkdirp');

var app = express();
var urlencodedParser = bodyParser.urlencoded({
    extended: false
});
var loggedUser;
var guestMode = false;

app.use(busboy());
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
        loggedUser = JSON.parse(JSON.stringify(users[user.login]));
        loggedUser.login = user.login;
        delete loggedUser.password;
        res.redirect('/userpage.html');
    } else {
        res.redirect('back');
    }
    res.end();
});

app.post('/changeAvatarka', function(req, res) {
    if (guestMode) {
        res.end();
    }
    var path;
    var ftream;
    req.busboy.on('file', function(fieldname, file, filename) {
        path = __dirname + '/users_images/' + loggedUser.login + "/" + filename;
        ftream = fs.createWriteStream(path);
        file.pipe(ftream);
        loggedUser.avatar = 'users_images/' + loggedUser.login + '/' + filename;
        fs.writeFile('./users.json', JSON.stringify(users, null, '\t'), function(err) {
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
        pathDirect = __dirname + '/users_images/' + loggedUser.login + "/" + filename;
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

app.post('/remove_photo', urlencodedParser, function(req, res) {
    if (guestMode) {
        res.end();
    }
    var remPhotoID = req.body.id;
    var images = require('.' + loggedUser.images);
    for (var i = 0; i < images.length; i++) {
        if (images[i].id === remPhotoID) {
            images.splice(i, 1);
            break;
        }
    }
    fs.writeFile('.' + loggedUser.images, JSON.stringify(images, null, '\t'), function(err) {
        if (err) {
            throw err;
        }
    });
    res.send({status: 'okay'});
});

app.get('/user_page', function(req, res) {
    if (!req.session.user) {
        res.send({error: 'not logged in'});
        return;
    }
    if (req.query.user) {
        if ( (findUser(req.query.user) === false) || (req.query.user === loggedUser.login)){
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
        var guest = JSON.parse(JSON.stringify(users[login]));
        delete guest.password;
        return guest;
    }
    return false;
}

function getRandomPhotoID(min, max) {
    return Math.round(Math.random() * (max - min) + min);
}

function writeToJSON(fileName, fields) {
    var images = require('.' + loggedUser.images);
    var newPhoto = {};
    newPhoto.id = String(getRandomPhotoID(0, 999));
    newPhoto.src = '/users_images/' + loggedUser.login + "/" + fileName;
    newPhoto.descr = fields.fotoDescribe;
    newPhoto.category = fields.categoryName;
    newPhoto.private = fields.privateFoto ? true : false;

    images.push(newPhoto);
    fs.writeFile('.' + loggedUser.images, JSON.stringify(images, null, '\t'), function(err) {
        if (err) {
            throw err;
        } else {
            console.log("File saved. New photo was add.");
        }
    });
}

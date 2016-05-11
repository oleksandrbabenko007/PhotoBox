var express = require('express');
var fs = require('fs');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('client-sessions');
var users = require('./users.json');
var fs = require('fs');
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
        delete loggedUser.password;
        res.redirect('/userpage.html');
    } else {
        res.redirect('back');
    }
    res.end(JSON.stringify(user));
});

app.post('/fileupload', function(req, res) {
    var fstream;
    var userSession = req.session.user;
    req.pipe(req.busboy);
    req.busboy.on('file', function (fieldname, file, filename, val) {
            mkdirp('./users_images/' + userSession.login, function (err) {
            if (err) {
                console.error(err);
            }
            else 
                {
                    console.log('Create!');
            }
        });
        var pathDirect = __dirname + '/users_images/' + userSession.login + "/" + filename;
        fstream = fs.createWriteStream(pathDirect);
        file.pipe(fstream);      
        fstream.on('close', function () {
            res.redirect('/userpage.html');
        });

    });

});

app.post('/modalWindow', urlencodedParser, function(req, res) {
    var images = require('.' + loggedUser.images);

    var checked;
    if (req.body.privateFoto) {
        checked = true;
    } else {
        checked = false;
    }
    var srcPhoto = String('/users_images/' + req.session.user.login + '/' + req.body.inputFile);
    var photoID = String(images.length + 1);
    var newPhoto = {
        id: photoID,
        src: srcPhoto,
        descr: req.body.fotoDescribe,
        category: req.body.categoryName,
        private: checked
    };
    images.push(newPhoto);
    fs.writeFile('.' + loggedUser.images, JSON.stringify(images), function(err) {
        if (err) {
            console.log(err);
        } else {
            console.log("Файл сохранен.Фото записано");
        }
    });
    res.redirect('/userpage.html');
    res.end('okay');
});

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

// This responds a GET request for the /userpage.
app.get('/user_page', function(req, res) {
    if (!req.session.user) {
        res.send({error: 'not logged in'});
        return;
    }
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
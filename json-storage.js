module.exports = JsonStorage;

var fs = require('fs');
var path = require('path');
var mkdirp = require('mkdirp');
var fileExists = require('file-exists');

function JsonStorage(jsonPath) {
    this.jsonPath = jsonPath;

    mkdirp(path.dirname(jsonPath), function(err) {
        if (err) {
            throw err;
        }
    });

    if (!fileExists(jsonPath)) {
        save(jsonPath, {
            data: {},
            lastId: 0
        });
    }
    this.jsonData = JSON.parse(fs.readFileSync(jsonPath));
    this.data = this.jsonData.data;
}

JsonStorage.prototype.getAll = function() {
    return clone(this.data);
};

JsonStorage.prototype.findByKey = function(key) {
    if (this.data[key]) {
        return clone(this.data[key]);
    }
    return false;
};

JsonStorage.prototype.update = function(entity, key) {
    if (typeof this.data[key] === 'undefined') {
        throw new Error(`Update error: entity with key ${key} does not exist`);
    }
    this.data[key] = entity;
    save(this.jsonPath, this.jsonData);
    return true;
};

JsonStorage.prototype.insert = function(entity, key) {
    if (typeof key == 'undefined') {
        key = +(this.jsonData.lastId) + 1;
    }
    if (typeof this.data[key] !== 'undefined') {
        throw new Error(`Insert error: entity with key ${key} already exists`);
    }
    this.data[key] = entity;
    this.jsonData.lastId = key;
    save(this.jsonPath, this.jsonData);
    return key;
};

JsonStorage.prototype.delete = function(key) {
    delete this.data[key];
    save(this.jsonPath, this.jsonData);
};

function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
}

function save(file, data) {
    fs.writeFileSync(file, JSON.stringify(data, null, '    '));
}
var path = require('path');
var fs = require('fs');

var Storage = require('../json-storage.js');

var pathToFile = path.join(__dirname, 'data', 'sample.json');

describe('Json storage test suite', function() {

    beforeEach(function() {
        fs.writeFileSync(pathToFile, JSON.stringify({
            data: {
                1: {name: 'john'},
                2: {name: 'oldman'}
            },
            lastId: 2
        }, null, '    '));
    });

    it('should create file if it does not exist', function() {
        var storage = new Storage(pathToFile);

        expect(storage.getAll()).not.toBeUndefined();
    });

    it('should return all data when getAll called', function() {
        var storage = new Storage(pathToFile);

        expect(storage.getAll()).toEqual({
            1: {name: 'john'},
            2: {name: 'oldman'}
        });
    });

    // findbyKey(key)
    it('should find existing enitity by key', function() {
        var storage = new Storage(pathToFile);
        expect(storage.findByKey(1)).toEqual({
            name: 'john'
        });
    });

    it('should return false if entity with given key does not exist', function() {
        var storage = new Storage(pathToFile);
        expect(storage.findByKey(5)).toBeFalsy();
    });

    it('should return false if key does not given', function() {
        var storage = new Storage(pathToFile);
        expect(storage.findByKey()).toBeFalsy();
    });

    it('should return the clonned copy of entity by its key', function() {
        var storage = new Storage(pathToFile);
        var first = storage.findByKey(1);
        var second = storage.findByKey(1);
        expect(first).not.toBe(second);
    });

    // update(entity, key)
    it('should update file whith new entity by existing key', function() {
        var storage = new Storage(pathToFile);
        var newObj = {name: 'alex'};

        expect(storage.update(newObj, 2)).toBe(true);
    });

    it('should throw error if entity with given key does not exist', function() {
        var storage = new Storage(pathToFile);
        var newObj = {
            name: 'nata'
        };
        var test = function() {
            storage.update(newObj, 5);
        };
        expect(test).toThrowError(Error);
    });

    // insert(entity, key)
    it('should insert new entity to file and return it key', function() {
        var storage = new Storage(pathToFile);

        expect(storage.insert({name: 'obj111'}, 3)).toEqual(3);
        expect(storage.insert({name: 'some'})).toEqual(4);
    });

    it('should throw error if entity with given key already exists', function() {
        var storage = new Storage(pathToFile);

        

        expect(storage.insert({name: 'obj111'}, 1)).toThrowError(Error);
    });

    it('should delete entry by id', function() {
        var storage = new Storage(pathToFile);
        expect(storage.findByKey(2)).toEqual({name: 'oldman'});
        storage.delete(2);
        expect(storage.findByKey(2)).toEqual(false);
    });

    it('should delete entry by id', function() {
        var storage = new Storage(pathToFile);
        storage.delete(5);
    });
});

// userStorage = jsonStorage(__dir.. 'users.json');
// get clonned copy by key
// user = userStorage.findbyKey(req.body.credentials.login);
// userStorage.update(key, entity)
// userStorage.delete(key)
// userStorage.find(property, value);

/*
    //delete(key, entity)
    it('should delete the entity from file', function() {});

    //find("nata", "password", "123")
    //it('should find the some property value of entity', function() {});

    //checkFields(key, [fieldName, ])
    it('should check the necessary fields of entity', function() {});

    // checkPath(key)
    it('should check correctly path to users gallery')

    //it('should find the id(key) last of last entity', function() {});
    it('should generate the id for entity', function() {});
*/
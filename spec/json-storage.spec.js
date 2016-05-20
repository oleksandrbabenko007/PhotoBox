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

    it('should create file if it is not exists', function() {
        var storage = new Storage(pathToFile);

        expect(storage.getAll()).not.toBeUndefined(pathToFile);
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
        expect(storage.findByKey(1)).toEqual({name: 'john'});
    });

    //findbyKey(key)
    it('should return the clonned copy of entity by its key', function() {
        var storage = new Storage(pathToFile);
        var first = storage.findByKey(1);
        var second = storage.findByKey(1);
        expect(first).not.toBe(second);
    });

    //findbyKey(key)
    it('should return false when the entity doesnt exist', function() {
        var storage = new Storage(pathToFile);
        var obj = storage.findByKey(3);
        expect(obj).toEqual(false);
    });

    //update(key, entity)
    it('should update file whith new entity', function() {
        var storage = new Storage(pathToFile);
        var newObj = {name: 'nata'};

        expect(storage.update(newObj, 2)).toBe(true);
        expect(storage.insert({name:'obj111'}, 3)).toEqual(3);
        expect(storage.insert({name: 'some'})).toEqual(4);
    });


    it('should delete entry by id', function(){
        var storage = new Storage(pathToFile);
        expect(storage.findByKey(2)).toEqual({name: 'oldman'});
        storage.delete(2);
        expect(storage.findByKey(2)).toEqual(false);
    });

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

});



    // userStorage = jsonStorage(__dir.. 'users.json');
    // get clonned copy by key
    // user = userStorage.findbyKey(req.body.credentials.login);
    // userStorage.update(key, entity)
    // userStorage.delete(key)
    // userStorage.find(property, value);
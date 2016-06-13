module.exports = {
    "extends": "google",
    "rules": {
        "indent": ["error", 4],
        "max-len": ["error", 150]
    },
    "globals": {
        "jQuery": true,
        "angular": true,
        "$": true
     },
    "env": {
        "browser": true,
        "jasmine": true
    }
};

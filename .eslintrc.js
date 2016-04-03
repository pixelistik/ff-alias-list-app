"use strict";

module.exports = {
    "rules": {
        "indent": [
            2,
            4
        ],
        "quotes": [
            2,
            "double",
            "avoid-escape"
        ],
        "linebreak-style": [
            2,
            "unix"
        ],
        "semi": [
            2,
            "always"
        ],
        "curly": [2],
        "no-multi-spaces": [2],
        "eqeqeq": [2],
        "strict": [2, "safe"],
        "brace-style": [2],
        "space-before-function-paren": [
            2,
            { "anonymous": "always", "named": "never" }
        ],
        "space-before-blocks": [2],
        "new-cap": [2],
        "no-unused-vars": [1]
    },
    "env": {
        "browser": true,
        "node": true,
        "mocha": true
    },
    "globals": {
        "Promise": true,
        "resolveLocalFileSystemURL": true,
        "FfAliasList": true,
        "ko": true
    },
    "extends": "eslint:recommended"
};

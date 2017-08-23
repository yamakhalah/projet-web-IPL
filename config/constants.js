function define(name, value) {
    Object.defineProperty(exports, name, {
        value:      value,
        enumerable: true
    });
}

define("SERVER_ADDRESS", "http://localhost:3000");
define("CLIENT_ADDRESS", "http://localhost:3000");
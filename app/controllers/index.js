var GameController = require('./GameController')
var NightController = require('./NightController')
var UserController = require('./UserController')

module.exports = {
    night: NightController,
    game: GameController,
    user: UserController,
}

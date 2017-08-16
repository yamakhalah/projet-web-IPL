var GameController = require('./GameController')
var NightController = require('./NightController')
var NightGameController = require('./NightGameController')
var NightGameUserController = require('./NightGameUserController')
var NightUserController = require('./NightUserController')
var UserController = require('./UserController')

module.exports = {
    night: NightController,
    game: GameController,
    user: UserController,
}

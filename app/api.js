var express = require ('express')
var router = express.Router()
var controllers = require('./controllers') // no need to put /index.js because it is the default file

// Generic method to get all the documents linked to the ressource :ressource
router.get('/:resource', function(req, res, next) {
    var resource = req.params.resource
    var controller = controllers[resource]

    if (controller == null) {
        res.json({
            confirmation: 'fail',
            message: 'Invalid resource request: ' + resource
        })
        return 
    }

    controller.find(req.query, function(err, results) {
        if (err) {
            res.json({
                confirmation: 'fail',
                message: err
            })
            return    
        }

        res.json({
            confirmation: 'success',
            results: results
        })
    })
});

// Generic method to get the documents linked to the ressource :ressource with the id :id
router.get('/:resource/:id', function(req, res, next) {
    var resource = req.params.resource
    var id = req.params.id
    var controller = controllers[resource]

    if (controller == null) {
        res.json({
            confirmation: 'fail',
            message: 'Invalid resource request: ' + resource
        })
        return 
    }

    controller.findById(id, function(err, result) {
        if (err) {
            res.json({
                confirmation: 'fail',
                message: 'Couldn\'t find the ' + resource
            })
            return
        }

        res.json({
            confirmation: 'success',
            result: result
        })
    })
})

// Generic method to post a document to the resource :resource
router.post('/:resource', function(req, res, next) {
    var resource = req.params.resource
    var controller = controllers[resource]

    if (controller == null) {
        res.json({
            confirmation: 'fail',
            message: 'Invalid resource request: ' + resource
        })
        return 
    }

    controller.create(req.body, function(err, result) {
        if (err) {
            res.json({
                confirmation: 'fail',
                message: err
            })

            return
        }

        res.json({
            confirmation: 'success',
            result: result
        })
    })
})

module.exports = router;
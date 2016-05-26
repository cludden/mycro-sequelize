'use strict';

module.exports = function() {
    return {
        'v1.0.0': {
            '/health': {
                get(req, res) {
                    res.json(200, {status: 'healthy'});
                }
            }
        }
    };
};

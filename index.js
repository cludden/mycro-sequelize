'use strict';

const async = require('async');
const joi = require('joi');
const Sequelize = require('sequelize');
const _ = require('lodash');

module.exports = {
    registerConnection(config, cb) {
        async.waterfall([
            function validateConfig(fn) {
                let configSchema = joi.object({
                    url: joi.string(),
                    username: joi.string(),
                    password: joi.string(),
                    database: joi.string(),
                    options: joi.object().default({})
                })
                .or('url', 'database')
                .with('database', ['username', 'password'])
                .unknown(false)
                .required();

                joi.validate(config, configSchema, {}, fn);
            },

            function instantiateInstance(validated, fn) {
                let sequelize;
                if (validated.url) {
                    sequelize = new Sequelize(validated.url, validated.options);
                } else {
                    sequelize = new Sequelize(validated.database, validated.username, validated.password, validated.options);
                }
                sequelize.authenticate().nodeify(function(err) {
                    if (err) {
                        return fn(err);
                    }
                    fn(null, sequelize);
                });
            }
        ], function(err, connection) {
            if (err) {
                console.error('[mycro-sequelize] connection error: ', err);
            }
            cb(err, connection);
        });
    },


    registerModel(sequelize, definition, name, mycro, cb) {
        try {
            let model = definition.factory(sequelize, Sequelize, name, mycro);
            return cb(null, model);
        } catch (e) {
            return cb('Error defining sequelize model (' + name + '): ' + e);
        }
    }
};

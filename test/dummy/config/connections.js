'use strict';

const sequelizeAdapter = require('../../../index');

module.exports = {
    mysql: {
        adapter: sequelizeAdapter,
        config: {
            username: 'bob',
            password: 'password',
            database: 'test',
            options: {
                host: 'mysql',
                port: 3306,
                dialect: 'mysql',
                pool: {
                    max: 5,
                    min: 0,
                    idle: 10000
                }
            }
        }
    }
};

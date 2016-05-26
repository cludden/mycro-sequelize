'use strict';

module.exports = {
    factory(sequelize, Sequelize, name) {
        return sequelize.define(name, {
            first: {
                type: Sequelize.STRING
            },
            last: {
                type: Sequelize.STRING
            },
            email: {
                type: Sequelize.STRING
            }
        });
    }
};

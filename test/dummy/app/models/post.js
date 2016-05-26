'use strict';

module.exports = {
    factory(sequelize, Sequelize, name) {
        return sequelize.define(name, {
            title: {
                type: Sequelize.STRING
            },
            content: {
                type: Sequelize.STRING
            }
        });
    }
};

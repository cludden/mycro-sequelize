'use strict';

module.exports = {
    factory(sequelize, Sequelize, name) {
        return sequelize.define(name, {
            name: {
                type: Sequelize.STRING
            },
            desc: {
                type: Sequelize.STRING
            }
        });
    }
};

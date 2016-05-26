## mycro-sequelize
a [sequelize](https://github.com/sequelize/sequelize) adapter for [mycro](https://github.com/cludden/mycro) apps.

## Installing
Install sequelize and the adapter
```bash
npm install --save sequelize mycro-sequelize
```

Install appropriate dialects
```bash
npm install --save mysql|pg & pg-hstore|tedious|sqlite3
```

## Getting Started
Define a sequelize supported connection:
```javascript
// in config/connections.js
const sequelizeAdapter = require('mycro-sequelize');

module.exports = {
    //..
    mysql: {
        adapter: sequelizeAdapter,
        config: {
            // include a connection url, or
            url: '<connection uri>'

            // include username, password, and database
            username: 'bob',
            password: 'password',
            database: 'test',

            // define additional options to pass to sequelize
            options: {
                dialect: 'mysql',
                host: 'localhost',
                port: 3306,
                pool: {
                    // ..
                },
                //..
            }
        }
    }
    //..
}
```

Define one or more models. Each model module must export an object that defines a factory function. This factory function receives the sequelize instance, the Sequelize constructor, the current model name, and the mycro instance as arguments. It should return a sequelize model.
```javascript
// in app/models/user.js

module.exports = {
    factory(sequelize, Sequelize, name, mycro) {
        return  sequelize.define(name, {
            first: {
                type: Sequelize.STRING
            },
            last: {
                type: Sequelize.STRING
            }
        });
    }
}
```

Use them in your app!
```javascript
// in some controller
const async = require('async');
const joi = require('joi');

module.exports = function(mycro) {
    return {
        /**
         * Create user endpoint
         * @param  {Object} req
         * @param  {Object} req.body
         * @param  {String} req.body.first
         * @param  {String} req.body.last
         * @param  {Object} res
         */
        create(req, res) {
            const Users = mycro.models.user;
            async.waterfall([
                function validateRequest(fn) {
                    const schema = joi.object({
                        first: joi.string().alphanum().trim().lowercase().required(),
                        last: joi.string().alphanum().trim().lowercase().required()
                    }).unknown(false).required();
                    joi.validate(req.body, schema, function(err, validated) {
                        if (err) {
                            res.json(400, {errors: [err]});
                            return fn(err);
                        }
                        fn(null, validated);
                    });
                },

                function createUser(validated, fn) {
                    Users.create(validated).nodeify(function(err, user) {
                        if (err) {
                            res.json(500, {errors: [err]});
                            return fn(err);
                        }
                        res.json(200, user.get({ plain: true }));
                        fn();
                    });
                }
            ]);
        }
    }
}
```

## Assocations
Currently, associations must be defined separately from this hook. You can easily accomplish this by defining your own hook and including it in the hook config.
```javascript
// in hooks/associations.js

module.exports = function(done) {
    const models = this.models;
    const Users = models.user;
    const Groups = models.groups;

    Users.belongsToMany(Groups, {as: 'groups', through: 'user_groups', foreignKey: 'userId'});
    Groups.belongsToMany(Users, {as: 'users', through: 'user_groups', foreignKey: 'groupId'});

    process.nextTick(done);
}
```

## Testing
1. Make sure you have an up to date docker toolkit installed
2. Build the container
```bash
docker-compose build
```
3. Run the test suite
```bash
docker-compose up
```

## Contributing
1. [Fork it](https://github.com/cludden/mycro-sequelize/fork)
2. Create your feature branch (`git checkout -b my-new-feature`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Push to the branch (`git push origin my-new-feature`)
5. Create new Pull Request

## License
Copyright (c) 2016 Chris Ludden.
Licensed under the [MIT icense](LICENSE.md)

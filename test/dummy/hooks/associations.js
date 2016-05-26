'use strict';

const async = require('async');

module.exports = function(done) {
    const models = this.models;
    const Users = models.user;
    const Groups = models.group;
    const Posts = models.post;

    Groups.belongsToMany(Users, {as: 'users', through: 'user_groups', foreignKey: 'groupId'});

    Posts.belongsTo(Users, {as: 'author', foreignKey: 'authorId'});
    Posts.belongsToMany(Users, {as: 'likes', through: 'post_likes', foreignKey: 'postId'});

    Users.belongsToMany(Groups, {as: 'groups', through: 'user_groups', foreignKey: 'userId'});
    Users.hasMany(Posts, {as: 'posts', foreignKey: 'authorId'});
    Users.belongsToMany(Posts, {as: 'liked', through: 'post_likes', foreignKey: 'userId'});

    async.setImmediate(done);
};

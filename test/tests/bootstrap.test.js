'use strict';

const async = require('async');
const chai = require('chai');
const mysql = require('mysql');
const sinonchai = require('sinon-chai');
const supertest = require('supertest');

chai.use(sinonchai);
const expect = chai.expect;

before(function(done) {
    process.env.NODE_ENV = 'test';

    async.auto({
        mysql: function waitForMySqlInitialization(fn) {
            let ready = false;
            async.until(function() {
                return ready;
            }, function(next) {
                const connection = mysql.createConnection({
                    host: 'mysql',
                    user: 'bob',
                    password: 'password',
                    database: 'test'
                });

                connection.connect(function(err) {
                    if (err) {
                        connection.destroy();
                        return next();
                    }
                    ready = true;
                    connection.destroy();
                    next();
                });
            }, fn);
        },

        app: ['mysql', function initializeDummyApp(fn) {
            process.chdir(__dirname + '/../dummy');
            const app = require('../dummy/app');
            app.start(function(err) {
                if (err) {
                    return fn(err);
                }
                global.mycro = app;
                global.request = supertest.agent(mycro.server);
                fn();
            });
        }],

        sync: ['app', function(fn) {
            const sequelize = mycro.connections.mysql.connection;
            sequelize.sync({
                force: true,
                logging: console.log
            }).nodeify(fn);
        }]
    }, done);
});

describe('basic tests', function() {
    let Groups;
    let Posts;
    let Users;

    before(function() {
        Groups = mycro.models.group;
        Posts = mycro.models.post;
        Users = mycro.models.user;
    });

    it('should start successfully', function(done) {
        request.get('/health')
        .expect(200)
        .end(done);
    });

    it('should register all models', function() {
        ['group', 'post', 'user'].forEach(function(model) {
            expect(mycro.models).to.have.property(model).that.is.an('object');
        });
    });

    it('should function as anticipated', function(done) {
        async.auto({
            user: function createUser(fn) {
                Users.create({
                    first: 'will',
                    last: 'smith',
                    email: 'wsmith@example.com'
                }).nodeify(fn);
            },

            groups: function createGroups(fn) {
                async.map([{
                    name: 'all users',
                    desc: 'default group for all users'
                },{
                    name: 'admins',
                    desc: 'site administrators'
                }], function(group, next) {
                    Groups.create(group).nodeify(next);
                }, fn);
            },

            posts: function createPosts(fn) {
                async.map([{
                    title: 'My first post!',
                    content: 'Not a lot going on.'
                },{
                    title: 'My second post!',
                    content: 'Even less to talk about.'
                }], function(post, next) {
                    Posts.create(post).nodeify(next);
                }, fn);
            },

            user_groups: ['user', 'groups', function(fn, r) {
                const User = r.user;
                User.setGroups(r.groups).nodeify(fn);
            }],

            post_author: ['user', 'posts', function(fn, r) {
                const User = r.user;
                async.each(r.posts, function(post, next) {
                    post.setAuthor(User).nodeify(next);
                }, fn);
            }],

            test: ['user_groups', 'post_author', function(fn, r) {
                Users.findById(r.user.get('id'), {
                    include: [{
                        model: Groups,
                        as: 'groups'
                    },{
                        model: Posts,
                        as: 'posts'
                    }]
                }).nodeify(function(err, user) {
                    if (err) {
                        return fn(err);
                    }
                    user = user.get({ plain: true });
                    expect(user).to.be.an('object');
                    expect(user).to.have.property('first', 'will');
                    expect(user).to.have.property('last', 'smith');
                    expect(user).to.have.property('email', 'wsmith@example.com');
                    expect(user).to.have.property('groups').that.is.an('array').with.lengthOf(2);
                    user.groups.forEach(function(group) {
                        expect(group).to.be.an('object');
                        expect(group).to.have.property('name');
                        expect(group).to.have.property('desc');
                    });
                    expect(user).to.have.property('posts').that.is.an('array').with.lengthOf(2);
                    user.posts.forEach(function(post) {
                        expect(post).to.be.an('object');
                        expect(post).to.have.property('title');
                        expect(post).to.have.property('content');
                    });
                    fn(err);
                });
            }]
        }, done);
    });
});

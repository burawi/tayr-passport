var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var socialStrategies = {
    facebook: require('passport-facebook'),
    google: require('passport-google-oauth').OAuth2Strategy,
    twitter: require('passport-twitter').Strategy
};
var expressSession = require('express-session');
var md5 = require('md5');

module.exports = {
    use: function(D) {

        var defaults = {
            secret: 'secret',
            usernameField: 'email',
            loginSrategyName: 'login',
            usersTable: 'user',
            socials: {},
            onCreateSocials: function (profile) {
                return {
                    username: profile.displayName,
                    createdAt: new Date()
                };
            }
        };

        D = Object.assign({},defaults,D);

        if(D.socials.facebook !== undefined){
            D.socials.facebook.profileFields = ['id', 'emails', 'displayName'];
        }

        if(D.socials.twitter !== undefined){
            D.socials.twitter.includeEmail = true;
        }

        if(D.app !== undefined && D.T !== undefined){
            var app = D.app;
            var T = D.T;

            app.use(expressSession({
                secret: D.secret,
                resave: true,
                saveUninitialized: true
            }));

            app.use(passport.initialize());
            app.use(passport.session());

            passport.serializeUser(function(user, done) {
                done(null, user.id);
            });

            passport.deserializeUser(function(id, done) {
                T.load(D.usersTable, id).then(function(user) {
                    done(null, user);
                });
            });

            passport.use(D.loginSrategyName, new LocalStrategy({
                    passReqToCallback: true,
                    usernameField: D.usernameField,
                    passwordField: 'password'
                },
                function(req, email, password, done) {
                    T.findOne(D.usersTable, {
                        sql: D.usernameField+" = ?",
                        vals: email
                    }).then(
                        function(user) {
                            // Username does not exist, log error & redirect back
                            if (!user) {
                                return done(null, false);
                            }
                            // User exists but wrong password, log the error
                            if (md5(password) == md5(user.password)) {
                                return done(null, false);
                            }
                            // User and password both match, return user from
                            // done method which will be treated like success
                            return done(null, user);
                        }
                    );
                })
            );

            var socialsList = Object.keys(D.socials);
            socialsList.forEach(function(social) {
                passport.use(new socialStrategies[social](D.socials[social],
                    function(accessToken, refreshToken, profile, done) {
                        var user = new T.tayr(D.usersTable, {
                            email: profile.emails[0].value,
                        });
                        user[social + 'Id'] = profile.id;
                        var onCreate = D.onCreateSocials(profile);
                        user.findOrCreate({
                            by: ['email'],
                            onCreate: onCreate
                        }).then(function() {
                            done(null, user);
                        });
                    }
                ));
            });
        }else {
            console.error("app and T are required in passport-tayr");
        }

        return passport;
    }
}

it uses md5

# Usage

```javascript

var tayrPassport = require('./tayr-passport');

var passport = tayrPassport.use({
    app: app, // Required
    T: T, // Required
    secret: 'secret',
    usernameField: 'email',
    loginSrategyName: 'login',
    usersTable: 'user',
    socials: {
        facebook: {
            clientID: "CLIENTID",
            clientSecret: "CLIENTSECRET",
            callbackURL: "http://www.example.com/callback",
        },
        google: {
            clientID: "CLIENTID",
            clientSecret: "CLIENTSECRET",
            callbackURL: "http://www.example.com/callback",
        },
        twitter: {
            consumerKey: "CONSUMERKEY",
            consumerSecret: "CONSUMERSECRET",
            callbackURL: "http://www.example.com/callback",
        }
    },
    onCreateSocials: function (profile) {
        return {
            username: profile.displayName,
            register_date: new Date(),
            role: 'normal'
        }
    }
});

```

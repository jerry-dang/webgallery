import { rmSync } from "fs";
import { join } from "path";
import { createServer } from "http";
import session from "express-session";
import { parse, serialize } from "cookie";
import { genSalt, hash, compare } from "bcrypt";
import validator from "validator";
import express from "express";
import Datastore from "nedb";
import multer from "multer";

const PORT = 3000;

const app = express();

app.use(
    session({
      secret: "please change this secret",
      resave: false,
      saveUninitialized: true,
      cookie: {
        httpOnly: false,
        secure: false,
        sameSite: "strict",
      }
    })
);

app.use(function (req, res, next) {
    let cookies = parse(req.headers.cookie || "");
    req.username = cookies.username ? cookies.username : null;
    console.log("HTTP request", req.username, req.method, req.url, req.body);
    next();
});

const upload = multer({ dest: 'uploads/' });

let users = new Datastore({
    filename: join("db", "users.db"),
    autoload: true,
});
let comments = new Datastore({ 
    filename: join("db", "comments.db"), 
    autoload: true, 
    timestampData: true,
});
let images = new Datastore({ 
    filename: join("db", "images.db"), 
    autoload: true, 
    timestampData: true,
});

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use(express.static("static"));

app.use('/uploads', express.static("uploads"));

app.use(function (req, res, next) {
    console.log("HTTP request", req.method, req.url, req.body);
    next();
});

const isAuthenticated = function (req, res, next) {
    if (!req.session.username) return res.status(401).end("access denied");
    next();
};

const checkUsername = function(req, res, next) {
    if (!validator.isAlphanumeric(req.body.username)) return res.status(400).end("bad input - (username)");
    next();
};
  
const sanitizeContent = function(req, res, next) {
    req.body.content = validator.escape(req.body.content);
    next();
}
  
const checkId = function(req, res, next) {
    if (!validator.isAlphanumeric(req.params.id)) return res.status(400).end("bad input - (id)");
    next();
};

app.post("/signup/", function (req, res, next) {
    // extract data from HTTP request
    if (!("username" in req.body))
      return res.status(400).end("username is missing");
    if (!("password" in req.body))
      return res.status(400).end("password is missing");
    let username = req.body.username;
    let password = req.body.password;
    // check if user already exists in the database
    users.findOne({ _id: username }, function (err, user) {
      if (err) return res.status(500).end(err);
      if (user)
        return res.status(409).end("username " + username + " already exists");
      // generate a new salt and hash
      genSalt(10, function (err, salt) {
        hash(password, salt, function (err, hash) {
          // insert new user into the database
          users.update(
            { _id: username },
            { _id: username, hash: hash },
            { upsert: true },
            function (err) {
              if (err) return res.status(500).end(err);
              return res.json(username);
            }
          );
        });
      });
    });
});

app.post("/signin/", function (req, res, next) {
    // extract data from HTTP request
    if (!("username" in req.body))
      return res.status(400).end("username is missing");
    if (!("password" in req.body))
      return res.status(400).end("password is missing");
    let username = req.body.username;
    let password = req.body.password;
    // retrieve user from the database
    users.findOne({ _id: username }, function (err, user) {
      if (err) return res.status(500).end(err);
      if (!user) return res.status(401).end("access denied");
      compare(password, user.hash, function (err, valid) {
        if (err) return res.status(500).end(err);
        if (!valid) return res.status(401).end("access denied");
        // start a session
        req.session.username = username;
        res.setHeader(
          "Set-Cookie",
          serialize("username", user._id, {
            path: "/",
            maxAge: 60 * 60 * 24 * 7, // 1 week in number of seconds
            secure: false,
            sameSite: "strict",
          })
        );
        return res.json(username);
      });
    });
});

app.get("/signout/", function (req, res, next) {
    req.session.destroy();
    res.setHeader(
      "Set-Cookie",
      serialize("username", "", {
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 1 week in number of seconds
      })
    );
    return res.redirect("/");
});

app.get("/api/users/", function (req, res, next) {
    users.count({}, function(err, count) {
        if (err) return res.status(500).end(err);

        const totalUsers = count;
        const page = parseInt(req.query.page, 10) || 0;

        users
            .find({})
            .sort({ createdAt: -1 })
            .limit(1)
            .skip(page * 1)
            .exec(function (err, users) {
                if (err) return res.status(500).end(err);

                const response = {
                    users: users.reverse(),
                    totalUsers: totalUsers,
                    currentUserPage: page
                };

                return res.json(response);
            });
    });
});

app.get("/api/users/:id/", function (req, res, next) {
    const username = req.params.id;
    users.findOne({ _id: username }, function (err, user) {
        if (err) return res.status(500).end(err);
        if (!user) return res.status(404).end("User id #: " + username + " does not exist");
        return res.json(username);
    });
});

// app.get("/api/users/current/", function (req, res, next) {
//     if (!req.session.username) {
//         return res.status(401).send('Not logged in');
//     }
//     res.json({ username: req.session.username });
// });

app.post("/api/users/:id/images/", isAuthenticated, upload.single("picture"), function (req, res, next) {
    images.insert({ title: req.body.title, author: req.body.author, 
        picture: req.file, owner: req.session.username }, function(err, image) {
        if (err) return res.status(500).end(err);
        return res.redirect("/");
     });
});

app.get("/api/users/:id/images/", function (req, res, next) {
    images.count({}, function(err, count) {
        if (err) return res.status(500).end(err);
        
        const page = parseInt(req.query.page, 10) || 0;
        console.log(req.params.id)
        images
            .find({ owner: req.params.id })
            .sort({ createdAt: -1 })
            .limit(1)
            .skip(req.query.page * 1)
            .exec(function (err, images){
                if (err) return res.status(500).end(err);

                const response = {
                    images: images.reverse(),
                    totalImages: images.length,
                    currentPage: page * 1
                };

                return res.json(response);
            });
    });
});

app.delete("/api/users/:id/images/:id/", isAuthenticated, function (req, res, next) {
    const imageId = req.params.id;
    images.findOne({_id: imageId}, function(err, image) {
        if (err) return res.status(500).end(err);
        if (!image)
            return res
                .status(404)
                .end("Image id #: " + req.params.id + " does not exist");
        if (image.owner !== req.session.username)
            return res.status(403).end("forbidden");
        comments.remove({ imageId: image._id }, { multi: true }, function(err, num) {
            if (err) return res.status(500).end(err);

            images.remove({ _id: image._id }, { multi: false }, function(err, num) {
                if (err) return res.status(500).end(err);
                res.json(image);
            });
        });
    });
});

app.post("/api/users/:id/images/:id/comments/", sanitizeContent, 
        isAuthenticated, function (req, res, next) {
    comments.insert({ imageId: req.body.imageId, author: req.body.author, content: req.body.content },
         function(err, comment) {
        if (err) return res.status(500).end(err);
        return res.json(comment);
      });
});

app.get("/api/users/:id/images/:imageId/comments/", function (req, res, next) {
    comments.count({}, function(err, count) {
        if (err) return res.status(500).end(err);

        const totalComments = count;
        const page = parseInt(req.query.page, 10) || 0;

        comments
            .find({ imageId: req.params.imageId })
            .sort({ createdAt: -1 })
            .limit(5)
            .skip(page * 5)
            .exec(function (err, comments) {
                if (err) return res.status(500).end(err);

                const response = {
                    comments: comments.reverse(),
                    totalComments: totalComments,
                    currentCommentPage: page
                };
                return res.json(response);
            });
    });
});

app.delete("/api/users/:id/images/:id/comments/:id", isAuthenticated, function (req, res, next) {
    comments.findOne({ _id: req.params.id }, function (err, comment) {
        if (err) return res.status(500).end(err);
        if (!comment)
          return res
            .status(404)
            .end("Comment id #: " + req.params.id + " does not exists");
        if (comment.author !== req.session.username)
            return res.status(403).end("forbidden");
        comments.remove({ _id: comment._id }, {multi: false}, function(err, num) {
          res.json(comment);
        });
    });
});

// Testing purposes only
export function createTestDb() {
    comments = new Datastore({ 
        filename: join("testdb", "comments.db"), 
        autoload: true, 
    });
    images = new Datastore({ 
        filename: join("testdb", "images.db"),
        autoload: true, 
        timestampData: true,
    });
}

export function deleteTestDb() {
    rmSync("testdb", { recursive: true, force: true });
}

export function getImages(callback) {
    return images
        .find({})
        .sort({ createdAt: -1 })
        .limit(1)
        .exec(function (err, images) {
            if (err) return callback(err, null);
            return callback(err, images.reverse());
        })
}

export const server = createServer(app).listen(PORT, function (err) {
    if (err) console.log(err);
    else console.log("HTTP server on http://localhost:%s", PORT);
});

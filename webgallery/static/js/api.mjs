/*  ******* Data types *******
    image objects must have at least the following attributes:
        - (String) _id 
        - (String) title
        - (String) author
        - (Date) date

    comment objects must have the following attributes
        - (String) _id
        - (String) imageId
        - (String) author
        - (String) content
        - (Date) date

****************************** */

function send(method, url, data, callback) {
    const xhr = new XMLHttpRequest();
    xhr.onload = function () {
      if (xhr.status !== 200)
        callback("[" + xhr.status + "]" + xhr.responseText, null);
      else callback(null, JSON.parse(xhr.responseText));
    };
    xhr.open(method, url, true);
    if (!data) xhr.send();
    else {
      xhr.setRequestHeader("Content-Type", "application/json");
      xhr.send(JSON.stringify(data));
    }
}

// get the username of the current user
export function getUsername() {
    // return document.cookie.replace(
    //   /(?:(?:^|.*;\s*)username\s*\=\s*([^;]*).*$)|^.*$/,
    //   "$1",
    // );
    const encodedUsername = document.cookie.replace(
        /(?:(?:^|.*;\s*)username\s*\=\s*([^;]*).*$)|^.*$/,
        "$1",
      );
    return decodeURIComponent(encodedUsername);
}

export function signin(username, password, callback) {
    send("POST", "/signin/", { username, password }, callback);
}
  
export function signup(username, password, callback) {
    send("POST", "/signup/", { username, password }, callback);
}

// export function signout(callback) {
//     send("POST", "/signout/", null, callback);
// }

// add an image to the gallery
export function addImage(userId, title, author, file, callback) {
    send(
        "POST",
        "/api/users/" + userId + "/images/",
        { title: title, author: author, file: file },
        function (err, res) {
            if (err) return callback(err);
            else return callback(null);
        },
    );
}

// delete an image from the gallery given its imageId
export function deleteImage(userId, imageId, callback) {
    send("DELETE", "/api/users/" + userId + "/images/" + imageId + "/", null, function (err, res) {
        if (err) return callback(err);
        else return callback(null);
    });
}

export function getUsers(page = 0, callback) {
    send("GET", "/api/users?page=" + page, null, callback);
}

export function getImages(page = 0, userId, callback) {
    send("GET", "/api/users/" + userId + "/images?page=" + page, null, callback);
}

export function getComments(page = 0, userId, imageId, callback) {
    send("GET", "/api/users/" + userId + "/images/" + imageId + "/comments?page=" + page, null, callback);
}

// add a comment to an image
export function addComment(userId, imageId, content, callback) {
    send(
        "POST",
        "/api/users/" + userId + "/images/" + imageId + "/comments/",
        {author: userId, content: content, imageId: imageId},
        function (err, res) {
            if (err) return callback(err);
            else return callback(null);
        },
    );
}

// delete a comment to an image
export function deleteComment(userId, imageId, commentId, callback) {
    send("DELETE", "/api/users/" + userId + "/images/" + imageId + "/comments/" + commentId + "/", null, function (err, res) {
        if (err) return callback(err);
        else return callback(null);
    });
}

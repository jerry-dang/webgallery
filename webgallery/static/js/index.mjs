import { 
  getImages, 
  deleteImage, 
  getComments, 
  addComment, 
  deleteComment, 
  getUsers,
  getUsername
} from './api.mjs';

function onError(err) {
    console.error("[error]", err);
    let error_box = document.querySelector("#error_box");
    error_box.innerHTML = err;
    error_box.style.visibility = "visible";
}

let currentUserId = null;
currentUserId = getUsername();
let galleryUser = null;
let currentUserPage = 0;
let currentImageId = null;
let currentPage = 0;
let currentCommentPage = 0;
let totalComments = 0;
let maxCommentsPageNum = 0;
const commentsPerPage = 5;

const leftArrow = document.querySelector(".navigate-comments .left-arrow");
const rightArrow = document.querySelector(".navigate-comments .right-arrow");
rightArrow.style.display = 'none';
leftArrow.style.display = 'none';

function navigateComments(totalComments) {
  if (totalComments < commentsPerPage) {
    rightArrow.style.display = 'none';
    leftArrow.style.display = 'none';
  } else if (totalComments > commentsPerPage) {
    rightArrow.style.display = 'flex';
    leftArrow.style.display = 'flex';
  }
}

function updateUsers(currentUserPage) {
  document.querySelector("#users-display").innerHTML = "";

  const button = document.getElementById("toggle-comments");
  button.style.display = "none";

  const content = document.getElementById("comments-form");
  content.style.display = "none";

  getUsers(currentUserPage, function (err, response) {
    if (err) return onError(err);
      //create a new user element
      const user = response.users[0];
      const totalUsers = response.totalUsers;
      currentUserPage = response.currentUserPage;

      if (totalUsers === 0) {
        return;
      }

      const elmt = document.createElement("div");
      elmt.className = "user";
      elmt.innerHTML = `
        <div class="user-display-actions">
          <div class="left-arrow icon"></div>
          <div class="user-username">${user._id}'s Gallery</div>
          <div class="right-arrow icon"></div> 
        </div>
      `;

      elmt
        .querySelector(".left-arrow")
        .addEventListener("click", function (e) {
          // navigatePrevious
          if (currentUserPage > 0) {
            currentUserPage--;
            updateUsers(currentUserPage);
          }
        });
      elmt
        .querySelector(".right-arrow")
        .addEventListener("click", function (e) {
          // navigateNext
          if (currentUserPage < totalUsers - 1) {
            currentUserPage++;
            updateUsers(currentUserPage);
          }
        });
      // add this element to the document
      document.getElementById("users-display").prepend(elmt);
      galleryUser = user._id;
      console.log("gallery user: " + galleryUser);
      updateImages(galleryUser, currentPage);
      updateComments(galleryUser, null, currentCommentPage);
  });
}

function updateImages(userId, currentPage) {
    document.querySelector("#image-display").innerHTML = "";

    getImages(currentPage, userId, function (err, response) {
        if (err) return onError(err);
            // create a new image element
            const image = response.images[0];
            // if(!image) {
            //   updateComments(userId, null, currentCommentPage);
            // }
            const totalImages = response.totalImages;
            currentPage = response.currentPage;

            const button = document.getElementById("toggle-comments");
            if (totalImages > 0) {
              button.style.display = "block";
            } else if (totalImages === 0) {
              button.style.display = "none";
            }

            const content = document.getElementById("comments-form");
            if (button.style.display === "block") {
              button.addEventListener("click", function (e) {
                if (content.style.display === "none") {
                  content.style.display = "flex";
                } else {
                  content.style.display = "none";
                }
              });
            } else {
              content.style.display = "none";
            }

            if (totalImages === 0) {
              return;
            }

            const elmt = document.createElement("div");
            elmt.className = "image";
            elmt.innerHTML = `
                <img id="current-image" src="/uploads/${image.picture.filename}" alt="${image.title}">
                <h2 id="current-title">${image.title}</h2>
                <p id="current-author">${image.author}</p>
                <div class="image-display-actions">            
                    <div class="left-arrow icon"></div>
                    <div class="delete-image icon"></div>
                    <div class="right-arrow icon"></div>
                </div>
            `;

            elmt
              .querySelector(".delete-image")
              .addEventListener("click", function (e) {
                deleteImage(userId, image._id, function(err) {
                  if (err) return onError(err);
                  if (currentPage === totalImages - 1) {
                    currentPage--;
                    return updateImages(userId, currentPage);
                  } else if (currentPage !== 0 && currentPage < totalImages - 1) {
                    currentPage--;
                    return updateImages(userId, currentPage);
                  } else {
                    return updateImages(userId, currentPage);
                  }
                });
                updateComments(userId, currentImageId, currentCommentPage);
              });
              rightArrow.style.display = 'none';
              leftArrow.style.display = 'none';
            elmt
              .querySelector(".left-arrow")
              .addEventListener("click", function (e) {
                // navigatePrevious
                if (currentPage > 0) {
                  currentPage--;
                  updateImages(userId, currentPage);
                }
                rightArrow.style.display = 'none';
                leftArrow.style.display = 'none';
              });
            elmt
              .querySelector(".right-arrow")
              .addEventListener("click", function (e) {
                // navigateNext
                if (currentPage < totalImages - 1) {
                  currentPage++;
                  updateImages(userId, currentPage);
                }
                rightArrow.style.display = 'none';
                leftArrow.style.display = 'none';
              });
                
            // add this element to the document
            document.getElementById("image-display").prepend(elmt);
            currentImageId = image._id;
            updateComments(userId, currentImageId, currentCommentPage);
    });
}

function updateComments(userId, imageId, currentCommentPage) {

    document.querySelector("#comments").innerHTML = "";

    getComments(currentCommentPage, userId, imageId, function (err, response) {
        if (err) return onError(err);
        const comments = response.comments;
        currentCommentPage = response.currentCommentPage;
        totalComments = response.totalComments;

        maxCommentsPageNum = Math.floor((totalComments - 1) / commentsPerPage);

        if (totalComments === 0) {
          rightArrow.style.display = 'none';
          leftArrow.style.display = 'none';
        }

        comments.forEach(function (comment) {
            // create a new comment element
            const elmt = document.createElement("div");
            elmt.className = "comment";
            elmt.innerHTML = `
                <div class="comment-user" id="comments-form">
                    <img class="comment-picture" src="media/user.png" alt="${comment.author}">
                    <div class="comment-username">${comment.author}</div>
                </div>
                <div class="comment-content">${comment.content}</div>
                <div class="delete-icon icon"></div>
            `;
            elmt
              .querySelector(".delete-icon")
              .addEventListener("click", function (e) {
                deleteComment(userId, currentImageId, comment._id, function(err) {
                  if (err) return onError(err);
                  if (currentCommentPage > 0 && (totalComments % commentsPerPage === 1)) {
                    currentCommentPage--;
                    return updateComments(userId, imageId, currentCommentPage)
                  } else {
                    return updateComments(userId, imageId, currentCommentPage)
                  }
                });
              });
            navigateComments(totalComments);
            // add this element to the document
            document.getElementById("comments").prepend(elmt);
          });
    });
}

document.getElementById("image-toggle-button").addEventListener("click", function (e) {
  const content = document.getElementById("create-image-form");
  // const content = document.element.classList.contains("image-toggle-button");
  if (content.style.display === "none") {
    content.style.display = "block";
    this.innerText = "Hide Image Form";
  } else {
    content.style.display = "none";
    this.innerText = "Add Image";
  }
});

leftArrow.addEventListener('click', function(e) {
  if (currentCommentPage > 0) {
      currentCommentPage--;
      updateComments(galleryUser, currentImageId, currentCommentPage);
  }
});

rightArrow.addEventListener('click', function(e) {
  if (totalComments > commentsPerPage && currentCommentPage < maxCommentsPageNum) {
    currentCommentPage++;
    updateComments(galleryUser, currentImageId, currentCommentPage);
  }
});

const username = getUsername();
document.querySelector("#signin-button").style.visibility = username
  ? "hidden"
  : "visible";
document.querySelector("#signout-button").style.visibility = username
  ? "visible"
  : "hidden";
document.querySelector("#image-toggle-button").style.visibility = username
  ? "visible"
  : "hidden";
document.querySelector("#users-display").style.visibility = username
  ? "visible"
  : "hidden";

if (username) {
  updateUsers(currentUserPage);
  document 
  .getElementById("comments-form")
  .addEventListener("submit", function (e) {
    // prevent from refreshing the page on submit
    e.preventDefault();
    // read form elements
    // const author = document.getElementById("comment-author").value;
    const content = document.getElementById("post-content").value;
    // clean form
    document.getElementById("comments-form").reset();
    addComment(currentUserId, currentImageId, content, function (err) {
        if (err) return onError(err);
        updateComments(currentUserId, currentImageId, currentCommentPage);
    });
  });
}

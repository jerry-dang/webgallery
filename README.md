[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-24ddc0f5d75046c5622901739e7c5dd533143b0c8e959d652212380cedb1ea36.svg)](https://classroom.github.com/a/jpQAo9uh)
# Web Gallery: Managing Users

The objective of these assignments is to build an application called _The Web Gallery_ where users can share
pictures and comments. This application is similar to existing web applications such as Facebook, Instagram
or Google Photos.

In this last assignment, you will concentrate on user authentication, authorization, and security.

## Instructions

For this assignment, you should use Node.js, the Express web framework and the embedded NoSQL database NeDB to build your back-end. You should not need more than the packages that were introduced in the labs. Make sure that all of these required packages are recorded in the `package.json` file.

### Code quality and organization

All of your work should be well organized. This directory should be organized as follows:

- `webgallery/app.mjs`: the main file
- `webgallery/package.json` and `package-lock.json`: the Node.js package file
- `webgallery/static/`: your frontend developed for assignment 1 (HTML, CSS, Javascript and UI media files)
- `webgallery/db/`: the NeDB database files
- `webgallery/uploads/`: the uploaded files
- `webgallery/test/`: the unit test files
- `.gitignore`: list of files that should not be committed to github

Your code must be of good quality and follow all guidelines given during lectures and labs. For more details, please
refer to the rubric. Remember, any code found online and improperly credited can constitute an academic violation.

### Submission

You should submit your work to your Github course repository and Gradescope.

Before submitting your final version. You are strongly recommended checking that your code is portable. To do so:

- push your work to Github
- clone it into a new directory
- install all packages with the single command `npm install` that will install all packages found in the `package.json` file
- run the unit tests with the command `npm run test`
- start the app with the command `npm run prod`

## Authenticated Users and Multiple Galleries

In this part, you are going to extend your API to support authenticated users and multiple galleries. Each user will
now have his/her own gallery. Users will be authenticated through the API (local authentication based on sessions).
In addition, access to the API is ruled by the following authorization policy:

- Unauthenticated users cannot read any picture nor comment
- Authenticated users can sign-out of the application
- Authenticated users can browse any gallery
- Gallery owners can upload and delete pictures to their own gallery only
- Authenticated users can post comments on any picture of any gallery
- Authenticated users can delete any one of their own comments but not others
- Gallery owners can delete any comment on any picture from their own gallery

While refactoring your application, you might want to redesign your REST API to reflect the fact that image galleries
are owned by users. Make sure that your unit tests are exhaustive. They should properly test your API.

## Integrating the frontend

This part of the assignment is worth 10% only and builds on top of what you have already built for assignment 2.
Update your current frontend to reflect all changes made above. The homepage should now a paginated list of all
galleries that can be browsed. Users should be able to sign-up, sign-in and sign-out into the application and do no
longer need to enter their username when adding images and comments.
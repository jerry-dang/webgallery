# Web Gallery: Managing Users

The objective of this project is to build an application called _The Web Gallery_ where users can share
pictures and comments. This application is similar to existing web applications such as Facebook, Instagram
or Google Photos.

In this project, I will concentrate on user authentication, authorization, and security.

## Instructions

 I am using Node.js, the Express web framework and the embedded NoSQL database NeDB to build your back-end.

### Code quality and organization

The directory is organized as follows:

- `webgallery/app.mjs`: the main file
- `webgallery/package.json` and `package-lock.json`: the Node.js package file
- `webgallery/static/`: your frontend developed for assignment 1 (HTML, CSS, Javascript and UI media files)
- `webgallery/db/`: the NeDB database files
- `webgallery/uploads/`: the uploaded files
- `webgallery/test/`: the unit test files
- `.gitignore`: list of files that should not be committed to github

## Authenticated Users and Multiple Galleries

Each user will now have his/her own gallery. Users will be authenticated through the API (local authentication based on sessions).
In addition, access to the API is ruled by the following authorization policy:

- Unauthenticated users cannot read any picture nor comment
- Authenticated users can sign-out of the application
- Authenticated users can browse any gallery
- Gallery owners can upload and delete pictures to their own gallery only
- Authenticated users can post comments on any picture of any gallery
- Authenticated users can delete any one of their own comments but not others
- Gallery owners can delete any comment on any picture from their own gallery

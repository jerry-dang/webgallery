import { readFileSync } from "fs";
import chai from "chai";
import chaiHttp from "chai-http";

import { server, createTestDb, deleteTestDb, getImages } from "../app.mjs";

const expect = chai.expect;
chai.use(chaiHttp);

describe("Testing Static Files", () => {
  after(function () {
    server.close();
  });

  it("it should get index.html", function (done) {
    chai
      .request(server)
      .get("/")
      .end(function (err, res) {
        expect(res).to.have.status(200);
        expect(res.text).to.be.equal(
          readFileSync("./static/index.html", "utf-8"),
        );
        done();
      });
  });
});

describe("Testing API", () => {

  const testData = {
    image: {
      title: "Test Image",
      author: "Test Author",
      file: "../static/media/user.png"
    },
    comment1: {
      imageId: "gNlEckXVSvq8n2Eb",
      author: "Test Author",
      content: "This is a test message."
    },
    comment2: {
      imageId: "gNlEckXVSvq8n2Eb",
      author: "Test Author",
      content: "This is a test message."
    }
  };

  before(function () {
    createTestDb();
  });

  it("should upload an image", function(done) {
    chai
      .request(server)
      .post("/api/images/")
      .set("content-type", "application/json")
      .send({ title: testData.image.title, author: testData.image.author, picture: testData.image.file })
      .end(function (err, res) {
        expect(res).to.have.status(200);
        done();
      });
  });

  it("should add a comment to the image", function(done) {
    chai
      .request(server)
      .post("/api/images/" + testData.comment1.imageId + "/comments/")
      .set("content-type", "application/json")
      .send({ imageId: testData.comment1.imageId, author: testData.comment1.author, content: testData.comment1.content })
      .end(function (err ,res) {
        expect(res).to.have.status(200);
        done();
      });
  });

  it("should add another comment to the image", function(done) {
    chai
      .request(server)
      .post("/api/images/" + testData.comment2.imageId + "/comments/")
      .set("content-type", "application/json")
      .send({ imageId: testData.comment2.imageId, author: testData.comment2.author, content: testData.comment2.content })
      .end(function (err ,res) {
        expect(res).to.have.status(200);
        done();
      });
  });

  it("should delete the first comment", function(done) {
    chai
      .request(server)
      .delete("/api/images/" + testData.comment1.imageId + "/comments/" + testData.comment1._id + "/")
      .end(function(err, res) {
        expect(res).to.have.status(404);
        done();
      });
  });

  it("should delete the image", function(done) {
    chai
      .request(server)
      .delete("/api/images/" + testData.image._id + "/")
      .end(function(err, res) {
        expect(res).to.have.status(404);
        done();
      });
  });
    
    after(function () {
      deleteTestDb();
      server.close();
    });
});

import * as api from "./api.mjs";

console.log(api);

function onError(err) {
    console.error("[error]", err);
    const error_box = document.querySelector("#error_box");
    error_box.innerHTML = err;
    error_box.style.visibility = "visible";
}

function submit() {
    if (document.querySelector("form").checkValidity()) {
      const username = document.querySelector("form [name=username]").value;
      const password = document.querySelector("form [name=password]").value;
      const action = document.querySelector("form [name=action]").value;
      api[action](username, password, function (err, username) {
        if (err) return onError(err);
        window.location.href = "/";
      });
    }
}
  
document.querySelector("#signin").addEventListener("click", function (e) {
    document.querySelector("form [name=action]").value = "signin";
    submit();
});
  
document.querySelector("#signup").addEventListener("click", function (e) {
    document.querySelector("form [name=action]").value = "signup";
    submit();
});
  
document.querySelector("form").addEventListener("submit", function (e) {
    e.preventDefault();
});
  
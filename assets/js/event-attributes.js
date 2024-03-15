/*** Using JavaScript and Bootstrap Input Validation States to modify input classes with errors: ***/

// Test for validity of username length:
function checkUsername() {
  // Declare/Initialize variables:
  var usernameId = document.getElementById("username-id");
  var username = document.getElementById("username");
  var unFeedbackSpan = document.getElementById("un-feedback");
  // var unGlyphiconSpan = document.getElementById("un-icon");

  if (username.value.length < 5) {
    usernameId.classList.add("was-validated");
    // usernameDiv.classList.add("has-feedback");
    // unGlyphiconSpan.classList.add("glyphicon-remove");
    // unFeedbackSpan.innerHTML =
    //   "Your username must be at least five characters long.";
  } else {
    usernameId.classList.add("was-validated");
    // unGlyphiconSpan.classList.add("glyphicon-ok");
    // unFeedbackSpan.innerHTML = "";

    // usernameDiv.classList.remove("has-error");
    // unGlyphiconSpan.classList.remove("glyphicon-remove");
  }
}

// Test for validity of password length:
function checkPassword() {
  // Declare/Initialize variables:
  var passwordDiv = document.getElementById("password-div");
  var password = document.getElementById("password");
  var pwGlyphiconSpan = document.getElementById("pw-icon");
  var pwFeedbackSpan = document.getElementById("pw-feedback");

  if (password.value.length < 5) {
    passwordDiv.classList.add("has-error");
    pwGlyphiconSpan.classList.add("glyphicon-remove");

    pwFeedbackSpan.innerHTML =
      "Your password must be at least five characters long.";
  } else {
    passwordDiv.classList.add("has-success");
    pwGlyphiconSpan.classList.add("glyphicon-ok");
    pwFeedbackSpan.innerHTML = "";

    passwordDiv.classList.remove("has-error");
    pwGlyphiconSpan.classList.remove("glyphicon-remove");
  }
}

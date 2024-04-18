/*** Using JavaScript and Bootstrap Input Validation States to modify input classes with errors: ***/

// Test for validity of username length:
// function checkUsername() {
//   // Declare/Initialize variables:
//   var usernameId = document.getElementById("username-id");
//   var username = document.getElementById("username");
//   var unFeedbackSpan = document.getElementById("un-feedback");
//   // var unGlyphiconSpan = document.getElementById("un-icon");

//   if (username.value.length < 5) {
//     usernameId.classList.add("was-validated");
//     // usernameDiv.classList.add("has-feedback");
//     // unGlyphiconSpan.classList.add("glyphicon-remove");
//     // unFeedbackSpan.innerHTML =
//     //   "Your username must be at least five characters long.";
//   } else {
//     usernameId.classList.add("was-validated");
//     // unGlyphiconSpan.classList.add("glyphicon-ok");
//     // unFeedbackSpan.innerHTML = "";

//     // usernameDiv.classList.remove("has-error");
//     // unGlyphiconSpan.classList.remove("glyphicon-remove");
//   }
// }

// // Test for validity of password length:
// function checkPassword() {
//   // Declare/Initialize variables:
//   var passwordDiv = document.getElementById("password-div");
//   var password = document.getElementById("password");
//   var pwGlyphiconSpan = document.getElementById("pw-icon");
//   var pwFeedbackSpan = document.getElementById("pw-feedback");

//   if (password.value.length < 5) {
//     passwordDiv.classList.add("has-error");
//     pwGlyphiconSpan.classList.add("glyphicon-remove");

//     pwFeedbackSpan.innerHTML =
//       "Your password must be at least five characters long.";
//   } else {
//     passwordDiv.classList.add("has-success");
//     pwGlyphiconSpan.classList.add("glyphicon-ok");
//     pwFeedbackSpan.innerHTML = "";

//     passwordDiv.classList.remove("has-error");
//     pwGlyphiconSpan.classList.remove("glyphicon-remove");
//   }
// }

// Disable form submissions if there are invalid fields:
(function () {
  "use strict";

  // Fetch all the forms we want to apply custom Bootstrap validation styles to
  var forms = document.querySelectorAll(".needs-validation");

  // Loop over them and prevent submission:
  Array.prototype.slice.call(forms).forEach(function (form) {
    form.addEventListener(
      "submit",
      function (event) {
        /***** CAN'T GET CHARACTER LIMIT FUNCTIONALITY TO WORK NO IDEA HOW *****/
        // Get the username and password fields from input:
        // var usernameInput = document.getElementById("username");
        // var passwordInput = document.getElementById("password");

        // If either username or password is less than or equal to 5 characters, prevent form submission:
        // if (
        //   usernameInput.value.length <= 5 ||
        //   passwordInput.value.length <= 5
        // ) {
        //   event.preventDefault();
        //   event.stopPropagation();
        // }
        /***** CAN'T GET CHARACTER LIMIT FUNCTIONALITY TO WORK NO IDEA HOW *****/

        // Prevent form submission if there are invalid fields:
        if (!form.checkValidity()) {
          event.preventDefault();
          event.stopPropagation();
        }

        form.classList.add("was-validated");
      },
      false
    );
  });
})();

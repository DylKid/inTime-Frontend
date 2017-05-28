$(document).ready(function(){

  //Swapping between login and registration-------------------------------------
  //Initially hide registration
  $("#loginFail").hide();
  loginFail = false;
  $("#register").hide();
  login = true;

  //Toggle whether the registration form or the login form is showing
  $(".logRegSwap").click(function(event){
    event.preventDefault();
    event.stopImmediatePropagation();
    login = !login;
    if(login){
      $("#login").show();
      $("#register").hide();
    }
    else{
      $("#login").hide();
      $("#register").show();
    }
  });

  //Make a <p> look like a hyperlink, but it's not actually loading a new page
  $(".logRegSwap").hover(function(){
    $(this).addClass("text_hover");
  }, function(){
    $(this).removeClass("text_hover");
  });
  //Swapping between login and registration-------------------------------------

  //Login form------------------------------------------------------------------
  $("#loginForm").submit(function(event){
    event.preventDefault();
    event.stopImmediatePropagation();
    submitLoginForm();
  });
  //Login form------------------------------------------------------------------

  //Registration form-----------------------------------------------------------
  $("#regForm").submit(function(event){
    event.preventDefault();
    event.stopImmediatePropagation();
    submitRegistrationForm();
  });
  //Registration form-----------------------------------------------------------

    $('#loginForm').bootstrapValidator({
      container: '#messages',
      feedbackIcons: {
          valid: 'glyphicon glyphicon-ok',
          invalid: 'glyphicon glyphicon-remove',
          validating: 'glyphicon glyphicon-refresh'
      },
      fields: {
          email: {
              validators: {
                  notEmpty: {
                      message: 'The email address is required and cannot be empty'
                  },
                  emailAddress: {
                      message: 'The email address is not valid'
                  }
              }
          },
          password: {
              validators: {
                  notEmpty: {
                      message: 'You must enter a password!'
                  },
                  stringLength: {
                      min: 6,
                      message: 'Password must be at least 6 characters'
                  }
              }
          }
      }
  });

  $('#regForm').bootstrapValidator({
    container: '#registrationMessages',
    feedbackIcons: {
        valid: 'glyphicon glyphicon-ok',
        invalid: 'glyphicon glyphicon-remove',
        validating: 'glyphicon glyphicon-refresh'
    },
    fields: {
        regEmail: {
            validators: {
                notEmpty: {
                    message: 'The email address is required and cannot be empty'
                },
                emailAddress: {
                    message: 'The email address is not valid'
                }
            }
        },
        regPassword: {
            validators: {
                notEmpty: {
                    message: 'You must enter a password!'
                },
                stringLength: {
                    min: 6,
                    message: 'Password must be at least 6 characters'
                }
            }
        },
        repeatRegPassword: {
            validators: {
                notEmpty: {
                    message: 'You must enter a password!'
                },
                stringLength: {
                    min: 6,
                    message: 'Password must be at least 6 characters'
                },
                identical: {
                  field: 'regPassword',
                  message: 'Both passwords must be equal'
                }
            }
        }
    }
});


});



//Submits the login form and logs the user in if successful moving to the
//Initial page of the app
function submitLoginForm(){
  var loginInfo = $("#loginForm").serialize();
  $.ajax({
    type: 'POST',
    url : 'https://infs3202-w1oxm.uqcloud.net/intime/backend/login.php',
    data : loginInfo,
    beforeSend : function(){
      console.log("before sending");
      console.log("loginInfo:");
      console.log(loginInfo);
    },
    success : function(response){
      console.log("Recieved response from login.php:" + response);
      //Correct response recieved, load the calendar page
      if(response == "ok"){
        console.log("Accepted Login");
        console.log($("#emailInput"));
        var user_email = $("#emailInput").val().trim();
        console.log(user_email);
      //  jQuery('#div_session_write').load('sessionStart.php?user_session='+user_email);
      $.ajax({
        type: 'POST',
        url: 'backend/sessionStart.php',
        data: {"userEmail": user_email},
        success: function(response){
          console.log("got response from sessionStart.php " + response);
        },
        async: false,
      });
      sessionStorage.setItem('user_email', user_email);
      window.location="schedule.php";
      } else {
        console.log("Login failed");
        loginFail = true;
        $("#loginFail").show();
      }
    },
  });
}

function submitRegistrationForm(){
  var regInfo = $("#regForm").serialize();
  console.log("regInfo:" + regInfo);
  $.ajax({
    type : 'POST',
    url : 'https://infs3202-w1oxm.uqcloud.net/intime/backend/registration.php',
    data: regInfo,
    beforeSend : function(){
      console.log("before sending");
    },
    success : function(response){
      console.log("Recieved response:" + response);
      if(response=="registered"){
        window.alert("Your account has been successfully registered, returning you to the login page");
        login = !login;
        if(login){
          $("#login").show();
          $("#register").hide();
        }
        else{
          $("#login").hide();
          $("#register").show();
        }
        if(loginFail){
          $("#loginFail").hide();
          loginFail = false;
        }
      }
    },
    error: function(xhr, ajaxOptions, thrownError) {
      console.log("AJAX ERROR:");
      console.log(xhr.status);
      console.log(xhr.responseText);
      console.log(thrownError);
    },
  });
}

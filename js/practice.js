$(document).ready(function(){
  getDateTimeForMySQL();

  var user_email = sessionStorage.getItem("user_email");
  if(user_email == "" || user_email == null){
    window.open("index.html","_self",false);
  }
  $("#user_email").append(user_email);
  /*$.ajax({
    method: "POST",
    url: "backend/getEmail.php",
    success: function(response){
      console.log("got response from check login:" + response);
      if(response=="NOPE"){
        console.log("got nope");
        window.open("index.php", "_self",false);
      } else {
        user_email = response.trim();
      }
    },
    async: false,
  });*/

  var currentDay = sessionStorage.getItem('day');
  $("#day").append(currentDay);

  $("#metronomeOverlay").hide();
  $("tunerOverlay").hide();

  if(isMobile()){
    $("#metronome").css('width', '100%');
    $("#metronome").css('margin-left', '0');
    $("#tuner").css('width', '100%');
    $("#tuner").css('margin-left', '0');
  }

  var notes = {
    "A" : new Audio('resources/notes/A.mp3'),
    "Bb" : new Audio('resources/notes/Bb.mp3'),
    "B" : new Audio('resources/notes/B.mp3'),
    "C" : new Audio('resources/notes/C.mp3'),
    "Db" : new Audio('resources/notes/Db.mp3'),
    "D" : new Audio('resources/notes/D.mp3'),
    "Eb" : new Audio('resources/notes/Eb.mp3'),
    "E" : new Audio('resources/notes/E.mp3'),
    "F" : new Audio('resources/notes/F.mp3'),
    "Gb" : new Audio('resources/notes/Gb.mp3'),
    "G" : new Audio('resources/notes/G.mp3'),
    "Ab" : new Audio('resources/notes/Ab.mp3')
  };

  $.each(notes, function(index, note){
    note.preload = "auto";
    note.load();
  });


  var currentNote;

  $("#tunerPlay").click(function(){
    $("#tunerPlay").prop("disabled",true);
    var selectedNote = $("#noteSelect").val().trim();
    console.log("selectedNote: ", selectedNote);
    currentNote = notes[selectedNote];
    currentNote.play();
    currentNote.addEventListener("ended", function(){
      currentNote.play();
    });
  });

  $("#tunerStop").click(function(){
    $("#tunerPlay").prop("disabled",false);
    currentNote.pause();
  });

  /*get all the rows on the day for the user_email, if there are no previous
  rows OR if the latest row is 6 days ago, if it's LESS than 6 days ago simply return
  that latest row and load it up*/


  /*$("#metronomeClick").click(function(){

  });*/
  var interval;
  var metTime = 1000;
  var playing = false;
  var click = new Audio('resources/woodblock.mp3');
  var bpm;
  click.preload = 'auto';
  click.load();
  $("#metronomePlay").click(function(){
    //this.disable();
    console.log("clicked");
    playing = true;
    bpm = $("#metronomeRange").val();
    metTime = (1000*60)/bpm;

    interval = setInterval(
          function(){
            console.log(metTime);
            click.currentTime = 0;
            click.play();
          },
          metTime
     );
      $(this).prop('disabled',true).addClass('disabled');
  });

  $("#metronomeStop").click(function(){
    click.pause();
    clearInterval(interval);
    $("#metronomePlay").prop('disabled',false).removeClass('disabled');
  })


  function playSound(volume, sound) {
    var click=sound.cloneNode();
    click.volume=volume;
    click.play();
  }

  $("#showMetronome").click(function(){
    $("#metronomeOverlay").slideDown();
  });

  $("#metronomeBack").click(function(){
    $("#metronomeOverlay").slideUp();
  });

  $("#tunerButton").click(function(){
    $("#tunerOverlay").slideDown();
  });

  $("#tunerBack").click(function(){
    $("#tunerOverlay").slideUp();
  });

  //GET THE PRACTICE OBJECT
  var currentPracticeObject = {};
  $.ajax({
    method: "POST",
    url: "https://infs3202-w1oxm.uqcloud.net/intime/backend/getPractice.php",
    data: {"user_email": user_email,
          "current_day": currentDay},
    success: function(response){
      console.log("got response from getPractice.php:");
      //console.log(response);
      //console.log("got response" + response);
      if(response!="nope"){
        console.log(JSON.parse(response));
        currentPracticeObject = JSON.parse(response);
        //console.log(response);
      }
    },
    async: false,
  });

  //GET SUBTASKS ARRAY
  var currentSubtasks = new Array();
  $.ajax({
    method: "POST",
    url: "https://infs3202-w1oxm.uqcloud.net/intime/backend/getSubtasks.php",
    data: {"practice_info": JSON.stringify(currentPracticeObject)},
    success: function(response){
      console.log("got response getSubtasks.php:");
      //console.log(response);
      currentSubtasks = JSON.parse(response);
      //console.log(response);
      //console.log(currentSubtasks);
    },
    async: false,
  });

  //Get equivalent task information array
  var currentTasks = new Array();
  $.each(currentSubtasks,function(index,subTaskObject){
    $.ajax({
      method: "POST",
      url: "https://infs3202-w1oxm.uqcloud.net/intime/backend/getTask.php",
      data: {"task_id" : subTaskObject["task_id"]},
      success: function(response){
        //console.log("got response getTask.php:");
        var newTask = JSON.parse(response);
        var duplicate = false;
        $.each(currentTasks, function(index, taskObject){
          if(newTask["task_id"] === taskObject["task_id"]){
            //console.log(newTask["task_name"] + " is a duplicate");
            duplicate = true;
          }
        });
        if(!duplicate){
          //console.log("adding " + newTask["task_name"]);
          currentTasks.push(newTask);
        }
        //currentTasks.push(JSON.parse(response));
        //console.log(response);
      },
      async: false,
    });
  });

  var uniqueTasks = [];

  $.each(currentTasks, function(i, el){
    if($.inArray(el, uniqueTasks) === -1) uniqueTasks.push(el);
  });

  console.log(uniqueTasks);

  var loadNew;

  //If the currentPracticeObject is empty, i.e. there have been no previous
  //practices for this day, then load a new practice routine
  if(jQuery.isEmptyObject(currentPracticeObject)){
    console.log("object is empty");
    loadNew = true;
  } else {
    //If there /has/ been a previous practice object

    //Split timestamp into [Y,M,D,h,m,s]
    var dt = currentPracticeObject["time_started"].split(/[- :]/);
    //Apply each element to the date function
    var dateTime = new Date(Date.UTC(dt[0],dt[1]-1,dt[2],dt[3],dt[4],dt[5]));
    //Get current time (auto in ms)
    var dateNow = Date.now();
    //Find the difference in ms
    var timeDiff = Math.abs(dateNow - dateTime.getTime());
    //Find the ceiling of that difference divided by a "day" in ms
    //To get the number of days difference between the two
    var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));

    //and that practice object was created over 6 days ago? - load a new one
    if(diffDays > 6){
      console.log("day was more than 6 days ago");
      loadNew = true;
    //If it's been less than or equal to 6 days (i.e. under a week ago)
    //load the same one
    } else {
      console.log("day was less than a week ago");
      loadNew = false;
    }
  }


  //Load previous practice routine
  if(!loadNew){
    console.log("loading a previous practice routine!");

    console.log("practice obj");
    console.log(currentPracticeObject);
    console.log("tasks");
    console.log(currentTasks);
    console.log("subTasks");
    console.log(currentSubtasks);

    var subTasks = new Array();
    $.each(currentTasks, function(index, taskObject){
      var taskHTML = "<div id=" + taskObject["task_id"] + "> <strong>" + taskObject["task_name"] + " - " + taskObject["time_required"] + " Minutes </strong> <ul class='subtaskList'>";
      var subtaskHTML = "";
      $.each(currentSubtasks,function(index, subtaskObject){
        if(subtaskObject["task_id"] === taskObject["task_id"]){
          if(subtaskObject["time_completed"] === null){
            subtaskHTML += "<li> <input class ='subTaskCheck' type='checkbox'> </input>" + subtaskObject["subtask_name"] + "</li>";
          } else {
            subtaskHTML += "<li> <input class ='subTaskCheck' type='checkbox' disabled=true checked> </input>" + subtaskObject["subtask_name"] + "</li>";
          }
        }
      });
      var finalHTML = taskHTML + subtaskHTML + "</ul> </div>";
      //console.log(finalHTML);
      $("#tasksContainer").append(finalHTML);
    });
  }



  //-----------------------CREATE A NEW RANDOM PRACTICE LIST-------------------//
  else{
    console.log("creating a new practice routine!")

    var selectedTasks = JSON.parse(sessionStorage.getItem('selectedTasks'));
    var selectedTasksWithChoices = JSON.parse(sessionStorage.getItem('selectedTasksWithChoices'));

    //Create new practice object
    currentPracticeObject = {};
    currentPracticeObject["day"] = currentDay;
    currentPracticeObject["user_email"] = user_email;
    currentPracticeObject["time_started"] = getDateTimeForMySQL();

    console.log("TIME STARTED IS:");
    console.log(currentPracticeObject["time_started"])

    $.ajax({
      method: "POST",
      url: "https://infs3202-w1oxm.uqcloud.net/intime/backend/newPractice.php",
      data: {"practiceInfo": JSON.stringify(currentPracticeObject)},
      success: function(response){
        console.log("got response from newpractice.php" + response);
        currentPracticeObject["practice_id"] = response;
      },
      async: false,
    });

    for(var i = 0; i< selectedTasks.length; i++){
      //Get the first element from the list of tasks
      var task = selectedTasks[i];

      //Put it into the current tasks array
      currentTasks.push(task);

      //Gets the associated choices with that task
      var taskChoices = selectedTasksWithChoices[i][task["task_name"]];

      /*Choices array is an array of all the choices associated with a task indexed.
      * Like choicesArray[0] = [A,Ab,E,Eb], choicesArray[1] = [Ionian, Dorian] etc*/
      var choicesArray = new Array();

      //Fill up choicesArray
      $.each(taskChoices, function(choiceName, choices){
        //Convert choices to an array
        choices = String(choices);
        choicesArray.push(choices.split(","));
      });

      //Subtask array is the list of random choice combinations
      var randomSubTaskArray = new Array();
      //only exit once you have enough
      while(randomSubTaskArray.length<task["gen_no"]){
        var randomSubTask = "";
        $.each(choicesArray, function(index,choiceArray){
          var randomIndex = Math.floor(Math.random()*choiceArray.length);
          var randomChoice = String(choiceArray[Math.floor(Math.random()*choiceArray.length)]);
          randomSubTask += randomChoice.trim();
          randomSubTask += " "
        });
        //Ensure there are no duplicates
        if(randomSubTaskArray.indexOf(randomSubTask)>-1){
          console.log(randomSubTask + " is already inside of");
          console.log(randomSubTaskArray);
          continue;
        }
        randomSubTaskArray.push(randomSubTask);
        //console.log(randomSubTask);
      }

      var taskHTML = "<div id=" + task["task_id"] + "> <strong>" + task["task_name"] + " - " + task["time_required"] + " Minutes </strong> <ul class='subtaskList'>";
      var subTaskHTML = "";
      $.each(randomSubTaskArray, function(index,subTask){
        //console.log(subTask);
        //Update subtask information in datbase

        var subtaskObj = {};
        subtaskObj["subtask_name"] = subTask.trim();
        subtaskObj["task_id"] = task["task_id"];
        subtaskObj["practice_id"] = currentPracticeObject["practice_id"];
        subtaskObj["time_completed"] = null;

        currentSubtasks.push(subtaskObj);
        $.ajax({
          method: "POST",
          url: "https://infs3202-w1oxm.uqcloud.net/intime/backend/saveSubtask.php",
          data: {"subtask": JSON.stringify(subtaskObj)},
          success: function(response){
            console.log("got response from saveSubtask.php" + response);
          },
          async: false,
        });
        subTaskHTML += "<li> <input class ='subTaskCheck' type='checkbox'> </input>" + subTask + "</li>";
      });
      var finalHTML = taskHTML + subTaskHTML + "</ul> </div>";
      //console.log(finalHTML);
      $("#tasksContainer").append(finalHTML);
    }
  }
  //----------------------CREATE A NEW RANDOM PRACTICE LIST-------------------//

  //UPDATE THE SUBTASK["time_completed"] task for the right subtask upon completion.
  //Find the right subtask because the combination of practice_id, task_id and subtask_name is unique.
  //This is not saved into the database yet though, this should be done on the "back button" click.

  $(".subTaskCheck").change(function(){
    var boxChecked = $(this).is(":checked");
    var subTaskName = $(this).parent()[0].innerText.trim();
    //console.log("subTaskName:");
    //console.log(subTaskName.innerText);
    //if(boxChecked){
      //console.log(currentSubtasks);
      $.each(currentSubtasks,function(index,subTaskObject){
        //console.log(subTaskObject);
        if(subTaskObject["subtask_name"].trim() == subTaskName){
          //console.log("here's a match!!!");

          if(boxChecked){
            console.log("Changing time completed of " + subTaskName);
            //var nowDate = new Date(Date.now());


            nowDateInFormat = getDateTimeForMySQL();
            console.log("Updating");
            console.log(currentSubtasks[index]);
            currentSubtasks[index]["time_completed"] = nowDateInFormat;
            //console.log(Date.getFullYear());
            //subTaskObject["time_completed"] = Date.
          } else {
            currentSubtasks[index]["time_completed"] = null;
          }
        } else {
          console.log(":"+subTaskObject["subtask_name"] + ": != :" + subTaskName + ":");
        }
      });
  });

  //Save the changes to the task list and leave
  $("#practiceBack").click(function(){
    console.log("children:");
    console.log($("#tasksContainer").children());

    //Update any changes to subtasks
    //TODO update any changes to practice (i.e. has the whole thing been completed?)
    $.each(currentSubtasks, function(index, object){
      $.ajax({
        method: "POST",
        url: "https://infs3202-w1oxm.uqcloud.net/intime/backend/saveSubtask.php",
        data: {"subtask": JSON.stringify(object)},
        success: function(response){
          console.log("response from saveSubtask.php:");
          console.log(response);
        },
        async: false,
      })
    });

    completed = true;
    practiceTasks = $("#tasksContainer").children();
    console.log("practiceTasks:");
    console.log(practiceTasks);


    //If the practice task hasn't already been entered
    if(currentPracticeObject["time_completed"]==null){
      //Iterate through all the subtasks and check if they're all completed
      $.each(practiceTasks,function(index, task){
        subtaskList = $(task).find(".subtaskList").children();
        $.each(subtaskList, function(index, subtask){
          if($(subtask).find(".subTaskCheck").prop("checked")){
            console.log("true");
          } else {
            console.log("false");
            completed=false;
          }
        });
      });
      //
      if(completed){
        console.log("This practice day is completed!");
        currentPracticeObject["time_completed"] = getDateTimeForMySQL();
        console.log(currentPracticeObject);

        $.ajax({
          method: "POST",
          url: "https://infs3202-w1oxm.uqcloud.net/intime/backend/savePractice.php",
          data: {"practiceObject": JSON.stringify(currentPracticeObject)},
          success: function(response){
            console.log("got response from savePractice.php:");
            console.log(response);
          },
          async: false,
        });
      } else {
        console.log("This practice day is not finished!")
      }
    }
    window.open("schedule.php","_self",false);
  });



  function getDateTimeForMySQL(){

    //Get datetime the same as the offset on the client's machine
    var nowDate = new Date();
    nowDate = nowDate - (nowDate.getTimezoneOffset() * 60000);
    nowDate = new Date(nowDate);

    console.log("nowDate");
    console.log(nowDate);

    function twoDigits(d){
      if(0 <= d && d < 10) return "0" + d.toString();
      if(-10 <= d && d < 0) return "-0" + (-1*d).toString();
      return d.toString();
    }

    var nowDateInFormat = nowDate.getUTCFullYear() + "-" + twoDigits(1+ nowDate.getUTCMonth()) + "-" + twoDigits(nowDate.getUTCDate()) + " " + twoDigits(nowDate.getUTCHours()) + ":" + twoDigits(nowDate.getUTCMinutes()) + ":" + twoDigits(nowDate.getUTCSeconds());

    console.log("returning datetime" + nowDateInFormat);
    return nowDateInFormat;
  }
});

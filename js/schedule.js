$(document).ready(function(){

  //Determines whether practice days are disabled
  var onlyPracticeOnDay = false;

  var daysMap = {0: "Sunday",
                1: "Monday",
                2: "Tuesday",
                3: "Wednesday",
                4: "Thursday",
                5: "Friday",
                6: "Saturday"};

  var dayOfTheWeek = daysMap[getDayOfTheWeek()];

  console.log("Day is " +dayOfTheWeek);

  var user_email = sessionStorage.getItem("user_email");
  if(user_email == "" || user_email == null){
    window.open("index.html","_self",false);
  }
  $("#user_email").append(user_email);

  $("#logout").click(function(){
    sessionStorage.removeItem("user_email");
    window.open("index.html","_self",false);
  });

  var scheduleInfo;

  updateScheduleView();

  $.fn.editable.defaults.mode = 'inline';
  $(".edit").editable();

  $("#taskTemplate").hide();
  $("#subTaskTemplate").hide();
  $("#editAddTask").hide();

  $("#listViewBack").click(function(){
    //Update database, then reload the schedule

    //For each select box, get the current value and put it into the array
    var selectedTasks = new Array();
    $("#taskBox .task").each(function(){
      var sel = $(this).children().first()[0];
      console.log("-----sel-----");
      console.log(sel.options);
      if(sel.options.length >= 1){
        var value = sel.options[sel.selectedIndex].innerText;
      }
      if(selectedTasks.indexOf(value)>=0){

      }
      console.log(value);
      $.each(selectedTasks, function(index, task){
        if(task == value){
          console.log(task + " == " + value);
          alert("Duplicate tasks will not be saved, returning you to schedule view");
        }
      });
      selectedTasks.push(value);
    });

    $.ajax({
      method: "POST",
      url: "https://infs3202-w1oxm.uqcloud.net/intime/backend/saveTaskList.php",
      data: {"selectedTasks" : selectedTasks,
            "day" : currentDay,
            "userEmail" : user_email},
      success: function(response){
        console.log("got response from saveTaskList.php" + response);
      },
      async: false,
    });

    updateScheduleView();

    $("#overlay").slideUp();
    $("body").removeClass("noscroll");
  });

  $(".practice").click(function(){
    var day = $(this).parent().parent().parent().attr('id');
    console.log("seting day " + day);
    console.log($(this));
    console.log($(this).parent());
    sessionStorage.setItem('day', day);
    //Pass object that is all selected tasks plus choices
    var selectedScheduleTasks;

    //The list
    console.log("Schedule List:");
    var scheduleList = $(this).parent().parent().find(".scheduleList").children();
    console.log(scheduleList);
    if(scheduleList.length == 0){
      alert("No tasks in the schedule to practice! Put some tasks in first!");
      return;
    }

    //Get user tasks
    var userTasks = new Array();
    $.ajax({
      method: "POST",
      url: "https://infs3202-w1oxm.uqcloud.net/intime/backend/getTasks.php",
      success: function(response){
        console.log("got response from getTasks" + response);
        console.log(JSON.parse(response));
        userTasks = JSON.parse(response);
      },
      data : {"userEmail": user_email},
      async: false,
    });



    //Get the tasks that are selected in a weekday
    var selectedTaskNames = new Array();
    $.each(scheduleList,function(index,selectItem){
      selectedTaskNames.push(selectItem.innerText);
    });

    //Get the actual task objects associated with those names
    var selectedUserTasks = new Array();
    var selectedUserTasksWithChoices = new Array();
    $.each(userTasks,function(index, object){
      if(selectedTaskNames.indexOf(object["task_name"])>-1){
        console.log("adding object:");
        console.log(object);

        $.ajax({
          method: "POST",
          url: "https://infs3202-w1oxm.uqcloud.net/intime/backend/getChoices.php",
          success: function(response){
            selectedUserTasksWithChoices.push(JSON.parse(response));
          },
          data : {"taskName": object["task_name"],
                  "taskID": object["task_id"]},
          async: false,
        });

        selectedUserTasks.push(object);
      }
    });
    sessionStorage.setItem("selectedTasks", JSON.stringify(selectedUserTasks));
    sessionStorage.setItem("selectedTasksWithChoices", JSON.stringify(selectedUserTasksWithChoices));

    console.log("SENDING OVER");
    console.log(selectedUserTasks);
    console.log(selectedUserTasksWithChoices);

    window.open("practice.php","_self",false);
  });
  //--------------------Schedule view----------------------------------------//


  //---------------------------Edit Task List---------------------------------//
  //All user tasks as an object, where it's taskName: {properties} taskName{properties} etc.
  var allUserTasks = {};
  //All the user tasks, but they have the choices also
  var tasksWithChoices = {};
  //An *array* of the tasks, storing ID as well.
  var fullUserTasks = new Array();
  var selectedTasks;

  //The indexes of tasks selected from the editTaskList view
  var selectedIndex;

  $("#addTask").click(function(){
    console.log("---TASK BOX---")
    console.log($("#taskBox").children());
    var size = 0;
    $.each($("#taskBox").children(), function(val,text){
      size++;
    });
    console.log(size);

    if(size>=10){
      alert("A practice list is made up of a maximum of 10 tasks");
    } else {
      $("#taskTemplate").children().clone(true).appendTo("#taskBox");
      updateViewTaskList();
    }
  });

  $(".mySelect").change(function(){
    console.log("changed");
    updateViewTaskList();
  })

  var currentDay;
  var taskListElements;
  $(".scheduleInfo .editList").click(function(){

    //GET ALL OF THE TASK IDS ASSOCIATED WITH THE CURRENT LOGGED IN USER
    currentDay = $(this).parent().parent().parent().attr('id');

    //GET THE TASKS IN THE SCHEDULE VIEW
   taskListElements = $(this).parent().parent().find(".scheduleList").children();

    function updateEditTaskList(){
      var dayTaskList = new Array();
      $("#taskBox").empty();

      updateUserTaskandChoices();

      //Updates the select boxes with all the right values
      $(".mySelect").empty();
      $.each(tasksWithChoices, function(val,text){
        $(".mySelect").append(new Option(val,val));
      });

      $.each(taskListElements,function(index,htmlElement){
        var value = htmlElement.innerText;
        console.log("value:" + htmlElement.innerText + ":");
        var newTask = $("#taskTemplate").children().clone(true);
        var newSelectBox = $(newTask).children(".mySelect");
        newTask.appendTo("#taskBox");
        newSelectBox.val(value);
      });
    }

    updateEditTaskList();

    $("#overlay").slideDown();
    $("body").addClass("noscroll");

    updateViewTaskList();
  });

  $(".removeTask").click(function(){
    //Remove from database
    var sel = $(this).prev().prev()[0];
    var selOptions = sel.options
    var value = null

    if(sel.options != null && sel.options.length > 0){
      var value = sel.options[sel.selectedIndex].innerText;
    }

    $.ajax({
        method: "POST",
        url: "https://infs3202-w1oxm.uqcloud.net/intime/backend/removeTask.php",
        data: {"userEmail":user_email,
              "taskName":value,
              "day": currentDay},
        success:function(response){
          console.log("Recieved response from removeTask.php:" + response);
        },
        async:false,
    });

    $(this).parent().remove();
    updateViewTaskList();
  });
  //Edit Task List ------------------------------------------------------------//

  //-------------------EDIT ADD TASK -----------------------------------------//
  var currentTask;

  $("#newTask").click(function(){
    //TODO add the ability to delete tasks

    //Initialize the form with dummy values
    $("#subTaskInputs").empty();
    $("#taskNameInput").val("Give Task Name");
    $("#timeRequiredInput").val("10");
    $("#noTasksInput").val("1");
    var taskInfo = {};
    taskInfo["task_name"] = "Give Task Name";
    taskInfo["time_required"] = "10";
    taskInfo["gen_no"] = 1;
    taskInfo["random_gen"] = 1;
    taskInfo["isNewTask"] = true;
    var taskID;
    //Create task with new ID and dummy information
    console.log("--------THIS IS THE USER EMAIL:" + user_email);
    $.ajax({
      method: "post",
      url: "https://infs3202-w1oxm.uqcloud.net/intime/backend/newTask.php",
      data: {"taskInfo" : taskInfo,
            "userEmail" : user_email},
      success: function(response){
        console.log("Recieved response:" + response);
        taskInfo["task_id"] = response;
      },
      async: false
    });
    $("#editTaskList").slideUp();
    $('#viewTaskList').slideUp('fast', function() {

      $("#editAddTask").slideDown();
      $("#randomForm").slideDown();
      $("#overlay").addClass("scrollY");
    });

    updateUserTaskandChoices();
    updateSelectedIndexes();
    console.log("All user tasks:");
    console.log(allUserTasks);
    currentTask = taskInfo;
  });


  var currentTaskChoices;
  var selTaskName;

  var selectedIndexes;

  $(".editTask").click(function(){
    updateUserTaskandChoices();

    updateSelectedIndexes();

    console.log(selectedIndexes);


    //Setup the form with the existing values
    var sel = $(this).prev()[0];
    selTask = sel.options[sel.selectedIndex];
    var selTaskName;
    console.log("selTask:")
    console.log(selTask)
    if(selTask!=null){
      selTaskName = selTask.innerText;
      //selTaskName
    }
    $("#taskNameInput").val(selTaskName);
    console.log("all user tasks:")
    console.log(allUserTasks)
    currentTask = allUserTasks[selTaskName];
    console.log("selTaskName")
    console.log(selTaskName)
    console.log("Current Task Being editted:");
    console.log(currentTask);
    $("#timeRequiredInput").val(currentTask["time_required"]);


    //Load task values into the form
    $("#noTasksInput").val(currentTask["gen_no"]);
    $("#noTasksNumber").empty();
    $("#noTasksNumber").append(currentTask["gen_no"])
    //Get all the choice information associated with the current task

    $("#noTasksInput").change(function(){
      currentTask["gen_no"] = $("#noTasksInput").val();
      $("#noTasksNumber").empty();
      $("#noTasksNumber").append(currentTask["gen_no"])
    });

    $.ajax({
      type: "POST",
      url: "https://infs3202-w1oxm.uqcloud.net/intime/backend/getChoicesForSingleTask.php",
      data: {taskID : currentTask["task_id"], taskName : currentTask["task_name"]},
      success: function(response){
        //console.log("Got response from getChoicesForSingleTask.php" + response);
        currentTaskChoices = JSON.parse(response);
      },
      async:false
    });

    //var currentTaskChoices = tasksWithChoices[selTaskName];
    console.log("Current task choices:");
    console.log(currentTaskChoices);
    $("#subTaskInputs").empty();
    $.each(currentTaskChoices,function(index, choiceObject){
      console.log("index:" + index);
      console.log("choiceObject:");
      console.log(choiceObject);

      //$("#randomStart").children(":first").siblings().empty();
      //Create new input
      var newInput = $("#subTaskTemplate").children().clone(true);
      //Give it the right name
      $(newInput).find(".subTaskName").text(choiceObject["choice_name"]);
      $(newInput).find(".subTaskInput").prop("name",choiceObject["choice_name"]);
      //Give it the right value
      $(newInput).find(".choicesInput").val(choiceObject["choices"]);
      $(newInput).append("<div class='choice_id' style='display:none'>"+choiceObject["choice_id"]+"</div>");
      $("#subTaskInputs").append(newInput);
    });
    $("#editTaskList").slideUp();
    $('#viewTaskList').slideUp('fast', function() {
      $("#editAddTask").slideDown();
    });
  });

  $(".removeSubTask").click(function(event){
    event.preventDefault();
    event.stopImmediatePropagation();
    var parent = $(this).parent();
    parent.empty();
    parent.remove();
  });

  $("#newSubTaskButton").click(function(event){
    event.preventDefault();
    event.stopImmediatePropagation();
    console.log("currentSubTask:");
    console.log(currentTask);

    $(".edit").editable();
    $("newNameOverlay").slideDown();
    var newSubTask = $("#subTaskTemplate").children().clone(true);

    //Send a new choice to the database with the name "Give Name"
    //Get back the new choice_id and append it to the newTask
    var newChoice = {};
    newChoice["choice_name"] = "Give Name";
    newChoice["choices"] = "";

    var newChoiceID;
    $.ajax({
      method: "POST",
      url: "https://infs3202-w1oxm.uqcloud.net/intime/backend/newChoice.php",
      data: {"choiceInfo": newChoice,
            "taskID" : currentTask["task_id"]},
      success: function(response){
        console.log("recieved response from newChoice.php:" + response);
        newChoiceID = response;
      },
      async: false
    });

    $(newSubTask).append("<div class='choice_id' style='display:none'>"+newChoiceID+"</div>");

    $("#subTaskInputs").append(newSubTask);
  });


  //--------------CUSTOM EDITABLE-----------------------------------------------
  function divClicked(event, isNew) {
    var divHtml = $(this).html();
    var editableText = $("<textarea class='editArea' style='color:black'/>");
    editableText.val(divHtml);
    $(this).replaceWith(editableText);
    editableText.focus();
    $(editableText).keypress(function(){
      console.log("pressed");
      var tval = $(this).val();
      console.log("value: " + tval + " with length: " + tval.length);
      if(tval.length >= 15){
        var leave = tval.length - 15;
        console.log("tval: " + tval);
        $(this).val(tval.substring(0, tval.length-1));
      }
    });
    if(isNew){
      //console.log(isNew);
    } else {
      isNew = false;
    }
    // setup the blur event for this new textarea
    editableText.blur({newOption : isNew, oldText: divHtml}, editableTextBlurred);
  }

  function editableTextBlurred(event) {
      console.log("The folling class was triggered");
      console.log($(this));
      var html = $(this).val();
      var viewableText = $("<div class = 'editable subTaskName'>");
      viewableText.html(html);
      //Change name value of input field
      $(this).parent().next().find("input").attr("name",html);
      $(this).replaceWith(viewableText);
      //Update database
      if(event.data.newOption==true){
        console.log("Create NEW option with name:" + html);
        console.log($(this));
      } else if(html != event.data.oldText) {
        console.log("Update option with new name:" + html);
      }

      // setup the click event for this new div
      viewableText.click(divClicked);
  }

  $(".editable").click({isNew:false},divClicked);

  $("#editAddTaskBack").click(function(){
    //VALIDATION ON TASK-------------------------------------------------------
    var error = false;
    if($("#taskNameInput").val()==""){
      alert("Task Name Cannot be Empty");
      return;
    }
    if($("#taskNameInput").val()=="Give Task Name"){
      alert("Please give a task name");
      return;
    }
    if($("#timeRequiredInput").val()==""){
      alert("Time required cannot be empty");
      return;
    }

    console.log("subtasks------------------------------------");
    var noOfChoices = 0;
    var numCombs = 1;
    $.each($(".subTask"),function(index,task){
      if($(task).parent().attr("id")=="subTaskTemplate"){
        console.log("GOT DA TEMPLATE");
        return;
      //It's a non-template subtask
      } else {
          var subtaskChoices = $(task).find(".choicesInput").val();
          var commaDelPattern = new RegExp('^[\\w\\s]+(,[\\w\\s]+)*$');
          console.log("does " + subtaskChoices + " match " + (commaDelPattern) +
            " "+ commaDelPattern.test(subtaskChoices));
          if(!commaDelPattern.test(subtaskChoices)){
            alert("Choices must be a comma delimited list of choices.\n"
                  + "Your subtask " + $(task).find(".subTaskName").text()
                  + " has choices " + subtaskChoices + "\n"
                  + "For example: Major, Minor, Dorian, Ionian");
            error = true;
          }

          //the new number of choices
          var subTasksArr = subtaskChoices.split(",");
          var newNo = subTasksArr.length;
          noOfChoices = noOfChoices + newNo;
          numCombs = numCombs * newNo;

          console.log("numCombs so far: " + numCombs)
          noOfChoices = subTasksArr.length + noOfChoices;

          if(newNo > 12){
            alert("Keep number of choices under 12");
            error = true;
          }

          if((new Set(subTasksArr)).size !== subTasksArr.length){
            alert("Can't have duplicate choices. Currently there are duplicates"
           +" in " + subTasksArr);
           error = true;
          }
      }
    });


    var genNo = $("#noTasksInput").val();
    console.log("noOfChoices: " + noOfChoices + " noOfChoices-genNo: " + (noOfChoices-genNo) + " genNo: " + genNo);

    if(noOfChoices < genNo){
      alert("The number of choices cannot be less than the number of generated tasks.\n");
      return;
    }

    if(numCombs < genNo){
      alert("The number of choice permutations cannot be less than the number of generated tasks.\n");
      return;
    }

    //If no error in the form, load it up
    if(!error){
      if($("#taskNameInput").val()=="Give Task Name"){
        console.log("Delete");
        console.log(currentTask);
        $.ajax({
          method: "POST",
          url: "https://infs3202-w1oxm.uqcloud.net/intime/backend/deleteTask.php",
          data: {"taskID":currentTask["task_id"]},
          success: function(response){
            console.log("Recieved response from deleteTask.php:" + response);
          },
          async: true,
        })
      }

      saveTask();
      resetTaskBoxes();
      updateViewTaskList(true);

      $("#editAddTask").slideUp();
      $("#editTaskList").slideDown();
      $("#viewTaskList").slideDown();
    }
  });

  $('#timeRequiredInput').keyup(AllowOnlyNumber).blur(AllowOnlyNumber);
  //-------------------EDIT ADD TASK -----------------------------------------//

  function resetTaskBoxes(){
    updateUserTaskandChoices();

    console.log("---reset task boxes---");


    $(".mySelect").empty();
    console.log(tasksWithChoices);
    $.each(tasksWithChoices, function(val,text){
      if(val !="Give Task Name"){
        $(".mySelect").append(new Option(val,val));
      }
    });

    console.log("---for each task box---");
    var i =0;
    $("#taskBox .task").each(function(){
      console.log(selectedIndexes);
      var val = null;
      var value = null;
      if(selectedIndexes!=null && selectedIndexes.length >0){
        var currentSelectBox = $(this).children(".mySelect");
        var selBoxHtml = currentSelectBox[0];
        if(selBoxHtml.options!=null && selBoxHtml.options.length>0){
          val = selBoxHtml.options[selectedIndexes[i]];
          if(val != null){
            value = val.innerText;
          }
        }
      }
      console.log("setting:");
      console.log($(this).children(".mySelect"));
      console.log("value: " + value);
      $(this).children(".mySelect").val(value);
      i++;
    });
  }

  //View Task List Initaialization depends on only selected tasks
function updateViewTaskList(refreshSelectOptions){
    console.log("-------------updating task list---------------");
    updateUserTaskandChoices();
    //Updates the select boxes

    $("#tasks").empty();
    var selectedTasks = new Array();

    $("#taskBox .task").each(function(){
      var sel = $(this).children().first()[0];
      console.log("sel:");
      console.log(sel);
      if(sel!=null && sel.options.length >= 1 && sel.options[0]!="" && sel.options[sel.selectedIndex] !=null){
        console.log(sel.options[0]);
        console.log(sel.options.length);
        var value = sel.options[sel.selectedIndex].innerText;
        console.log("value:" + value);

        selectedTasks.push(value);
      }
    });

    console.log("selectedTasks:" + selectedTasks);
    console.log(tasksWithChoices);
    $.each(selectedTasks, function(key,value){
      //"Scales"
      var app = "<p><strong>" + value + "</p></strong>";
      app += "<ul>";
      //For each task that the user has defined ever
      $.each(tasksWithChoices[value], function(key,value){
        //Don't upload choice id.
        if(key=="choice_id"){
          return;
        }
        //"Keys:"
        app += "<li> <strong>" + key + ": " + " </strong>";
        //A, Ab, B, Bb...
        for(var i in value){
          if(i == (value.length-1)){
            app += value[i];
          } else{
            app += value[i] + ",";
          }
        }
        app += "</li>";
      });
      app += "</ul>";
      $("#tasks").append(app);
    });
  }

  function updateUserTaskandChoices(){
    console.log("------update user task and choices ---------");
    //Get all of the tasks associated with a user, full details
    $.ajax({
      type: "POST",
      url: "https://infs3202-w1oxm.uqcloud.net/intime/backend/getTasks.php",
      data: {"userEmail" : user_email},
      success: getTasksRequest,
      async:false,
    });

    function getTasksRequest(response){
      realUserTasks = new Array();
      tasksWithChoices = {};
      allUserTasks = {};
      fullUserTasks = new Array();
      var jsonResponse = JSON.parse(response);
      //console.log("Response from getTasks.php: ");
      //console.log(response);
      //GET ALL OF THE CHOICES ASSOCIATED WITH THOSE TASKS (full details)
      for(var i = 0; i < jsonResponse.length; i++){
          var task_id = jsonResponse[i]["task_id"];
          var task_name = jsonResponse[i]["task_name"];
          allUserTasks[task_name] = jsonResponse[i];
          fullUserTasks.push(jsonResponse[i]);
          $.ajax({
            type: "POST",
            url: "https://infs3202-w1oxm.uqcloud.net/intime/backend/getChoices.php",
            data: {taskID : task_id, taskName : task_name},
            success: function(response){
              //console.log("Got response from getChoices.php: " + response);
              var response = JSON.parse(response);
              //console.log("Response:");
              //console.log(response);
              tasksWithChoices[task_name] = response[task_name];
            },
            async:false
          });
      }
    }
  }

  function saveTask(){
    console.log("-------------------NEW SAVE----------------------------------");
    //Deep copy values
    var newTaskValues = JSON.parse(JSON.stringify(currentTask));

    //Set the values equal to the form values
    newTaskValues["task_name"] = $("#taskNameInput").val();
    newTaskValues["time_required"] = $("#timeRequiredInput").val();
    if($("#randomGen").is(":checked")){
      newTaskValues["random_gen"] = 1;
    } else{
      newTaskValues["random_gen"] = 0;
    }
    newTaskValues["gen_no"] = $("#noTasksInput").val();

    //Get the new choices and save them as one JSON string
    //var newChoiceValues = JSON.parse(JSON.stringify(currentTaskChoices));
    var newChoiceValues = new Array();
    var count = 0;
    $("#randomStart .subTask").each(function(){

      var choiceName = $(this).find(".subTaskName").text();
      var choices = $(this).find(".choicesInput").val();
      var choiceID = $(this).find(".choice_id").text();
      console.log("choicesID: " + choiceID);
      console.log("choiceName " + choiceName);
      console.log("choices: " + choices);
      var newChoice = {};
      newChoice["choice_id"] = choiceID;
      newChoice["choice_name"] = choiceName;
      newChoice["choices"] = choices;
      newChoiceValues.push(newChoice);
      count++;
      //newChoiceValues[choiceName] = choices;
    });

    console.log("New choice values:");
    console.log(newChoiceValues);

    var duplicate;
    if(currentTask["isNewTask"]){
      $.ajax({
        type: "POST",
        url: "https://infs3202-w1oxm.uqcloud.net/intime/backend/checkNameDuplicate.php",
        data: {"user_email":user_email,
              "taskName":newTaskValues["task_name"]},
        success: function(response){
          console.log("got response from checkNameDuplicate.php" + response);
          if(response=="Duplicate"){
            alert("Can't do duplicate task name bro");
            duplicate = true;
            return;
          }
        },
        async: true,
      });
    }

    if(duplicate){
      return;
    }

  //Send the info
  $.ajax({
      type: "POST",
      url: "https://infs3202-w1oxm.uqcloud.net/intime/backend/saveTask.php",
      data: {
        "userEmail" : user_email,
        "taskInfo" : JSON.stringify(newTaskValues),
        "choiceInfo" : JSON.stringify(newChoiceValues)},
      success: function(response){
        //console.log("Got response from saveTask.php: " + response);
      },
      async:true,
    });
  }
  //Loads information into the schedule view based on the database
  function updateScheduleView(){
  //  console.log("UPDATE SCHEDULE VIEW");
    $.ajax({
      method: "post",
      url: "https://infs3202-w1oxm.uqcloud.net/intime/backend/getSchedule.php",
      data: {userEmail : user_email},
      success: function(response){
        //console.log("Recieved response:" + response);
        var scheduleInfo = JSON.parse(response);
        $.each($(".scheduleInfo"),function(index,value){
          //Enable button if it's the right day
          if($(this).attr("id") != dayOfTheWeek && onlyPracticeOnDay){
            $(this).find(".practice").prop("disabled","true");
          }
          $(this).find(".scheduleList").empty();
          $.each(scheduleInfo[index],function(key,value){

            $(".scheduleInfo").eq(index).find(".scheduleList").append("<li>" + value["task_name"] + "</li>");
          });
        });
      },
      async: false
    });
  }

  function updateSelectedIndexes(){
    //Store stored tasks
    selectedIndexes = new Array();
    console.log("selectedIndexes:");
    $("#taskBox .task").each(function(){
      var sel = $(this).children().first()[0];
      var selIndex = sel.selectedIndex;
      selectedIndexes.push(selIndex);
    });
  }

  function AllowOnlyNumber() {
    var v = $(this).val();
    var no_nonnumerals = v.replace(/[^0-9]/g, '');
    $(this).val(no_nonnumerals);
  }

  function getDayOfTheWeek(){
    //Get datetime the same as the offset on the client's machine
    var nowDate = new Date();
    nowDate = nowDate - (nowDate.getTimezoneOffset() * 60000);
    nowDate = new Date(nowDate);
    return nowDate.getDay();
  }

  //Computes factorial, apparently nothing in javascript could sort me out
  function factorial(n){
    if (n == 0){
      return 1;
    } else {
      return n * factorial(n-1);
    }
  }
});

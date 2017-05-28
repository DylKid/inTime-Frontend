<!DOCTYPE html>
<?php
  session_start();
  /*echo $_SESSION["test"];
  echo $_SESSION['user_session'];
  echo $_SESSION["index"];
  echo $_SESSION["user_email"];*/
?>
<html>
<head>
  <link rel="stylesheet" href="style/main.css">
  <script src="resources/jquery.min.js"></script>
  <script src = "resources/bootstrap.min.js"></script>
  <link href="resources/bootstrap.min.css" rel="stylesheet"></script>
  <link rel="stylesheet" href="resources/bootstrapValidator.min.css"/>
  <script type="text/javascript" src="resources/bootstrapValidator.min.js"> </script>
  <script src = "resources/spotify-web-api.js"></script>
  <script type="text/javascript" src = "js/schedule.js"></script>
  <link href="resources/bootstrap-editable.css" rel="stylesheet"/>
  <script src="resources/bootstrap-editable.js"></script>
  <script src = "js/mobileAdjustment.js"></script>
</head>

<header>
  <h1> Schedule View </h1>
  <h5 id="welcome">Welcome, <span id = "user_email"></span></h5>
</header>

<nav>
  <div>
    <ul>
      <li> <a id="user" href="user.php"> User </a> </li>
      <li> <a> Schedule </a> </li>
      <li style = "float:right;"> <a id="logout"> Logout </a> </li>
    </ul>
  </div>
</nav>

<!-- Schedule View -->
<body id = "main">
  <div id = "tableContainer">
    <table id="schedule">
      <tr>
        <td class = "dayName"> Monday </td>
        <td class = "dayName"> Tuesday </td>
        <td class = "dayName"> Wednesday </td>
        <td class = "dayName"> Thursday </td>
        <td class = "dayName"> Friday </td>
        <td class = "dayName"> Saturday </td>
        <td class = "dayName"> Sunday </td>
      </tr>
      <tr>
        <td id="Monday" class ="scheduleInfo">
          <div class = "scheduleContainer">
            <div class="scheduleListContainer">
              <ul class = "scheduleList">
              </ul>
            </div>
            <div class = "buttonContainer">
              <button class="editList"> Edit List </button>
              <button class="practice"> Practice! </button>
            </div>
          </div>
        </td>
        <td id="Tuesday" class ="scheduleInfo" >
          <div class = "scheduleContainer">
            <div class="scheduleListContainer">
              <ul class = "scheduleList">
              </ul>
            </div>
            <div class = "buttonContainer">
              <button class="editList"> Edit List </button>
              <button class="practice"> Practice! </button>
            </div>
          </div>
        </td>
        <td id="Wednesday" class ="scheduleInfo" >
          <div class = "scheduleContainer">
            <div class="scheduleListContainer">
              <ul class = "scheduleList">
              </ul>
            </div>
            <div class = "buttonContainer">
              <button class="editList"> Edit List </button>
              <button class="practice"> Practice! </button>
            </div>
          </div>
        </td>
        <td id="Thursday" class ="scheduleInfo" >
          <div class = "scheduleContainer">
            <div class="scheduleListContainer">
              <ul class = "scheduleList">
              </ul>
            </div>
            <div class = "buttonContainer">
              <button class="editList"> Edit List </button>
              <button class="practice"> Practice! </button>
            </div>
          </div>
        </td>
        <td id="Friday" class ="scheduleInfo" >
          <div class = "scheduleContainer">
            <div class="scheduleListContainer">
              <ul class = "scheduleList">
              </ul>
            </div>
            <div class = "buttonContainer">
              <button class="editList"> Edit List </button>
              <button class="practice"> Practice! </button>
            </div>
          </div>
        </td>
        <td id="Saturday" class ="scheduleInfo" >
          <div class = "scheduleContainer">
            <div class="scheduleListContainer">
              <ul class = "scheduleList">
              </ul>
            </div>
            <div class = "buttonContainer">
              <button class="editList"> Edit List </button>
              <button class="practice"> Practice! </button>
            </div>
          </div>
        </td>
        <td id="Sunday" class ="scheduleInfo" >
          <div class = "scheduleContainer">
            <div class="scheduleListContainer">
              <ul class = "scheduleList">
              </ul>
            </div>
            <div class = "buttonContainer">
              <button class="editList"> Edit List </button>
              <button class="practice"> Practice! </button>
            </div>
          </div>
      </tr>
    </table>
  </div>
</body>
<!-- Schedule View -->


<div id="overlay">
  <!-- Edit Task List and View Task List -->
  <div id="editTaskList" class="editTaskListDesktop">
    <h3> Edit Task List </h3>
    <div id = "editTasks">
      <div id="taskBox">
      </div>
    </div>
    <button id="addTask"> Add Task </button>
    <button id="newTask"> New Task </button>
    <button id = "listViewBack"> Back </button>
  </div>
  <hr id = "listGap">
  <div id="viewTaskList" class = "viewTaskListDesktop">
    <h3> View Task List </h3>
    <div id="tasks">
    </div>
  </div>
  <!-- Edit Task List and View Task List -->

  <!-- Edit/New Task -->
  <div id = "editAddTask" style="overflow-y:scroll">
  <form id="taskForm" method="post" class="form-horizontal">
    <div class="form-group">
      <label class="col-md-3 control-label">Task Name </label>
      <div class="col-md-6">
        <input type="text" class="form-control" name="taskName" class="taskName" id="taskNameInput" maxlength="20"/>
      </div>
    </div>
    <div class="form-group">
      <label class="col-md-3 control-label">Time Required (Minutes)</label>
      <div class="col-md-6">
        <input type="text" class="form-control" name="timeRequired" id="timeRequiredInput" maxlength="2"/>
      </div>
    </div>
    <!--<div id = "checkbox">
      <label for="randomGen"><input type="checkbox" value="" name = "randomGen" id="randomGen"/>Randomly Generate Sub Tasks</label>
</div>-->
    <!-- The form that's shown if random generation is selected -->
    <div id="randomForm">
      <div id = "randomStart">
      <div class="form-group">
        <label class="col-md-3 control-label">Number of tasks Generated </label>
        <div class="col-md-6">
          <input type="range" class="form-control" name="noTasks" min="1" max="10" id="noTasksInput"/>
          <!--<span id="noTasksNumber"></span>-->
        </div>
      </div>
      <div id = "subTaskInputs">
      </div>
    </div>
    </div>
    <!-- The form that's shown if random generation is selected -->
    <!--<div id = "setSubTaskForm">
      <div class="form-group">
        <label class = "col-md-3 control-label" for="subTasks">Sub-Tasks:</label>
        <div class="col-md-6">
          <textarea class="form-control" rows="5" id="subTasks"></textarea>
        </div>
      </div>
    </div>-->
  </form>

  <button id = "editAddTaskBack"> Back </button>
  <button id = "newSubTaskButton"> New Sub-Task</button>
  <!--<button id = "editAddTaskSave"> Save </button>-->
  </div>
  <!-- Edit/New Task -->
</div>

<!-- Template for a task in edit task list view-->
<div id="taskTemplate" style="dislay:none">
  <p class = "task">
    <select class="mySelect">
    </select>
    <button class = "editTask"> Edit </button> <button class="removeTask"> Remove </button>
  </p>
<!-- Template for a task in edit task list view-->
</div>

<!-- Template for a sub task in editAddTask -->
<div id = "subTaskTemplate" style="display:none">
  <div class = "subTask form-group">
    <label class="col-md-3 control-label subTaskLabel">
      <!--<div class = "subTaskLabel">-->
        <div class = "editable subTaskName">Give Name</div>
      <!--</div>-->
    </label>
    <div class="col-md-6 subTaskInput">
      <input type="text" class="form-control choicesInput" name="Name" maxlength = 100/>
    </div>
    <div class = "removeSubTask">
      <button class = "removeButton"> Remove </button>
    </div>
  </div>
</div>
<!-- Template for a sub task in editAddTask -->

<div id ="div_session_write"></div>

</html>

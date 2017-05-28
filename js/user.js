$(document).ready(function(){

  //Page Setup----------------------------------------------------------------//
  var user_email = sessionStorage.getItem("user_email");
  if(user_email == "" || user_email == null){
    window.open("index.html","_self",false);
  }
  $("#user_email").append(user_email);
  $("#welcome").append("Logged in as " +user_email);

  $("#logout").click(function(){
    sessionStorage.removeItem("user_email");
    window.open("index.html","_self",false);
  });
  //Page Setup----------------------------------------------------------------//

  //---------------------No of days running-----------------------------------//
  $.ajax({
    method: "POST",
    url: "https://infs3202-w1oxm.uqcloud.net/intime/backend/getAllPractice.php",
    data: {"userEmail": user_email},
    success: function(response){
      console.log("got response from get all practice.php");
      console.log(response);
      var practiceObjects = JSON.parse(response);
      console.log("sorted:")
      practiceObjects.sort(practiceCompare);
      console.log(practiceObjects);
      var currDate = Date.now();
      var noDaysRunning = 0;
      $.each(practiceObjects, function(index, pracObj){
        var pracTime = new Date(pracObj["time_completed"]).getTime();
        var hoursDiff = (currDate-pracTime)/3600000;
        if(hoursDiff < 24){
          noDaysRunning++;
          currDate = pracTime;
        } else {
          return;
        }
      });
      $("#noDaysRunning").empty();
      $("#noDaysRunning").append(noDaysRunning);
    },
    async: false,
  });

  function practiceCompare(a,b){
    var aTime = new Date(a["time_completed"]);
    var bTime = new Date(b["time_completed"]);
    if(aTime < bTime){
      return -1;
    } else if(aTime > bTime){
      return 1;
    }
    return 0;
  }

    //-----------------------Get visualizations data----------------------------//
  var timeObj = {};
  $.ajax({
    method: "POST",
    url: "https://infs3202-w1oxm.uqcloud.net/intime/backend/countSubtasks.php",
    data: {userEmail: user_email},
    success: function(response){
      console.log("Got response from countSubtasks.php");
      console.log(JSON.parse(response));
      var practice = JSON.parse(response);
      $.each(practice, function(index,object){
        var dateCompleted = object["date_completed"];
        var count = parseInt(object["count"]);
        if(object == null ||  dateCompleted == null){
          return;
        }
        if(timeObj[dateCompleted] == undefined){
          timeObj[dateCompleted] = 0;
        }
        timeObj[dateCompleted] += count;
      });
      console.log("time object");
      console.log(timeObj);
    },
    async: false,
  });

  var taskCount = {};
  $.ajax({
    method: "POST",
    url: "https://infs3202-w1oxm.uqcloud.net/intime/backend/tasksCompleted.php",
    data: {userEmail : user_email},
    success: function(response){
      console.log("Got response from tasksCompleted.php");
      console.log(response);
      var tasks = JSON.parse(response);
      $.each(tasks, function(index,object){
        var dateComplete = object["date_completed"];
        var taskName = object["task_name"];

        if(dateComplete == null || object == null){
          return;
        }

        if(taskCount[taskName] == undefined){
          taskCount[taskName] = 0;
        }
        taskCount[taskName] += 1;
      });
      console.log("taskCount object:")
      console.log(taskCount);
    },
    async: false,
  });


  //var tasksCompletedWithTime = {};
  var timeSpent = {};
  var taskCountByTime = {};
  $.ajax({
    method: "POST",
    url: "https://infs3202-w1oxm.uqcloud.net/intime/backend/completedTasksWithTime.php",
    data: {userEmail : user_email},
    success: function(response){
      console.log("got response from completedTasksWithTime.php");
      console.log(response);
      tasksCompletedWithTime = JSON.parse(response);
      console.log(tasksCompletedWithTime);


      taskCountByTime["today"] = 0;
      taskCountByTime["this_week"] = 0;
      taskCountByTime["this_month"] = 0;
      taskCountByTime["total"] = 0;
      timeSpent["today"] = 0;
      timeSpent["this_week"] = 0;
      timeSpent["this_month"] = 0;
      timeSpent["total"] = 0;
      var now = Date.now();
      //console.log("NOW: " + now.getTime());
      $.each(tasksCompletedWithTime, function(index, taskObj){
        console.log("index", index);
        console.log("taskObj:");
        console.log(taskObj);
        var taskTime = new Date(taskObj["time_completed"]).getTime();
        var hoursDiff = (now-taskTime)/3600000;
        console.log(hoursDiff);
        if(hoursDiff < 24){
          taskCountByTime["today"]++;
          timeSpent["today"] += parseInt(taskObj["time_required"]);
        }
        if(hoursDiff < 168){
          taskCountByTime["this_week"]++;
          timeSpent["this_week"] += parseInt(taskObj["time_required"]);
        }
        if(hoursDiff < 730){
          taskCountByTime["this_month"]++;
          timeSpent["this_month"] += parseInt(taskObj["time_required"]);
        }
        taskCountByTime["total"]++;
        timeSpent["total"] += parseInt(taskObj["time_required"]);
      });
      console.log("timespent:");
      console.log(timeSpent);
      //Get number of days running and display it in #noDaysRunning
    },
    async: false
  });

  //-----------------------Get visualizations data----------------------------//

//
  google.charts.load('current', {'packages':['corechart']});
  google.charts.setOnLoadCallback(drawDayTimeChart);
  google.charts.setOnLoadCallback(drawTaskCountChart);
  google.charts.setOnLoadCallback(drawTimeSpentChart);
  google.charts.setOnLoadCallback(drawTasksCompletedChart);


  //-----------------------time spent by day line chart-----------------------//
  function drawDayTimeChart() {
    var data = new google.visualization.DataTable();

    data.addColumn('string', 'Year');
    data.addColumn('number', 'Count');

    $.each(timeObj, function(date, count){
      var arr = [date, count];
      data.addRow(arr);
    });

    var options = {
      title: 'Number of Subtasks completed',
      legend: {position: 'none'},
      colors: ['#328CC1']
    };

    var chart = new google.visualization.LineChart(document.getElementById('day_time_chart'));

    chart.draw(data, options);
  }

  function drawTaskCountChart() {
    var data = new google.visualization.DataTable();

    data.addColumn('string', 'Task Name');
    data.addColumn('number', 'Count');

    console.log("task count:");
    console.log(taskCount);

    $.each(taskCount, function(taskName, count){
      var arr = [taskName, count];
      data.addRow(arr);
    });

    var options = {
      title: 'Bar Chart',
      legend: {position: 'none'},
      gridlines: { count: -1},
      colors: ['#328CC1'],
    };

    var chart = new google.visualization.ColumnChart(document.getElementById('task_count_chart'));

    chart.draw(data, options);
  }

  function drawTimeSpentChart() {
    var data = new google.visualization.DataTable();

    data.addColumn('string', 'Time Frame');
    data.addColumn('number', 'Number of Minutes');

    $.each(timeSpent, function(string, number){
      var arr = [string, number];
      data.addRow(arr);
    });


    var chart = new google.visualization.ColumnChart(document.getElementById('time_spent_chart'));

    var options = {
      title: 'Time Spent',
      legend: {position: 'none'},
      gridlines: { count: -1},
      colors: ['#328CC1']
    };

    chart.draw(data, options);

  }

  function drawTasksCompletedChart() {
    var data = new google.visualization.DataTable();

    data.addColumn('string', 'Time Frame');
    data.addColumn('number', 'Number of Tasks');

    $.each(taskCountByTime, function(string, number){
      var arr = [string, number];
      data.addRow(arr);
    });


    var chart = new google.visualization.ColumnChart(document.getElementById('tasks_completed_chart'));

    var options = {
      title: 'Number of Tasks Completed',
      legend: {position: 'none'},
      gridlines: { count: -1},
      colors: ['#328CC1'],
    };

    chart.draw(data, options);

  }
});

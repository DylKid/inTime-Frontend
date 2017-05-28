<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="style/main.css">
  <link rel="stylesheet" href="style/user.css">
  <script src="resources/jquery.min.js"></script>
  <script src = "resources/bootstrap.min.js"></script>
  <link href="resources/bootstrap.min.css" rel="stylesheet"></script>
  <link rel="stylesheet" href="resources/bootstrapValidator.min.css"/>
  <script type="text/javascript" src="resources/bootstrapValidator.min.js"> </script>
  <script type="text/javascript" src="https://www.gstatic.com/charts/loader.js"></script>
  <script type="text/javascript" src = "js/schedule.js"></script>
  <script type="text/javascript" src = "js/user.js"></script>
  <script src="js/mobileAdjustment.js"></script>
</head>

<header>
  <h1> User View </h1>
  <h5 id="welcome"></h5>
</header>

<body id = "main">
  <nav>
    <div>
      <ul>
        <li> <a> User </a> </li>
        <li> <a href="schedule.php"> Schedule </a> </li>
        <li style = "float:right;"> <a id="logout"> Logout </a> </li>
      </ul>
    </div>
  </nav>

  <div id = "daysRunningContainer">
    <p> Number of days runing: <span id="noDaysRunning"></span></p>
  </div>

  <section id = "charts1" class = "chartContainer">
    <div class = "chart" id = "time_spent_chart"></div>
    <div class = "chart" id = "tasks_completed_chart"></div>
  </section>

  <section id = "charts2" class = "chartContainer">
    <div class = "chart" id = "day_time_chart"></div>
    <div class = "chart" id = "task_count_chart"></div>
  </section>

</body>
</html>

<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="style/main.css">
  <link rel="stylesheet" href="style/practice.css">
  <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.2.0/jquery.min.js"></script>

  <script src = "resources/bootstrap.min.js"></script>
  <link href="resources/bootstrap.min.css" rel="stylesheet"></script>
  <link rel="stylesheet" href="resources/bootstrapValidator.min.css"/>
  <script type="text/javascript" src="resources/bootstrapValidator.min.js"> </script>
  <script type="text/javascript" src = "js/schedule.js"></script>
  <script type="text/javascript" src = "js/mobileAdjustment.js"></script>
  <script type="text/javascript" src = "js/practice.js"></script>

  <link href="//cdnjs.cloudflare.com/ajax/libs/x-editable/1.5.0/bootstrap3-editable/css/bootstrap-editable.css" rel="stylesheet"/>
  <script src="//cdnjs.cloudflare.com/ajax/libs/x-editable/1.5.0/bootstrap3-editable/js/bootstrap-editable.min.js"></script>
</head>
<header>
  <div>
    <h1> Practice View </h1>
    <h5 id="day">Practice For </h5>
  </div>
</header>

<nav>
  <div>
    <ul>
      <li> <a id="showMetronome"> Metronome </a> </li>
      <li> <a id="tunerButton"> Tuner </a> </li>
    </ul>
  </div>
</nav>

<body id = "main">
  <div id="tasksContainer">
  </div>

  <button id="practiceBack">Back</button>
</body>

<!--Metronome-->
<div class="overlay" id = "metronomeOverlay" style="display:none">
  <!-- Edit Task List and View Task List -->
  <div id = "metronome">
    <h5> Metronome </h5>
    <input type="range" class="form-control" min="50" max="250" id="metronomeRange"/>
    <span id="noTasksNumber"></span>
    <div id = "metronomeButtons" class = "buttonContainer">
      <button id = "metronomeBack" class = "mainButton"> Back </button>
      <button id = "metronomePlay" class = "mainButton"> Play </button>
      <button id = "metronomeStop" class = "mainButton"> Stop </button>
    </div>
  </div>
</div>

<!--Tuner-->
<div class="overlay" id = "tunerOverlay" style="display:none">
  <!-- Edit Task List and View Task List -->
  <div id = "tuner">
    <h5> Tuner </h5>
    <div id = "selectContainer">
      <p id ="playNoteLabel"> Play note </p>
      <select id = "noteSelect">
        <option value = "A"> A </option>
        <option value = "Bb"> Bb </option>
        <option value = "B"> B </option>
        <option value= "C"> C </option>
        <option value = "Db"> Db </option>
        <option value = "D"> D </option>
        <option value = "Eb"> Eb </option>
        <option value = "E"> E </option>
        <option value = "F"> F </option>
        <option value = "Gb"> Gb </option>
        <option value = "G"> G </option>
        <option value = "Ab"> Ab </option>
      </select>
    </div>
    <div id = "tunerButtons" class = "buttonContainer">
      <button id = "tunerBack" class = "mainButton"> Back </button>
      <button id = "tunerPlay" class = "mainButton"> Play </button>
      <button id = "tunerStop" class = "mainButton"> Stop </button>
    </div>

  </div>
</div>

</html>

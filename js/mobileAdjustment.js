$(document).ready(function(){
  if(isMobile()){
    //----------------------Swap Rows and Columns for Schedule Table------------
    $("#schedule").each(function() {
      var $this = $(this);
      var newrows = [];
      $this.find("tr").each(function(){
          var i = 0;
          $(this).find("td").each(function(){
              i++;
              if(newrows[i] === undefined) { newrows[i] = $("<tr></tr>"); }
              newrows[i].append($(this));
          });
      });
      $this.find("tr").remove();
      $.each(newrows, function(){
          $this.append(this);
      });
    });
    //----------------------Swap Rows and Columns for Schedule Table------------

    $.each($("#charts").children(), function(index, divObject){
      console.log(divObject);
      $(divObject).css("width", "100%");
      $(divObject).css("height", "70%");
    });
      $(".removeSubTask").css("padding-left","15px");
      $("#daysRunningContainer").css("width", "100%");
      $(".chart").css("width","100%");
      $("#metronome").css("width","100%");
      $("#metronome").css("margin-left","0%");
      $(".buttonContainer").css("margin-left","22.5%");


  }

  $("#tuner .buttonContainer").css("bottom","0px");

  $("#editTaskList").removeClass("editTaskListDesktop");
  $("#editTaskList").addClass("editTaskListMobile");

  $("#viewTaskList").removeClass("viewTaskListDesktop");
  $("#viewTaskList").addClass("viewTaskListMobile");

  $(".removeSubTask").css("margin-top","1px");
});

function isMobile(){
  if($(window).height() <= 720 && $(window).width() <= 480){
    return true;
  } else {
    return false;
  }
}

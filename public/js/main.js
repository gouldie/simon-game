var sequence = [],
  intervals = {},
  timeouts = {},
  strict = false,
  winningScore = 20,
  score,
  sound;

$("#onoffbtn").css("cursor", "pointer");
$("#strict").css("cursor", "default");
$("#start").css("cursor", "default");
$(".btn").css("cursor", "default");
$("#onoffbtn").on("click", onOff);

function onOff() {
  var on = $("#onoffbtn").hasClass("turnOn");
  if (on) {
    turnOff();
  } else {
    turnOn();
  }
}

function turnOn() {
  strict = false;
  $("#strict").css("cursor", "pointer").css("opacity", "1");
  $("#start").css("cursor", "pointer").css("opacity", "1");
  $("#strictLight").css("opacity", "1");
  $("#onoffbtn").addClass("turnOn");
  $("#strict").on("click", toggleStrict);
  $("#start").on("click", startGame);
  $(".btn").css("cursor", "pointer");
}

function turnOff() {
  $("#start").off().css("cursor", "default").css("opacity", "0.8");
  $("#strict").off().css("cursor", "default").css("opacity", "0.8");
  $("#strictLight").css("opacity", "0.8");
  $("#onoffbtn").removeClass("turnOn");
  $(".btn").css("cursor", "default");
  $("#display").prop("placeholder", "--");

  if (strict) {
    toggleStrict();
  }

  resetAudio();
  for (var interval in intervals) {
    clearInterval(intervals[interval])
  }

  for (var timeout in timeouts) {
    clearTimeout(timeouts[timeout])
  }
}

function toggleStrict() {
  if (!strict) {
    strict = true;
    $("#strictLight").css("background", "red");
  } else {
    strict = false;
    $("#strictLight").css("background", "");
  }
}

function startGame() {
  
  resetAudio();

  for (var interval in intervals) {
    clearInterval(intervals[interval])
  }
  for (var timeout in timeouts) {
    clearTimeout(timeouts[timeout])
  }

  sequence = [];
  score = 0;
  newRound();
}

function resetAudio() {
  if (sound) {
    sound.pause();
    sound.currentTime = 0;
  }
}

function newRound() {
  $("#btn1").off().css("cursor", "default");
  $("#btn2").off().css("cursor", "default");
  $("#btn3").off().css("cursor", "default");
  $("#btn4").off().css("cursor", "default");
  ++score;
  $("input").attr("placeholder", score);
  sequence.push(Math.floor((Math.random() * 4) + 1));
  animateBoard();
}

function endRound(success) {
  clearTimeout(timeouts.player);

  $("#btn1").off().css("cursor", "default");
  $("#btn2").off().css("cursor", "default");
  $("#btn3").off().css("cursor", "default");
  $("#btn4").off().css("cursor", "default");

  if (!success) {
    // error output
    document.getElementById("error").play();
    $("input").prop("placeholder", "Err");

    timeouts.endRound = setTimeout(function() {
      if (strict) {
        startGame();
      } else {
        $("input").prop("placeholder", score);
        animateBoard();
      }
    }, 1500)

  } else if (score == winningScore) {
    timeouts.endRound = setTimeout(function() {
      $("#display").prop("placeholder", "Win");
    }, 500);
  } else {
    timeouts.endRound = setTimeout(function() {
      newRound();
    }, 500);
  }
}

function blink(obj) {
  $(obj).animate({
    opacity: 1.0
  }, 10);

  setTimeout(function() {
    $(obj).animate({
      opacity: 0.8
    }, 50)
  }, 600)
}

function playAudio(obj) {
  obj.play();
  setTimeout(function() {
    obj.pause();
    obj.currentTime = 0;
  }, 600);
}

function animateBoard() {
  var index = 0;

  intervals.animateBoard = setInterval(function() {
    blink($("#btn" + sequence[index]));
    sound = document.getElementById("simon" + sequence[index]);
    playAudio(sound);
    index++;
    if (index == sequence.length) {
      clearInterval(intervals.animateBoard);
      playerTurn();
    }
  }, 1200)
}

function playerTurn() {
  var index = 0;
  
  timeouts.player = setTimeout(function() {
    endRound(false)
  }, 6000);

  $(".btn").mousedown(function() {

    clearTimeout(timeouts.player);

    // audio
    sound = document.getElementById("simon" + this.getAttribute("index"));
    sound.play();

    $(this).animate({
      opacity: 1.0
    }, 100);

    // max length to hold button
    timeouts.player = setTimeout(function() {
      endRound(false)
    }, 6000);

    // correct button
    if (this.getAttribute("index") == sequence[index]) {
      index++
    }

    // incorrect button
    else {
      $(this).animate({
        opacity: 0.8
      }, 300);

      document.getElementById("simon" + this.getAttribute("index")).pause();
      document.getElementById("simon" + this.getAttribute("index")).currentTime = 0;
      sound = null;
      endRound(false);
    }
  }).mouseup(function() {

    clearTimeout(timeouts.player);
    
    timeouts.player = setTimeout(function() {
      endRound(false)
    }, 6000);

    $(this).animate({
      opacity: 0.8
    }, 100);
    
    if (index == sequence.length) {
      endRound(true);
    }
  }).css("cursor", "pointer");

}
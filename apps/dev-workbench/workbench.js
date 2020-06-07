
// let JSZip = require("jszip");
// let zip = new JSZip();
// zip.generateAsync({type: 'blob'})
//     .then(function(blob) {
//       saveAs(blob, 'hello.zip');
//     });
// function saveAs(theBlob, fileName) {
//   // A Blob() is almost a File() - it's just missing the two properties below which we will add
//   theBlob.lastModifiedDate = new Date();
//   theBlob.name = fileName;
//   return theBlob;
// }

function dataSelect() {
  $('#stepper').hide(300);
  $('#headContent').hide(300);
  $('#headContent').html('Select or create your own dataset');
  $('#headContent').show(180);
  $('#headSub').hide(200);
  $('#headContent').html('Select or create your dataset');
  $('#headContent').show(180);
  $('#cards').show(200);
}

$('#spriteInput').change(function() {
  $('#cards').hide(150);
  $('#stepper').show(200);
  $('#headContent').html(' Welcome to <b>Development Workbench</b>');
  $('#headContent').show(400);
  $('#headSub').show(400);
  $('.firstStepHead').attr('class', 'firstStepHead done');
  $('.done span.circle').css('background-color', 'green');
  $('.secondStepHead').attr('class', 'secondStepHead active');
  $('#firstStepButton').hide();
  $('#secondStepButton').show();
});


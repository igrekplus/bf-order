function calc() {
  var num = $("#number").val();
  var price = $("#parent").val().replace(/,/g, '');
  var profitPlus = $("#profit").val().replace(/,/g, '');
  var losscutMinus = $("#losscut").val().replace(/,/g, '');
  var profitValue = parseInt(price) + parseInt(profitPlus)
  var losscutValue = parseInt(price) - parseInt(losscutMinus)
  var earning = profitPlus * parseInt(num)
  var loss = losscutMinus * parseInt(num)
  $("#parent").val(parseInt(price).toLocaleString());
  $("#profitValue").text(profitValue.toLocaleString());
  $("#losscutValue").text(losscutValue.toLocaleString());
  $("#earning").text(earning.toLocaleString());
  $("#loss").text(loss.toLocaleString());
}
$(document).ready(function () {
  calc();
});
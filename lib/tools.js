
function compare1st(a, b) {
  return a[0] - b[0];
}

function order(stride) {
  var terms = new Array(stride.length);
  for(var i=0; i<terms.length; ++i) {
    terms[i] = [Math.abs(stride[i]), i];
  }
  terms.sort(compare1st);
  var result = new Array(terms.length);
  for(var i=0; i<result.length; ++i) {
    result[i] = terms[i][1];
  }
  return result;
}

exports.order = order;


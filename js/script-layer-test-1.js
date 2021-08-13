var CURRENT_LAYER = 1;
var WORK_TIME_MS = 2000;
// simulate some work
function doSomeWorkForIntervalThenLoad() {
    setTimeout(function () {
        console.log("Waited on layer 1 for, ", WORK_TIME_MS);
    }, WORK_TIME_MS);
  
}

var advertiserCreativeRef; // Store vpaidAd reference in here.

var controlPanelRef; // Reference to control panel

var pauseAdButtonRef;
var resumeAdButtonRef;
var resizeAdButtonRef;
var stopAdButtonRef;
var showConsoleLogButtonRef;

// For allowing our homebrew logger functionality.

var lastEleRef; // Ref to last inserted element in the debug logger
var loggerContainer; // Ref to the list
var loggerWrapper; // Ref to the div wrapping the list

function initLogger() {
  loggerWrapper = document.createElement("div");
  loggerWrapper.id = "interr-debug-logger";
  loggerWrapper.style =
    " border: 2px solid black; position: absolute; bottom: 0; right: 0; width: 50%; height: 300px;";
  loggerContainer = document.createElement("ul");
  loggerContainer.id = "logger-list";
  loggerWrapper.appendChild(loggerContainer);
  document.body.appendChild(loggerWrapper);

  logLine("Logger initialized");
}

function logLine(content, err) {
  var ele = document.createElement("li");
  var logString = getTimeStampString() + content;
  ele.textContent = logString;
  // If err message was passed, indicate so.
  if (err) {
    ele.style.color = "red";
    ele.textContent += " (" + err + ")";
    console.error(logString);
  } else {
    console.log(logString); // Log to console as well
  }

  loggerContainer.insertBefore(ele, lastEleRef);
  lastEleRef = ele;
}

function getTimeStampString() {
  var timeNow = new Date();
  var sec = timeNow.getSeconds();
  var min = timeNow.getMinutes();
  var hr = timeNow.getHours();
  return "[" + hr + ":" + min + ":" + sec + "] - ";
}

function toggleConsoleLogVisibility() {
  if (loggerWrapper.style.display == "none") {
    logLine("logger shown");
    loggerWrapper.style.display = "block";
  } else {
    logLine("logger hidden");
    loggerWrapper.style.display = "none";
  }
}

//

function beginInterrogator() {
  initLogger(); // Always do this first
  var success = attachToVpaidAd(); // Attach to the vpaid creative
  success
    ? logLine("=== Interrogator online ====")
    : logLine("Failed", "Status was false");

  if (success) {
    // load the UI
    initInterrogationUI();
    toggleConsoleLogVisibility();
  }
}

function initInterrogationUI() {
  controlPanelRef = document.createElement("div");
  controlPanelRef.style =
    "border: 4px dotted black; position: absolute; bottom: 0; right: 0; width: 320px; height: 250px;";
  controlPanelRef.id = "interr-panel-ref";
  document.body.appendChild(controlPanelRef);

  // TODO: simplify this. this can SOOO be simplified.

  // Hide/show button

  showConsoleLogButtonRef = document.createElement("BUTTON"); // Note: setting style on the button is trickier.
  showConsoleLogButtonRef.innerHTML = "Toggle Display UI";
  showConsoleLogButtonRef.onclick = toggleConsoleLogVisibility;
  controlPanelRef.appendChild(showConsoleLogButtonRef);
  showConsoleLogButtonRef = styleControlPaneButton(showConsoleLogButtonRef);

  // Pause Ad
  pauseAdButtonRef = document.createElement("BUTTON");
  pauseAdButtonRef.innerHTML = "Pause Ad";
  pauseAdButtonRef.onclick = testVpaidAdPause;
  controlPanelRef.appendChild(pauseAdButtonRef);
  pauseAdButtonRef = styleControlPaneButton(pauseAdButtonRef);

  // Resume ad
  resumeAdButtonRef = document.createElement("BUTTON");
  resumeAdButtonRef.innerHTML = "Resume Ad";
  resumeAdButtonRef.onclick = testVpaidAdResume;
  controlPanelRef.appendChild(resumeAdButtonRef);
  resumeAdButtonRef = styleControlPaneButton(resumeAdButtonRef);
  
    // Resize ad
  resizeAdButtonRef = document.createElement("BUTTON");
  resizeAdButtonRef.innerHTML = "Resize Ad";
  resizeAdButtonRef.onclick = testVpaidAdResize;
  controlPanelRef.appendChild(resizeAdButtonRef);
  resizeAdButtonRef = styleControlPaneButton(resizeAdButtonRef);
}

// Style the button programatically without overwriting the native button styles
function styleControlPaneButton(btnRef) {
  btnRef.style.height = "50px";
  btnRef.style.width = "300px";
  btnRef.style.color = "white";
  btnRef.style.margin = "0 auto";
  btnRef.style.background = "black";
  btnRef.style.display = "block";

  return btnRef;
}

/*

VPAID API testing

*/

// Function to test ad pause
function testVpaidAdPause() {
  logLine("Instructing Vpaid Ad to Pause");
  try {
    advertiserCreativeRef.pauseAd();
  } catch (err) {
    logLine("Failed to pause: ", err);
  }
}

// Function to test ad resume
function testVpaidAdResume() {
  logLine("Instructing Vpaid Ad to Resume");
  try {
    advertiserCreativeRef.resumeAd();
  } catch (err) {
    logLine("Failed to resume: ", err);
  }
}

// Function to test ad resize
function testVpaidAdResize() {
  logLine("Instructing Vpaid Ad to Resize");
  try {
    advertiserCreativeRef.resizeAd();
  } catch (err) {
    logLine("Failed to resize: ", err);
  }
}

function initializeDebugConsoleUI() {
  var debugLogContainer = document.createElement("div");
}

/*
This should be invoked after the creative script has been loaded into the DOM
This will return true if attach is successful, short terminate and false if not
*/
function attachToVpaidAd() {
  logLine("Attaching to vpaid ad");

  // Test to see if getVPAIDAd is even defined.
  try {
    if (getVPAIDAd) {
      logLine("getVPAIDAd is defined within advertiser script");
    }
  } catch (err) {
    logLine("Could not attach to ad. getVPAIDAd not defined", err);
    return false;
  }

  // Get the reference to the vpaid ad so we can control it as we like
  advertiserCreativeRef = getVPAIDAd();
  if (!advertiserCreativeRef) {
    logLine("Could not attach to ad", "getVPAIDAd() returned null");
    return false;
  }

  // Run a basic IAB test against it just to check for compliance
  iab_interrogateAdIsValid(advertiserCreativeRef);
  logLine("Attached to ad.");
  return true;
}

function iab_interrogateAdIsValid(VPAIDCreative) {
  if (
    VPAIDCreative.handshakeVersion &&
    typeof VPAIDCreative.handshakeVersion == "function" &&
    VPAIDCreative.initAd &&
    typeof VPAIDCreative.initAd == "function" &&
    VPAIDCreative.startAd &&
    typeof VPAIDCreative.startAd == "function" &&
    VPAIDCreative.stopAd &&
    typeof VPAIDCreative.stopAd == "function" &&
    VPAIDCreative.skipAd &&
    typeof VPAIDCreative.skipAd == "function" &&
    VPAIDCreative.resizeAd &&
    typeof VPAIDCreative.resizeAd == "function" &&
    VPAIDCreative.pauseAd &&
    typeof VPAIDCreative.pauseAd == "function" &&
    VPAIDCreative.resumeAd &&
    typeof VPAIDCreative.resumeAd == "function" &&
    VPAIDCreative.expandAd &&
    typeof VPAIDCreative.expandAd == "function" &&
    VPAIDCreative.collapseAd &&
    typeof VPAIDCreative.collapseAd == "function" &&
    VPAIDCreative.subscribe &&
    typeof VPAIDCreative.subscribe == "function" &&
    VPAIDCreative.unsubscribe &&
    typeof VPAIDCreative.unsubscribe == "function"
  ) {
    logLine("Ad is complaint based off of IAB spec");
    return true;
  }
  logLine("Note: Ad is not complaint based off of IAB spec", "err");
  return false;
}

console.log("Interrogator script has been fully loaded.");
beginInterrogator();

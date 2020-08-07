const username = 'your_github_username';
const password = 'your_oauth_or_personal_token';

var auth = Utilities.base64Encode(username + ":" + password);

var branchName = 'newBranch';  //Overriden programmatically below

let options = {
  'headers': { 
    'User-Agent': 'custom-script',
    'Authorization': 'Basic ' + auth,
    'Accept': 'application/vnd.github.v3+json'
  }
}

var values = [];

// This function is the entrypoint. Set this as the action to trigger
function getHead() {  
  var response = UrlFetchApp.fetch('https://api.github.com/repos/lacabra/repo1/git/ref/heads/master', options)
  const r = JSON.parse(response.getContentText());
  const head = r['object']['sha'];
  Logger.log('head is ' + head);
  createBranch(head);
}

function getValues() {
  var row = SpreadsheetApp.getActiveSpreadsheet().getLastRow();
  var values = SpreadsheetApp.getActiveSpreadsheet().getRange('A'+row+':U'+row).getValues();
  Logger.log(values[0]);
  return values[0];
}

function createBranch(head) { 
  values = getValues();
  branchName = values[1].replace(/ /g, "_");
  var myOptions = options;
  myOptions['method'] = 'post';
  myOptions['payload'] = JSON.stringify({
    "ref": "refs/heads/" + branchName,
    "sha": head
  });
  var response = UrlFetchApp.fetch('https://api.github.com/repos/lacabra/repo1/git/refs', myOptions)
  Logger.log('New branch ' + branchName + ' created successfully.');
  commitFile();
}

function commitFile(){
    
  const filename = values[1].toLowerCase().replace(/ /g, "-").replace(/,/g, "").replace(/"/g, "");
  const content = {
    'name': values[1],
    'description': values[3],
    'license': [
      {
        "spdx": values[5],
        "licenseURL": values[5]
      }
    ],
    'SDGs': values[6],
    'sectors': [],
    'type': [ 
      values[7] 
    ]
  }
   
  var encoded = Utilities.base64Encode(JSON.stringify(content, null, 2)+"\n");
  
  var myOptions = options;
  myOptions['method'] = 'put';
  myOptions['payload'] = JSON.stringify({
    'message': 'BLD: Add ' + values[1],
    'content': encoded,
    'branch': branchName
  });
  var response = UrlFetchApp.fetch('https://api.github.com/repos/lacabra/repo1/contents/nominees/' + filename + '.json', myOptions)
  Logger.log('File committed successfully.');
  createPR();
}

function createPR(){
  var myOptions = options;
  myOptions['method'] = 'post';
  myOptions['payload'] = JSON.stringify({
    'title': 'Add nominee: ' + values[1],
    'head': branchName,
    'base': 'master',
    'body': 'Automatic addition of new nominee submitted through online form'
  })
  var response = UrlFetchApp.fetch('https://api.github.com/repos/lacabra/repo1/pulls', myOptions);
  Logger.log('PR created successfully.');
}
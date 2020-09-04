const username = 'your_github_username';
const password = 'your_oauth_or_personal_token';

const githubOrg = 'unicef';
const githubRepo = 'publicgoods-candidates';

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

const SDGS = ['No Poverty',
              'Zero Hunger',
              'Good Health and Well-Being',
              'Quality Education',
              'Gender Equality',
              'Clean Water and Sanitation',
              'Affordable and Clean Energy',
              'Decent Work and Economic Growth',
              'Industry, Innovation and Infrastructure',
              'Reduced Inequalities',
              'Sustainable Cities and Communities',
              'Responsible Consumption and Production',
              'Climate Action',
              'Life Below Water',
              'Life On Land',
              'Peace, Justice and Strong Institutions',
              'Partnerships for the Goals']

// This function is the entrypoint. Set this as the action to trigger
function getHead() {  
  var response = UrlFetchApp.fetch('https://api.github.com/repos/' + githubOrg + '/' + githubRepo + '/git/ref/heads/master', options)
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
  branchName = values[2].replace(/ /g, "_");
  var myOptions = options;
  myOptions['method'] = 'post';
  myOptions['payload'] = JSON.stringify({
    "ref": "refs/heads/" + branchName,
    "sha": head
  });
  var response = UrlFetchApp.fetch('https://api.github.com/repos/' + githubOrg + '/' + githubRepo + '/git/refs', myOptions)
  Logger.log('New branch ' + branchName + ' created successfully.');
  commitFile();
}

function commitFile(){
    
  const filename = values[2].toLowerCase().replace(/ /g, "-").replace(/,/g, "").replace(/"/g, "");
  
  let sdgsArray = values[8].split(',');

  let sdgs = []

  sdgsArray.forEach(function(currentValue, index, arr) {
  let i = arr[index].trim().split(':')[0]
    if(Number(i)) {
      sdgs.push([Number(i), SDGS[i-1]]);
    }
  });
  
  let types = values[6].replace(/Open/g, '').replace(/Source/g, '').replace(/ /g, '').toLowerCase().split(',');

  const content = {
    'name': values[2],
    'description': values[3],
    'website': values[5],
    'license': [
      {
        "spdx": values[10].split(':')[0],
        "licenseURL": values[11]
      }
    ],
    'SDGs': sdgs,
    'SDGevidence': values[9],
    'sectors': [],
    'type': types,
    'repositoryURL': values[7],
    'organizations': [
      {
        'name': values[4],
        'org_type': 'owner'
      }
    ]
  }
  
  if(!values[6].includes('Software')){
    delete content['repositoryURL'];
  }
   
  var encoded = Utilities.base64Encode(JSON.stringify(content, null, 2)+"\n\n");
  
  var myOptions = options;
  myOptions['method'] = 'put';
  myOptions['payload'] = JSON.stringify({
    'message': 'BLD: Add ' + values[2],
    'content': encoded,
    'branch': branchName
  });
  var response = UrlFetchApp.fetch('https://api.github.com/repos/' + githubOrg + '/' + githubRepo + '/contents/nominees/' + filename + '.json', myOptions)
  Logger.log('File committed successfully.');
  createPR();
}

function createPR(){
  var myOptions = options;
  myOptions['method'] = 'post';
  myOptions['payload'] = JSON.stringify({
    'title': 'Add nominee: ' + values[2],
    'head': branchName,
    'base': 'master',
    'body': 'Automatic addition of a new nominee submitted through the online form available at https://digitalpublicgoods.net/submission'
  })
  var response = UrlFetchApp.fetch('https://api.github.com/repos/' + githubOrg + '/' + githubRepo + '/pulls', myOptions);
  Logger.log('PR created successfully.');
}

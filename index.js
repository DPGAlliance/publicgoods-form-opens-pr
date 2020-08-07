const btoa = require('btoa');
const request = require('request');

const branchName = 'newBranch';

object = {
  "name": "myName",
  "description": "this is a description"
}

options = {
  auth: {
    'user': 'your_github_username',
    'pass': 'your_oauth_or_personal_token'
  },
  headers: {
    'User-Agent': 'request',
    'Accept': 'application/vnd.github.v3+json'
  }
}

function getHead() {
  my_options = options;
  my_options['url'] = 'https://api.github.com/repos/lacabra/repo1/git/refs/heads'
  request(options, function (error, response, body) {
    if(error) { 
      console.error('error:', error); // Print the error if one occurred
    } else {
      console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
      console.log('body:', body); // Print the HTML for the Google homepage.
      response = JSON.parse(body);
      head = response[0]['object']['sha'];
      createBranch(head);
    }
  });
}

function createBranch(head) {
  my_options = options;
  my_options['url'] = 'https://api.github.com/repos/lacabra/repo1/git/refs';
  my_options['body'] = JSON.stringify({
    "ref": "refs/heads/" + branchName,
    "sha": head
  });

  request.post(options, function (error, response, body) {
    if(error) {
      console.error('error:', error); // Print the error if one occurred
    } else {
      console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
      console.log('body:', body); // Print the HTML for the Google homepage.

      commitFile();
    }
  });
}

function commitFile(){
  my_options = options;
  my_options['url'] = 'https://api.github.com/repos/lacabra/repo1/contents/nominees/myfile.json';
  my_options['body'] = JSON.stringify({
    'message': 'Commit message',
    'content': btoa(JSON.stringify(object, null, 2)+ "\n"),
    'branch': branchName
  })

  request.put(options, function (error, response, body) {
    if(error) {
      console.error('error:', error); // Print the error if one occurred
    } else {
      console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
      console.log('body:', body); // Print the HTML for the Google homepage.

      createPR();
    }
  });
}

function createPR(){
  my_options = options;
  my_options['url'] = 'https://api.github.com/repos/lacabra/repo1/pulls';
  my_options['body'] = JSON.stringify({
    'title': 'Add nominee: newObject',
    'head': branchName,
    'base': 'master',
    'body': 'Add new nominee submitted through Form'
  })

  request.post(options, function (error, response, body) {
    if(error) {
      console.error('error:', error); // Print the error if one occurred
    } else {
      console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
      console.log('body:', body); // Print the HTML for the Google homepage.

      response = JSON.parse(body);
      numPR = response['number'];

      assignPR(numPR);
    }
  });
}

function assignPR(numPR) {
  console.log('Num PR is ' + numPR)
  my_options = options;
  my_options['url'] = 'https://api.github.com/repos/lacabra/repo1/issues/' + numPR;
  my_options['body'] = JSON.stringify({
    'assignees': [
      'lacabra'
    ]
  })

  request.patch(options, function (error, response, body) {
    if(error) {
      console.error('error:', error); // Print the error if one occurred
    } else {
      console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
      console.log('body:', body); // Print the HTML for the Google homepage.
    }
  });
}

getHead();

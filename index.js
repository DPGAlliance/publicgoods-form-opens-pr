const btoa = require('btoa');
const request = require('request');
require('dotenv').config()


const username = process.env.USERNAME ? process.env.USERNAME : 'your_github_username';
const password = process.env.PASSWORD ? process.env.PASSWORD : 'your_oauth_or_personal_token'

const githubOrg = 'lacabra';
const githubRepo = 'repo1';

const branchName = 'newBranch';

const object = {
  "name": "myName",
  "description": "this is a description"
}

const options = {
  auth: {
    'user': username,
    'pass': password
  },
  headers: {
    'User-Agent': 'request',
    'Accept': 'application/vnd.github.v3+json'
  }
}

function getHead() {
  var my_options = JSON.parse(JSON.stringify(options));

  my_options['url'] = 'https://api.github.com/repos/' + githubOrg + '/' + githubRepo + '/git/refs/heads'
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
  var my_options = JSON.parse(JSON.stringify(options));
  my_options['url'] = 'https://api.github.com/repos/' + githubOrg + '/' + githubRepo + '/git/refs';
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
  var my_options = JSON.parse(JSON.stringify(options));
  my_options['url'] = 'https://api.github.com/repos/' + githubOrg + '/' + githubRepo + '/contents/nominees/myfiles.json';

  // Check if file exists first
  request.get(options, function (error, response, body) {
    if(error) {
      console.error('error:', error); // Print the error if one occurred
    } else {
      console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
      console.log('body:', body); // Print the HTML for the Google homepage.
      let r = JSON.parse(body);

      my_options['body'] = JSON.stringify({
        'message': 'Commit message new',
        'content': btoa(JSON.stringify(object, null, 2)+ "\n"),
        'branch': branchName,
        'sha': (response.statusCode == 200) ? r['sha'] : null
      })

      request.put(options, function (error, response, body) {
        if(error) {
          console.error('error:', error); // Print the error if one occurred
        } else {
          console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
          console.log('body:', body); // Print the HTML for the Google homepage.

          console.log(response.statusCode)

          if(response.statusCode==200 || response.statusCode==201 || response.statusCode==202) {
            createPR();
          }
        }
      });
    }
  });
}

function createPR(){
  var my_options = JSON.parse(JSON.stringify(options));
  my_options['url'] = 'https://api.github.com/repos/' + githubOrg + '/' + githubRepo + '/pulls';
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
  var my_options = JSON.parse(JSON.stringify(options));
  my_options['url'] = 'https://api.github.com/repos/' + githubOrg + '/' + githubRepo + '/issues/' + numPR;
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

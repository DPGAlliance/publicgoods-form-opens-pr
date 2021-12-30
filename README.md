# publicgoods-form-opens-pr
Online webform submission opens GitHub pull request

## Motivation

In order to streamline the nomination process for Digital Public Goods (DPGs), we want to have an online webform that prompts the user for a number of fields, and then packages those fields into a JSON-compliant file, and opens a Pull Request to the [DPGAlliance/publicgoods-candidates](https://github.com/DPGAlliance/publicgoods-candidates) repository for further review and merging.

Programmatically opening a pull request is a multi-step process that involves:
1. Get a the latest reference to the master branch
2. Create a new feature branch off that reference
3. Format the form data into JSON, put into a file and commit the file in the feature branch
4. Open the actual PR using the changes committed to that feature branch

Having analyzed some off-the-shelf alternatives, we concluded that none provided all the required functionality listed above, so we coded our own; which we document in this repo for future reference.

## Design

We are using Google Forms to build the webform, and storing all the responses in a related spreadsheet. We are then using the spreadsheet's *Script Editor* to use [Google Apps Script](https://developers.google.com/apps-script/) to write custom code that implements the functionality outlined above and opens the desired pull request, that code is included here as [code.gs](code.gs). 

We then define the trigger for this code:
`Edit` -> `Current project's triggers` -> `+ Add Trigger` with the following values:
* Choose which function to run: `getHead`
* Which runs at deployment: `Head`
* Select event source: `From spreadsheet`
* Select event type: `On form submit`

## Development

Given the relative "unfriendliness" of Google Apps Script, the code was initially developed using regular Node Javascript (included here as [index.js](index.js)) and later ported to Apps Script. The entrypoint function, as called on the last line is `getHead()`, which calls a cascade of callback that implement each of the steps in a different function.

If you want to try this code out:

1. Install the project dependencies:

  ```bash
  npm install
  ```
  
2. Run the actual code:

  ```bash
  node index.js
  ```

## Alternatives

The following alternatives were evaluated, but discarded:
* **Zapier** integration between Google Forms and GitHub. Even when they offer a Zap to open a pull request, this only covers the very last step of the ones outlined above, creating a pull request from a pre-existing feature branch. However, there is no support for committing files, which renders their offerings as fairly useless for our needs.
* **Automate.io** is similar to Zapier, but their GitHub integrations are even more limited: they allow to create issues, but not to create pull requests 🤷‍♂️
* **Survey Monkey** as an alternative to Google Forms. Unfortunately they don't seem to offer any possibility to run custom code, or to trigger any automated action upon the submission of a new entry.

## License

This repo is released under [The Unlicense](LICENSE):
```
A license with no conditions whatsoever which dedicates works to the public domain. 
Unlicensed works, modifications, and larger works may be distributed under different 
terms and without source code.
```

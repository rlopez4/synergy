import React from 'react';
import Reflux from 'reflux';

import FileStore from '../lib/FileStore';

const NO_FILE_LI = <li className="list-group-item list-group-item-warning">No Files</li>;

const FilesList = React.createClass({
  mixins: [Reflux.listenTo(FileStore, 'handleFilesChange')],
  getInitialState() {
    return {
      userFiles: [],
      otherFiles: []
    };
  },
  handleFilesChange(files) {
    let userFiles = [];
    let otherFiles = [];

    // catagorize the files
    files.forEach(file => {
      if (file.isUserFile) {
        userFiles.push(file);
      }
      else {
        otherFiles.push(file);
      }
    })

    this.setState({userFiles, otherFiles});
  },
  getUserFileItems() {
    if (!this.state.userFiles.length) {
      return NO_FILE_LI;
    }

    return this.state.userFiles.map(function(file, idx) {
      return (
        <li className="list-group-item" key={idx}>{file.fileName}</li>
      );
    })
  },
  getOtherFileItems() {
    if (!this.state.otherFiles.length) {
      return NO_FILE_LI;
    }

    return this.state.otherFiles.map(function(file, idx) {
      return (
        <li className="list-group-item" key={idx}>f{ile.fileName}</li>
      );
    })
  },
  render() {
    return (
      <section>
        <div className="card">
          <div className="card-block">
            <a data-toggle="collapse" href="#user-files" aria-expanded="true" aria-controls="user-files">
              <h4 className="card-title">Your Uploaded Files</h4>
            </a>
          </div>
          <ul id="user-files" className="user-files list-group list-group-flush collapse in">
            {this.getUserFileItems()}
          </ul>
        </div>
        <div className="card">
          <div className="card-block">
            <a data-toggle="collapse" href="#other-files" aria-expanded="true" aria-controls="other-files">
              <h4 className="card-title">Other Uploaded Files</h4>
            </a>
          </div>
          <ul id="other-files" className="other-files list-group list-group-flush collapse in">
            {this.getOtherFileItems()}
          </ul>
        </div>
      </section>
    );
  }
});

export default FilesList;
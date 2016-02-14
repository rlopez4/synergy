import React from 'react';
import Reflux from 'reflux';

import FileStore from '../lib/FileStore';

const NO_FILE_LI = <li className="list-group-item list-group-item-warning">No Files</li>;
const IMG_REGEX = (/\.(gif|jpg|jpeg|tiff|png)$/i);

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
  generateFileListItem(file, idx) {
    let fileSrc = `private/${file.fileName}`;
    let fileIsImg = IMG_REGEX.test(file.fileName);
    let imagePreview = null;
    let previewBtn = null;
    if (fileIsImg) {
      let imgId = `img-preview-${idx}`;

      previewBtn = (<a
                      className="btn btn-info btn-sm text"
                      data-toggle="collapse"
                      href={'#' + imgId}
                      aria-expanded="false"
                      aria-controls={imgId} >+</a>);

      imagePreview = (
        <div className="collapse" id={imgId}>
          <img src={fileSrc} className="img-fluid" alt={file.fileName} />
        </div>
      );
    }
    return (
      <li className="list-group-item" key={idx}>
        <strong>{file.fileName}&nbsp;</strong>
        {previewBtn}
        <span className="pull-xs-right">
          <a href={fileSrc} download>Download&nbsp;</a>
        </span>
        {imagePreview}
      </li>
    );
  },
  getFileListItems(files) {
    if (!files || !files.length) {
      return NO_FILE_LI;
    }

    return files.map(this.generateFileListItem);
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
            {this.getFileListItems(this.state.userFiles)}
          </ul>
        </div>
        <div className="card">
          <div className="card-block">
            <a data-toggle="collapse" href="#other-files" aria-expanded="true" aria-controls="other-files">
              <h4 className="card-title">Other Uploaded Files</h4>
            </a>
          </div>
          <ul id="other-files" className="other-files list-group list-group-flush collapse in">
            {this.getFileListItems(this.state.otherFiles)}
          </ul>
        </div>
      </section>
    );
  }
});

export default FilesList;
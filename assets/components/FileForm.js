import React from 'react';
import classNames from 'classnames';
import { isWebUri } from 'valid-url';
import mime from 'mime';
import Dropzone from 'react-dropzone';

const IMG_REGEX = (/\.(gif|jpg|jpeg|tiff|png)$/i);

const FileForm = React.createClass({
  getInitialState() {
    return {
      fileValue: '',
      fileError: '',
      fileNameValue: '',
      fileNameError: ''
    };
  },
  handleFileDrop(files) {
    if (files && files.length) {
      let file = files[0];

      this.setState({
        fileValue: file,
        fileError: ''
      });
    }
  },
  handleFileNameChange(e) {
    this.setState({
      fileNameValue: e.target.value
    });
  },
  handleSubmit(e) {
    e.preventDefault();
    let fileValue = this.state.fileValue;
    let fileNameVal = this.state.fileNameValue.trim();

    if (!fileValue) {
      this.setState({ fileError: 'File is required.' });
      return;
    }

    this.props.onSubmit({
      file: fileValue,
      fileName: fileNameVal
    });
  },
  clearForm() {
    this.setState(this.getInitialState());
  },
  render() {

    let fileError = null;
    let fileStyle = {
      'backgroundColor' : '#DDD',
      'color' : 'white',
      'padding' : '1em 0',
      'width' : '100%'
    };
    let filePreview = null;
    let fileNamePreview = null;

    let urlFieldsetClass = classNames('form-group', {
      'has-danger': !!this.state.fileError
    });

    if (this.state.fileError) {
      fileError = <p className="text-danger">{this.state.fileError}</p>
      fileStyle['borderColor'] = '#d9534f!important';
    }
    else if (this.state.fileValue) {
      let fileMime = mime.extension(this.state.fileValue.type);
      if (fileMime && IMG_REGEX.test('.' + fileMime)) {
        filePreview = <img src={this.state.fileValue.preview} className="img-fluid" alt="file preview" />;
      }

      fileNamePreview = <p>File: {this.state.fileValue.name}</p>
    }

    return (
      <form onSubmit={this.handleSubmit}>
        <fieldset className={urlFieldsetClass}>
          <label className="form-control-label" htmlFor="url">*File</label>
            <Dropzone className='col-xs-12' style={fileStyle} onDrop={this.handleFileDrop}>
              <div className="text-xs-center col-xs-12">
                {fileNamePreview || <p>File Dropzone</p>}
              </div>
            </Dropzone>
            {fileError}
            {filePreview}
        </fieldset>
        <fieldset className="form-group">
          <label className="form-control-label" htmlFor="fileName">File Name <small className="text-muted">(Please exclude the file extension)</small></label>
          <input
            type="text"
            className="form-control"
            id="fileName"
            placeholder="File Name"
            value={this.state.fileNameValue}
            onChange={this.handleFileNameChange}
            autoComplete="off" />
        </fieldset>
        <button type="submit" className="btn btn-primary">Submit</button>
      </form>
    );
  }
});

export default FileForm;
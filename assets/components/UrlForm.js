import React from 'react';
import classNames from 'classnames';
import {isWebUri} from 'valid-url';

const UrlForm = React.createClass({
  getInitialState() {
    return {
      urlValue: '',
      urlError: '',
      fileNameValue: '',
      fileNameError: ''
    };
  },
  handleUrlChange(e) {
    this.setState({
      urlValue: e.target.value
    });
  },
  handleFileNameChange(e) {
    this.setState({
      fileNameValue: e.target.value
    });
  },
  handleSubmit(e) {
    e.preventDefault();
    let urlVal = this.state.urlValue.trim();
    let fileNameVal = this.state.fileNameValue.trim();

    if (!urlVal) {
      this.setState({ urlError: 'Url is required.' });
      return;
    }
    else if (!isWebUri(urlVal)) {
      this.setState({ urlError: 'Invalid web url.' });
      return;
    }

    this.props.onSubmit({
      url: urlVal,
      fileName: fileNameVal
    });
  },
  clearForm() {
    this.setState(this.getInitialState());
  },
  render() {

    let urlError = null;
    let urlFieldsetClass = classNames('form-group', {
      'has-danger': !!this.state.urlError
    });

    let urlInputClass = classNames('form-control', {
      'form-control-danger': !!this.state.urlError
    });

    if (this.state.urlError) {
      urlError = <p className="text-danger">{this.state.urlError}</p>
    }

    return (
      <form onSubmit={this.handleSubmit}>
        <fieldset className={urlFieldsetClass}>
          <label className="form-control-label" htmlFor="url">*Url</label>
          <input
            type="text"
            className={urlInputClass}
            id="url"
            placeholder="Url"
            value={this.state.urlValue}
            onChange={this.handleUrlChange}
            autoComplete="off" />
            {urlError}
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

export default UrlForm;
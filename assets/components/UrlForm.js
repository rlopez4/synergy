import React from 'react';

const UrlForm = React.createClass({
  getInitialState() {
    return {
      url: {
        value: '',
        error: ''
      },
      fileName: {
        value: '',
        error: ''
      }
    };
  },
  handleUrlChange(e) {
    this.setState({
      url: {
        value: e.target.value
      }
    });
  },
  handleFileNameChange(e) {
    this.setState({
      fileName: {
        value: e.target.value
      }
    });
  },
  handleSubmit(e) {
    e.preventDefault();
    let urlVal = this.state.url.value.trim();
    let fileNameVal = this.state.fileName.value.trim();

    if (!urlVal) {
      console.log('need url');
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
    return (
      <form onSubmit={this.handleSubmit}>
        <fieldset className="form-group">
          <label htmlFor="url">Url</label>
          <input
            type="text"
            className="form-control"
            id="url"
            placeholder="Url"
            value={this.state.url.value}
            onChange={this.handleUrlChange}
            autoComplete="off" />
        </fieldset>
        <fieldset className="form-group">
          <label htmlFor="fileName">File Name <small className="text-muted">(Please exclude the file extension)</small></label>
          <input
            type="text"
            className="form-control"
            id="fileName"
            placeholder="File Name"
            value={this.state.fileName.value}
            onChange={this.handleFileNameChange}
            autoComplete="off" />
        </fieldset>
        <button type="submit" className="btn btn-primary">Submit</button>
      </form>
    );
  }
});

export default UrlForm;
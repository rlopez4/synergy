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
      // add errors
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
            onChange={this.handleUrlChange} />
        </fieldset>
        <fieldset className="form-group">
          <label htmlFor="fileName">File Name</label>
          <input
            type="text"
            className="form-control"
            id="fileName"
            placeholder="File Name"
            value={this.state.fileName.value}
            onChange={this.handleFileNameChange} />
        </fieldset>
        <button type="submit" className="btn btn-primary">Submit</button>
      </form>
    );
  }
});

export default UrlForm;
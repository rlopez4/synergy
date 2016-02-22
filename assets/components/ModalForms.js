import React from 'react';
import UrlForm from './UrlForm';
import FileForm from './FileForm';
import FileActions from '../lib/FileActions';

const ModalForms = React.createClass({
  getInitialState() {
    return {
      error: ''
    };
  },
  componentDidMount() {
    $('#synergy-modal').on('hidden.bs.modal', function() {
      this.refs.urlForm.clearForm();
      this.refs.fileForm.clearForm();
      this.setState({error: ''});
    }.bind(this));
  },
  componentWillUnmount() {
    $('#synergy-modal').off('hidden.bs.modal');
  },
  handleUrlFormSubmit(data) {
    $.post('/urlFile', data)
      .done((result) =>{
        if (result.error && result.error.message) {
          this.setState({error: result.error.message });
        }
        else {
          FileActions.addItem(result);
          this.setState({ error: '' });
          $('#synergy-modal').modal('hide');
        }
      })
      .fail((e) => {
        this.setState({ error: 'Something unexpected went wrong!' });
      });
  },
  handleFileFormSubmit(data) {
    let formData = new FormData();

    formData.append('fileName', data.fileName);
    formData.append('file', data.file, data.file.name);

    $.ajax({
      url: '/userFile',
      type: 'POST',
      data: formData,
      cache: false,
      dataType: 'json',
      processData: false,
      contentType: false,
      success: (result) => {
        if (result.error && result.error.message) {
          this.setState({ error: result.error.message });
        }
        else {
          FileActions.addItem(result);
          this.setState({ error: '' });
          $('#synergy-modal').modal('hide');
        }
      },
      error: (jqXHR, textStatus, errorThrown) => {
        this.setState({ error: 'Something unexpected went wrong!' });
      }
    });
  },
  render() {
    let errorMessage = null;

    if (this.state.error) {
      errorMessage = <div className="alert alert-danger" role="alert">{this.state.error}</div>;
    }

    return (
      <section className="modal-forms">
        {errorMessage}
        <ul className="nav nav-tabs" role="tablist">
          <li className="nav-item">
            <a className="nav-link active" data-toggle="tab" href="#url-form-tab" role="tab">Url Form</a>
          </li>
          <li className="nav-item">
            <a className="nav-link" data-toggle="tab" href="#file-upload-tab" role="tab">File Upload</a>
          </li>
        </ul>

        <div className="tab-content">
          <div className="tab-pane active" id="url-form-tab" role="tabpanel">
            <UrlForm ref="urlForm" onSubmit={this.handleUrlFormSubmit} />
          </div>
          <div className="tab-pane" id="file-upload-tab" role="tabpanel">
            <FileForm ref="fileForm" onSubmit={this.handleFileFormSubmit} />
          </div>
        </div>
      </section>
    );
  }
});

export default ModalForms;
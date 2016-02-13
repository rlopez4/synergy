import React from 'react';
import UrlForm from './UrlForm';
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
      this.setState({error: ''});
    }.bind(this));
  },
  componentWillUnmount() {
    $('#synergy-modal').off('hidden.bs.modal');
  },
  handleFormSubmit(data) {
    $.post('/file', data)
      .done(function(result) {
        if (result.error) {
          this.setState({error: result.error.message });
        }
        else {
          FileActions.addItem(result);
          this.setState({ error: '' });
          $('#synergy-modal').modal('hide');
        }
      }.bind(this))
      .fail(function(e) {
        console.log(e);
        this.setState({ error: 'Something unexpected went wrong!' });
      }.bind(this));
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
            <UrlForm ref="urlForm" onSubmit={this.handleFormSubmit} />
          </div>
          <div className="tab-pane" id="file-upload-tab" role="tabpanel">
            <p>//TODO</p>
          </div>
        </div>
      </section>
    );
  }
});

export default ModalForms;
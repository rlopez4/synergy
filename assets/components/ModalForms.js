import React from 'react';
import UrlForm from './UrlForm';

const ModalForms = React.createClass({
  componentDidMount() {
    $('#synergy-modal').on('hidden.bs.modal', $.proxy(function() {
      this.refs.urlForm.clearForm();
    }, this));
  },
  componentWillUnmount() {
    $('#synergy-modal').off('hidden.bs.modal');
  },
  handleFormSubmit(data) {
    $.post('/file', data)
      .done(function(result) {
        console.log('sucess', result);
      }.bind(this))
      .fail(function(e) {
        console.log('error', e);
      }.bind(this));
  },
  render() {
    return (
      <section className="modal-forms">
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
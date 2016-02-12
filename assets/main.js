import React from 'react';
import ReactDOM from 'react-dom';
import ModalForms from './components/ModalForms';
const $ = window.jQuery;

$('document').ready(function() {
  ReactDOM.render(<ModalForms />, document.getElementById('modal-body'));

  $('#add-file-btn').on('click', function() {
    $('#synergy-modal').modal('show');
  });
});
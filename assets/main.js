import React from 'react';
import ReactDOM from 'react-dom';
import ModalForms from './components/ModalForms';
import FilesList from './components/FilesList';

const $ = window.jQuery;

$('document').ready(function() {
  ReactDOM.render(<ModalForms />, document.getElementById('modal-body'));
  ReactDOM.render(<FilesList />, document.getElementById('files-list-container'));

  $('#add-file-btn').on('click', function() {
    $('#synergy-modal').modal('show');
  });
});
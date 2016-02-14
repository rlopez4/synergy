import React from 'react';
import ReactDOM from 'react-dom';
import ModalForms from './components/ModalForms';
import FilesList from './components/FilesList';

const $ = window.jQuery;

$('document').ready(function() {
  let modalMountPoint = document.getElementById('modal-body');
  let filesListMountPoint = document.getElementById('files-list-container');

  if (!!modalMountPoint) {
    ReactDOM.render(<ModalForms />, modalMountPoint);
  }

  if (!!filesListMountPoint) {
    ReactDOM.render(<FilesList />, filesListMountPoint);
  }

  $('#add-file-btn').on('click', function() {
    $('#synergy-modal').modal('show');
  });
});
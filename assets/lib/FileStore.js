import Reflux from 'reflux';
import FileActions from './FileActions';

const $ = window.jQuery;

const FileStore = Reflux.createStore({
  listenables: [FileActions],
  fileList: [],
  sourceUrl: '/files',
  init() {
    this.fethList();
  },
  fethList() {
    $.get(this.sourceUrl)
      .done(function(data) {
        this.fileList = data.files;
        this.trigger(this.fileList);
      }.bind(this));
  },
  addItem(item) {
    this.fileList.push(item);
    this.trigger(this.fileList);
  },
  removeItem() {
    // TODO?
  }
});

export default FileStore;
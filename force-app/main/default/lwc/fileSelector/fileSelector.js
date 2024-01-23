import { LightningElement, api, track, wire } from 'lwc';
import getFiles from '@salesforce/apex/NotifyActivityCtrl.getFiles';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class FileSelector extends LightningElement {
    @api recordId;
    @track files;
    @track selectedFilter = 'my_files';
    error;

    get isFileListShown() {
        return this.files.length;
    }

    get isAddButtonDisabled() {
        return !this.files.some(el => {
            return el.isChecked == true;
        });
    }

    @wire(getFiles, {filterType: '$selectedFilter', recordId: '$recordId'})
    fileResponse({data, error}) {
        this.files = [];

        if(error) {
            this.error = error;
        }

        if(data) {
            this.files = data.map(el => {
                return {
                    ...el,
                    thumbnail: 
                        "/sfc/servlet.shepherd/version/renditionDownload?rendition=THUMB720BY480&versionId=" +
                        el.versionId +
                        "&operationContext=CHATTER&contentId=" +
                        el.contentId,
                    isChecked: false
                };
            });
        }
    }

    handleUploadFinished(e) {
        const uploadedFiles = e.detail.files;
        this.showToast('Success', uploadedFiles.length + 'item(s) has been uploaded.', 'success', 'dissmissible');
        this.fireOnSelectEvent(uploadedFiles);
    }

    handleNavSelect(e) {
        this.selectedFilter = e.detail.name;
    }

    handleItemClick(e) {
        const contentId = e.currentTarget.dataset.contentId;
        this.toggleItem(contentId);
    }

    handleCheckboxClicked(e) {
        this.toggleItem(e.target.name);
        e.stopPropagation();
    }

    handleAddButtonClicked(e) {
        const resultFiles = [];
        this.files.forEach(el => {
            if(el.isChecked) {
                resultFiles.push({
                    contentVersionId: el.contentId,
                    documentId: el.documentId,
                    name: el.title
                });
            }
        });
        // show toast
        this.showToast('Success', resultFiles.length + 'item(s) has been selected.', 'success', 'dissmissible');
        // notify parent that new files are selected
        this.fireOnSelectEvent(resultFiles);

    }

    handleCancelkButtonClicked(e) {
        this.fireOnSelectEvent([]);
    }

    fireOnSelectEvent(files) {
        this.dispatchEvent(new CustomEvent('fileselected', {
            detail: files
        }));
        // reset the state
        this.files = [];
    }

    toggleItem(contentId) {
        const tempFiles = this.files;
        this.files = tempFiles.map(el => {
            if(el.contentId === contentId) {
                return {
                    ...el, 
                    isChecked: !el.isChecked
                };
            }
            return el;
        })
    }

    showToast(title, message, variant, mode) {
        const event = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant,
            mode: mode
        });
        this.dispatchEvent(event);
    }
}
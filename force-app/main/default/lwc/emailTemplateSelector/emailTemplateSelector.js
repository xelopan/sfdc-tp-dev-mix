import { LightningElement, api, track, wire } from 'lwc';
import getEmailTemplates from '@salesforce/apex/NotifyActivityCtrl.getEmailTemplates';

export default class EmailTemplateSelector extends LightningElement {
    @api defaultFolder = '';
    @track emailTemplates = [];
    @track emailTemplateFolders = [];
    @track selectedFolder;
    @track selectedTemplate;
    compiledBody;
    compiledSubject;

    error;

    @wire(getEmailTemplates)
    emailTemplateResponse({data, error}) {
        if(error) {
            this.error = error;
        }

        if(data) {
            this.emailTemplateFolders = data;
        }
    }

    handleEmailFolderSelect(e) {
        this.emailTemplates = (this.emailTemplateFolders.find(el => el.folderId === e.target.value)).emailtemplatelist;
    }

    handleEmailTemplateSelect(e) {
        console.log(e.target.value);
        this.dispatchEvent(new CustomEvent('templateselected', { detail: e.target.value}));
    }
}
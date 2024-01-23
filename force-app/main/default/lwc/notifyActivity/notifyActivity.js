import { LightningElement, api, track } from 'lwc';
import renderTemplate from '@salesforce/apex/NotifyActivityCtrl.renderTemplate';
import sendEmail from '@salesforce/apex/NotifyActivityCtrl.sendEmail';

export default class NotifyActivity extends LightningElement {
    @api recordId;
    toAddresses = [];
    ccAddresses = [];
    bccAddresses = [];
    @track emailSubject;
    @track emailBody;

    @track selectedFiles = [];

    get isFileListShown() {
        return this.selectedFiles.length;
    }

    // ui flags
    isMainFormShown = true;
    isAttachmentFormShown;
    isTemplateFormShown;
    isPreviewShown;
    @track areButtonsDisabled = false;
    // ui element temp
    // attachmentButton;
    // templateButton;
    // previewButton;

    // renderedCallback() {
    //     this.attachmentButton = this.template.querySelector('[data-id="attachmentButton"]');
    //     this.templateButton = this.template.querySelector('[data-id="templateButton"]');
    //     this.previewButton = this.template.querySelector('[data-id="previewButton"]');
    // }

    handleToAddressesChanged(e) {
        this.toAddresses = e.detail;
        console.log('handleToAddressesChanged()');
        console.log(e.detail);
    }

    handleCcAddressesChanged(e) {
        this.ccAddresses = e.detail;
        console.log('handleCcAddressesChanged()');
        console.log(e.detail);
    }

    handleBccAddressesChanged(e) {
        this.bccAddresses = e.detail;
        console.log('handleBccAddressesChanged()');
        console.log(e.detail);
    }

    handleTemplateSelected(e) {
        // this.emailSubject = e.detail.subject;
        // this.emailBody = e.detail.body;
        // render the template
        renderTemplate({
            templateId: e.detail,
            recordId: this.recordId
        })
        .then(result => {
            console.log('result: ' + result);
            console.log('subject: ' + result.subject);
            console.log('body: ' + result.body);

            this.emailSubject = result.subject;
            this.emailBody = result.body;
        })
        .catch(error => {
            console.log('error');
        });
    }

    handleEmailSubjectChanged(e) {
        this.emailSubject = e.target.value;
    }

    handleEmailBodyChanged(e) {
        this.emailBody = e.target.value;
    }

    handleAttachmentButtonClicked(e) {
        this.areButtonsDisabled = true;
        this.isAttachmentFormShown = true;
        this.isMainFormShown = false;
    }

    handleTemplateButtonClicked(e) {
        this.areButtonsDisabled = true;
        this.isTemplateFormShown = true;
        // this.isMainFormShown = false;
    }

    handlePreviewButtonClicked(e) {
        this.areButtonsDisabled = true;
        this.isPreviewShown = true;
        this.isMainFormShown = false;
    }

    handleFileSelected(e) {
        console.log(e.detail);
        const newFiles = e.detail;
        this.selectedFiles = [...this.selectedFiles, ...newFiles];
        this.isAttachmentFormShown = false;
        this.isMainFormShown = true;
        this.areButtonsDisabled = false;
    }

    handleSendButonClicked(e) {
        sendEmail({
            toAddress: this.toAddresses,
            ccAddress: this.ccAddresses,
            bccAddress: this.bccAddresses,
            subject: this.emailSubject,
            body: this.emailBody
        })
            .then(result => {
                console.log('success send email');
                console.log('result: ' + result);
            })
            .catch(error => {
                console.log('error send email');
                console.log('error: ' + error);
            });
        // TODO close the dialog
    }

    handleCancelkButtonClicked(e) {
        // TODO close the dialog
    }
}
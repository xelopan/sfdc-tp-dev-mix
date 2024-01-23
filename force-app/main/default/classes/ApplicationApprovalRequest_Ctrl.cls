public without sharing class ApplicationApprovalRequest_Ctrl {
    public Application__c cRecord {get;set;}
    public ProcessInstanceWorkitem workItem {get;set;}
    public String approverComments {get;set;}
    public Id cRecId {
        get;
        set {
            cRecord = new Application__c(Id=value);
            // get the ProcessInstanceWorkItem record that triggered this email
            List<ProcessInstanceWorkitem> workItemLst = [
                SELECT Id, OriginalActorId, ProcessInstanceId
                FROM ProcessInstanceWorkitem
                WHERE processInstance.TargetObjectId=:value];
            System.debug('workItemLst: ' + workItemLst);
            if(workItemLst.size() > 0) {
                this.workItem = workItemLst[0];
            }

            // also set the Approval Comments field in the parent Application record
            Application__c app = [
                SELECT Id,Approver_Comments__c,(
                    SELECT Id,IsPending,ProcessInstanceId, TargetObjectId,StepStatus,
                        OriginalActorId,ActorId,RemindersSent,Comments,
                        ProcessNode.Name,
                        IsDeleted,CreatedDate, CreatedById, SystemModstamp 
                    FROM ProcessSteps 
                    WHERE StepStatus IN ('Approved', 'Rejected') 
                        AND ProcessInstanceId = :this.workItem.ProcessInstanceId
                    ORDER BY CreatedDate DESC) 
                FROM Application__c WHERE Id = :value];
            System.debug('processSteps for ' + app.Id + ': ' + app.ProcessSteps);
            if(app.ProcessSteps.size() > 0) {
                String tempComments = '';
                // if there's a history, begin constructing the Approver Comment field's content
                for(ProcessInstanceHistory hist: app.ProcessSteps) {
                    tempComments += 
                        hist.ProcessNode.Name + ' - ' + hist.SystemModstamp.format() + ' - ' + hist.StepStatus + '\r\n'
                        + (hist.Comments != null ? hist.Comments : '(No Comment)') + '\r\n\r\n';
                }

                this.approverComments =  tempComments;
                this.cRecord.Approver_Comments__c = tempComments;
                System.debug('tempComments: ' + tempComments);

                updateApprovalComments(value, tempComments);
            }
        }
    }

    // TODO remove if not used anymore
    // return the flag for whether the current approver is the final approver.
    public Boolean isFinalApprover {
        get {
            System.debug('workItem: ' + workItem);
            return workItem != null ? workItem.OriginalActorId == Label.Approver_Id : false;
        }
    }

    public String urlStr {  
        get {  
            return generateApprovalURL();  
        }
    }
    
    // To generate approval URL based on previously set workItem property
    private String generateApprovalURL() {
        String url='';  
            
        if(workItem != null) {
            url='https://'+ System.URL.getSalesforceBaseUrl().getHost() +
            '/p/process/ProcessInstanceWorkitemWizardStageManager?id=' + this.workItem.Id;
        }

        return url;
    }

    // Future method to update the Approver Comment field of the parent record
    @Future
    private static void updateApprovalComments(String appId, String comments) {
        if(!String.isBlank(comments)) {
            Application__c appToUpdate = new Application__c(
                Id=appId,
                Approver_Comments__c=comments
            );

            update appToUpdate;
        }
    }
}

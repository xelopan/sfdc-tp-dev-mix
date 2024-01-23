public without sharing class Application_TrgHdlr {
    public static void handleBeforeUpdate(Map<Id,Application__c> newMap, Map<Id,Application__c> oldMap) {
        Set<Id> appIds = new Set<Id>();
        for(Application__c app: newMap.values()) {
            Application__c old = oldMap.get(app.Id);
            if(app.Last_Approval_Activity_Date__c != old.Last_Approval_Activity_Date__c 
                    && app.Last_Approval_Activity_Date__c != null) {
                appIds.add(app.Id);
            }
        }
        System.debug('appIds: ' + appIds);

        for(Application__c app: [
                SELECT Id,(
                    SELECT Id,IsPending,ProcessInstanceId, TargetObjectId,StepStatus,
                        OriginalActorId,ActorId,RemindersSent,Comments,
                        ProcessNode.Name,
                        IsDeleted,CreatedDate, CreatedById, SystemModstamp 
                    FROM ProcessSteps 
                    WHERE StepStatus IN ('Approved', 'Rejected')
                    ORDER BY CreatedDate DESC) 
                FROM Application__c WHERE Id IN :appIds]) {
            System.debug('processSteps for ' + app.Id + ': ' + app.ProcessSteps);
            if(app.ProcessSteps.size() > 0) {
                String tempComments = '';
                
                for(ProcessInstanceHistory hist: app.ProcessSteps) {
                    tempComments += 
                        hist.ProcessNode.Name + ' - ' + hist.SystemModstamp.format() + ' - ' + hist.StepStatus + '\n'
                        + (hist.Comments != null ? hist.Comments : '(No Comment)') + '\n\n';
                }

                newMap.get(app.Id).Approver_Comments__c = tempComments;
            }
        }
    }
}

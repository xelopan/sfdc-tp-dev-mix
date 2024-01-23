public with sharing class TaskListView_Ctrl {
    public TaskListView_Ctrl() {
        
    }

    @AuraEnabled
    public static List<ListView> getListViews(){
        try {
            return [
                    SELECT Id, Name, DeveloperName, NamespacePrefix, SobjectType, 
                        IsSoqlCompatible, CreatedDate, CreatedBy.Name, LastModifiedDate, 
                        LastModifiedBy.Name, LastViewedDate, LastReferencedDate 
                    FROM ListView 
                    WHERE SobjectType = 'Task'];
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
}
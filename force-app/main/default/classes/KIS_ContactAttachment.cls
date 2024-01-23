public with sharing class KIS_ContactAttachment {
    
    @AuraEnabled
    public static List<ContentVersion> getAttachments(String conId){
        
        List<ContentDocumentLink> CDLs = [Select ContentDocumentId 
                                          from ContentDocumentLink 
                                          where LinkedEntityId = : conId];
        
        System.debug('CDLs::::'+CDLs);
        if(CDLs != NULL && CDLs.size() > 0){
        Set<Id> CDIdList = new Set<Id>();
        for (ContentDocumentLink nextCDL : CDLs) {
            CDIdList.add(nextCDL.ContentDocumentId); 
        }
        System.debug('CDIdList::::'+CDIdList);        
        
        List<ContentDocument> entries = [SELECT Id, Title, FileType FROM ContentDocument WHERE ContentDocument.Id IN :CDIdList];
        System.debug('entries::::'+entries);
            
        List<ContentVersion> CVmainList = new List<ContentVersion>();  
        List<ContentVersion> CVList = [SELECT Id, ContentDocumentId, isLatest, Title 
                                       FROM ContentVersion 
                                       WHERE ContentDocumentId = :CDIdList AND isLatest = true];

            return CVList;
        }
        else{
            List<ContentVersion> CV = new List<ContentVersion>();
            CV = NULL;
            return CV;
        }
    }
    
    
    //Attachment delete method
    @AuraEnabled
    public static boolean deleteAttachments(Id attachId){
        
        if(attachId != NULL){
            ContentDocument file = [Select Id from ContentDocument where Id = :attachId];
            delete file;
            return true;
        }
        else{
            return false;
        }
    }
}
/**
 * Class to provide necessary methods for the notifyActivity Lightning Components 
 * and its child components. It also a controller for a Visualforce Component:
 * WhoRelationList
 *
 * History:
 * Date(dd/mm/yyyy)     Developer           Comments
 * 30/12/2021           Abi (VISEO)         Created
 */
public with sharing class NotifyActivityCtrl {
    public Map<String,Integer> indexMap {set;get;}
    public Integer lastIndex {set;get;}
    public String activityId {set;get;}

    public NotifyActivityCtrl() {
        this.indexMap = new Map<String,Integer>();
        this.lastIndex = 0;
    }

    /**
     * Used by 
     */
    public List<String> getParticipantNames() {
        String type = (Id.valueOf(this.activityId)).getSobjectType().getDescribe().getName();
        List<String> results = new List<String>();
        this.lastIndex = 0;

        if(type == 'Task') {
            for(TaskWhoRelation twr: [
                    SELECT RelationId, Relation.FirstName, Relation.LastName 
                    FROM TaskWhoRelation WHERE TaskId = :this.activityId]) {
                this.lastIndex++;
                String participantName = twr.Relation.FirstName + ' ' + twr.Relation.LastName;
                indexMap.put(participantName, this.lastIndex);
                results.add(participantName);
            }
        }

        if(type == 'Event') {
            for(EventWhoRelation ewr: [
                    SELECT RelationId, Relation.FirstName, Relation.LastName 
                    FROM EventWhoRelation WHERE EventId = :this.activityId]) {
                this.lastIndex++;
                String participantName = ewr.Relation.FirstName + ' ' + ewr.Relation.LastName;
                indexMap.put(participantName, this.lastIndex);
                results.add(participantName);
            }
        }

        return results;
    }
    /**
     * Try to find sobject records based on the supplied searchTerm. Will try to get in either 
     * Contact and/or User objects based on getContact and getUser parameters.
     */
    @AuraEnabled
    public static List<MatchedItemWrapper> searchEmailAddress(String searchTerm, Boolean getContact, Boolean getUser, Boolean getAccount){
        System.debug('searchTerm: ' + searchTerm);
        try {
            List<MatchedItemWrapper> results = new List<MatchedItemWrapper>();
            // setup the RETURNING part of the SOSL query by evaluation getContact and getUser arguments.
            List<String> returningFields = new List<String>();
            Set<String> objectNames = new Set<String>();
            if(getContact) {
                returningFields.add('Contact (Id, FirstName, LastName, Email)');
                objectNames.add('Contact');
            }
            if(getUser) {
                returningFields.add('User (Id, Username, FirstName, LastName, Email WHERE IsActive = true)');
                objectNames.add('User');
            }

            if(returningFields.size() > 0) {
                String soslQuery = 'FIND \'' + String.escapeSingleQuotes(searchTerm) + '\' IN ALL FIELDS RETURNING ';
                for(Integer i = 0; i < returningFields.size(); i++) {
                    soslQuery += returningFields[i];
                    if(i != returningFields.size() - 1) {
                        soslQuery += ', ';
                    }
                }

                Search.SearchResults searchResults = Search.find(soslQuery);
                for(String objName: objectNames) {
                    List<Search.SearchResult> objList = searchResults.get(objName);
                    for (Search.SearchResult searchResult : objList) {
                        SObject sObj = searchResult.getSObject();
                        MatchedItemWrapper wrap = new MatchedItemWrapper();
                        wrap.type = objName;
                        wrap.Id = (String)sObj.Id;
                        wrap.Name = (String)sObj.get('FirstName') + ' ' + (String)sObj.get('LastName');
                        wrap.Email = (String)sObj.get('Email');

                        results.add(wrap);
                    }
                }
            }

            return results;
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    @AuraEnabled(cacheable=true)
    public static List<FileWrapper> getFiles(String filterType, String recordId){
        List<FileWrapper> resultList = new List<FileWrapper>();
        try {
            String query = '';
            String whereClause = '';
            switch on filterType {
                when 'my_files'  {
                    for(ContentVersion cv: [
                            SELECT Id, Title, ContentDocumentId, FileType, ContentSize, FileExtension, 
                                VersionNumber, CreatedDate, FirstPublishLocationId 
                            FROM ContentVersion 
                            WHERE OwnerId = :UserInfo.getUserId()
                            ORDER BY CreatedDate DESC]) {
                        FileWrapper wrap = new FileWrapper();
                        wrap.contentId = cv.ContentDocumentId;
                        wrap.versionId = cv.Id;
                        wrap.title = cv.Title;
                        wrap.fileExtension = cv.FileExtension;
                        wrap.fileType = cv.FileType;
                        wrap.fileSize = cv.ContentSize;
                        resultList.add(wrap);
                    }
                    // whereClause = 'OwnerId = \'' + UserInfo.getUserId() + '\'';
                }
                when 'related_files' {
                    for(ContentDocumentLink cdl: [
                            SELECT LinkedEntityId, ContentDocumentId, ContentDocument.Title, 
                                ContentDocument.ContentSize, ContentDocument.LatestPublishedVersionId, 
                                ContentDocument.FileType, ContentDocument.FileExtension
                            FROM ContentDocumentLink
                            WHERE LinkedEntityId = :recordId]) {
                        FileWrapper wrap = new FileWrapper();
                        wrap.contentId = cdl.ContentDocumentId;
                        wrap.versionId = cdl.ContentDocument.LatestPublishedVersionId;
                        wrap.title = cdl.ContentDocument.Title;
                        wrap.fileExtension = cdl.ContentDocument.FileExtension;
                        wrap.fileType = cdl.ContentDocument.FileType;
                        wrap.fileSize = cdl.ContentDocument.ContentSize;
                        resultList.add(wrap);
                    }
                    // whereClause = 'FirstPublishLocationId = \'' + recordId + '\'';
                }
            }
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }

        return resultList;
    }

    @AuraEnabled(cacheable=true)
    public static list<EmailTemplateWrapper> getEmailTemplates(){
        list<emailTemplateWrapper> emailTemplateWrapperlist = new list<emailTemplateWrapper>();
        map<String,emailTemplateWrapper> folderIdVsTemplateMap = new map<String,emailTemplateWrapper>();

        for(sobject emailtemp : [
                SELECT Id, FolderId, HtmlValue, FolderName, isActive, Name 
                FROM EmailTemplate 
                WHERE isActive= true]){ 
            if( folderIdVsTemplateMap.containskey( String.valueof(emailtemp.get('FolderId'))) ){
                EmailTemplates template = new EmailTemplates();
                template.emailTemplateId = String.valueOf(emailtemp.get('Id'));
                template.emailTemplatename = String.valueOf(emailtemp.get('Name'));
                folderIdVsTemplateMap.get( String.valueof(emailtemp.get('FolderId')) ).emailtemplatelist.add( template );
                
            }else{
                EmailTemplateWrapper tempWrap = new EmailTemplateWrapper();
                tempWrap.folderId = String.valueOf(emailtemp.get('FolderId'));
                tempWrap.folderName = String.valueOf(emailtemp.get('FolderName'));
                
                EmailTemplates template = new EmailTemplates();
                template.emailTemplateId = String.valueOf(emailtemp.get('Id'));
                template.emailTemplatename = String.valueOf(emailtemp.get('Name'));
                tempWrap.emailtemplatelist = new list<EmailTemplates>{ template };
                folderIdVsTemplateMap.put( String.valueof(emailtemp.get('FolderId'))  , tempWrap );
            }   
        }
        
        System.debug('folderIdVsTemplateMap: ' + folderIdVsTemplateMap);
        if( !folderIdVsTemplateMap.isEmpty() ){
            emailTemplateWrapperlist.addAll( folderIdVsTemplateMap.values() );
            
            return emailTemplateWrapperlist;
        }
        return null;
    }

    @AuraEnabled
    public static EmailWrapper renderTemplate(String templateId, String recordId){
        System.debug('templateId: ' + templateId);
        System.debug('recordId: ' + recordId);
        try {
            Messaging.SingleEmailMessage mail = Messaging.renderStoredEmailTemplate(templateId, null, recordId);
            EmailWrapper wrap = new EmailWrapper();
            wrap.subject = mail.getSubject();
            wrap.body = !String.isBlank(mail.getHtmlBody()) ? mail.getHtmlBody() : mail.getPlainTextBody();

            System.debug('htmlBody: ' + mail.getHtmlBody());
            System.debug('plainTextBody: ' + mail.getPlainTextBody());

            return wrap;
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    @AuraEnabled
    public static List<String> sendEmail(List<String> toAddress, List<String> ccAddress, List<String> bccAddress, String subject, String body) {
        try {
            List<String> errList = new List<String>();
            Messaging.SingleEmailMessage mail = new Messaging.SingleEmailMessage();
            mail.setToAddresses(toAddress);
            if(ccAddress.size() > 0) {
                mail.setCcAddresses(ccAddress);
            }
            if(bccAddress.size() > 0) {
                mail.setBccAddresses(bccAddress);
            }
            mail.setSubject(subject);
            mail.setSenderDisplayName('No Reply');
            mail.setHtmlBody(body);
            mail.setPlainTextBody(body);

            for(Messaging.SendEmailResult ser: Messaging.sendEmail(new List<Messaging.SingleEmailMessage> {mail})) {
                System.debug(ser.isSuccess());
                if(!ser.isSuccess()) {
                    for(Messaging.SendEmailError see: ser.errors) {
                        errList.add(see.message);
                    }
                }
            }

            return errList;
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
    
    public class EmailTemplateWrapper{
        
        @AuraEnabled 
        public String folderName{get;set;}
        
        @AuraEnabled 
        public String folderId{get;set;}
        
        @AuraEnabled
        public list<emailTemplates> emailtemplatelist{get;set;}
        
    }
    
    public class EmailTemplates{
        
        @AuraEnabled 
        public String emailTemplateId{get;set;}
        
        @AuraEnabled 
        public String emailTemplateName{get;set;}
    }  

    public class EmailWrapper {
        @AuraEnabled 
        public String body{get;set;}
        
        @AuraEnabled 
        public String subject{get;set;}
    }

    public class MatchedItemWrapper {
        @AuraEnabled
        public String type {set;get;}
        @AuraEnabled
        public String Id {set;get;}
        @AuraEnabled
        public String Name {set;get;}
        @AuraEnabled
        public String Email {set;get;}
    }

    public class FileWrapper {
        @AuraEnabled
        public String contentId {set;get;}
        @AuraEnabled
        public String versionId {set;get;}
        @AuraEnabled
        public String title {set;get;}
        @AuraEnabled
        public String fileType {set;get;}
        @AuraEnabled
        public Integer fileSize {set;get;}
        @AuraEnabled
        public String fileExtension {set;get;}
    }
}
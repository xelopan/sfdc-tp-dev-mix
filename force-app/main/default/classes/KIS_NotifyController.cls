public with sharing class KIS_NotifyController {
    
    
    @AuraEnabled
    public static List<User> getContactOwners(String recId){
        
        Contact con = [Select Id, Name, Email, OwnerId, CreatedById, LastModifiedById from Contact where Id =:recId];
        system.debug('con:::'+con);
        String OwnerId = con.OwnerId;

        User owner = [Select Id, Name from User where Id =: OwnerId];
        List<User> userList = new List<User>();
        userList.add(owner);
        system.debug('owner:::'+owner);
        system.debug('userList:::'+userList);
        return userList;
    }
    
    @AuraEnabled
    public static void sendEmailApex(List<String> toAddress, List<String> ccAddress, String subject, String body, List<String> files) {
        /*List<Id> ids = new List<Id>();
        ids.add('0687F000008zGL5QAM');*/
        
        Messaging.reserveSingleEmailCapacity(1);
        try{
        messaging.SingleEmailMessage mail = new messaging.SingleEmailMessage();
        
        //toAddress.add('krrish.kishore02@gmail.com');
        //ccAddress = new List<String>(); //{'bala.bandanadam@birlasoft.com'};
                
        mail.setToAddresses(toAddress);
        mail.setCcAddresses(ccAddress);
        mail.setReplyTo('bala.bandanadam@birlasoft.com');
        mail.setSenderDisplayName('Kishore');
        mail.setSubject(subject);
        mail.setHtmlBody(body);
        mail.setEntityAttachments(files);
        Messaging.sendEmail(new List<messaging.SingleEmailMessage> {mail});
        }
        catch (exception e){
            throw new AuraHandledException(e.getMessage());
            //return null;
        }
    }
}
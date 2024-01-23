public class KIS_ContactController {
    
    
    @AuraEnabled
    public static List<Contact> getContacts(String searchTerm, List<Contact> selectedOptions) {
        List<String> Ids = new List<String>();
        
        for(Contact c : selectedOptions){
            Ids.add(c.Id);
        }
        system.debug('selectedOptions:::'+selectedOptions);
        system.debug('Ids:::'+Ids);
        if(selectedOptions != NULL){
            List<contact> conList = [Select Id, Name from Contact Where Name Like  : ('%'+searchTerm+'%') AND (Id != : Ids) LIMIT  5];
            system.debug('conList:::'+conList);
            return conList;
        }else{
            List<contact> conList = [Select Id, Name from Contact Where Name Like  : ('%'+searchTerm+'%') LIMIT  5];
            system.debug('conList:::'+conList);
            return conList;    
        }
    }
    
    @AuraEnabled
    public static List<User> getUsers(String searchTerm, List<User> selectedOptions) {
        List<String> Ids = new List<String>();
        
        for(User c : selectedOptions){
            Ids.add(c.Id);
        }
        system.debug('selectedOptions:::'+selectedOptions);
        system.debug('Ids:::'+Ids);
        if(selectedOptions != NULL){
            List<User> userList = [Select Id, Name from User Where Name Like  : ('%'+searchTerm+'%') AND (Id != : Ids) LIMIT  5];
            system.debug('userList:::'+userList);
            return userList;
        }else{
            List<User> userList = [Select Id, Name from User Where Name Like  : ('%'+searchTerm+'%') LIMIT  5];
            system.debug('userList:::'+userList);
            return userList;    
        }
    }
}
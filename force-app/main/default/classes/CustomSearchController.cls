public class CustomSearchController {
    @AuraEnabled
    public static List<String> searchForIds(String searchText){
        try {
            List<List<SObject>> results = [FIND :searchText IN ALL FIELDS RETURNING Account(Id), Contact(Id), Lead(Id)];
            List<String> ids = new List<String>();
            for(List<SObject> sobjs: results) {
                for(SObject sobj: sobjs) {
                    ids.add(sobj.Id);
                }
            }
            return ids;
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
}
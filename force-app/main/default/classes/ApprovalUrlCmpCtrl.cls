public class ApprovalUrlCmpCtrl {
    public Id cRecId {get; set;}
    public String cLinkText {get; set;}
    
    public String urlStr{  
        get {  
            return generateApprovalURL(cRecId);  
        }
    }
    
    public String linkTextString {
        get {
            if(this.cLinkText != null) {
                return this.cLinkText;
            } else {
                return 'Login to approve or reject';
            }
        }
    }
    
    private String generateApprovalURL(String recordID){  
      String url='';  
        
      List<ProcessInstanceWorkitem> workItemLst =   
        [  SELECT id  
      FROM ProcessInstanceWorkitem  
      WHERE processInstance.TargetObjectId=:recordID];   
        
      if(workItemLst.size() > 0)  
      {  
         
        url='https://'+ System.URL.getSalesforceBaseUrl().getHost() +   
         '/p/process/ProcessInstanceWorkitemWizardStageManager?id=' + workItemLst[0].id;      
     }  
     return url;  
   } 
}

({
    doinit : function(component, event, helper) {
        
        console.log("In Notify Doinit");
        var recid = component.get("v.recordId");
        console.log("recId:: "+recid);
        if(recid){
            var action = component.get("c.getContactOwners");
            action.setParams({
                recId : recid
            });
            
            action.setCallback(this, function(response){
                console.log("In call back doinit notify");
                var state = response.getState();
                console.log(state);
                if(state === "SUCCESS"){
                    var result = response.getReturnValue();
                    console.log("Result");
                    console.log(JSON.stringify(result));
                    component.set("v.ownerId", result);
                    
                    console.log("owner result");
                    console.log(result);
                    var childComp = component.find("Record");
                    console.log("childComp");
                    console.log(childComp);
                    childComp.prePopulateMethod(result);
                    
                }
               
            });
            $A.enqueueAction(action);
        }
    },
    
    finalValueAction : function(component, event, helper) {
        console.log("Handling Final value event");
        var values = event.getParams();
        console.log(JSON.stringify(values));
        
        //debugger;
        
        if(values.uniqueName === "cCUser"){
            console.log(values.finalValue.length);
            var cUser = [];
            for(var i = 0; i < values.finalValue.length; i++){
                
                cUser.push(values.finalValue[i].Id);
            }
            
            component.set("v.cCUser", cUser);   
            console.log("cUser");
            console.log(JSON.stringify(cUser));
        }
        
        if(values.uniqueName === "cCContact"){
            
            var cContact = [];
            for(var i = 0; i < values.finalValue.length; i++){
                
                cContact.push(values.finalValue[i].Id);
            }
            
            component.set("v.cCContact", cContact);  
            console.log("cContact");
            console.log(JSON.stringify(cContact));
        }
        
        if(values.uniqueName === "toUser"){
            
            var tUser = [];
            for(var i = 0; i < values.finalValue.length; i++){
                
                tUser.push(values.finalValue[i].Id);
            }
            
            component.set("v.toUser", tUser);
            console.log("tUser");
            console.log(JSON.stringify(tUser));
        }
        
        if(values.uniqueName === "toContact"){
            
            var tContact = [];
            for(var i = 0; i < values.finalValue.length; i++){
                
                tContact.push(values.finalValue[i].Id);
            }
            
            component.set("v.toContact", tContact);
            console.log("tContact");
            console.log(JSON.stringify(tContact));
        }
        
    },
    
    sendMail : function(component, event, helper) {
        //debugger;
        var cU = component.get("v.cCUser");
        console.log(JSON.stringify(cU));
        var cC = component.get("v.cCContact");
        console.log(JSON.stringify(cC));
        var tU = component.get("v.toUser");
        console.log(JSON.stringify(tU));
        var tC = component.get("v.toContact");
        console.log(JSON.stringify(tC));
        
        console.log("In send mail action");
        let c = [];
        if(cU.length > 0){
            for(var i = 0; i < cU.length; i++){
                c.push(cU[i]);
            }
        }
        if(cC.length > 0){
            for(var i = 0; i < cC.length; i++){
                c.push(cC[i]);
            }
        }
        
        let t = [];
        if(tU.length > 0){
            for(var i = 0; i < tU.length; i++){
                t.push(tU[i]);
            }
        }
        if(tC.length > 0){
            for(var i = 0; i < tC.length; i++){
                t.push(tC[i]);
            }
        }
        console.log(JSON.stringify(c));
        console.log(JSON.stringify(t));
        var emailSubject = component.get("v.subject");
        console.log(emailSubject);
        var emailBody = component.get("v.body");
        console.log(emailBody);
        var fileIds = component.get("v.selected");
        var file = [];
        for(var i = 0; i < fileIds.length; i++){
            file.push(fileIds[i].Id);
        }
        console.log("file");
        console.log(file);
        
        var action = component.get("c.sendEmailApex");
        action.setParams({
            "toAddress" : t,
            "ccAddress" : c,
            "subject" : emailSubject,
            "body" : emailBody,
            "files" : file
        });
        
        action.setCallback(this, function(response){
            console.log("In call back of notify component on send button");
            var state = response.getState();
            console.log(state);
            if(state === "SUCCESS"){
                console.log("In success");
                /*var toast = $A.get("e.force:showToast");
                toast.setParams({
                    "title" : "Success!",
                    "message" : "Notify message sent successfully sent",
                    "type" : "success"
                });
                toast.fire();*/
                var message = component.find("notifLib").showNotice({
                    variant : "success",
                    header : "Message sent successfully",
                    message : "Notify message was sent successfully"
                    
                });
                 $A.get("e.force:closeQuickAction").fire();
                
            }else if(state === "ERROR"){
                console.log("In error");
                var errors = response.getError();
                console.log(errors);
                
                /*var toastEvent = $A.get("e.force:showToast");
                toastEvent.setParams({
                    "title" : "Error!",
                    "message" : errors[0].message,
                    "type" : "error"
                });
                toastEvent.fire();*/
                var message = component.find("notifLib").showNotice({
                    variant : "error",
                    header : "Error sending the message",
                    message : errors[0].message
                    
                });
                
            }
        });
        $A.enqueueAction(action);
    },
    
    toOpenAttachments : function(component, event, helper) {
        console.log("Opened small modal to select attachments");
        component.set("v.open", true);
    },
    
    selectedAction : function(component, event, helper) {
        console.log("Opened selectedAction");
        
        var select = event.getParam("selectedIds");
        component.set("v.selected", select);
        
    },
    
    handleRemoveOnly : function(component, event, helper) {
        console.log("in remove");
        var sel = event.getSource().get("v.name");
        console.log(JSON.stringify(sel));
        var lis = component.get("v.selected");
        console.log(JSON.stringify(lis));
        for(var i = 0; i < lis.length; i++){
            console.log(JSON.stringify(lis[i]));
            console.log(lis[i].Id);
            console.log(sel.Id);
            console.log(lis[i].Id == sel.Id);
            if(lis[i].Id == sel.Id){
                
                lis.splice(i,1);
            }
        }
        
        component.set("v.selected", lis);
        console.log(JSON.stringify(lis));
    },

})
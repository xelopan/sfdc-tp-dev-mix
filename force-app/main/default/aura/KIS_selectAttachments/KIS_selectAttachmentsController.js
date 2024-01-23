({
    doInit : function(component, event, helper) {
        var rId = component.get("v.recordId");
        console.log("In Init");
		var action = component.get("c.getAttachments");
        action.setParams({
            conId : rId
        });
        action.setCallback(this, function(response){
            var state = response.getState();
            console.log(state);
            if(state === "SUCCESS"){
                var result = response.getReturnValue();
                console.log("result of Attach display component");
                console.log(result);
                //console.log(result[0].Id);
                component.set("v.fileIds", result);
            }
        });
        $A.enqueueAction(action);
	},
    
    handleDeleteEvent : function(component, event, helper) {
        console.log("In handle delete event in child");
        /*var eventName = event.getSource().getElement();
        console.log("eventName");
        console.log(eventName);*/
        
        var deleteFiles = event.getParam("toDeleteIds");
        console.log("deleteFiles");
        console.log(deleteFiles);
        component.set("v.fileIds", deleteFiles);
        if(deleteFiles === null){
            
            //Toast message on deletion if there are no records in list
            var toastEvent = $A.get("e.force:showToast");
            
            toastEvent.setParams({
                "title": "Attention!",
                "message": "There are no files to delete",
                "type" : "ERROR"
            });
            toastEvent.fire();
        }else{
        component.set("v.isOpen", true);
        }
        /*var deleteFiles = component.get("v.fileIds");
        console.log("deleteFiles");
        console.log(deleteFiles);*/
        
    },
    
    closeModal : function(component, event, helper) {
        component.set("v.isOpen", false);
    },
    
    openModal : function(component, event, helper) {
        component.set("v.isOpen", true);
    },
    
    deleteFile : function(component, event, helper) {
        console.log("In delte file method delete attachments modal");
        var fileToDelete = event.getSource().get("v.value");
        console.log("ContentDocumentId");
        console.log(fileToDelete);
        var action = component.get("c.deleteAttachments");
        action.setParams({
            attachId : fileToDelete
        });
        action.setCallback(this, function(response){
            console.log("In call back");
            var state = response.getState();
            console.log(state);
            if(state === "SUCCESS"){
                var result = response.getReturnValue();
                console.log(result);
                if(result === true){
                    
                    //alert(component.get("v.rowIndex"));
                    var index = component.getEvent("deleteRow");
                    index.setParams({
                        "rowIndex" : component.get("v.sNo")
                    });
                    index.fire();
                }
            }
        });
        $A.enqueueAction(action);
    },
    
    deleteRow : function(component, event, helper) {
        var index = event.getParams("v.sNo");
        //alert(index);
        var AllRowsList = component.get("v.fileIds");
        AllRowsList.splice(index, 1);
        component.set("v.fileIds", AllRowsList);
        
        //Close Modal
        component.set("v.isOpen", false);
        
        var delEvntNotify = component.getEvent("DeleteNotifyComponentEvent");
        delEvntNotify.fire();
        
        //Toast message on deletion
        var toastEvent = $A.get("e.force:showToast");
        
        toastEvent.setParams({
            "title": "Success!",
            "message": "File deleted successfully.",
            "type" : "SUCCESS"
        });
        toastEvent.fire();
    },
    
    onChan : function(component, event, helper) {
        
        console.log("In on change ");
        var change = event.getSource().get("v.value");
        var val = event.getSource().get("v.checked");
        console.log(JSON.stringify(change));
        console.log(JSON.stringify(val));
        var selected = component.get("v.box");
        if(val === true){
        selected.push(change); 
        }else{
            selected.pop(change);
        }
        console.log(JSON.stringify(selected));
        component.set("v.box", selected);  
    },
    
    onOk : function(component, event, helper) {
        console.log("In on onOk ");
        var selected = component.get("v.box");
        console.log(JSON.stringify(selected));
        var evnt = component.getEvent("selectedAttachmentsNotifyEvent");
        
        evnt.setParams({
            selectedIds : selected
        });
        evnt.fire();
        console.log("Event fired");
        component.set("v.isOpen", false);
        component.set("v.box", []);
    },
    
            
    handleUpload : function(component, event, helper) {
        
        var evnt = $A.get("updateAttachmentsAppEvent");
        evnt.getParam("Uploaded");
        var init = component.get("c.doInit");
        $A.enqueueAction(init);
    },
})
({	
    doInit : function(component, event, helper) {
   		//As of now does nothing
		
    },
    
    render : function(component, event, helper) {
     //This is to send the prepopulated value through event to parent
        console.log("In render");
        var args = event.getParam("arguments");
        console.log(JSON.stringify(args));
        console.log(JSON.stringify(args.populatedRecord));
        if(args){
            // Firing Final value event
            var finalEvent = component.getEvent("CustomLookUpFinalValueEvent");
            var uName = component.get("v.uniqueName");
            console.log("Final Event fired:: "+uName);
            finalEvent.setParams({
                uniqueName : uName,
                finalValue : args.populatedRecord                
            });
            finalEvent.fire();
        }else{
            console.log("Didnt get any record to pre-populate");
        }
    },
    
    onchange : function(component, event, helper) {
        
        console.log("Onchange");
        var icon = component.get("v.iconName");
        var Object = component.get("v.sObject");
        
        console.log("icon:: "+icon);
        console.log("Object:: "+Object);
        // Setting method name dynamically
        var methodName = component.get("v.methodName");
        console.log(methodName);
        /*Send this value to server to get values other than in this list*/
        var selected = component.get("v.selected");
        console.log("selected");
        console.log(JSON.stringify(selected));
        
        var action = component.get(methodName);
        var term = component.get("v.sTerm");
        
        action.setParams({
            "searchTerm" :  term,
            "selectedOptions" : selected
        });
        
        if(term.length > 0){
            action.setCallback(this, function(response){
                var state = response.getState();
                console.log(state);
                if(state === "SUCCESS")  {
                    var result = response.getReturnValue();
                    console.log(JSON.stringify(result));
                    console.log(result);
                    component.set("v.conList", result);
                    if(term != "" && result.length > 0){
                        var ToOpen = component.find("toOpen");
                        $A.util.addClass(ToOpen, "slds-is-open");
                    }else{
                        var ToOpen = component.find("toOpen");
                        $A.util.removeClass(ToOpen, "slds-is-open");
                    }
                }
                
            });
            
            $A.enqueueAction(action);
        }
    },
    
    onblur : function(component, event, helper) {
        
        
        //Setting timeout so that we can capture the value onclick
        const blurTimeout = window.setTimeout(
            $A.getCallback(() => {
                var ToOpen = component.find("toOpen");
                $A.util.removeClass(ToOpen, "slds-is-open");
            }),
            300
        );
        component.set('v.blurTimeout', blurTimeout);
    },
    
    onfocus : function(component, event, helper) {
        var term = component.get("v.sTerm");
        var returnedResults = component.get("v.conList");
        console.log("in onfocus");
        console.log(term);
        if(term && returnedResults.length > 0){
            var ToOpen = component.find("toOpen");
            $A.util.addClass(ToOpen, "slds-is-open");
        }
        
    },
    
    handleRemoveOnly : function(component, event, helper) {
        
        var singleSel = component.get("v.singleSelect");
        if(singleSel){
            console.log("in remove");
            var sel = event.getSource().get("v.name");
            console.log(JSON.stringify(sel));
            var lis = component.get("v.selected");
            console.log(JSON.stringify(lis));
            for(var i = 0; i < lis.length; i++){
                console.log(JSON.stringify(lis[i]));
                console.log(lis[i].Id == sel.Id);
                if(lis[i].Id == sel.Id){
                    
                    lis.splice(i,1);
                }
            }
            
            component.set("v.selected", lis);
            console.log(JSON.stringify(lis));
            
            var Input = component.find("input");
            $A.util.removeClass(Input, "slds-hide");
            
            var lookupPill = component.find("lookup-pill");
            $A.util.addClass(lookupPill, "slds-hide");
            
            // Firing Final value event
            var finalEvent = component.getEvent("CustomLookUpFinalValueEvent");
            var uName = component.get("v.uniqueName");
            console.log("Final Event fired "+uName);
            finalEvent.setParams({
                uniqueName : uName,
                finalValue : lis                
            });
            finalEvent.fire();
            
        }else{
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
            
            // Firing Final value event
            var finalEvent = component.getEvent("CustomLookUpFinalValueEvent");
            var uName = component.get("v.uniqueName");
            console.log("Final Event fired "+uName);
            finalEvent.setParams({
                uniqueName : uName,
                finalValue : lis                
            });
            finalEvent.fire();
        }
    },
    
    handleEvent : function(component, event, helper) {
        
        var lookupEventToParent = event.getParam("selectedItem");
        /* selectedValue attribute is used to de duplicate the list box options in dropdown after selecting a value. so that the value does not repeat in box after selecting once*/

        console.log("In event handler");
        console.log(JSON.stringify(lookupEventToParent));
        var singleSel = component.get("v.singleSelect");
        
        if(!singleSel){
            var selectedList = [];
            var existing = component.get("v.selected");
            if(existing.length > 0){
                for(var i = 0; i < existing.length; i++){
                    selectedList.push(existing[i]);
                }
            }
            selectedList.push(lookupEventToParent);
            console.log(JSON.stringify(selectedList));
            component.set("v.selected", selectedList);
            
            const blurTimeout = component.get('v.blurTimeout');
            if (blurTimeout) {
                clearTimeout(blurTimeout);
            }
            var ToOpen = component.find("toOpen");
            $A.util.removeClass(ToOpen, "slds-is-open");
            
            //Empty Search string
            component.set("v.sTerm", "");
            
            // Firing Final value event
            var finalEvent = component.getEvent("CustomLookUpFinalValueEvent");
            var uName = component.get("v.uniqueName");
            console.log("Final Event fired "+uName);
            finalEvent.setParams({
                uniqueName : uName,
                finalValue : selectedList                
            });
            finalEvent.fire();
            
            
        }else{
            var selectedList = [];
            //var existing = component.get("v.selected");
            selectedList.push(lookupEventToParent);
            console.log(JSON.stringify(selectedList));
            component.set("v.selected", selectedList);
            
            var Input = component.find("input");
            $A.util.addClass(Input, "slds-hide");
            
            var lookupPill = component.find("lookup-pill");
            $A.util.removeClass(lookupPill, "slds-hide");
            
            const blurTimeout = component.get('v.blurTimeout');
            if (blurTimeout) {
                clearTimeout(blurTimeout);
            }
            var ToOpen = component.find("toOpen");
            $A.util.removeClass(ToOpen, "slds-is-open");
            //Empty Search string
            component.set("v.sTerm", "");
            
            // Firing Final value event
            var finalEvent = component.getEvent("CustomLookUpFinalValueEvent");
            var uName = component.get("v.uniqueName");
            console.log("Final Event fired "+uName);
            finalEvent.setParams({
                uniqueName : uName,
                finalValue : selectedList                
            });
            finalEvent.fire();
        }
    }
})
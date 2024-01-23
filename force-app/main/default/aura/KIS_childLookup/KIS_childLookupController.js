({	
    doinit : function(component, event, helper) {
        console.log("In Child lookup Init");
        var icon = component.get("v.icon");
        var Object = component.get("v.object");
        
        console.log("icon:: "+icon);
        console.log("Object:: "+Object);
    },
    
	onOptionClick : function(component, event, helper) {
		console.log("In child init");
        var selVal  = component.get("v.myContact");
        console.log(selVal);
        
        var evt = component.getEvent("LookupEventToParent");
        evt.setParams({
            selectedItem : selVal
        });
        evt.fire();
	}
})
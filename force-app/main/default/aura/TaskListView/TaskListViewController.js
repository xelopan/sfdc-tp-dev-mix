({
    doInit : function(component, event, helper) {
        let action = component.get('c.getListViews');
        action.setCallback(this, (response) => {
            let state = response.getState();
            if(state === 'SUCCESS') {
                component.set('v.listViews', response.getReturnValue());
                let listViews = component.get('v.listViews');
                let otherList = listViews.map(el => {
                    return {
                        devName: el.DeveloperName,
                        name: el.Name,
                        id: el.Id
                    };
                });
                component.set('v.otherList', otherList);
                component.set('v.selectedListView', otherList[0].devName);
            }
        })
        $A.enqueueAction(action);
    },

    handleListViewChanged: function(component, event, helper) {
        component.set('v.selectedListView', event.getParam('value'));
    }
})
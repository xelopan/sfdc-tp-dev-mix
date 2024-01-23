({
    closeAction : function(component, event, helper) {
      helper.close();
    },
  
    successAction: function(component, event, helper) {
      helper.showToast('success', 'Success', 'The SKU(s) has been uploaded successfully.');
      helper.close();
      helper.refreshView();
    }
  })
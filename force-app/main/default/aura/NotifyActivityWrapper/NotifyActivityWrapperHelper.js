({
    close : function() {
        $A.get("e.force:closeQuickAction").fire();
    },

    refreshView: function() {
        $A.get("e.force:refreshView").fire();
    },

    showToast: function (type, title, message) {
        var toastEvent = $A.get("e.force:showToast");

        toastEvent.setParams({
            "title": title,
            "message": message,
            "type": type
        });

        toastEvent.fire();
    },
})
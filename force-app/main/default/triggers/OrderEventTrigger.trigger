trigger OrderEventTrigger on Order_Event__e (after insert) {
    List<Task> tasks = new List<Task>();
    for(Order_Event__e evt: Trigger.new) {
        if(evt.Has_Shipped__c == true) {
            tasks.add(new Task(
                Priority='Medium',
                Subject='Follow up on shipped order 105',
                OwnerId=evt.CreatedById
            ));
        }
    }

    insert tasks;
}
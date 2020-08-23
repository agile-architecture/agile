import Agile from 'agile-framework';
import React from "react";

export const App = new Agile({
    logJobs: true,
    framework: React
});

export const MY_STATE = App.State<string>("MyState", "my-state").persist();
export const MY_STATE_2 = App.State<string>("MyState2").persist("my-state2");

MY_STATE.watch("test", (value) => {
    console.log("Watch " + value);
});


export const MY_COMPUTED = App.Computed<string>(() => {
    return "test" + MY_STATE.value + "_computed_" + MY_STATE_2.value;
});

interface collectionValueInterface {
    id: string,
    name: string
}

export const MY_COLLECTION = App.Collection<collectionValueInterface>(collection => ({
    key: 'my-collection',
    groups: {
        myGroup: collection.Group()
    }
}));
MY_COLLECTION.collect({id: 'id1', name: 'test'});
MY_COLLECTION.collect({id: 'id2', name: 'test2'}, 'myGroup');
console.log("Initial: myCollection ", MY_COLLECTION);

export const MY_COLLECTION_2 = App.Collection<collectionValueInterface>({
    key: 'my-collection_2',
    groups: ['myGroup']
});
MY_COLLECTION_2.collect({id: 'id1', name: 'test'});
MY_COLLECTION_2.collect({id: 'id2', name: 'test2'}, 'myGroup');
console.log("Initial: myCollection2 ", MY_COLLECTION_2);

// console.log(JSON.stringify(MY_STATE));

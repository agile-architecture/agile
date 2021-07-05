import React from 'react';
import ReactDom from 'react-dom';
import { action, observable } from 'mobx';
import { observer } from 'mobx-react';

const appState = observable({
  fields: Array.from(Array(1000).keys()).map((i) => `Field #${i + 1}`),
  rename: action(function (value: string, index: number) {
    // console.log(state)
    appState.fields[index] = value;
  }),
});

function Field({ index }: { index: number }) {
  const field = appState.fields[index];

  return (
    <div>
      Last {`<Field>`} render at: {new Date().toISOString()}
      &nbsp;
      <input
        value={field}
        onChange={(e) => appState.rename(e.target.value, index)}
      />
    </div>
  );
}

const App = observer(() => {
  return (
    <div>
      <div>
        Last {`<App>`} render at: {new Date().toISOString()}
      </div>
      <br />
      {appState.fields.map((field, index) => (
        <Field key={index} index={index} />
      ))}
    </div>
  );
});

export default function (target: HTMLElement) {
  ReactDom.render(<App key={'mobx'} />, target);
}

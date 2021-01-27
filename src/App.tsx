import { observer } from 'mobx-react';
import { getChildType, types } from 'mobx-state-tree';
import { optionalNullType } from './mst.helpers';
import { QueryStringModel } from './qs.model';
import './styles.css';

enum Status {
  Open = 'open',
  Started = 'started',
  Done = 'done',
}

const StateModel = types
  .model({
    somethingBoolean: types.optional(types.boolean, false),
    somethingFrozen: types.optional(types.frozen({ startDate: new Date(), endDate: new Date() }), {
      startDate: new Date(),
      endDate: new Date(),
    }),
    someStringArray: types.optional(types.array(types.string), []),
    someEnum: optionalNullType(types.enumeration(Object.values(Status) as any)),
    someString: types.optional(types.string, ''),
  })
  .actions((self) => ({
    setBoolean(value) {
      self.somethingBoolean = value;
      console.log('setting boolean to', value);
    },
    setFrozen(value) {
      self.somethingFrozen = value;
    },
    setStringArray(value) {
      console.log('settings string array to', value);
      self.someStringArray = value;
    },
    setString(value) {
      self.someString = value;
    },
    setEnum(value) {
      console.log('setting enum to', value);
      self.someEnum = value;
    },
  }));

const state = types.compose(StateModel, QueryStringModel).create({});

const App = observer(function App() {
  const someString = state.someString;
  const somethingBoolean = state.somethingBoolean;
  const someStringArray = state.someStringArray;

  return (
    <div className="App">
      <h1>Hello CodeSandbox</h1>
      <h2>Here are some Options</h2>
      <input
        placeholder="input"
        type="text"
        defaultValue={someString}
        onChange={({ target: { value } }) => state.setString(value)}
      />
      <input
        type="checkbox"
        defaultChecked={somethingBoolean}
        onChange={({ target: { checked } }) => state.setBoolean(checked)}
      />
      <select value={state.someEnum} onChange={({ target: { value } }) => state.setEnum(value)}>
        <option>open</option>
        <option>started</option>
        <option>done</option>
      </select>
    </div>
  );
});

export default App;

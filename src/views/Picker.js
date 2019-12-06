import React from "react";

import Guidance from '../components/Guidance';
import { usePicker, PickerProvider } from '../google/picker';

const PickerDisplay = (props) => {
  const {
    picker // , dispatch
  } = usePicker();

  return (<React.Fragment>
      <button type="button" id="auth" disabled={!picker.needAuth} onClick={picker.handleAuthRequest}>Authenticate
      </button>
      <button type="button" id="auth" disabled={picker.needAuth} onClick={picker.handleLogoutRequest}>Logout
      </button>
      <button type="button" id="pickerButton" disabled={!picker.ready} onClick={picker.handleOpen}>Open Picker</button>
      <div>{picker.result}</div>
      <Guidance guidance={picker.json} />
    </React.Fragment>
  );
};

const Picker = () => {
  return <PickerProvider><PickerDisplay /></PickerProvider>;
};

export default Picker;

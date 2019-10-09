import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';

// Scope to use to access user's photos.
const scope = 'https://www.googleapis.com/auth/drive.file';

const loadGapiLibraryAsynchronously = async (library) => {
  return new Promise((resolve, reject) =>
    window.gapi.load(library, {
      callback: () => resolve(),
      onerror: (error) => reject(error)
    }));
};


export const PickerContext = React.createContext();
export const usePicker = () => useContext(PickerContext);

export const PickerProvider = ({
  children
}) => {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [config, setConfig] = useState();
  const [picker, setPicker] = useState();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [result, setResult] = useState();
  const gapi = window.gapi;


  // Load our configuration, note, this should probably become its own thing...
  const loadConfig = async () => {
    try {
      const response = await axios.get('/api/settings');
      setConfig(response.data);
    } catch(e) {
      console.error(e);
    }
  };

  useEffect( () => {
    loadConfig().catch(console.error);
  }, []);


  // Use the API Loader script to load google.picker and gapi.auth.
  const onApiLoad = async () => {
    await loadGapiLibraryAsynchronously('picker');
    await loadGapiLibraryAsynchronously('client:auth2');
    await initClient();
  };

  /**
   *  Initializes the API client library and sets up sign-in state
   *  listeners.
   */
  const initClient = async () => {
    return new Promise((resolve, reject) => gapi.client.init({
      // apiKey: developerKey,
      clientId: config.googleClientId,
      discoveryDocs: ["https://sheets.googleapis.com/$discovery/rest?version=v4"],
      scope: scope
    })
      .then(function () {
        const updateSigninStatus = (next) => setIsSignedIn(next);

        // Listen for sign-in state changes.
        gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);

        // Handle the initial sign-in state.
        updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
        resolve();
      }, function(error) {
        gapi.auth2.getAuthInstance().signIn();
        console.error('Error initializing the client: ', error);
        reject(error);
      }));
  };

  const handleAuthRequest = () => gapi.auth2.getAuthInstance().signIn();

  const handleOpen = () => {
    setPickerOpen(true);
  };


  useEffect(() => {
    if (config) onApiLoad().catch(console.error);
  }, [config]);

  useEffect(() => {
    if (isSignedIn) {
      const authResult = gapi.auth2.getAuthInstance().currentUser.get().getAuthResponse(true);
      handleAuthResult(authResult);
    }
  }, [isSignedIn]);

  useEffect(() => {
    if (picker) {
      if (pickerOpen) picker.setVisible(true);
      else picker.setVisible(false);
    }
  }, [pickerOpen, picker]);


  function handleAuthResult(authResult) {
    if (authResult && !authResult.error) {
      createPicker(authResult.access_token);
    }
  }

  const handleLogoutRequest = () => {
    gapi.auth2.getAuthInstance().signOut();
    setPicker(null);
    setPickerOpen(false);
  };

// Create and render a Picker object for picking from Google Photos.
  const createPicker = (token) => {
    try {
      const newPicker = new window.google.picker.PickerBuilder()
        .addView(window.google.picker.ViewId.SPREADSHEETS)
        .setAppId(config.googleAppId)
        .setOAuthToken(token)
        // .setDeveloperKey(developerKey)
        .setCallback(pickerCallback)
        .build();
      setPicker(newPicker);
    } catch(e) {
      console.error('Picker load failed', e);
    }
  };

// A simple callback implementation.
  function pickerCallback(data) {
    let id = 'nothing';
    if (data[window.google.picker.Response.ACTION] == window.google.picker.Action.PICKED) {
      const doc = data[window.google.picker.Response.DOCUMENTS][0];
      id = doc[window.google.picker.Document.ID];
      setPickerOpen(false);
    }
    const message = 'You picked: ' + id;
    if (id !== 'nothing') dumpData(id, message);
    else setResult(message);
  }

  function dumpData(id, message) {
    let newResult = message;
    gapi.client.sheets.spreadsheets.values.get({
      spreadsheetId: id,
      range: 'A:Z',
    }).then(function(response) {
      const range = response.result;
      axios.post('/api/scenariodoc', {range})
        .then((response) => {
          console.log('carlos, response: ', response);
          setResult(`${message} and Result: ` + JSON.stringify(response.data));
        });
    }, function(response) {
      newResult += `<br/>Error: ${response.result.error.message}<br/>`;
      console.error('Dump Error', response.result.error.message);
      gapi.auth2.getAuthInstance().signIn();
      setResult(newResult);
    });
  }

  return (
    <PickerContext.Provider value={ { picker: {
      needAuth: !isSignedIn,
      ready: !!picker,
      handleOpen,
      handleAuthRequest,
      handleLogoutRequest,
      result
    }}}>
      { children }
    </PickerContext.Provider>
  );
};

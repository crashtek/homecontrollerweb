import React, { Fragment, useEffect, useState } from "react";
import { useParams, useHistory } from 'react-router-dom';
import { Form, TextInput } from '@auth0/cosmos';
import axios from 'axios';

const Window = () => {
  let { roomId, windowId } = useParams();
  const [ error, setError ] = useState(null);
  const [ window, setWindow ] = useState(null);
  const [ loading, setLoading ] = useState(!!windowId);
  const history = useHistory();

  const fetchWindow = async () => {
    const result = await axios.get(`/backend/rooms/${roomId}/windows/${windowId}?homeId=1`);

    setWindow(result.data.window);
    setLoading(false);
  };

  useEffect(() => {
    if (windowId) fetchWindow();
  }, [windowId]);

  const createOrUpdateWindow = async (windowData) => {
    const data = {
      ...windowData,
      homeId: 1 // TODO: make it so there can be more than one home!
    };
    const url = `/backend/rooms/${roomId}/windows${windowId ? `/${windowId}` : ''}`;

    setError(null);

    if (windowId) return axios.patch(url, data);

    return axios.post(url, data);
  };

  const handleSubmitEvent = (e) => {
    e.preventDefault();
    const button = e.target.tagName === 'SPAN' || e.target.tagName === 'span' ? e.target.parentNode : e.target;
    const form = button.form;
    const windowData = {
      name: form.elements['name'].value,
      arduinoid: form.elements['arduinoid'].value
    };
    createOrUpdateWindow(windowData)
      .then(response => {
        if (response.status !== 200) {
          console.log(response.data);
          return setError(response.data);
        }
        return response.data.window;
      })
      .then(window => {
        history.push(`/room/${roomId}`)
      })
      .catch(setError);
  };

  const handleDeleteEvent = (e) => {
    e.preventDefault();
    setError(null);

    axios.delete(`/backend/rooms/${roomId}/windows/${windowId}?homeId=1`)
      .then(response => {
        if (response.statusCode !== 200) return setError(response.data);
        return response.data;
      })
      .then(() => history.push(`/room/${roomId}`))
      .catch(setError);
  };

  return (
    <Fragment>
      <span>Error: {JSON.stringify(error)}</span>
      <Form onsubmit={handleSubmitEvent}>
        <Form.Field label="Name">
          <TextInput
            name={'name'}
            type="text"
            placeholder="Enter a Name for the Room"
            disabled={loading}
            defaultValue={window ? window.name : null}
          />
        </Form.Field>
        <Form.Field label="Window ID on the Controller">
          <TextInput
            name={'arduinoid'}
            type="text"
            placeholder="Enter the Window ID on the Controller"
            disabled={loading}
            defaultValue={window ? window.arduinoid : null}
          />
        </Form.Field>
        <Form.Actions
          primaryAction={{
            label: !windowId ? 'Create Window' : 'Update Window',
            handler: handleSubmitEvent
          }}
          destructiveAction={ windowId ? {
            label: 'Delete',
            icon: 'delete',
            handler: handleDeleteEvent
          } : null }
        />
      </Form>
    </Fragment>
  );
};

export default Window;

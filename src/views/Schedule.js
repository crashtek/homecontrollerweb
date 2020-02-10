import React, { Fragment, useEffect, useState } from "react";
import { useParams, useHistory } from 'react-router-dom';
import { Form, TextInput } from '@auth0/cosmos';
import axios from 'axios';

const Schedule = () => {
  let { roomId, scheduleId } = useParams();
  const [ error, setError ] = useState(null);
  const [ schedule, setSchedule ] = useState(null);
  const [ loading, setLoading ] = useState(!!scheduleId);
  const history = useHistory();

  const fetchSchedule = async () => {
    const result = await axios.get(`/backend/rooms/${roomId}/schedules/${scheduleId}?homeId=1`);

    setSchedule(result.data.schedule);
    setLoading(false);
  };

  useEffect(() => {
    if (scheduleId) fetchSchedule();
  }, [scheduleId]);

  const createOrUpdateSchedule = async (scheduleData) => {
    const data = {
      ...scheduleData,
      homeId: 1 // TODO: make it so there can be more than one home!
    };
    const url = `/backend/rooms/${roomId}/schedules${scheduleId ? `/${scheduleId}` : ''}`;

    setError(null);

    if (scheduleId) return axios.patch(url, data);

    return axios.post(url, data);
  };

  const handleSubmitEvent = (e) => {
    e.preventDefault();
    const button = e.target.tagName === 'SPAN' || e.target.tagName === 'span' ? e.target.parentNode : e.target;
    const form = button.form;
    const fields = ['command', 'startDoW', 'endDoW', 'minute', 'hour'];
    const scheduleData = {};
    fields.forEach(field => scheduleData[field] = form.elements[field].value);
    createOrUpdateSchedule(scheduleData)
      .then(response => {
        if (response.status !== 200) {
          console.log(response.data);
          return setError(response.data);
        }
        return response.data.schedule;
      })
      .then(schedule => {
        history.push(`/room/${roomId}`)
      })
      .catch(setError);
  };

  const handleDeleteEvent = (e) => {
    e.preventDefault();
    setError(null);

    axios.delete(`/backend/rooms/${roomId}/schedules/${scheduleId}?homeId=1`)
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
        <Form.Field label="Command">
          <TextInput
            name={'command'}
            type="text"
            placeholder="Enter a Command for the Schedule (up or down)"
            disabled={loading}
            defaultValue={schedule ? schedule.command : null}
          />
        </Form.Field>
        <Form.Field label="Start Day of Week">
          <TextInput
            name={'startDoW'}
            type="text"
            placeholder="Sunday = 0, Monday = 1, etc."
            disabled={loading}
            defaultValue={schedule ? schedule.startDoW : null}
          />
        </Form.Field>
        <Form.Field label="End Day of Week">
          <TextInput
            name={'endDoW'}
            type="text"
            placeholder="Sunday = 0, Monday = 1, etc."
            disabled={loading}
            defaultValue={schedule ? schedule.endDoW : null}
          />
        </Form.Field>
        <Form.Field label="Hour">
          <TextInput
            name={'hour'}
            type="text"
            placeholder="The Hour of the Day 0-23"
            disabled={loading}
            defaultValue={schedule ? schedule.hour : null}
          />
        </Form.Field>
        <Form.Field label="Minute">
          <TextInput
            name={'minute'}
            type="text"
            placeholder="The Minute of the Hour 0-59"
            disabled={loading}
            defaultValue={schedule ? schedule.minute : null}
          />
        </Form.Field>
        <Form.Actions
          primaryAction={{
            label: !scheduleId ? 'Create Schedule' : 'Update Schedule',
            handler: handleSubmitEvent
          }}
          destructiveAction={ scheduleId ? {
            label: 'Delete',
            icon: 'delete',
            handler: handleDeleteEvent
          } : null }
        />
      </Form>
    </Fragment>
  );
};

export default Schedule;

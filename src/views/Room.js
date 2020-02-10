import React, { Fragment, useEffect, useState } from "react";
import { useParams, useHistory } from 'react-router-dom';
import { Button, Form, Table, TextInput } from '@auth0/cosmos';
import axios from 'axios';

const Room = () => {
  let { id } = useParams();
  const [error, setError] = useState(null);
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(!!id);
  const history = useHistory();

  const fetchRoom = async () => {
    const result = await axios.get(`/backend/rooms/${id}?homeId=1`);

    // Make schedule displays
    result.data.room.schedules.forEach(schedule => {
      const hour = schedule.hour < 10 ? `0${schedule.hour}` : schedule.hour;
      const minute = schedule.minute < 10 ? `0${schedule.minute}` : schedule.minute;
      const dayStr = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
      const startDoW = dayStr[parseInt(schedule.startDoW)];
      const endDoW = dayStr[parseInt(schedule.endDoW)];
      schedule.display = `${startDoW}-${endDoW} ${hour}:${minute}`;
    });

    setRoom(result.data.room);
    setLoading(false);
  };

  useEffect(() => {
    if (id) fetchRoom();
  }, [id]);

  const createOrUpdateRoom = async (roomData) => {
    const data = {
      ...roomData,
      homeId: 1 // TODO: make it so there can be more than one home!
    };
    console.log('carlos, data: ', data);
    const url = `/backend/rooms${id ? `/${id}` : ''}`;

    setError(null);

    if (id) return axios.patch(url, data);

    return axios.post(url, data);
  };

  const handleSubmitEvent = (e) => {
    e.preventDefault();
    const button = e.target.tagName === 'SPAN' || e.target.tagName === 'span' ? e.target.parentNode : e.target;
    const form = button.form;
    const roomData = {
      name: form.elements['name'].value,
      ipaddress: form.elements['ipaddress'].value
    };
    createOrUpdateRoom(roomData)
      .then(response => {
        if (response.status !== 200) {
          console.log(response.data);
          return setError(response.data);
        }
        return response.data.room;
      })
      .then(room => {
        history.push(`/room/${room._id}`)
      })
      .catch(setError);
  };

  const handleDeleteEvent = (e) => {
    e.preventDefault();
    setError(null);

    axios.delete(`/backend/rooms/${id}?homeId=1`)
      .then(response => {
        if (response.statusCode !== 200) return setError(response.data);
        return response.data;
      })
      .then(() => history.push(`/`))
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
            defaultValue={room ? room.name : null}
          />
        </Form.Field>
        <Form.Field label="IP Address">
          <TextInput
            name={'ipaddress'}
            type="text"
            placeholder="Enter an IP Address for the Room"
            disabled={loading}
            defaultValue={room ? room.ipaddress : null}
          />
        </Form.Field>
        <Form.Actions
          primaryAction={{
            label: !id ? 'Create Room' : 'Update Room',
            handler: handleSubmitEvent
          }}
          destructiveAction={id ? {
            label: 'Delete',
            icon: 'delete',
            handler: handleDeleteEvent
          } : null}
        />
      </Form>

      {
        !id ? null :
          (<Fragment>
            <h2>Windows</h2>
            <Button onClick={() => history.push(`/room/${id}/window`)}>Create New Window</Button>
            <Table
              loading={loading}
              items={room ? room.windows : []}
              onRowClick={(evt, item) => history.push(`/room/${id}/window/${item.id}`)}>
              <Table.Column loading="" field="id" title="Id" width="30%"/>
              <Table.Column loading="" field="name" title="Name" width="30%"/>
              <Table.Column loading="" field="arduinoid" title="Internal ID" width="30%"/>
            </Table>
          </Fragment>)
      }

      {
        !id ? null :
          (<Fragment>
            <h2>Schedules</h2>
            <Button onClick={() => history.push(`/room/${id}/schedule`)}>Create New Schedule</Button>
            <Table
              loading={loading}
              items={room ? room.schedules : []}
              onRowClick={(evt, item) => history.push(`/room/${id}/schedule/${item.id}`)}>
              <Table.Column loading="" field="id" title="Id" width="30%"/>
              <Table.Column loading="" field="command" title="Command" width="30%"/>
              <Table.Column loading="" field="display" title="Schedule" width="30%"/>
            </Table>
          </Fragment>)
      }

    </Fragment>
  );
};

export default Room;

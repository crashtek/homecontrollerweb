import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";

import axios from 'axios';
import { Table, Button } from '@auth0/cosmos';

const Hero = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const history = useHistory();

  useEffect(() => {
    const fetchData = async () => {
      const result = await axios(
        '/backend/rooms',
      );

      setRooms(result.data.rooms);
      setLoading(false);
    };

    fetchData();
  }, []);

  return (
    <div className="text-center hero my-5">
      <h1 className="mb-4">Here are your Rooms</h1>
      <Button onClick={() => history.push('/room')}>Create New Room</Button>
      <Table
        loading={loading}
        items={rooms}
        onRowClick={(evt, item) => history.push(`/room/${item._id}`)}>
        <Table.Column loading="" field="name" title="Name" width="100%"/>
      </Table>
    </div>
  );
};

export default Hero;

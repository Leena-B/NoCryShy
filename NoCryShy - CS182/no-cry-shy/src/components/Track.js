import React from 'react';
import './Track.css';
import {Container, Row, Col, Card, ListGroup, Button} from 'react-bootstrap';
import { PencilFill, Trash, Speedometer, PeopleFill } from 'react-bootstrap-icons';
import { getUserDetails, deleteEntry, getEntries } from '../firebase/firebase';
import { useEffect, useState } from 'react';
import Select from 'react-select'
import {onAuthStateChanged} from 'firebase/auth'
import {auth} from '../firebase/firebase';
import NewEntryModal from './NewEntry';



export default function Track() {
  const [user, setUser] = useState({});
  const [firestoreUserData, setFirestoreUserData] = useState({});
  const [entries, setEntries] = useState([]);
  const [addEntry, setAddEntry] = useState(false);
  const [editEntryDetails, setEditEntryDetails] = useState({});

  useEffect(() => {
    onAuthStateChanged(auth, (currentUser) => {
        setUser(currentUser);
    });
  }, []);
  
  useEffect(() => {
    getUserDetails(user?.email).then((response) => {
      setFirestoreUserData(response.data());
    });
  }, [user]);

  useEffect(() => {
    getEntries(user?.email).then((querySnapshot) => {
      querySnapshot.forEach((entry) => {
        var data = entry.data();
        data.id = entry.id;
        data.email = data.uid;
        data.firstName = firestoreUserData.firstName;
        data.lastName = firestoreUserData.lastName;
        data.owner = true;
        setEntries(arr => [...arr , data]);
      });
    });

    firestoreUserData.friends?.map(async (friendEmail) => {
      let friendFirestoreData = (await getUserDetails(friendEmail)).data();
      getEntries(friendEmail).then((querySnapshot) => {
        querySnapshot.forEach((entry) => {
          var data = entry.data();
          // Only show data which is marked as shareable
          if (data.share) {
            data.id = entry.id;
            data.email = data.uid;
            data.firstName = friendFirestoreData.firstName;
            data.lastName = friendFirestoreData.lastName;
            data.owner = false;
            setEntries(arr => [...arr , data]);
          }
        });
      });
    });
  }, [firestoreUserData]);


  useEffect(() => {
    if (Object.keys(editEntryDetails).length > 0) {
      setAddEntry(true);
    }
  }, [editEntryDetails]);

  const handleEdit = (data) => {
    setEditEntryDetails({
      ...data
    });
  };

  const handleDelete = async (id) => {
    deleteEntry(id).then(() => {
      window.location.reload();
    });
  };

  // Define how each display entry will be structured
  const Frame = ({data}) => {
    return (
        <Card>
          <Card.Header>{data.firstName + " " + data.lastName + " (" + data.email + ")"}</Card.Header>

          <Card.Header>
            { data.owner ? (
              <>
                <Card.Link href="#" className="editButton" onClick={() => handleEdit(data)}><PencilFill size={25}/></Card.Link>
                <Card.Link href="#" className="deleteButton" onClick={() => handleDelete(data.id)}><Trash size={25}/></Card.Link>
              </>
          ) : null }
            <Card.Title className="text-center">{ data.date }</Card.Title>
            <Card.Subtitle className="text-center mb-2 text-muted">{ data.time } { data.timezone }</Card.Subtitle> 
          </Card.Header>
          <Card.Body>
            { data.photo_url ? <Card.Img variant="top" src={data.photo_url} /> : null }
            <Card.Text>
              <b>Reason:</b> {data.reason}
            </Card.Text>
          </Card.Body>
          <ListGroup className="list-group-flush">
            <ListGroup.Item> <b>Notes:</b> {unwrapField(data.other)}</ListGroup.Item>
          </ListGroup>
          <Card.Footer className='footer'>
            <Speedometer size={30}/> { unwrapField(data.severity) }{data.severity ? (<>/100</>) : null } {" "} {" "}&nbsp;&nbsp;&nbsp;
            <PeopleFill size={30}/> { data.share ? "On" : "Off" }
          </Card.Footer>
        </Card>
    );
  }

  const unwrapField = (field) => {
    if (field === undefined || field === "" || field === null) {
      return "N/A";
    }
    return field;
  };

  // Sort so in chronological order
  entries.sort(function(a,b){
    return new Date(a.date) - new Date(b.date)
  });

  return (
    <Container>
      <h1>Past Entries</h1>
      <Row xs={1} md={3} className="g-4">
        { entries.reverse().map((data) => (
          <Col key = {data.id} >
            <Frame data = { data } />
           </Col>
        ))
        }   
      </Row>
      <NewEntryModal
            {...editEntryDetails}
            show={addEntry}
            onHide={() => setAddEntry(false)}
          />
    </Container>
  );
}
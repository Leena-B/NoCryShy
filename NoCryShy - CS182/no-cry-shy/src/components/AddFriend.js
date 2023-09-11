import React, {useState, useEffect} from 'react';
import {onAuthStateChanged} from 'firebase/auth'
import {auth, addFriendRequest} from '../firebase/firebase';
import {Container, Row, Col, Form, Button, Modal} from 'react-bootstrap';



// CustomModal takes in an array of text to write to the modal
export default function AddFriend(props) {
  const [friendEmail, setFriendEmail] = useState("");


  const handleSubmit = async (event) => {
    event.preventDefault();
    addFriendRequest(props.email, friendEmail).then(() => {
      window.location.reload();
    }).catch((error) => {
      alert(friendEmail + " is not a user in NoCryShy!");
    });
  };
  

  return (
    <Modal
      {...props}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">
          <>Enter Friend Details</>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Row>
            <Form.Group className="mb-3" controlId="email">
              <Form.Label>Email</Form.Label>
              <Form.Control type="text" placeholder="What is your friend's email?" onChange={(event) => setFriendEmail(event.target.value)} required/>
            </Form.Group>
          </Row>
          <Button variant="primary" type="submit">
            Add Friend
          </Button>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={props.onHide}>Close</Button>
      </Modal.Footer>
    </Modal>
  );
}
  
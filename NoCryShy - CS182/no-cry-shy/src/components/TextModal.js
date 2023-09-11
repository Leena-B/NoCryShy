import React, {useState, useEffect} from 'react';
import {onAuthStateChanged} from 'firebase/auth'
import {auth} from '../firebase/firebase';
import {Container, Row, Col, Form, Button, InputGroup, ListGroup, Modal} from 'react-bootstrap';

// TextModal takes in an array of text to write to the modal
export default function TextModal(props) {
  const [show, setShow] = useState(false);
  
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  
  return (
    <>
    <Button variant="primary" onClick={handleShow}>
      {props.promptButtonText}
    </Button>
  
    <Modal show={show} onHide={handleClose}>
      { 
        Object.keys(props.displayText).map((keyName, keyIndex) => (
          <>
            {keyIndex ? (
              <Modal.Header>
                  <Modal.Title>{keyName}</Modal.Title>
              </Modal.Header>
            ) : (
              <Modal.Header closeButton>
                  <Modal.Title>{keyName}</Modal.Title>
              </Modal.Header>
            )}
            <Modal.Body>
              <ListGroup as="ul">
                { props.displayText[keyName].data.map(text => (
                  <ListGroup.Item as="li" key={text} className="align-items-center" style={{ display: "flex" }}>
                    { text }
                    {/* Conditional rendering of tick and remove buttons depending on which props are passed in */}
                    {/* TODO: can we remove the repeated logic? */}
                    {
                      props.displayText[keyName].onTickHandler ? 
                      <Button variant="outline-success" style={{ marginLeft: "auto", marginRight: "10px"}} 
                        onClick = {() => props.displayText[keyName].onTickHandler(text)}>✓</Button> 
                      :
                      null
                    }
                    {
                      props.displayText[keyName].onDeleteHandler &&  !props.displayText[keyName].onTickHandler ?  
                      <Button variant="outline-danger" style={{ marginLeft: "auto"}}
                        onClick = {() => props.displayText[keyName].onDeleteHandler(text)}>X</Button> :
                      null
                    }
                    {
                      props.displayText[keyName].onDeleteHandler &&  props.displayText[keyName].onTickHandler ?  
                      <Button variant="outline-danger"
                        onClick = {() => props.displayText[keyName].onDeleteHandler(text)}>X</Button> :
                      null
                    }
                    </ListGroup.Item>
                  ))
                }   
              </ListGroup>
            </Modal.Body>
          </>
        ))
      }

      <Modal.Footer>
      <Button variant="secondary" onClick={handleClose}>
        Close
      </Button>
      </Modal.Footer>
    </Modal>
    </>
  );
}
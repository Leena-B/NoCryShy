import React from 'react';
import './Error.css';
import {Container, Row, Col} from 'react-bootstrap';
 
const Error = () => {
    return (
       <Container>
        <Row>
          <Col>
            <h1>No page exists here!</h1>
          </Col>
        </Row>
      </Container>
    );
}
 
export default Error;
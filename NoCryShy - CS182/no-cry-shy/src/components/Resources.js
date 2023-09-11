import React from 'react';
import './Track.css';
import {Container, Row, Col, Form, Card, ListGroup} from 'react-bootstrap';
import { deleteEntry, getEntries } from '../firebase/firebase';
import { useEffect, useState } from 'react';
import Select from 'react-select'
import {onAuthStateChanged} from 'firebase/auth'
import {auth} from '../firebase/firebase';
import NewEntryModal from './NewEntry';



export default function Resources() {
  return (
    <Container>
      <h1>Resources</h1>
      <br></br>
      <h5> Life Threatening Emergencies & Immediate Support</h5>
      <p>If you or someone you know is in crisis, in need of immediate emergency support, or has a life-threatening emergency: Call 911 for immediate help or go to the nearest hospital emergency room.</p>

        <br></br>

        <h5>California’s Statewide Hotlines/Resources</h5>
        <h6>Suicide Prevention Lifeline</h6>
        <p>1-800-273-8255 or text 838255 (24/7)</p>

        <h6>Crisis Text Line</h6>
        <p>Text HOME to 74174</p>

        <br></br>

        <h5>Nationwide Resources</h5>
        <h6>National Suicide Prevention Lifeline</h6>
        <p>Call 988.</p>

        <br></br>

        <h5>When to seek help?</h5>
        <p>Crying in response to something that makes you happy or sad is normal and healthy. 
        Don’t shy away from shedding tears if you feel the need to release. 
        However, if you feel that you are experiencing excessive crying, it might be a good idea to chat with your doctor or seek professional mental health services.
        </p>

    </Container>
  );
}
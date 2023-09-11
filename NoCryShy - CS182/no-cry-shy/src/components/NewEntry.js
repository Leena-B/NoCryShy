import React, {useState, useEffect} from 'react';
import {onAuthStateChanged} from 'firebase/auth'
import {addEntry, editEntry, auth, uploadPhotoToStorage, constructImageName, getPhotoDownloadURL, deletePhoto} from '../firebase/firebase';
import {Container, Row, Col, Form, Button, Modal} from 'react-bootstrap';

// Default form state for the dialog
const DEFAULT_FORM_STATE = {
  date:  "",
  time: "",
  timezone: "PST",
  severity: null,
  reason: "",
  other: "",
  share: false,
  photo: null,
  deletePhoto: false
};

const POST_CRY_SUGGESTIONS = [
  "drink a glass of water",
  "take a walk",
  "grab a couple tissues",
  "wash your face",
  "shower",
  "call a friend",
  "call family",
  "give yourself a treat",
  "eat some chocolate",
  "watch your favorite move"
];

const getRandomPostCrySuggestion = () => {
  return POST_CRY_SUGGESTIONS[Math.floor(Math.random() * POST_CRY_SUGGESTIONS.length)];
};

// CustomModal takes in an array of text to write to the modal
export default function NewEntryModal(props) {
  const [formFields, setFormFields] = useState(DEFAULT_FORM_STATE);
  const [postCrySuggestion, setPostCrySuggestion] = useState(getRandomPostCrySuggestion());

  // Whenever the props get updated, refresh what the form fields store initially
  useEffect(() => {
    setFormFields({
        date: props.date ? props.date : DEFAULT_FORM_STATE.date,
        time: props.time ? props.time : DEFAULT_FORM_STATE.time,
        timezone: props.timezone ? props.timezone : DEFAULT_FORM_STATE.timezone,
        severity: props.severity ? props.severity : DEFAULT_FORM_STATE.severity,
        reason: props.reason ? props.reason : DEFAULT_FORM_STATE.reason,
        other: props.other ? props.other : DEFAULT_FORM_STATE.other,
        share: props.share ? props.share : DEFAULT_FORM_STATE.share,
        deletePhoto: DEFAULT_FORM_STATE.deletePhoto
      });
    const randomPostCrySuggestion = getRandomPostCrySuggestion();
    setPostCrySuggestion(randomPostCrySuggestion);

  }, [props.id])

  // Update given field in the form
  const updateFormField = (event, field) => {
    if (field == "share") {
      setFormFields(prevState => ({...prevState, [field]: !formFields.share}));
    } else if (field == "deletePhoto") {
      setFormFields(prevState => ({...prevState, [field]: !formFields.deletePhoto}));
    } else if (field == "severity") {
      setFormFields(prevState => ({...prevState, [field]: parseInt(event.target.value)}));
    } else if (field == "photo") {
      setFormFields(prevState => ({...prevState, [field]: event.target.files[0]}));
    } else {
      setFormFields(prevState => ({...prevState, [field]: event.target.value}));
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault();

    var current_photo_url = props.photo_url;

    // Delete the existing photo if checkbox is ticked or if we are replacing the photo
    // Checkbox only renders if we have a photo_url so no need to check again
    if (formFields.deletePhoto || formFields.photo && current_photo_url) {
      await deletePhoto(props.photo_url);
      current_photo_url = null;
    }
    // If entry has an ID attached to it, edit fields
    var photo_download_url = (props.photo_url === undefined ? null : current_photo_url);

    if (formFields.photo) {
      // Generate unique ID for photos
      const photo_filename = constructImageName(props.email, Math.random());
      await uploadPhotoToStorage(photo_filename, formFields.photo);

      photo_download_url = await getPhotoDownloadURL(photo_filename);
    }


    if (props.id) {
      editEntry(props.id, props.email, formFields.date, formFields.time, formFields.timezone,
        formFields.severity, formFields.reason, formFields.other, formFields.share, photo_download_url).then(() => {
          window.location.reload();
      });
    } else {
      addEntry(props.email, formFields.date, formFields.time, formFields.timezone,
        formFields.severity, formFields.reason, formFields.other, formFields.share, photo_download_url).then(() => {
          window.location.reload();
      });
    }
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
          {props.id ? (<>Edit Cry Entry</>) : (<>New Cry Entry</>)}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Row>
            <Col>
              <Form.Group className="mb-3" controlId="date">
                <Form.Label>Date</Form.Label>
                <Form.Control type="date" name='entry_date'
                  defaultValue={formFields.date}
                  onChange={(event) => updateFormField(event, 'date')} required/>
                <Form.Text className="text-muted">
                </Form.Text>
              </Form.Group>
            </Col>
            <Col>
              <Form.Group className="mb-3" controlId="time">
                <Form.Label>Time</Form.Label>
                <Form.Control type="time" name='entry_time' defaultValue = {formFields.time} onChange={(event) => updateFormField(event, 'time')} required/>
                <Form.Text className="text-muted">
                </Form.Text>
              </Form.Group>
            </Col>
            <Col>
              <Form.Group className="mb-3" controlId="timezone">
                <Form.Label>Time Zone</Form.Label>
                <Form.Select aria-label="Default select example" defaultValue = {formFields.timezone} onChange={(event) => updateFormField(event, 'timezone')} >
                  <option>PST</option>
                  <option>EST</option>
                  <option>MST</option>
                  <option>CST</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Form.Group className="mb-3" controlId="reason">
              <Form.Label>Reason</Form.Label>
              <Form.Control type="text" placeholder="What might have caused this?" defaultValue = {formFields.reason} onChange={(event) => updateFormField(event, 'reason')} required/>
            </Form.Group>
          </Row>
          <Row>
            <Form.Group className="mb-3" controlId="severity">
              <Form.Label>Severity</Form.Label>
              <Form.Range defaultValue = {formFields.severity} onChange={(event) => updateFormField(event, 'severity')} required/>
            </Form.Group>
          </Row>
          <Row>
            <Form.Group className="mb-3" controlId="notes">
              <Form.Label>Notes</Form.Label>
              <Form.Control type="text" defaultValue = {formFields.other} as="textarea" style={{ height: '75px' }} onChange={(event) => updateFormField(event, 'other')} placeholder="Add any notes e.g (length, location, days since period, etc.)"/>
            </Form.Group>
          </Row>
          <Row>
            {props.photo_url ? 
              (
                <>
                  <Form.Group controlId="photoFile" className="mb-3">
                    <Form.Label>Replace Photo</Form.Label>
                    <Form.Control type="file" accept=".png,.jpg,.jpeg"  onChange={(event) => updateFormField(event, 'photo')}/>
                  </Form.Group>
                  <Form.Group className="mb-3" controlId="deletePhoto">
                    <Form.Check type="checkbox" checked = {formFields.deletePhoto} label="Delete Existing Photo" onChange={(event) => updateFormField(event, 'deletePhoto')} />
                  </Form.Group>
                </>
              ) 
              : 
              (
                <Form.Group controlId="photoFile" className="mb-3">
                  <Form.Label>Upload Photo</Form.Label>
                  <Form.Control type="file" accept=".png,.jpg,.jpeg"  onChange={(event) => updateFormField(event, 'photo')}/>
                </Form.Group>
              )
            }
          </Row>
          <Form.Group className="mb-3" controlId="share">
            <Form.Check type="checkbox" checked = {formFields.share} label="Share with friends" onChange={(event) => updateFormField(event, 'share')} />
          </Form.Group>
          <div className="d-flex justify-content-end">
          <Button variant="primary" type="submit">
            Submit
          </Button>
          </div>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Row>
          <div class="d-flex justify-content-between">
          <img src={require('../cry_plant_by_leena.gif')} class="w-25 px-3" alt="tears watering plant!" />
            <p>
            Hi! The NoCryShy Team hopes you're doing better after your cry. Sometimes, you just have to let it all out.
            <br></br>
            <br></br>
            If you want a suggestion on what to do next, you can {postCrySuggestion}!
            <br></br>
            <br></br>
            If you feel like you need help or are feeling really overwhelmed, make sure to check out our <a href="resources">resources page</a> for information!
            </p>
          </div>
        </Row>
        <Row>
          <Button onClick={props.onHide}>Close</Button>
        </Row>
      </Modal.Footer>
    </Modal>
  );
}
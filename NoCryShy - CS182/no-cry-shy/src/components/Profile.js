import { React, useState, useEffect } from 'react';
import './Profile.css';
import { addUserDetails, getUserDetails } from '../firebase/firebase';
import {Container, Row, Col, Form, Button, InputGroup, ListGroup, Modal} from 'react-bootstrap';
import TextModal from './TextModal.js'
import AddFriend from './AddFriend.js'
import {onAuthStateChanged} from 'firebase/auth'
import {auth} from '../firebase/firebase';
import { Circles } from  'react-loader-spinner';
import { getEntries, getPhotoDownloadURL, uploadPhotoToStorage, acceptFriendRequest, deleteFriendRequest, deleteFriend, deleteSentFriendRequest } from '../firebase/firebase';

export default function Profile() {
	const [user, setUser] = useState({});
	const [firestoreUserData, setFirestoreUserData] = useState({});
	const [loading, setLoading] = useState(true);

	const [entries, setEntries] = useState([]);

	const [url, setURL] = useState(null);
   	const [image, setImage] = useState(null);
	const [userEmail, setUserEmail] = useState({});

	const [addFriend, setAddFriend] = useState(false);

	// Only retrieve details on first render
	useEffect(() => {
      onAuthStateChanged(auth, (currentUser) => {
          setUser(currentUser);
		  setUserEmail(currentUser?.email);
		  fetchImage(currentUser);
      });
	  // Gets download url for profile picture
	  const fetchImage = async (currentUser) => {
		const filename = `/${currentUser.email}/profile`;
		getPhotoDownloadURL(filename).then((foundUrl) => {
			setURL(foundUrl)
		}).catch((error) => {
			setURL(null);
		});
	  }
  	}, []);


	useEffect(() => {
		getEntries(user?.email).then((querySnapshot) => {
			querySnapshot.forEach((entry) => {
			var data = entry.data();
			setEntries(arr => [...arr , data]);
		})});
      	getUserDetails(user?.email).then((response) => {
			setFirestoreUserData(response.data());
			setLoading(false);
		});
    }, [user]);

	const entriesSize = entries.length.toString();
	const severityArray = entries.map(a => a.severity);
	let mean_val = 0;
	let actual_size = 0;
	for (let i = 0; i < severityArray.length; i++) {
		if (severityArray[i] != null){
			actual_size += 1;
			mean_val += Number(severityArray[i]);
		}
	}
	const mean_severity = mean_val / actual_size;

	const handleSubmit = async (event) => {
		event.preventDefault();
		if (image) {handleProfilePicUpload();}
	    addUserDetails(firestoreUserData.firstName, firestoreUserData.lastName, user?.email).then(() => {
			window.location.reload();
		});
	};

	function handleProfilePicChange(e) {
		if (e.target.files[0])
			setImage(e.target.files[0]);
	}
	 
	const handleProfilePicUpload = async (e) => {
		const filename = `/${userEmail}/profile`;
		await uploadPhotoToStorage(filename, image);
		const url = await getPhotoDownloadURL(filename);
		setURL(url);
		setImage(null);
	}

	if (user && loading) {
		return (
			<Row>
				<Col xs="auto" className="my-1 mx-auto">
					<Circles
					    height = "100"
					    width = "100"
					    radius = "15"
					    color = 'Green'
					    ariaLabel = 'three-dots-loading'     
					 />
				</Col>
			</Row>
		)
	}
	return (
	    <Container>
		    {user ? (
			    <Form onSubmit={handleSubmit}>
					<Row>							
						<div className="d-flex justify-content-center mb-3">
							<img src={url ? url : user.photoURL} referrerPolicy="no-referrer" alt="Profile Photo" className="profilepic" />
						</div>
					</Row>
					<Row>
					<p className="text-center">Clicking on the first and last name tabs will allow you to change those fields. Feel free to upload a new profile picture as well!</p>
					</Row>
			      	<Row>
			      		<Col>
					      	<InputGroup className="mb-3">
						        <InputGroup.Text id="inputGroup-sizing-default">
						          Email
						        </InputGroup.Text>
						        <Form.Control
						          aria-label="Default"
						          aria-describedby="inputGroup-sizing-default" 
						          placeholder={user?.email}
						          disabled
						        />
						     </InputGroup>
			      		</Col>
			      	</Row>
			      	<Row>
				        <Col>
				        	<InputGroup className="mb-3">
						        <InputGroup.Text id="inputGroup-sizing-default">
						          First Name
						        </InputGroup.Text>
						        <Form.Control
						          aria-label="Default"
						          aria-describedby="inputGroup-sizing-default"
						          value={firestoreUserData.firstName}
						          onChange={(event) =>
						          	setFirestoreUserData(prevState => ({...prevState, ["firstName"]: event.target.value}))
							      }
							      required
						        />
						     </InputGroup>
				        </Col>
				        <Col>
				        	<InputGroup className="mb-3">
						        <InputGroup.Text id="inputGroup-sizing-default">
						          Last Name
						        </InputGroup.Text>
						        <Form.Control
						          aria-label="Default"
						          aria-describedby="inputGroup-sizing-default"
						          value={firestoreUserData.lastName}
						          onChange={(event) =>
							       setFirestoreUserData(prevState => ({...prevState, ["lastName"]: event.target.value}))
							      }
							      required
						        />
						     </InputGroup>
				        </Col>
				    </Row>
					<Row>
						<div className="input-group mb-3">
							<label className="input-group-text" for="inputGroupFile">Upload a New Profile Photo</label>
							<input type="file" className="form-control" id="inputGroupFile" onChange={handleProfilePicChange}/>
						</div>
					</Row>
				    <Row>
				    	<Col xs="auto" className="my-1 mx-auto">
				        	<Button type="submit">Update Profile</Button>
				        </Col> 
				        <Col xs="auto" className="my-1 mx-auto">
								<TextModal 
								promptButtonText = "Show Cry Statistics"
								displayText={{"Cry Statistics" :  {
									data: entries.length ?["You've cried " + entriesSize + " times since being a NoCryShy user.",
								"The average severity of your cry sessions is " + mean_severity + ".",
								"One of the reasons you've cried is because " + entries[0].reason + "."] : ["No entries recorded."]
								}}}/>
						</Col>
						<Col xs="auto" className="my-1 mx-auto">
							<TextModal 
								promptButtonText = "My Friends"
								displayText={
									{"My Friends" : 
										firestoreUserData.friends?.length > 0 ? {
											data: firestoreUserData.friends,
											onDeleteHandler: (friendEmail) => {deleteFriend(userEmail, friendEmail);}
										} : {
											data: ["No friends added."]
										},
									"Friend Requests Received" : 
										firestoreUserData.pendingRequests?.length > 0 ? {
											data: firestoreUserData.pendingRequests,
											onTickHandler: (friendEmail) => {acceptFriendRequest(userEmail, friendEmail);},
											onDeleteHandler: (friendEmail) => {deleteFriendRequest(userEmail, friendEmail);}
										} : {
											data: ["No pending requests."]
										},
									"Friend Requests Sent" : 
										firestoreUserData.sentFriendRequests?.length > 0 ? {
											data: firestoreUserData.sentFriendRequests,
											onDeleteHandler: (friendEmail) => {deleteSentFriendRequest(userEmail, friendEmail);}
										} : {
											data: ["No sent requests."]
										}
									}
								}/>
						</Col>
						<Col xs="auto" className="my-1 mx-auto">
							<Button variant="primary" onClick={() => setAddFriend(true)}>
						      Add Friends
						    </Button>
						</Col>
				    </Row>
			    </Form>
			) : (
				<Row>
		        <Col>
		        	<h1>Please Login to View Profile</h1>
		       	</Col>
		    </Row>
			)}

			<AddFriend
				show={addFriend}
				email={user?.email}
				onHide={() => setAddFriend(false)}
			/>
		</Container>
	);
}

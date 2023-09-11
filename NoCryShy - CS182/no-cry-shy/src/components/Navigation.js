import './Navigation.css';
import React from 'react';
import {Container, Button, Nav, Navbar} from 'react-bootstrap';
import { signInWithGoogle, signOutWithGoogle, getUserDetails } from '../firebase/firebase'; 
import { useState, useEffect } from 'react';
import {onAuthStateChanged} from 'firebase/auth'
import {auth} from '../firebase/firebase';
import NewEntryModal from './NewEntry';

const Navigation = () => {
	const [user, setUser] = useState({});
	const [addEntry, setAddEntry] = useState(false);

	// Only retrieve details on first render
	useEffect(() => {
      onAuthStateChanged(auth, (currentUser) => {
          setUser(currentUser);
      });
  	}, []);

	const [firstName, setFirstName] = useState("");
	// Only retrieve details on first render
	useEffect(() => {
      	getUserDetails(user?.email).then((response) => {
			setFirstName(response?.data().firstName);
		});
    }, [user]);

    return (
    	<>
	    	<Navbar bg="light" variant="light" className = "Navigation">
		        <Container>
		        	<Container>
			          <Navbar.Brand href="/">
			          	<img
			              alt=""
			              src="/logo.png"
			              height="30"
			              className="d-inline-block align-top"
			            /> 
			          </Navbar.Brand>
			       	</Container>

			       	{ user ? (
				       	<Container className = "center">
				       		<Navbar.Text className = "header">
						        Welcome, {firstName}!
						    </Navbar.Text>
						</Container>)
					 : null }

						{ user ? (
							<Nav className="me-auto">
								<Nav.Link className = "navBarItem" href="/">Profile</Nav.Link>
								<Nav.Link className = "navBarItem" href="/track">Track</Nav.Link>
								<Nav.Link className = "navBarItem" href="/calendar">Calendar</Nav.Link>
								<Nav.Link className = "navBarItem" href="/resources">Resources</Nav.Link>
								<Button className = "navBarItem text-nowrap" variant="outline-success" onClick={() => setAddEntry(true)}>New Entry</Button>
								<Button className = "navBarItem" variant="outline-danger" onClick={signOutWithGoogle}>Logout</Button>
							</Nav>
			            ) : (
			            	<Nav className="me-auto">
								<Button className = "navBarItem" variant="outline-success" onClick={signInWithGoogle}>Login</Button>
							</Nav>
			            )}
		        </Container>
	      	</Navbar>

	      	<NewEntryModal
		        show={addEntry}
		        email={user?.email}
		        onHide={() => setAddEntry(false)}
		      />
	    </>
    );
}
 
export default Navigation;